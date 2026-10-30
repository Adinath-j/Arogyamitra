import { Router } from 'express';
import { register, login, me, updateMe } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { RegisterSchema } from '../validators/schemas.js';

const router = Router();

router.post('/register', validate(RegisterSchema), register);
router.post('/login', login);
router.get('/me', requireAuth, me);
router.put('/me', requireAuth, updateMe);

export default router;
