import { Router } from 'express';
import { getPlans, getLatestPlans } from '../controllers/planController.js';

const router = Router();

router.get('/:user_id/latest', getLatestPlans);
router.get('/:user_id', getPlans);

export default router;
