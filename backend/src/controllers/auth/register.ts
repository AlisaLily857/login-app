import { Request, Response } from 'express';
import { body } from 'express-validator';
import { prisma } from '../utils/prisma';
import { hashPassword, generateAccessToken, generateRefreshToken } from '../utils/auth';
import { sendVerificationEmail } from '../utils/email';
import { validate } from '../middleware/validate';

export const register = [
  body('email').isEmail().normalizeEmail().withMessage('请输入有效的邮箱地址'),
  body('password').isLength({ min: 6 }).withMessage('密码至少需要6个字符'),
  body('username').isLength({ min: 3, max: 30 }).withMessage('用户名需要3-30个字符'),
  body('phone').optional().matches(/^1[3-9]\d{9}$/).withMessage('请输入有效的手机号'),
  validate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, username, phone } = req.body;

      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
      });

      if (existingUser) {
        res.status(409).json({ error: '用户已存在' });
        return;
      }

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

      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

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
        tokens: { accessToken, refreshToken },
      });
    } catch (error) {
      console.error('注册错误:', error);
      res.status(500).json({ error: '注册失败' });
    }
  },
];
