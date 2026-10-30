import { Router } from 'express';
import { logProgress, getHistory, getStats } from '../controllers/progressController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { ProgressLogCreateSchema } from '../validators/schemas.js';

const router = Router();

router.post('/log', requireAuth, validate(ProgressLogCreateSchema), logProgress);
router.get('/history', requireAuth, getHistory);
router.get('/stats', requireAuth, getStats);

export default router;
