import express from 'express';
import { protect } from '../middlewares/auth.js';
import {
  createCheckoutSession,
  createPortalSession,
  createSubscribtion,
  deleteSubscribtion,
} from '../controllers/subscribtions.js';

const router = express.Router();

router.post('/', protect, createSubscribtion);
router.post('/create-checkout-session', createCheckoutSession);
router.post('/create-portal-session', protect, createPortalSession);
router.delete('/:id', protect, deleteSubscribtion);

export default router;
