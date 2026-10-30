import { Router } from 'express';
import { chat, standardChat } from '../controllers/chatController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Adaptive chat handler that detects payload shape
router.post('/', optionalAuth, (req, res, next) => {
  if (req.body && (req.body.messages || req.body.session_id)) {
    return standardChat(req, res, next);
  }
  return chat(req, res, next);
});

export default router;
