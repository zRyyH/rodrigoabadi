import { Router } from 'express';
import userRoutes from './files.routes.js';

const router = Router();

router.use('/files', userRoutes);

export default router;