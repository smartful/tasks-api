import express from 'express';
import { protect } from '../middlewares/auth.js';
import {
  createCheckoutSession,
  createPortalSession,
  createSubscribtion,
  subscribtionWebhook,
  deleteSubscribtion,
} from '../controllers/subscribtions.js';

const router = express.Router();

router.post('/', protect, createSubscribtion);
router.post('/create-checkout-session', createCheckoutSession);
router.post('/create-portal-session', protect, createPortalSession);
router.post('/webhook', subscribtionWebhook);
router.delete('/:id', protect, deleteSubscribtion);

export default router;
