import { Router } from 'express';
import {
  getMessages,
  markAsRead,
  markAllAsRead,
  deleteMessage,
  getNotificationSettings,
  updateNotificationSettings,
} from '../controllers/messageController';
import { authenticate } from '../middleware/auth';

const router = Router();

// 消息
router.get('/messages', authenticate, getMessages as any);
router.put('/messages/:id/read', authenticate, markAsRead as any);
router.put('/messages/read-all', authenticate, markAllAsRead as any);
router.delete('/messages/:id', authenticate, deleteMessage as any);

// 通知设置
router.get('/settings', authenticate, getNotificationSettings as any);
router.put('/settings', authenticate, updateNotificationSettings as any);

export default router;
