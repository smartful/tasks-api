import express from 'express';
import { protect } from '../middlewares/auth.js';
import { createSubscribtion, deleteSubscribtion } from '../controllers/subscribtions.js';

const router = express.Router();

router.post('/', protect, createSubscribtion);
router.delete('/:id', protect, deleteSubscribtion);

export default router;
