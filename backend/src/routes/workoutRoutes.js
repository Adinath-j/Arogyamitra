import { Router } from 'express';
import { createWorkoutPlan, generateWorkout, getActiveWorkout, logExercise } from '../controllers/workoutController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/generate', requireAuth, generateWorkout);
router.get('/active', requireAuth, getActiveWorkout);
router.post('/log-exercise', requireAuth, logExercise);
router.post('/', optionalAuth, createWorkoutPlan);

export default router;
