'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { landingTranslations } from '@/lib/landingI18n';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';

interface LandingFooterProps {
  onRequestAccess: () => void;
}

export function LandingFooter({ onRequestAccess }: LandingFooterProps) {
  const { language } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const t = landingTranslations[language].footer;
  const cta = landingTranslations[language].ctaBanner;
  const isRtl = language === 'ar';

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-light)',
        background: 'var(--bg-surface)',
        paddingTop: '64px',
        paddingBottom: '48px',
      }}
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
        {/* Pre-Footer CTA Banner */}
        <div
          style={{
            borderRadius: '24px',
            background: 'var(--primary-gradient)',
            color: '#ffffff',
            padding: '48px 36px',
            textAlign: 'center',
            marginBottom: '64px',
            boxShadow: '0 16px 40px rgba(37, 99, 235, 0.28)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.18)',
              fontSize: '12.5px',
              fontWeight: 700,
              marginBottom: '16px',
            }}
          >
            <Sparkles size={14} />
            <span>{cta.badge}</span>
          </div>

          <h3
            style={{
              fontSize: 'clamp(26px, 3.6vw, 38px)',
              fontWeight: 900,
              maxWidth: '720px',
              margin: '0 auto 14px',
              lineHeight: 1.25,
            }}
          >
            {cta.title}
          </h3>

          <p
            style={{
              fontSize: '15.5px',
              opacity: 0.9,
              maxWidth: '580px',
              margin: '0 auto 30px',
              lineHeight: 1.6,
            }}
          >
            {cta.subtitle}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              flexWrap: 'wrap',
            }}
          >
            {isAuthenticated ? (
              <Link
                href="/workspace"
                style={{
                  padding: '13px 30px',
                  borderRadius: '12px',
                  background: '#ffffff',
                  color: 'var(--primary)',
                  fontWeight: 800,
                  fontSize: '14.5px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              >
                {language === 'ar' ? 'الدخول لمساحة عملك ←' : 'Open Your Workspace →'}
              </Link>
            ) : (
              <>
                <button
                  onClick={onRequestAccess}
                  style={{
                    padding: '13px 28px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#ffffff',
                    color: 'var(--primary)',
                    fontWeight: 800,
                    fontSize: '14.5px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                >
                  {cta.requestButton}
                </button>
                <Link
                  href="/auth/login"
                  style={{
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.4)',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '14.5px',
                    textDecoration: 'none',
                  }}
                >
                  {cta.loginButton}
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Brand & Links Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '40px',
            marginBottom: '48px',
          }}
        >
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: 'var(--primary-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <Layers size={18} />
              </div>
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>SyncUp</span>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '320px', margin: '0 0 16px' }}>
              {t.brandDesc}
            </p>
            {/* System Status Indicator */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--success-bg)',
                border: '1px solid var(--success-border)',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--success-text)',
              }}
            >
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--success)' }} />
              <span>{t.platformStatus}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
              {t.linksTitle}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              <a href="#features" style={{ textDecoration: 'none' }}>Features</a>
              <a href="#comparison" style={{ textDecoration: 'none' }}>Comparison</a>
              <a href="#workflow" style={{ textDecoration: 'none' }}>Workflow</a>
              <a href="#security" style={{ textDecoration: 'none' }}>Security</a>
              <a href="#faq" style={{ textDecoration: 'none' }}>FAQ</a>
            </div>
          </div>

          {/* Security & Access Architecture */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
              {t.securityTitle}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
                <span>Isolated PostgreSQL Schema / Tenant</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
                <span>Invitation-Only Access Tokens</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
                <span>Socket.IO Real-time Channels</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
                <span>Platform Owner RBAC Controls</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-light)',
            paddingTop: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '12.5px',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            © {new Date().getFullYear()} SyncUp Platform. {t.allRights}
          </div>
          <div>{t.privacyNote}</div>
        </div>
      </div>
    </footer>
  );
}
