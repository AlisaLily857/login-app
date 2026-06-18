import React from 'react';
import { useAuth } from '../hooks/useAuth';

type View = 'login' | 'register' | 'profile' | 'messages' | 'achievements' | 'stats';

interface NavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange, onLogout }) => {
  return (
    <nav className="app-nav">
      <button 
        className={`nav-item ${currentView === 'profile' ? 'active' : ''}`}
        onClick={() => onViewChange('profile')}
      >
        👤 个人资料
      </button>
      <button 
        className={`nav-item ${currentView === 'messages' ? 'active' : ''}`}
        onClick={() => onViewChange('messages')}
      >
        📬 消息中心
      </button>
      <button 
        className={`nav-item ${currentView === 'achievements' ? 'active' : ''}`}
        onClick={() => onViewChange('achievements')}
      >
        🏆 成就
      </button>
      <button 
        className={`nav-item ${currentView === 'stats' ? 'active' : ''}`}
        onClick={() => onViewChange('stats')}
      >
        📊 统计
      </button>
      <button className="nav-item logout" onClick={onLogout}>
        🚪 退出
      </button>
    </nav>
  );
};