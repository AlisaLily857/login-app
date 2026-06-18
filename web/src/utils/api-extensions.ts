import { api } from './api';

// 生物识别 API
export const biometricApi = {
  // 注册
  registerOptions: () =>
    api.post('/biometric/register/options', {}),

  verifyRegistration: (data: {
    id: string;
    rawId: string;
    response: any;
    type: string;
  }) => api.post('/biometric/register/verify', data),

  // 认证
  authOptions: (email: string) =>
    api.post('/biometric/auth/options', { email }),

  verifyAuthentication: (data: {
    email: string;
    id: string;
    rawId: string;
    response: any;
    type: string;
  }) => api.post('/biometric/auth/verify', data),

  // 管理
  getStatus: () => api.get('/biometric/status'),
  remove: () => api.delete('/biometric'),
};

// 消息 API
export const messageApi = {
  getMessages: (params?: { page?: string; limit?: string; type?: string; isRead?: string }) =>
    api.get('/messages/messages', params),

  markAsRead: (id: string) =>
    api.put(`/messages/messages/${id}/read`, {}),

  markAllAsRead: () =>
    api.put('/messages/messages/read-all', {}),

  deleteMessage: (id: string) =>
    api.delete(`/messages/messages/${id}`),

  // 通知设置
  getSettings: () => api.get('/messages/settings'),
  updateSettings: (data: { type: string; email: boolean; push: boolean; sms: boolean }) =>
    api.put('/messages/settings', data),
};

// 统计 API
export const statsApi = {
  getUserStats: () => api.get('/stats/user'),
  getSystemStats: () => api.get('/stats/system'),
};

// 成就 API
export const achievementApi = {
  getAchievements: () => api.get('/achievements'),
  getLeaderboard: (period?: string) =>
    api.get('/achievements/leaderboard', period ? { period } : undefined),
};
