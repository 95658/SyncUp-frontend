'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, CheckCircle2, Lock, User, ArrowRight, Shield } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { SyncUpLogo } from '@/components/shared/SyncUpLogo';
import { authApi } from '@/lib/api/auth';

export default function AcceptInvitationPage() {
  const router = useRouter();
  const { theme } = useUIStore();
  const isDark = theme === 'dark';
  const [token, setToken] = useState('');
  const [orgName, setOrgName] = useState('SyncUp Organization');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      const urlOrg = urlParams.get('org') || urlParams.get('orgName');
      if (urlToken) setToken(urlToken);
      if (urlOrg) setOrgName(decodeURIComponent(urlOrg));
    }
  }, []);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = fullName.trim();
    if (!cleanName) {
      setError('Please enter your full name');
      return;
    }

    if (password.length < 8) {
      setError('Must be at least 8 characters with a mix of letters and numbers.');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter.');
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number.');
      return;
    }

    setLoading(true);

    try {
      await authApi.acceptInvitation({
        token,
        fullName: cleanName,
        password,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/workspace');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation. The invitation may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, #f8fafc 0%, #eef2f6 100%)',
      padding: '24px',
    }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
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
            ? '0 8px 24px rgba(139, 0, 33, 0.45)'
            : '0 8px 20px -4px rgba(139, 0, 33, 0.2), 0 4px 10px rgba(139, 0, 33, 0.05)',
          margin: '0 auto 14px auto',
          padding: '8px',
        }}>
          <SyncUpLogo size={36} mode={theme} />
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
          Join your team on Sync<span style={{ color: 'var(--primary)' }}>Up</span>
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          You&apos;ve been invited to join the workspace. Set up your profile to continue.
        </p>
      </div>

      {/* Main Card */}
      <div className="card" style={{ width: '440px', maxWidth: '100%', padding: '32px', background: '#ffffff', boxShadow: 'var(--shadow-lg)' }}>
        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--success-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}>
              <CheckCircle2 size={32} color="var(--success)" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
              Account Activated!
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              Welcome to SyncUp! Taking you to your workspace now...
            </p>
          </div>
        ) : (
          <form onSubmit={handleAccept} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {error && (
              <div style={{
                padding: '10px 14px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-md)',
                color: '#b91c1c',
                fontSize: '13px',
                fontWeight: 600,
              }}>
                {error}
              </div>
            )}

            {/* Organization Tag */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
            }}>
              <Shield size={18} color="var(--primary)" />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Workspace Invitation
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {orgName}
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                Your Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Mohamed Ali"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    fontSize: '13.5px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                Create Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="password"
                  required
                  placeholder="Min 8 characters (1 uppercase, 1 number)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    fontSize: '13.5px',
                    outline: 'none',
                  }}
                />
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '6px' }}>
                Must be at least 8 characters with a mix of letters and numbers.
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '14px', marginTop: '6px' }}
            >
              <span>{loading ? 'Activating Account...' : 'Activate & Enter Workspace'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
