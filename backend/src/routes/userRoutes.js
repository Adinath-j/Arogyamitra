import { Router } from 'express';
import { createUser, getUser } from '../controllers/userController.js';
import { validate } from '../middleware/validate.js';
import { UserCreateSchema } from '../validators/schemas.js';

const router = Router();

router.post('/', validate(UserCreateSchema), createUser);
router.get('/:user_id', getUser);

export default router;
