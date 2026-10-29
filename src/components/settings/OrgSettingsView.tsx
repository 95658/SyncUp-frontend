'use client';

import React, { useState } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { showSnack } from '@/store/snackbarStore';
import { FirstOrgOnboarding } from '@/components/onboarding/FirstOrgOnboarding';
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
            ? 'إنشاء المؤسسات متاح حصرياً لمالك المنصة (Platform Owner). ستظهر إعدادات المؤسسة فور تزويد وتعيين مؤسستك.'
            : 'Organization provisioning is restricted to the Platform Owner. Organization settings will appear once an organization has been provisioned.'}
        </p>
      </div>
    );
  }

  const currentOrg = organizations.find((o) => o.id === activeOrgId) || organizations[0];

  const [orgName, setOrgName] = useState(currentOrg?.name || '');
  const [orgSlug, setOrgSlug] = useState(currentOrg?.slug || '');
  const [industry, setIndustry] = useState((currentOrg as any)?.industry || 'Software Engineering');
  const [companySize, setCompanySize] = useState((currentOrg as any)?.companySize || '11-50');
  const [defaultSprintDuration, setDefaultSprintDuration] = useState('2_WEEKS');
  const [estimationScale, setEstimationScale] = useState('FIBONACCI');
  const [allowedDomains, setAllowedDomains] = useState(currentOrg?.slug ? `@${currentOrg.slug}.com` : '@company.com');
  const [enforce2FA, setEnforce2FA] = useState(true);
  const [invitePolicy, setInvitePolicy] = useState('ADMINS_ONLY');
  const [qaEnforce, setQaEnforce] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const isOrgOwner = activeRole === 'ORG_ADMIN' || currentUser?.isPlatformOwner;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg) return;
    setIsSaving(true);
    setTimeout(() => {
      // Update in local store & localStorage
      useWorkspaceStore.setState((state) => {
        const updated = state.organizations.map((o) =>
          o.id === currentOrg.id
            ? { ...o, name: orgName.trim(), slug: orgSlug.trim(), industry, companySize }
            : o
        );
        if (typeof window !== 'undefined') {
          localStorage.setItem('syncup_orgs', JSON.stringify(updated));
        }
        return { organizations: updated };
      });

      setIsSaving(false);
      showSnack(
        isAr ? 'تم حفظ إعدادات المؤسسة بنجاح' : 'Organization settings and workflow defaults saved!',
        'success'
      );
    }, 300);
  };

  return (
    <div style={{ padding: '32px 36px', maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px', animation: 'fadeIn 0.2s ease-out' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'var(--primary-light)', borderRadius: '9999px', marginBottom: '8px' }}>
          <Building2 size={13} color="var(--primary)" />
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.04em' }}>
            ORGANIZATION TENANT ADMINISTRATION
          </span>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.6px' }}>
          {isAr ? 'إعدادات المؤسسة ومساحة العمل' : 'Organization Settings'}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          {isAr
            ? `إدارة الهوية، نطاق العمل، إعدادات السبرنت الافتراضية، والأمان لمؤسسة ${currentOrg.name}.`
            : `Manage identity, workflow defaults, sprint estimation scales, and governance policies for ${currentOrg.name}.`}
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Section 1: General Info */}
        <div className="card" style={{ padding: '24px', background: 'var(--bg-surface)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={18} color="var(--primary)" />
            <span>{isAr ? 'معلومات المؤسسة والهوية' : 'General Organization Identity'}</span>
          </h2>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            {isAr ? 'الاسم المعروض لمساحة العمل ورابط الدخول' : 'Public display name and custom workspace URL identifier.'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                <option value="ERP & Finance">ERP & Enterprise Systems</option>
                <option value="UI/UX Design">UI/UX & Product Design</option>
                <option value="Marketing">Marketing & Growth</option>
                <option value="Healthcare">Healthcare & Biotech</option>
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
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Sprint & Workflow Defaults */}
        <div className="card" style={{ padding: '24px', background: 'var(--bg-surface)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} color="var(--primary)" />
            <span>{isAr ? 'إعدادات السبرنت وتدفق المهام' : 'Sprint & Workflow Defaults'}</span>
          </h2>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            {isAr ? 'حدد مدة السبرنت الافتراضية، مقياس تقدير النقاط، وسياسة الاعتماد' : 'Configure default sprint duration, estimation scales, and review constraints.'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                <option value="1_WEEK">1 Week Sprint</option>
                <option value="2_WEEKS">2 Weeks Sprint (Recommended)</option>
                <option value="3_WEEKS">3 Weeks Sprint</option>
                <option value="4_WEEKS">4 Weeks Sprint</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                {isAr ? 'مقياس تقدير السبرنت (Estimation Scale)' : 'Estimation Scale'}
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

          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={qaEnforce}
                onChange={(e) => setQaEnforce(e.target.checked)}
              />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                {isAr ? 'تقييد إتمام المهام (DONE) على مالك المؤسسة ومدير المنتج ومسؤول QA فقط' : 'Enforce QA / Product Owner gate before tasks move to DONE'}
              </span>
            </label>
          </div>
        </div>

        {/* Section 3: Security & Access */}
        <div className="card" style={{ padding: '24px', background: 'var(--bg-surface)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="#10b981" />
            <span>{isAr ? 'الأمان والصلاحيات' : 'Security & Access Control'}</span>
          </h2>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            {isAr ? 'سياسات دعوة الأعضاء، النطاقات المسموح بها، والمصادقة الثنائية' : 'Email domain restrictions, invitation authority, and 2FA policies.'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                {isAr ? 'النطاقات البريدية المصرح بها' : 'Allowed Email Domains'}
              </label>
              <input
                type="text"
                value={allowedDomains}
                onChange={(e) => setAllowedDomains(e.target.value)}
                placeholder="e.g. @company.com, @subsidiary.com"
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
                {isAr ? 'سياسة إرسال الدعوات' : 'Member Invitation Authority'}
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

          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={enforce2FA}
                onChange={(e) => setEnforce2FA(e.target.checked)}
              />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                {isAr ? 'إلزام جميع الأعضاء بتفعيل المصادقة الثنائية (2FA)' : 'Require Two-Factor Authentication (2FA) for all workspace members'}
              </span>
            </label>
          </div>
        </div>

        {/* Section 4: Subscription Plan */}
        <div className="card" style={{ padding: '24px', background: 'var(--bg-surface)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={18} color="#8b5cf6" />
            <span>{isAr ? 'خطة الاشتراك والموارد' : 'Subscription Plan & Resource Allocation'}</span>
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', padding: '16px', background: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-purple" style={{ fontSize: '12px', padding: '3px 9px' }}>PRO ANNUAL TIER</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Active Tenant</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Next billing renewal: January 1, 2027 • Includes unlimited projects and automated calendar sync.
              </div>
            </div>
            <button type="button" className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '12.5px' }} onClick={() => showSnack('Billing portal opened in new tab', 'info')}>
              Manage Billing
            </button>
          </div>
        </div>

        {/* Section 5: Danger Zone */}
        <div className="card" style={{ padding: '24px', background: '#fef2f2', border: '1px solid #fecaca' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#b91c1c', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="#ef4444" />
            <span>{isAr ? 'منطقة العمليات الحساسة (Danger Zone)' : 'Danger Zone'}</span>
          </h2>
          <p style={{ fontSize: '12.5px', color: '#991b1b', marginBottom: '14px' }}>
            {isAr ? 'الإجراءات هنا لا يمكن التراجع عنها وتؤثر على جميع أعضاء ومشاريع المؤسسة.' : 'Actions taken here cannot be undone and impact all workspace projects and team data.'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#7f1d1d' }}>
              Deactivate or archive this organization tenant
            </span>
            <button
              type="button"
              className="btn"
              onClick={() => showSnack(isAr ? 'يتطلب تعليق المؤسسة تأكيد مالك المنصة' : 'Contact Platform Super Admin to archive tenant', 'error')}
              style={{ background: '#ef4444', color: '#ffffff', padding: '8px 16px', fontSize: '12.5px', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
            >
              Archive Organization
            </button>
          </div>
        </div>

        {/* Save Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
          <button
            type="submit"
            disabled={isSaving}
            className="btn btn-primary"
            style={{
              padding: '11px 28px',
              fontSize: '14px',
              fontWeight: 700,
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
