import express from 'express';
import { protect } from '../middlewares/auth.js';
import { createCheckoutSession, createSubscribtion, deleteSubscribtion } from '../controllers/subscribtions.js';

const router = express.Router();

router.post('/', protect, createSubscribtion);
router.post('/create-checkout-session', createCheckoutSession);
router.delete('/:id', protect, deleteSubscribtion);

export default router;
