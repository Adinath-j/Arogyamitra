import { callGroqJson } from './groqService.js';
import { logger } from '../../utils/logger.js';

export class RequestRouter {
  static INTENT_SCHEMA = {
    intent: 'string (one of the predefined categories)',
    confidence: 'float (0.0 to 1.0)',
    extracted_entities: 'object (any specific data extracted from the prompt, like food names, dates, etc.)',
  };

  static CATEGORIES = [
    'general_conversation', // Casual chat, greetings, asking how the AI is
    'health_qa',            // Asking for general health/wellness advice
    'workout_generation',   // Requesting a new workout plan
    'meal_plan_generation', // Requesting a new meal plan
    'plan_retrieval',       // Asking to see their existing workout/meal plan
    'calendar_scheduling',  // Asking to add a workout or meal to their calendar
    'nutrition_lookup',     // Asking for calories/macros of a specific food
    'exercise_lookup',      // Asking how to perform a specific exercise
    'profile_update',       // Asking to update their weight, goal, etc.
  ];

  static async classifyIntent(userPrompt) {
    const systemPrompt = `You are an intelligent intent classification router for a health and wellness application.
Your ONLY job is to analyze the user's message and classify it into exactly ONE of the following categories:
${JSON.stringify(this.CATEGORIES, null, 2)}

You must return a raw JSON object matching this schema exactly:
${JSON.stringify(this.INTENT_SCHEMA, null, 2)}

Examples:
User: "Generate a new workout for me" -> intent: "workout_generation"
User: "How many calories in an apple?" -> intent: "nutrition_lookup", extracted_entities: {"food": "apple"}
User: "Schedule my workout for tomorrow at 5pm" -> intent: "calendar_scheduling", extracted_entities: {"time": "tomorrow 5pm", "event": "workout"}
User: "I weigh 80kg now" -> intent: "profile_update", extracted_entities: {"weight": "80kg"}
User: "What's my plan for today?" -> intent: "plan_retrieval"
User: "How do I do a deadlift?" -> intent: "exercise_lookup", extracted_entities: {"exercise": "deadlift"}
User: "I have a headache" -> intent: "health_qa"
User: "Hi AROMI" -> intent: "general_conversation"

IMPORTANT: You must ONLY output valid JSON. No markdown, no explanations, no preamble.`;

    try {
      const result = await callGroqJson({ systemPrompt, userPrompt });
      if (!result || !result.intent || !this.CATEGORIES.includes(result.intent)) {
        logger.warn(`Router returned invalid intent, defaulting to general_conversation: ${JSON.stringify(result)}`);
        return { intent: 'general_conversation', confidence: 0.0, extracted_entities: {} };
      }
      return result;
    } catch (e) {
      logger.error(`Routing failed: ${e.message}`);
      return { intent: 'general_conversation', confidence: 0.0, extracted_entities: {} };
    }
  }
}
