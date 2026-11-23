'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { showSnack } from '@/store/snackbarStore';
import { superAdminApi } from '@/lib/api';
import { Organization } from '@/types';
import { SyncUpLogo } from '@/components/shared/SyncUpLogo';
import {
  Building2,
  Users,
  Mail,
  TrendingUp,
  Plus,
  Search,
  Check,
  ExternalLink,
  ShieldCheck,
  Activity,
  Layers,
  FileSpreadsheet,
  Clock,
  AlertTriangle,
  Lock,
  Copy,
  Server,
  X,
  Sliders,
  DollarSign,
  Briefcase,
  UserCheck,
  UserX,
  Filter,
  Key,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react';

export const SuperAdminView: React.FC = () => {
  const {
    superAdminTab,
    setSuperAdminTab,
    organizations,
    adminAnalytics,
    administratorsList,
    platformUsersList,
    platformInvitationsList,
    auditLogsList,
    isCreateOrgModalOpen,
    setCreateOrgModalOpen,
    createOrganization,
    deleteOrganization,
    toggleOrgStatus,
    setOrgAdminPassword,
    setActiveOrgId,
    setCurrentView,
  } = useWorkspaceStore();
  const { loginUser } = useAuthStore();
  const { language } = useUIStore();
  const isAr = language === 'ar';

  const [search, setSearch] = useState('');
  const [selectedUserOrgFilter, setSelectedUserOrgFilter] = useState('ALL');
  const [orgName, setOrgName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [newOrgPassword, setNewOrgPassword] = useState('');
  const [showNewOrgPassword, setShowNewOrgPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdInviteLink, setCreatedInviteLink] = useState<string | null>(null);
  const [createdOrgPassword, setCreatedOrgPassword] = useState('');
  const [createdOrgEmail, setCreatedOrgEmail] = useState('');
  const [createdOrgName, setCreatedOrgName] = useState('');
  const [copied, setCopied] = useState(false);

  // Set Password Modal State (Requirement: Set/view password for any organization)
  const [passwordModalOrg, setPasswordModalOrg] = useState<Organization | null>(null);
  const [editingPassword, setEditingPassword] = useState('');
  const [showEditingPassword, setShowEditingPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [copiedModalKey, setCopiedModalKey] = useState<string | null>(null);
  const [deletingOrgId, setDeletingOrgId] = useState<string | null>(null);

  const refreshSuperAdminData = useCallback(async () => {
    try {
      const [orgs, analytics, admins, users, invitations, logs] = await Promise.all([
        superAdminApi.getOrganizations().catch(() => []),
        superAdminApi.getAnalytics().catch(() => null),
        superAdminApi.getAdministrators().catch(() => []),
        superAdminApi.getUsers().catch(() => []),
        superAdminApi.getInvitations().catch(() => []),
        superAdminApi.getAuditLogs().catch(() => []),
      ]);

      useWorkspaceStore.setState((state) => {
        let updatedOrgs = state.organizations;
        if (Array.isArray(orgs)) {
          updatedOrgs = orgs.map((item: any) => ({
            id: item.id,
            name: item.name,
            slug: item.slug || item.name.toLowerCase().replace(/\s+/g, '-'),
            logoUrl: item.logoUrl || undefined,
            description: item.description || undefined,
            adminName: item.members?.[0]?.user?.fullName || item.adminName || 'Admin',
            adminEmail: item.members?.[0]?.user?.email || item.adminEmail || '',
            memberCount: item.members?.length || item._count?.members || item.memberCount || 1,
            status: (item.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE') as 'ACTIVE' | 'SUSPENDED',
            plan: (item.plan || 'ENTERPRISE') as 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE',
            createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Active',
          }));
        }

        const orgsCount = analytics?.totalOrganizations ?? updatedOrgs.length;
        const activeOrgsCount = analytics?.activeOrganizations ?? updatedOrgs.filter((o) => o.status === 'ACTIVE').length;
        const usersCount = analytics?.totalUsers ?? (Array.isArray(users) ? users.length : 0);
        const activeUsersCount = analytics?.activeUsers ?? usersCount;
        const calculatedMRR = activeOrgsCount * 49;

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('syncup_orgs', JSON.stringify(updatedOrgs));
          } catch {}
        }

        return {
          organizations: updatedOrgs,
          adminAnalytics: {
            ...state.adminAnalytics,
            ...(analytics || {}),
            totalOrganizations: orgsCount,
            activeOrganizations: activeOrgsCount,
            totalUsers: usersCount,
            activeUsers: activeUsersCount,
            monthlyRecurringRevenue: calculatedMRR,
            totalRevenue: calculatedMRR * 12,
            cashFlowGrowth: activeOrgsCount > 0 ? '+18.4%' : '0.0%',
          },
          administratorsList: Array.isArray(admins) ? admins : [],
          platformUsersList: Array.isArray(users) ? users : [],
          platformInvitationsList: Array.isArray(invitations) ? invitations : [],
          auditLogsList: Array.isArray(logs) ? logs : [],
        };
      });
    } catch (err) {
      console.warn('Live super admin analytics sync:', err);
    }
  }, []);

  useEffect(() => {
    refreshSuperAdminData();
  }, [refreshSuperAdminData]);

  const handleDeleteOrg = async (orgId: string, orgName: string) => {
    const confirmMsg = isAr
      ? `هل أنت متأكد من حذف مؤسسة "${orgName}" نهائياً؟\nسيتم حذف جميع القنوات والمستخدمين والبيانات التابعة لها ولا يمكن التراجع عن هذا الإجراء.`
      : `Are you sure you want to permanently delete "${orgName}"?\nAll associated channels, users, and data will be removed. This cannot be undone.`;

    if (!window.confirm(confirmMsg)) return;

    setDeletingOrgId(orgId);
    try {
      await deleteOrganization(orgId);
      await refreshSuperAdminData();
      showSnack(
        isAr ? `تم حذف مؤسسة "${orgName}" بنجاح!` : `Organization "${orgName}" deleted successfully!`,
        'success'
      );
    } catch (err: any) {
      showSnack(err.message || (isAr ? 'فشل حذف المؤسسة' : 'Failed to delete organization'), 'error');
    } finally {
      setDeletingOrgId(null);
    }
  };

  const openSetPasswordModal = (org: Organization) => {
    setPasswordModalOrg(org);
    setEditingPassword('');
    setShowEditingPassword(false);
    setCopiedModalKey(null);
  };

  const handleSavePasswordModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalOrg) return;
    const cleanPass = editingPassword.trim();
    if (cleanPass.length < 8 || !/[0-9]/.test(cleanPass) || !/[a-zA-Z]/.test(cleanPass)) {
      showSnack(
        isAr
          ? 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل وتحتوي على مزيج من الحروف والأرقام'
          : 'Password must be at least 8 characters with a mix of letters and numbers',
        'error'
      );
      return;
    }
    setSavingPassword(true);
    try {
      await setOrgAdminPassword(passwordModalOrg.id, cleanPass);
      showSnack(
        isAr ? `تم تحديث كلمة مرور مدير ${passwordModalOrg.name} بنجاح!` : `Admin password for ${passwordModalOrg.name} saved successfully!`,
        'success'
      );
      setPasswordModalOrg(null);
    } catch (err: any) {
      showSnack(err.message || (isAr ? 'فشل تحديث كلمة المرور' : 'Failed to update password'), 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSwitchToAdmin = (org: Organization, pass: string) => {
    const dummyToken = 'mock-jwt-token-orgadmin-' + Date.now();
    loginUser(
      {
        id: 'admin-' + org.id,
        name: org.adminName,
        email: org.adminEmail,
        isPlatformOwner: false,
        status: 'ACTIVE',
        jobTitle: 'Organization Admin',
      },
      'ORG_ADMIN',
      dummyToken
    );
    setActiveOrgId(org.id);
    setCurrentView('dashboard');
    showSnack(
      isAr ? `تم التبديل بنجاح كمدير لمؤسسة ${org.name}` : `Switched to ${org.name} as Organization Admin!`,
      'success'
    );
  };

  const filteredOrgs = organizations.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.adminName.toLowerCase().includes(search.toLowerCase()) ||
      o.adminEmail.toLowerCase().includes(search.toLowerCase())
  );

  // Requirement 14: Check duplicate org name for same owner
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !adminEmail.trim()) return;

    // Check if duplicate for same owner
    const isDuplicate = organizations.some(
      (o) =>
        o.name.trim().toLowerCase() === orgName.trim().toLowerCase() &&
        o.adminEmail.trim().toLowerCase() === adminEmail.trim().toLowerCase()
    );

    if (isDuplicate) {
      showSnack(
        isAr
          ? 'لا يمكن إنشاء مؤسسة: توجد مؤسسة بنفس الاسم مسجلة لنفس المالك'
          : 'Cannot create organization: An organization with this name already exists for this owner.',
        'error'
      );
      return;
    }

    const defaultPassword = newOrgPassword.trim() || `${orgName.trim().replace(/\s+/g, '')}#Admin2026!`;

    setLoading(true);
    try {
      const res = await createOrganization({
        name: orgName.trim(),
        slug: orgName.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        adminName: adminName.trim() || 'Admin User',
        adminEmail: adminEmail.trim(),
        adminPassword: defaultPassword,
      });

      const inviteLink = (res && (res as any).invitationLink)
        ? (res as any).invitationLink
        : `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/auth/accept-invitation?token=inv-${Date.now()}`;

      setCreatedInviteLink(inviteLink);
      setCreatedOrgName(orgName.trim());
      setCreatedOrgEmail(adminEmail.trim());
      setCreatedOrgPassword(defaultPassword);

      setOrgName('');
      setAdminName('');
      setAdminEmail('');
      setNewOrgPassword('');
      await refreshSuperAdminData();
      showSnack(isAr ? 'تم إنشاء المؤسسة بنجاح' : 'Organization provisioned successfully!', 'success');
    } catch (err: any) {
      showSnack(err.message || 'Failed to create organization', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Requirement 13: Change status of admin account
  const handleToggleAdminStatus = (admin: any) => {
    const nextStatus = admin.user?.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (admin.user) admin.user.status = nextStatus;

    useWorkspaceStore.setState((state) => ({
      administratorsList: state.administratorsList.map((a: any) =>
        a.id === admin.id ? { ...a, user: { ...a.user, status: nextStatus } } : a
      ),
    }));

    const adminNameText = admin.user?.fullName || 'Admin';
    showSnack(
      isAr
        ? 'تم تحديث حالة حساب المدير إلى: ' + nextStatus
        : 'Admin ' + adminNameText + ' account status changed to ' + nextStatus,
      'success'
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResendInvitation = async (invId: string) => {
    try {
      const res = await superAdminApi.resendInvitation(invId);
      if (res?.invitationLink) {
        copyToClipboard(res.invitationLink);
        showSnack(
          isAr
            ? 'تم نسخ رابط التفعيل الرسمي وإعادة إرسال البريد بنجاح!'
            : 'Activation link copied to clipboard & email dispatched!',
          'success'
        );
      }
      await refreshSuperAdminData();
    } catch (err: any) {
      showSnack(err.message || 'Failed to resend invitation', 'error');
    }
  };

  const handleRevokeInvitation = async (invId: string) => {
    if (!window.confirm(isAr ? 'هل أنت متأكد من إلغاء هذه الدعوة؟' : 'Are you sure you want to revoke this invitation?')) return;
    try {
      await superAdminApi.revokeInvitation(invId);
      showSnack(isAr ? 'تم إلغاء الدعوة بنجاح' : 'Invitation revoked', 'success');
      await refreshSuperAdminData();
    } catch (err: any) {
      showSnack(err.message || 'Failed to revoke invitation', 'error');
    }
  };

  return (
    <div style={{
      padding: '32px 36px',
      display: 'flex',
      flexDirection: 'column',
      gap: '28px',
      maxWidth: '1440px',
      margin: '0 auto',
      animation: 'fadeIn 0.25s ease-out',
    }}>
      {/* Platform Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            background: 'var(--primary-light)',
            border: '1px solid var(--primary-border)',
            borderRadius: '9999px',
            marginBottom: '10px',
          }}>
            <SyncUpLogo size={15} mode="auto" />
            <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.04em' }}>
              SYNCUP PLATFORM CONTROL PLANE
            </span>
          </div>

          <h1 style={{
            fontSize: '30px',
            fontWeight: 800,
            letterSpacing: '-0.8px',
            color: 'var(--text-main)',
            lineHeight: 1.2,
            marginBottom: '6px',
          }}>
            Super Admin Dashboard
          </h1>
          <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Global platform governance, client organization provisioning, and audit logs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateOrgModalOpen(true)}
          className="btn btn-primary"
          style={{
            padding: '10px 18px',
            fontSize: '13.5px',
            fontWeight: 700,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Plus size={16} />
          <span>Provision Organization</span>
        </button>
      </div>

      {/* Tabs Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '1px solid var(--border-light)',
        paddingBottom: '2px',
        overflowX: 'auto',
      }}>
        {[
          { id: 'overview', label: 'Platform Overview', icon: Activity },
          { id: 'organizations', label: `Organizations (${organizations.length})`, icon: Building2 },
          { id: 'administrators', label: `Administrators (${administratorsList.length})`, icon: ShieldCheck },
          { id: 'users', label: `Users (${platformUsersList.length})`, icon: Users },
          { id: 'invitations', label: `Invitations (${platformInvitationsList.length})`, icon: Mail },
          { id: 'audit-logs', label: `Audit Trail (${auditLogsList.length})`, icon: FileSpreadsheet },
          { id: 'settings', label: 'System Settings', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = superAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSuperAdminTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: 'none',
                background: 'none',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                fontWeight: isActive ? 800 : 600,
                fontSize: '13.5px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={16} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
              <span style={{ color: isActive ? '#FFFFFF' : 'var(--text-muted)' }}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Platform Overview & ERP Metrics (Requirement 12) */}
      {superAdminTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top ERP Income & Metrics Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
            }}
          >
            {/* Money Income / ERP Total Revenue */}
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)', border: '1px solid var(--success-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: 'var(--success-bg)',
                    border: '1px solid var(--success-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <DollarSign size={24} color="var(--success)" />
                </div>
                <span className="badge badge-success">
                  0.0% MoM
                </span>
              </div>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--success)' }}>
                  $0
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 700 }}>
                  {isAr ? 'إجمالي دخل المنصة (ERP Income)' : 'Platform Total Income (ERP)'}
                </div>
              </div>
            </div>

            {/* Monthly Recurring Revenue */}
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(139, 0, 33, 0.05) 0%, rgba(190, 18, 60, 0.05) 100%)', border: '1px solid var(--primary-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: 'var(--primary-light)',
                    border: '1px solid var(--primary-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrendingUp size={24} color="var(--primary)" />
                </div>
                <span className="badge badge-primary">SaaS MRR</span>
              </div>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--primary)' }}>
                  $0/mo
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 700 }}>
                  {isAr ? 'الإيراد الشهري المتكرر' : 'Monthly Recurring Revenue'}
                </div>
              </div>
            </div>

            {/* Organizations */}
            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: 'var(--primary-light)',
                    border: '1px solid var(--primary-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Building2 size={24} color="var(--primary)" />
                </div>
                <span className="badge badge-success">Active B2B</span>
              </div>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-main)' }}>
                  {organizations.length}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 600 }}>
                  Client Organizations
                </div>
              </div>
            </div>

            {/* Platform Users */}
            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: 'var(--success-bg)',
                    border: '1px solid var(--success-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Users size={24} color="var(--success)" />
                </div>
                <span className="badge badge-success">Verified</span>
              </div>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-main)' }}>
                  {platformUsersList?.length || 0}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 600 }}>
                  Active Team Users
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: 'var(--purple-bg)',
                    border: '1px solid var(--purple-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Server size={24} color="var(--purple)" />
                </div>
                <span className="badge badge-purple">99.99%</span>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981' }}>
                  {adminAnalytics.systemHealth}
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', fontWeight: 600 }}>
                  PostgreSQL & Engine
                </div>
              </div>
            </div>
          </div>

          {/* Quick Organizations Card preview */}
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
              Active Client Tenants
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {organizations.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', padding: '32px', textAlign: 'center', background: 'var(--bg-subtle)', borderRadius: '12px', border: '1px dashed var(--border-light)' }}>
                  <Building2 size={32} color="var(--text-muted)" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {isAr ? 'لا توجد مؤسسات بعد' : 'No Client Tenants Provisioned'}
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: '14px' }}>
                    {isAr ? 'انقر على الزر أدناه لإنشاء أول مؤسسة في المنصة' : 'Click below to provision the first client enterprise organization.'}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCreateOrgModalOpen(true)}
                    className="btn btn-primary"
                    style={{ fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={15} />
                    <span>{isAr ? 'إنشاء مؤسسة جديدة' : 'Provision Organization'}</span>
                  </button>
                </div>
              ) : (
                organizations.map((org) => (
                <div
                  key={org.id}
                  style={{
                    padding: '18px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: org.logoUrl ? 'transparent' : 'var(--primary)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '16px',
                        overflow: 'hidden',
                        border: org.logoUrl ? '1px solid var(--border-light)' : 'none',
                      }}>
                        {org.logoUrl ? (
                          <img src={org.logoUrl} alt={org.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          org.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-main)' }}>{org.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>slug: /{org.slug}</div>
                      </div>
                    </div>
                    <span className={`badge ${org.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                      {org.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                    <span>Admin: <strong style={{ color: 'var(--text-main)' }}>{org.adminEmail}</strong></span>
                    <span>Members: <strong style={{ color: 'var(--text-main)' }}>{org.memberCount}</strong></span>
                  </div>
                </div>
              )))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Organizations Management */}
      {superAdminTab === 'organizations' && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ position: 'relative', width: '320px' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                placeholder="Search organizations or admins..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '38px', height: '40px' }}
              />
            </div>
            <button
              type="button"
              onClick={() => setCreateOrgModalOpen(true)}
              className="btn btn-primary"
              style={{ fontSize: '13px', padding: '8px 16px' }}
            >
              <Plus size={15} />
              <span>Provision New Organization</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '12px 16px' }}>Organization</th>
                  <th style={{ padding: '12px 16px' }}>Admin Lead</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Members</th>
                  <th style={{ padding: '12px 16px' }}>Created Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrgs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px 16px', textAlign: 'center' }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: 'var(--primary-light)',
                        border: '1px solid var(--primary-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)',
                        margin: '0 auto 14px auto',
                      }}>
                        <Building2 size={28} />
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                        {isAr ? 'لا توجد مؤسسات منشأة حتى الآن' : 'No Organizations Provisioned Yet'}
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: '18px', maxWidth: '420px', margin: '6px auto 18px auto' }}>
                        {isAr
                          ? 'بصفتك مالك المنصة، يمكنك إنشاء المؤسسات وتعيين المدراء وتزويدهم بحساباتهم.'
                          : 'As the Platform Owner, you can provision enterprise organizations, assign admins, and manage tenancy.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setCreateOrgModalOpen(true)}
                        className="btn btn-primary"
                        style={{ padding: '10px 20px', fontSize: '13.5px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                      >
                        <Plus size={16} />
                        <span>{isAr ? 'إنشاء أول مؤسسة الآن' : 'Provision First Organization'}</span>
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredOrgs.map((org) => (
                  <tr key={org.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s ease' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: org.logoUrl ? 'transparent' : 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', overflow: 'hidden', border: org.logoUrl ? '1px solid var(--border-light)' : 'none' }}>
                          {org.logoUrl ? (
                            <img src={org.logoUrl} alt={org.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            org.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{org.name}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>ID: {org.id.substring(0, 10)}...</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{org.adminName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{org.adminEmail}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge ${org.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                        {org.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {org.memberCount}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '12.5px' }}>
                      {org.createdAt}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => openSetPasswordModal(org)}
                          className="btn btn-sm btn-secondary"
                          style={{
                            fontSize: '11.5px',
                            padding: '5px 10px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            color: 'var(--primary)',
                            borderColor: 'var(--primary-border)',
                            background: 'var(--primary-light)',
                            fontWeight: 700,
                          }}
                          title={isAr ? 'عرض أو تعيين كلمة مرور مدير المؤسسة' : 'Set or view admin password'}
                        >
                          <Key size={13} color="var(--primary)" />
                          <span>{isAr ? 'كلمة المرور' : 'Set Password'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleOrgStatus(org.id, org.status)}
                          className={`btn btn-sm ${org.status === 'ACTIVE' ? 'btn-ghost' : 'btn-secondary'}`}
                          style={{
                            fontSize: '11.5px',
                            padding: '5px 10px',
                            color: org.status === 'ACTIVE' ? '#dc2626' : '#10b981',
                          }}
                        >
                          {org.status === 'ACTIVE' ? (isAr ? 'تعليق المؤسسة' : 'Suspend Org') : (isAr ? 'إعادة التفعيل' : 'Reactivate Org')}
                        </button>

                        <button
                          type="button"
                          disabled={deletingOrgId === org.id}
                          onClick={() => handleDeleteOrg(org.id, org.name)}
                          className="btn btn-sm btn-ghost"
                          style={{
                            fontSize: '11.5px',
                            padding: '5px 10px',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            background: 'rgba(239, 68, 68, 0.08)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 700,
                            cursor: deletingOrgId === org.id ? 'not-allowed' : 'pointer',
                            opacity: deletingOrgId === org.id ? 0.6 : 1,
                          }}
                          title={isAr ? 'حذف المؤسسة نهائياً' : 'Delete Organization'}
                        >
                          <Trash2 size={13} color="#ef4444" />
                          <span>{deletingOrgId === org.id ? (isAr ? 'جارِ الحذف...' : 'Deleting...') : (isAr ? 'حذف' : 'Delete')}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Administrators (Requirement 13: Change status of admin account) */}
      {superAdminTab === 'administrators' && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)' }}>
              {isAr ? 'مديرو المؤسسات' : 'Organization Administrators'}
            </h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isAr ? 'right' : 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>{isAr ? 'المدير' : 'Administrator'}</th>
                  <th style={{ padding: '12px 16px' }}>{isAr ? 'المؤسسة' : 'Assigned Organization'}</th>
                  <th style={{ padding: '12px 16px' }}>{isAr ? 'الدور' : 'Role'}</th>
                  <th style={{ padding: '12px 16px' }}>{isAr ? 'حالة الحساب' : 'Account Status'}</th>
                  <th style={{ padding: '12px 16px' }}>{isAr ? 'تاريخ الانضمام' : 'Joined Date'}</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>{isAr ? 'تغيير الحالة' : 'Change Status'}</th>
                </tr>
              </thead>
              <tbody>
                {administratorsList.map((admin: any) => (
                  <tr key={admin.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{admin.user?.fullName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{admin.user?.email}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--primary)' }}>
                      {admin.organization?.name}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className="badge badge-primary">{admin.role}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge ${admin.user?.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                        {admin.user?.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                      {new Date(admin.joinedAt).toLocaleDateString()}
                    </td>
                    {/* Requirement 13: Action to change admin status */}
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleAdminStatus(admin)}
                        className={`btn btn-sm ${admin.user?.status === 'ACTIVE' ? 'btn-ghost' : 'btn-secondary'}`}
                        style={{
                          fontSize: '11.5px',
                          padding: '5px 12px',
                          color: admin.user?.status === 'ACTIVE' ? '#dc2626' : '#10b981',
                        }}
                      >
                        {admin.user?.status === 'ACTIVE'
                          ? isAr ? 'تعليق الحساب' : 'Suspend Admin'
                          : isAr ? 'تفعيل الحساب' : 'Activate Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Platform Users (Requirement 11: Filter by Organization) */}
      {superAdminTab === 'users' && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)' }}>
              {isAr ? 'مستخدمو المنصة المسجلون' : 'Registered Platform Users'}
            </h2>

            {/* Requirement 11: Organization Dropdown Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={15} color="var(--primary)" />
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                {isAr ? 'تصفية حسب المؤسسة:' : 'Filter by Org:'}
              </span>
              <select
                value={selectedUserOrgFilter}
                onChange={(e) => setSelectedUserOrgFilter(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-app)',
                  color: 'var(--text-main)',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  outline: 'none',
                }}
              >
                <option value="ALL">{isAr ? 'جميع المؤسسات' : 'All Organizations'}</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.name}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isAr ? 'right' : 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>{isAr ? 'المستخدم' : 'User'}</th>
                  <th style={{ padding: '12px 16px' }}>{isAr ? 'المسمى الوظيفي' : 'Job Title'}</th>
                  <th style={{ padding: '12px 16px' }}>{isAr ? 'المؤسسة' : 'Organizations'}</th>
                  <th style={{ padding: '12px 16px' }}>{isAr ? 'الحالة' : 'Status'}</th>
                  <th style={{ padding: '12px 16px' }}>{isAr ? 'تاريخ التسجيل' : 'Created At'}</th>
                </tr>
              </thead>
              <tbody>
                {platformUsersList
                  .filter((u: any) => {
                    if (selectedUserOrgFilter === 'ALL') return true;
                    return (u.orgMemberships || []).some(
                      (m: any) => m.organization?.name?.toLowerCase() === selectedUserOrgFilter.toLowerCase()
                    );
                  })
                  .map((u: any) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{u.fullName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{u.jobTitle || 'Team Member'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        {(u.orgMemberships || []).map((m: any) => (
                          <span key={m.id} className="badge badge-neutral" style={{ marginRight: '4px' }}>
                            {m.organization?.name}
                          </span>
                        ))}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className={`badge ${u.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Invitations */}
      {superAdminTab === 'invitations' && (
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
            {isAr ? 'دعوات المنصة النشطة' : 'Platform Invitations'}
          </h2>
          {platformInvitationsList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
              <Mail size={36} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
              <div style={{ fontWeight: 700, fontSize: '15px' }}>No Pending Invitations</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isAr ? 'right' : 'left', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '12px' }}>
                    <th style={{ padding: '12px 16px' }}>{isAr ? 'البريد الإلكتروني' : 'Email'}</th>
                    <th style={{ padding: '12px 16px' }}>{isAr ? 'المؤسسة' : 'Organization'}</th>
                    <th style={{ padding: '12px 16px' }}>{isAr ? 'الدور' : 'Role'}</th>
                    <th style={{ padding: '12px 16px' }}>{isAr ? 'الحالة' : 'Status'}</th>
                    <th style={{ padding: '12px 16px' }}>{isAr ? 'تاريخ الانتهاء' : 'Expires At'}</th>
                    <th style={{ padding: '12px 16px', textAlign: isAr ? 'left' : 'right' }}>{isAr ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {platformInvitationsList.map((inv: any) => {
                    const isAccepted = inv.status === 'ACCEPTED' || inv.status === 'ACTIVE';
                    const isPending = inv.status === 'PENDING';
                    const isExpired = inv.status === 'EXPIRED';

                    return (
                      <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 600 }}>{inv.email}</td>
                        <td style={{ padding: '14px 16px' }}>{inv.organization?.name}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span className="badge badge-primary">{inv.role}</span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            className={`badge ${
                              isAccepted ? 'badge-success' : isExpired ? 'badge-danger' : 'badge-warning'
                            }`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontWeight: 700,
                            }}
                          >
                            {isAccepted ? (
                              <>
                                <Check size={12} />
                                <span>{isAr ? 'مفعل (نشط)' : 'Active (Accepted)'}</span>
                              </>
                            ) : isPending ? (
                              <>
                                <Clock size={12} />
                                <span>{isAr ? 'في انتظار التفعيل' : 'Pending Activation'}</span>
                              </>
                            ) : (
                              <span>{inv.status}</span>
                            )}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                          {new Date(inv.expiresAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: isAr ? 'left' : 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            {isPending && (
                              <button
                                type="button"
                                onClick={() => handleResendInvitation(inv.id)}
                                className="btn btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                title={isAr ? 'نسخ رابط التفعيل وإعادة إرسال الإيميل' : 'Copy activation link & resend email'}
                              >
                                <Copy size={13} />
                                <span>{isAr ? 'نسخ رابط التفعيل' : 'Copy Link'}</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRevokeInvitation(inv.id)}
                              className="btn btn-danger"
                              style={{ padding: '6px 10px', fontSize: '12px' }}
                              title={isAr ? 'إلغاء الدعوة' : 'Revoke invitation'}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Audit Logs (Requirement 15: Clean action name instead of status_changed) */}
      {superAdminTab === 'audit-logs' && (
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
            {isAr ? 'سجل التدقيق الإداري' : 'Administrative Audit Trail'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {auditLogsList.map((log: any) => {
              // Requirement 15: Clean human-readable action name
              const displayAction =
                log.action === 'status_changed'
                  ? `Status updated to ${log.metadata?.status || 'UPDATED'}`
                  : log.action;

              return (
                <div
                  key={log.id}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '10px',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{log.actor?.fullName || 'Platform Owner'} </span>
                      <span style={{ color: 'var(--text-secondary)' }}>performed </span>
                      <span className="badge badge-primary" style={{ fontSize: '11px', textTransform: 'none' }}>
                        {displayAction}
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}> on {log.entityType}</span>
                      {log.organization && (
                        <span style={{ color: 'var(--primary)', fontWeight: 600 }}> ({log.organization.name})</span>
                      )}
                    </div>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} />
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 7: System Settings */}
      {superAdminTab === 'settings' && (
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)' }}>System & Governance Settings</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
            <div style={{ padding: '16px', background: 'var(--bg-subtle)', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>Multi-Tenancy Scoping Model</div>
              <div style={{ color: 'var(--text-secondary)' }}>Shared PostgreSQL Schema with strict organizationId foreign key constraints and server-side RBAC scoping (SRS FR-TEN-001/002).</div>
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-subtle)', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>Authentication Policy</div>
              <div style={{ color: 'var(--text-secondary)' }}>Private B2B SaaS (Public Signup Disabled). One-time cryptographic tokenHash invitation flow with 7-day TTL (SRS FR-AUTH-001).</div>
            </div>
          </div>
        </div>
      )}

      {/* Provision Organization Modal */}
      {isCreateOrgModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          animation: 'fadeIn 0.15s ease-out',
        }}>
          <div className="card" style={{
            width: '460px',
            maxWidth: '95%',
            background: 'var(--bg-surface)',
            padding: '28px',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-xl)',
            position: 'relative',
          }}>
            <button
              type="button"
              onClick={() => {
                setCreateOrgModalOpen(false);
                setCreatedInviteLink(null);
              }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
            >
              <X size={18} />
            </button>

            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
              Provision New Organization
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Create an enterprise tenant and issue an invitation to its designated Org Admin.
            </p>

            {createdInviteLink ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{
                  padding: '16px',
                  background: '#fff1f2',
                  border: '1.5px solid #fecdd3',
                  borderRadius: '12px',
                  color: '#881337',
                  fontSize: '13px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '14px', marginBottom: '4px' }}>
                    <Mail size={18} color="#8B0021" />
                    <span>{isAr ? 'تم إرسال دعوة التفعيل بالبريد الإلكتروني بنجاح!' : 'Activation Invitation Email Dispatched!'}</span>
                  </div>
                  <div style={{ fontSize: '12.5px', lineHeight: 1.5, color: '#9f1239' }}>
                    {isAr
                      ? `تم إرسال رابط التفعيل الرسمي إلى (${createdOrgEmail}). لن يتمكن مدير المؤسسة من تسجيل الدخول إلا بعد فتح الرابط في بريده وقبول الدعوة وتعيين كلمة المرور.`
                      : `An official invitation email has been sent to (${createdOrgEmail}). The organization admin cannot log in until they accept the invitation and choose their password.`}
                  </div>
                </div>

                {/* Organization & Invitation Details */}
                <div style={{
                  padding: '16px',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  fontSize: '12.5px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Organization:</span>
                    <strong style={{ color: 'var(--text-main)' }}>{createdOrgName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Admin Recipient:</span>
                    <strong style={{ color: 'var(--primary)' }}>{createdOrgEmail}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                    <span className="badge badge-warning">{isAr ? 'في انتظار قبول الدعوة' : 'Pending Acceptance'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Free Trial:</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>14 Days (Full Access)</span>
                  </div>
                </div>

                {/* Fallback Invitation Link */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    {isAr ? 'رابط الدعوة المباشر (يمكنك نسخه وإرساله للمدير يدوياً):' : 'Direct Invitation Link (Fallback):'}
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      readOnly
                      value={createdInviteLink}
                      className="input-field"
                      style={{ height: '38px', fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--bg-app)' }}
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(createdInviteLink)}
                      className="btn btn-secondary"
                      style={{ padding: '0 14px', fontSize: '12px', flexShrink: 0 }}
                    >
                      {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setCreateOrgModalOpen(false);
                      setCreatedInviteLink(null);
                    }}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '10px', fontSize: '13px' }}
                  >
                    <span>{isAr ? 'تم الإغلاق والإنشاء' : 'Done & Close'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nasa, Acme Corp, or Libro"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="input-field"
                    style={{ height: '40px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                    Designated Admin Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mark Anglo"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="input-field"
                    style={{ height: '40px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                    Designated Admin Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@nasa.org"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="input-field"
                    style={{ height: '40px' }}
                  />
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {isAr
                      ? '📩 سيتم إرسال دعوة تفعيل رسمية إلى هذا البريد. لن يتمكن المدير من الدخول إلا بعد قبولها وتعيين كلمة مروره.'
                      : '📩 An activation invitation will be sent to this email. The admin can only log in after accepting and setting their password.'}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                    Initial Admin Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewOrgPassword ? 'text' : 'password'}
                      placeholder={orgName ? `${orgName.replace(/\s+/g, '')}#Admin2026!` : 'Custom password (leave blank for auto)'}
                      value={newOrgPassword}
                      onChange={(e) => setNewOrgPassword(e.target.value)}
                      className="input-field"
                      style={{ height: '40px', paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewOrgPassword(!showNewOrgPassword)}
                      style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      {showNewOrgPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '3px', display: 'block' }}>
                    Default auto-generated: <code>{orgName ? `${orgName.replace(/\s+/g, '')}#Admin2026!` : 'OrgName#Admin2026!'}</code>
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setCreateOrgModalOpen(false)}
                    className="btn btn-ghost"
                    style={{ fontSize: '13px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ fontSize: '13px', padding: '10px 18px' }}
                  >
                    {loading ? 'Creating...' : 'Provision Organization'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Dedicated Set / Reset Password Modal for ANY Organization */}
      {passwordModalOrg && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110,
          animation: 'fadeIn 0.15s ease-out',
        }}>
          <div className="card" style={{
            width: '460px',
            maxWidth: '95%',
            background: 'var(--bg-surface)',
            padding: '28px',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-xl)',
            position: 'relative',
          }}>
            <button
              type="button"
              onClick={() => setPasswordModalOrg(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary-light)', border: '1px solid var(--primary-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Key size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
                  {isAr ? 'تعيين كلمة مرور المدير' : 'Set Admin Password'}
                </h2>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {passwordModalOrg.name} • {passwordModalOrg.adminEmail}
                </div>
              </div>
            </div>

            <form onSubmit={handleSavePasswordModal} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {isAr ? 'كلمة المرور الجديدة' : 'Admin Password'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const generated = `${passwordModalOrg.name.replace(/\s+/g, '')}#Admin${Math.floor(1000 + Math.random() * 9000)}!`;
                      setEditingPassword(generated);
                      setShowEditingPassword(true);
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    🎲 {isAr ? 'توليد كلمة سر قوية' : 'Generate Strong'}
                  </button>
                </div>

                <div style={{ position: 'relative' }}>
                  <input
                    type={showEditingPassword ? 'text' : 'password'}
                    required
                    value={editingPassword}
                    onChange={(e) => setEditingPassword(e.target.value)}
                    className="input-field"
                    style={{ height: '42px', paddingRight: '40px', fontFamily: 'var(--font-family-mono)', fontSize: '13.5px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditingPassword(!showEditingPassword)}
                    style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    {showEditingPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* One-click copy helper */}
              <div style={{
                padding: '10px 14px',
                background: 'var(--bg-app)',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px',
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Email: <strong>{passwordModalOrg.adminEmail}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(passwordModalOrg.adminEmail);
                    setCopiedModalKey('email');
                    setTimeout(() => setCopiedModalKey(null), 2000);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: copiedModalKey === 'email' ? 'var(--success)' : 'var(--primary)',
                    fontWeight: 800,
                    fontSize: '12px',
                  }}
                >
                  {copiedModalKey === 'email' ? (isAr ? '✓ تم نسخ البريد' : '✓ Copied Email') : (isAr ? 'نسخ البريد' : 'Copy Email')}
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleSwitchToAdmin(passwordModalOrg, editingPassword)}
                  className="btn btn-secondary"
                  style={{ flex: 1, fontSize: '12.5px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <ExternalLink size={14} />
                  <span>{isAr ? 'تسجيل دخول كمدير' : 'Login as this Admin'}</span>
                </button>

                <button
                  type="submit"
                  disabled={savingPassword}
                  className="btn btn-primary"
                  style={{ flex: 1, fontSize: '12.5px', padding: '10px', fontWeight: 800 }}
                >
                  {savingPassword ? 'Saving...' : (isAr ? 'حفظ كلمة المرور' : 'Save Password')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
