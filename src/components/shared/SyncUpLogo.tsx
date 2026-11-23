'use client';

import React from 'react';
import { useUIStore } from '@/store/uiStore';

export interface SyncUpLogoProps {
  size?: number;
  mode?: 'light' | 'dark' | 'auto';
  className?: string;
  showText?: boolean;
  textColor?: string;
  badgeText?: string;
  withContainer?: boolean;
  containerBg?: string;
}

export const SyncUpLogo: React.FC<SyncUpLogoProps> = ({
  size = 32,
  mode = 'auto',
  className = '',
  showText = false,
  textColor,
  badgeText,
  withContainer = false,
  containerBg,
}) => {
  const currentTheme = useUIStore((s) => s.theme);
  const isDark = mode === 'auto' ? currentTheme === 'dark' : mode === 'dark';

  // Gradient definitions per mode
  const grad1Id = isDark ? 'syncDarkS1' : 'syncLightS1';
  const grad2Id = isDark ? 'syncDarkS2' : 'syncLightS2';

  const defaultContainerBg = isDark
    ? 'linear-gradient(135deg, #11151F 0%, #181E2B 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)';

  const defaultBorder = isDark
    ? '1px solid rgba(190, 18, 60, 0.25)'
    : '1px solid rgba(203, 213, 225, 0.8)';

  const defaultShadow = isDark
    ? '0 6px 20px -2px rgba(139, 0, 33, 0.35)'
    : '0 6px 18px -2px rgba(15, 23, 42, 0.08)';

  const computedTextColor = textColor
    ? textColor
    : isDark
    ? '#ffffff'
    : '#0f172a';

  const icon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
      className={className}
    >
      <defs>
        {isDark ? (
          <>
            <linearGradient id={grad1Id} x1="15%" y1="15%" x2="85%" y2="85%">
              <stop offset="0%" stopColor="#FB7185" />
              <stop offset="50%" stopColor="#E11D48" />
              <stop offset="100%" stopColor="#8B0021" />
            </linearGradient>
            <linearGradient id={grad2Id} x1="85%" y1="85%" x2="15%" y2="15%">
              <stop offset="0%" stopColor="#FDA4AF" />
              <stop offset="60%" stopColor="#BE123C" />
              <stop offset="100%" stopColor="#4C0519" />
            </linearGradient>
            <filter id="darkGlowFilt" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </>
        ) : (
          <>
            <linearGradient id={grad1Id} x1="15%" y1="15%" x2="85%" y2="85%">
              <stop offset="0%" stopColor="#E11D48" />
              <stop offset="50%" stopColor="#9F1239" />
              <stop offset="100%" stopColor="#8B0021" />
            </linearGradient>
            <linearGradient id={grad2Id} x1="85%" y1="85%" x2="15%" y2="15%">
              <stop offset="0%" stopColor="#F43F5E" />
              <stop offset="60%" stopColor="#BE123C" />
              <stop offset="100%" stopColor="#73001B" />
            </linearGradient>
            <filter id="lightDropShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#8B0021" floodOpacity="0.2" />
            </filter>
          </>
        )}
      </defs>

      <g filter={isDark ? undefined : 'url(#lightDropShadow)'}>
        {/* Top curved track */}
        <path
          d="M48 50 C40 45 32 40 32 30 C32 20 40 14 52 14 C64 14 72 21 72 32 L72 34"
          stroke={`url(#${grad1Id})`}
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Top connection node */}
        <circle cx="72" cy="34" r="7.5" fill={isDark ? '#FB7185' : '#E11D48'} />
        <circle cx="72" cy="34" r="3.5" fill="#FFFFFF" />

        {/* Bottom curved track */}
        <path
          d="M52 50 C60 55 68 60 68 70 C68 80 60 86 48 86 C36 86 28 79 28 68 L28 66"
          stroke={`url(#${grad2Id})`}
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Bottom connection node */}
        <circle cx="28" cy="66" r="7.5" fill={isDark ? '#FDA4AF' : '#8B0021'} />
        <circle cx="28" cy="66" r="3.5" fill="#FFFFFF" />

        {/* Central bridge */}
        <circle
          cx="50"
          cy="50"
          r="5"
          fill={isDark ? '#FFFFFF' : '#0F172A'}
          filter={isDark ? 'url(#darkGlowFilt)' : undefined}
        />
        {!isDark && <circle cx="50" cy="50" r="2" fill="#FFFFFF" />}
      </g>
    </svg>
  );

  const renderedIcon = withContainer ? (
    <div
      style={{
        width: `${size * 1.5}px`,
        height: `${size * 1.5}px`,
        borderRadius: `${Math.round(size * 0.42)}px`,
        background: containerBg || defaultContainerBg,
        border: defaultBorder,
        boxShadow: defaultShadow,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.25s ease',
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
  ) : (
    icon
  );

  if (!showText) {
    return renderedIcon;
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
      {renderedIcon}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span
          style={{
            fontSize: `${Math.round(size * 0.72)}px`,
            fontWeight: 800,
            color: computedTextColor,
            letterSpacing: '-0.5px',
          }}
        >
          Sync<span style={{ color: '#2563EB' }}>Up</span>
        </span>
        {badgeText && (
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: isDark ? '#94A3B8' : '#64748B',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              marginTop: '3px',
            }}
          >
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
};
