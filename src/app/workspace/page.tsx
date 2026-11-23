'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { ProjectsBoardView } from '@/components/projects/ProjectsBoardView';
import { AllTasksView } from '@/components/tasks/AllTasksView';
import { ChatView } from '@/components/chat/ChatView';
import { CalendarView } from '@/components/calendar/CalendarView';
import { MembersView } from '@/components/members/MembersView';
import { FilesView } from '@/components/files/FilesView';
import { OrgSettingsView } from '@/components/settings/OrgSettingsView';
import { FirstOrgOnboarding } from '@/components/onboarding/FirstOrgOnboarding';
import { SuperAdminView } from '@/components/super-admin/SuperAdminView';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
import { MouseFollower } from '@/components/ui/MouseFollower';
import { AnimatedIndicator } from '@/components/ui/AnimatedIndicator';
import { SnackbarContainer } from '@/components/ui/Snackbar';
import { LogoutConfirmModal } from '@/components/ui/LogoutConfirmModal';
import { UserProfileModal } from '@/components/ui/UserProfileModal';
import { NotificationsDrawer } from '@/components/notifications/NotificationsDrawer';
import { NotificationDetailModal } from '@/components/notifications/NotificationDetailModal';
import { SprintEstimationModal } from '@/components/projects/SprintEstimationModal';
import { usePushNotifications } from '@/hooks/notifications/usePushNotifications';
import { Building2, ShieldAlert } from 'lucide-react';

export default function WorkspacePage() {
  usePushNotifications();
  const router = useRouter();
  const { currentView, setCurrentView, syncFromBackend, organizations } = useWorkspaceStore();
  const { currentUser, activeRole, isAuthenticated, checkAuth } = useAuthStore();
  const { theme, language } = useUIStore();
  const [mounted, setMounted] = useState(false);

  // Multi-tab logout sync & auth verification (TC-AUTH-019)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'syncup_token' && !e.newValue) {
        useAuthStore.getState().logoutUser();
        router.replace('/auth/login');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [router]);

  // Requirement 7, 3 & 1: Always verify auth state, prevent forward navigation from login, ensure correct landing role
  useEffect(() => {
    setMounted(true);
    useUIStore.getState().initUIFromStorage();

    const authed = checkAuth();
    if (!authed) {
      router.replace('/auth/login');
      return;
    }

    // Role-specific routing: Platform Owner lands in super-admin, Org Admin lands in tenant workspace
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('syncup_user') : null;
    let isOwner = false;
    if (storedUser) {
      try {
        isOwner = JSON.parse(storedUser).isPlatformOwner;
      } catch {}
    }

    if (isOwner) {
      useWorkspaceStore.getState().setCurrentView('super-admin');
    } else {
      const savedView = typeof window !== 'undefined' ? localStorage.getItem('syncup_current_view') : null;
      if (savedView && savedView !== 'super-admin') {
        useWorkspaceStore.getState().setCurrentView(savedView as any);
      } else {
        useWorkspaceStore.getState().setCurrentView('dashboard');
      }
    }

    syncFromBackend();
  }, [checkAuth, router, syncFromBackend]);

  // Enforce session check on browser back/forward or focus
  useEffect(() => {
    const handleAuthCheck = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('syncup_access_token') : null;
      const authed = checkAuth();
      if (!token || !authed) {
        router.replace('/auth/login');
      }
    };

    window.addEventListener('pageshow', handleAuthCheck);
    window.addEventListener('popstate', handleAuthCheck);
    window.addEventListener('focus', handleAuthCheck);

    return () => {
      window.removeEventListener('pageshow', handleAuthCheck);
      window.removeEventListener('popstate', handleAuthCheck);
      window.removeEventListener('focus', handleAuthCheck);
    };
  }, [checkAuth, router]);

  // Synchronize document theme and direction
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', language);
    }
  }, [theme, language]);

  const isPlatformOwner = currentUser?.isPlatformOwner || activeRole === 'PLATFORM_OWNER';

  useEffect(() => {
    if (isPlatformOwner && currentView === 'dashboard') {
      setCurrentView('super-admin');
    }
  }, [isPlatformOwner, currentView, setCurrentView]);

  if (!mounted || !isAuthenticated || !currentUser) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-app)',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '3px solid var(--border-light)',
            borderTopColor: 'var(--primary)',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>
          Securing workspace session...
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const renderActiveView = () => {
    if (isPlatformOwner) {
      return <SuperAdminView />;
    }

    const activeOrg = organizations.find((o) => o.id === useWorkspaceStore.getState().activeOrgId) || organizations[0] || null;

    // Requirement: If non-platform owner's organization is SUSPENDED, block all workspace views
    if (!isPlatformOwner && activeOrg && activeOrg.status === 'SUSPENDED') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '32px', textAlign: 'center' }}>
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '24px',
              background: 'var(--danger-bg)',
              color: 'var(--danger)',
              border: '2px solid var(--danger-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              boxShadow: '0 12px 32px rgba(239, 68, 68, 0.22)',
            }}
          >
            <ShieldAlert size={44} />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 14px',
              borderRadius: '9999px',
              background: 'var(--danger-bg)',
              color: 'var(--danger-text)',
              border: '1px solid var(--danger-border)',
              fontSize: '12px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              marginBottom: '16px',
            }}
          >
            <span>{language === 'ar' ? 'مؤسسة معلّقة' : 'Organization Suspended'}</span>
          </div>

          <h2 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-main)', marginBottom: '12px' }}>
            {language === 'ar' ? `تم تعليق مساحة عمل ${activeOrg.name}` : `${activeOrg.name} Workspace is Suspended`}
          </h2>

          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '520px', lineHeight: 1.6, marginBottom: '28px' }}>
            {language === 'ar'
              ? `تم تعليق هذه المؤسسة من قِبل مالك المنصة (أحمد عبد الفتاح). تم إيقاف الوصول إلى المشاريع، المهام، قنوات المحادثة، والملفات مؤقتاً. يرجى التواصل مع إدارة المنصة لإعادة التفعيل.`
              : `This organization has been suspended by Platform Owner Ahmed Abdelfatah. Access to projects, tasks, chat, and files is temporarily locked. Please contact platform administration to reactivate.`}
          </p>

          <div
            style={{
              background: 'var(--bg-surface)',
              padding: '18px 24px',
              borderRadius: '16px',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              maxWidth: '440px',
              width: '100%',
              marginBottom: '28px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
              <span style={{ color: 'var(--text-muted)' }}>{language === 'ar' ? 'اسم المؤسسة:' : 'Organization:'}</span>
              <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{activeOrg.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
              <span style={{ color: 'var(--text-muted)' }}>{language === 'ar' ? 'حالة الحساب:' : 'Account Status:'}</span>
              <span style={{ fontWeight: 800, color: 'var(--danger)' }}>SUSPENDED</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
              <span style={{ color: 'var(--text-muted)' }}>{language === 'ar' ? 'المسؤول:' : 'Admin Lead:'}</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{currentUser?.email || activeOrg.adminEmail}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => useUIStore.getState().setLogoutConfirmOpen(true)}
              className="btn btn-secondary"
              style={{ padding: '10px 22px', fontSize: '13.5px', fontWeight: 700 }}
            >
              {language === 'ar' ? 'تسجيل الخروج' : 'Log Out'}
            </button>
            <a
              href="mailto:aabdelfatah732@gmail.com?subject=Reactivate%20Organization%20Request"
              className="btn btn-primary"
              style={{ padding: '10px 22px', fontSize: '13.5px', fontWeight: 700, textDecoration: 'none' }}
            >
              {language === 'ar' ? 'مراسلة إدارة المنصة' : 'Contact Platform Support'}
            </a>
          </div>
        </div>
      );
    }

    // Only Platform Owner can create organizations. If an org admin has no assigned org:
    if (!isPlatformOwner && organizations.length === 0) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '75vh', padding: '24px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '16px', boxShadow: 'var(--shadow-md)' }}>
            <Building2 size={32} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            {language === 'ar' ? 'لا توجد مؤسسة مخصصة لحسابك حتى الآن' : 'No Organization Assigned Yet'}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '440px', lineHeight: 1.5 }}>
            {language === 'ar'
              ? 'إنشاء وتخصيص المؤسسات متاح حصرياً لمالك المنصة (Platform Owner). يرجى التواصل مع إدارة المنصة لتزويد مؤسستك وتفعيل حسابك.'
              : 'Organization provisioning is strictly restricted to the Platform Owner. Please contact the platform administration to provision your organization.'}
          </p>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'projects':
        return <ProjectsBoardView />;
      case 'tasks':
        return <AllTasksView />;
      case 'chat':
        return <ChatView />;
      case 'calendar':
        return <CalendarView />;
      case 'files':
        return <FilesView />;
      case 'members':
        return <MembersView />;
      case 'settings':
        return <OrgSettingsView />;
      case 'super-admin':
        return <SuperAdminView />;
      default:
        return isPlatformOwner ? <SuperAdminView /> : <DashboardView />;
    }
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Interactive Mouse Trail / Glow Animation */}
      <MouseFollower />

      {/* Global Animated Progress / Loading Indicator */}
      <AnimatedIndicator />

      {/* Left Application Sidebar with Collapsible Projects */}
      <Sidebar />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Header />

        <main key={currentView} className="animate-fade-in" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-app)' }}>
          {renderActiveView()}
        </main>
      </div>

      {/* Task Detail Slide-over Modal */}
      <TaskDetailModal />

      {/* Flutter-style Bottom SnackBar Container */}
      <SnackbarContainer />

      {/* Modals & Drawers */}
      <LogoutConfirmModal />
      <UserProfileModal />
      <NotificationsDrawer />
      <NotificationDetailModal />
      <SprintEstimationModal />
    </div>
  );
}
