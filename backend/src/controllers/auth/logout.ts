import { Response } from 'express';
import { prisma } from '../../utils/prisma';
import { AuthRequest } from '../../middleware/auth';

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // 吊销当前用户的所有 refresh token
    if (req.user?.id) {
      await prisma.refreshToken.updateMany({
        where: { userId: req.user.id },
        data: { isRevoked: true },
      });
    }

    res.json({ message: '登出成功' });
  } catch (error) {
    console.error('登出错误:', error);
    res.status(500).json({ error: '登出失败' });
  }
};
