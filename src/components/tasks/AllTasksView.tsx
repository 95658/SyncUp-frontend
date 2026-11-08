'use client';

import React, { useState } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { showSnack } from '@/store/snackbarStore';
import { Task, TaskStatus } from '@/types';
import {
  CheckSquare,
  Filter,
  Search,
  Plus,
  Bug,
  Ticket,
  Zap,
  FolderOpen,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  SlidersHorizontal,
  Layers,
  User,
} from 'lucide-react';

export const AllTasksView: React.FC = () => {
  const { tasks, projects, sprints, members, selectTask, updateTaskStatus, addNewTask } = useWorkspaceStore();
  const { currentUser, activeRole } = useAuthStore();
  const { language } = useUIStore();
  const isAr = language === 'ar';

  const [search, setSearch] = useState('');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('ALL');
  const [selectedSprintFilter, setSelectedSprintFilter] = useState('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Modal for quick task creation
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newProject, setNewProject] = useState(projects[0]?.id || 'proj-1');
  const [newSprint, setNewSprint] = useState('Sprint 1');
  const [newType, setNewType] = useState<'task' | 'bug' | 'ticket'>('ticket');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');

  // Display user tasks (clean state with zero hardcoded dummy tasks)
  const displayTasks: Task[] = tasks;

  // Derive task type helper
  const getTaskType = (task: Task): 'bug' | 'ticket' | 'task' => {
    const isBug = task.tags?.some((t) => t.toLowerCase().includes('bug') || t.toLowerCase().includes('issue')) ||
      task.title.toLowerCase().includes('bug') ||
      task.title.toLowerCase().includes('fix');
    if (isBug) return 'bug';

    const isTicket = task.tags?.some((t) => t.toLowerCase().includes('ticket') || t.toLowerCase().includes('story')) ||
      task.title.toLowerCase().includes('ticket') ||
      task.title.toLowerCase().includes('implement') ||
      task.title.toLowerCase().includes('design');
    if (isTicket) return 'ticket';

    return 'task';
  };

  // Derive sprint name helper
  const getTaskSprint = (task: Task): string => {
    const sprintTag = task.tags?.find((t) => t.toLowerCase().includes('sprint'));
    if (sprintTag) {
      return sprintTag.toUpperCase().replace('-', ' ');
    }
    if (task.description?.includes('[Sprint:')) {
      const match = task.description.match(/\[Sprint:\s*([^\]]+)\]/);
      if (match && match[1]) return match[1];
    }
    return 'Sprint 1';
  };

  // Filter Tasks
  const filteredTasks = displayTasks.filter((task) => {
    // 1. Text search
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        task.title.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q) ||
        task.id.toLowerCase().includes(q) ||
        task.projectName?.toLowerCase().includes(q);
      if (!match) return false;
    }

    // 2. Project filter
    if (selectedProjectFilter !== 'ALL') {
      if (task.projectId !== selectedProjectFilter && task.projectName !== selectedProjectFilter) {
        return false;
      }
    }

    // 3. Sprint filter
    if (selectedSprintFilter !== 'ALL') {
      const sprintName = getTaskSprint(task);
      if (!sprintName.toLowerCase().includes(selectedSprintFilter.toLowerCase())) {
        return false;
      }
    }

    // 4. Type filter (bug vs ticket vs task)
    if (selectedTypeFilter !== 'ALL') {
      const type = getTaskType(task);
      if (type !== selectedTypeFilter) return false;
    }

    // 5. Status filter
    if (selectedStatusFilter !== 'ALL') {
      if (task.status !== selectedStatusFilter) return false;
    }

    return true;
  });

  const totalCount = displayTasks.length;
  const inProgressCount = displayTasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const inReviewCount = displayTasks.filter((t) => t.status === 'IN_REVIEW').length;
  const doneCount = displayTasks.filter((t) => t.status === 'DONE').length;
  const bugCount = displayTasks.filter((t) => getTaskType(t) === 'bug').length;

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const projObj = projects.find((p) => p.id === newProject) || projects[0];
    const taskSprintTag = newSprint.toLowerCase().replace(/\s+/g, '-');
    const targetSprint = sprints.find(
      (s) => s.projectId === projObj?.id && (s.name.toLowerCase() === newSprint.toLowerCase() || s.status === 'ACTIVE')
    );

    const created = await addNewTask({
      title: newTitle.trim(),
      description: newDesc.trim() || `Task created for ${newSprint}`,
      status: 'TODO',
      priority: newPriority,
      projectId: projObj?.id || 'main',
      projectName: projObj?.name || 'Main Project',
      sprintId: targetSprint?.id || null,
      tags: [newType, taskSprintTag],
      assignees: [{ id: currentUser?.id || 'u-1', name: currentUser?.name || 'Assignee' }],
      dueDate: 'Upcoming',
      subtasks: [],
    });

    setNewTitle('');
    setNewDesc('');
    setIsNewTaskOpen(false);
    showSnack(isAr ? 'تمت إضافة المهمة بنجاح' : 'Task created successfully across sprint backlog!', 'success');
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* View Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'var(--primary-light)', borderRadius: '9999px', marginBottom: '8px' }}>
            <Layers size={13} color="var(--primary)" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.04em' }}>
              GLOBAL WORKSPACE TASKS & SPRINT BACKLOG
            </span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            {isAr ? 'جميع المهام والتذاكر عبر المشاريع' : 'All Tasks & Backlog'}
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            {isAr
              ? 'تصفح وتتبع كافة المهام والتذاكر والبلاغات (Bugs) لجميع السبرنتات والمشاريع في مكان واحد.'
              : 'Browse and filter every task, user story, feature ticket, and bug across all active projects and sprints.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewTaskOpen(true)}
          className="btn btn-primary"
          style={{ padding: '10px 18px', fontSize: '13.5px', fontWeight: 700, borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} />
          <span>{isAr ? 'إضافة مهمة / تذكرة جديدة' : 'New Task or Ticket'}</span>
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        <div className="card" style={{ padding: '16px 20px', background: 'var(--bg-surface)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Total Tasks</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>{totalCount}</div>
        </div>
        <div className="card" style={{ padding: '16px 20px', background: 'var(--bg-surface)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>In Progress</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>{inProgressCount}</div>
        </div>
        <div className="card" style={{ padding: '16px 20px', background: 'var(--bg-surface)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b' }}>In Review</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>{inReviewCount}</div>
        </div>
        <div className="card" style={{ padding: '16px 20px', background: 'var(--bg-surface)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--success)' }}>Completed</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>{doneCount}</div>
        </div>
        <div className="card" style={{ padding: '16px 20px', background: 'var(--bg-surface)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444' }}>Bugs & Issues</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>{bugCount}</div>
        </div>
      </div>

      {/* Filter Control Bar (Requirement 7) */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          background: 'var(--bg-surface)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Keyword Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', [isAr ? 'right' : 'left']: '12px', top: '11px' }} />
            <input
              type="text"
              placeholder={isAr ? 'بحث في المهام والتذاكر...' : 'Filter tasks by keyword, tag, or ID...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: isAr ? '8px 36px 8px 12px' : '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-app)',
                color: 'var(--text-main)',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          {/* Project Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FolderOpen size={15} color="var(--text-muted)" />
            <select
              value={selectedProjectFilter}
              onChange={(e) => setSelectedProjectFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-app)',
                color: 'var(--text-main)',
                fontSize: '12.5px',
                outline: 'none',
                fontWeight: 600,
              }}
            >
              <option value="ALL">{isAr ? 'جميع المشاريع' : 'All Projects'}</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Sprint Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <SlidersHorizontal size={15} color="var(--text-muted)" />
            <select
              value={selectedSprintFilter}
              onChange={(e) => setSelectedSprintFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-app)',
                color: 'var(--text-main)',
                fontSize: '12.5px',
                outline: 'none',
                fontWeight: 600,
              }}
            >
              <option value="ALL">{isAr ? 'جميع السبرنتات' : 'All Sprints'}</option>
              <option value="Sprint 1">Sprint 1</option>
              <option value="Sprint 2">Sprint 2</option>
              <option value="Sprint 3">Sprint 3</option>
              <option value="Backlog">Backlog</option>
            </select>
          </div>

          {/* Task Type Filter (Bug vs Ticket vs Task) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={15} color="var(--text-muted)" />
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-app)',
                color: 'var(--text-main)',
                fontSize: '12.5px',
                outline: 'none',
                fontWeight: 600,
              }}
            >
              <option value="ALL">{isAr ? 'جميع الأنواع' : 'All Types'}</option>
              <option value="bug">{isAr ? '🐞 بلاغات وأخطاء (Bugs)' : '🐞 Bugs & Issues'}</option>
              <option value="ticket">{isAr ? '🎫 تذاكر ميزات (Tickets)' : '🎫 Feature Tickets'}</option>
              <option value="task">{isAr ? '⚡ مهام عادية (Tasks)' : '⚡ Core Tasks'}</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-app)',
                color: 'var(--text-main)',
                fontSize: '12.5px',
                outline: 'none',
                fontWeight: 600,
              }}
            >
              <option value="ALL">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="DONE">Done</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="card" style={{ background: 'var(--bg-surface)', padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isAr ? 'right' : 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border-light)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '14px 20px', fontWeight: 700 }}>{isAr ? 'المهمة / التذكرة' : 'Task / Ticket'}</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>{isAr ? 'المشروع' : 'Project'}</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>{isAr ? 'السبرنت' : 'Sprint'}</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>{isAr ? 'النوع' : 'Type'}</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>{isAr ? 'الأولوية' : 'Priority'}</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>{isAr ? 'المسؤول' : 'Assignee'}</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>{isAr ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13.5px' }}>
                    {isAr ? 'لا توجد مهام تطابق معايير التصفية المحددة' : 'No tasks match the selected filters.'}
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => {
                  const type = getTaskType(t);
                  const sprintName = getTaskSprint(t);

                  return (
                    <tr
                      key={t.id}
                      onClick={() => selectTask(t.id)}
                      style={{
                        borderBottom: '1px solid var(--border-light)',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-app)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Title & ID */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <CheckSquare size={16} color="var(--primary)" />
                          <div>
                            <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                              {t.title}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-family-mono)' }}>
                              {t.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Project Tag */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '6px', background: 'var(--bg-app)', border: '1px solid var(--border-light)', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          <FolderOpen size={12} color="var(--primary)" />
                          <span>{t.projectName || 'Main Project'}</span>
                        </div>
                      </td>

                      {/* Sprint */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>
                          {sprintName}
                        </span>
                      </td>

                      {/* Type Badge (Bug / Ticket / Task) */}
                      <td style={{ padding: '14px 16px' }}>
                        {type === 'bug' ? (
                          <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px' }}>
                            <Bug size={12} />
                            <span>Bug</span>
                          </span>
                        ) : type === 'ticket' ? (
                          <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px' }}>
                            <Ticket size={12} />
                            <span>Ticket</span>
                          </span>
                        ) : (
                          <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px' }}>
                            <Zap size={12} />
                            <span>Task</span>
                          </span>
                        )}
                      </td>

                      {/* Priority */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '2px 7px',
                            borderRadius: '4px',
                            background: t.priority === 'URGENT' ? '#fee2e2' : t.priority === 'HIGH' ? '#fef3c7' : '#f1f5f9',
                            color: t.priority === 'URGENT' ? '#b91c1c' : t.priority === 'HIGH' ? '#b45309' : '#475569',
                          }}
                        >
                          {t.priority}
                        </span>
                      </td>

                      {/* Assignee */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: 'var(--primary-gradient)',
                              color: '#fff',
                              fontSize: '10px',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {t.assignees?.[0]?.name ? t.assignees[0].name.charAt(0) : 'U'}
                          </div>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                            {t.assignees?.[0]?.name || 'Unassigned'}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }} onClick={(e) => e.stopPropagation()}>
                        <select
                          value={t.status}
                          onChange={(e) => {
                            const newSt = e.target.value as TaskStatus;
                            updateTaskStatus(t.id, newSt);
                            showSnack(isAr ? `تم تحديث الحالة إلى ${newSt}` : `Status updated to ${newSt}`, 'info');
                          }}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-light)',
                            background: t.status === 'DONE' ? '#ecfdf5' : t.status === 'IN_PROGRESS' ? '#eff6ff' : 'var(--bg-app)',
                            color: t.status === 'DONE' ? '#065f46' : t.status === 'IN_PROGRESS' ? '#1e40af' : 'var(--text-main)',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            outline: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="IN_REVIEW">In Review</option>
                          <option value="DONE">Done</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Task Modal */}
      {isNewTaskOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setIsNewTaskOpen(false)}
        >
          <div
            className="card"
            style={{ width: '100%', maxWidth: '500px', padding: '24px', background: 'var(--bg-surface)', borderRadius: '16px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
              {isAr ? 'إنشاء مهمة أو تذكرة جديدة' : 'Create New Task / Ticket'}
            </h3>

            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                  {isAr ? 'عنوان المهمة' : 'Title'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement payment gateway webhook"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                    {isAr ? 'المشروع المستهدف' : 'Project'} *
                  </label>
                  <select
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-app)',
                      color: 'var(--text-main)',
                      fontSize: '12.5px',
                      outline: 'none',
                    }}
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                    {isAr ? 'السبرنت' : 'Sprint'} *
                  </label>
                  <select
                    value={newSprint}
                    onChange={(e) => setNewSprint(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-app)',
                      color: 'var(--text-main)',
                      fontSize: '12.5px',
                      outline: 'none',
                    }}
                  >
                    <option value="Sprint 1">Sprint 1</option>
                    <option value="Sprint 2">Sprint 2</option>
                    <option value="Sprint 3">Sprint 3</option>
                    <option value="Backlog">Backlog</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                    {isAr ? 'النوع' : 'Task Type'} *
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-app)',
                      color: 'var(--text-main)',
                      fontSize: '12.5px',
                      outline: 'none',
                    }}
                  >
                    <option value="ticket">🎫 Feature Ticket</option>
                    <option value="bug">🐞 Bug / Issue</option>
                    <option value="task">⚡ Core Task</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                    {isAr ? 'الأولوية' : 'Priority'} *
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-app)',
                      color: 'var(--text-main)',
                      fontSize: '12.5px',
                      outline: 'none',
                    }}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                  {isAr ? 'الوصف والتفاصيل' : 'Description'}
                </label>
                <textarea
                  rows={2}
                  placeholder="Task details and deliverables..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsNewTaskOpen(false)}
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '8px 20px', fontSize: '13px', fontWeight: 700 }}
                >
                  {isAr ? 'إضافة المهمة' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
