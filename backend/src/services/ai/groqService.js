import Groq from 'groq-sdk';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

let groqClient = null;

function getClient() {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: env.GROQ_API_KEY });
  }
  return groqClient;
}

const FALLBACK_MODELS = [
  process.env.GROQ_MODEL,
  'openai/gpt-oss-120b',
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-20b',
  'llama-3.3-70b-versatile',
  'llama3-8b-8192',
].filter(Boolean);

export async function callGroq(messages, temperature = 0.7, maxTokens = 4096) {
  const client = getClient();
  let lastError = null;

  for (const model of FALLBACK_MODELS) {
    try {
      const response = await client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      });
      return response.choices[0]?.message?.content || '';
    } catch (e) {
      lastError = e;
      if (e.status === 404 || e.status === 400) {
        logger.warn(`Model ${model} unavailable (${e.message}), trying next fallback...`);
        continue;
      }
      throw e;
    }
  }

  throw lastError;
}

export async function callGroqJson({ systemPrompt = null, userPrompt = null, messages = null }) {
  let msgs = messages;
  if (!msgs) {
    msgs = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];
  }

  const raw = await callGroq(msgs, 0.5, 4096);

  // Extract JSON between first { and last }
  const cleaned = raw.trim();
  const startIdx = cleaned.indexOf('{');
  const endIdx = cleaned.lastIndexOf('}');

  let jsonStr = cleaned;
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    jsonStr = cleaned.substring(startIdx, endIdx + 1);
  }

  try {
    const parsed = JSON.parse(jsonStr);
    logger.info('AI Response successfully parsed as JSON.');
    return parsed;
  } catch (e) {
    logger.error(`AI JSON Parse Error: ${e.message}`);
    return { error: 'Failed to parse AI response into JSON.', raw_response: cleaned };
  }
}