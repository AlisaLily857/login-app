import { Request, Response } from 'express';
import { body } from 'express-validator';
import { prisma } from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/auth';
import { validate } from '../middleware/validate';
import { AuthRequest } from '../middleware/auth';

// 更新个人资料
export const updateProfile = [
  body('name').optional().trim().isLength({ max: 50 }),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('avatar').optional().isURL(),
  validate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { name, bio, avatar } = req.body;

      const user = await prisma.user.update({
        where: { id: req.user!.id },
        data: { name, bio, avatar },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          avatar: true,
          bio: true,
          updatedAt: true,
        },
      });

      res.json({ message: '资料更新成功', user });
    } catch (error) {
      console.error('更新资料错误:', error);
      res.status(500).json({ error: '更新失败' });
    }
  },
];

// 修改密码
export const changePassword = [
  body('currentPassword').notEmpty().withMessage('请输入当前密码'),
  body('newPassword').isLength({ min: 6 }).withMessage('新密码至少需要6个字符'),
  validate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { password: true },
      });

      if (!user?.password) {
        res.status(400).json({ error: '无法修改密码' });
        return;
      }

      const isValid = await comparePassword(currentPassword, user.password);
      if (!isValid) {
        res.status(401).json({ error: '当前密码错误' });
        return;
      }

      const hashedPassword = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: req.user!.id },
        data: { password: hashedPassword },
      });

      // 使所有刷新令牌失效
      await prisma.refreshToken.updateMany({
        where: { userId: req.user!.id },
        data: { isRevoked: true },
      });

      res.json({ message: '密码修改成功，请重新登录' });
    } catch (error) {
      console.error('修改密码错误:', error);
      res.status(500).json({ error: '修改密码失败' });
    }
  },
];

// 获取登录历史
export const getLoginHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [histories, total] = await Promise.all([
      prisma.loginHistory.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.loginHistory.count({
        where: { userId: req.user!.id },
      }),
    ]);

    res.json({
      histories,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('获取登录历史错误:', error);
    res.status(500).json({ error: '获取登录历史失败' });
  }
};

// 获取设备列表
export const getDevices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const devices = await prisma.device.findMany({
      where: { userId: req.user!.id },
      orderBy: { lastActive: 'desc' },
    });

    res.json({ devices });
  } catch (error) {
    console.error('获取设备列表错误:', error);
    res.status(500).json({ error: '获取设备列表失败' });
  }
};

// 移除设备
export const removeDevice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { deviceId } = req.params;

    await prisma.device.deleteMany({
      where: {
        id: deviceId,
        userId: req.user!.id,
      },
    });

    res.json({ message: '设备已移除' });
  } catch (error) {
    console.error('移除设备错误:', error);
    res.status(500).json({ error: '移除设备失败' });
  }
};

// 信任设备
export const trustDevice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { deviceId } = req.params;

    await prisma.device.updateMany({
      where: {
        id: deviceId,
        userId: req.user!.id,
      },
      data: { isTrusted: true },
    });

    res.json({ message: '设备已标记为信任' });
  } catch (error) {
    console.error('信任设备错误:', error);
    res.status(500).json({ error: '操作失败' });
  }
};

// 删除账号
export const deleteAccount = [
  body('password').notEmpty().withMessage('请输入密码确认'),
  validate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { password } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { password: true },
      });

      if (!user?.password) {
        res.status(400).json({ error: '无法删除账号' });
        return;
      }

      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        res.status(401).json({ error: '密码错误' });
        return;
      }

      // 软删除
      await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          status: 'DELETED',
          deletedAt: new Date(),
          email: `deleted_${Date.now()}_${req.user!.email}`,
        },
      });

      // 使所有令牌失效
      await prisma.refreshToken.updateMany({
        where: { userId: req.user!.id },
        data: { isRevoked: true },
      });

      res.json({ message: '账号已删除' });
    } catch (error) {
      console.error('删除账号错误:', error);
      res.status(500).json({ error: '删除账号失败' });
    }
  },
];
