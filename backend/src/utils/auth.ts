import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { prisma } from './prisma';
import config from '../config';

// 密码加密
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
};

// JWT Token
export const generateAccessToken = (userId: string): string => {
  return jwt.sign(
    { userId, type: 'access' },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId, type: 'refresh', jti: uuidv4() },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
};

export const verifyToken = (token: string, secret: string): any => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

export const verifyAccessToken = (token: string): any => {
  return verifyToken(token, config.jwt.secret);
};

export const verifyRefreshToken = (token: string): any => {
  return verifyToken(token, config.jwt.refreshSecret);
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
    name: config.webauthn.rpName,
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

// 获取客户端 IP
export const getClientIP = (req: any): string => {
  return req.ip || 
    req.headers['x-forwarded-for'] || 
    req.headers['x-real-ip'] || 
    req.socket?.remoteAddress || 
    'unknown';
};

// 解析 User-Agent
export const parseUserAgent = (userAgent: string): { browser: string; os: string; device: string } => {
  const ua = userAgent || '';
  
  // 简单的 UA 解析
  const browser = ua.includes('Chrome') ? 'Chrome' :
    ua.includes('Firefox') ? 'Firefox' :
    ua.includes('Safari') ? 'Safari' :
    ua.includes('Edge') ? 'Edge' : 'Unknown';
    
  const os = ua.includes('Windows') ? 'Windows' :
    ua.includes('Mac') ? 'macOS' :
    ua.includes('Linux') ? 'Linux' :
    ua.includes('Android') ? 'Android' :
    ua.includes('iOS') ? 'iOS' : 'Unknown';
    
  const device = ua.includes('Mobile') ? 'Mobile' : 'Desktop';
  
  return { browser, os, device };
};

// 密码强度检查
export const checkPasswordStrength = (password: string): { 
  score: number; 
  isStrong: boolean; 
  feedback: string[] 
} => {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length >= 8) score += 1;
  else feedback.push('密码至少8位');
  
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('需要大写字母');
  
  if (/\d/.test(password)) score += 1;
  else feedback.push('需要数字');
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else feedback.push('需要特殊字符');
  
  return {
    score,
    isStrong: score >= 4,
    feedback,
  };
};
