import express from 'express';
import { protect } from '../middlewares/auth.js';
import { getProfile, login, register, updateUser } from '../controllers/users.js';

const router = express.Router();

router.post('/signup', register);
router.post('/signin', login);
router.route('/profile').get(protect, getProfile).put(protect, updateUser);

export default router;
