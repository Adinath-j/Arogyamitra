import { Router } from 'express';
import { submitAssessment, analyze, getLatest } from '../controllers/healthController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { HealthAssessmentSubmitSchema, HealthAnalysisRequestSchema } from '../validators/schemas.js';

const router = Router();

router.post('/assessment/submit', requireAuth, validate(HealthAssessmentSubmitSchema), submitAssessment);
router.post('/analyze', requireAuth, validate(HealthAnalysisRequestSchema), analyze);
router.get('/latest', requireAuth, getLatest);

export default router;
