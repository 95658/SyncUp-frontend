'use client';

import React, { useState } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { showSnack } from '@/store/snackbarStore';
import { Building2, Sparkles, ArrowRight, ShieldCheck, Globe, Users, Briefcase } from 'lucide-react';

export const FirstOrgOnboarding: React.FC = () => {
  const { createOrganization } = useWorkspaceStore();
  const { currentUser } = useAuthStore();
  const { language } = useUIStore();
  const isAr = language === 'ar';

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [industry, setIndustry] = useState('Software Engineering');
  const [companySize, setCompanySize] = useState('11-50');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === name.toLowerCase().replace(/\s+/g, '-').slice(0, -1)) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await createOrganization({
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/\s+/g, '-'),
        industry,
        companySize,
        adminName: currentUser?.name || 'Owner',
        adminEmail: currentUser?.email || 'owner@company.com',
      });

      useWorkspaceStore.getState().setCurrentView('dashboard');

      showSnack(
        isAr ? `تم إنشاء مؤسسة "${name}" بنجاح! مرحباً بك كمالك للمؤسسة.` : `Organization "${name}" created successfully! You are now the Owner.`,
        'success'
      );
    } catch (err: any) {
      showSnack(err.message || 'Failed to create organization', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '36px',
          background: 'var(--bg-surface)',
          borderRadius: '24px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '26px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              margin: '0 auto 16px auto',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <Building2 size={32} />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            {isAr ? 'إنشاء مؤسستك الأولى' : 'Create Your Organization'}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
            {isAr
              ? 'مرحباً بك! لبدء استخدام مساحة العمل وإدارة المشاريع والسبرنتات، قم بإنشاء مؤسستك وتحديد هويتها.'
              : 'Welcome! To initialize your collaborative workspace, create your organization and configure your company domain.'}
          </p>
        </div>

        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
              {isAr ? 'اسم المؤسسة أو الشركة' : 'Organization Name'} *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Acme Corporation, Libro Studio"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-app)',
                color: 'var(--text-main)',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
              {isAr ? 'رابط مساحة العمل (Workspace URL Slug)' : 'Workspace URL Slug'} *
            </label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  padding: '11px 12px',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-light)',
                  borderRight: isAr ? '1px solid var(--border-light)' : 'none',
                  borderLeft: isAr ? 'none' : '1px solid var(--border-light)',
                  borderRadius: isAr ? '0 10px 10px 0' : '10px 0 0 10px',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                }}
              >
                syncup.io/org/
              </span>
              <input
                type="text"
                required
                placeholder="acme-corp"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                style={{
                  flex: 1,
                  padding: '11px 14px',
                  borderRadius: isAr ? '10px 0 0 10px' : '0 10px 10px 0',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-app)',
                  color: 'var(--text-main)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                {isAr ? 'مجال العمل' : 'Industry'}
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-app)',
                  color: 'var(--text-main)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              >
                <option value="Software Engineering">Software Engineering & SaaS</option>
                <option value="ERP & Enterprise">ERP & Enterprise Systems</option>
                <option value="UI/UX Design">UI/UX Design & Creative</option>
                <option value="Marketing">Marketing & Growth</option>
                <option value="Financial Services">Financial Services</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                {isAr ? 'حجم الفريق' : 'Team Size'}
              </label>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-app)',
                  color: 'var(--text-main)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              >
                <option value="1-10">1 - 10 members</option>
                <option value="11-50">11 - 50 members</option>
                <option value="51-200">51 - 200 members</option>
                <option value="201-500">201 - 500 members</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '13px 20px',
              fontSize: '14.5px',
              fontWeight: 800,
              borderRadius: '12px',
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <span>{isSubmitting ? (isAr ? 'جارِ إنشاء مساحة العمل...' : 'Creating Workspace...') : (isAr ? 'إنشاء المؤسسة وإطلاق مساحة العمل' : 'Create Organization & Launch Workspace')}</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
