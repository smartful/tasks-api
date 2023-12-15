import express from 'express';
import { protect } from '../middlewares/auth.js';
import { getProfile, login, register } from '../controllers/users.js';

const router = express.Router();

router.post('/signup', register);
router.post('/signin', login);
router.get('/profile', protect, getProfile);

export default router;
