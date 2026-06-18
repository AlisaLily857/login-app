import { Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';

// 获取用户统计数据
export const getUserStats = [
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [
        totalLogins,
        todayLogins,
        monthLogins,
        deviceCount,
        securityScore,
        loginHistory,
        deviceDistribution,
        hourlyDistribution,
      ] = await Promise.all([
        // 总登录次数
        prisma.loginHistory.count({
          where: { userId, status: 'SUCCESS' },
        }),
        // 今日登录
        prisma.loginHistory.count({
          where: {
            userId,
            status: 'SUCCESS',
            createdAt: { gte: today },
          },
        }),
        // 本月登录
        prisma.loginHistory.count({
          where: {
            userId,
            status: 'SUCCESS',
            createdAt: { gte: thisMonth },
          },
        }),
        // 设备数量
        prisma.device.count({
          where: { userId },
        }),
        // 安全评分
        calculateSecurityScore(userId),
        // 最近7天登录历史
        prisma.loginHistory.findMany({
          where: {
            userId,
            status: 'SUCCESS',
            createdAt: {
              gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            },
          },
          orderBy: { createdAt: 'asc' },
          select: {
            createdAt: true,
            ipAddress: true,
            deviceType: true,
            location: true,
          },
        }),
        // 设备分布
        prisma.device.groupBy({
          where: { userId },
          by: ['type'],
          _count: { type: true },
        }),
        // 时段分布
        prisma.$queryRaw`
          SELECT EXTRACT(hour FROM "createdAt") as hour, COUNT(*) as count
          FROM "login_histories"
          WHERE "userId" = ${userId}
            AND "createdAt" >= ${new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)}
            AND status = 'SUCCESS'
          GROUP BY EXTRACT(hour FROM "createdAt")
          ORDER BY hour
        `,
      ]);

      res.json({
        overview: {
          totalLogins,
          todayLogins,
          monthLogins,
          deviceCount,
          securityScore,
        },
        loginHistory,
        deviceDistribution,
        hourlyDistribution,
      });
    } catch (error) {
      console.error('获取统计数据错误:', error);
      res.status(500).json({ error: '获取统计数据失败' });
    }
  },
];

// 计算安全评分
async function calculateSecurityScore(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isEmailVerified: true,
      isPhoneVerified: true,
      mfaEnabled: true,
      password: true,
      webauthnId: true,
    },
  });

  if (!user) return 0;

  let score = 0;
  if (user.isEmailVerified) score += 20;
  if (user.isPhoneVerified) score += 20;
  if (user.mfaEnabled) score += 25;
  if (user.password) score += 15;
  if (user.webauthnId) score += 20;

  return Math.min(score, 100);
}

// 获取系统统计数据（管理员）
export const getSystemStats = [
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const [
        totalUsers,
        activeUsers,
        newUsersToday,
        newUsersThisMonth,
        loginAttempts,
        failedAttempts,
        activeSessions,
        usersByRole,
        usersByStatus,
        dailyLogins,
        topLocations,
        securityEvents,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: 'ACTIVE' } }),
        prisma.user.count({ where: { createdAt: { gte: today } } }),
        prisma.user.count({ where: { createdAt: { gte: thisMonth } } }),
        prisma.loginHistory.count({ where: { createdAt: { gte: today } } }),
        prisma.loginHistory.count({
          where: { createdAt: { gte: today }, status: 'FAILED' },
        }),
        prisma.session.count({ where: { isValid: true } }),
        prisma.user.groupBy({ by: ['role'], _count: { role: true } }),
        prisma.user.groupBy({ by: ['status'], _count: { status: true } }),
        // 最近30天每日登录数
        prisma.$queryRaw`
          SELECT 
            DATE("createdAt") as date,
            COUNT(*) as count,
            SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) as success,
            SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed
          FROM "login_histories"
          WHERE "createdAt" >= ${new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)}
          GROUP BY DATE("createdAt")
          ORDER BY date DESC
        `,
        // 登录地点 Top 10
        prisma.$queryRaw`
          SELECT location, COUNT(*) as count
          FROM "login_histories"
          WHERE "createdAt" >= ${thisMonth}
            AND location IS NOT NULL
          GROUP BY location
          ORDER BY count DESC
          LIMIT 10
        `,
        // 安全事件统计
        prisma.$queryRaw`
          SELECT 
            DATE("createdAt") as date,
            COUNT(*) as count
          FROM "audit_logs"
          WHERE "createdAt" >= ${thisMonth}
            AND status = 'FAILURE'
          GROUP BY DATE("createdAt")
          ORDER BY date DESC
        `,
      ]);

      res.json({
        overview: {
          totalUsers,
          activeUsers,
          newUsersToday,
          newUsersThisMonth,
          loginAttempts,
          failedAttempts,
          activeSessions,
        },
        usersByRole,
        usersByStatus,
        dailyLogins,
        topLocations,
        securityEvents,
      });
    } catch (error) {
      console.error('获取系统统计错误:', error);
      res.status(500).json({ error: '获取系统统计失败' });
    }
  },
];
