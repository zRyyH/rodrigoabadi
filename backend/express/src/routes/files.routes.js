import { Router } from 'express';
import { auth } from '../middlewares/auth.middleware.js';
import { preprocess, upload } from '../controllers/preprocess.controller.js';

const router = Router();

router.post('/preprocess', auth, upload, preprocess);

export default router;