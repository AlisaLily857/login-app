import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  sendVerificationCode,
  verifyEmail,
  getCurrentUser,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { loginLimiter, registerLimiter, verificationLimiter, checkAccountLock } from '../middleware/rateLimit';

const router = Router();

// 公开路由
router.post('/register', registerLimiter, register as any);
router.post('/login', loginLimiter, checkAccountLock, login as any);
router.post('/refresh-token', refreshToken);
router.post('/send-verification-code', verificationLimiter, sendVerificationCode as any);
router.post('/verify-email', verifyEmail as any);

// 需要认证的路由
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);

export default router;
