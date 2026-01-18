import { Router } from 'express';
import { auth } from '../middlewares/auth.middleware.js';
import { me } from '../controllers/user.controller.js';

const router = Router();

router.get('/me', auth, me);

export default router;