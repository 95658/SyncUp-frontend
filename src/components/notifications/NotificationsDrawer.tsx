'use client';

import React, { useEffect } from 'react';
import { useNotificationsStore, NotificationItem } from '@/store/notificationsStore';
import { useUIStore } from '@/store/uiStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import {
  Bell,
  CheckCheck,
  Check,
  X,
  Calendar,
  CheckSquare,
  Sparkles,
  ExternalLink,
  Inbox,
} from 'lucide-react';

export const NotificationsDrawer: React.FC = () => {
  const { isNotificationOpen, setNotificationOpen, setViewingNotification, language } = useUIStore();
  const { notifications, markAsRead, markAllAsRead, unreadCount, fetchNotifications } = useNotificationsStore();
  const { setCurrentView, setSelectedProjectId, selectTask } = useWorkspaceStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  if (!isNotificationOpen) return null;

  const isAr = language === 'ar';
  const unread = unreadCount();

  const handleOpenDetail = (notif: NotificationItem) => {
    markAsRead(notif.id);
    setViewingNotification(notif);
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'TASK_ASSIGNED':
      case 'TASK_UPDATED':
      case 'TASK_MENTIONED':
        return <CheckSquare size={16} color="#2563eb" />;
      case 'MEETING_INVITE':
        return <Calendar size={16} color="#8b5cf6" />;
      case 'PROJECT_INVITE':
        return <Sparkles size={16} color="#0284c7" />;
      default:
        return <Bell size={16} color="#f59e0b" />;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(2px)',
        zIndex: 9990,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={() => setNotificationOpen(false)}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          height: '100vh',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          animation: isAr ? 'slideInLeft 0.25s ease-out' : 'slideInRight 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={19} color="var(--primary)" />
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)' }}>
              {isAr ? 'الإشعارات والتنبيهات' : 'Notifications'}
            </h2>
            {unread > 0 && (
              <span
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '9999px',
                }}
              >
                {unread}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {unread > 0 && (
              <button
                type="button"
                className="btn-ghost"
                onClick={markAllAsRead}
                title={isAr ? 'تحديد الكل كمقروء' : 'Mark all as read'}
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <CheckCheck size={14} />
                <span>{isAr ? 'قراءة الكل' : 'Mark all read'}</span>
              </button>
            )}
            <button
              type="button"
              className="btn-ghost"
              style={{ padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
              onClick={() => setNotificationOpen(false)}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Inbox size={42} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
              <p style={{ fontSize: '14px', fontWeight: 600 }}>{isAr ? 'لا توجد إشعارات حالياً' : 'No notifications'}</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleOpenDetail(notif)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: notif.isRead ? 'var(--bg-surface)' : 'var(--bg-subtle)',
                  border: notif.isRead ? '1px solid var(--border-subtle)' : '1px solid var(--primary-border)',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '12px',
                  position: 'relative',
                  transition: 'background var(--transition-fast)',
                }}
              >
                {!notif.isRead && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: isAr ? 'auto' : '12px',
                      left: isAr ? '12px' : 'auto',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--primary)',
                    }}
                  />
                )}

                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {getIcon(notif.type)}
                </div>

                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: notif.isRead ? 600 : 800,
                      color: 'var(--text-main)',
                      marginBottom: '2px',
                      paddingRight: '12px',
                    }}
                  >
                    {notif.title}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {notif.body}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>
                    {notif.createdAt}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
