'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { landingTranslations } from '@/lib/landingI18n';
import { useUIStore } from '@/store/uiStore';

export function FAQSection() {
  const { language } = useUIStore();
  const t = landingTranslations[language].faq;
  const isRtl = language === 'ar';

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section
      id="faq"
      style={{
        padding: '96px 20px',
        maxWidth: '920px',
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
          <HelpCircle size={14} />
          <span>{t.badge}</span>
        </div>
        <h2
          style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 900,
            color: 'var(--text-main)',
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
            maxWidth: '560px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          {t.subtitle}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {t.items.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              style={{
                borderRadius: '16px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                overflow: 'hidden',
                transition: 'all 0.18s ease',
                boxShadow: isOpen ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <button
                onClick={() => toggle(idx)}
                style={{
                  width: '100%',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: isRtl ? 'right' : 'left',
                }}
              >
                <span
                  style={{
                    fontSize: '15.5px',
                    fontWeight: 700,
                    color: isOpen ? 'var(--primary)' : 'var(--text-main)',
                    lineHeight: 1.4,
                  }}
                >
                  {item.q}
                </span>
                <ChevronDown
                  size={18}
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    color: 'var(--text-muted)',
                    flexShrink: 0,
                  }}
                />
              </button>

              {isOpen && (
                <div
                  style={{
                    padding: '0 24px 22px',
                    fontSize: '14.5px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.65,
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '16px',
                    textAlign: isRtl ? 'right' : 'left',
                  }}
                >
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
