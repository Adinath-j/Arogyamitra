import { chatWithAromi } from '../services/chatService.js';
import { callGroq } from '../services/ai/groqService.js';
import { PromptBuilder } from '../services/ai/promptBuilder.js';
import { ContextResolver } from '../services/ai/contextResolver.js';
import { prisma } from '../config/database.js';

export async function chat(req, res, next) {
  try {
    const payload = req.body;
    const responseData = await chatWithAromi(payload);
    return res.json(responseData);
  } catch (err) {
    if (err.message && err.message.includes('not found')) {
      return res.status(404).json({ detail: err.message });
    }
    return res.status(500).json({ detail: `Chat failed: ${err.message}` });
  }
}

export async function standardChat(req, res, next) {
  try {
    const { messages = [], session_id, message } = req.body;
    const sessionId = session_id || `session-${Date.now()}`;

    // If user is authenticated, we can provide context-rich response
    const user = req.user || null;
    let effectiveContext = null;
    const lastUserMsg = message || (messages.length > 0 ? messages[messages.length - 1].content : '');

    if (user) {
      const resolved = ContextResolver.resolve(user, lastUserMsg);
      effectiveContext = resolved.effectiveContext;
    }

    const systemPrompt = PromptBuilder.buildChatSystemPrompt(effectiveContext);

    // Build chat conversation
    const groqMessages = [{ role: 'system', content: systemPrompt }];
    if (Array.isArray(messages) && messages.length > 0) {
      for (const m of messages.slice(-10)) {
        groqMessages.push({ role: m.role || 'user', content: m.content || '' });
      }
    } else if (lastUserMsg) {
      groqMessages.push({ role: 'user', content: lastUserMsg });
    }

    const rawReply = await callGroq(groqMessages, 0.7, 2048);

    let cleanReply = rawReply;
    try {
      const parsed = JSON.parse(rawReply.trim());
      if (parsed.reply) {
        cleanReply = parsed.reply;
      }
    } catch {
      // Not JSON or plain text
    }

    if (user && lastUserMsg) {
      try {
        await prisma.chatHistory.create({
          data: {
            user_id: user.id,
            role: 'user',
            content: lastUserMsg,
          },
        });
        await prisma.chatHistory.create({
          data: {
            user_id: user.id,
            role: 'assistant',
            content: cleanReply,
          },
        });
      } catch {
        // Chat history logging is non-blocking
      }
    }

    return res.json({
      reply: cleanReply,
      session_id: sessionId,
    });
  } catch (err) {
    return res.status(500).json({ detail: `Chat failed: ${err.message}` });
  }
}
