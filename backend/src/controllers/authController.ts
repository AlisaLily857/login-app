import { Request, Response } from 'express';
import { body } from 'express-validator';
import { prisma } from '../utils/prisma';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  generateVerificationCode,
  isAccountLocked,
} from '../utils/auth';
import { sendVerificationEmail } from '../utils/email';
import { validate } from '../middleware/validate';
import { AuthRequest } from '../middleware/auth';

// 注册
export const register = [
  body('email').isEmail().normalizeEmail().withMessage('请输入有效的邮箱地址'),
  body('password').isLength({ min: 6 }).withMessage('密码至少需要6个字符'),
  body('username').isLength({ min: 3, max: 30 }).withMessage('用户名需要3-30个字符'),
  body('phone').optional().matches(/^1[3-9]\d{9}$/).withMessage('请输入有效的手机号'),
  validate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, username, phone } = req.body;

      // 检查用户是否已存在
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { username }],
        },
      });

      if (existingUser) {
        res.status(409).json({ error: '用户已存在' });
        return;
      }

      // 创建用户
      const hashedPassword = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          phone,
        },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          role: true,
          isEmailVerified: true,
          createdAt: true,
        },
      });

      // 生成令牌
      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      // 保存刷新令牌
      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      res.status(201).json({
        message: '注册成功',
        user,
        tokens: {
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      console.error('注册错误:', error);
      res.status(500).json({ error: '注册失败' });
    }
  },
];

// 登录
export const login = [
  body('email').isEmail().normalizeEmail().withMessage('请输入有效的邮箱地址'),
  body('password').notEmpty().withMessage('请输入密码'),
  validate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      // 查找用户
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        res.status(401).json({ error: '邮箱或密码错误' });
        return;
      }

      // 检查账号是否锁定
      if (isAccountLocked(user.lockedUntil)) {
        const remainingMinutes = Math.ceil(
          (user.lockedUntil!.getTime() - Date.now()) / 1000 / 60
        );
        res.status(423).json({
          error: '账号已锁定',
          message: `请 ${remainingMinutes} 分钟后再试`,
        });
        return;
      }

      // 验证密码
      const isValidPassword = await comparePassword(password, user.password || '');

      if (!isValidPassword) {
        // 增加失败次数
        const failedAttempts = user.failedAttempts + 1;
        const updates: any = { failedAttempts };

        if (failedAttempts >= 5) {
          updates.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 锁定30分钟
        }

        await prisma.user.update({
          where: { id: user.id },
          data: updates,
        });

        // 记录失败登录
        await prisma.loginHistory.create({
          data: {
            userId: user.id,
            ipAddress,
            userAgent,
            status: 'FAILED',
            failureReason: '密码错误',
          },
        });

        res.status(401).json({ error: '邮箱或密码错误' });
        return;
      }

      // 检查是否需要 MFA
      if (user.mfaEnabled) {
        res.status(200).json({
          requireMFA: true,
          userId: user.id,
          mfaMethod: user.mfaMethod,
        });
        return;
      }

      // 生成令牌
      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      // 更新用户信息
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

      // 保存刷新令牌
      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          ipAddress,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      // 记录登录历史
      await prisma.loginHistory.create({
        data: {
          userId: user.id,
          ipAddress,
          userAgent,
          status: 'SUCCESS',
        },
      });

      res.json({
        message: '登录成功',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      console.error('登录错误:', error);
      res.status(500).json({ error: '登录失败' });
    }
  },
];

// 刷新令牌
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

    // 检查令牌是否在数据库中
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken || storedToken.isRevoked) {
      res.status(401).json({ error: '刷新令牌已失效' });
      return;
    }

    // 生成新的访问令牌
    const accessToken = generateAccessToken(decoded.userId);

    res.json({
      accessToken,
    });
  } catch (error) {
    console.error('刷新令牌错误:', error);
    res.status(500).json({ error: '刷新令牌失败' });
  }
};

// 登出
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // 使刷新令牌失效
      await prisma.refreshToken.updateMany({
        where: { token },
        data: { isRevoked: true },
      });
    }

    res.json({ message: '登出成功' });
  } catch (error) {
    console.error('登出错误:', error);
    res.status(500).json({ error: '登出失败' });
  }
};

// 发送验证码
export const sendVerificationCode = [
  body('email').isEmail().normalizeEmail().withMessage('请输入有效的邮箱地址'),
  body('type').isIn(['EMAIL_VERIFICATION', 'PASSWORD_RESET']).withMessage('无效的验证类型'),
  validate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, type } = req.body;

      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 分钟过期

      // 保存验证码
      await prisma.verificationCode.create({
        data: {
          email,
          code,
          type,
          expiresAt,
        },
      });

      // 发送邮件
      await sendVerificationEmail(
        email,
        code,
        type === 'PASSWORD_RESET' ? 'password-reset' : 'verification'
      );

      res.json({ message: '验证码已发送' });
    } catch (error) {
      console.error('发送验证码错误:', error);
      res.status(500).json({ error: '发送验证码失败' });
    }
  },
];

// 验证邮箱
export const verifyEmail = [
  body('email').isEmail().normalizeEmail(),
  body('code').isLength({ min: 6, max: 6 }).isNumeric(),
  validate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, code } = req.body;

      const verification = await prisma.verificationCode.findFirst({
        where: {
          email,
          code,
          type: 'EMAIL_VERIFICATION',
          isUsed: false,
          expiresAt: { gt: new Date() },
        },
      });

      if (!verification) {
        res.status(400).json({ error: '验证码无效或已过期' });
        return;
      }

      // 标记验证码为已使用
      await prisma.verificationCode.update({
        where: { id: verification.id },
        data: { isUsed: true },
      });

      // 更新用户邮箱验证状态
      await prisma.user.update({
        where: { email },
        data: {
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });

      res.json({ message: '邮箱验证成功' });
    } catch (error) {
      console.error('验证邮箱错误:', error);
      res.status(500).json({ error: '验证失败' });
    }
  },
];

// 获取当前用户
export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatar: true,
        phone: true,
        bio: true,
        role: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        mfaEnabled: true,
        loginCount: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: '用户不存在' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
};
