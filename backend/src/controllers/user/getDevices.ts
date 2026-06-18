import { Response } from 'express';
import { prisma } from '../../utils/prisma';
import { AuthRequest } from '../../middleware/auth';

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
