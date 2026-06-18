import { Request, Response } from 'express';
import { body } from 'express-validator';
import { prisma } from '../../utils/prisma';
import { hashPassword, comparePassword, getClientIP, parseUserAgent } from '../../utils/auth';
import { validate } from '../../middleware/validate';
import { AuthRequest } from '../../middleware/auth';

export const updateProfile = [
  body('name').optional().trim().isLength({ max: 50 }),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('avatar').optional().isURL(),
  validate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { name, bio, avatar } = req.body;

      const user = await prisma.user.update({
        where: { id: req.user!.id },
        data: { name, bio, avatar },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          avatar: true,
          bio: true,
          updatedAt: true,
        },
      });

      res.json({ message: '资料更新成功', user });
    } catch (error) {
      console.error('更新资料错误:', error);
      res.status(500).json({ error: '更新失败' });
    }
  },
];
