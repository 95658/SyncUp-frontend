import { create } from 'zustand';
import { Task, Project, OrganizationMember, Meeting, ActivityItem, Organization, TaskStatus, Sprint } from '@/types';
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

  // Jira Sprints & Backlog Management
  createSprint: (projectId: string, name: string, goal?: string) => Promise<Sprint>;
  startSprint: (sprintId: string, durationWeeks?: number, goal?: string) => Promise<void>;
  completeSprint: (sprintId: string) => Promise<void>;
  moveTaskToSprint: (taskId: string, sprintId: string | null) => Promise<void>;

  // Tasks & Projects
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  addComment: (taskId: string, text: string) => Promise<void>;
  addNewTask: (newTask: Omit<Task, 'id' | 'comments' | 'attachments'>) => Promise<Task>;
  createProject: (data: { name: string; description?: string; projectType?: string; dueDate?: string }) => Promise<any>;

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

    set({
      organizations: updatedOrgs,
      activeOrgId: newOrg.id,
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
    const { activeOrgId, members } = get();
    if (!activeOrgId) return;

    const newMem: OrganizationMember = {
      id: `mem-${Date.now()}`,
      userId: `u-${Date.now()}`,
      user: {
        id: `u-${Date.now()}`,
        name: memberData.name || memberData.email.split('@')[0],
        email: memberData.email,
        jobTitle: memberData.jobTitle || 'Team Member',
        isPlatformOwner: false,
        status: 'ACTIVE',
      },
      organizationId: activeOrgId,
      role: memberData.role || 'MEMBER',
      team: memberData.team || 'Core Engineering',
      status: 'ACTIVE',
      isOnline: true,
      joinedAt: 'Today',
    };

    const updated = [newMem, ...members];
    saveToStorage(`syncup_members_${activeOrgId}`, updated);
    set({ members: updated });

    // Try backend sync
    organizationsApi.inviteMember(activeOrgId, { email: memberData.email, role: memberData.role || 'MEMBER' }).catch(() => null);
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

      // Combine with locally created/customized orgs (preserving logoUrl and branding)
      const localOrgs = loadFromStorage<Organization[]>('syncup_orgs', []);
      const mergedOrgsMap = new Map<string, Organization>();
      localOrgs.forEach((o) => mergedOrgsMap.set(o.id, o));
      formattedOrgs.forEach((o) => {
        const existing = mergedOrgsMap.get(o.id);
        mergedOrgsMap.set(o.id, {
          ...existing,
          ...o,
          logoUrl: o.logoUrl || existing?.logoUrl,
        });
      });
      const allOrgs = Array.from(mergedOrgsMap.values());
      saveToStorage('syncup_orgs', allOrgs);

      let targetOrgId = preferredOrgId || get().activeOrgId || (typeof window !== 'undefined' ? localStorage.getItem('syncup_active_org_id') : '') || '';
      if (!targetOrgId && allOrgs.length > 0) {
        targetOrgId = allOrgs[0].id;
      }

      // Sync Platform Analytics for Super Admin
      let analyticsData: any = null;
      try {
        analyticsData = await superAdminApi.getAnalytics().catch(() => null);
      } catch {}

      const totalOrgsCount = Math.max(analyticsData?.totalOrganizations ?? 0, allOrgs.length);
      const activeOrgsCount = Math.max(
        analyticsData?.activeOrganizations ?? 0,
        allOrgs.filter((o) => o.status === 'ACTIVE').length
      );
      const totalUsersCount = Math.max(
        analyticsData?.totalUsers ?? 0,
        allOrgs.reduce((acc, o) => acc + (o.memberCount || 1), 0)
      );
      const activeUsersCount = Math.max(
        analyticsData?.activeUsers ?? 0,
        allOrgs.reduce((acc, o) => acc + (o.status === 'ACTIVE' ? (o.memberCount || 1) : 0), 0)
      );

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
