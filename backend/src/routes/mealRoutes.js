import { Router } from 'express';
import { generateById, generate, getActive, logMeal } from '../controllers/mealController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { MealLogCreateSchema } from '../validators/schemas.js';

const router = Router();

router.post('/generate-by-id', generateById);
router.post('/generate', requireAuth, generate);
router.get('/active', requireAuth, getActive);
router.post('/log-meal', requireAuth, validate(MealLogCreateSchema), logMeal);

export default router;
