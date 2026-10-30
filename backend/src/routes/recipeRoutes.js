import { Router } from 'express';
import { search, details } from '../controllers/recipeController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { RecipeSearchRequestSchema } from '../validators/schemas.js';

const router = Router();

router.post('/search', requireAuth, validate(RecipeSearchRequestSchema), search);
router.get('/:recipe_id', requireAuth, details);

export default router;
