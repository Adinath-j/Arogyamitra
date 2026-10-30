import { prisma } from '../config/database.js';
import { generateMealPlan, getActiveMealPlan } from '../services/mealService.js';

export async function generateById(req, res, next) {
  try {
    const rawId = req.query.user_id || req.body?.user_id;
    if (!rawId) {
      return res.status(400).json({ detail: 'user_id is required' });
    }

    const userId = parseInt(rawId, 10);
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }

    const result = await generateMealPlan(user);
    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ detail: `Meal plan generation failed: ${err.message}` });
  }
}

export async function generate(req, res, next) {
  try {
    const user = req.user;
    const result = await generateMealPlan(user);
    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ detail: `Meal plan generation failed: ${err.message}` });
  }
}

export async function getActive(req, res, next) {
  try {
    const userId = req.user.id;
    const plan = await getActiveMealPlan(userId);
    return res.json({ plan: plan || null });
  } catch (err) {
    next(err);
  }
}

export async function logMeal(req, res, next) {
  try {
    const userId = req.user.id;
    const { meal_type, description, calories } = req.body;

    await prisma.mealLog.create({
      data: {
        user_id: userId,
        meal_type,
        description: description || null,
        calories: calories ? parseFloat(calories) : null,
      },
    });

    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
