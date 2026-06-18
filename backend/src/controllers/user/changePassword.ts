import { Request, Response } from 'express';
import { body } from 'express-validator';
import { prisma } from '../../utils/prisma';
import { hashPassword, comparePassword } from '../../utils/auth';
import { validate } from '../../middleware/validate';
import { AuthRequest } from '../../middleware/auth';

export const changePassword = [
  body('currentPassword').notEmpty().withMessage('请输入当前密码'),
  body('newPassword').isLength({ min: 6 }).withMessage('新密码至少需要6个字符'),
  validate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { password: true },
      });

      if (!user?.password) {
        res.status(400).json({ error: '无法修改密码' });
        return;
      }

      const isValid = await comparePassword(currentPassword, user.password);
      if (!isValid) {
        res.status(401).json({ error: '当前密码错误' });
        return;
      }

      const hashedPassword = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: req.user!.id },
        data: { password: hashedPassword },
      });

      // 使所有刷新令牌失效
      await prisma.refreshToken.updateMany({
        where: { userId: req.user!.id },
        data: { isRevoked: true },
      });

      res.json({ message: '密码修改成功，请重新登录' });
    } catch (error) {
      console.error('修改密码错误:', error);
      res.status(500).json({ error: '修改密码失败' });
    }
  },
];
