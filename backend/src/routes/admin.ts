import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  getStats,
  getAuditLogs,
} from '../controllers/adminController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// 所有路由都需要管理员权限
router.use(authenticate);
router.use(requireRole('ADMIN', 'MODERATOR'));

// 用户管理
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/role', updateUserRole);

// 统计
router.get('/stats', getStats);

// 审计日志
router.get('/audit-logs', getAuditLogs);

export default router;
