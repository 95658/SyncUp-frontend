'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import {
  Search,
  Bell,
  Plus,
  Shield,
  HelpCircle,
  Sun,
  Moon,
  Languages,
  MousePointer2,
  User,
  CheckSquare,
  FolderOpen,
  Users,
  MessageSquare,
  X,
  ArrowRight,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentView,
    organizations,
    activeOrgId,
    projects,
    tasks,
    members,
    setSelectedProjectId,
    selectTask,
    setCreateOrgModalOpen,
    setInviteMemberModalOpen,
    setCreateProjectModalOpen,
    setCurrentView,
  } = useWorkspaceStore();
  const { currentUser, activeRole, switchRole } = useAuthStore();
  const {
    theme,
    toggleTheme,
    language,
    setLanguage,
    mouseAnimation,
    toggleMouseAnimation,
    setProfileModalOpen,
    setNotificationOpen,
    t,
  } = useUIStore();
  const { unreadCount } = useNotificationsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const isPlatformOwner = currentUser?.isPlatformOwner || activeRole === 'PLATFORM_OWNER';
  const currentOrg = organizations.find((o) => o.id === activeOrgId) || organizations[0];
  const unread = unreadCount();
  const isAr = language === 'ar';

  // Requirement 3: Global keyboard shortcut (Cmd+K / Ctrl+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close search popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const q = searchQuery.toLowerCase().trim();

  // Search Results
  const matchingTasks = q ? tasks.filter((t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)) : [];
  const matchingProjects = q ? projects.filter((p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)) : [];
  const matchingMembers = q ? members.filter((m) => m.user?.name?.toLowerCase().includes(q) || m.user?.email?.toLowerCase().includes(q) || m.team?.toLowerCase().includes(q)) : [];
  const totalResults = matchingTasks.length + matchingProjects.length + matchingMembers.length;

  return (
    <header
      style={{
        height: 'var(--header-height)',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        transition: 'background var(--transition-fast), border-color var(--transition-fast)',
      }}
    >
      {/* Search Input & Interactive Dropdown (Requirement 3) */}
      <div ref={searchContainerRef} style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, maxWidth: '440px', position: 'relative' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', [isAr ? 'right' : 'left']: '12px' }} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={
              isPlatformOwner
                ? t('searchAdminPlaceholder')
                : t('searchPlaceholder')
            }
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            style={{
              width: '100%',
              padding: isAr ? '9px 36px 9px 40px' : '9px 40px 9px 36px',
              borderRadius: '10px',
              border: isSearchOpen ? '1px solid var(--primary)' : '1px solid var(--border-light)',
              background: 'var(--bg-app)',
              fontSize: '13px',
              outline: 'none',
              color: 'var(--text-main)',
              transition: 'all 0.15s ease',
              boxShadow: isSearchOpen ? '0 0 0 3px rgba(37, 99, 235, 0.12)' : 'none',
            }}
          />
          <span
            onClick={() => {
              setIsSearchOpen(true);
              searchInputRef.current?.focus();
            }}
            style={{
              position: 'absolute',
              [isAr ? 'left' : 'right']: '10px',
              fontSize: '11px',
              fontWeight: 700,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-muted)',
              padding: '2px 5px',
              borderRadius: '4px',
              fontFamily: 'var(--font-family-mono)',
              cursor: 'pointer',
            }}
          >
            ⌘K
          </span>
        </div>

        {/* Search Results Dropdown Popover */}
        {isSearchOpen && (
          <div
            className="card"
            style={{
              position: 'absolute',
              top: '48px',
              left: 0,
              right: 0,
              maxHeight: '400px',
              overflowY: 'auto',
              background: 'var(--bg-surface)',
              borderRadius: '14px',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 9999,
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              animation: 'fadeIn 0.15s ease-out',
            }}
          >
            {/* Header info */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px 6px 4px', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {q ? (isAr ? `نتائج البحث عن "${q}"` : `Results for "${q}"`) : (isAr ? 'البحث السريع' : 'Quick Navigation')}
              </span>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={14} />
              </button>
            </div>

            {/* If query entered but no results */}
            {q && totalResults === 0 && (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                {isAr ? 'لم يتم العثور على نتائج مطابقة' : 'No matching tasks, projects, or members found.'}
              </div>
            )}

            {/* Quick shortcuts if query is empty */}
            {!q && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('tasks');
                    setIsSearchOpen(false);
                  }}
                  className="btn-ghost"
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '8px', textAlign: 'left', width: '100%', fontSize: '13px' }}
                >
                  <CheckSquare size={16} color="var(--primary)" />
                  <span style={{ flex: 1, color: 'var(--text-main)', fontWeight: 600 }}>{isAr ? 'عرض كل المهام عبر المشاريع' : 'All Tasks across Sprints'}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tasks</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('projects');
                    setIsSearchOpen(false);
                  }}
                  className="btn-ghost"
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '8px', textAlign: 'left', width: '100%', fontSize: '13px' }}
                >
                  <FolderOpen size={16} color="#0284c7" />
                  <span style={{ flex: 1, color: 'var(--text-main)', fontWeight: 600 }}>{isAr ? 'لوحة المشاريع والسبرنت' : 'Projects & Sprints Board'}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Projects</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('members');
                    setIsSearchOpen(false);
                  }}
                  className="btn-ghost"
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '8px', textAlign: 'left', width: '100%', fontSize: '13px' }}
                >
                  <Users size={16} color="#10b981" />
                  <span style={{ flex: 1, color: 'var(--text-main)', fontWeight: 600 }}>{isAr ? 'أعضاء الفريق وفرق العمل' : 'Team Members & Directory'}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Members</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('chat');
                    setIsSearchOpen(false);
                  }}
                  className="btn-ghost"
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '8px', textAlign: 'left', width: '100%', fontSize: '13px' }}
                >
                  <MessageSquare size={16} color="#7c3aed" />
                  <span style={{ flex: 1, color: 'var(--text-main)', fontWeight: 600 }}>{isAr ? 'المحادثات والقنوات' : 'Team Channels & Chat'}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Chat</span>
                </button>
              </div>
            )}

            {/* Task Results */}
            {matchingTasks.length > 0 && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                  {isAr ? 'المهام' : 'Tasks'} ({matchingTasks.length})
                </div>
                {matchingTasks.slice(0, 4).map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => {
                      selectTask(task.id);
                      setCurrentView('tasks');
                      setIsSearchOpen(false);
                    }}
                    className="btn-ghost"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      width: '100%',
                      textAlign: 'left',
                      marginBottom: '2px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <CheckSquare size={14} color="var(--primary)" />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {task.title}
                      </span>
                    </div>
                    <span className="badge badge-primary" style={{ fontSize: '10px' }}>
                      {task.status}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Project Results */}
            {matchingProjects.length > 0 && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                  {isAr ? 'المشاريع' : 'Projects'} ({matchingProjects.length})
                </div>
                {matchingProjects.slice(0, 3).map((proj) => (
                  <button
                    key={proj.id}
                    type="button"
                    onClick={() => {
                      setSelectedProjectId(proj.id);
                      setCurrentView('projects');
                      setIsSearchOpen(false);
                    }}
                    className="btn-ghost"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      width: '100%',
                      textAlign: 'left',
                      marginBottom: '2px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FolderOpen size={14} color="#0284c7" />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                        {proj.name}
                      </span>
                    </div>
                    <span className="badge badge-success" style={{ fontSize: '10px' }}>
                      {proj.status}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Member Results */}
            {matchingMembers.length > 0 && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                  {isAr ? 'الأعضاء' : 'Members'} ({matchingMembers.length})
                </div>
                {matchingMembers.slice(0, 3).map((mem) => (
                  <button
                    key={mem.id}
                    type="button"
                    onClick={() => {
                      setCurrentView('members');
                      setIsSearchOpen(false);
                    }}
                    className="btn-ghost"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      width: '100%',
                      textAlign: 'left',
                      marginBottom: '2px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={14} color="#10b981" />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                        {mem.user?.name}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        ({mem.user?.email})
                      </span>
                    </div>
                    <span className="badge badge-purple" style={{ fontSize: '10px' }}>
                      {mem.role}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Quick Add Action */}
        {isPlatformOwner ? (
          <button
            type="button"
            className="btn btn-primary"
            style={{
              padding: '7px 14px',
              fontSize: '12.5px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            }}
            onClick={() => setCreateOrgModalOpen(true)}
          >
            <Plus size={15} />
            <span>{t('provisionOrg')}</span>
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: '7px 14px', fontSize: '12.5px' }}
            onClick={() => {
              if (currentView === 'members') {
                setInviteMemberModalOpen(true);
              } else if (currentView === 'projects') {
                setCreateProjectModalOpen(true);
              } else {
                setCurrentView('projects');
                setCreateProjectModalOpen(true);
              }
            }}
          >
            <Plus size={15} />
            <span>
              {currentView === 'members'
                ? t('addMember')
                : currentView === 'projects'
                ? t('newProject')
                : t('newTask')}
            </span>
          </button>
        )}

        {/* Role Badge: Switchable ONLY for Platform Owner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            background: isPlatformOwner ? 'rgba(2, 132, 199, 0.1)' : 'var(--bg-app)',
            borderRadius: '9999px',
            border: isPlatformOwner ? '1px solid #bae6fd' : '1px solid var(--border-light)',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}
        >
          <Shield size={13} color={isPlatformOwner ? '#0284c7' : 'var(--primary)'} />
          {isPlatformOwner ? (
            <select
              value={activeRole}
              onChange={(e) => {
                const newRole = e.target.value as any;
                switchRole(newRole);
                if (newRole === 'PLATFORM_OWNER') {
                  setCurrentView('super-admin');
                } else {
                  setCurrentView('dashboard');
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                fontWeight: 700,
                fontSize: '11.5px',
                color: '#0284c7',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="PLATFORM_OWNER">Platform Owner</option>
              <option value="ORG_ADMIN">Org Admin</option>
              <option value="ORG_MEMBER">Team Member</option>
            </select>
          ) : (
            <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '11.5px' }}>
              {activeRole === 'ORG_ADMIN' ? t('orgAdmin') : t('teamMember')}
            </span>
          )}
        </div>

        {/* Language Switcher (Requirement 2) */}
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '6px 10px',
            borderRadius: '8px',
            border: '1px solid var(--border-light)',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--text-main)',
          }}
          title={isAr ? 'التبديل إلى الإنجليزية' : 'Switch to Arabic'}
        >
          <Languages size={15} color="var(--primary)" />
          <span>{language === 'en' ? 'عربي' : 'EN'}</span>
        </button>

        {/* Dark Mode Toggle (Requirement 3) */}
        <button
          type="button"
          className="btn-ghost"
          onClick={toggleTheme}
          style={{
            padding: '7px',
            borderRadius: '8px',
            border: '1px solid var(--border-light)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
          title={theme === 'light' ? 'Enable Dark Mode' : 'Enable Light Mode'}
        >
          {theme === 'light' ? (
            <Moon size={16} color="var(--text-secondary)" />
          ) : (
            <Sun size={16} color="#f59e0b" />
          )}
        </button>

        {/* Mouse Animation Toggle (Requirement 4) */}
        <button
          type="button"
          className="btn-ghost"
          onClick={toggleMouseAnimation}
          style={{
            padding: '7px',
            borderRadius: '8px',
            border: '1px solid var(--border-light)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: mouseAnimation ? 'var(--primary)' : 'var(--text-muted)',
          }}
          title={mouseAnimation ? 'Mouse Animation: Enabled' : 'Mouse Animation: Disabled'}
        >
          <MousePointer2 size={16} />
        </button>

        {/* Notifications Icon with Badge (Requirement 10) */}
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setNotificationOpen(true)}
          style={{
            position: 'relative',
            padding: '7px',
            borderRadius: '8px',
            cursor: 'pointer',
            border: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
          }}
          title={t('notifications')}
        >
          <Bell size={16} color="var(--text-secondary)" />
          {unread > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                minWidth: '16px',
                height: '16px',
                borderRadius: '9999px',
                background: '#ef4444',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 3px',
                border: '1.5px solid var(--bg-surface)',
              }}
            >
              {unread}
            </span>
          )}
        </button>

        {/* User Profile Avatar (Requirement 9) */}
        <div
          onClick={() => setProfileModalOpen(true)}
          title={t('myProfile')}
          style={{
            cursor: 'pointer',
            position: 'relative',
          }}
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
                boxShadow: 'var(--shadow-xs)',
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
                fontSize: '12px',
                fontWeight: 800,
                boxShadow: isPlatformOwner ? '0 2px 6px rgba(2, 132, 199, 0.25)' : '0 2px 6px rgba(37, 99, 235, 0.25)',
              }}
            >
              {currentUser?.name ? currentUser.name.split(' ').map((n) => n[0]).join('').substring(0, 2) : 'U'}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
