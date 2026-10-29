'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useAuthStore } from '@/store/authStore';
import { showSnack } from '@/store/snackbarStore';
import { useUIStore } from '@/store/uiStore';
import {
  Hash,
  Lock,
  Plus,
  Send,
  Paperclip,
  Smile,
  Search,
  Phone,
  Video,
  Info,
  MoreVertical,
  ExternalLink,
  Heart,
  ThumbsUp,
  Sparkles,
  X,
  UserPlus,
  SmilePlus,
  Mic,
  Volume2,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  MessageCircle,
} from 'lucide-react';

const STICKERS = [
  { name: 'Rocket', emoji: '🚀', label: 'To the Moon!' },
  { name: 'Fire', emoji: '🔥', label: 'On Fire!' },
  { name: 'Code Ninja', emoji: '🥷', label: 'Ship It' },
  { name: 'Party', emoji: '🎉', label: 'Congrats!' },
  { name: 'Coffee', emoji: '☕', label: 'Need Coffee' },
  { name: 'Bulb', emoji: '💡', label: 'Great Idea' },
  { name: '100', emoji: '💯', label: 'Approved' },
  { name: 'Bug Hunter', emoji: '🐞', label: 'Fix Found' },
];

export const ChatView: React.FC = () => {
  const {
    channels,
    activeChannelId,
    setActiveChannel,
    messages,
    sendMessage,
    toggleReaction,
    loadChannelsForOrg,
    createChannel,
  } = useChatStore();
  const { organizations, activeOrgId, members, projects } = useWorkspaceStore();
  const { currentUser, activeRole } = useAuthStore();
  const { language } = useUIStore();
  const isAr = language === 'ar';

  const [inputText, setInputText] = useState('');
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);
  const [isNewChannelModalOpen, setIsNewChannelModalOpen] = useState(false);
  const [isDirectMessageModalOpen, setIsDirectMessageModalOpen] = useState(false);
  const [isStickerPickerOpen, setIsStickerPickerOpen] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [newChanName, setNewChanName] = useState('');
  const [newChanDesc, setNewChanDesc] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPlatformOwner = currentUser?.isPlatformOwner || activeRole === 'PLATFORM_OWNER';
  const isOrgOwner = activeRole === 'ORG_ADMIN' || isPlatformOwner;

  const currentOrg = organizations.find((o) => o.id === activeOrgId) || organizations[0] || {
    id: activeOrgId || 'org-main',
    name: 'Workspace',
  };

  useEffect(() => {
    if (activeOrgId) {
      loadChannelsForOrg(activeOrgId, currentOrg.name);
    }
  }, [activeOrgId, currentOrg.name, loadChannelsForOrg]);

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0] || {
    id: 'general',
    name: 'general',
    type: 'PUBLIC',
    membersCount: 1,
  };

  const channelMessages = messages[activeChannel.id] || [];

  const handleSend = () => {
    if (!inputText.trim() && !attachedFile) return;

    let content = inputText.trim();
    if (attachedFile) {
      content = content ? `${content} \n📎 [Attachment: ${attachedFile.name} (${attachedFile.size})]` : `📎 [Attachment: ${attachedFile.name} (${attachedFile.size})]`;
    }

    sendMessage(activeChannel.id, content, currentUser?.name || 'Authorized Member', currentUser?.id || 'user-1');
    setInputText('');
    setAttachedFile(null);
  };

  const handleSendSticker = (sticker: typeof STICKERS[0]) => {
    sendMessage(
      activeChannel.id,
      `${sticker.emoji} **${sticker.label}**`,
      currentUser?.name || 'Authorized Member',
      currentUser?.id || 'user-1'
    );
    setIsStickerPickerOpen(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachedFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(0)} KB`,
        type: file.type.includes('image') ? 'image' : 'file',
      });
      showSnack(isAr ? `تم إرفاق: ${file.name}` : `Attached: ${file.name}`, 'info');
    }
  };

  const handleCreateChannelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChanName.trim()) return;
    await createChannel(activeOrgId, newChanName.trim(), newChanDesc.trim());
    setNewChanName('');
    setNewChanDesc('');
    setIsNewChannelModalOpen(false);
  };

  // Requirement 30: Org Owner start direct message with project member
  const handleStartDM = (member: any) => {
    const dmId = `dm-${member.id}`;
    // Check if channel already exists
    const existing = channels.find((c) => c.id === dmId);
    if (!existing) {
      useChatStore.setState((state) => ({
        channels: [
          ...state.channels,
          {
            id: dmId,
            name: member.user?.name || member.user?.fullName || 'Direct Message',
            type: 'DIRECT',
            membersCount: 2,
            isDirectMessage: true,
            userStatus: 'online',
          },
        ],
      }));
    }
    setActiveChannel(dmId);
    setIsDirectMessageModalOpen(false);
    showSnack(isAr ? `بدأت محادثة مباشرة مع ${member.user?.name}` : `Started DM with ${member.user?.name}`, 'success');
  };

  const teammates = members.filter((m) => m.userId !== currentUser?.id && m.user?.email !== currentUser?.email);

  const quickEmojis = ['👍', '❤️', '🚀', '😂', '🎉', '👀'];

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: 'var(--bg-surface)' }}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* Discord-Style Left Navigation Bar (Requirement 31) */}
      <div
        style={{
          width: '250px',
          borderRight: '1px solid var(--border-light)',
          background: 'var(--bg-app)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        {/* Workspace Brand / Header */}
        <div
          style={{
            padding: '16px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={16} color="var(--primary)" />
              <span>{isAr ? 'قنوات الفريق' : 'Team Channels'}</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{currentOrg.name}</div>
          </div>

          <button
            type="button"
            className="btn-ghost"
            onClick={() => setIsNewChannelModalOpen(true)}
            style={{ padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
            title="Create Channel"
          >
            <Plus size={16} color="var(--primary)" />
          </button>
        </div>

        {/* Channels List (Discord Styled) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* TEXT CHANNELS CATEGORY */}
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: 'var(--text-muted)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                padding: '0 8px 6px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>{isAr ? 'القنوات العامة' : 'TEXT CHANNELS'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {channels
                .filter((c) => c.type !== 'DIRECT')
                .map((ch) => {
                  const isActive = ch.id === activeChannel.id;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setActiveChannel(ch.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: isActive ? 'var(--primary-light)' : 'transparent',
                        color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '13px',
                        cursor: 'pointer',
                        textAlign: isAr ? 'right' : 'left',
                        width: '100%',
                        transition: 'background var(--transition-fast)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Hash size={15} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
                        <span>{ch.name}</span>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* DIRECT MESSAGES (Requirement 30: Org Owner can initiate DM with project members) */}
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: 'var(--text-muted)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                padding: '0 8px 6px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>{isAr ? 'الرسائل المباشرة' : 'DIRECT MESSAGES'}</span>
              {isOrgOwner && (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setIsDirectMessageModalOpen(true)}
                  style={{ padding: '2px', border: 'none', cursor: 'pointer' }}
                  title="New Direct Message"
                >
                  <Plus size={14} color="var(--primary)" />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {channels
                .filter((c) => c.type === 'DIRECT')
                .map((dm) => {
                  const isActive = dm.id === activeChannel.id;
                  return (
                    <button
                      key={dm.id}
                      type="button"
                      onClick={() => setActiveChannel(dm.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '7px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: isActive ? 'var(--primary-light)' : 'transparent',
                        color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '13px',
                        cursor: 'pointer',
                        textAlign: isAr ? 'right' : 'left',
                        width: '100%',
                      }}
                    >
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#10b981',
                        }}
                      />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {dm.name}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Conversation Stream */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {/* Top Active Channel Header */}
        <div
          style={{
            height: '56px',
            padding: '0 24px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Hash size={20} color="var(--primary)" />
            <div>
              <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-main)' }}>
                {activeChannel.name}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                {activeChannel.membersCount} {isAr ? 'أعضاء' : 'members'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="btn-ghost"
              style={{ padding: '7px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
              title="Voice Call"
              onClick={() => showSnack(isAr ? 'بدء مكالمة صوتية...' : 'Starting voice call...', 'info')}
            >
              <Phone size={16} color="var(--text-secondary)" />
            </button>
            <button
              type="button"
              className="btn-ghost"
              style={{ padding: '7px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
              title="Video Call"
              onClick={() => showSnack(isAr ? 'بدء مكالمة مرئية...' : 'Starting video call...', 'info')}
            >
              <Video size={16} color="var(--text-secondary)" />
            </button>
          </div>
        </div>

        {/* Messages Stream */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {channelMessages.map((msg) => {
            const isHovered = hoveredMsgId === msg.id;
            return (
              <div
                key={msg.id}
                onMouseEnter={() => setHoveredMsgId(msg.id)}
                onMouseLeave={() => setHoveredMsgId(null)}
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: isHovered ? 'var(--bg-subtle)' : 'transparent',
                  position: 'relative',
                  transition: 'background var(--transition-fast)',
                }}
              >
                {/* Quick Emoji Reaction Popover */}
                {isHovered && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-14px',
                      right: isAr ? 'auto' : '16px',
                      left: isAr ? '16px' : 'auto',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                      padding: '2px 6px',
                      display: 'flex',
                      gap: '4px',
                      boxShadow: 'var(--shadow-sm)',
                      zIndex: 5,
                    }}
                  >
                    {quickEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => toggleReaction(activeChannel.id, msg.id, emoji, currentUser?.id || 'user-1')}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '15px',
                          padding: '2px 4px',
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {/* Sender Avatar */}
                <div
                  className="avatar"
                  style={{
                    width: '36px',
                    height: '36px',
                    background:
                      msg.senderId === 'system'
                        ? 'linear-gradient(135deg, #0284c7, #0369a1)'
                        : 'linear-gradient(135deg, #2563eb, #4f46e5)',
                    fontSize: '12px',
                    fontWeight: 800,
                  }}
                >
                  {msg.senderName ? msg.senderName.split(' ').map((n) => n[0]).join('').substring(0, 2) : 'M'}
                </div>

                {/* Message Body */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-main)' }}>
                      {msg.senderName}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{msg.timestamp}</span>
                  </div>

                  <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5, wordBreak: 'break-word' }}>
                    {msg.content}
                  </div>

                  {/* Reaction Pills */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                      {msg.reactions.map((r, idx) => {
                        const hasReacted = currentUser?.id ? r.users.includes(currentUser.id) : false;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => toggleReaction(activeChannel.id, msg.id, r.emoji, currentUser?.id || 'user-1')}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              border: hasReacted ? '1px solid var(--primary)' : '1px solid var(--border-light)',
                              background: hasReacted ? 'var(--primary-light)' : 'var(--bg-surface)',
                              fontSize: '12px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              color: hasReacted ? 'var(--primary)' : 'var(--text-secondary)',
                            }}
                          >
                            <span>{r.emoji}</span>
                            <span>{r.count}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Attached File Preview Pill */}
        {attachedFile && (
          <div
            style={{
              padding: '6px 20px',
              background: 'var(--bg-app)',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--primary)' }}>
              <Paperclip size={14} />
              <span>
                {attachedFile.name} ({attachedFile.size})
              </span>
            </div>
            <button
              type="button"
              className="btn-ghost"
              style={{ padding: '2px', border: 'none', cursor: 'pointer' }}
              onClick={() => setAttachedFile(null)}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Sticker Picker Popover (Requirement 38) */}
        {isStickerPickerOpen && (
          <div
            style={{
              padding: '12px 18px',
              background: 'var(--bg-surface)',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              overflowX: 'auto',
              animation: 'slideDown 0.15s ease-out',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)' }}>
              {isAr ? 'الملصقات:' : 'STICKERS:'}
            </span>
            {STICKERS.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => handleSendSticker(s)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-light)',
                  cursor: 'pointer',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  transition: 'transform 0.15s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <span style={{ fontSize: '16px' }}>{s.emoji}</span>
                <span>{s.label}</span>
              </button>
            ))}
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setIsStickerPickerOpen(false)}
              style={{ padding: '4px', border: 'none', cursor: 'pointer' }}
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Message Input Box */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-light)', background: 'var(--bg-surface)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-light)',
              borderRadius: '12px',
              padding: '8px 12px',
            }}
          >
            {/* Attachment Button (Requirement 38) */}
            <button
              type="button"
              className="btn-ghost"
              style={{ padding: '4px', border: 'none', cursor: 'pointer' }}
              title="Attach File or Image"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip size={18} color="var(--text-muted)" />
            </button>

            {/* Sticker Button (Requirement 38) */}
            <button
              type="button"
              className="btn-ghost"
              style={{ padding: '4px', border: 'none', cursor: 'pointer' }}
              title="Send Sticker"
              onClick={() => setIsStickerPickerOpen(!isStickerPickerOpen)}
            >
              <SmilePlus size={18} color={isStickerPickerOpen ? 'var(--primary)' : 'var(--text-muted)'} />
            </button>

            <input
              type="text"
              placeholder={`${isAr ? 'أرسل رسالة إلى #' : 'Message #'}${activeChannel.name}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '13.5px',
                color: 'var(--text-main)',
              }}
            />

            <button
              type="button"
              onClick={handleSend}
              className="btn btn-primary"
              style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px' }}
            >
              <Send size={14} />
              <span>{isAr ? 'إرسال' : 'Send'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Org Owner Direct Message Modal (Requirement 30) */}
      {isDirectMessageModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 9995,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setIsDirectMessageModalOpen(false)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '440px',
              padding: '24px',
              background: 'var(--bg-surface)',
              borderRadius: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageCircle size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)' }}>
                  {isAr ? 'بدء محادثة مباشرة مع عضو المشروع' : 'Start Direct Message with Member'}
                </h3>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setIsDirectMessageModalOpen(false)}
                style={{ padding: '4px', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
              {teammates.length === 0 ? (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                  No other members found in this project.
                </div>
              ) : (
                teammates.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleStartDM(m)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {m.user?.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {m.user?.email} • {m.role}
                      </div>
                    </div>
                    <span className="badge badge-primary" style={{ fontSize: '11px' }}>
                      {isAr ? 'محادثة' : 'Chat'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Channel Modal */}
      {isNewChannelModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 9995,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setIsNewChannelModalOpen(false)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '420px',
              padding: '24px',
              background: 'var(--bg-surface)',
              borderRadius: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
              {isAr ? 'إنشاء قناة جديدة' : 'Create a Channel'}
            </h3>

            <form onSubmit={handleCreateChannelSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                  {isAr ? 'اسم القناة' : 'Channel Name'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Hash size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. backend or announcements"
                    value={newChanName}
                    onChange={(e) => setNewChanName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-app)',
                      outline: 'none',
                      fontSize: '13px',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                  {isAr ? 'الوصف (اختياري)' : 'Description (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder="What is this channel about?"
                  value={newChanDesc}
                  onChange={(e) => setNewChanDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-app)',
                    outline: 'none',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsNewChannelModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                  {isAr ? 'إنشاء القناة' : 'Create Channel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
