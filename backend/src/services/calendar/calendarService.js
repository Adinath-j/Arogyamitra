import { google } from 'googleapis';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export function getGoogleOAuth2Client() {
  return new google.auth.OAuth2(
    env.GOOGLE_CALENDAR_CLIENT_ID,
    env.GOOGLE_CALENDAR_CLIENT_SECRET,
    env.GOOGLE_CALENDAR_REDIRECT_URI
  );
}

export function getGoogleAuthUrl(userId) {
  try {
    const oauth2Client = getGoogleOAuth2Client();
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar.events'],
      prompt: 'consent',
      state: String(userId),
    });
  } catch (e) {
    logger.warn(`Could not generate auth url via googleapis, using fallback: ${e.message}`);
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${env.GOOGLE_CALENDAR_CLIENT_ID}&redirect_uri=${encodeURIComponent(env.GOOGLE_CALENDAR_REDIRECT_URI)}&response_type=code&scope=https://www.googleapis.com/auth/calendar.events&access_type=offline&prompt=consent&state=${userId}`;
  }
}

export async function exchangeCodeForTokens(code) {
  const oauth2Client = getGoogleOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export async function syncWorkoutToCalendar(accessToken, refreshToken, planData, startDate) {
  try {
    const oauth2Client = getGoogleOAuth2Client();
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const start = new Date(startDate);
    const eventsCreated = [];

    const days = planData.plan || planData.days || [];
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      const dayDate = new Date(start);
      dayDate.setDate(dayDate.getDate() + i);

      const nextDay = new Date(dayDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayDateStr = dayDate.toISOString().split('T')[0];
      const nextDayStr = nextDay.toISOString().split('T')[0];

      const exerciseList = day.exercises || [];
      const exerciseNames = exerciseList.map((e) => e.name || e).join(', ');

      const event = {
        summary: `🏋️ ${day.day || `Day ${i + 1}`} — ${day.focus || 'Workout'}`,
        description: `Focus: ${day.focus || ''}\nExercises: ${exerciseNames}`,
        start: { date: dayDateStr },
        end: { date: nextDayStr },
      };

      const res = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      eventsCreated.push({ id: res.data.id, summary: res.data.summary });
    }

    return eventsCreated;
  } catch (e) {
    logger.error(`Calendar sync error: ${e.message}`);
    throw new Error(`Calendar sync error: ${e.message}`);
  }
}
