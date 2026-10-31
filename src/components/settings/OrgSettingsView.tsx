'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { showSnack } from '@/store/snackbarStore';
import { organizationsApi } from '@/lib/api';
import {
  Building2,
  Shield,
  Sliders,
  Users,
  Lock,
  Globe,
  Clock,
  Save,
  AlertTriangle,
  Mail,
  Zap,
  Check,
  CreditCard,
  Layers,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export const OrgSettingsView: React.FC = () => {
  const { organizations, activeOrgId, setActiveOrgId } = useWorkspaceStore();
  const { currentUser, activeRole } = useAuthStore();
  const { language } = useUIStore();
  const isAr = language === 'ar';

  if (organizations.length === 0) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center', maxWidth: '480px', margin: '0 auto' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', margin: '0 auto 16px auto', boxShadow: 'var(--shadow-md)' }}>
          <Building2 size={28} />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
          {isAr ? 'لا توجد مؤسسة حالياً' : 'No Organization Available'}
        </h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {isAr
            ? 'إنشاء وتعيين المؤسسات متاح حصرياً لمالك المنصة (Platform Owner).'
            : 'Organization provisioning is strictly restricted to the Platform Owner.'}
        </p>
      </div>
    );
  }

  const currentOrg = organizations.find((o) => o.id === activeOrgId) || organizations[0];

  const [activeTab, setActiveTab] = useState<'general' | 'workflow' | 'security' | 'billing'>('general');
  const [orgName, setOrgName] = useState(currentOrg?.name || '');
  const [orgSlug, setOrgSlug] = useState(currentOrg?.slug || '');
  const [description, setDescription] = useState(currentOrg?.description || '');
  const [website, setWebsite] = useState((currentOrg as any)?.website || '');
  const [logoUrl, setLogoUrl] = useState((currentOrg as any)?.logoUrl || '');
  const [industry, setIndustry] = useState((currentOrg as any)?.industry || 'Software Engineering');
  const [companySize, setCompanySize] = useState((currentOrg as any)?.companySize || '11-50');
  const [defaultSprintDuration, setDefaultSprintDuration] = useState('2_WEEKS');
  const [estimationScale, setEstimationScale] = useState('FIBONACCI');
  const [allowedDomains, setAllowedDomains] = useState(currentOrg?.slug ? `@${currentOrg.slug}.com` : '@company.com');
  const [enforce2FA, setEnforce2FA] = useState(true);
  const [invitePolicy, setInvitePolicy] = useState('ADMINS_ONLY');
  const [qaEnforce, setQaEnforce] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingBackend, setIsLoadingBackend] = useState(false);

  // Fetch settings from backend API on mount or org switch
  useEffect(() => {
    if (!currentOrg?.id) return;
    let isMounted = true;

    async function loadSettings() {
      setIsLoadingBackend(true);
      try {
        const data = await organizationsApi.getSettings(currentOrg.id);
        if (isMounted && data) {
          if (data.name) setOrgName(data.name);
          if (data.slug) setOrgSlug(data.slug);
          if (data.description !== undefined) setDescription(data.description || '');
          if (data.website !== undefined) setWebsite(data.website || '');
          if (data.logoUrl !== undefined) setLogoUrl(data.logoUrl || '');
          if (data.industry) setIndustry(data.industry);
          if (data.companySize) setCompanySize(data.companySize);
          if (data.defaultSprintDuration) setDefaultSprintDuration(data.defaultSprintDuration);
          if (data.estimationScale) setEstimationScale(data.estimationScale);
          if (data.allowedDomains) setAllowedDomains(data.allowedDomains);
          if (data.enforce2FA !== undefined) setEnforce2FA(data.enforce2FA);
          if (data.invitePolicy) setInvitePolicy(data.invitePolicy);
          if (data.qaEnforce !== undefined) setQaEnforce(data.qaEnforce);
        }
      } catch (err) {
        // Standalone fallback: use stored values in currentOrg
        if (isMounted) {
          setOrgName(currentOrg.name || '');
          setOrgSlug(currentOrg.slug || '');
          setDescription(currentOrg.description || '');
        }
      } finally {
        if (isMounted) setIsLoadingBackend(false);
      }
    }

    loadSettings();
    return () => {
      isMounted = false;
    };
  }, [currentOrg?.id]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showSnack(isAr ? 'حجم الصورة يجب ألا يتجاوز 2 ميجابايت' : 'Image size must be less than 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setLogoUrl(base64);
        showSnack(isAr ? 'تم تحميل الشعار بنجاح' : 'Logo uploaded successfully', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg) return;
    setIsSaving(true);

    const payload = {
      name: orgName.trim(),
      slug: orgSlug.trim().toLowerCase(),
      description: description.trim(),
      website: website.trim(),
      logoUrl: logoUrl || undefined,
      industry,
      companySize,
      defaultSprintDuration,
      estimationScale,
      allowedDomains: allowedDomains.trim(),
      enforce2FA,
      invitePolicy,
      qaEnforce,
    };

    try {
      // 1. Try Backend API
      await organizationsApi.updateSettings(currentOrg.id, payload).catch(() => null);

      // 2. Update local state & localStorage for immediate UI responsiveness
      useWorkspaceStore.setState((state) => {
        const updated = state.organizations.map((o) =>
          o.id === currentOrg.id
            ? { ...o, ...payload }
            : o
        );
        if (typeof window !== 'undefined') {
          localStorage.setItem('syncup_orgs', JSON.stringify(updated));
        }
        return { organizations: updated };
      });

      showSnack(
        isAr ? 'تم حفظ إعدادات المؤسسة بنجاح' : 'Organization settings saved successfully!',
        'success'
      );
    } catch (err: any) {
      showSnack(err?.message || 'Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: '32px 36px', maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.2s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'var(--primary-light)', borderRadius: '9999px', marginBottom: '8px' }}>
            <Building2 size={13} color="var(--primary)" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.04em' }}>
              ORGANIZATION CONTROL & GOVERNANCE
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.6px' }}>
            {isAr ? 'إعدادات المؤسسة ومساحة العمل' : 'Organization Settings'}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {isAr
              ? `إدارة الهوية، نطاق العمل، إعدادات السبرنت، والأمان لمؤسسة ${currentOrg.name}.`
              : `Manage identity, workflow defaults, sprint estimation scales, and governance policies for ${currentOrg.name}.`}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn btn-secondary"
            title="Refresh settings"
            style={{ padding: '9px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px' }}
          >
            <RefreshCw size={14} className={isLoadingBackend ? 'animate-spin' : ''} />
            <span>{isAr ? 'تحديث' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '2px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          style={{
            padding: '10px 18px',
            fontSize: '13.5px',
            fontWeight: 700,
            border: 'none',
            background: 'transparent',
            color: activeTab === 'general' ? 'var(--primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'general' ? '2px solid var(--primary)' : '2px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Building2 size={16} />
          <span>{isAr ? 'الهوية والمعلومات العامة' : 'General & Branding'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('workflow')}
          style={{
            padding: '10px 18px',
            fontSize: '13.5px',
            fontWeight: 700,
            border: 'none',
            background: 'transparent',
            color: activeTab === 'workflow' ? 'var(--primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'workflow' ? '2px solid var(--primary)' : '2px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Sliders size={16} />
          <span>{isAr ? 'إعدادات السبرنت وتدفق العمل' : 'Sprints & Workflows'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          style={{
            padding: '10px 18px',
            fontSize: '13.5px',
            fontWeight: 700,
            border: 'none',
            background: 'transparent',
            color: activeTab === 'security' ? 'var(--primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'security' ? '2px solid var(--primary)' : '2px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Shield size={16} />
          <span>{isAr ? 'الأمان والصلاحيات' : 'Security & Access'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('billing')}
          style={{
            padding: '10px 18px',
            fontSize: '13.5px',
            fontWeight: 700,
            border: 'none',
            background: 'transparent',
            color: activeTab === 'billing' ? 'var(--primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'billing' ? '2px solid var(--primary)' : '2px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CreditCard size={16} />
          <span>{isAr ? 'الاشتراك والموارد' : 'Plan & Resources'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Tab 1: General & Branding */}
        {activeTab === 'general' && (
          <div className="card" style={{ padding: '28px', background: 'var(--bg-surface)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={18} color="var(--primary)" />
              <span>{isAr ? 'معلومات المؤسسة والشعار' : 'Organization Profile & Branding'}</span>
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '22px' }}>
              {isAr ? 'تخصيص الاسم المعروض، رابط مساحة العمل، الشعار، والوصف العام.' : 'Customize your workspace public identity, logo, custom slug, and domain description.'}
            </p>

            {/* Logo Preview & Upload */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '16px', background: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-light)', marginBottom: '22px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '14px',
                  background: logoUrl ? 'transparent' : 'var(--primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px',
                  fontWeight: 800,
                  overflow: 'hidden',
                  border: '2px solid var(--border-light)',
                  flexShrink: 0,
                }}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  orgName.charAt(0).toUpperCase() || 'O'
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {isAr ? 'شعار المؤسسة' : 'Organization Logo'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {isAr ? 'صيغ PNG أو JPG أو SVG بحد أقصى 2MB' : 'Supports PNG, JPG or SVG up to 2MB.'}
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      background: 'var(--primary)',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Upload size={13} />
                    <span>{isAr ? 'رفع شعار جديد' : 'Upload Logo'}</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                  </label>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      {isAr ? 'إزالة' : 'Remove'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                  {isAr ? 'اسم المؤسسة' : 'Organization Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                  {isAr ? 'المعرف الفريد (Slug / URL)' : 'Workspace URL Slug'} *
                </label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ padding: '9px 10px', background: 'var(--bg-subtle)', border: '1px solid var(--border-light)', borderRight: 'none', borderRadius: isAr ? '0 8px 8px 0' : '8px 0 0 8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    syncup.io/
                  </span>
                  <input
                    type="text"
                    required
                    value={orgSlug}
                    onChange={(e) => setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      borderRadius: isAr ? '8px 0 0 8px' : '0 8px 8px 0',
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-app)',
                      color: 'var(--text-main)',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                  {isAr ? 'مجال العمل الرئيسي' : 'Primary Industry / Domain'}
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                >
                  <option value="Software Engineering">Software Engineering & SaaS</option>
                  <option value="Aerospace & Defense">Aerospace & Defense</option>
                  <option value="ERP & Enterprise Systems">ERP & Enterprise Systems</option>
                  <option value="UI/UX Design">UI/UX & Product Design</option>
                  <option value="Marketing & Growth">Marketing & Growth</option>
                  <option value="Healthcare & Biotech">Healthcare & Biotech</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                  {isAr ? 'حجم فريق العمل' : 'Company / Team Size'}
                </label>
                <select
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
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
                  <option value="500+">500+ members</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                  {isAr ? 'الموقع الإلكتروني' : 'Official Website URL'}
                </label>
                <input
                  type="url"
                  placeholder="https://company.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                  {isAr ? 'نبذة عن المؤسسة' : 'Organization Mission & Description'}
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={isAr ? 'اكتب نبذة مختصرة عن نشاط المؤسسة...' : 'Brief overview of organization scope and deliverables...'}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Sprints & Workflows */}
        {activeTab === 'workflow' && (
          <div className="card" style={{ padding: '28px', background: 'var(--bg-surface)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={18} color="var(--primary)" />
              <span>{isAr ? 'إعدادات السبرنت وتدفق المهام' : 'Sprint & Workflow Defaults'}</span>
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '22px' }}>
              {isAr ? 'تحديد مدة السبرنت الافتراضية، ومقياس التقدير، وسياسات الاعتماد' : 'Configure sprint cycle duration, story points scale, and quality gates.'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                  {isAr ? 'مدة السبرنت الافتراضية' : 'Default Sprint Duration'}
                </label>
                <select
                  value={defaultSprintDuration}
                  onChange={(e) => setDefaultSprintDuration(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                >
                  <option value="1_WEEK">1 Week Sprint (Fast Iteration)</option>
                  <option value="2_WEEKS">2 Weeks Sprint (Industry Standard)</option>
                  <option value="3_WEEKS">3 Weeks Sprint</option>
                  <option value="4_WEEKS">4 Weeks Sprint (Monthly Milestone)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                  {isAr ? 'مقياس تقدير النقاط (Estimation Scale)' : 'Estimation Scale'}
                </label>
                <select
                  value={estimationScale}
                  onChange={(e) => setEstimationScale(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                >
                  <option value="FIBONACCI">Scrum Fibonacci (1, 2, 3, 5, 8, 13, 21)</option>
                  <option value="LINEAR">Linear Points (1, 2, 3, 4, 5, 6, 7)</option>
                  <option value="TSHIRT">T-Shirt Sizing (XS, S, M, L, XL)</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-app)', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={qaEnforce}
                  onChange={(e) => setQaEnforce(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {isAr ? 'بوابة التحقق من الجودة (QA Verification Gate)' : 'Enforce QA & Product Owner Verification Gate'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {isAr
                      ? 'لا يمكن نقل المهام إلى مكتملة (DONE) إلا بعد مراجعة مسؤول الـ QA أو مالك المؤسسة.'
                      : 'Prevents developers from marking tasks DONE until approved by QA or Org Admin.'}
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Tab 3: Security & Access */}
        {activeTab === 'security' && (
          <div className="card" style={{ padding: '28px', background: 'var(--bg-surface)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="#10b981" />
              <span>{isAr ? 'الأمان والتحكم في الوصول' : 'Security & Access Control'}</span>
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '22px' }}>
              {isAr ? 'سياسات النطاقات المسموح بها، سلطة الدعوات، ومتطلبات الأمان الإلزامية.' : 'Configure corporate domain filtering, invitation authority, and two-factor policies.'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                  {isAr ? 'النطاقات البريدية المصرح بها' : 'Allowed Email Domains'}
                </label>
                <input
                  type="text"
                  value={allowedDomains}
                  onChange={(e) => setAllowedDomains(e.target.value)}
                  placeholder="e.g. @nasa.gov, @contractors.nasa.gov"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  {isAr ? 'افصل بين النطاقات بفاصلة (,)' : 'Separate multiple domains with commas'}
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                  {isAr ? 'سلطة إرسال الدعوات' : 'Member Invitation Authority'}
                </label>
                <select
                  value={invitePolicy}
                  onChange={(e) => setInvitePolicy(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                >
                  <option value="ADMINS_ONLY">Only Organization Owner & Admins</option>
                  <option value="MANAGERS">Admins and Project Managers</option>
                  <option value="ALL">All Active Workspace Members</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-app)', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={enforce2FA}
                  onChange={(e) => setEnforce2FA(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {isAr ? 'إلزام جميع الأعضاء بالمصادقة الثنائية (2FA)' : 'Enforce Two-Factor Authentication (2FA)'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {isAr
                      ? 'سيُطلب من جميع موظفي المؤسسة إعداد رمز التحقق عند تسجيل الدخول.'
                      : 'Requires all organization members to verify via authenticator app before workspace access.'}
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Tab 4: Plan & Resources */}
        {activeTab === 'billing' && (
          <div className="card" style={{ padding: '28px', background: 'var(--bg-surface)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} color="#8b5cf6" />
              <span>{isAr ? 'خطة الاشتراك والموارد السحابية' : 'Subscription & Quota Allocation'}</span>
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              {isAr ? 'تفاصيل الباقة النشطة، حصة الأعضاء والمشاريع، وسجل الفوترة.' : 'View active subscription tier, allocated resources, and enterprise billing.'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '22px' }}>
              <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-app)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Active Tier</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#8b5cf6', marginTop: '4px' }}>ENTERPRISE PRO</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Unlimited Projects & Sprints</div>
              </div>

              <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-app)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Team Seat Quota</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                  {currentOrg.memberCount || 1} / 50 seats
                </div>
                <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>● 49 seats available</div>
              </div>

              <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-app)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Renewal Cycle</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>Jan 1, 2027</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Annual billing automated</div>
              </div>
            </div>

            {/* Danger Zone */}
            <div style={{ padding: '20px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', marginTop: '12px' }}>
              <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#b91c1c', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={17} color="#ef4444" />
                <span>{isAr ? 'منطقة العمليات الحساسة (Danger Zone)' : 'Danger Zone'}</span>
              </h3>
              <p style={{ fontSize: '12px', color: '#991b1b', marginBottom: '14px' }}>
                {isAr ? 'أرشفة المؤسسة تؤدي إلى تعليق دخول جميع الأعضاء وتعطيل المشاريع.' : 'Archiving this organization locks workspace access for all team members.'}
              </p>
              <button
                type="button"
                className="btn"
                onClick={() => showSnack(isAr ? 'يتطلب تعليق المؤسسة تأكيد مالك المنصة' : 'Contact Platform Super Admin to archive tenant', 'error')}
                style={{ background: '#ef4444', color: '#ffffff', padding: '8px 16px', fontSize: '12.5px', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                {isAr ? 'أرشفة المؤسسة' : 'Archive Organization'}
              </button>
            </div>
          </div>
        )}

        {/* Global Save Button Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '4px' }}>
          <button
            type="submit"
            disabled={isSaving}
            className="btn btn-primary"
            style={{
              padding: '11px 32px',
              fontSize: '14px',
              fontWeight: 800,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <Save size={17} />
            <span>{isSaving ? (isAr ? 'جارِ الحفظ...' : 'Saving Changes...') : (isAr ? 'حفظ إعدادات المؤسسة' : 'Save Organization Settings')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
