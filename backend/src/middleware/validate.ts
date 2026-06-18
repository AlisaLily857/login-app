import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: '请求参数错误',
      details: errors.array().map(err => ({
        field: err.type === 'field' ? err.path : err.type,
        message: err.msg,
      })),
    });
    return;
  }

  next();
};

// 错误处理中间件
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  if (err.name === 'PrismaClientKnownRequestError') {
    // Prisma 错误
    const prismaError = err as any;
    if (prismaError.code === 'P2002') {
      res.status(409).json({
        error: '数据已存在',
        field: prismaError.meta?.target?.[0],
      });
      return;
    }
    if (prismaError.code === 'P2025') {
      res.status(404).json({ error: '记录不存在' });
      return;
    }
  }

  res.status(500).json({
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};
