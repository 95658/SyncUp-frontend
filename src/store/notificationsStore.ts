import { create } from 'zustand';
import { notificationsApi } from '@/lib/api';

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
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],

  unreadCount: () => {
    return get().notifications.filter((n) => !n.isRead).length;
  },

  fetchNotifications: async () => {
    try {
      const live = await notificationsApi.getNotifications();
      if (Array.isArray(live) && live.length > 0) {
        const formatted: NotificationItem[] = live.map((n: any) => ({
          id: n.id,
          type: n.type || 'SYSTEM',
          title: n.title,
          body: n.body || '',
          isRead: n.isRead,
          createdAt: new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
          entityType: n.entityType?.toLowerCase(),
          entityId: n.entityId,
        }));
        set({ notifications: formatted });
      }
    } catch (e) {
      // fallback handled gracefully
    }
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    }));
    if (!id.startsWith('notif-')) {
      notificationsApi.markAsRead(id).catch(() => null);
    }
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    }));
    notificationsApi.markAllAsRead().catch(() => null);
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
