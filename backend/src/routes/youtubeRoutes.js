import { Router } from 'express';
import { search } from '../controllers/youtubeController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { YouTubeSearchRequestSchema } from '../validators/schemas.js';

const router = Router();

router.post('/search', requireAuth, validate(YouTubeSearchRequestSchema), search);

export default router;
