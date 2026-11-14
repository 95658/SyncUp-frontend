'use client';

import React, { useEffect, useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeatureShowcase } from '@/components/landing/FeatureShowcase';
import { ComparisonSection } from '@/components/landing/ComparisonSection';
import { SecurityWorkflowSection } from '@/components/landing/SecurityWorkflowSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { RequestAccessModal } from '@/components/landing/RequestAccessModal';

export default function LandingPage() {
  const { theme, language, initUIFromStorage } = useUIStore();
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initUIFromStorage();
  }, [initUIFromStorage]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', language);
    }
  }, [theme, language]);

  return (
    <div
      className="landing-grid-bg"
      style={{
        minHeight: '100vh',
        background: 'var(--bg-app)',
        color: 'var(--text-main)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'background-color 0.25s ease, color 0.25s ease',
        overflowX: 'hidden',
      }}
    >
      {/* Animated subtle ambient light beams in Burgundy tones */}
      <div
        style={{
          position: 'fixed',
          top: '-15%',
          left: '20%',
          width: '50vw',
          height: '50vw',
          maxWidth: '650px',
          maxHeight: '650px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,0,33,0.18) 0%, rgba(190,18,60,0.08) 45%, rgba(0,0,0,0) 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
        aria-hidden="true"
      />
      <div
        style={{
          position: 'fixed',
          bottom: '10%',
          right: '15%',
          width: '40vw',
          height: '40vw',
          maxWidth: '500px',
          maxHeight: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(225,29,72,0.14) 0%, rgba(139,0,33,0.06) 50%, rgba(0,0,0,0) 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
        aria-hidden="true"
      />

      {/* Main Navbar */}
      <LandingNavbar onRequestAccess={() => setRequestModalOpen(true)} />

      {/* Main Content Sections */}
      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <HeroSection onRequestAccess={() => setRequestModalOpen(true)} />
        <FeatureShowcase />
        <ComparisonSection />
        <SecurityWorkflowSection />
        <PricingSection onRequestAccess={() => setRequestModalOpen(true)} />
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
