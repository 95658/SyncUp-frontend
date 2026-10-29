'use client';

import React, { useState } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import {
  X,
  CheckCircle2,
  Calendar,
  Tag,
  Paperclip,
  Send,
  UserPlus,
  Plus,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';

export const TaskDetailModal: React.FC = () => {
  const { tasks, selectedTaskId, selectTask, updateTaskStatus, toggleSubtask, addComment } = useWorkspaceStore();
  const [commentText, setCommentText] = useState('');
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');

  if (!selectedTaskId) return null;
  const task = tasks.find((t) => t.id === selectedTaskId);
  if (!task) return null;

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

  const handlePostComment = () => {
    if (!commentText.trim()) return;
    addComment(task.id, commentText.trim());
    setCommentText('');
  };

  const getNextStatus = (current: string) => {
    if (current === 'TODO') return 'IN_PROGRESS';
    if (current === 'IN_PROGRESS') return 'IN_REVIEW';
    if (current === 'IN_REVIEW') return 'DONE';
    return 'TODO';
  };

  const nextStatus = getNextStatus(task.status);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      justifyContent: 'flex-end',
      zIndex: 50,
    }}>
      {/* Slide-over Container */}
      <div
        className="animate-slide-in"
        style={{
          width: '540px',
          maxWidth: '100%',
          height: '100%',
          background: 'var(--bg-surface)',
          boxShadow: 'var(--shadow-drawer)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <button
            onClick={() => selectTask(null)}
            className="btn-ghost"
            style={{ padding: '6px', borderRadius: '6px', cursor: 'pointer', border: 'none' }}
          >
            <X size={20} color="var(--text-secondary)" />
          </button>

          <button
            onClick={() => updateTaskStatus(task.id, nextStatus as any)}
            className="btn btn-primary"
            style={{ padding: '7px 14px', fontSize: '13px' }}
          >
            <CheckCircle2 size={16} />
            <span>Mark as {nextStatus.replace('_', ' ')}</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* Priority & Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
            <span className={`badge ${task.priority === 'HIGH' ? 'badge-danger' : 'badge-warning'}`}>
              {task.priority}
            </span>
            {task.tags.map((tag) => (
              <span key={tag} className="badge badge-primary">
                {tag}
              </span>
            ))}
          </div>

          {/* Task Title */}
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.3, marginBottom: '16px' }}>
            {task.title}
          </h2>

          {/* Description */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Description
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {task.description}
            </p>
          </div>

          {/* Meta Grid: Assignees, Due Date, Labels */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            padding: '16px',
            background: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px',
          }}>
            {/* Assignees */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Assignees
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {task.assignees.map((assignee) => (
                  <div key={assignee.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div className="avatar" style={{ width: '28px', height: '28px', background: '#3b82f6', fontSize: '11px' }}>
                      {assignee.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {assignee.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Due Date
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                <Calendar size={14} color="var(--primary)" />
                <span>{task.dueDate}</span>
              </div>
            </div>
          </div>

          {/* Subtasks Checklist */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                Subtasks ({completedSubtasks}/{task.subtasks.length})
              </div>
              <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>
                {task.subtasks.length > 0 ? Math.round((completedSubtasks / task.subtasks.length) * 100) : 0}% done
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {task.subtasks.map((st) => (
                <div
                  key={st.id}
                  onClick={() => toggleSubtask(task.id, st.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    background: st.completed ? 'var(--bg-subtle)' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={() => {}}
                    style={{ cursor: 'pointer', accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                  />
                  <span style={{
                    fontSize: '13.5px',
                    color: st.completed ? 'var(--text-muted)' : 'var(--text-main)',
                    textDecoration: st.completed ? 'line-through' : 'none',
                  }}>
                    {st.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Attachments */}
          {task.attachments.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
                Attachments ({task.attachments.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {task.attachments.map((att) => (
                  <div
                    key={att.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {att.type === 'image' ? (
                        <ImageIcon size={18} color="var(--primary)" />
                      ) : (
                        <FileText size={18} color="var(--danger)" />
                      )}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-main)' }}>
                          {att.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {att.size}
                        </div>
                      </div>
                    </div>

                    <a
                      href={att.url}
                      className="btn-ghost"
                      style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer', textDecoration: 'none' }}
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments & Activity Section */}
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setActiveTab('comments')}
                style={{
                  padding: '8px 4px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'comments' ? '2px solid var(--primary)' : '2px solid transparent',
                  fontWeight: activeTab === 'comments' ? 700 : 500,
                  color: activeTab === 'comments' ? 'var(--primary)' : 'var(--text-secondary)',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Comments ({task.comments.length})
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                style={{
                  padding: '8px 4px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'activity' ? '2px solid var(--primary)' : '2px solid transparent',
                  fontWeight: activeTab === 'activity' ? 700 : 500,
                  color: activeTab === 'activity' ? 'var(--primary)' : 'var(--text-secondary)',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Activity
              </button>
            </div>

            {/* Comments List */}
            {activeTab === 'comments' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
                {task.comments.map((c) => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div className="avatar" style={{ width: '28px', height: '28px', background: '#8b5cf6', fontSize: '10px' }}>
                      {c.userName.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div style={{
                      flex: 1,
                      background: 'var(--bg-subtle)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--text-main)' }}>
                          {c.userName}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {c.createdAt}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {c.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comment Input Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border-light)',
          background: 'var(--bg-surface)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <input
            type="text"
            placeholder="Add a comment or @mention team..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handlePostComment();
            }}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              background: 'var(--bg-subtle)',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <button
            onClick={handlePostComment}
            className="btn btn-primary"
            style={{ padding: '10px 16px' }}
          >
            <Send size={15} />
            <span>Post</span>
          </button>
        </div>
      </div>
    </div>
  );
};
