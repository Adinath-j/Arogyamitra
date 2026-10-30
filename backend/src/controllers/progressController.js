import { prisma } from '../config/database.js';

export async function logProgress(req, res, next) {
  try {
    const user = req.user;
    const data = req.body;

    const log = await prisma.progressLog.create({
      data: {
        user_id: user.id,
        weight: data.weight ? parseFloat(data.weight) : null,
        calories_burned: data.calories_burned ? parseFloat(data.calories_burned) : 0.0,
        workout_duration: data.workout_duration ? parseInt(data.workout_duration, 10) : 0,
        steps: data.steps ? parseInt(data.steps, 10) : 0,
        water_intake: data.water_intake ? parseFloat(data.water_intake) : 0.0,
        sleep_hours: data.sleep_hours ? parseFloat(data.sleep_hours) : 0.0,
        mood: data.mood || 'Good',
        log_date: new Date(),
      },
    });

    const userUpdate = {};

    // Update weight if provided
    if (data.weight) {
      userUpdate.weight = parseFloat(data.weight);
    }

    // Streak logic
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const lastLog = await prisma.progressLog.findFirst({
      where: {
        user_id: user.id,
        id: { not: log.id },
        log_date: { gte: yesterday },
      },
      orderBy: { log_date: 'desc' },
    });

    let newCurrentStreak = (user.current_streak || 0) + 1;
    if (!lastLog) {
      newCurrentStreak = 1;
    }
    userUpdate.current_streak = newCurrentStreak;
    userUpdate.longest_streak = Math.max(user.longest_streak || 0, newCurrentStreak);

    // Charity points: 1 point per 5 workout minutes
    const workoutDuration = data.workout_duration ? parseInt(data.workout_duration, 10) : 0;
    if (workoutDuration > 0) {
      userUpdate.charity_points = (user.charity_points || 0) + Math.floor(workoutDuration / 5);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: userUpdate,
    });

    return res.json(log);
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req, res, next) {
  try {
    const user = req.user;
    const days = parseInt(req.query.days || '30', 10);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const logs = await prisma.progressLog.findMany({
      where: {
        user_id: user.id,
        log_date: { gte: since },
      },
      orderBy: { log_date: 'asc' },
    });

    return res.json({
      logs: logs.map((l) => ({
        id: l.id,
        date: l.log_date.toISOString(),
        weight: l.weight,
        calories_burned: l.calories_burned,
        workout_duration: l.workout_duration,
        steps: l.steps,
        water_intake: l.water_intake,
        sleep_hours: l.sleep_hours,
        mood: l.mood,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function getStats(req, res, next) {
  try {
    const user = req.user;
    const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const logs = await prisma.progressLog.findMany({
      where: {
        user_id: user.id,
        log_date: { gte: last30 },
      },
    });

    const totalCal = logs.reduce((acc, l) => acc + (l.calories_burned || 0), 0);
    const totalMin = logs.reduce((acc, l) => acc + (l.workout_duration || 0), 0);
    const avgSleep = logs.length > 0 ? logs.reduce((acc, l) => acc + (l.sleep_hours || 0), 0) / logs.length : 0;

    return res.json({
      current_streak: user.current_streak || 0,
      longest_streak: user.longest_streak || 0,
      total_workouts: user.total_workouts_completed || 0,
      total_calories_burned: Math.round((user.total_calories_burned || 0) * 10) / 10,
      charity_points: user.charity_points || 0,
      last_30_days: {
        calories_burned: Math.round(totalCal * 10) / 10,
        workout_minutes: totalMin,
        avg_sleep_hours: Math.round(avgSleep * 10) / 10,
        sessions: logs.length,
      },
    });
  } catch (err) {
    next(err);
  }
}
