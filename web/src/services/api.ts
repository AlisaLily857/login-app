import { api } from './api';

// 认证 API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (data: { email: string; password: string; username: string; name?: string }) =>
    api.post('/auth/register', data),

  logout: () => api.post('/auth/logout', {}),

  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh-token', { refreshToken }),

  getCurrentUser: () => api.get('/auth/me'),

  sendVerificationCode: (data: { email: string; type: string }) =>
    api.post('/auth/send-verification-code', data),

  verifyEmail: (data: { email: string; code: string }) =>
    api.post('/auth/verify-email', data),
};

// 用户 API
export const userApi = {
  updateProfile: (data: { name?: string; avatar?: string }) =>
    api.put('/user/profile', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/user/password', data),

  getLoginHistory: () => api.get('/user/login-history'),

  getDevices: () => api.get('/user/devices'),

  removeDevice: (id: string) => api.delete(`/user/devices/${id}`),

  deleteAccount: () => api.delete('/user/account'),
};

// 生物识别 API
export const biometricApi = {
  registerOptions: () =>
    api.post('/biometric/register/options', {}),

  verifyRegistration: (data: {
    id: string;
    rawId: string;
    response: any;
    type: string;
  }) => api.post('/biometric/register/verify', data),

  authOptions: (email: string) =>
    api.post('/biometric/auth/options', { email }),

  verifyAuthentication: (data: {
    email: string;
    id: string;
    rawId: string;
    response: any;
    type: string;
  }) => api.post('/biometric/auth/verify', data),

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
