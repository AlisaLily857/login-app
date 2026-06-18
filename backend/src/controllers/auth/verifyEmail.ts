import { Request, Response } from 'express';
import { body } from 'express-validator';
import { prisma } from '../utils/prisma';
import { validate } from '../middleware/validate';

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

      await prisma.verificationCode.update({
        where: { id: verification.id },
        data: { isUsed: true },
      });

      await prisma.user.update({
        where: { email },
        data: { isEmailVerified: true, emailVerifiedAt: new Date() },
      });

      res.json({ message: '邮箱验证成功' });
    } catch (error) {
      console.error('验证邮箱错误:', error);
      res.status(500).json({ error: '验证失败' });
    }
  },
];
