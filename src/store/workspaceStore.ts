import { create } from 'zustand';
import { Task, Project, OrganizationMember, Meeting, ActivityItem, Organization, TaskStatus, Sprint, Team } from '@/types';
import { superAdminApi, tasksApi, organizationsApi, projectsApi } from '@/lib/api';

export type SuperAdminTab = 'overview' | 'organizations' | 'administrators' | 'users' | 'invitations' | 'audit-logs' | 'settings';

interface WorkspaceState {
  currentView: 'dashboard' | 'projects' | 'tasks' | 'chat' | 'calendar' | 'files' | 'members' | 'settings' | 'super-admin';
  superAdminTab: SuperAdminTab;
  projectActiveTab: 'overview' | 'backlog' | 'board' | 'list' | 'calendar' | 'files' | 'quality' | 'settings';
  selectedTaskId: string | null;
  selectedProjectId: string | null;
  activeOrgId: string;
  organizations: Organization[];
  projects: Project[];
  tasks: Task[];
  sprints: Sprint[];
  members: OrganizationMember[];
  teams: Team[];
  meetings: Meeting[];
  activities: ActivityItem[];
  isCreateOrgModalOpen: boolean;
  isInviteMemberModalOpen: boolean;
  isCreateProjectModalOpen: boolean;

  // Super Admin Datasets
  adminAnalytics: {
    totalOrganizations: number;
    activeOrganizations: number;
    totalUsers: number;
    activeUsers: number;
    pendingInvitations: number;
    totalTasks: number;
    systemHealth: string;
  };
  administratorsList: any[];
  platformUsersList: any[];
  platformInvitationsList: any[];
  auditLogsList: any[];
  isLoading: boolean;

  // Actions
  setCurrentView: (view: WorkspaceState['currentView']) => void;
  setSuperAdminTab: (tab: SuperAdminTab) => void;
  setProjectActiveTab: (tab: WorkspaceState['projectActiveTab']) => void;
  selectTask: (taskId: string | null) => void;
  setSelectedProjectId: (id: string | null) => void;
  setActiveOrgId: (orgId: string) => void;
  
  // Organization Management
  createOrganization: (data: { name: string; slug?: string; industry?: string; companySize?: string; adminName?: string; adminEmail?: string; adminPassword?: string }) => Promise<Organization>;
  setOrgAdminPassword: (orgId: string, newPassword: string) => Promise<void>;
  toggleOrgStatus: (orgId: string, currentStatus: string) => Promise<void>;
  
  // Member Management
  addNewMember: (memberData: any) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  toggleMemberStatus: (memberId: string) => Promise<void>;
  updateMemberDetails: (memberId: string, updates: Partial<OrganizationMember> & { name?: string; jobTitle?: string }) => Promise<void>;
  assignMemberToTeam: (memberId: string, teamName: string) => Promise<void>;
  assignMemberToProjects: (memberId: string, projectIds: string[]) => Promise<void>;

  // Team Management
  createTeam: (teamData: { name: string; description?: string; color?: string; leadId?: string; projectIds?: string[] }) => Promise<Team>;
  updateTeam: (teamId: string, updates: Partial<Team>) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;

  // Jira Sprints & Backlog Management
  createSprint: (projectId: string, name: string, goal?: string) => Promise<Sprint>;
  startSprint: (sprintId: string, durationWeeks?: number, goal?: string) => Promise<void>;
  completeSprint: (sprintId: string) => Promise<void>;
  moveTaskToSprint: (taskId: string, sprintId: string | null) => Promise<void>;
  updateSprint: (sprintId: string, updates: Partial<Sprint>) => Promise<void>;
  deleteSprint: (sprintId: string) => Promise<void>;

  // Tasks & Projects
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  addComment: (taskId: string, text: string) => Promise<void>;
  addNewTask: (newTask: Omit<Task, 'id' | 'comments' | 'attachments'>) => Promise<Task>;
  createProject: (data: { name: string; description?: string; projectType?: string; dueDate?: string }) => Promise<any>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;

  setCreateOrgModalOpen: (open: boolean) => void;
  setInviteMemberModalOpen: (open: boolean) => void;
  setCreateProjectModalOpen: (open: boolean) => void;
  syncFromBackend: (preferredOrgId?: string) => Promise<void>;
  loadOrgData: (orgId: string) => Promise<void>;
}

// Helpers for localStorage persistence
const loadFromStorage = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = (key: string, value: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }
};

const getInitialView = (): WorkspaceState['currentView'] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('syncup_current_view');
    if (saved) return saved as WorkspaceState['currentView'];
  }
  return 'dashboard';
};

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  currentView: getInitialView(),
  superAdminTab: 'overview',
  projectActiveTab: 'board',
  selectedTaskId: null,
  selectedProjectId: null,
  activeOrgId: typeof window !== 'undefined' ? (localStorage.getItem('syncup_active_org_id') || '') : '',
  isCreateOrgModalOpen: false,
  isInviteMemberModalOpen: false,
  isCreateProjectModalOpen: false,
  isLoading: false,

  // Clean initial data - loaded from persistent storage if user created them
  organizations: loadFromStorage<Organization[]>('syncup_orgs', []),
  projects: [],
  tasks: [],
  sprints: [],
  members: [],
  teams: [],
  meetings: [],
  activities: [],

  adminAnalytics: {
    totalOrganizations: 0,
    activeOrganizations: 0,
    totalUsers: 0,
    activeUsers: 0,
    pendingInvitations: 0,
    totalTasks: 0,
    systemHealth: '100% Operational',
  },
  administratorsList: [],
  platformUsersList: [],
  platformInvitationsList: [],
  auditLogsList: [],

  setCurrentView: (view) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('syncup_current_view', view);
    }
    set({ currentView: view });
  },

  setSuperAdminTab: (tab) => set({ superAdminTab: tab }),
  setProjectActiveTab: (tab) => set({ projectActiveTab: tab }),
  selectTask: (taskId) => set({ selectedTaskId: taskId }),
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),

  setActiveOrgId: (orgId) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('syncup_active_org_id', orgId);
    }
    set({ activeOrgId: orgId });
    get().loadOrgData(orgId);
  },

  setCreateOrgModalOpen: (open) => set({ isCreateOrgModalOpen: open }),
  setInviteMemberModalOpen: (open) => set({ isInviteMemberModalOpen: open }),
  setCreateProjectModalOpen: (open) => set({ isCreateProjectModalOpen: open }),

  // ─── Production First Organization Creator ──────────────────────────────────
  createOrganization: async (data) => {
    set({ isLoading: true });
    const userRaw = typeof window !== 'undefined' ? localStorage.getItem('syncup_user') : null;
    let currentUser: any = null;
    try {
      if (userRaw) currentUser = JSON.parse(userRaw);
    } catch {}

    const adminName = data.adminName || currentUser?.name || 'Owner';
    const adminEmail = data.adminEmail || currentUser?.email || 'owner@' + (data.slug || 'company') + '.com';

    // 1. Attempt API
    let res: any = null;
    try {
      res = await superAdminApi.createOrganization({
        name: data.name,
        adminName,
        adminEmail,
      });
    } catch (e) {
      console.warn('API org creation, creating locally:', e);
    }

    const adminPassword = data.adminPassword || `${data.name.replace(/\s+/g, '')}#Admin2026!`;

    const newOrg: Organization = {
      id: res?.organization?.id || res?.id || 'org-' + Date.now(),
      name: data.name.trim(),
      slug: (data.slug || data.name.toLowerCase().replace(/\s+/g, '-')).trim(),
      adminName,
      adminEmail,
      adminPassword,
      memberCount: 1,
      status: 'ACTIVE',
      plan: 'PRO',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    const updatedOrgs = [newOrg, ...get().organizations.filter((o) => o.id !== newOrg.id)];
    saveToStorage('syncup_orgs', updatedOrgs);

    // Initial Owner Member
    const ownerMember: OrganizationMember = {
      id: 'mem-' + Date.now(),
      userId: currentUser?.id || 'owner-user',
      user: {
        id: currentUser?.id || 'owner-user',
        name: adminName,
        email: adminEmail,
        isPlatformOwner: false,
        status: 'ACTIVE',
        jobTitle: 'Organization Owner',
      },
      organizationId: newOrg.id,
      role: 'OWNER',
      team: 'Leadership',
      status: 'ACTIVE',
      isOnline: true,
      joinedAt: 'Today',
    };

    saveToStorage(`syncup_members_${newOrg.id}`, [ownerMember]);
    saveToStorage(`syncup_projects_${newOrg.id}`, []);
    saveToStorage(`syncup_tasks_${newOrg.id}`, []);
    saveToStorage(`syncup_sprints_${newOrg.id}`, []);
    const initialOrgTeams: Team[] = [
      { id: `team-core-${newOrg.id}`, organizationId: newOrg.id, name: 'Core Engineering', description: 'Primary software engineering and architecture team.', color: '#2563eb', createdAt: 'Today' },
      { id: `team-qa-${newOrg.id}`, organizationId: newOrg.id, name: 'Quality Assurance & Testing', description: 'QA team responsible for sprint verification and staging sign-off.', color: '#10b981', createdAt: 'Today' },
    ];
    saveToStorage(`syncup_teams_${newOrg.id}`, initialOrgTeams);

    set({
      organizations: updatedOrgs,
      activeOrgId: newOrg.id,
      teams: initialOrgTeams,
      adminAnalytics: {
        ...get().adminAnalytics,
        totalOrganizations: updatedOrgs.length,
        activeOrganizations: updatedOrgs.filter((o) => o.status === 'ACTIVE').length,
      },
      members: [ownerMember],
      projects: [],
      tasks: [],
      sprints: [],
      isCreateOrgModalOpen: false,
      isLoading: false,
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('syncup_active_org_id', newOrg.id);
    }

    return newOrg;
  },

  // ─── Member Actions ────────────────────────────────────────────────────────
  addNewMember: async (memberData) => {
    const { activeOrgId, members, projects } = get();
    if (!activeOrgId) return;

    const assignedProjectIds = memberData.assignedProjectIds || (memberData.projectId ? [memberData.projectId] : []);
    const memberEmail = memberData.email || memberData.user?.email || '';
    const memberName = memberData.name || memberData.user?.name || memberEmail.split('@')[0];
    const memberTitle = memberData.jobTitle || memberData.user?.jobTitle || 'Team Member';
    const memberPassword = memberData.password || `SyncUp#${Math.floor(1000 + Math.random() * 9000)}`;

    const newMem: OrganizationMember = {
      id: `mem-${Date.now()}`,
      userId: `u-${Date.now()}`,
      user: {
        id: `u-${Date.now()}`,
        name: memberName,
        email: memberEmail,
        jobTitle: memberTitle,
        isPlatformOwner: false,
        status: 'ACTIVE',
      },
      organizationId: activeOrgId,
      role: memberData.role || 'MEMBER',
      team: memberData.team || 'Core Engineering',
      password: memberPassword,
      assignedProjectIds,
      status: 'ACTIVE',
      isOnline: true,
      joinedAt: 'Today',
    };

    const updated = [newMem, ...members.filter((m) => m.user?.email?.toLowerCase() !== memberEmail.toLowerCase())];
    saveToStorage(`syncup_members_${activeOrgId}`, updated);

    // Save credentials to localStorage for instant seamless sign-in
    if (typeof window !== 'undefined' && memberEmail) {
      try {
        const rawCreds = localStorage.getItem('syncup_member_credentials');
        const credsMap = rawCreds ? JSON.parse(rawCreds) : {};
        credsMap[memberEmail.toLowerCase().trim()] = {
          password: memberPassword,
          orgId: activeOrgId,
          name: memberName,
          role: newMem.role,
          jobTitle: memberTitle,
          team: newMem.team,
          projectIds: assignedProjectIds,
        };
        localStorage.setItem('syncup_member_credentials', JSON.stringify(credsMap));
      } catch (e) {
        console.warn('Failed to save member credentials:', e);
      }
    }

    // If projects were assigned, update their teamMembers lists
    let updatedProjects = projects;
    if (assignedProjectIds.length > 0) {
      updatedProjects = updatedProjects.map((p) => {
        if (assignedProjectIds.includes(p.id)) {
          const alreadyIn = (p.teamMembers || []).some((tm) => tm.id === newMem.userId || tm.id === newMem.id);
          if (!alreadyIn) {
            return {
              ...p,
              teamMembers: [...(p.teamMembers || []), { id: newMem.userId, name: newMem.user.name }],
            };
          }
        }
        return p;
      });
      saveToStorage(`syncup_projects_${activeOrgId}`, updatedProjects);
    }

    set({ members: updated, projects: updatedProjects });

    // Try backend sync silently without blocking UI
    organizationsApi.inviteMember(activeOrgId, { email: memberEmail, role: memberData.role || 'MEMBER' }).catch(() => null);
  },

  removeMember: async (memberId) => {
    const { activeOrgId, members } = get();
    const updated = members.filter((m) => m.id !== memberId);
    saveToStorage(`syncup_members_${activeOrgId}`, updated);
    set({ members: updated });
  },

  toggleMemberStatus: async (memberId) => {
    const { activeOrgId, members } = get();
    const updated = members.map((m) =>
      m.id === memberId
        ? { ...m, status: (m.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE') as any }
        : m
    );
    saveToStorage(`syncup_members_${activeOrgId}`, updated);
    set({ members: updated });
  },

  updateMemberDetails: async (memberId, updates) => {
    const { activeOrgId, members, projects } = get();
    const updated = members.map((m) => {
      if (m.id !== memberId) return m;
      const newPass = updates.password !== undefined ? updates.password : m.password;
      return {
        ...m,
        role: updates.role || m.role,
        team: updates.team !== undefined ? updates.team : m.team,
        password: newPass,
        assignedProjectIds: updates.assignedProjectIds !== undefined ? updates.assignedProjectIds : m.assignedProjectIds,
        user: {
          ...m.user,
          name: updates.name || m.user.name,
          jobTitle: updates.jobTitle || m.user.jobTitle,
        },
      };
    });

    if (activeOrgId) {
      saveToStorage(`syncup_members_${activeOrgId}`, updated);
    }

    // Also update syncup_member_credentials if member exists
    const target = updated.find((m) => m.id === memberId);
    if (typeof window !== 'undefined' && target?.user?.email) {
      try {
        const rawCreds = localStorage.getItem('syncup_member_credentials');
        const credsMap = rawCreds ? JSON.parse(rawCreds) : {};
        const emailKey = target.user.email.toLowerCase().trim();
        credsMap[emailKey] = {
          ...credsMap[emailKey],
          password: target.password,
          orgId: activeOrgId,
          role: target.role,
          name: target.user.name,
          jobTitle: target.user.jobTitle,
        };
        localStorage.setItem('syncup_member_credentials', JSON.stringify(credsMap));
      } catch (e) {
        console.warn('Credentials sync error:', e);
      }
    }

    // Also update project teamMembers if assignedProjectIds was updated
    let updatedProjects = projects;
    if (updates.assignedProjectIds !== undefined) {
      const memberObj = updated.find((m) => m.id === memberId);
      if (memberObj) {
        updatedProjects = projects.map((p) => {
          const isAssigned = updates.assignedProjectIds!.includes(p.id);
          const hasMember = (p.teamMembers || []).some((tm) => tm.id === memberObj.userId || tm.id === memberObj.id);
          if (isAssigned && !hasMember) {
            return {
              ...p,
              teamMembers: [...(p.teamMembers || []), { id: memberObj.userId, name: memberObj.user.name }],
            };
          }
          if (!isAssigned && hasMember) {
            return {
              ...p,
              teamMembers: (p.teamMembers || []).filter((tm) => tm.id !== memberObj.userId && tm.id !== memberObj.id),
            };
          }
          return p;
        });
        if (activeOrgId) saveToStorage(`syncup_projects_${activeOrgId}`, updatedProjects);
      }
    }

    set({ members: updated, projects: updatedProjects });
  },

  assignMemberToTeam: async (memberId, teamName) => {
    const { activeOrgId, members } = get();
    const updated = members.map((m) => (m.id === memberId ? { ...m, team: teamName } : m));
    if (activeOrgId) saveToStorage(`syncup_members_${activeOrgId}`, updated);
    set({ members: updated });
  },

  assignMemberToProjects: async (memberId, projectIds) => {
    await get().updateMemberDetails(memberId, { assignedProjectIds: projectIds });
  },

  // ─── Team Management ───────────────────────────────────────────────────────
  createTeam: async (teamData) => {
    const { activeOrgId, teams, members } = get();
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      organizationId: activeOrgId,
      name: teamData.name.trim(),
      description: teamData.description?.trim() || '',
      color: teamData.color || '#2563eb',
      leadId: teamData.leadId,
      leadName: teamData.leadId ? members.find((m) => m.id === teamData.leadId || m.userId === teamData.leadId)?.user?.name : undefined,
      projectIds: teamData.projectIds || [],
      createdAt: 'Today',
    };
    const updated = [...teams, newTeam];
    if (activeOrgId) saveToStorage(`syncup_teams_${activeOrgId}`, updated);
    set({ teams: updated });
    return newTeam;
  },

  updateTeam: async (teamId, updates) => {
    const { activeOrgId, teams, members } = get();
    const updated = teams.map((t) => {
      if (t.id !== teamId) return t;
      const leadName = updates.leadId
        ? members.find((m) => m.id === updates.leadId || m.userId === updates.leadId)?.user?.name
        : t.leadName;
      return { ...t, ...updates, leadName: leadName || t.leadName };
    });
    if (activeOrgId) saveToStorage(`syncup_teams_${activeOrgId}`, updated);
    set({ teams: updated });
  },

  deleteTeam: async (teamId) => {
    const { activeOrgId, teams, members } = get();
    const targetTeam = teams.find((t) => t.id === teamId);
    const updatedTeams = teams.filter((t) => t.id !== teamId);
    const updatedMembers = members.map((m) =>
      m.team === targetTeam?.name ? { ...m, team: undefined } : m
    );
    if (activeOrgId) {
      saveToStorage(`syncup_teams_${activeOrgId}`, updatedTeams);
      saveToStorage(`syncup_members_${activeOrgId}`, updatedMembers);
    }
    set({ teams: updatedTeams, members: updatedMembers });
  },

  // ─── Jira Sprints Management ───────────────────────────────────────────────
  createSprint: async (projectId, name, goal) => {
    const { activeOrgId, sprints } = get();
    const newSprint: Sprint = {
      id: `sprint-${Date.now()}`,
      projectId,
      name,
      goal: goal || '',
      status: 'PLANNED',
    };

    const updated = [...sprints, newSprint];
    saveToStorage(`syncup_sprints_${activeOrgId}`, updated);
    set({ sprints: updated });
    return newSprint;
  },

  startSprint: async (sprintId, durationWeeks = 2, goal) => {
    const { activeOrgId, sprints } = get();
    const now = new Date();
    const endDate = new Date(now.getTime() + durationWeeks * 7 * 24 * 60 * 60 * 1000);

    const updated = sprints.map((s) => {
      if (s.id === sprintId) {
        return {
          ...s,
          status: 'ACTIVE' as const,
          startDate: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          endDate: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          goal: goal || s.goal,
        };
      }
      return s;
    });

    saveToStorage(`syncup_sprints_${activeOrgId}`, updated);
    set({ sprints: updated });
  },

  completeSprint: async (sprintId) => {
    const { activeOrgId, sprints, tasks } = get();
    const updatedSprints = sprints.map((s) =>
      s.id === sprintId ? { ...s, status: 'COMPLETED' as const } : s
    );

    // Any unfinished tasks in this sprint roll over to Backlog
    const updatedTasks = tasks.map((t) => {
      if (t.sprintId === sprintId && t.status !== 'DONE') {
        return { ...t, sprintId: null };
      }
      return t;
    });

    saveToStorage(`syncup_sprints_${activeOrgId}`, updatedSprints);
    saveToStorage(`syncup_tasks_${activeOrgId}`, updatedTasks);
    set({ sprints: updatedSprints, tasks: updatedTasks });
  },

  moveTaskToSprint: async (taskId, sprintId) => {
    const { activeOrgId, tasks } = get();
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, sprintId } : t));
    saveToStorage(`syncup_tasks_${activeOrgId}`, updated);
    set({ tasks: updated });
  },

  updateSprint: async (sprintId, updates) => {
    const { activeOrgId, sprints } = get();
    const updatedSprints = sprints.map((s) => (s.id === sprintId ? { ...s, ...updates } : s));
    if (activeOrgId) {
      saveToStorage(`syncup_sprints_${activeOrgId}`, updatedSprints);
    }
    set({ sprints: updatedSprints });
  },

  deleteSprint: async (sprintId) => {
    const { activeOrgId, sprints, tasks } = get();
    const updatedSprints = sprints.filter((s) => s.id !== sprintId);
    // Tasks in this sprint are moved to backlog
    const updatedTasks = tasks.map((t) => (t.sprintId === sprintId ? { ...t, sprintId: null } : t));
    if (activeOrgId) {
      saveToStorage(`syncup_sprints_${activeOrgId}`, updatedSprints);
      saveToStorage(`syncup_tasks_${activeOrgId}`, updatedTasks);
    }
    set({ sprints: updatedSprints, tasks: updatedTasks });
  },

  // ─── Backend Synchronization ───────────────────────────────────────────────
  syncFromBackend: async (preferredOrgId) => {
    set({ isLoading: true });
    try {
      // 1. Fetch live organizations
      let orgsData: any[] = [];
      try {
        orgsData = await organizationsApi.getMyOrganizations();
      } catch (e) {
        orgsData = await superAdminApi.getOrganizations().catch(() => []);
      }
      if (!orgsData || orgsData.length === 0) {
        orgsData = await superAdminApi.getOrganizations().catch(() => []);
      }

      const formattedOrgs: Organization[] = orgsData.map((o: any) => ({
        id: o.id,
        name: o.name,
        slug: o.slug,
        logoUrl: o.logoUrl || undefined,
        description: o.description || undefined,
        website: o.website || undefined,
        industry: o.industry || undefined,
        companySize: o.companySize || undefined,
        adminName: o.members?.[0]?.user?.fullName || 'Organization Admin',
        adminEmail: o.members?.[0]?.user?.email || o.invitations?.[0]?.email || 'admin@' + o.slug + '.com',
        memberCount: o._count?.members || 1,
        status: o.status,
        plan: 'PRO',
        createdAt: new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      }));

      // The live backend is the source of truth for organizations
      const allOrgs = formattedOrgs;
      saveToStorage('syncup_orgs', allOrgs);

      let targetOrgId = preferredOrgId || get().activeOrgId || (typeof window !== 'undefined' ? localStorage.getItem('syncup_active_org_id') : '') || '';
      if (!allOrgs.some((o) => o.id === targetOrgId)) {
        targetOrgId = allOrgs.length > 0 ? allOrgs[0].id : '';
        if (typeof window !== 'undefined') {
          if (targetOrgId) {
            localStorage.setItem('syncup_active_org_id', targetOrgId);
          } else {
            localStorage.removeItem('syncup_active_org_id');
          }
        }
      }

      // Sync Platform Analytics for Super Admin
      let analyticsData: any = null;
      try {
        analyticsData = await superAdminApi.getAnalytics().catch(() => null);
      } catch {}

      const totalOrgsCount = analyticsData?.totalOrganizations ?? allOrgs.length;
      const activeOrgsCount = analyticsData?.activeOrganizations ?? allOrgs.filter((o) => o.status === 'ACTIVE').length;
      const totalUsersCount = analyticsData?.totalUsers ?? 0;
      const activeUsersCount = analyticsData?.activeUsers ?? 0;

      set({
        organizations: allOrgs,
        activeOrgId: targetOrgId,
        adminAnalytics: {
          ...get().adminAnalytics,
          ...(analyticsData || {}),
          totalOrganizations: totalOrgsCount,
          activeOrganizations: activeOrgsCount,
          totalUsers: totalUsersCount,
          activeUsers: activeUsersCount,
          monthlyRecurringRevenue: 0,
          totalRevenue: 0,
          cashFlowGrowth: '0.0%',
        },
      });

      if (targetOrgId) {
        await get().loadOrgData(targetOrgId);
      }
    } catch (err) {
      console.warn('Sync from backend fallback:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  loadOrgData: async (orgId: string) => {
    if (!orgId) return;

    try {
      // 1. Load real projects
      const liveProjects = await projectsApi.getProjects(orgId).catch(() => []);
      const formattedProjects: Project[] = liveProjects.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        status: p.status,
        progress: p.progress || 0,
        openTasksCount: p._count?.tasks || 0,
        dueDate: p.dueDate ? new Date(p.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No deadline',
        teamMembers: (p.members || []).map((m: any) => ({
          id: m.member?.user?.id || m.id,
          name: m.member?.user?.fullName || 'Member',
          avatarUrl: m.member?.user?.avatarUrl,
        })),
      }));

      // 2. Load real tasks
      const liveTasks = await tasksApi.getTasks(orgId).catch(() => []);
      const formattedTasks: Task[] = liveTasks.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description || '',
        status: t.status,
        priority: t.priority,
        projectId: t.projectId,
        projectName: t.project?.name || 'Main Project',
        tags: t.tags || ['general'],
        sprintId: t.sprintId || null,
        storyPoints: t.storyPoints || 3,
        issueType: t.issueType || 'task',
        assignees: (t.assignees || []).map((a: any) => ({ id: a.userId, name: a.user?.fullName || 'User' })),
        dueDate: t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date',
        subtasks: (t.subtasks || []).map((st: any) => ({ id: st.id, title: st.title, completed: st.status === 'DONE' })),
        attachments: [],
        comments: [],
      }));

      // 3. Load real members
      const liveMembers = await organizationsApi.getMembers(orgId).catch(() => []);
      const formattedMembers: OrganizationMember[] = liveMembers.map((m: any) => ({
        id: m.id,
        userId: m.userId,
        user: {
          id: m.user?.id || m.userId,
          name: m.user?.fullName || 'Team Member',
          email: m.user?.email || '',
          isPlatformOwner: m.user?.isPlatformOwner || false,
          status: m.user?.status || 'ACTIVE',
        },
        organizationId: m.organizationId,
        role: m.role,
        team: m.team || 'Core Engineering',
        status: m.status,
        isOnline: true,
        joinedAt: new Date(m.joinedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }));

      // Merge with persistent local storage
      const localProjects = loadFromStorage<Project[]>(`syncup_projects_${orgId}`, []);
      const localTasks = loadFromStorage<Task[]>(`syncup_tasks_${orgId}`, []);
      const localMembers = loadFromStorage<OrganizationMember[]>(`syncup_members_${orgId}`, []);
      const localSprints = loadFromStorage<Sprint[]>(`syncup_sprints_${orgId}`, []);

      const defaultOrgTeams: Team[] = [
        {
          id: `team-core-${orgId}`,
          organizationId: orgId,
          name: 'Core Engineering',
          description: 'Primary software engineering and architecture team.',
          color: '#2563eb',
          createdAt: 'Today',
        },
        {
          id: `team-qa-${orgId}`,
          organizationId: orgId,
          name: 'Quality Assurance & Testing',
          description: 'QA team responsible for sprint verification and staging sign-off.',
          color: '#10b981',
          createdAt: 'Today',
        },
      ];
      const localTeams = loadFromStorage<Team[]>(`syncup_teams_${orgId}`, defaultOrgTeams);

      const mergedProjects = [...formattedProjects, ...localProjects.filter((lp) => !formattedProjects.some((fp) => fp.id === lp.id))];
      const mergedTasks = [...formattedTasks, ...localTasks.filter((lt) => !formattedTasks.some((ft) => ft.id === lt.id))];
      const mergedMembers = [...formattedMembers, ...localMembers.filter((lm) => !formattedMembers.some((fm) => fm.id === lm.id))];

      const activeProjectId = get().selectedProjectId || (mergedProjects.length > 0 ? mergedProjects[0].id : null);

      set({
        projects: mergedProjects,
        selectedProjectId: activeProjectId,
        tasks: mergedTasks,
        members: mergedMembers,
        sprints: localSprints,
        teams: localTeams,
      });
    } catch (err) {
      console.warn('Failed to load organization data:', err);
    }
  },

  createProject: async (data: any) => {
    const { activeOrgId, organizations } = get();
    const targetOrgId = activeOrgId || organizations[0]?.id;
    if (!targetOrgId) {
      throw new Error('Please create an organization first before creating a project.');
    }

    let res: any = null;
    try {
      res = await projectsApi.createProject(targetOrgId, data);
    } catch (e) {
      console.warn('Backend project creation fallback to local state:', e);
    }

    const newProject: Project = {
      id: res?.id || 'proj-' + Date.now(),
      name: data.name.trim(),
      description: data.description || '',
      status: 'ACTIVE',
      progress: 0,
      openTasksCount: 0,
      dueDate: data.dueDate ? new Date(data.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline',
      teamMembers: get().members.slice(0, 2).map((m) => ({ id: m.userId, name: m.user?.name })),
      ...res,
    };

    const updatedProjects = [newProject, ...get().projects.filter((p) => p.id !== newProject.id)];
    saveToStorage(`syncup_projects_${targetOrgId}`, updatedProjects);

    // Initialize Sprint 1 in Jira style for this project
    const sprint1: Sprint = {
      id: `sprint-${Date.now()}`,
      projectId: newProject.id,
      name: 'Sprint 1',
      goal: 'Foundational project delivery & core milestone setup',
      status: 'ACTIVE',
      startDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
    const updatedSprints = [...get().sprints, sprint1];
    saveToStorage(`syncup_sprints_${targetOrgId}`, updatedSprints);

    set({
      projects: updatedProjects,
      selectedProjectId: newProject.id,
      sprints: updatedSprints,
      isCreateProjectModalOpen: false,
    });

    return newProject;
  },

  updateProject: async (projectId, updates) => {
    const { activeOrgId, projects } = get();
    const updatedProjects = projects.map((p) => (p.id === projectId ? { ...p, ...updates } : p));
    if (activeOrgId) {
      saveToStorage(`syncup_projects_${activeOrgId}`, updatedProjects);
    }
    set({ projects: updatedProjects });
  },

  addNewTask: async (newTaskData) => {
    const { activeOrgId, tasks } = get();
    const newTask: Task = {
      id: `TASK-${Date.now().toString().slice(-4)}`,
      ...newTaskData,
      comments: [],
      attachments: [],
    };

    const updated = [newTask, ...tasks];
    if (activeOrgId) {
      saveToStorage(`syncup_tasks_${activeOrgId}`, updated);
    }
    set({ tasks: updated });

    if (activeOrgId) {
      tasksApi.createTask(activeOrgId, newTaskData).catch(() => null);
    }

    return newTask;
  },

  updateTaskStatus: async (taskId, status) => {
    const { activeOrgId, tasks } = get();
    const updated = tasks.map((task) => (task.id === taskId ? { ...task, status } : task));
    if (activeOrgId) {
      saveToStorage(`syncup_tasks_${activeOrgId}`, updated);
    }
    set({ tasks: updated });

    if (activeOrgId) {
      tasksApi.updateStatus(activeOrgId, taskId, status).catch(() => null);
    }
  },

  updateTask: async (taskId, updates) => {
    const { activeOrgId, tasks } = get();
    const updated = tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task));
    if (activeOrgId) {
      saveToStorage(`syncup_tasks_${activeOrgId}`, updated);
    }
    set({ tasks: updated });
  },

  deleteTask: async (taskId) => {
    const { activeOrgId, tasks, selectedTaskId } = get();
    const updated = tasks.filter((task) => task.id !== taskId);
    if (activeOrgId) {
      saveToStorage(`syncup_tasks_${activeOrgId}`, updated);
    }
    set({
      tasks: updated,
      selectedTaskId: selectedTaskId === taskId ? null : selectedTaskId,
    });
  },

  toggleSubtask: async (taskId, subtaskId) => {
    const { activeOrgId, tasks } = get();
    const updated = tasks.map((task) => {
      if (task.id !== taskId) return task;
      return {
        ...task,
        subtasks: task.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        ),
      };
    });
    if (activeOrgId) saveToStorage(`syncup_tasks_${activeOrgId}`, updated);
    set({ tasks: updated });
  },

  addComment: async (taskId, text) => {
    const { activeOrgId, tasks } = get();
    const userRaw = typeof window !== 'undefined' ? localStorage.getItem('syncup_user') : null;
    let userName = 'Member';
    try {
      if (userRaw) userName = JSON.parse(userRaw).name;
    } catch {}

    const newComment = {
      id: `c-${Date.now()}`,
      userId: 'user-active',
      userName,
      content: text,
      createdAt: 'Just now',
    };

    const updated = tasks.map((task) =>
      task.id === taskId ? { ...task, comments: [...task.comments, newComment] } : task
    );
    if (activeOrgId) saveToStorage(`syncup_tasks_${activeOrgId}`, updated);
    set({ tasks: updated });
  },

  toggleOrgStatus: async (orgId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const updated = get().organizations.map((o) =>
      o.id === orgId ? { ...o, status: newStatus as any } : o
    );
    saveToStorage('syncup_orgs', updated);
    set({ organizations: updated });
    superAdminApi.updateOrgStatus(orgId, newStatus).catch(() => null);
  },

  setOrgAdminPassword: async (orgId, newPassword) => {
    const updated = get().organizations.map((o) =>
      o.id === orgId ? { ...o, adminPassword: newPassword } : o
    );
    saveToStorage('syncup_orgs', updated);
    set({ organizations: updated });
  },
}));
