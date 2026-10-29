'use client';

import React from 'react';
import { useSnackbarStore, SnackbarItem } from '@/store/snackbarStore';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const SnackbarContainer: React.FC = () => {
  const { snackbars, hideSnackbar } = useSnackbarStore();

  if (snackbars.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '90vw',
        width: 'auto',
        pointerEvents: 'none',
      }}
    >
      {snackbars.map((item) => (
        <SnackbarCard key={item.id} item={item} onDismiss={() => hideSnackbar(item.id)} />
      ))}
    </div>
  );
};

const SnackbarCard: React.FC<{ item: SnackbarItem; onDismiss: () => void }> = ({ item, onDismiss }) => {
  const getIcon = () => {
    switch (item.type) {
      case 'success':
        return <CheckCircle2 size={18} color="#10b981" />;
      case 'error':
        return <AlertCircle size={18} color="#ef4444" />;
      case 'warning':
        return <AlertTriangle size={18} color="#f59e0b" />;
      default:
        return <Info size={18} color="#3b82f6" />;
    }
  };

  const getBorderColor = () => {
    switch (item.type) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      default:
        return '#3b82f6';
    }
  };

  return (
    <div
      style={{
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: '#1e293b',
        color: '#f8fafc',
        padding: '12px 18px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
        borderLeft: `4px solid ${getBorderColor()}`,
        minWidth: '320px',
        maxWidth: '520px',
        animation: 'snackbarSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        fontSize: '13.5px',
        fontWeight: 500,
      }}
    >
      <div style={{ flexShrink: 0 }}>{getIcon()}</div>
      <div style={{ flex: 1, lineHeight: 1.4 }}>{item.message}</div>

      {item.actionLabel && (
        <button
          type="button"
          onClick={() => {
            if (item.onAction) item.onAction();
            onDismiss();
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#38bdf8',
            fontWeight: 700,
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
          }}
        >
          {item.actionLabel}
        </button>
      )}

      <button
        type="button"
        onClick={onDismiss}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
};
