'use client';

import React from 'react';
import { useUIStore } from '@/store/uiStore';
import { authApi } from '@/lib/api/auth';
import { LogOut, AlertTriangle, X } from 'lucide-react';

export const LogoutConfirmModal: React.FC = () => {
  const { isLogoutConfirmOpen, setLogoutConfirmOpen, language } = useUIStore();

  if (!isLogoutConfirmOpen) return null;

  const isAr = language === 'ar';

  const handleConfirm = () => {
    setLogoutConfirmOpen(false);
    authApi.logout();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={() => setLogoutConfirmOpen(false)}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '420px',
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
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
            }}
          >
            <LogOut size={20} />
          </div>
          <button
            type="button"
            className="btn-ghost"
            style={{ padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
            onClick={() => setLogoutConfirmOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
          {isAr ? 'تأكيد تسجيل الخروج' : 'Confirm Sign Out'}
        </h3>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
          {isAr
            ? 'هل أنت متأكد من رغبتك في تسجيل الخروج من مساحة عمل سينك آب؟ سيتعين عليك إدخال بيانات الاعتماد مجدداً.'
            : 'Are you sure you want to sign out of your SyncUp workspace? You will need to log in again to access your projects.'}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setLogoutConfirmOpen(false)}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="button"
            className="btn"
            onClick={handleConfirm}
            style={{
              padding: '8px 18px',
              fontSize: '13px',
              background: '#ef4444',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
            }}
          >
            {isAr ? 'تأكيد الخروج' : 'Sign Out'}
          </button>
        </div>
      </div>
    </div>
  );
};
