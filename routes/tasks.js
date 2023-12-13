import express from 'express';
import { protect } from '../middlewares/auth.js';
import { getTasks } from '../controllers/tasks.js';

const router = express.Router();

router.get('/', protect, getTasks);

export default router;
