import { prisma } from '../config/database.js';
import { getGoogleAuthUrl, exchangeCodeForTokens, syncWorkoutToCalendar } from '../services/calendar/calendarService.js';
import { logger } from '../utils/logger.js';

export async function getAuthUrl(req, res, next) {
  try {
    const user = req.user;
    const url = getGoogleAuthUrl(user.id);
    return res.json({ auth_url: url });
  } catch (err) {
    return res.status(500).json({ detail: `Could not generate auth URL: ${err.message}` });
  }
}

export async function oauthCallback(req, res, next) {
  try {
    const { state, code } = req.query;
    if (!state || !code) {
      return res.status(400).json({ detail: 'Missing state or code query parameter' });
    }

    const userId = parseInt(state, 10);
    const tokens = await exchangeCodeForTokens(code);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          google_access_token: tokens.access_token || user.google_access_token,
          google_refresh_token: tokens.refresh_token || user.google_refresh_token,
        },
      });
      logger.info(`Google Calendar tokens saved for user ${userId}`);
    }

    // Seamlessly return user to the App
    return res.redirect('http://localhost:5173/dashboard?calendar=connected');
  } catch (err) {
    logger.error(`OAuth callback failed: ${err.message}`);
    return res.status(500).json({ detail: `OAuth callback failed: ${err.message}` });
  }
}

export async function sync(req, res, next) {
  try {
    const user = req.user;
    const { workout_plan_id, start_date } = req.body;

    if (!user.google_access_token) {
      return res.status(400).json({ detail: 'Google Calendar not connected. Visit /api/calendar/auth-url first.' });
    }

    const plan = await prisma.plan.findFirst({
      where: {
        id: parseInt(workout_plan_id, 10),
        user_id: user.id,
        plan_type: 'workout',
      },
    });

    if (!plan) {
      return res.status(404).json({ detail: 'Workout plan not found' });
    }

    let planData;
    try {
      planData = JSON.parse(plan.content);
    } catch (e) {
      return res.status(500).json({ detail: 'Invalid plan JSON stored in database' });
    }

    const events = await syncWorkoutToCalendar(
      user.google_access_token,
      user.google_refresh_token,
      planData,
      start_date
    );

    return res.json({
      success: true,
      events_created: events.length,
      events,
    });
  } catch (err) {
    return res.status(500).json({ detail: `Calendar sync failed: ${err.message}` });
  }
}

export async function saveTokens(req, res, next) {
  try {
    const user = req.user;
    const tokens = req.body || {};

    await prisma.user.update({
      where: { id: user.id },
      data: {
        google_access_token: tokens.access_token || user.google_access_token,
        google_refresh_token: tokens.refresh_token || user.google_refresh_token,
      },
    });

    return res.json({
      success: true,
      message: 'Google Calendar tokens saved',
    });
  } catch (err) {
    next(err);
  }
}
