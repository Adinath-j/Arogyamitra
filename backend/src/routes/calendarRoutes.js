import { Router } from 'express';
import { getAuthUrl, oauthCallback, sync, saveTokens } from '../controllers/calendarController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { CalendarSyncRequestSchema } from '../validators/schemas.js';

const router = Router();

router.get('/auth-url', requireAuth, getAuthUrl);
router.get('/callback', oauthCallback);
router.post('/sync', requireAuth, validate(CalendarSyncRequestSchema), sync);
router.post('/save-tokens', requireAuth, saveTokens);

export default router;
