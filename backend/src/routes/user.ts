import { Router } from 'express';
import {
  updateProfile,
  changePassword,
  getLoginHistory,
  getDevices,
  removeDevice,
  trustDevice,
  deleteAccount,
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

// 所有路由都需要认证
router.use(authenticate);

// 个人资料
router.get('/profile', getCurrentUser);
router.put('/profile', updateProfile as any);
router.put('/password', changePassword as any);

// 安全
router.get('/login-history', getLoginHistory);
router.get('/devices', getDevices);
router.delete('/devices/:deviceId', removeDevice);
router.post('/devices/:deviceId/trust', trustDevice);

// 账号
router.delete('/account', deleteAccount as any);

export default router;

// 需要导入
import { getCurrentUser } from '../controllers/authController';
