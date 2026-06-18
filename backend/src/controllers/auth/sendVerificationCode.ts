import { Request, Response } from 'express';
import { body } from 'express-validator';
import { prisma } from '../utils/prisma';
import { generateVerificationCode } from '../utils/auth';
import { sendVerificationEmail } from '../utils/email';
import { validate } from '../middleware/validate';

export const sendVerificationCode = [
  body('email').isEmail().normalizeEmail().withMessage('请输入有效的邮箱地址'),
  body('type').isIn(['EMAIL_VERIFICATION', 'PASSWORD_RESET']).withMessage('无效的验证类型'),
  validate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, type } = req.body;
      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await prisma.verificationCode.create({
        data: { email, code, type, expiresAt },
      });

      await sendVerificationEmail(email, code, type === 'PASSWORD_RESET' ? 'password-reset' : 'verification');
      res.json({ message: '验证码已发送' });
    } catch (error) {
      console.error('发送验证码错误:', error);
      res.status(500).json({ error: '发送验证码失败' });
    }
  },
];
