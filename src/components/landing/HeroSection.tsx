'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Layers,
  CheckCircle2,
  Users,
  MessageSquare,
  Activity,
  Kanban,
} from 'lucide-react';
import { landingTranslations } from '@/lib/landingI18n';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';

interface HeroSectionProps {
  onRequestAccess: () => void;
}

export function HeroSection({ onRequestAccess }: HeroSectionProps) {
  const { language } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const t = landingTranslations[language].hero;
  const isRtl = language === 'ar';

  return (
    <section
      style={{
        position: 'relative',
        padding: '72px 20px 80px',
        maxWidth: '1240px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background glow */}
      <div
        style={{
          position: 'absolute',
          top: '-120px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '720px',
          height: '420px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--primary) 0%, rgba(37,99,235,0) 70%)',
          opacity: 0.15,
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Top Badge */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '28px',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text-secondary)',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--success)',
            boxShadow: '0 0 8px var(--success)',
          }}
        />
        <span>{t.badge}</span>
      </div>

      {/* Main Title */}
      <h1
        style={{
          position: 'relative',
          zIndex: 1,
          fontSize: 'clamp(32px, 5.2vw, 62px)',
          fontWeight: 900,
          lineHeight: 1.15,
          color: 'var(--text-main)',
          maxWidth: '920px',
          letterSpacing: isRtl ? '0px' : '-1.5px',
          marginBottom: '20px',
        }}
      >
        {t.titleStart}{' '}
        <span
          style={{
            background: 'var(--primary-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block',
          }}
        >
          {t.titleHighlight}
        </span>
      </h1>

      {/* Subtitle */}
      <p
        style={{
          position: 'relative',
          zIndex: 1,
          fontSize: 'clamp(15px, 1.8vw, 18px)',
          lineHeight: 1.6,
          color: 'var(--text-secondary)',
          maxWidth: '780px',
          margin: '0 auto 36px',
        }}
      >
        {t.subtitle}
      </p>

      {/* Dual CTA Buttons */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          flexWrap: 'wrap',
          marginBottom: '16px',
        }}
      >
        {isAuthenticated ? (
          <Link
            href="/workspace"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 32px',
              borderRadius: '12px',
              background: 'var(--primary-gradient)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '15.5px',
              textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)',
              transition: 'transform 0.15s ease',
            }}
          >
            <span>{t.openWorkspaceCta}</span>
          </Link>
        ) : (
          <>
            <button
              onClick={onRequestAccess}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 28px',
                borderRadius: '12px',
                border: 'none',
                background: 'var(--primary-gradient)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)',
                transition: 'all 0.15s ease',
              }}
            >
              <Sparkles size={18} />
              <span>{t.requestAccessCta}</span>
            </button>

            <Link
              href="/auth/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '13px 26px',
                borderRadius: '12px',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-surface)',
                color: 'var(--text-main)',
                fontWeight: 700,
                fontSize: '15px',
                textDecoration: 'none',
                boxShadow: 'var(--shadow-xs)',
                transition: 'background-color 0.15s ease',
              }}
            >
              <span>{t.signInCta}</span>
              <ArrowRight size={16} style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />
            </Link>
          </>
        )}
      </div>

      {/* Lock note */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12.5px',
          color: 'var(--text-muted)',
          fontWeight: 600,
          marginBottom: '54px',
        }}
      >
        <Lock size={13} style={{ color: 'var(--primary)' }} />
        <span>{t.invitationNote}</span>
      </div>

      {/* Stats Counter Grid */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '1040px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '54px',
        }}
      >
        <div
          style={{
            padding: '20px',
            borderRadius: '16px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--primary)', marginBottom: '4px' }}>
            {t.stats.tenants}
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {t.stats.tenantsLabel}
          </div>
        </div>

        <div
          style={{
            padding: '20px',
            borderRadius: '16px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--success)', marginBottom: '4px' }}>
            {t.stats.realtime}
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {t.stats.realtimeLabel}
          </div>
        </div>

        <div
          style={{
            padding: '20px',
            borderRadius: '16px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--purple)', marginBottom: '4px' }}>
            {t.stats.accessTier}
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {t.stats.accessTierLabel}
          </div>
        </div>

        <div
          style={{
            padding: '20px',
            borderRadius: '16px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-main)', marginBottom: '4px' }}>
            {t.stats.availability}
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {t.stats.availabilityLabel}
          </div>
        </div>
      </div>

      {/* Interactive Mockup Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '1100px',
          borderRadius: '20px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          boxShadow: '0 24px 60px -12px rgba(15, 23, 42, 0.25)',
          overflow: 'hidden',
          textAlign: isRtl ? 'right' : 'left',
        }}
      >
        {/* Mockup Window Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            background: 'var(--bg-surface-elevated)',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ff5f56' }} />
            <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ffbd2e' }} />
            <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#27c93f' }} />
          </div>
          <div
            style={{
              padding: '4px 16px',
              borderRadius: '6px',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-light)',
              fontSize: '11.5px',
              color: 'var(--text-muted)',
              fontWeight: 600,
            }}
          >
            https://syncup.app/workspace/projects/sprint-42
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--success)', fontWeight: 700 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
            <span>Socket.IO Connected</span>
          </div>
        </div>

        {/* Mockup Window Body (Simulated Workspace Dashboard) */}
        <div style={{ display: 'flex', minHeight: '380px' }}>
          {/* Mini Sidebar */}
          <div
            style={{
              width: '220px',
              background: 'var(--bg-app)',
              borderRight: isRtl ? 'none' : '1px solid var(--border-light)',
              borderLeft: isRtl ? '1px solid var(--border-light)' : 'none',
              padding: '18px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
            className="mockup-sidebar"
          >
            <div>
              <div style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                {language === 'ar' ? 'المشاريع النشطة' : 'ACTIVE PROJECTS'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ padding: '7px 10px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700, fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Kanban size={14} />
                  <span>Sprint Board 42</span>
                </div>
                <div style={{ padding: '7px 10px', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={14} />
                  <span>Mobile App v2</span>
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                {language === 'ar' ? 'قنوات المحادثة' : 'TEXT CHANNELS'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ padding: '6px 10px', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MessageSquare size={13} />
                  <span># general-dev</span>
                </div>
                <div style={{ padding: '6px 10px', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MessageSquare size={13} />
                  <span># sprint-releases</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Board Preview */}
          <div style={{ flex: 1, padding: '20px', background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Sprint 42: Core Architecture & Sockets
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Goal: Deliver real-time notifications & Kanban drag-drop
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ padding: '4px 10px', borderRadius: '6px', background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '11.5px', fontWeight: 700 }}>
                  24 Story Points
                </span>
                <span style={{ padding: '4px 10px', borderRadius: '6px', background: 'var(--success-bg)', color: 'var(--success)', fontSize: '11.5px', fontWeight: 700 }}>
                  Active Sprint
                </span>
              </div>
            </div>

            {/* Kanban Columns Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              {/* Column 1: In Progress */}
              <div style={{ background: 'var(--bg-app)', borderRadius: '12px', padding: '12px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{language === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</span>
                  <span style={{ background: 'var(--border-light)', padding: '1px 6px', borderRadius: '4px', fontSize: '11px' }}>2</span>
                </div>
                <div style={{ background: 'var(--bg-surface)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', marginBottom: '8px', boxShadow: 'var(--shadow-xs)' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 6px', borderRadius: '4px' }}>
                    DEV-108
                  </span>
                  <p style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)', margin: '6px 0 8px' }}>
                    Setup Redis BullMQ Consumer
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>High Priority</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>5 SP</span>
                  </div>
                </div>
              </div>

              {/* Column 2: In Review / QA */}
              <div style={{ background: 'var(--bg-app)', borderRadius: '12px', padding: '12px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{language === 'ar' ? 'المراجعة والاعتماد' : 'In Review / QA'}</span>
                  <span style={{ background: 'var(--border-light)', padding: '1px 6px', borderRadius: '4px', fontSize: '11px' }}>1</span>
                </div>
                <div style={{ background: 'var(--bg-surface)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-xs)' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--purple)', background: 'var(--purple-bg)', padding: '2px 6px', borderRadius: '4px' }}>
                    QA-44
                  </span>
                  <p style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)', margin: '6px 0 8px' }}>
                    Verify Multi-Tenant Organization Scope
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>PO Gate Locked</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>8 SP</span>
                  </div>
                </div>
              </div>

              {/* Column 3: Done */}
              <div style={{ background: 'var(--bg-app)', borderRadius: '12px', padding: '12px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{language === 'ar' ? 'المكتمل' : 'Done'}</span>
                  <span style={{ background: 'var(--border-light)', padding: '1px 6px', borderRadius: '4px', fontSize: '11px' }}>3</span>
                </div>
                <div style={{ background: 'var(--bg-surface)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-xs)' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--success)', background: 'var(--success-bg)', padding: '2px 6px', borderRadius: '4px' }}>
                    DEV-102
                  </span>
                  <p style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)', margin: '6px 0 8px' }}>
                    Planning Poker Fibonacci Engine
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 600 }}>Approved by PO</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>3 SP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .mockup-sidebar {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
