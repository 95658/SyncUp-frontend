'use client';

import React, { useState } from 'react';
import {
  Kanban,
  MessageSquare,
  Sparkles,
  Calendar,
  Shield,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Clock,
  Video,
  Send,
  Layers,
  FileCode,
} from 'lucide-react';
import { landingTranslations } from '@/lib/landingI18n';
import { useUIStore } from '@/store/uiStore';

export function FeatureShowcase() {
  const { language } = useUIStore();
  const t = landingTranslations[language].features;
  const isRtl = language === 'ar';

  const [activeTab, setActiveTab] = useState<'kanban' | 'chat' | 'estimation' | 'calendar' | 'security'>('kanban');

  const tabIcons = {
    kanban: Kanban,
    chat: MessageSquare,
    estimation: Sparkles,
    calendar: Calendar,
    security: Shield,
  };

  const currentTabContent = t.tabs[activeTab];

  return (
    <section
      id="features"
      style={{
        padding: '96px 20px',
        maxWidth: '1240px',
        margin: '0 auto',
      }}
    >
      {/* Section Header */}
      <div style={{ textAlign: 'center', marginBottom: '52px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            fontSize: '12.5px',
            fontWeight: 700,
            marginBottom: '14px',
          }}
        >
          <Sparkles size={14} />
          <span>{t.badge}</span>
        </div>
        <h2
          style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 900,
            color: 'var(--text-main)',
            maxWidth: '820px',
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
            maxWidth: '640px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          {t.subtitle}
        </p>
      </div>

      {/* Tab Navigation Pill Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '38px',
        }}
      >
        {(['kanban', 'chat', 'estimation', 'calendar', 'security'] as const).map((tabKey) => {
          const Icon = tabIcons[tabKey];
          const isSelected = activeTab === tabKey;
          return (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 20px',
                borderRadius: '12px',
                border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-light)',
                background: isSelected ? 'var(--primary)' : 'var(--bg-surface)',
                color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: isSelected ? 'var(--primary-glow)' : 'var(--shadow-xs)',
              }}
            >
              <Icon size={16} />
              <span>{t.tabs[tabKey].name}</span>
            </button>
          );
        })}
      </div>

      {/* Feature Showcase Grid: Left Info + Right Visual */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '28px',
          background: 'var(--bg-surface)',
          borderRadius: '24px',
          border: '1px solid var(--border-light)',
          padding: '40px',
          boxShadow: 'var(--shadow-lg)',
          alignItems: 'center',
        }}
      >
        {/* Left Column: Descriptions & Bullets */}
        <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
            }}
          >
            {React.createElement(tabIcons[activeTab], { size: 24 })}
          </div>

          <h3
            style={{
              fontSize: '25px',
              fontWeight: 800,
              color: 'var(--text-main)',
              lineHeight: 1.3,
              marginBottom: '14px',
            }}
          >
            {currentTabContent.title}
          </h3>

          <p
            style={{
              fontSize: '15px',
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
              marginBottom: '26px',
            }}
          >
            {currentTabContent.desc}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentTabContent.bullets.map((bullet, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle2
                  size={18}
                  style={{
                    color: 'var(--success)',
                    marginTop: '2px',
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 600 }}>
                  {bullet}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Custom Visual Interactive Component */}
        <div
          style={{
            background: 'var(--bg-app)',
            borderRadius: '18px',
            border: '1px solid var(--border-light)',
            padding: '24px',
            minHeight: '380px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {activeTab === 'kanban' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                  Active Sprint 42 • Kanban Workflow
                </span>
                <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700, background: 'var(--primary-light)', padding: '3px 8px', borderRadius: '4px' }}>
                  Fluid Drag & Drop
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 6px', borderRadius: '4px' }}>
                    DEV-204
                  </span>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', margin: '8px 0 6px' }}>
                    Socket.IO Reconnection Handler
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Assigned to Ahmed • 5 SP</div>
                </div>
                <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: '12px', border: '2px dashed var(--primary)', opacity: 0.9 }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--purple)', background: 'var(--purple-bg)', padding: '2px 6px', borderRadius: '4px' }}>
                    QA-99
                  </span>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', margin: '8px 0 6px' }}>
                    Approve Release Gate
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--purple)', fontWeight: 600 }}>PO Approval Required</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px', borderBottom: '1px solid var(--border-light)' }}>
                <MessageSquare size={16} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                  # project-syncup-core
                </span>
                <span style={{ fontSize: '11px', color: 'var(--success)', marginLeft: 'auto', fontWeight: 700 }}>
                  ● 8 active online
                </span>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--text-main)' }}>Ahmed (Lead)</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>14:52</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  PR #312 passed end-to-end tests. Ready for sprint estimation review.
                </p>
                <div style={{ display: 'inline-flex', gap: '4px', marginTop: '6px' }}>
                  <span style={{ background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: '6px', fontSize: '11px' }}>🚀 4</span>
                  <span style={{ background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: '6px', fontSize: '11px' }}>🔥 2</span>
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--text-main)' }}>Sarah (QA)</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>14:54</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  Merged and verified multi-tenant isolation! ✅
                </p>
              </div>
            </div>
          )}

          {activeTab === 'estimation' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '14px', textTransform: 'uppercase' }}>
                Planning Poker • Fibonacci Voting Deck
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '18px' }}>
                {[1, 2, 3, 5, 8, 13, 21].map((pts) => (
                  <div
                    key={pts}
                    style={{
                      width: '46px',
                      height: '64px',
                      borderRadius: '10px',
                      background: pts === 5 ? 'var(--primary)' : 'var(--bg-surface)',
                      color: pts === 5 ? '#ffffff' : 'var(--text-main)',
                      border: pts === 5 ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '18px',
                      boxShadow: pts === 5 ? 'var(--primary-glow)' : 'var(--shadow-xs)',
                    }}
                  >
                    <span>{pts}</span>
                    <span style={{ fontSize: '9px', opacity: 0.8 }}>pts</span>
                  </div>
                ))}
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '12px 18px', borderRadius: '12px', border: '1px solid var(--border-light)', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                <TrendingUp size={18} style={{ color: 'var(--success)' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                  Team Consensus: 5 Points • Projected Release: 4 Days
                </span>
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-main)' }}>
                  Upcoming Team Milestones
                </span>
                <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700 }}>Google Calendar Synced</span>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                    Daily Engineering Standup
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Today, 10:00 AM • Google Meet</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary-light)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>
                  <Video size={14} />
                  <span>Join Call</span>
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                    Sprint 42 Retrospective & Demo
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Friday, 3:00 PM • Main Channel</div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, background: 'var(--purple-bg)', color: 'var(--purple)', padding: '4px 8px', borderRadius: '6px' }}>
                  Milestone
                </span>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)' }}>
                <Shield size={18} style={{ color: 'var(--success)' }} />
                <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-main)' }}>
                  Multi-Tenant Database Isolation Engine
                </span>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-light)', fontFamily: 'var(--font-family-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <div style={{ color: 'var(--primary)', fontWeight: 700 }}>
                  // Automated Tenant Query Scoping
                </div>
                <div>SELECT * FROM &quot;Task&quot;</div>
                <div>WHERE &quot;organizationId&quot; = :currentOrgId</div>
                <div style={{ color: 'var(--success)', marginTop: '4px' }}>
                  ✓ Isolation Verified (0 Cross-Tenant Leakage)
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ background: 'var(--bg-surface)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                  🔒 Cryptographic Token Invites
                </div>
                <div style={{ background: 'var(--bg-surface)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                  🛡️ Immutable Audit Logging
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
