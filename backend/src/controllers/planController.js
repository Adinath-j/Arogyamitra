import { prisma } from '../config/database.js';

export async function getPlans(req, res, next) {
  try {
    const userId = parseInt(req.params.user_id || req.params.userId, 10);
    const plans = await prisma.plan.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });

    if (!plans || plans.length === 0) {
      return res.json({ plans: [] });
    }

    const result = plans.map((plan) => {
      let parsedContent;
      try {
        parsedContent = JSON.parse(plan.content);
      } catch {
        parsedContent = plan.content;
      }
      return {
        id: plan.id,
        plan_type: plan.plan_type,
        created_at: plan.created_at.toISOString(),
        content: parsedContent,
      };
    });

    return res.json({ plans: result });
  } catch (err) {
    next(err);
  }
}

export async function getLatestPlans(req, res, next) {
  try {
    const userId = parseInt(req.params.user_id || req.params.userId, 10);

    const workout = await prisma.plan.findFirst({
      where: { user_id: userId, plan_type: 'workout' },
      orderBy: { created_at: 'desc' },
    });

    const meal = await prisma.plan.findFirst({
      where: { user_id: userId, plan_type: 'meal' },
      orderBy: { created_at: 'desc' },
    });

    let workoutData = null;
    if (workout) {
      try {
        workoutData = { plan_id: workout.id, ...JSON.parse(workout.content) };
      } catch {
        workoutData = { plan_id: workout.id, content: workout.content };
      }
    }

    let mealData = null;
    if (meal) {
      try {
        mealData = { plan_id: meal.id, ...JSON.parse(meal.content) };
      } catch {
        mealData = { plan_id: meal.id, content: meal.content };
      }
    }

    return res.json({
      workout: workoutData,
      meal: mealData,
    });
  } catch (err) {
    next(err);
  }
}
