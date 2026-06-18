import React, { useState, useEffect } from 'react';
import { useToast } from '@shared/hooks/useToast';
import { achievementApi } from '../utils/api-extensions';
import './Achievements.css';

interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  userProgress: {
    progress: number;
    completed: boolean;
    completedAt: string | null;
  } | null;
}

const Achievements: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    setIsLoading(true);
    try {
      const response = await achievementApi.getAchievements();
      setAchievements(response.achievements);
      setTotalPoints(response.totalPoints);
    } catch (error) {
      console.error('获取成就失败:', error);
      showToast('error', '获取成就失败');
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressPercentage = (achievement: Achievement) => {
    if (!achievement.userProgress) return 0;
    if (achievement.userProgress.completed) return 100;
    // 根据成就类型计算进度
    return Math.min(achievement.userProgress.progress * 10, 100);
  };

  return (
    <div className="achievements">
      <div className="achievements-header">
        <h2>🏆 成就系统</h2>
        <div className="total-points">
          <span className="points-value">{totalPoints}</span>
          <span className="points-label">积分</span>
        </div>
      </div>

      <div className="achievements-grid">
        {isLoading ? (
          <div className="loading">加载中...</div>
        ) : (
          achievements.map(achievement => (
            <div
              key={achievement.id}
              className={`achievement-card ${achievement.userProgress?.completed ? 'completed' : ''}`}
            >
              <div className="achievement-icon">{achievement.icon}</div>
              <div className="achievement-info">
                <h3 className="achievement-name">{achievement.name}</h3>
                <p className="achievement-description">{achievement.description}</p>
                <div className="achievement-points">+{achievement.points} 积分</div>
                
                {achievement.userProgress?.completed ? (
                  <div className="achievement-status completed">
                    ✅ 已完成
                    {achievement.userProgress.completedAt && (
                      <span className="completed-date">
                        {new Date(achievement.userProgress.completedAt).toLocaleDateString('zh-CN')}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="achievement-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${getProgressPercentage(achievement)}%` }}
                      />
                    </div>
                    <span className="progress-text">
                      进度: {achievement.userProgress?.progress || 0}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Achievements;
