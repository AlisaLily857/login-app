const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// 请求配置
interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
}

// 响应类型
interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  details?: Array<{ field: string; message: string }>;
}

// 获取 token
const getToken = (): string | null => {
  return localStorage.getItem('access_token');
};

// 设置 token
const setToken = (token: string): void => {
  localStorage.setItem('access_token', token);
};

// 清除 token
const clearToken = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// 核心请求函数
async function request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  const { params, ...restConfig } = config;
  
  // 构建 URL
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  // 默认配置
  const defaultConfig: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // 添加认证头
  const token = getToken();
  if (token) {
    defaultConfig.headers = {
      ...defaultConfig.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  // 合并配置
  const finalConfig: RequestInit = {
    ...defaultConfig,
    ...restConfig,
    headers: {
      ...defaultConfig.headers,
      ...restConfig.headers,
    },
  };

  try {
    const response = await fetch(url, finalConfig);
    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      // 处理特定错误码
      if (response.status === 401) {
        // Token 过期，尝试刷新
        if (data.error === 'TOKEN_EXPIRED') {
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            // 重试原请求
            return request(endpoint, config);
          }
        }
        clearToken();
        window.location.href = '/login';
      }

      throw new Error(data.error || '请求失败');
    }

    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('网络请求失败');
  }
}

// 刷新令牌
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearToken();
      return false;
    }

    const data = await response.json();
    setToken(data.accessToken);
    return true;
  } catch {
    clearToken();
    return false;
  }
}

// HTTP 方法封装
export const api = {
  get: <T>(endpoint: string, params?: Record<string, string>) =>
    request<T>(endpoint, { method: 'GET', params }),

  post: <T>(endpoint: string, body: any) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body: any) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};

// 认证相关 API
export const authApi = {
  register: (data: { email: string; password: string; username: string; phone?: string }) =>
    api.post<{ user: any; tokens: { accessToken: string; refreshToken: string } }>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<{ user: any; tokens: { accessToken: string; refreshToken: string } }>('/auth/login', data),

  logout: () => api.post('/auth/logout', {}),

  refreshToken: (refreshToken: string) =>
    api.post<{ accessToken: string }>('/auth/refresh-token', { refreshToken }),

  sendVerificationCode: (data: { email: string; type: string }) =>
    api.post('/auth/send-verification-code', data),

  verifyEmail: (data: { email: string; code: string }) =>
    api.post('/auth/verify-email', data),

  getCurrentUser: () => api.get<{ user: any }>('/auth/me'),
};

// 用户相关 API
export const userApi = {
  updateProfile: (data: { name?: string; bio?: string; avatar?: string }) =>
    api.put('/user/profile', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/user/password', data),

  getLoginHistory: (params?: { page?: string; limit?: string }) =>
    api.get('/user/login-history', params),

  getDevices: () => api.get('/user/devices'),
  removeDevice: (deviceId: string) => api.delete(`/user/devices/${deviceId}`),
  trustDevice: (deviceId: string) => api.post(`/user/devices/${deviceId}/trust`, {}),
  deleteAccount: (data: { password: string }) => api.delete('/user/account'),
};

// 管理后台 API
export const adminApi = {
  getUsers: (params?: { page?: string; limit?: string; search?: string }) =>
    api.get('/admin/users', params),

  getUserById: (id: string) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id: string, data: { status: string }) => api.put(`/admin/users/${id}/status`, data),
  updateUserRole: (id: string, data: { role: string }) => api.put(`/admin/users/${id}/role`, data),

  getStats: () => api.get('/admin/stats'),
  getAuditLogs: (params?: { page?: string; limit?: string }) =>
    api.get('/admin/audit-logs', params),
};

export { getToken, setToken, clearToken };
