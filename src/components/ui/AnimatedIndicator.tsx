'use client';

import React from 'react';
import { useUIStore } from '@/store/uiStore';
import { useWorkspaceStore } from '@/store/workspaceStore';

export const AnimatedIndicator: React.FC = () => {
  const { isPageLoading } = useUIStore();
  const { isLoading: isWorkspaceLoading } = useWorkspaceStore();

  const active = isPageLoading || isWorkspaceLoading;

  if (!active) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        zIndex: 10001,
        overflow: 'hidden',
        background: 'rgba(37, 99, 235, 0.15)',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, #38bdf8 0%, #2563eb 50%, #818cf8 100%)',
          animation: 'topBarProgress 1.4s ease-in-out infinite',
        }}
      />
    </div>
  );
};
