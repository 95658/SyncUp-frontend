import { create } from 'zustand';

export interface NotificationItem {
  id: string;
  type: 'TASK_ASSIGNED' | 'TASK_UPDATED' | 'TASK_MENTIONED' | 'MEETING_INVITE' | 'PROJECT_INVITE' | 'SYSTEM';
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  entityType?: 'task' | 'project' | 'meeting';
  entityId?: string;
  metadata?: Record<string, any>;
}

interface NotificationsState {
  notifications: NotificationItem[];
  unreadCount: () => number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [
    {
      id: 'notif-1',
      type: 'TASK_ASSIGNED',
      title: 'New Task Assigned',
      body: 'You have been assigned to "PostgreSQL Migrations & Performance Tuning" by Ahmed Abdelfatah.',
      isRead: false,
      createdAt: '10 minutes ago',
      entityType: 'task',
      entityId: 'task-1',
    },
    {
      id: 'notif-2',
      type: 'MEETING_INVITE',
      title: 'Sprint Planning Meeting Scheduled',
      body: 'Libro Sprint 1 Planning & Estimation has been scheduled for tomorrow at 10:00 AM.',
      isRead: false,
      createdAt: '1 hour ago',
      entityType: 'meeting',
      entityId: 'meet-1',
    },
    {
      id: 'notif-3',
      type: 'TASK_UPDATED',
      title: 'Task Status Moved to In Review',
      body: 'Task "Design System Tokens & Dark Theme" is now ready for QA and Product Review.',
      isRead: false,
      createdAt: '3 hours ago',
      entityType: 'task',
      entityId: 'task-2',
    },
    {
      id: 'notif-4',
      type: 'PROJECT_INVITE',
      title: 'Invited to Project',
      body: 'You were added as an active collaborator on "E-Commerce Core Engine".',
      isRead: true,
      createdAt: 'Yesterday',
      entityType: 'project',
      entityId: 'proj-1',
    },
  ],

  unreadCount: () => {
    return get().notifications.filter((n) => !n.isRead).length;
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    }));
  },

  addNotification: (item) => {
    const newItem: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}`,
      isRead: false,
      createdAt: 'Just now',
    };
    set((state) => ({
      notifications: [newItem, ...state.notifications],
    }));
  },
}));
