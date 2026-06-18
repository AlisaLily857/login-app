import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import BiometricAuth from '../BiometricAuth';

interface ProfileViewProps {
  onBiometricSuccess: (tokens: { accessToken: string; refreshToken: string }) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onBiometricSuccess }) => {
  const { user } = useAuth();

  return (
    <div className="profile-view">
      <div className="profile-header">
        <div className="profile-avatar">
          {user?.avatar ? (
            <img src={user.avatar} alt="avatar" />
          ) : (
            <div className="avatar-placeholder">{user?.name?.[0] || 'U'}</div>
          )}
        </div>
        <div className="profile-info">
          <h2>{user?.name || user?.username}</h2>
          <p>{user?.email}</p>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-item">
          <span className="stat-value">{user?.loginCount || 0}</span>
          <span className="stat-label">登录次数</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{user?.isEmailVerified ? '✅' : '❌'}</span>
          <span className="stat-label">邮箱验证</span>
        </div>
      </div>

      <BiometricAuth 
        email={user?.email || ''} 
        onSuccess={onBiometricSuccess} 
      />
    </div>
  );
};