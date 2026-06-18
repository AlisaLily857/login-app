import { Request, Response } from 'express';
import { body } from 'express-validator';
import { prisma } from '../utils/prisma';
import { comparePassword, generateAccessToken, generateRefreshToken, isAccountLocked } from '../utils/auth';
import { validate } from '../middleware/validate';

export const login = [
  body('email').isEmail().normalizeEmail().withMessage('请输入有效的邮箱地址'),
  body('password').notEmpty().withMessage('请输入密码'),
  validate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        res.status(401).json({ error: '邮箱或密码错误' });
        return;
      }

      if (isAccountLocked(user.lockedUntil)) {
        const remainingMinutes = Math.ceil((user.lockedUntil!.getTime() - Date.now()) / 1000 / 60);
        res.status(423).json({ error: '账号已锁定', message: `请 ${remainingMinutes} 分钟后再试` });
        return;
      }

      const isValidPassword = await comparePassword(password, user.password || '');

      if (!isValidPassword) {
        const failedAttempts = user.failedAttempts + 1;
        const updates: any = { failedAttempts };
        if (failedAttempts >= 5) {
          updates.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
        }

        await prisma.user.update({ where: { id: user.id }, data: updates });
        await prisma.loginHistory.create({
          data: { userId: user.id, ipAddress, userAgent, status: 'FAILED', failureReason: '密码错误' },
        });

        res.status(401).json({ error: '邮箱或密码错误' });
        return;
      }

      if (user.mfaEnabled) {
        res.status(200).json({ requireMFA: true, userId: user.id, mfaMethod: user.mfaMethod });
        return;
      }

      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginCount: { increment: 1 },
          lastLoginAt: new Date(),
          lastLoginIp: ipAddress,
          failedAttempts: 0,
          lockedUntil: null,
        },
      });

      await prisma.refreshToken.create({
        data: { userId: user.id, token: refreshToken, ipAddress, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      });

      await prisma.loginHistory.create({
        data: { userId: user.id, ipAddress, userAgent, status: 'SUCCESS' },
      });

      res.json({
        message: '登录成功',
        user: { id: user.id, email: user.email, username: user.username, name: user.name, role: user.role, isEmailVerified: user.isEmailVerified },
        tokens: { accessToken, refreshToken },
      });
    } catch (error) {
      console.error('登录错误:', error);
      res.status(500).json({ error: '登录失败' });
    }
  },
];
