import { Router } from 'express';
import {
  getUserStats,
  getSystemStats,
} from '../controllers/statsController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// 用户个人统计
router.get('/user', authenticate, getUserStats as any);

// 系统统计（管理员）
router.get('/system', authenticate, requireRole('ADMIN', 'MODERATOR'), getSystemStats as any);

export default router;
