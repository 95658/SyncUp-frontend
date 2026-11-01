'use client';

import React from 'react';
import { XCircle, CheckCircle2, SplitSquareVertical, Sparkles } from 'lucide-react';
import { landingTranslations } from '@/lib/landingI18n';
import { useUIStore } from '@/store/uiStore';

export function ComparisonSection() {
  const { language } = useUIStore();
  const t = landingTranslations[language].comparison;
  const isRtl = language === 'ar';

  return (
    <section
      id="comparison"
      style={{
        padding: '96px 20px',
        maxWidth: '1240px',
        margin: '0 auto',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '52px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            color: 'var(--primary)',
            fontSize: '12.5px',
            fontWeight: 700,
            marginBottom: '14px',
          }}
        >
          <SplitSquareVertical size={14} />
          <span>{t.badge}</span>
        </div>
        <h2
          style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 900,
            color: 'var(--text-main)',
            maxWidth: '780px',
            margin: '0 auto 16px',
            lineHeight: 1.25,
            letterSpacing: isRtl ? '0px' : '-0.8px',
          }}
        >
          {t.title}
        </h2>
        <p
          style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            maxWidth: '620px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          {t.subtitle}
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          maxWidth: '1080px',
          margin: '0 auto',
        }}
      >
        {/* Fragmented Stack Card */}
        <div
          style={{
            padding: '36px 30px',
            borderRadius: '20px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              {t.traditional.title}
            </h3>
            <span
              style={{
                fontSize: '11.5px',
                fontWeight: 700,
                color: 'var(--danger-text)',
                background: 'var(--danger-bg)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--danger-border)',
              }}
            >
              {t.traditional.badge}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
            {t.traditional.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <XCircle size={18} style={{ color: 'var(--danger)', marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SyncUp Unified Ecosystem Card (Hero Highlight) */}
        <div
          style={{
            padding: '36px 30px',
            borderRadius: '20px',
            background: 'var(--bg-surface)',
            border: '2px solid var(--primary)',
            boxShadow: '0 12px 32px rgba(37, 99, 235, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle gradient banner */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'var(--primary-gradient)',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
              {t.syncup.title}
            </h3>
            <span
              style={{
                fontSize: '11.5px',
                fontWeight: 700,
                color: 'var(--success-text)',
                background: 'var(--success-bg)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--success-border)',
              }}
            >
              {t.syncup.badge}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
            {t.syncup.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--success)', marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 600, lineHeight: 1.5 }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
