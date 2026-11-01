'use client';

import React from 'react';
import { ShieldCheck, UserCheck, Key, Lock, Server, Cpu, Database, Network } from 'lucide-react';
import { landingTranslations } from '@/lib/landingI18n';
import { useUIStore } from '@/store/uiStore';

export function SecurityWorkflowSection() {
  const { language } = useUIStore();
  const t = landingTranslations[language].howItWorks;
  const isRtl = language === 'ar';

  return (
    <section
      id="workflow"
      style={{
        padding: '96px 20px',
        maxWidth: '1240px',
        margin: '0 auto',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '56px' }}>
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
          <ShieldCheck size={14} />
          <span>{t.badge}</span>
        </div>
        <h2
          style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
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

      {/* 3 Step Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '64px',
        }}
      >
        {t.steps.map((step, idx) => (
          <div
            key={idx}
            style={{
              padding: '34px 28px',
              borderRadius: '20px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              textAlign: isRtl ? 'right' : 'left',
            }}
          >
            <div
              style={{
                fontSize: '36px',
                fontWeight: 900,
                color: 'var(--primary)',
                opacity: 0.35,
                lineHeight: 1,
                marginBottom: '18px',
                fontFamily: 'var(--font-family-mono)',
              }}
            >
              {step.number}
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>
              {step.title}
            </h3>

            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Deep Dive Security Blueprint Box */}
      <div
        id="security"
        style={{
          padding: '42px 36px',
          borderRadius: '24px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-md)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '28px',
        }}
      >
        <div style={{ display: 'flex', gap: '16px' }}>
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
              flexShrink: 0,
            }}
          >
            <Database size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
              {language === 'ar' ? 'عزل كامل لقواعد البيانات' : 'Strict Multi-Tenancy'}
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              {language === 'ar'
                ? 'استعلامات مفلترة بالـ Organization ID حصرياً مع حماية تامة ضد تسرب البيانات.'
                : 'Zero cross-tenant contamination. Every database query enforces company-scoped isolation.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'var(--success-bg)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Lock size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
              {language === 'ar' ? 'دعوات بـ Token مشفرة' : 'Zero Open Signups'}
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              {language === 'ar'
                ? 'لا يمكن لأي طرف خارجي التسجيل دون مصادقة ودعوة مباشرة من إدارة المنصة.'
                : 'No public signup vulnerability. Access is granted solely via authorized invitations.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'var(--purple-bg)',
              color: 'var(--purple)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Network size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
              {language === 'ar' ? 'مزامنة لحظية عبر WebSocket' : 'Low-Latency Socket.IO'}
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              {language === 'ar'
                ? 'تبادل التحديثات في أجزاء من الثانية مع استهلاك خفيف للموارد وأداء استثنائي.'
                : 'Real-time WebSocket protocol handles team chats, card dragging, and voting under 30ms.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
