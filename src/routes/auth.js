import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  register,
  login,
  profile,
  updateUser,
  logout,
} from '../controllers/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, profile);
router.put('/profile', authenticate, updateUser);
router.post('/logout', authenticate, logout);

export default router;
