import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { prisma } from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';

// 获取消息列表
export const getMessages = [
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 20, type, isRead } = req.query;

      const where: any = { userId: req.user!.id };
      if (type) where.type = type;
      if (isRead !== undefined) where.isRead = isRead === 'true';

      const skip = (Number(page) - 1) * Number(limit);

      const [messages, total, unreadCount] = await Promise.all([
        prisma.message.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit),
        }),
        prisma.message.count({ where }),
        prisma.message.count({
          where: { userId: req.user!.id, isRead: false },
        }),
      ]);

      res.json({
        messages,
        unreadCount,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error('获取消息错误:', error);
      res.status(500).json({ error: '获取消息失败' });
    }
  },
];

// 标记已读
export const markAsRead = [
  authenticate,
  param('id').notEmpty(),
  validate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      await prisma.message.updateMany({
        where: {
          id,
          userId: req.user!.id,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      res.json({ message: '已标记为已读' });
    } catch (error) {
      console.error('标记已读错误:', error);
      res.status(500).json({ error: '操作失败' });
    }
  },
];

// 标记全部已读
export const markAllAsRead = [
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      await prisma.message.updateMany({
        where: {
          userId: req.user!.id,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      res.json({ message: '全部标记为已读' });
    } catch (error) {
      console.error('标记全部已读错误:', error);
      res.status(500).json({ error: '操作失败' });
    }
  },
];

// 删除消息
export const deleteMessage = [
  authenticate,
  param('id').notEmpty(),
  validate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      await prisma.message.deleteMany({
        where: {
          id,
          userId: req.user!.id,
        },
      });

      res.json({ message: '消息已删除' });
    } catch (error) {
      console.error('删除消息错误:', error);
      res.status(500).json({ error: '删除失败' });
    }
  },
];

// 创建消息（系统内部使用）
export const createMessage = async (
  userId: string,
  type: string,
  title: string,
  content: string,
  options?: { actionUrl?: string; actionText?: string; metadata?: any }
): Promise<void> => {
  try {
    await prisma.message.create({
      data: {
        userId,
        type: type as any,
        title,
        content,
        actionUrl: options?.actionUrl,
        actionText: options?.actionText,
        metadata: options?.metadata,
      },
    });

    // 发送推送通知（如果用户开启了）
    await sendPushNotification(userId, title, content);
  } catch (error) {
    console.error('创建消息错误:', error);
  }
};

// 获取通知设置
export const getNotificationSettings = [
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const settings = await prisma.notification.findMany({
        where: { userId: req.user!.id },
      });

      res.json({ settings });
    } catch (error) {
      console.error('获取通知设置错误:', error);
      res.status(500).json({ error: '获取失败' });
    }
  },
];

// 更新通知设置
export const updateNotificationSettings = [
  authenticate,
  body('type').notEmpty(),
  body('email').isBoolean(),
  body('push').isBoolean(),
  body('sms').isBoolean(),
  validate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { type, email, push, sms } = req.body;

      const setting = await prisma.notification.upsert({
        where: {
          userId_type: {
            userId: req.user!.id,
            type,
          },
        },
        update: { email, push, sms },
        create: {
          userId: req.user!.id,
          type,
          email,
          push,
          sms,
        },
      });

      res.json({ message: '设置已更新', setting });
    } catch (error) {
      console.error('更新通知设置错误:', error);
      res.status(500).json({ error: '更新失败' });
    }
  },
];

// 推送通知（模拟）
async function sendPushNotification(
  userId: string,
  title: string,
  body: string
): Promise<void> {
  // TODO: 集成 Firebase Cloud Messaging 或 Web Push
  console.log(`推送通知: ${userId} - ${title}: ${body}`);
}

// 发送登录通知
export const sendLoginNotification = async (
  userId: string,
  device: string,
  location: string
): Promise<void> => {
  await createMessage(
    userId,
    'SECURITY',
    '新设备登录提醒',
    `您的账号在 ${location} 的 ${device} 上登录。如果这不是您的操作，请立即修改密码。`,
    {
      actionUrl: '/security',
      actionText: '查看安全设置',
      metadata: { type: 'login_alert', device, location },
    }
  );
};

// 发送安全提醒
export const sendSecurityAlert = async (
  userId: string,
  alertType: string,
  details: string
): Promise<void> => {
  await createMessage(
    userId,
    'SECURITY',
    '安全提醒',
    details,
    {
      actionUrl: '/security',
      actionText: '查看详情',
      metadata: { type: alertType },
    }
  );
};