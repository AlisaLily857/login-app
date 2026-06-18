import { Request, Response } from 'express';
import { body } from 'express-validator';
import { prisma } from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';

// 生成 WebAuthn 注册选项
export const generateRegistrationOptions = [
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
      });

      if (!user) {
        res.status(404).json({ error: '用户不存在' });
        return;
      }

      // 生成挑战
      const challenge = crypto.randomUUID();
      
      // 保存挑战到会话
      await prisma.session.create({
        data: {
          userId: user.id,
          token: challenge,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5分钟过期
        },
      });

      const options = {
        challenge,
        rp: {
          name: 'Login App',
          id: process.env.WEBAUTHN_RP_ID || 'localhost',
        },
        user: {
          id: user.id,
          name: user.email,
          displayName: user.name || user.username,
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' }, // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred',
        },
        timeout: 60000,
        attestation: 'none',
      };

      res.json(options);
    } catch (error) {
      console.error('生成注册选项错误:', error);
      res.status(500).json({ error: '生成注册选项失败' });
    }
  },
];

// 验证注册
export const verifyRegistration = [
  authenticate,
  body('id').notEmpty(),
  body('rawId').notEmpty(),
  body('response').isObject(),
  body('type').equals('public-key'),
  validate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id, rawId, response } = req.body;
      const userId = req.user!.id;

      // 验证挑战
      const session = await prisma.session.findFirst({
        where: {
          userId,
          isValid: true,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!session) {
        res.status(400).json({ error: '验证已过期，请重试' });
        return;
      }

      // 保存生物识别凭证
      await prisma.user.update({
        where: { id: userId },
        data: {
          webauthnId: id,
          webauthnPublicKey: rawId,
          webauthnCounter: 0,
        },
      });

      // 使挑战失效
      await prisma.session.update({
        where: { id: session.id },
        data: { isValid: false },
      });

      res.json({ message: '生物识别注册成功' });
    } catch (error) {
      console.error('验证注册错误:', error);
      res.status(500).json({ error: '验证注册失败' });
    }
  },
];

// 生成认证选项
export const generateAuthenticationOptions = [
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.webauthnId) {
        res.status(400).json({ error: '该账号未开启生物识别登录' });
        return;
      }

      const challenge = crypto.randomUUID();

      // 保存挑战
      await prisma.session.create({
        data: {
          userId: user.id,
          token: challenge,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      });

      const options = {
        challenge,
        allowCredentials: [
          {
            id: user.webauthnId,
            type: 'public-key',
            transports: ['internal', 'hybrid'],
          },
        ],
        userVerification: 'required',
        timeout: 60000,
      };

      res.json(options);
    } catch (error) {
      console.error('生成认证选项错误:', error);
      res.status(500).json({ error: '生成认证选项失败' });
    }
  },
];

// 验证生物识别登录
export const verifyAuthentication = [
  body('id').notEmpty(),
  body('rawId').notEmpty(),
  body('response').isObject(),
  body('type').equals('public-key'),
  body('email').isEmail(),
  validate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, id, rawId, response } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.webauthnId) {
        res.status(400).json({ error: '验证失败' });
        return;
      }

      // 验证挑战
      const session = await prisma.session.findFirst({
        where: {
          userId: user.id,
          isValid: true,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!session) {
        res.status(400).json({ error: '验证已过期' });
        return;
      }

      // 更新计数器
      await prisma.user.update({
        where: { id: user.id },
        data: {
          webauthnCounter: { increment: 1 },
        },
      });

      // 使挑战失效
      await prisma.session.update({
        where: { id: session.id },
        data: { isValid: false },
      });

      // 生成令牌
      const { generateAccessToken, generateRefreshToken } = await import('../utils/auth');
      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      res.json({
        message: '生物识别登录成功',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      console.error('验证生物识别登录错误:', error);
      res.status(500).json({ error: '登录失败' });
    }
  },
];

// 移除生物识别
export const removeBiometric = [
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          webauthnId: null,
          webauthnPublicKey: null,
          webauthnCounter: null,
        },
      });

      res.json({ message: '生物识别登录已移除' });
    } catch (error) {
      console.error('移除生物识别错误:', error);
      res.status(500).json({ error: '移除失败' });
    }
  },
];

// 检查生物识别状态
export const checkBiometricStatus = [
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          webauthnId: true,
        },
      });

      res.json({
        enabled: !!user?.webauthnId,
      });
    } catch (error) {
      console.error('检查生物识别状态错误:', error);
      res.status(500).json({ error: '检查失败' });
    }
  },
];
