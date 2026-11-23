import { create } from 'zustand';
import { Channel, Message } from '@/types';
import { chatApi } from '@/lib/api';
import { io, Socket } from 'socket.io-client';

interface ChatState {
  activeOrgId: string;
  activeChannelId: string;
  channels: Channel[];
  messages: Record<string, Message[]>;
  hoveredMessageId: string | null;
  socket: Socket | null;

  // Actions
  initSocket: (token?: string) => void;
  setHoveredMessageId: (id: string | null) => void;
  setActiveChannel: (channelId: string) => void;
  loadChannelsForOrg: (orgId: string, orgName: string) => Promise<void>;
  sendMessage: (channelId: string, content: string, senderName: string, senderId: string) => Promise<void>;
  toggleReaction: (channelId: string, messageId: string, emoji: string, userId: string) => void;
  createChannel: (orgId: string, name: string, description?: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  activeOrgId: '',
  activeChannelId: 'chan-general',
  hoveredMessageId: null,
  socket: null,

  // Initially empty; dynamically populated per organization
  channels: [],
  messages: {},

  initSocket: (token?: string) => {
    const existingSocket = get().socket;
    if (existingSocket && existingSocket.connected) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ||
      (process.env.NEXT_PUBLIC_API_URL
        ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '')
        : (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
            ? window.location.origin
            : 'http://localhost:4000'));

    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('syncup_access_token') : null);

    const newSocket = io(`${wsUrl}/chat`, {
      transports: ['websocket', 'polling'],
      auth: { token: authToken },
    });

    newSocket.on('connect', () => {
      console.log('✅ Real-time Chat Connected to WebSocket gateway:', newSocket.id);
      const activeChan = get().activeChannelId;
      if (activeChan) {
        newSocket.emit('joinChannel', { channelId: activeChan });
      }
    });

    newSocket.on('newMessage', (msg: any) => {
      const channelId = msg.channelId;
      const formattedMsg: Message = {
        id: msg.id,
        channelId: msg.channelId,
        senderId: msg.authorId,
        senderName: msg.author?.fullName || 'Member',
        content: msg.content,
        timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactions: msg.reactions || [],
      };

      set((state) => {
        const existing = state.messages[channelId] || [];
        if (existing.some((m) => m.id === formattedMsg.id)) return state;
        return {
          messages: {
            ...state.messages,
            [channelId]: [...existing, formattedMsg],
          },
        };
      });
    });

    newSocket.on('reactionUpdated', (data: any) => {
      // Refresh reactions on message
      console.log('Real-time reaction updated:', data);
    });

    set({ socket: newSocket });
  },

  setHoveredMessageId: (id) => set({ hoveredMessageId: id }),

  setActiveChannel: (channelId) => {
    const socket = get().socket;
    const prevChannelId = get().activeChannelId;

    if (socket && socket.connected) {
      if (prevChannelId && prevChannelId !== channelId) {
        socket.emit('leaveChannel', { channelId: prevChannelId });
      }
      socket.emit('joinChannel', { channelId });
    }

    set({ activeChannelId: channelId });

    // Load messages from backend for this channel
    const orgId = get().activeOrgId;
    if (orgId && channelId && !channelId.startsWith('chan-welcome')) {
      chatApi.getMessages(orgId, channelId).then((msgs) => {
        if (Array.isArray(msgs) && msgs.length > 0) {
          const formatted: Message[] = msgs.map((m: any) => ({
            id: m.id,
            channelId: m.channelId,
            senderId: m.authorId,
            senderName: m.author?.fullName || 'Member',
            content: m.content,
            timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            reactions: m.reactions || [],
          }));
          set((state) => ({
            messages: {
              ...state.messages,
              [channelId]: formatted,
            },
          }));
        }
      }).catch(() => null);
    }
  },

  loadChannelsForOrg: async (orgId, orgName) => {
    try {
      get().initSocket();
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
        activeOrgId: orgId,
        channels: formattedChannels,
        activeChannelId: activeChan,
        messages: initialMessages,
      });

      // Join room in socket
      const socket = get().socket;
      if (socket && socket.connected && activeChan) {
        socket.emit('joinChannel', { channelId: activeChan });
      }

      // Fetch live history from backend
      if (activeChan && !activeChan.startsWith('chan-general-')) {
        chatApi.getMessages(orgId, activeChan).then((msgs) => {
          if (Array.isArray(msgs) && msgs.length > 0) {
            const formatted: Message[] = msgs.map((m: any) => ({
              id: m.id,
              channelId: m.channelId,
              senderId: m.authorId,
              senderName: m.author?.fullName || 'Member',
              content: m.content,
              timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              reactions: m.reactions || [],
            }));
            set((state) => ({
              messages: {
                ...state.messages,
                [activeChan]: formatted,
              },
            }));
          }
        }).catch(() => null);
      }
    } catch (e) {
      console.warn('Failed to load channels:', e);
    }
  },

  sendMessage: async (channelId, content, senderName, senderId) => {
    if (!content.trim()) return;
    const orgId = get().activeOrgId;

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

    // Send to backend via REST (which emits WebSocket event to all other room listeners)
    try {
      if (orgId && !channelId.startsWith('chan-general-')) {
        await chatApi.sendMessage(orgId, channelId, content);
      }
    } catch (e) {
      console.warn('Failed to dispatch message to backend:', e);
    }
  },

  toggleReaction: (channelId, messageId, emoji, userId) => {
    const currentUserId = userId || 'current-user';
    const orgId = get().activeOrgId;

    set((state) => {
      const channelMsgs = state.messages[channelId] || [];
      const updatedMsgs = channelMsgs.map((msg) => {
        if (msg.id !== messageId) return msg;

        const reactions = msg.reactions || [];
        const existing = reactions.find((r) => r.emoji === emoji);

        let newReactions;
        if (existing) {
          if (existing.users.includes(currentUserId)) {
            newReactions = reactions
              .map((r) =>
                r.emoji === emoji
                  ? { ...r, count: r.count - 1, users: r.users.filter((u) => u !== currentUserId) }
                  : r
              )
              .filter((r) => r.count > 0);
          } else {
            newReactions = reactions.map((r) =>
              r.emoji === emoji
                ? { ...r, count: r.count + 1, users: [...r.users, currentUserId] }
                : r
            );
          }
        } else {
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

    if (orgId && !messageId.startsWith('msg-')) {
      chatApi.toggleReaction(orgId, messageId, emoji).catch(() => null);
    }
  },

  createChannel: async (orgId, name, description) => {
    const channelName = name.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '');

    try {
      const res = await chatApi.createChannel(orgId, { name: channelName, description });
      const createdChan: Channel = {
        id: res?.id || `chan-${Date.now()}`,
        name: res?.name || channelName,
        type: res?.type || 'PUBLIC',
        membersCount: 1,
        unreadCount: 0,
      };

      set((state) => ({
        channels: [...state.channels, createdChan],
        activeChannelId: createdChan.id,
        messages: {
          ...state.messages,
          [createdChan.id]: [
            {
              id: `msg-welcome-${createdChan.id}`,
              channelId: createdChan.id,
              senderId: 'system',
              senderName: 'SyncUp Bot',
              content: `📢 Welcome to #${createdChan.name}! This channel is ready for discussions.`,
              timestamp: 'Just now',
              reactions: [{ emoji: '🎉', count: 1, users: ['system'] }],
            },
          ],
        },
      }));

      const socket = get().socket;
      if (socket && socket.connected) {
        socket.emit('joinChannel', { channelId: createdChan.id });
      }
    } catch (e) {
      console.warn('Failed to create channel in backend:', e);
    }
  },
}));
