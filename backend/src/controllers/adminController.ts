import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

// 获取用户列表（管理员）
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { username: { contains: search as string, mode: 'insensitive' } },
        { name: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (role) where.role = role;
    if (status) where.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          role: true,
          status: true,
          isEmailVerified: true,
          loginCount: true,
          lastLoginAt: true,
          createdAt: true,
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ error: '获取用户列表失败' });
  }
};

// 获取用户详情（管理员）
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatar: true,
        phone: true,
        role: true,
        status: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        mfaEnabled: true,
        loginCount: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: '用户不存在' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('获取用户详情错误:', error);
    res.status(500).json({ error: '获取用户详情失败' });
  }
};

// 更新用户状态（管理员）
export const updateUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        email: true,
        status: true,
      },
    });

    res.json({ message: '用户状态已更新', user });
  } catch (error) {
    console.error('更新用户状态错误:', error);
    res.status(500).json({ error: '更新失败' });
  }
};

// 更新用户角色（管理员）
export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    res.json({ message: '用户角色已更新', user });
  } catch (error) {
    console.error('更新用户角色错误:', error);
    res.status(500).json({ error: '更新失败' });
  }
};

// 获取统计数据（管理员）
export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersThisMonth,
      loginAttempts,
      failedAttempts,
      usersByRole,
      usersByStatus,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({ where: { createdAt: { gte: thisMonth } } }),
      prisma.loginHistory.count({ where: { createdAt: { gte: today } } }),
      prisma.loginHistory.count({ where: { createdAt: { gte: today }, status: 'FAILED' } }),
      prisma.user.groupBy({ by: ['role'], _count: { role: true } }),
      prisma.user.groupBy({ by: ['status'], _count: { status: true } }),
    ]);

    res.json({
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersThisMonth,
      loginAttempts,
      failedAttempts,
      usersByRole,
      usersByStatus,
    });
  } catch (error) {
    console.error('获取统计数据错误:', error);
    res.status(500).json({ error: '获取统计数据失败' });
  }
};

// 获取审计日志（管理员）
export const getAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 50, action, userId } = req.query;

    const where: any = {};
    if (action) where.action = action;
    if (userId) where.userId = userId as string;

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('获取审计日志错误:', error);
    res.status(500).json({ error: '获取审计日志失败' });
  }
};
