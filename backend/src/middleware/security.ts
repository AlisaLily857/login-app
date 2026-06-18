import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cors from 'cors';
import { body, validationResult } from 'express-validator';
import { prisma } from '../utils/prisma';

// 增强版 Helmet 安全头
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});

// CORS 配置
export const corsConfig = cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.CLIENT_URL,
      'http://localhost:5173',
      'http://localhost:3000',
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('不允许的来源'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24小时
});

// 请求大小限制
export const bodyParserLimit = {
  json: { limit: '10kb' },
  urlencoded: { limit: '10kb', extended: true },
};

// 防止参数污染
export const preventParameterPollution = hpp();

// MongoDB 注入防护（即使使用 Prisma 也建议启用）
export const mongoSanitizeConfig = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`检测到 MongoDB 注入尝试: ${key}`, req.ip);
  },
});

const GLOBAL_WINDOW_MS = 15 * 60 * 1000;

// 全局限流配置
export const globalRateLimit = rateLimit({
  windowMs: GLOBAL_WINDOW_MS, // 15分钟
  max: 100, // 每个 IP 100 次请求
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health', // 健康检查跳过
  handler: (req, res) => {
    res.status(429).json({
      error: '请求过于频繁',
      retryAfter: Math.ceil(((req as any).rateLimit?.resetTime ?? Date.now() + GLOBAL_WINDOW_MS) / 1000),
    });
  },
});

// 严格限流（敏感操作）
export const strictRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 5,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      error: '操作次数过多，请稍后再试',
      retryAfter: 3600,
    });
  },
});

// 输入验证错误处理
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: '输入验证失败',
      details: errors.array().map(err => ({
        field: err.type === 'field' ? err.path : err.type,
        message: err.msg,
        value: err.type === 'field' ? err.value : undefined,
      })),
    });
    return;
  }
  next();
};

// 审计日志中间件
export const auditLog = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const startTime = Date.now();
  
  // 保存原始 end 方法
  const originalEnd = res.end.bind(res);
  
  res.end = function(chunk: any, encoding?: any, callback?: any) {
    const duration = Date.now() - startTime;
    
    // 异步记录日志，不阻塞响应
    prisma.auditLog.create({
      data: {
        action: req.method,
        resource: req.path,
        userId: (req as any).user?.id,
        userEmail: (req as any).user?.email,
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        status: res.statusCode >= 400 ? 'FAILURE' : 'SUCCESS',
        errorMessage: res.statusCode >= 400 ? chunk?.toString() : undefined,
      },
    }).catch(console.error);
    
    return originalEnd(chunk, encoding, callback);
  };

  next();
};

// 请求 ID 中间件（用于追踪）
export const requestId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = req.headers['x-request-id'] || 
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  req.headers['x-request-id'] = requestId as string;
  res.setHeader('X-Request-Id', requestId as string);
  
  next();
};

// 性能监控中间件
export const performanceMonitor = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const duration = (diff[0] * 1e9 + diff[1]) / 1e6; // 转换为毫秒
    
    if (duration > 1000) {
      console.warn(`慢请求警告: ${req.method} ${req.path} 耗时 ${duration.toFixed(2)}ms`);
    }
  });
  
  next();
};