import { prisma } from '../config/database.js';
import { callGroqJson } from './ai/groqService.js';
import { logger } from '../utils/logger.js';

export async function analyzeHealth(user, data) {
  const answers = data.answers || {};
  const assessmentId = data.assessment_id;

  const prompt = `You are ArogyaMitra, an expert AI Health & Wellness Clinician.
Analyze the following health assessment for the user:
Name: ${user.full_name || user.name || 'User'}, Age: ${user.age || 'N/A'}, Gender: ${user.gender || 'N/A'}, Goal: ${user.fitness_goal || user.goal || 'General Health'}
User Responses:
${JSON.stringify(answers, null, 2)}

Provide a structured JSON output with the exact following keys:
- "bmi_category": string (e.g. "Normal", "Overweight")
- "health_score": float (0 to 100)
- "ai_analysis": string (short paragraph summarizing health risks and positives)
- "recommendations": array of strings (top 3 actionable tips)

JSON only! Do not include markdown blocks.`;

  const result = await callGroqJson({
    systemPrompt: 'You produce only valid JSON.',
    userPrompt: prompt,
  });

  if (result.error) {
    return result;
  }

  // Update DB if assessment_id provided
  if (assessmentId) {
    try {
      await prisma.healthAssessment.update({
        where: { id: parseInt(assessmentId, 10) },
        data: {
          bmi_category: result.bmi_category || null,
          health_score: result.health_score ? parseFloat(result.health_score) : null,
          ai_analysis: result.ai_analysis || null,
          recommendations: JSON.stringify(result.recommendations || []),
          created_at: new Date(),
        },
      });
    } catch (e) {
      logger.warn(`Failed to update HealthAssessment ${assessmentId}: ${e.message}`);
    }
  }

  return result;
}
