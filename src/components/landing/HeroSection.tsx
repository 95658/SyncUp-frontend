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
  Check,
  Radio,
} from 'lucide-react';
import { landingTranslations } from '@/lib/landingI18n';
import { useUIStore } from '@/store/uiStore';

interface HeroSectionProps {
  onRequestAccess: () => void;
}

export function HeroSection({ onRequestAccess }: HeroSectionProps) {
  const { language } = useUIStore();
  const t = landingTranslations[language].hero;
  const isRtl = language === 'ar';

  return (
    <section
      style={{
        position: 'relative',
        padding: '76px 20px 88px',
        maxWidth: '1240px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      {/* Top Animated Pulse Badge */}
      <div
        className="animate-fade-in hover-lift"
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 20px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '30px',
          fontSize: '13.5px',
          fontWeight: 700,
          color: 'var(--text-secondary)',
          cursor: 'default',
        }}
      >
        <span
          className="animate-pulse-ring"
          style={{
            width: '9px',
            height: '9px',
            borderRadius: '50%',
            background: 'var(--primary)',
            display: 'inline-block',
          }}
        />
        <span>{t.badge}</span>
      </div>

      {/* Main Title with Animated Gradient Highlight */}
      <h1
        className="animate-fade-in"
        style={{
          position: 'relative',
          zIndex: 1,
          fontSize: 'clamp(34px, 5.5vw, 64px)',
          fontWeight: 900,
          lineHeight: 1.15,
          color: 'var(--text-main)',
          maxWidth: '960px',
          letterSpacing: isRtl ? '0px' : '-1.5px',
          marginBottom: '22px',
        }}
      >
        {t.titleStart}{' '}
        <span
          className="animate-gradient-text"
          style={{
            background: 'linear-gradient(135deg, #E11D48 0%, #FB7185 45%, #8B0021 100%)',
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
        className="animate-fade-in"
        style={{
          position: 'relative',
          zIndex: 1,
          fontSize: 'clamp(16px, 1.9vw, 19px)',
          lineHeight: 1.65,
          color: 'var(--text-secondary)',
          maxWidth: '800px',
          margin: '0 auto 40px',
        }}
      >
        {t.subtitle}
      </p>

      {/* Dual CTA Buttons — Always Routes to Login or Request Access */}
      <div
        className="animate-fade-in"
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '20px',
        }}
      >
        <button
          onClick={onRequestAccess}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '15px 32px',
            borderRadius: '14px',
            border: 'none',
            background: 'var(--primary-gradient)',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '15.5px',
            cursor: 'pointer',
            boxShadow: '0 10px 28px rgba(37, 99, 235, 0.38)',
            transition: 'all 0.25s ease',
          }}
          className="hover-lift"
        >
          <Sparkles size={18} />
          <span>{t.requestAccessCta}</span>
        </button>

        <Link
          href="/auth/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 28px',
            borderRadius: '14px',
            border: '1px solid var(--border-light)',
            background: 'var(--bg-surface)',
            color: 'var(--text-main)',
            fontWeight: 800,
            fontSize: '15.5px',
            textDecoration: 'none',
            boxShadow: 'var(--shadow-xs)',
            transition: 'all 0.25s ease',
          }}
          className="hover-lift"
        >
          <span>{t.signInCta}</span>
          <ArrowRight size={17} style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />
        </Link>
      </div>

      {/* Private Invitation-Only Guarantee */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          color: 'var(--text-muted)',
          fontWeight: 600,
          marginBottom: '60px',
        }}
      >
        <Lock size={14} style={{ color: 'var(--primary)' }} />
        <span>{t.invitationNote}</span>
      </div>

      {/* Metrics Cards with Hover Lift */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '1080px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '18px',
          marginBottom: '64px',
        }}
      >
        <div
          className="hover-lift"
          style={{
            padding: '24px 20px',
            borderRadius: '18px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'default',
          }}
        >
          <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--primary)', marginBottom: '6px' }}>
            {t.stats.tenants}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 700 }}>
            {t.stats.tenantsLabel}
          </div>
        </div>

        <div
          className="hover-lift"
          style={{
            padding: '24px 20px',
            borderRadius: '18px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'default',
          }}
        >
          <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--success)', marginBottom: '6px' }}>
            {t.stats.realtime}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 700 }}>
            {t.stats.realtimeLabel}
          </div>
        </div>

        <div
          className="hover-lift"
          style={{
            padding: '24px 20px',
            borderRadius: '18px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'default',
          }}
        >
          <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--purple)', marginBottom: '6px' }}>
            {t.stats.accessTier}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 700 }}>
            {t.stats.accessTierLabel}
          </div>
        </div>

        <div
          className="hover-lift"
          style={{
            padding: '24px 20px',
            borderRadius: '18px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'default',
          }}
        >
          <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-main)', marginBottom: '6px' }}>
            {t.stats.availability}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 700 }}>
            {t.stats.availabilityLabel}
          </div>
        </div>
      </div>

      {/* Interactive Mockup Container with Floating Dynamic Badges */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1120px',
        }}
      >
        {/* Floating Animation Card 1: Top Right */}
        <div
          className="animate-float"
          style={{
            position: 'absolute',
            top: '-24px',
            right: isRtl ? 'auto' : '-16px',
            left: isRtl ? '-16px' : 'auto',
            zIndex: 10,
            background: 'var(--bg-surface-elevated)',
            padding: '12px 18px',
            borderRadius: '14px',
            border: '1px solid var(--border-light)',
            boxShadow: '0 16px 36px rgba(15, 23, 42, 0.22)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--success-bg)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check size={16} />
          </div>
          <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--text-main)' }}>
              DEV-104 moved to In Review
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Socket.IO Live Broadcast</div>
          </div>
        </div>

        {/* Floating Animation Card 2: Bottom Left */}
        <div
          className="animate-float-reverse"
          style={{
            position: 'absolute',
            bottom: '-20px',
            left: isRtl ? 'auto' : '-16px',
            right: isRtl ? '-16px' : 'auto',
            zIndex: 10,
            background: 'var(--bg-surface-elevated)',
            padding: '12px 18px',
            borderRadius: '14px',
            border: '1px solid var(--border-light)',
            boxShadow: '0 16px 36px rgba(15, 23, 42, 0.22)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={16} />
          </div>
          <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--text-main)' }}>
              Sprint 42 Poker Consensus: 8 SP
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Automated Velocity Projection</div>
          </div>
        </div>

        {/* Browser Mockup Window */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            borderRadius: '22px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            boxShadow: '0 30px 80px -15px rgba(15, 23, 42, 0.3)',
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
              padding: '14px 20px',
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
                padding: '4px 18px',
                borderRadius: '8px',
                background: 'var(--bg-app)',
                border: '1px solid var(--border-light)',
                fontSize: '12px',
                color: 'var(--text-muted)',
                fontWeight: 600,
              }}
            >
              https://syncup.app/workspace/sprint-42
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--success)', fontWeight: 700 }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} className="animate-pulse-ring" />
              <span>Realtime Connected</span>
            </div>
          </div>

          {/* Mockup Window Body (Simulated Workspace Dashboard) */}
          <div style={{ display: 'flex', minHeight: '390px' }}>
            {/* Mini Sidebar */}
            <div
              style={{
                width: '230px',
                background: 'var(--bg-app)',
                borderRight: isRtl ? 'none' : '1px solid var(--border-light)',
                borderLeft: isRtl ? '1px solid var(--border-light)' : 'none',
                padding: '20px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
              }}
              className="mockup-sidebar"
            >
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
                  {language === 'ar' ? 'المشاريع النشطة' : 'ACTIVE PROJECTS'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ padding: '8px 12px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Kanban size={15} />
                    <span>Sprint Board 42</span>
                  </div>
                  <div style={{ padding: '8px 12px', borderRadius: '10px', color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={15} />
                    <span>Mobile App v2</span>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
                  {language === 'ar' ? 'قنوات المحادثة' : 'TEXT CHANNELS'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ padding: '7px 12px', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={14} />
                    <span># dev-releases</span>
                  </div>
                  <div style={{ padding: '7px 12px', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={14} />
                    <span># general</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Board Preview */}
            <div style={{ flex: 1, padding: '22px', background: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
                    Sprint 42: Core Architecture & Sockets
                  </h3>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    Goal: Deliver real-time notifications & Kanban drag-drop
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ padding: '5px 12px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '12px', fontWeight: 700 }}>
                    24 Story Points
                  </span>
                  <span style={{ padding: '5px 12px', borderRadius: '8px', background: 'var(--success-bg)', color: 'var(--success)', fontSize: '12px', fontWeight: 700 }}>
                    Active Sprint
                  </span>
                </div>
              </div>

              {/* Kanban Columns Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                {/* Column 1: In Progress */}
                <div style={{ background: 'var(--bg-app)', borderRadius: '14px', padding: '14px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{language === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</span>
                    <span style={{ background: 'var(--border-light)', padding: '2px 7px', borderRadius: '4px', fontSize: '11px' }}>2</span>
                  </div>
                  <div className="hover-lift" style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-light)', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: '4px' }}>
                      DEV-108
                    </span>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', margin: '8px 0' }}>
                      Setup Redis BullMQ Consumer
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      <span>High Priority</span>
                      <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>5 SP</span>
                    </div>
                  </div>
                </div>

                {/* Column 2: In Review / QA */}
                <div style={{ background: 'var(--bg-app)', borderRadius: '14px', padding: '14px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{language === 'ar' ? 'المراجعة والاعتماد' : 'In Review / QA'}</span>
                    <span style={{ background: 'var(--border-light)', padding: '2px 7px', borderRadius: '4px', fontSize: '11px' }}>1</span>
                  </div>
                  <div className="hover-lift" style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--purple)', background: 'var(--purple-bg)', padding: '2px 8px', borderRadius: '4px' }}>
                      QA-44
                    </span>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', margin: '8px 0' }}>
                      Verify Multi-Tenant Organization Scope
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      <span>PO Gate Locked</span>
                      <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>8 SP</span>
                    </div>
                  </div>
                </div>

                {/* Column 3: Done */}
                <div style={{ background: 'var(--bg-app)', borderRadius: '14px', padding: '14px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{language === 'ar' ? 'المكتمل' : 'Done'}</span>
                    <span style={{ background: 'var(--border-light)', padding: '2px 7px', borderRadius: '4px', fontSize: '11px' }}>3</span>
                  </div>
                  <div className="hover-lift" style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--success)', background: 'var(--success-bg)', padding: '2px 8px', borderRadius: '4px' }}>
                      DEV-102
                    </span>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', margin: '8px 0' }}>
                      Planning Poker Fibonacci Engine
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      <span style={{ color: 'var(--success)', fontWeight: 700 }}>Approved by PO</span>
                      <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>3 SP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mockup-sidebar {
            display: none !important;
          }
          .animate-float, .animate-float-reverse {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
