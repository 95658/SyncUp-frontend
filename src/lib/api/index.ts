export const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return `${window.location.origin}/api/v1`;
    }
  }
  return 'http://localhost:4000/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('syncup_access_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.message || `Request failed with status ${res.status}`;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return res.json();
}

// ─── Super Admin API ──────────────────────────────────────────────────────────
export const superAdminApi = {
  getOrganizations: () => request<any[]>('/super-admin/organizations'),
  createOrganization: (data: { name: string; adminName: string; adminEmail: string; plan?: string }) =>
    request<{ organization: any; invitationLink: string; expiresAt: string }>('/super-admin/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAnalytics: () =>
    request<{
      totalOrganizations: number;
      activeOrganizations: number;
      totalUsers: number;
      activeUsers: number;
      pendingInvitations: number;
      totalTasks: number;
      systemHealth: string;
    }>('/super-admin/analytics'),
  updateOrgStatus: (id: string, status: string) =>
    request<any>(`/super-admin/organizations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  deleteOrganization: (id: string) =>
    request<{ success: boolean; message: string }>(`/super-admin/organizations/${id}`, {
      method: 'DELETE',
    }),
  getAdministrators: () => request<any[]>('/super-admin/administrators'),
  getUsers: () => request<any[]>('/super-admin/users'),
  getInvitations: () => request<any[]>('/super-admin/invitations'),
  resendInvitation: (id: string) =>
    request<{ success: boolean; invitationLink: string; expiresAt: string; message: string }>(
      `/super-admin/invitations/${id}/resend`,
      { method: 'POST' }
    ),
  revokeInvitation: (id: string) =>
    request<{ success: boolean; message: string }>(`/super-admin/invitations/${id}`, {
      method: 'DELETE',
    }),
  getAuditLogs: (limit?: number) => request<any[]>(`/super-admin/audit-logs${limit ? `?limit=${limit}` : ''}`),
};

// ─── Organizations & Members API ──────────────────────────────────────────────
export const organizationsApi = {
  getMyOrganizations: () => request<any[]>('/organizations'),
  getOrg: (orgId: string) => request<any>(`/organizations/${orgId}`),
  getMembers: (orgId: string) => request<any[]>(`/organizations/${orgId}/members`),
  inviteMember: (orgId: string, data: { email: string; role: string; teamId?: string }) =>
    request<any>(`/organizations/${orgId}/invitations`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getInvitations: (orgId: string) => request<any[]>(`/organizations/${orgId}/invitations`),
  updateMemberRole: (orgId: string, memberId: string, role: string) =>
    request<any>(`/organizations/${orgId}/members/${memberId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
  updateMemberStatus: (orgId: string, memberId: string, status: string) =>
    request<any>(`/organizations/${orgId}/members/${memberId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  removeMember: (orgId: string, memberId: string) =>
    request<any>(`/organizations/${orgId}/members/${memberId}`, {
      method: 'DELETE',
    }),
  revokeInvitation: (orgId: string, invitationId: string) =>
    request<any>(`/organizations/${orgId}/invitations/${invitationId}`, {
      method: 'DELETE',
    }),
  getSettings: (orgId: string) => request<any>(`/organizations/${orgId}/settings`),
  updateSettings: (orgId: string, data: any) =>
    request<any>(`/organizations/${orgId}/settings`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// ─── Projects API ─────────────────────────────────────────────────────────────
export const projectsApi = {
  getProjects: (orgId: string) => request<any[]>(`/organizations/${orgId}/projects`),
  createProject: (orgId: string, data: { name: string; description?: string; dueDate?: string }) =>
    request<any>(`/organizations/${orgId}/projects`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getProjectMembers: (orgId: string, projectId: string) =>
    request<any[]>(`/organizations/${orgId}/projects/${projectId}/members`),
  addProjectMember: (orgId: string, projectId: string, memberId: string) =>
    request<any>(`/organizations/${orgId}/projects/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify({ memberId }),
    }),
  removeProjectMember: (orgId: string, projectId: string, memberId: string) =>
    request<any>(`/organizations/${orgId}/projects/${projectId}/members/${memberId}`, {
      method: 'DELETE',
    }),
};

// ─── Teams API ────────────────────────────────────────────────────────────────
export const teamsApi = {
  getTeams: (orgId: string) => request<any[]>(`/organizations/${orgId}/teams`),
  createTeam: (orgId: string, data: { name: string; description?: string }) =>
    request<any>(`/organizations/${orgId}/teams`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  addTeamMember: (orgId: string, teamId: string, memberId: string) =>
    request<any>(`/organizations/${orgId}/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify({ memberId }),
    }),
  removeTeamMember: (orgId: string, teamId: string, memberId: string) =>
    request<any>(`/organizations/${orgId}/teams/${teamId}/members/${memberId}`, {
      method: 'DELETE',
    }),
};

// ─── Calendar API ─────────────────────────────────────────────────────────────
export const calendarApi = {
  getMeetings: (orgId: string) => request<any[]>(`/organizations/${orgId}/calendar/meetings`),
  createMeeting: (orgId: string, data: { title: string; description?: string; startTime: string; endTime: string; meetingUrl?: string }) =>
    request<any>(`/organizations/${orgId}/calendar/meetings`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ─── Notifications API ────────────────────────────────────────────────────────
export const notificationsApi = {
  getNotifications: () => request<any[]>('/notifications'),
  markAsRead: (id: string) =>
    request<any>(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),
  markAllAsRead: () =>
    request<any>('/notifications/read-all', {
      method: 'PATCH',
    }),
};

// ─── Tasks API ────────────────────────────────────────────────────────────────
export const tasksApi = {
  getTasks: (orgId: string, projectId?: string) =>
    request<any[]>(`/organizations/${orgId}/tasks${projectId ? `?projectId=${projectId}` : ''}`),
  getTask: (orgId: string, taskId: string) =>
    request<any>(`/organizations/${orgId}/tasks/${taskId}`),
  createTask: (orgId: string, data: { projectId: string; title: string; description?: string; status?: string; priority?: string; dueDate?: string }) =>
    request<any>(`/organizations/${orgId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateStatus: (orgId: string, taskId: string, status: string) =>
    request<any>(`/organizations/${orgId}/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  addSubtask: (orgId: string, taskId: string, title: string) =>
    request<any>(`/organizations/${orgId}/tasks/${taskId}/subtasks`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    }),
  toggleSubtask: (orgId: string, subtaskId: string) =>
    request<any>(`/organizations/${orgId}/tasks/subtasks/${subtaskId}`, {
      method: 'PATCH',
    }),
  addComment: (orgId: string, taskId: string, content: string) =>
    request<any>(`/organizations/${orgId}/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
};

// ─── Channels & Messages API ──────────────────────────────────────────────────
export const chatApi = {
  getChannels: (orgId: string) => request<any[]>(`/organizations/${orgId}/channels`),
  createChannel: (orgId: string, data: { name: string; description?: string; type?: string }) =>
    request<any>(`/organizations/${orgId}/channels`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMessages: (orgId: string, channelId: string, limit = 50) =>
    request<any[]>(`/organizations/${orgId}/channels/${channelId}/messages?limit=${limit}`),
  sendMessage: (orgId: string, channelId: string, content: string, parentId?: string) =>
    request<any>(`/organizations/${orgId}/channels/${channelId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, parentId }),
    }),
  toggleReaction: (orgId: string, messageId: string, emoji: string) =>
    request<any>(`/organizations/${orgId}/messages/${messageId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    }),
};
