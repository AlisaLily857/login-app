import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

// 缓存配置
const CACHE_TTL = 5 * 60 * 1000; // 5分钟
const cache = new Map<string, { data: any; timestamp: number }>();

const getCache = (key: string): any | null => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCache = (key: string, data: any): void => {
  cache.set(key, { data, timestamp: Date.now() });
};

// 清除缓存
const clearCache = (pattern: string): void => {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};

// 带缓存的查询
export const getCachedUserStats = async (userId: string) => {
  const cacheKey = `user_stats_${userId}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const stats = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      loginCount: true,
      lastLoginAt: true,
      createdAt: true,
      _count: {
        select: {
          devices: true,
          loginHistories: true,
        },
      },
    },
  });

  setCache(cacheKey, stats);
  return stats;
};

// 批量查询优化
export const getUsersWithStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // 使用单个查询获取所有数据
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          role: true,
          status: true,
          isEmailVerified: true,
          loginCount: true,
          lastLoginAt: true,
          createdAt: true,
          _count: {
            select: {
              devices: true,
              loginHistories: true,
            },
          },
        },
      }),
      prisma.user.count(),
    ]);

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ error: '获取用户列表失败' });
  }
};

// 数据库连接池监控
export const getDatabaseStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // 执行健康检查查询
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - startTime;

    // 获取连接信息（PostgreSQL）
    const connections = await prisma.$queryRaw`
      SELECT count(*) as count 
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `;

    res.json({
      status: 'healthy',
      latency,
      activeConnections: (connections as any)[0]?.count || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('数据库状态检查错误:', error);
    res.status(503).json({ 
      status: 'unhealthy',
      error: '数据库连接异常',
    });
  }
};

// 清理过期数据
export const cleanupExpiredData = async (): Promise<void> => {
  const now = new Date();

  await Promise.all([
    // 清理过期验证码
    prisma.verificationCode.deleteMany({
      where: { expiresAt: { lt: now } },
    }),
    // 清理过期刷新令牌
    prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: now } },
    }),
    // 清理已撤销的令牌
    prisma.refreshToken.deleteMany({
      where: { isRevoked: true },
    }),
    // 清理过期的会话
    prisma.session.deleteMany({
      where: { expiresAt: { lt: now } },
    }),
    // 清理30天前的审计日志
    prisma.auditLog.deleteMany({
      where: { createdAt: { lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } },
    }),
  ]);

  console.log('过期数据清理完成');
};

// 定期清理任务（可以集成到 cron 或定时器）
export const startCleanupScheduler = (): void => {
  // 每24小时执行一次
  setInterval(cleanupExpiredData, 24 * 60 * 60 * 1000);
  
  // 启动时执行一次
  cleanupExpiredData().catch(console.error);
};
