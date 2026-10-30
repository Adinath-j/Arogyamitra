import { generateWorkoutPlan, getActiveWorkoutPlan } from '../services/workoutService.js';
import { prisma } from '../config/database.js';

export async function createWorkoutPlan(req, res, next) {
  try {
    const userId = req.body?.user_id || req.user?.id;
    if (!userId) {
      return res.status(400).json({ detail: 'user_id is required' });
    }

    const result = await generateWorkoutPlan(parseInt(userId, 10));
    return res.json({ success: true, data: result });
  } catch (err) {
    if (err.message.includes('not found')) {
      return res.status(404).json({ detail: err.message });
    }
    return res.status(500).json({ detail: `AI generation failed: ${err.message}` });
  }
}

export async function generateWorkout(req, res, next) {
  try {
    const userId = req.user.id;
    const result = await generateWorkoutPlan(userId);
    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ detail: `AI generation failed: ${err.message}` });
  }
}

export async function getActiveWorkout(req, res, next) {
  try {
    const userId = req.user.id;
    const plan = await getActiveWorkoutPlan(userId);
    return res.json({ plan: plan || null });
  } catch (err) {
    next(err);
  }
}

export async function logExercise(req, res, next) {
  try {
    const userId = req.user.id;
    const { duration = 0, calories = 0 } = req.body || {};

    await prisma.user.update({
      where: { id: userId },
      data: {
        total_workouts_completed: { increment: 1 },
        total_calories_burned: { increment: parseFloat(calories) || 0.0 },
      },
    });

    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
