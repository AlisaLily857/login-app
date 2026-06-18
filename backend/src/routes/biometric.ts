import { Router } from 'express';
import {
  generateRegistrationOptions,
  verifyRegistration,
  generateAuthenticationOptions,
  verifyAuthentication,
  removeBiometric,
  checkBiometricStatus,
} from '../controllers/biometricController';
import { authenticate } from '../middleware/auth';

const router = Router();

// 生物识别注册
router.post('/register/options', authenticate, generateRegistrationOptions as any);
router.post('/register/verify', authenticate, verifyRegistration as any);

// 生物识别认证
router.post('/auth/options', generateAuthenticationOptions as any);
router.post('/auth/verify', verifyAuthentication as any);

// 生物识别管理
router.get('/status', authenticate, checkBiometricStatus as any);
router.delete('/', authenticate, removeBiometric as any);

export default router;
