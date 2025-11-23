import express from 'express';
import {
  moderateContent,
  classifyEmotion,
  generateChatResponse,
  getCrisisMessage,
} from '../services/openai.service.js';
import {
  getOrCreateSession,
  saveMessage,
  getConversationHistory,
} from '../services/chat.service.js';

const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message is required and must be a non-empty string',
      });
    }

    const { session, isNew } = await getOrCreateSession(sessionId);

    const moderation = await moderateContent(message);

    const emotion = await classifyEmotion(message);

    await saveMessage(session.id, 'user', message, emotion, moderation.flagged);

    let botResponse;
    if (moderation.flagged || emotion === 'Crisis') {
      botResponse = getCrisisMessage();
    } else {
      const history = await getConversationHistory(session.id, 10);
      botResponse = await generateChatResponse(history);
    }

    await saveMessage(session.id, 'assistant', botResponse, null, false);

    return res.json({
      sessionId: session.session_id,
      response: botResponse,
      emotion: emotion,
      flagged: moderation.flagged,
    });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

export default router;
