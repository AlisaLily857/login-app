import { Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';

// 成就列表
const ACHIEVEMENTS = [
  {
    code: 'first_login',
    name: '初次登录',
    description: '完成首次登录',
    icon: '🎯',
    points: 10,
    condition: { type: 'login_count', value: 1 },
  },
  {
    code: 'login_streak_7',
    name: '连续登录7天',
    description: '连续7天登录',
    icon: '🔥',
    points: 50,
    condition: { type: 'login_streak', value: 7 },
  },
  {
    code: 'login_streak_30',
    name: '连续登录30天',
    description: '连续30天登录',
    icon: '🔥🔥',
    points: 200,
    condition: { type: 'login_streak', value: 30 },
  },
  {
    code: 'security_master',
    name: '安全大师',
    description: '开启所有安全功能',
    icon: '🛡️',
    points: 100,
    condition: { type: 'security_score', value: 100 },
  },
  {
    code: 'device_collector',
    name: '设备收藏家',
    description: '在3个以上设备登录',
    icon: '📱',
    points: 30,
    condition: { type: 'device_count', value: 3 },
  },
  {
    code: 'night_owl',
    name: '夜猫子',
    description: '在凌晨2-5点登录',
    icon: '🦉',
    points: 20,
    condition: { type: 'night_login', value: 1 },
  },
  {
    code: 'early_bird',
    name: '早起的鸟儿',
    description: '在早上5-7点登录',
    icon: '🐦',
    points: 20,
    condition: { type: 'early_login', value: 1 },
  },
  {
    code: 'password_guardian',
    name: '密码守护者',
    description: '定期修改密码',
    icon: '🔐',
    points: 50,
    condition: { type: 'password_change', value: 1 },
  },
  {
    code: 'mfa_pioneer',
    name: 'MFA 先锋',
    description: '开启双重认证',
    icon: '🔒',
    points: 80,
    condition: { type: 'mfa_enabled', value: 1 },
  },
  {
    code: 'biometric_adopter',
    name: '生物识别先驱',
    description: '开启生物识别登录',
    icon: '👆',
    points: 100,
    condition: { type: 'biometric_enabled', value: 1 },
  },
];

// 初始化成就
export const initAchievements = async (): Promise<void> => {
  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      update: achievement,
      create: achievement,
    });
  }
};

// 获取成就列表
export const getAchievements = [
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;

      const achievements = await prisma.achievement.findMany({
        include: {
          users: {
            where: { userId },
            select: {
              progress: true,
              completed: true,
              completedAt: true,
            },
          },
        },
      });

      const completedAchievements = await prisma.userAchievement.findMany({
        where: {
          userId,
          completed: true,
        },
        include: {
          achievement: {
            select: {
              points: true,
            },
          },
        },
      });

      const totalPoints = completedAchievements.reduce(
        (sum, ua) => sum + (ua.achievement?.points || 0),
        0
      );

      res.json({
        achievements: achievements.map((a) => ({
          ...a,
          userProgress: a.users[0] || null,
        })),
        totalPoints,
      });
    } catch (error) {
      console.error('获取成就错误:', error);
      res.status(500).json({ error: '获取成就失败' });
    }
  },
];

// 检查并更新成就
export const checkAchievements = async (userId: string): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        loginHistories: {
          where: { status: 'SUCCESS' },
          orderBy: { createdAt: 'desc' },
        },
        devices: true,
        _count: {
          select: {
            loginHistories: true,
            devices: true,
          },
        },
      },
    });

    if (!user) return;

    const achievements = await prisma.achievement.findMany();

    for (const achievement of achievements) {
      const condition = achievement.condition as any;
      let progress = 0;
      let completed = false;

      switch (condition.type) {
        case 'login_count':
          progress = user._count.loginHistories;
          completed = progress >= condition.value;
          break;

        case 'login_streak':
          progress = calculateLoginStreak(user.loginHistories);
          completed = progress >= condition.value;
          break;

        case 'security_score':
          progress = await calculateSecurityScore(userId);
          completed = progress >= condition.value;
          break;

        case 'device_count':
          progress = user._count.devices;
          completed = progress >= condition.value;
          break;

        case 'night_login':
          progress = user.loginHistories.filter((h) => {
            const hour = new Date(h.createdAt).getHours();
            return hour >= 2 && hour <= 5;
          }).length;
          completed = progress >= condition.value;
          break;

        case 'early_login':
          progress = user.loginHistories.filter((h) => {
            const hour = new Date(h.createdAt).getHours();
            return hour >= 5 && hour <= 7;
          }).length;
          completed = progress >= condition.value;
          break;

        case 'mfa_enabled':
          progress = user.mfaEnabled ? 1 : 0;
          completed = progress >= condition.value;
          break;

        case 'biometric_enabled':
          progress = user.webauthnId ? 1 : 0;
          completed = progress >= condition.value;
          break;
      }

      await prisma.userAchievement.upsert({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id,
          },
        },
        update: {
          progress,
          completed,
          completedAt: completed ? new Date() : undefined,
        },
        create: {
          userId,
          achievementId: achievement.id,
          progress,
          completed,
          completedAt: completed ? new Date() : undefined,
        },
      });

      // 如果刚完成成就，发送通知
      if (completed) {
        const existing = await prisma.userAchievement.findUnique({
          where: {
            userId_achievementId: {
              userId,
              achievementId: achievement.id,
            },
          },
        });

        if (!existing?.completedAt) {
          await sendAchievementNotification(userId, achievement);
        }
      }
    }
  } catch (error) {
    console.error('检查成就错误:', error);
  }
};

// 计算连续登录天数
function calculateLoginStreak(logins: any[]): number {
  if (logins.length === 0) return 0;

  let streak = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i < logins.length; i++) {
    const current = new Date(logins[i - 1].createdAt);
    const previous = new Date(logins[i].createdAt);

    current.setHours(0, 0, 0, 0);
    previous.setHours(0, 0, 0, 0);

    const diff = (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

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

// 发送成就通知
async function sendAchievementNotification(
  userId: string,
  achievement: any
): Promise<void> {
  const { createMessage } = await import('./messageController');
  await createMessage(
    userId,
    'SYSTEM',
    '🎉 解锁新成就！',
    `恭喜您解锁成就「${achievement.name}」，获得 ${achievement.points} 积分！`,
    {
      actionUrl: '/achievements',
      actionText: '查看成就',
      metadata: {
        type: 'achievement_unlocked',
        achievementCode: achievement.code,
        points: achievement.points,
      },
    }
  );
}

// 获取排行榜
export const getLeaderboard = [
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { period = 'all' } = req.query;

      let dateFilter = {};
      if (period === 'week') {
        dateFilter = {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        };
      } else if (period === 'month') {
        dateFilter = {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        };
      }

      const leaderboard = await prisma.userAchievement.groupBy({
        by: ['userId'],
        where: {
          completed: true,
          ...dateFilter,
        },
        _sum: {
          progress: true,
        },
        orderBy: {
          _sum: {
            progress: 'desc',
          },
        },
        take: 50,
      });

      // 获取用户信息
      const users = await prisma.user.findMany({
        where: {
          id: {
            in: leaderboard.map((l) => l.userId),
          },
        },
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
        },
      });

      const result = leaderboard.map((l, index) => ({
        rank: index + 1,
        user: users.find((u) => u.id === l.userId),
        points: l._sum.progress || 0,
      }));

      res.json({ leaderboard: result });
    } catch (error) {
      console.error('获取排行榜错误:', error);
      res.status(500).json({ error: '获取排行榜失败' });
    }
  },
];
