import { prisma } from '../config/database.js';
import { ContextResolver } from './ai/contextResolver.js';
import { PromptBuilder } from './ai/promptBuilder.js';
import { callGroqJson } from './ai/groqService.js';
import { generateSpoonacularMealPlan } from './nutrition/spoonacularService.js';
import { logger } from '../utils/logger.js';

export async function generateMealPlan(user, userMessage = '') {
  if (!user) {
    throw new Error('User not found');
  }

  const { effectiveContext } = ContextResolver.resolve(user, userMessage);

  let baseCalories = 2000;
  const goal = (effectiveContext.goal || '').toLowerCase();
  if (goal.includes('loss')) {
    baseCalories = 1600;
  } else if (goal.includes('gain')) {
    baseCalories = 2600;
  }

  let planData = await generateSpoonacularMealPlan(
    baseCalories,
    effectiveContext.diet_preference,
    effectiveContext.allergies
  );

  // Fallback to AI if Spoonacular integration fails or returns error
  if (!planData || planData.error || !planData.plan || planData.plan.length === 0) {
    logger.info('Spoonacular unavailable or returned error, falling back to Groq AI plan...');
    const prompt = PromptBuilder.buildMealPrompt(effectiveContext);
    const system = 'You are an Indian nutritionist. Always respond with valid JSON only.';
    planData = await callGroqJson({ systemPrompt: system, userPrompt: prompt });
  }

  // Save to DB
  const plan = await prisma.plan.create({
    data: {
      user_id: user.id,
      plan_type: 'meal',
      content: JSON.stringify(planData),
    },
  });

  return { plan_id: plan.id, ...planData };
}

export async function getActiveMealPlan(userId) {
  const plan = await prisma.plan.findFirst({
    where: {
      user_id: userId,
      plan_type: 'meal',
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  if (!plan) return null;

  try {
    return { plan_id: plan.id, ...JSON.parse(plan.content) };
  } catch (e) {
    logger.error(`Error parsing meal plan content for user ${userId}: ${e.message}`);
    return null;
  }
}
