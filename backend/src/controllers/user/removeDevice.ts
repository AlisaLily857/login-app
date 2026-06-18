import { Response } from 'express';
import { prisma } from '../../utils/prisma';
import { AuthRequest } from '../../middleware/auth';

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
