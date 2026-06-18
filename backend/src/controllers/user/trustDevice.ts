import { Response } from 'express';
import { prisma } from '../../utils/prisma';
import { AuthRequest } from '../../middleware/auth';

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
