'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Layers, Moon, Sun, Globe, ArrowRight, Menu, X, Sparkles, LogIn } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { landingTranslations } from '@/lib/landingI18n';

interface LandingNavbarProps {
  onRequestAccess: () => void;
}

export function LandingNavbar({ onRequestAccess }: LandingNavbarProps) {
  const { theme, language, toggleTheme, setLanguage } = useUIStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = landingTranslations[language].nav;
  const isRtl = language === 'ar';

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        backdropFilter: 'blur(20px)',
        background: theme === 'dark' ? 'rgba(9, 13, 22, 0.85)' : 'rgba(255, 255, 255, 0.88)',
        borderBottom: '1px solid var(--border-light)',
        transition: 'background-color 0.25s ease, border-color 0.25s ease',
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '0 24px',
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo with glowing hover */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
          }}
          className="brand-logo-group"
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: 'var(--primary-glow)',
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className="logo-icon-box"
          >
            <Layers size={22} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '20px',
                fontWeight: 900,
                color: 'var(--text-main)',
                letterSpacing: '-0.4px',
                lineHeight: 1.1,
              }}
            >
              {t.brandName}
            </span>
            <span
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}
            >
              {t.brandTagline}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links with animated hover underline */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '32px',
          }}
          className="desktop-nav"
        >
          <a href="#features" className="nav-link">
            {t.features}
          </a>
          <a href="#comparison" className="nav-link">
            {t.comparison}
          </a>
          <a href="#workflow" className="nav-link">
            {t.workflow}
          </a>
          <a href="#security" className="nav-link">
            {t.security}
          </a>
          <a href="#faq" className="nav-link">
            {t.faq}
          </a>
        </nav>

        {/* Controls: Lang + Theme + Login CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            title={language === 'en' ? 'التحويل للعربية' : 'Switch to English'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid var(--border-light)',
              background: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            className="hover-lift"
          >
            <Globe size={15} />
            <span>{language === 'en' ? 'العربية' : 'English'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              border: '1px solid var(--border-light)',
              background: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            className="hover-lift"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Primary Action Buttons: Always routes to Login or Request Access */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link
              href="/auth/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '10px',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-surface)',
                color: 'var(--text-main)',
                fontWeight: 700,
                fontSize: '13.5px',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              className="hover-lift"
            >
              <LogIn size={15} />
              <span>{t.signIn}</span>
            </Link>

            <button
              onClick={onRequestAccess}
              style={{
                display: 'none',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                border: 'none',
                background: 'var(--primary-gradient)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer',
                boxShadow: 'var(--primary-glow)',
                transition: 'all 0.2s ease',
              }}
              className="desktop-cta hover-lift"
            >
              <Sparkles size={15} />
              <span>{t.requestAccess}</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'flex',
              padding: '6px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              cursor: 'pointer',
            }}
            className="mobile-toggle"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            padding: '20px 24px 28px',
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
          className="animate-slide-down"
        >
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '15.5px', fontWeight: 600, color: 'var(--text-main)' }}
          >
            {t.features}
          </a>
          <a
            href="#comparison"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '15.5px', fontWeight: 600, color: 'var(--text-main)' }}
          >
            {t.comparison}
          </a>
          <a
            href="#workflow"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '15.5px', fontWeight: 600, color: 'var(--text-main)' }}
          >
            {t.workflow}
          </a>
          <a
            href="#security"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '15.5px', fontWeight: 600, color: 'var(--text-main)' }}
          >
            {t.security}
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '15.5px', fontWeight: 600, color: 'var(--text-main)' }}
          >
            {t.faq}
          </a>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onRequestAccess();
            }}
            style={{
              marginTop: '8px',
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: 'var(--primary-gradient)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '14.5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            <Sparkles size={16} />
            <span>{t.requestAccess}</span>
          </button>
        </div>
      )}

      <style>{`
        .brand-logo-group:hover .logo-icon-box {
          transform: scale(1.06) rotate(-3deg);
        }
        .nav-link {
          font-size: 14.5px;
          font-weight: 600;
          color: var(--text-secondary);
          transition: color 0.15s ease;
          position: relative;
          text-decoration: none;
        }
        .nav-link:hover {
          color: var(--primary);
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0%;
          height: 2px;
          background: var(--primary);
          transition: width 0.2s ease;
          border-radius: 2px;
        }
        .nav-link:hover::after {
          width: 100%;
        }
        @media (min-width: 860px) {
          .desktop-nav {
            display: flex !important;
          }
          .desktop-cta {
            display: inline-flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
