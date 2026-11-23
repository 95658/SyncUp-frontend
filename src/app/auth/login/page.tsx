'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Lock, Mail, ArrowRight, Eye, EyeOff, Sun, Moon, Globe } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useUIStore } from '@/store/uiStore';
import { authApi } from '@/lib/api/auth';
import { SyncUpLogo } from '@/components/shared/SyncUpLogo';

export default function LoginPage() {
  const router = useRouter();
  const { loginUser, logoutUser } = useAuthStore();
  const { setCurrentView, syncFromBackend } = useWorkspaceStore();
  const { theme, toggleTheme, language, setLanguage } = useUIStore();
  const isDark = theme === 'dark';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Requirement 1: Clear any stale session whenever the login page is reached
  // Disarm forward navigation so user cannot swipe forward back into the account without logging in
  useEffect(() => {
    logoutUser();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('syncup_access_token');
      localStorage.removeItem('syncup_refresh_token');
      localStorage.removeItem('syncup_user');
      localStorage.removeItem('syncup_role');

      // Prevent forward navigation
      window.history.pushState(null, '', window.location.href);
      const onPopState = () => {
        window.history.pushState(null, '', window.location.href);
      };
      window.addEventListener('popstate', onPopState);
      return () => window.removeEventListener('popstate', onPopState);
    }
  }, [logoutUser]);

  const handleLogin = async (loginEmail = email, loginPassword = password) => {
    setLoading(true);
    setError('');

    try {
      const res = await authApi.login({ email: loginEmail, password: loginPassword });
      const isOwner = res.user.isPlatformOwner || loginEmail.toLowerCase().trim() === 'aabdelfatah732@gmail.com';

      if (isOwner) {
        const user = {
          id: res.user.id,
          name: res.user.fullName || 'Ahmed Abdelfatah',
          email: res.user.email,
          isPlatformOwner: true,
          status: 'ACTIVE' as const,
          jobTitle: 'Founder & Platform Owner',
        };
        loginUser(user, 'PLATFORM_OWNER', res.accessToken);
        setCurrentView('super-admin');
        await syncFromBackend();
        router.replace('/workspace');
        return;
      } else {
        await syncFromBackend();
        const currentOrgs = useWorkspaceStore.getState().organizations;
        const allSuspended = currentOrgs.length > 0 && currentOrgs.every((o) => o.status === 'SUSPENDED');
        if (allSuspended) {
          setError(
            'This organization has been suspended by the platform administrator. Access is restricted.'
          );
          logoutUser();
          setLoading(false);
          return;
        }

        const user = {
          id: res.user.id,
          name: res.user.fullName,
          email: res.user.email,
          isPlatformOwner: false,
          status: 'ACTIVE' as const,
          jobTitle: 'Organization Admin',
        };
        loginUser(user, 'ORG_ADMIN', res.accessToken);
        setCurrentView('dashboard');
        if (currentOrgs.length > 0) {
          useWorkspaceStore.getState().setActiveOrgId(currentOrgs[0].id);
        }
        router.replace('/workspace');
        return;
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Invalid email or password';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني للعمل' : 'Please enter your work email');
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail) || cleanEmail.length > 254) {
      setError(language === 'ar' ? 'صيغة البريد الإلكتروني غير صحيحة' : 'Invalid email address format');
      return;
    }
    if (!password) {
      setError(language === 'ar' ? 'يرجى إدخال كلمة المرور' : 'Please enter your password');
      return;
    }
    handleLogin(cleanEmail, password);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: isDark
        ? 'radial-gradient(ellipse at 50% 15%, #151A26 0%, #0B0E14 60%, #06080C 100%)'
        : 'radial-gradient(ellipse at 50% 15%, #fff1f2 0%, #f8fafc 55%, #e2e8f0 100%)',
      padding: '24px 16px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'background 0.3s ease',
    }}>
      {/* Top Floating Action Bar (Home, Language, Theme) */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '24px',
        right: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
      }}>
        <button
          type="button"
          onClick={() => router.push('/')}
          style={{
            background: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.85)',
            border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
            color: isDark ? '#cbd5e1' : '#475569',
            padding: '7px 14px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'all 0.2s ease',
          }}
        >
          <span>← {language === 'ar' ? 'الرئيسية' : 'Home'}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            style={{
              background: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.85)',
              border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
              color: isDark ? '#cbd5e1' : '#475569',
              padding: '7px 12px',
              borderRadius: '10px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s ease',
            }}
          >
            <Globe size={15} />
            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              background: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.85)',
              border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
              color: isDark ? '#facc15' : '#475569',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s ease',
            }}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </div>

      {/* Requirement 13: Modern Floating Ambient Animation Orbs */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-orb login-orb-3" />

      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '22px', zIndex: 1 }} className="login-header-animate">
        <div style={{
          width: '68px',
          height: '68px',
          borderRadius: '20px',
          background: isDark
            ? 'linear-gradient(135deg, #11151F 0%, #181E2B 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #fff1f2 100%)',
          border: isDark
            ? '1.5px solid rgba(225, 29, 72, 0.35)'
            : '1.5px solid rgba(254, 205, 211, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isDark
            ? '0 8px 30px rgba(139, 0, 33, 0.45), 0 2px 8px rgba(139, 0, 33, 0.25)'
            : '0 10px 25px -4px rgba(139, 0, 33, 0.2), 0 4px 12px rgba(139, 0, 33, 0.08)',
          margin: '0 auto 16px auto',
          padding: '12px',
          animation: 'pulseGlow 3s ease-in-out infinite',
          transition: 'all 0.3s ease',
        }}>
          <SyncUpLogo size={44} mode={theme} />
        </div>
        <h1 style={{
          fontSize: '30px',
          fontWeight: 800,
          color: isDark ? '#f8fafc' : '#0f172a',
          letterSpacing: '-0.7px',
          lineHeight: 1.2,
          transition: 'color 0.2s ease',
        }}>
          Welcome to Sync<span style={{ color: 'var(--primary)' }}>Up</span>
        </h1>
        <p style={{
          fontSize: '14.5px',
          color: isDark ? '#94a3b8' : '#64748b',
          marginTop: '6px',
          fontWeight: 500,
          transition: 'color 0.2s ease',
        }}>
          Private B2B SaaS Collaboration & Project Platform
        </p>
      </div>

      {/* Main Login Card */}
      <div className="card login-card-animate" style={{
        width: '460px',
        maxWidth: '100%',
        padding: '32px',
        background: isDark ? '#0f172a' : '#ffffff',
        borderRadius: '20px',
        border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
        boxShadow: isDark
          ? '0 12px 40px -5px rgba(0, 0, 0, 0.6), 0 20px 35px -10px rgba(37, 99, 235, 0.25)'
          : '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 25px 40px -10px rgba(37, 99, 235, 0.12)',
        zIndex: 1,
        transition: 'all 0.3s ease',
      }}>
        {error && (
          <div style={{
            padding: '12px 14px',
            background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
            border: isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #fecaca',
            color: isDark ? '#f87171' : '#b91c1c',
            fontSize: '13px',
            borderRadius: '10px',
            marginBottom: '18px',
            fontWeight: 600,
            animation: 'fadeIn 0.2s ease-out',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: isDark ? '#cbd5e1' : '#1e293b', marginBottom: '6px' }}>
              Work Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={17} color={isDark ? '#64748b' : '#94a3b8'} style={{ position: 'absolute', left: '14px', top: '13px', pointerEvents: 'none' }} />
              <input
                type="email"
                required
                maxLength={254}
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field login-input"
                style={{
                  paddingLeft: '40px',
                  height: '42px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  background: isDark ? '#1e293b' : '#ffffff',
                  border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
                  color: isDark ? '#ffffff' : '#0f172a',
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: isDark ? '#cbd5e1' : '#1e293b' }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isDark ? '#94a3b8' : '#64748b',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0,
                }}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={17} color={isDark ? '#64748b' : '#94a3b8'} style={{ position: 'absolute', left: '14px', top: '13px', pointerEvents: 'none' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                maxLength={128}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field login-input"
                style={{
                  paddingLeft: '40px',
                  paddingRight: '40px',
                  height: '42px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  letterSpacing: showPassword ? 'normal' : '2px',
                  background: isDark ? '#1e293b' : '#ffffff',
                  border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
                  color: isDark ? '#ffffff' : '#0f172a',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary login-btn-shine"
            style={{
              width: '100%',
              height: '44px',
              fontSize: '14.5px',
              fontWeight: 700,
              borderRadius: '10px',
              marginTop: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
            <ArrowRight size={17} />
          </button>
        </form>
      </div>

      <div style={{
        marginTop: '24px',
        fontSize: '12.5px',
        color: isDark ? '#64748b' : '#94a3b8',
        fontWeight: 500,
        zIndex: 1,
      }}>
        SyncUp B2B Collaboration Platform • Enterprise Edition 2026
      </div>

      {/* Embedded Styles for Login Animations */}
      <style>{`
        .login-card-animate {
          animation: cardSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .login-header-animate {
          animation: fadeInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes cardSlideUp {
          from {
            opacity: 0;
            transform: translateY(28px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 8px 25px rgba(37, 99, 235, 0.35), 0 2px 6px rgba(37, 99, 235, 0.2);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 12px 32px rgba(37, 99, 235, 0.55), 0 4px 10px rgba(37, 99, 235, 0.3);
            transform: scale(1.04);
          }
        }
        .login-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(50px);
          z-index: 0;
        }
        .login-orb-1 {
          width: 480px;
          height: 480px;
          top: -100px;
          right: -100px;
          background: radial-gradient(circle, rgba(139, 0, 33, 0.2) 0%, rgba(190, 18, 60, 0.08) 70%, transparent 100%);
          animation: floatOrb 12s ease-in-out infinite alternate;
        }
        .login-orb-2 {
          width: 400px;
          height: 400px;
          bottom: -80px;
          left: -80px;
          background: radial-gradient(circle, rgba(225, 29, 72, 0.15) 0%, rgba(139, 0, 33, 0.05) 70%, transparent 100%);
          animation: floatOrb 10s ease-in-out infinite alternate-reverse;
        }
        .login-orb-3 {
          width: 320px;
          height: 320px;
          top: 40%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(251, 113, 133, 0.08) 0%, transparent 70%);
          animation: pulseOrb 8s ease-in-out infinite;
        }
        @keyframes floatOrb {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, 30px) scale(1.08); }
        }
        @keyframes pulseOrb {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.9; transform: translate(-50%, -50%) scale(1.15); }
        }
        .login-btn-shine:hover {
          filter: brightness(1.05);
          box-shadow: 0 4px 18px rgba(139, 0, 33, 0.4);
        }
      `}</style>
    </div>
  );
}
