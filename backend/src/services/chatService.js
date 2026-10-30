import { prisma } from '../config/database.js';
import { callGroqJson } from './ai/groqService.js';
import { PromptBuilder } from './ai/promptBuilder.js';
import { ContextResolver } from './ai/contextResolver.js';
import { RequestRouter } from './ai/router.js';
import { generateWorkoutPlan } from './workoutService.js';
import { generateMealPlan } from './mealService.js';
import { logger } from '../utils/logger.js';

export async function chatWithAromi(request) {
  const userId = parseInt(request.user_id, 10);
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new Error(`User ${request.user_id} not found`);
  }

  // --- Context Resolution Architecture ---
  const { effectiveContext, profileUpdates } = ContextResolver.resolve(user, request.message);

  const system = PromptBuilder.buildChatSystemPrompt(
    effectiveContext,
    request.user_status,
    request.current_workout_plan,
    request.current_meal_plan
  );

  // Fetch recent chat history
  const recentHistory = await prisma.chatHistory.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: 'asc' },
    take: 10,
  });

  // Build messages array for Groq
  const groqMessages = [{ role: 'system', content: system }];
  for (const msg of recentHistory) {
    groqMessages.push({ role: msg.role, content: msg.content });
  }
  groqMessages.push({ role: 'user', content: request.message });

  // Save user message
  await prisma.chatHistory.create({
    data: {
      user_id: user.id,
      role: 'user',
      content: request.message,
    },
  });

  // --- Agentic Request Routing ---
  const routeInfo = await RequestRouter.classifyIntent(request.message);
  const intent = routeInfo.intent || 'general_conversation';
  logger.info(`AROMI Router classified intent: ${intent} with ${routeInfo.confidence || 0} confidence.`);

  let aiResponse = {};
  let replyText = '';

  if (intent === 'workout_generation') {
    logger.info('AROMI Router triggering: generateWorkoutPlan');
    try {
      await generateWorkoutPlan(user.id, request.message);
      replyText = "I've just generated a brand new workout plan tailored to your profile! 💪 You can check it out in your Dashboard.";
    } catch (e) {
      replyText = `I tried to generate a workout plan for you, but something went wrong: ${e.message}`;
    }
  } else if (intent === 'meal_plan_generation') {
    logger.info('AROMI Router triggering: generateMealPlan');
    try {
      await generateMealPlan(user, request.message);
      replyText = "I've crafted a personalized Indian meal plan for you! 🍱 It's ready to view in your Dashboard.";
    } catch (e) {
      replyText = `I tried to create your meal plan, but hit a snag: ${e.message}`;
    }
  } else {
    // Fallback to general conversational AI
    aiResponse = await callGroqJson({ messages: groqMessages });
  }

  // Extract reply, fallback if failed
  if (!replyText) {
    replyText =
      aiResponse && aiResponse.reply
        ? aiResponse.reply
        : "I'm here for you! How can I help today?";

    if (aiResponse && aiResponse.error) {
      replyText = "I'm having trouble understanding right now, but I'm here to help you stay fit!";
    }
  }

  // Realtime adaptive support: parse plan modifications
  if (aiResponse && typeof aiResponse === 'object') {
    const modWorkout = aiResponse.modified_workout_plan;
    const modMeal = aiResponse.modified_meal_plan;

    if (modWorkout) {
      try {
        await prisma.plan.create({
          data: {
            user_id: user.id,
            plan_type: 'workout',
            content: JSON.stringify(modWorkout),
          },
        });
        logger.info(`AROMI successfully modified workout plan for user ${user.id}`);
      } catch (e) {
        logger.error(`Failed to save modified workout plan: ${e.message}`);
      }
    }

    if (modMeal) {
      try {
        await prisma.plan.create({
          data: {
            user_id: user.id,
            plan_type: 'meal',
            content: JSON.stringify(modMeal),
          },
        });
        logger.info(`AROMI successfully modified meal plan for user ${user.id}`);
      } catch (e) {
        logger.error(`Failed to save modified meal plan: ${e.message}`);
      }
    }
  }

  // Save assistant message
  await prisma.chatHistory.create({
    data: {
      user_id: user.id,
      role: 'assistant',
      content: replyText,
    },
  });

  const responseObj = {
    reply: replyText,
    modified_workout_plan: aiResponse?.modified_workout_plan || null,
    modified_meal_plan: aiResponse?.modified_meal_plan || null,
    profile_updates: Object.keys(profileUpdates).length > 0 ? profileUpdates : null,
  };

  return responseObj;
}
