import { prisma } from '../config/database.js';
import { ContextResolver } from './ai/contextResolver.js';
import { PromptBuilder } from './ai/promptBuilder.js';
import { callGroqJson } from './ai/groqService.js';
import { getYoutubeLink } from './youtube/youtubeService.js';
import { logger } from '../utils/logger.js';

export async function generateWorkoutPlan(userId, userMessage = '') {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  const { effectiveContext } = ContextResolver.resolve(user, userMessage);
  const prompt = PromptBuilder.buildWorkoutPrompt(effectiveContext);
  const system = 'You are a professional fitness coach. Always respond with valid JSON only.';

  const planData = await callGroqJson({ systemPrompt: system, userPrompt: prompt });

  // Attach YouTube links dynamically
  if (planData && Array.isArray(planData.plan)) {
    for (const day of planData.plan) {
      if (Array.isArray(day.exercises)) {
        for (const ex of day.exercises) {
          if (ex.youtube_search) {
            const searchTerm = ex.youtube_search;
            delete ex.youtube_search;
            ex.youtube_video_link = await getYoutubeLink(searchTerm);
          }
        }
      }
    }
  }

  // Save to DB
  const plan = await prisma.plan.create({
    data: {
      user_id: userId,
      plan_type: 'workout',
      content: JSON.stringify(planData),
    },
  });

  return { plan_id: plan.id, ...planData };
}

export async function getActiveWorkoutPlan(userId) {
  const plan = await prisma.plan.findFirst({
    where: {
      user_id: userId,
      plan_type: 'workout',
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  if (!plan) return null;

  try {
    return { plan_id: plan.id, ...JSON.parse(plan.content) };
  } catch (e) {
    logger.error(`Error parsing workout plan content for user ${userId}: ${e.message}`);
    return null;
  }
}
