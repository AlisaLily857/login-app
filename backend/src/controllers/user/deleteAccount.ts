import { Request, Response } from 'express';
import { body } from 'express-validator';
import { prisma } from '../../utils/prisma';
import { comparePassword } from '../../utils/auth';
import { validate } from '../../middleware/validate';
import { AuthRequest } from '../../middleware/auth';

export const deleteAccount = [
  body('password').notEmpty().withMessage('请输入密码确认'),
  validate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { password } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { password: true },
      });

      if (!user?.password) {
        res.status(400).json({ error: '无法删除账号' });
        return;
      }

      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        res.status(401).json({ error: '密码错误' });
        return;
      }

      // 软删除
      await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          status: 'DELETED',
          deletedAt: new Date(),
          email: `deleted_${Date.now()}_${req.user!.email}`,
        },
      });

      // 使所有令牌失效
      await prisma.refreshToken.updateMany({
        where: { userId: req.user!.id },
        data: { isRevoked: true },
      });

      res.json({ message: '账号已删除' });
    } catch (error) {
      console.error('删除账号错误:', error);
      res.status(500).json({ error: '删除账号失败' });
    }
  },
];
