'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, LogIn } from 'lucide-react';
import { landingTranslations } from '@/lib/landingI18n';
import { useUIStore } from '@/store/uiStore';

interface LandingFooterProps {
  onRequestAccess: () => void;
}

export function LandingFooter({ onRequestAccess }: LandingFooterProps) {
  const { language } = useUIStore();
  const t = landingTranslations[language].footer;
  const cta = landingTranslations[language].ctaBanner;
  const isRtl = language === 'ar';

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-light)',
        background: 'var(--bg-surface)',
        paddingTop: '68px',
        paddingBottom: '48px',
      }}
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px' }}>
        {/* Pre-Footer CTA Banner with Glowing Animation */}
        <div
          style={{
            borderRadius: '26px',
            background: 'var(--primary-gradient)',
            color: '#ffffff',
            padding: '52px 36px',
            textAlign: 'center',
            marginBottom: '68px',
            boxShadow: '0 20px 48px rgba(37, 99, 235, 0.32)',
            position: 'relative',
            overflow: 'hidden',
          }}
          className="hover-lift"
        >
          {/* Subtle moving light sheen */}
          <div
            style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 60%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              fontSize: '13px',
              fontWeight: 700,
              marginBottom: '18px',
            }}
          >
            <Sparkles size={15} />
            <span>{cta.badge}</span>
          </div>

          <h3
            style={{
              fontSize: 'clamp(28px, 3.8vw, 42px)',
              fontWeight: 900,
              maxWidth: '760px',
              margin: '0 auto 16px',
              lineHeight: 1.25,
            }}
          >
            {cta.title}
          </h3>

          <p
            style={{
              fontSize: '16px',
              opacity: 0.92,
              maxWidth: '600px',
              margin: '0 auto 34px',
              lineHeight: 1.65,
            }}
          >
            {cta.subtitle}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={onRequestAccess}
              style={{
                padding: '14px 32px',
                borderRadius: '12px',
                border: 'none',
                background: '#ffffff',
                color: 'var(--primary)',
                fontWeight: 800,
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
                transition: 'transform 0.2s ease',
              }}
              className="hover-lift"
            >
              {cta.requestButton}
            </button>

            <Link
              href="/auth/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '13px 26px',
                borderRadius: '12px',
                border: '1.5px solid rgba(255,255,255,0.45)',
                background: 'rgba(255,255,255,0.12)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '15px',
                textDecoration: 'none',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease',
              }}
              className="hover-lift"
            >
              <LogIn size={16} />
              <span>{cta.loginButton}</span>
            </Link>
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
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--primary-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <Layers size={20} />
              </div>
              <span style={{ fontSize: '19px', fontWeight: 900, color: 'var(--text-main)' }}>SyncUp</span>
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
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--success)' }} className="animate-pulse-ring" />
              <span>{t.platformStatus}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
              {t.linksTitle}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              <a href="#features" className="nav-link">Features</a>
              <a href="#comparison" className="nav-link">Why SyncUp</a>
              <a href="#workflow" className="nav-link">Workflow</a>
              <a href="#security" className="nav-link">Security & Isolation</a>
              <a href="#faq" className="nav-link">FAQ</a>
            </div>
          </div>

          {/* Security & Access Architecture */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
              {t.securityTitle}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} style={{ color: 'var(--success)' }} />
                <span>Isolated PostgreSQL Schema / Tenant</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} style={{ color: 'var(--success)' }} />
                <span>Invitation-Only Access Tokens</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} style={{ color: 'var(--success)' }} />
                <span>Socket.IO Real-time Channels</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} style={{ color: 'var(--success)' }} />
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
