'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useUIStore } from '@/store/uiStore';
import { showSnack } from '@/store/snackbarStore';
import { TaskPriority } from '@/types';
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
  Edit2,
  Trash2,
  Check,
  ChevronDown,
  Layers,
  AlertCircle,
} from 'lucide-react';

export const TaskDetailModal: React.FC = () => {
  const {
    tasks,
    selectedTaskId,
    selectTask,
    updateTaskStatus,
    updateTask,
    deleteTask,
    toggleSubtask,
    addComment,
  } = useWorkspaceStore();
  const { language } = useUIStore();
  const isAr = language === 'ar';

  const [commentText, setCommentText] = useState('');
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');

  // Editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editDesc, setEditDesc] = useState('');
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [editDueDate, setEditDueDate] = useState('');

  const task = tasks.find((t) => t.id === selectedTaskId);

  // Sync edit buffers when task changes
  useEffect(() => {
    if (task) {
      setEditTitle(task.title);
      setEditDesc(task.description);
      setEditDueDate(task.dueDate || '');
      setIsEditingTitle(false);
      setIsEditingDesc(false);
      setIsEditingDueDate(false);
    }
  }, [task?.id]);

  // Global Escape Key Listener to easily exit the ticket
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        selectTask(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectTask]);

  if (!selectedTaskId || !task) return null;

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

  const handlePostComment = () => {
    if (!commentText.trim()) return;
    addComment(task.id, commentText.trim());
    setCommentText('');
  };

  const handleSaveTitle = async () => {
    if (!editTitle.trim()) return;
    await updateTask(task.id, { title: editTitle.trim() });
    setIsEditingTitle(false);
    showSnack(isAr ? 'تم تعديل عنوان التذكرة' : 'Task title updated', 'success');
  };

  const handleSaveDesc = async () => {
    await updateTask(task.id, { description: editDesc.trim() });
    setIsEditingDesc(false);
    showSnack(isAr ? 'تم تعديل الوصف' : 'Description updated', 'success');
  };

  const handleSaveDueDate = async () => {
    if (!editDueDate.trim()) return;
    await updateTask(task.id, { dueDate: editDueDate.trim() });
    setIsEditingDueDate(false);
    showSnack(isAr ? 'تم تعديل تاريخ الاستحقاق' : 'Due date updated', 'success');
  };

  const handlePriorityChange = async (newPriority: TaskPriority) => {
    await updateTask(task.id, { priority: newPriority });
    showSnack(
      isAr ? `تم تعديل الأولوية إلى ${newPriority}` : `Priority changed to ${newPriority}`,
      'success'
    );
  };

  const handleStoryPointsChange = async (points: number) => {
    await updateTask(task.id, { storyPoints: points });
    showSnack(isAr ? `النقاط: ${points}` : `Story points set to ${points}`, 'success');
  };

  const handleDeleteTask = async () => {
    if (confirm(isAr ? 'هل أنت متأكد من حذف هذه المهمة؟' : 'Are you sure you want to delete this issue?')) {
      await deleteTask(task.id);
      showSnack(isAr ? 'تم حذف التذكرة' : 'Issue deleted successfully', 'info');
    }
  };

  const getNextStatus = (current: string) => {
    if (current === 'TODO') return 'IN_PROGRESS';
    if (current === 'IN_PROGRESS') return 'IN_REVIEW';
    if (current === 'IN_REVIEW') return 'DONE';
    return 'TODO';
  };

  const nextStatus = getNextStatus(task.status);

  return (
    <div
      onClick={() => selectTask(null)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: isAr ? 'flex-start' : 'flex-end',
        zIndex: 10050, // Always above header and all other views
        animation: 'fadeIn 0.15s ease-out',
      }}
    >
      {/* Slide-over Container */}
      <div
        className="animate-slide-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '580px',
          maxWidth: '100%',
          height: '100%',
          background: 'var(--bg-surface)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderLeft: isAr ? 'none' : '1px solid var(--border-light)',
          borderRight: isAr ? '1px solid var(--border-light)' : 'none',
        }}
      >
        {/* Header - Visible and Functional */}
        <div
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-app)',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => selectTask(null)}
              className="btn-ghost"
              title={isAr ? 'إغلاق (Esc)' : 'Close ticket (Esc)'}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-main)',
                transition: 'all 0.15s ease',
              }}
            >
              <X size={18} />
            </button>

            <span
              style={{
                fontFamily: 'var(--font-family-mono)',
                fontSize: '12px',
                fontWeight: 800,
                color: 'var(--text-muted)',
                padding: '4px 8px',
                borderRadius: '6px',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {task.id}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleDeleteTask}
              title={isAr ? 'حذف التذكرة' : 'Delete ticket'}
              className="btn-ghost"
              style={{
                padding: '7px',
                borderRadius: '6px',
                color: '#ef4444',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Trash2 size={16} />
            </button>

            <button
              type="button"
              onClick={() => updateTaskStatus(task.id, nextStatus as any)}
              className="btn btn-primary"
              style={{ padding: '7px 14px', fontSize: '12.5px', fontWeight: 700 }}
            >
              <CheckCircle2 size={15} />
              <span>
                {isAr
                  ? `تحويل إلى ${nextStatus.replace('_', ' ')}`
                  : `Mark as ${nextStatus.replace('_', ' ')}`}
              </span>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px' }}>
          {/* Top Quick Attributes Bar: Priority, Story Points, Issue Type */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '18px',
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-light)',
            }}
          >
            {/* Priority Selector (Requirement: Easily edit priority) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {isAr ? 'الأولوية:' : 'Priority:'}
              </span>
              <select
                value={task.priority}
                onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-light)',
                  background:
                    task.priority === 'HIGH' || task.priority === 'URGENT'
                      ? 'rgba(239, 68, 68, 0.12)'
                      : task.priority === 'MEDIUM'
                      ? 'rgba(245, 158, 11, 0.12)'
                      : 'rgba(16, 185, 129, 0.12)',
                  color:
                    task.priority === 'HIGH' || task.priority === 'URGENT'
                      ? '#dc2626'
                      : task.priority === 'MEDIUM'
                      ? '#d97706'
                      : '#059669',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="LOW">{isAr ? '🟢 منخفضة (LOW)' : '🟢 Low'}</option>
                <option value="MEDIUM">{isAr ? '🟡 متوسطة (MEDIUM)' : '🟡 Medium'}</option>
                <option value="HIGH">{isAr ? '🔴 مرتفعة (HIGH)' : '🔴 High'}</option>
                <option value="URGENT">{isAr ? '🔥 عاجلة (URGENT)' : '🔥 Urgent'}</option>
              </select>
            </div>

            {/* Story Points Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {isAr ? 'النقاط:' : 'Points:'}
              </span>
              <select
                value={task.storyPoints || 1}
                onChange={(e) => handleStoryPointsChange(Number(e.target.value))}
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-app)',
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {[1, 2, 3, 5, 8, 13].map((pt) => (
                  <option key={pt} value={pt}>
                    {pt} {isAr ? 'نقاط' : 'pts'}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="badge badge-primary"
                    style={{ fontSize: '11px', padding: '3px 7px' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Editable Task Title */}
          <div style={{ marginBottom: '18px' }}>
            {isEditingTitle ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') setIsEditingTitle(false);
                  }}
                  autoFocus
                  style={{
                    flex: 1,
                    fontSize: '18px',
                    fontWeight: 800,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '2px solid var(--primary)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={handleSaveTitle}
                  className="btn btn-primary"
                  style={{ padding: '8px 12px' }}
                >
                  <Check size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(false)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 12px' }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '10px',
                }}
              >
                <h2
                  onClick={() => setIsEditingTitle(true)}
                  title={isAr ? 'انقر لتعديل العنوان' : 'Click to edit title'}
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: 'var(--text-main)',
                    lineHeight: 1.3,
                    cursor: 'pointer',
                    flex: 1,
                    transition: 'color 0.15s ease',
                  }}
                >
                  {task.title}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(true)}
                  className="btn-ghost"
                  title={isAr ? 'تعديل العنوان' : 'Edit title'}
                  style={{
                    padding: '6px',
                    borderRadius: '6px',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  <Edit2 size={15} />
                </button>
              </div>
            )}
          </div>

          {/* Editable Description */}
          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <div
                style={{
                  fontSize: '11.5px',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {isAr ? 'الوصف (Description)' : 'Description'}
              </div>
              {!isEditingDesc && (
                <button
                  type="button"
                  onClick={() => setIsEditingDesc(true)}
                  className="btn-ghost"
                  style={{
                    padding: '3px 8px',
                    fontSize: '11.5px',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <Edit2 size={12} />
                  <span>{isAr ? 'تعديل الوصف' : 'Edit'}</span>
                </button>
              )}
            </div>

            {isEditingDesc ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <textarea
                  rows={4}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    fontSize: '13.5px',
                    outline: 'none',
                    resize: 'vertical',
                    lineHeight: 1.5,
                  }}
                />
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setIsEditingDesc(false)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDesc}
                    className="btn btn-primary"
                    style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 700 }}
                  >
                    {isAr ? 'حفظ الوصف' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <p
                onClick={() => setIsEditingDesc(true)}
                title={isAr ? 'انقر لتعديل الوصف' : 'Click to edit description'}
                style={{
                  fontSize: '14px',
                  color: task.description ? 'var(--text-secondary)' : 'var(--text-muted)',
                  lineHeight: 1.6,
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '6px',
                  background: 'transparent',
                  transition: 'background 0.15s ease',
                }}
              >
                {task.description || (isAr ? 'لا يوجد وصف. انقر للإضافة...' : 'No description provided. Click to add...')}
              </p>
            )}
          </div>

          {/* Meta Grid: Assignees & Due Date */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              padding: '16px',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '24px',
              border: '1px solid var(--border-light)',
            }}
          >
            {/* Assignees */}
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                {isAr ? 'المكلفون' : 'Assignees'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                {task.assignees && task.assignees.length > 0 ? (
                  task.assignees.map((assignee) => (
                    <div
                      key={assignee.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'var(--bg-surface)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-light)',
                      }}
                    >
                      <div
                        className="avatar"
                        style={{ width: '22px', height: '22px', background: '#3b82f6', fontSize: '10px' }}
                      >
                        {assignee.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                        {assignee.name}
                      </span>
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {isAr ? 'غير مخصص' : 'Unassigned'}
                  </span>
                )}
              </div>
            </div>

            {/* Due Date (Editable) */}
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                {isAr ? 'تاريخ الاستحقاق' : 'Due Date'}
              </div>
              {isEditingDueDate ? (
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveDueDate();
                    }}
                    placeholder="e.g. Nov 20, 2026"
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      fontSize: '12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-app)',
                      color: 'var(--text-main)',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSaveDueDate}
                    className="btn btn-primary"
                    style={{ padding: '4px 8px', fontSize: '11px' }}
                  >
                    <Check size={12} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingDueDate(true)}
                  title={isAr ? 'انقر لتعديل التاريخ' : 'Click to edit date'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                  }}
                >
                  <Calendar size={14} color="var(--primary)" />
                  <span>{task.dueDate || (isAr ? 'حدد موعداً' : 'Set due date')}</span>
                  <Edit2 size={11} color="var(--text-muted)" style={{ marginLeft: '4px' }} />
                </div>
              )}
            </div>
          </div>

          {/* Subtasks Checklist */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                {isAr ? 'المهام الفرعية' : 'Subtasks'} ({completedSubtasks}/{task.subtasks.length})
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
                    background: st.completed ? 'var(--bg-subtle)' : 'var(--bg-surface)',
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
                  <span
                    style={{
                      fontSize: '13.5px',
                      color: st.completed ? 'var(--text-muted)' : 'var(--text-main)',
                      textDecoration: st.completed ? 'line-through' : 'none',
                    }}
                  >
                    {st.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
                {isAr ? 'المرفقات' : 'Attachments'} ({task.attachments.length})
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
                      {isAr ? 'تنزيل' : 'Download'}
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
                type="button"
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
                {isAr ? 'التعليقات' : 'Comments'} ({task.comments.length})
              </button>
              <button
                type="button"
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
                {isAr ? 'سجل النشاط' : 'Activity'}
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
                    <div
                      style={{
                        flex: 1,
                        background: 'var(--bg-subtle)',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
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
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border-light)',
            background: 'var(--bg-surface)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <input
            type="text"
            placeholder={isAr ? 'أضف تعليقاً أو اذكر زميلاً...' : 'Add a comment or @mention team...'}
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
              color: 'var(--text-main)',
            }}
          />
          <button
            type="button"
            onClick={handlePostComment}
            className="btn btn-primary"
            style={{ padding: '10px 16px' }}
          >
            <Send size={15} />
            <span>{isAr ? 'إرسال' : 'Post'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
