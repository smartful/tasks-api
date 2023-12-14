import express from 'express';
import { protect } from '../middlewares/auth.js';
import { createTask, getTasks, updateTask } from '../controllers/tasks.js';

const router = express.Router();

router.get('/', protect, getTasks);
router.post('/', protect, createTask);
router.put('/:id', protect, updateTask);

export default router;
