export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

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
  getAdministrators: () => request<any[]>('/super-admin/administrators'),
  getUsers: () => request<any[]>('/super-admin/users'),
  getInvitations: () => request<any[]>('/super-admin/invitations'),
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
  removeMember: (orgId: string, memberId: string) =>
    request<any>(`/organizations/${orgId}/members/${memberId}`, {
      method: 'DELETE',
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
