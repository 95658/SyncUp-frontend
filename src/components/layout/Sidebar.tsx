'use client';

import React, { useState } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { showSnack } from '@/store/snackbarStore';
import { SyncUpLogo } from '@/components/shared/SyncUpLogo';
import {
  ShieldAlert,
  Building2,
  Users2,
  MailCheck,
  FileSpreadsheet,
  Activity,
  Sliders,
  LayoutDashboard,
  Kanban,
  CheckSquare,
  MessageSquare,
  Calendar,
  FolderOpen,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  Sparkles,
  LogOut,
  Shield,
  Layers,
  FolderDot,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    superAdminTab,
    setSuperAdminTab,
    organizations,
    activeOrgId,
    setActiveOrgId,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    adminAnalytics,
    administratorsList,
    platformUsersList,
    platformInvitationsList,
    auditLogsList,
  } = useWorkspaceStore();
  const { currentUser, activeRole } = useAuthStore();
  const { setLogoutConfirmOpen, setProfileModalOpen, t, language, theme } = useUIStore();

  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);

  const isPlatformOwner = currentUser?.isPlatformOwner || activeRole === 'PLATFORM_OWNER';
  const isMember = activeRole === 'ORG_MEMBER';
  const isAr = language === 'ar';

  const currentOrg = organizations.find((o) => o.id === activeOrgId) || organizations[0] || null;

  // Filter projects for standard members (Requirement 35)
  const accessibleProjects = isMember
    ? projects.filter(
        (p) =>
          p.teamMembers?.some((m) => m.id === currentUser?.id || m.name === currentUser?.name)
      )
    : projects;

  // ─── Super Admin Navigation (Platform Owner Only) ──────────────────────────
  const totalOrgs = (adminAnalytics?.totalOrganizations ?? organizations.length) || 0;
  const superAdminNavItems = [
    { id: 'overview', label: t('platformOverview'), icon: Activity },
    { id: 'organizations', label: t('organizations'), icon: Building2, badge: totalOrgs > 0 ? totalOrgs.toString() : undefined },
    { id: 'administrators', label: t('administrators'), icon: Shield, badge: administratorsList?.length > 0 ? administratorsList.length.toString() : undefined },
    { id: 'users', label: t('platformUsers'), icon: Users2, badge: (adminAnalytics?.totalUsers || platformUsersList?.length) ? (adminAnalytics?.totalUsers || platformUsersList?.length).toString() : undefined },
    { id: 'invitations', label: t('platformInvitations'), icon: MailCheck, badge: (adminAnalytics?.pendingInvitations || platformInvitationsList?.length) ? (adminAnalytics?.pendingInvitations || platformInvitationsList?.length).toString() : undefined },
    { id: 'audit-logs', label: t('auditLogs'), icon: FileSpreadsheet, badge: auditLogsList?.length > 0 ? auditLogsList.length.toString() : undefined },
    { id: 'settings', label: t('platformSettings'), icon: Sliders },
  ];

  // ─── Organization Tenant Navigation (For Org Admins & Members) ────────────
  const orgNavItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'projects', label: t('projects'), icon: Kanban },
    { id: 'tasks', label: t('tasks'), icon: t('myTeamTasks') && isMember ? t('myTeamTasks') : t('tasks'), iconComponent: CheckSquare },
    { id: 'chat', label: t('chat'), icon: MessageSquare },
    { id: 'calendar', label: t('calendar'), icon: Calendar },
    { id: 'files', label: t('files'), icon: FolderOpen },
    { id: 'members', label: t('members'), icon: Users },
    { id: 'settings', label: t('orgSettings'), icon: Settings },
  ];

  const handleLogoutClick = () => {
    setLogoutConfirmOpen(true);
  };

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        height: '100vh',
        background: 'var(--bg-surface)',
        borderRight: isAr ? 'none' : '1px solid var(--border-light)',
        borderLeft: isAr ? '1px solid var(--border-light)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'relative',
        zIndex: 20,
        transition: 'background var(--transition-fast), border-color var(--transition-fast)',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: 'var(--header-height)',
          padding: '0 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '11px',
              background: theme === 'dark'
                ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
              border: theme === 'dark'
                ? '1px solid rgba(56, 189, 248, 0.25)'
                : '1px solid rgba(203, 213, 225, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: theme === 'dark' ? '0 4px 12px rgba(15, 23, 42, 0.25)' : '0 2px 8px rgba(15, 23, 42, 0.06)',
              padding: '6px',
              flexShrink: 0,
              transition: 'all 0.2s ease',
            }}
          >
            <SyncUpLogo size={24} mode={theme} />
          </div>
          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: '17px',
                letterSpacing: '-0.4px',
                color: 'var(--text-main)',
              }}
            >
              Sync<span style={{ color: isPlatformOwner ? '#0284c7' : 'var(--primary)' }}>Up</span>
            </div>
          </div>
        </div>

        <span
          className="badge"
          style={{
            fontSize: '10px',
            padding: '2px 7px',
            background: isPlatformOwner ? 'rgba(2, 132, 199, 0.1)' : 'var(--primary-light)',
            color: isPlatformOwner ? '#0284c7' : 'var(--primary)',
            border: isPlatformOwner ? '1px solid #bae6fd' : '1px solid var(--primary-border)',
            fontWeight: 800,
          }}
        >
          {isPlatformOwner ? 'SUPER ADMIN' : 'B2B SaaS'}
        </span>
      </div>

      {/* Role / Mode Context Banner */}
      {isPlatformOwner ? (
        <div
          style={{
            padding: '12px 16px',
            background: 'var(--bg-subtle)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '11px',
              fontWeight: 800,
              color: '#0284c7',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            <Shield size={13} color="#0284c7" />
            <span>{isAr ? 'وضع مالك المنصة' : 'Platform Owner Mode'}</span>
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '3px', lineHeight: 1.3 }}>
            {isAr ? 'التحكم الكامل بجميع المؤسسات والمشتركين' : 'Full control across all organizations'}
          </div>
        </div>
      ) : (
        /* Workspace Switcher for Organization Admins / Members */
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          {currentOrg ? (
            <div
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-app)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '7px',
                    background: currentOrg.logoUrl ? 'var(--bg-surface)' : 'var(--primary)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '13px',
                    flexShrink: 0,
                    overflow: 'hidden',
                    border: currentOrg.logoUrl ? '1px solid var(--border-light)' : 'none',
                  }}
                >
                  {currentOrg.logoUrl ? (
                    <img
                      src={currentOrg.logoUrl}
                      alt={currentOrg.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    currentOrg.name?.charAt(0) || 'O'
                  )}
                </div>
                <div style={{ textAlign: isAr ? 'right' : 'left', overflow: 'hidden' }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '13px',
                      color: 'var(--text-main)',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                  >
                    {currentOrg.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {currentOrg.memberCount || 1} {isAr ? 'أعضاء' : 'members'}
                  </div>
                </div>
              </div>
              <span
                className={`badge ${currentOrg.status === 'SUSPENDED' ? 'badge-danger' : 'badge-success'}`}
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  background: currentOrg.status === 'SUSPENDED' ? 'var(--danger-bg)' : 'var(--success-bg)',
                  color: currentOrg.status === 'SUSPENDED' ? 'var(--danger)' : 'var(--success)',
                  border: currentOrg.status === 'SUSPENDED' ? '1px solid var(--danger-border)' : '1px solid var(--success-border)',
                }}
              >
                {currentOrg.status === 'SUSPENDED' ? (isAr ? 'معلّق' : 'Suspended') : (isAr ? 'نشط' : 'Active')}
              </span>
            </div>
          ) : (
            <div
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px dashed var(--border-strong)',
                background: 'var(--bg-app)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
                {isAr ? 'لا توجد مؤسسة مخصصة' : 'No Organization Assigned'}
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {isAr ? 'بانتظار مالك المنصة' : 'Awaiting Platform Owner'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Links */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {isPlatformOwner
          ? /* Super Admin Navigation List */
            superAdminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === 'super-admin' && superAdminTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setCurrentView('super-admin');
                    setSuperAdminTab(item.id as any);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '9px',
                    border: 'none',
                    background: isActive ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
                    color: isActive ? '#0284c7' : 'var(--text-secondary)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: isAr ? 'right' : 'left',
                    width: '100%',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={17} strokeWidth={isActive ? 2.4 : 1.8} color={isActive ? '#0284c7' : 'var(--text-muted)'} />
                    <span>{item.label}</span>
                  </div>

                  {'badge' in item && item.badge && (
                    <span className={`badge ${isActive ? 'badge-primary' : 'badge-neutral'}`} style={{ fontSize: '10.5px' }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })
          : /* Organization Tenant Navigation */
            orgNavItems.map((item) => {
              const Icon = (item as any).iconComponent || item.icon;
              const isActive = currentView === item.id;
              const isProjectsItem = item.id === 'projects';

              return (
                <div key={item.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: '9px',
                      background: isActive ? 'var(--primary-light)' : 'transparent',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (currentOrg?.status === 'SUSPENDED' && !isPlatformOwner) {
                          showSnack(
                            isAr ? 'تم تعليق هذه المؤسسة من قِبل إدارة المنصة' : 'This organization is suspended by platform administration',
                            'error'
                          );
                          return;
                        }
                        setCurrentView(item.id as any);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '9px 12px',
                        border: 'none',
                        background: 'transparent',
                        color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '13.5px',
                        cursor: 'pointer',
                        textAlign: isAr ? 'right' : 'left',
                        flex: 1,
                      }}
                    >
                      <Icon size={18} strokeWidth={isActive ? 2.3 : 1.8} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
                      <span>{item.label}</span>
                    </button>

                    {/* Requirement 20: Collapse / Expand icon beside Projects */}
                    {isProjectsItem && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsProjectsExpanded(!isProjectsExpanded);
                        }}
                        style={{
                          padding: '6px 8px',
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        title={isProjectsExpanded ? 'Collapse Projects' : 'Expand Projects'}
                      >
                        {isProjectsExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                      </button>
                    )}
                  </div>

                  {/* Collapsible Project List under Projects (Requirement 20 & 35) */}
                  {isProjectsItem && isProjectsExpanded && accessibleProjects.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        padding: '4px 0 6px 30px',
                        animation: 'fadeIn 0.15s ease-out',
                      }}
                    >
                      {accessibleProjects.map((p) => {
                        const isProjActive = currentView === 'projects' && selectedProjectId === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSelectedProjectId(p.id);
                              setCurrentView('projects');
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '6px 10px',
                              borderRadius: '7px',
                              border: 'none',
                              background: isProjActive ? 'rgba(37, 99, 235, 0.12)' : 'transparent',
                              color: isProjActive ? 'var(--primary)' : 'var(--text-secondary)',
                              fontSize: '12.5px',
                              fontWeight: isProjActive ? 700 : 500,
                              cursor: 'pointer',
                              textAlign: isAr ? 'right' : 'left',
                              width: '100%',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', overflow: 'hidden' }}>
                              <FolderDot size={13} color={isProjActive ? 'var(--primary)' : 'var(--text-muted)'} />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {p.name}
                              </span>
                            </div>
                            <span
                              style={{
                                fontSize: '9.5px',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                background: 'var(--bg-muted)',
                                color: 'var(--text-muted)',
                                textTransform: 'uppercase',
                              }}
                            >
                              {(p as any).projectType || 'Software'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
      </nav>

      {/* User Footer Profile (Requirement 9 & 6) */}
      <div
        style={{
          padding: '14px 16px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface)',
        }}
      >
        <div
          onClick={() => setProfileModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', cursor: 'pointer' }}
          title={t('myProfile')}
        >
          {currentUser?.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name || 'User'}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--primary)',
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              className="avatar"
              style={{
                width: '34px',
                height: '34px',
                background: isPlatformOwner
                  ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                  : 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                fontSize: '12.5px',
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {currentUser?.name ? currentUser.name.split(' ').map((n) => n[0]).join('').substring(0, 2) : 'U'}
            </div>
          )}

          <div style={{ overflow: 'hidden', textAlign: isAr ? 'right' : 'left' }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text-main)',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
              {currentUser?.name || 'Authorized Member'}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: isPlatformOwner ? '#0284c7' : 'var(--text-muted)',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
              {isPlatformOwner ? t('platformOwner') : isMember ? t('teamMember') : t('orgAdmin')}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogoutClick}
          className="btn-ghost"
          style={{ padding: '6px', borderRadius: '6px', cursor: 'pointer', border: 'none' }}
          title={t('logout')}
        >
          <LogOut size={16} color="var(--text-muted)" />
        </button>
      </div>
    </aside>
  );
};
