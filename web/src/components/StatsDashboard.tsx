import React, { useState, useEffect } from 'react';
import { useToast } from '@shared/hooks/useToast';
import { statsApi } from '../utils/api-extensions';
import './StatsDashboard.css';

interface LoginHistory {
  createdAt: string;
  ipAddress: string;
  deviceType: string;
  location: string;
}

interface DeviceDistribution {
  type: string;
  _count: { type: number };
}

const StatsDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await statsApi.getUserStats();
      setStats(response);
    } catch (error) {
      console.error('获取统计失败:', error);
      showToast('error', '获取统计数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const getSecurityLevel = (score: number) => {
    if (score >= 80) return { label: '优秀', color: '#4caf50' };
    if (score >= 60) return { label: '良好', color: '#ff9800' };
    if (score >= 40) return { label: '一般', color: '#ff5722' };
    return { label: '危险', color: '#f44336' };
  };

  if (isLoading) {
    return <div className="stats-dashboard loading">加载中...</div>;
  }

  if (!stats) {
    return <div className="stats-dashboard">暂无数据</div>;
  }

  const { overview, loginHistory, deviceDistribution, hourlyDistribution } = stats;
  const securityLevel = getSecurityLevel(overview.securityScore);

  return (
    <div className="stats-dashboard">
      <h2>📊 数据统计</h2>

      {/* 概览卡片 */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-value">{overview.totalLogins}</div>
          <div className="stat-label">总登录次数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{overview.todayLogins}</div>
          <div className="stat-label">今日登录</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{overview.deviceCount}</div>
          <div className="stat-label">设备数量</div>
        </div>
        <div className="stat-card security">
          <div className="stat-value" style={{ color: securityLevel.color }}>
            {overview.securityScore}
          </div>
          <div className="stat-label">安全评分 ({securityLevel.label})</div>
        </div>
      </div>

      {/* 设备分布 */}
      <div className="stats-section">
        <h3>设备分布</h3>
        <div className="device-distribution">
          {deviceDistribution?.map((device: DeviceDistribution) => (
            <div key={device.type} className="device-item">
              <div className="device-icon">
                {device.type === 'DESKTOP' ? '🖥️' : 
                 device.type === 'MOBILE' ? '📱' : '📱'}
              </div>
              <div className="device-info">
                <div className="device-type">
                  {device.type === 'DESKTOP' ? '桌面端' : 
                   device.type === 'MOBILE' ? '移动端' : '平板'}
                </div>
                <div className="device-count">{device._count.type} 台</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 最近登录 */}
      <div className="stats-section">
        <h3>最近登录</h3>
        <div className="login-history">
          {loginHistory?.slice(0, 10).map((login: LoginHistory, index: number) => (
            <div key={index} className="login-item">
              <div className="login-time">
                {new Date(login.createdAt).toLocaleString('zh-CN')}
              </div>
              <div className="login-details">
                <span className="login-ip">{login.ipAddress}</span>
                <span className="login-location">{login.location || '未知位置'}</span>
                <span className="login-device">{login.deviceType || '未知设备'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 时段分布 */}
      <div className="stats-section">
        <h3>登录时段分布</h3>
        <div className="hourly-distribution">
          {hourlyDistribution?.map((hour: any, index: number) => (
            <div key={index} className="hour-bar">
              <div className="hour-label">{hour.hour}:00</div>
              <div className="hour-progress">
                <div
                  className="hour-fill"
                  style={{ width: `${Math.min((hour.count / 10) * 100, 100)}%` }}
                />
              </div>
              <div className="hour-count">{hour.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
