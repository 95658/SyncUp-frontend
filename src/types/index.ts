export type UserRole = 'PLATFORM_OWNER' | 'ORG_ADMIN' | 'ORG_MEMBER' | 'ORG_GUEST';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  jobTitle?: string;
  isPlatformOwner: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  adminName: string;
  adminEmail: string;
  adminPassword?: string;
  memberCount: number;
  status: 'ACTIVE' | 'SUSPENDED';
  plan: 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
  createdAt: string;
}

export interface OrganizationMember {
  id: string;
  userId: string;
  user: User;
  organizationId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST';
  team?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'REMOVED' | 'SUSPENDED';
  isOnline: boolean;
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
}

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  projectName: string;
  tags: string[];
  sprintId?: string | null;
  storyPoints?: number;
  issueType?: 'story' | 'task' | 'bug' | 'ticket';
  assignees: {
    id: string;
    name: string;
    avatarUrl?: string;
  }[];
  dueDate: string;
  subtasks: Subtask[];
  attachments: TaskAttachment[];
  comments: TaskComment[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
  progress: number;
  openTasksCount: number;
  dueDate: string;
  teamMembers: {
    id: string;
    name: string;
    avatarUrl?: string;
  }[];
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface MessageAttachment {
  id: string;
  name: string;
  size: string;
  type: 'image' | 'file' | 'figma';
  url: string;
}

export interface Message {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  threadRepliesCount?: number;
}

export interface Channel {
  id: string;
  name: string;
  type: 'PUBLIC' | 'PRIVATE' | 'DIRECT';
  membersCount: number;
  isDirectMessage?: boolean;
  userStatus?: 'online' | 'offline';
  avatarUrl?: string;
  unreadCount?: number;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  timeRange: string;
  participants: {
    id: string;
    name: string;
    avatarUrl?: string;
  }[];
  externalLink?: string;
  color?: string;
}

export interface ActivityItem {
  id: string;
  userName: string;
  userAvatar?: string;
  action: string;
  target: string;
  timestamp: string;
}
