import { Response } from 'express';
import { prisma } from '../../utils/prisma';
import { AuthRequest } from '../../middleware/auth';

export const getLoginHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20' } = req.query;

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
