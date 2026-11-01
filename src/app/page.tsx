'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, User } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeatureShowcase } from '@/components/landing/FeatureShowcase';
import { ComparisonSection } from '@/components/landing/ComparisonSection';
import { SecurityWorkflowSection } from '@/components/landing/SecurityWorkflowSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { RequestAccessModal } from '@/components/landing/RequestAccessModal';

export default function LandingPage() {
  const { theme, language, initUIFromStorage } = useUIStore();
  const { isAuthenticated, currentUser, checkAuth } = useAuthStore();
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initUIFromStorage();
    checkAuth();
  }, [initUIFromStorage, checkAuth]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', language);
    }
  }, [theme, language]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-app)',
        color: 'var(--text-main)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'background-color 0.2s ease, color 0.2s ease',
      }}
    >
      {/* Top Banner if already authenticated */}
      {mounted && isAuthenticated && currentUser && (
        <div
          style={{
            background: 'var(--primary-gradient)',
            color: '#ffffff',
            padding: '8px 20px',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User size={14} />
            <span>
              {language === 'ar'
                ? `مرحباً ${currentUser.name || 'بك'}! أنت مسجل الدخول حالياً`
                : `Logged in as ${currentUser.name || currentUser.email}`}
            </span>
          </div>
          <Link
            href="/workspace"
            style={{
              background: '#ffffff',
              color: 'var(--primary)',
              padding: '3px 12px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              fontSize: '12px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>{language === 'ar' ? 'الدخول لمساحة العمل' : 'Enter Workspace'}</span>
            <ArrowRight size={12} style={{ transform: language === 'ar' ? 'scaleX(-1)' : 'none' }} />
          </Link>
        </div>
      )}

      {/* Main Navbar */}
      <LandingNavbar onRequestAccess={() => setRequestModalOpen(true)} />

      {/* Main Content Sections */}
      <main style={{ flex: 1 }}>
        <HeroSection onRequestAccess={() => setRequestModalOpen(true)} />
        <FeatureShowcase />
        <ComparisonSection />
        <SecurityWorkflowSection />
        <FAQSection />
      </main>

      {/* Footer */}
      <LandingFooter onRequestAccess={() => setRequestModalOpen(true)} />

      {/* Interactive B2B Company Request Modal */}
      <RequestAccessModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        lang={language}
      />
    </div>
  );
}
