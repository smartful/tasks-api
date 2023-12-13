import express from 'express';
import { protect } from '../middlewares/auth.js';
import { createTask, getTasks } from '../controllers/tasks.js';

const router = express.Router();

router.get('/', protect, getTasks);
router.post('/', protect, createTask);

export default router;
