'use client';

import React from 'react';
import { useUIStore } from '@/store/uiStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { Bell, Calendar, CheckSquare, Sparkles, X, ExternalLink } from 'lucide-react';

export const NotificationDetailModal: React.FC = () => {
  const { viewingNotification, setViewingNotification, setNotificationOpen, language } = useUIStore();
  const { setCurrentView } = useWorkspaceStore();

  if (!viewingNotification) return null;

  const isAr = language === 'ar';

  const handleAction = () => {
    if (viewingNotification.entityType === 'task') {
      setCurrentView('tasks');
    } else if (viewingNotification.entityType === 'project') {
      setCurrentView('projects');
    } else if (viewingNotification.entityType === 'meeting') {
      setCurrentView('calendar');
    }
    setViewingNotification(null);
    setNotificationOpen(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9995,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={() => setViewingNotification(null)}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'var(--bg-surface)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-light)',
          animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span className="badge badge-primary" style={{ fontSize: '11px', fontWeight: 700 }}>
            {viewingNotification.type}
          </span>
          <button
            type="button"
            className="btn-ghost"
            style={{ padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
            onClick={() => setViewingNotification(null)}
          >
            <X size={18} />
          </button>
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
          {viewingNotification.title}
        </h3>

        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          {viewingNotification.createdAt}
        </div>

        <div
          style={{
            padding: '16px',
            background: 'var(--bg-app)',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            fontSize: '13.5px',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '24px',
          }}
        >
          {viewingNotification.body}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setViewingNotification(null)}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
          {viewingNotification.entityType && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAction}
              style={{ padding: '8px 18px', fontSize: '13px' }}
            >
              <ExternalLink size={15} />
              <span>
                {viewingNotification.entityType === 'task'
                  ? isAr ? 'فتح المهمة' : 'Open Task'
                  : viewingNotification.entityType === 'meeting'
                  ? isAr ? 'عرض بالتقويم' : 'View in Calendar'
                  : isAr ? 'فتح المشروع' : 'Open Project'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
