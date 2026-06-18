import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { prisma } from './prisma';

// 密码加密
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// JWT Token
export const generateAccessToken = (userId: string): string => {
  return jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId, type: 'refresh', jti: uuidv4() },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string, secret: string): any => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

// 验证码生成
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 设备指纹
export const generateDeviceFingerprint = (userAgent: string, ip: string): string => {
  const crypto = require('crypto');
  return crypto
    .createHash('sha256')
    .update(`${userAgent}-${ip}-${Date.now()}`)
    .digest('hex');
};

// MFA
export const generateMFASecret = (): { secret: string; otpauthUrl: string } => {
  const secret = speakeasy.generateSecret({
    name: 'Login App',
    length: 32,
  });

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url!,
  };
};

export const generateQRCode = async (otpauthUrl: string): Promise<string> => {
  return QRCode.toDataURL(otpauthUrl);
};

export const verifyTOTP = (token: string, secret: string): boolean => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2,
  });
};

// 登录锁定检查
export const isAccountLocked = (lockedUntil: Date | null): boolean => {
  if (!lockedUntil) return false;
  return new Date() < lockedUntil;
};

// IP 解析（简化版）
export const getLocationFromIP = async (ip: string): Promise<string> => {
  // TODO: 集成 IP 地理位置服务
  return 'Unknown';
};
