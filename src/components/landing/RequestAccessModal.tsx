'use client';

import React, { useState } from 'react';
import { X, Building, Mail, User, Users, FileText, CheckCircle2, Sparkles, Send } from 'lucide-react';
import { landingTranslations } from '@/lib/landingI18n';
import { Language } from '@/lib/i18n';
import { SyncUpLogo } from '@/components/shared/SyncUpLogo';

interface RequestAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export function RequestAccessModal({ isOpen, onClose, lang }: RequestAccessModalProps) {
  const t = landingTranslations[lang].requestModal;
  const isRtl = lang === 'ar';

  const [companyName, setCompanyName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [teamSize, setTeamSize] = useState(t.teamSizeOptions[0]);
  const [useCase, setUseCase] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate saving request to platform inquiries / lead store
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 900);
  };

  const handleReset = () => {
    setSubmitted(false);
    setCompanyName('');
    setAdminName('');
    setWorkEmail('');
    setUseCase('');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(9, 13, 22, 0.75)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '540px',
          background: 'var(--bg-surface)',
          borderRadius: '20px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '24px 28px 20px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            background: 'var(--bg-surface-elevated)',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11.5px',
                fontWeight: 700,
                color: 'var(--primary)',
                background: 'var(--primary-light)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                marginBottom: '8px',
              }}
            >
              <SyncUpLogo size={14} />
              <span>B2B Enterprise Provisioning</span>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              {t.title}
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px', margin: 0, lineHeight: 1.4 }}>
              {t.subtitle}
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px 28px', maxHeight: '78vh', overflowY: 'auto' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '20px 8px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'var(--success-bg)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 18px',
                  boxShadow: '0 0 24px rgba(16, 185, 129, 0.2)',
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h4 style={{ fontSize: '21px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
                {t.successTitle}
              </h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '420px', margin: '0 auto 24px' }}>
                {t.successDesc}
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-primary"
                style={{
                  background: 'var(--primary-gradient)',
                  color: '#fff',
                  padding: '10px 24px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                {t.successAction}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Company Name */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                  <Building size={14} style={{ color: 'var(--primary)' }} />
                  {t.companyName}
                </label>
                <input
                  required
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={t.companyNamePlaceholder}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    fontSize: '13.5px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Admin Name & Work Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                    <User size={14} style={{ color: 'var(--primary)' }} />
                    {t.adminName}
                  </label>
                  <input
                    required
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder={t.adminNamePlaceholder}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-app)',
                      color: 'var(--text-main)',
                      fontSize: '13.5px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                    <Mail size={14} style={{ color: 'var(--primary)' }} />
                    {t.workEmail}
                  </label>
                  <input
                    required
                    type="email"
                    value={workEmail}
                    onChange={(e) => setWorkEmail(e.target.value)}
                    placeholder={t.workEmailPlaceholder}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-app)',
                      color: 'var(--text-main)',
                      fontSize: '13.5px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Team Size */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                  <Users size={14} style={{ color: 'var(--primary)' }} />
                  {t.teamSize}
                </label>
                <select
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    fontSize: '13.5px',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {t.teamSizeOptions.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Use Case */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                  <FileText size={14} style={{ color: 'var(--primary)' }} />
                  {t.useCase}
                </label>
                <textarea
                  rows={3}
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  placeholder={t.useCasePlaceholder}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    fontSize: '13.5px',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Footer Actions */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  marginTop: '12px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-light)',
                }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-light)',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                  }}
                >
                  {t.close}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 22px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'var(--primary-gradient)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: 'var(--primary-glow)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {submitting ? (
                    <>
                      <div
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          border: '2px solid rgba(255,255,255,0.4)',
                          borderTopColor: '#fff',
                          animation: 'spin 0.8s linear infinite',
                        }}
                      />
                      <span>{t.submitting}</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />
                      <span>{t.submit}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
