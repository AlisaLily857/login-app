import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export const successResponse = <T>(res: Response, data: T, statusCode = 200): void => {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };
  res.status(statusCode).json(response);
};

export const errorResponse = (res: Response, message: string, statusCode = 400): void => {
  const response: ApiResponse = {
    success: false,
    error: message,
  };
  res.status(statusCode).json(response);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const generateRandomCode = (length = 6): string => {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
};

export const generateSecureToken = (): string => {
  return require('crypto').randomBytes(32).toString('hex');
};
