import React, { useState, useEffect } from 'react';
import { useToast } from '@shared/hooks/useToast';
import { messageApi } from '../utils/api-extensions';
import './MessageCenter.css';

interface Message {
  id: string;
  type: 'SYSTEM' | 'SECURITY' | 'ACTIVITY' | 'PROMOTION';
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  actionText?: string;
}

const MessageCenter: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { showToast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (filter === 'unread') params.isRead = 'false';

      const response = await messageApi.getMessages(params);
      setMessages(response.messages);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('获取消息失败:', error);
      showToast('error', '获取消息失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await messageApi.markAsRead(id);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === id ? { ...msg, isRead: true } : msg
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await messageApi.markAllAsRead();
      setMessages(prev =>
        prev.map(msg => ({ ...msg, isRead: true }))
      );
      setUnreadCount(0);
      showToast('success', '全部标记为已读');
    } catch (error) {
      console.error('标记全部已读失败:', error);
      showToast('error', '操作失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await messageApi.deleteMessage(id);
      setMessages(prev => prev.filter(msg => msg.id !== id));
      showToast('success', '消息已删除');
    } catch (error) {
      console.error('删除消息失败:', error);
      showToast('error', '删除失败');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SYSTEM': return '🔔';
      case 'SECURITY': return '🛡️';
      case 'ACTIVITY': return '📊';
      case 'PROMOTION': return '🎁';
      default: return '📌';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'SYSTEM': return '系统';
      case 'SECURITY': return '安全';
      case 'ACTIVITY': return '活动';
      case 'PROMOTION': return '推广';
      default: return '其他';
    }
  };

  return (
    <div className="message-center">
      <div className="message-header">
        <h2>
          消息中心
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </h2>
        <div className="message-actions">
          <button
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            全部
          </button>
          <button
            className={`filter-button ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            未读
          </button>
          {unreadCount > 0 && (
            <button className="mark-all-button" onClick={handleMarkAllAsRead}>
              全部已读
            </button>
          )}
        </div>
      </div>

      <div className="message-list">
        {isLoading ? (
          <div className="loading">加载中...</div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <p>暂无消息</p>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`message-item ${!message.isRead ? 'unread' : ''}`}
            >
              <div className="message-icon">
                {getTypeIcon(message.type)}
              </div>
              <div className="message-content">
                <div className="message-title">
                  <span className="type-label">{getTypeLabel(message.type)}</span>
                  {message.title}
                </div>
                <p className="message-text">{message.content}</p>
                <div className="message-meta">
                  <span className="message-time">
                    {new Date(message.createdAt).toLocaleString('zh-CN')}
                  </span>
                  {message.actionUrl && (
                    <a
                      href={message.actionUrl}
                      className="message-action"
                      onClick={() => handleMarkAsRead(message.id)}
                    >
                      {message.actionText || '查看详情'}
                    </a>
                  )}
                </div>
              </div>
              <div className="message-actions-right">
                {!message.isRead && (
                  <button
                    className="action-icon"
                    onClick={() => handleMarkAsRead(message.id)}
                    title="标记已读"
                  >
                    ✓
                  </button>
                )}
                <button
                  className="action-icon delete"
                  onClick={() => handleDelete(message.id)}
                  title="删除"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MessageCenter;
