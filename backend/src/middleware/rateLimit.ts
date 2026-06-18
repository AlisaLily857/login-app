import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { prisma } from '../utils/prisma';

// 通用限流
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 每个 IP 100 次请求
  message: { error: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 登录限流
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: '登录尝试次数过多，请 15 分钟后再试' },
  skipSuccessfulRequests: true,
});

// 注册限流
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 小时
  max: 3,
  message: { error: '注册次数过多，请稍后再试' },
});

// 验证码限流
export const verificationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: 1,
  message: { error: '验证码发送过于频繁' },
});

// 账号锁定检查
export const checkAccountLock = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email } = req.body;
  
  if (!email) {
    next();
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { lockedUntil: true, failedAttempts: true },
  });

  if (user?.lockedUntil && new Date() < user.lockedUntil) {
    const remainingMinutes = Math.ceil(
      (user.lockedUntil.getTime() - Date.now()) / 1000 / 60
    );
    res.status(423).json({
      error: '账号已锁定',
      message: `请 ${remainingMinutes} 分钟后再试`,
      lockedUntil: user.lockedUntil,
    });
    return;
  }

  next();
};
