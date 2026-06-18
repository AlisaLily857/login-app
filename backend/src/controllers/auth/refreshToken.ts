import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { verifyToken, generateAccessToken } from '../utils/auth';

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: '请提供刷新令牌' });
      return;
    }

    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET!);
    if (!decoded) {
      res.status(401).json({ error: '无效的刷新令牌' });
      return;
    }

    const storedToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!storedToken || storedToken.isRevoked) {
      res.status(401).json({ error: '刷新令牌已失效' });
      return;
    }

    const accessToken = generateAccessToken(decoded.userId);
    res.json({ accessToken });
  } catch (error) {
    console.error('刷新令牌错误:', error);
    res.status(500).json({ error: '刷新令牌失败' });
  }
};
