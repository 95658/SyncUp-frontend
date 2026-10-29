import { create } from 'zustand';
import { Channel, Message } from '@/types';
import { chatApi } from '@/lib/api';

interface ChatState {
  activeChannelId: string;
  channels: Channel[];
  messages: Record<string, Message[]>;
  hoveredMessageId: string | null;

  // Actions
  setHoveredMessageId: (id: string | null) => void;
  setActiveChannel: (channelId: string) => void;
  loadChannelsForOrg: (orgId: string, orgName: string) => Promise<void>;
  sendMessage: (channelId: string, content: string, senderName: string, senderId: string) => Promise<void>;
  toggleReaction: (channelId: string, messageId: string, emoji: string, userId: string) => void;
  createChannel: (orgId: string, name: string, description?: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  activeChannelId: 'chan-general',
  hoveredMessageId: null,

  // Initially empty; dynamically populated per organization
  channels: [],
  messages: {},

  setHoveredMessageId: (id) => set({ hoveredMessageId: id }),

  setActiveChannel: (channelId) => set({ activeChannelId: channelId }),

  loadChannelsForOrg: async (orgId, orgName) => {
    try {
      const backendChannels = await chatApi.getChannels(orgId).catch(() => []);
      
      let formattedChannels: Channel[] = [];
      if (backendChannels && backendChannels.length > 0) {
        formattedChannels = backendChannels.map((c: any) => ({
          id: c.id,
          name: c.name,
          type: c.type || 'PUBLIC',
          membersCount: c._count?.members || 1,
          unreadCount: 0,
        }));
      } else {
        // Fallback default general channel for this org
        formattedChannels = [
          {
            id: `chan-general-${orgId}`,
            name: 'general',
            type: 'PUBLIC',
            membersCount: 1,
            unreadCount: 0,
          },
        ];
      }

      const activeChan = formattedChannels[0]?.id || '';

      // Initialize welcome message for general channel if empty
      const initialMessages: Record<string, Message[]> = {
        [activeChan]: [
          {
            id: `msg-welcome-${activeChan}`,
            channelId: activeChan,
            senderId: 'system',
            senderName: 'SyncUp Bot',
            content: `👋 Welcome to the #${formattedChannels[0]?.name || 'general'} channel of ${orgName}! This is where your team can collaborate, share updates, and exchange ideas in real time.`,
            timestamp: 'Today',
            reactions: [
              { emoji: '👋', count: 1, users: ['system'] },
              { emoji: '🚀', count: 1, users: ['system'] },
            ],
          },
        ],
      };

      set({
        channels: formattedChannels,
        activeChannelId: activeChan,
        messages: initialMessages,
      });
    } catch (e) {
      console.warn('Failed to load channels:', e);
    }
  },

  sendMessage: async (channelId, content, senderName, senderId) => {
    if (!content.trim()) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      channelId,
      senderId: senderId || 'current-user',
      senderName: senderName || 'Member',
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: [],
    };

    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: [...(state.messages[channelId] || []), newMsg],
      },
    }));

    // Optimistically send to backend
    try {
      await chatApi.sendMessage('', channelId, content);
    } catch (e) {
      // Handled
    }
  },

  toggleReaction: (channelId, messageId, emoji, userId) => {
    const currentUserId = userId || 'current-user';

    set((state) => {
      const channelMsgs = state.messages[channelId] || [];
      const updatedMsgs = channelMsgs.map((msg) => {
        if (msg.id !== messageId) return msg;

        const reactions = msg.reactions || [];
        const existing = reactions.find((r) => r.emoji === emoji);

        let newReactions;
        if (existing) {
          if (existing.users.includes(currentUserId)) {
            // Remove user reaction
            newReactions = reactions
              .map((r) =>
                r.emoji === emoji
                  ? { ...r, count: r.count - 1, users: r.users.filter((u) => u !== currentUserId) }
                  : r
              )
              .filter((r) => r.count > 0);
          } else {
            // Add user reaction
            newReactions = reactions.map((r) =>
              r.emoji === emoji
                ? { ...r, count: r.count + 1, users: [...r.users, currentUserId] }
                : r
            );
          }
        } else {
          // Create new reaction
          newReactions = [...reactions, { emoji, count: 1, users: [currentUserId] }];
        }

        return { ...msg, reactions: newReactions };
      });

      return {
        messages: {
          ...state.messages,
          [channelId]: updatedMsgs,
        },
      };
    });
  },

  createChannel: async (orgId, name, description) => {
    const channelName = name.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '');
    const newChan: Channel = {
      id: `chan-${Date.now()}`,
      name: channelName,
      type: 'PUBLIC',
      membersCount: 1,
      unreadCount: 0,
    };

    set((state) => ({
      channels: [...state.channels, newChan],
      activeChannelId: newChan.id,
      messages: {
        ...state.messages,
        [newChan.id]: [
          {
            id: `msg-welcome-${newChan.id}`,
            channelId: newChan.id,
            senderId: 'system',
            senderName: 'SyncUp Bot',
            content: `📢 Welcome to #${channelName}! This channel is ready for discussions.`,
            timestamp: 'Just now',
            reactions: [{ emoji: '🎉', count: 1, users: ['system'] }],
          },
        ],
      },
    }));

    try {
      await chatApi.createChannel(orgId, { name: channelName, description });
    } catch (e) {
      // Handled
    }
  },
}));
