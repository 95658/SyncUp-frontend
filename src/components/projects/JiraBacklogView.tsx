'use client';

import React, { useState } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { showSnack } from '@/store/snackbarStore';
import { Sprint, Task, TaskStatus, TaskPriority } from '@/types';
import {
  Plus,
  Play,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Bookmark,
  Bug,
  CheckSquare,
  Zap,
  MoreVertical,
  Calendar,
  Layers,
  ArrowRight,
  Search,
  Filter,
  MoveRight,
  Clock,
  Sparkles,
  Ticket,
  Edit2,
  Trash2,
} from 'lucide-react';

interface JiraBacklogViewProps {
  projectId: string;
}

export const JiraBacklogView: React.FC<JiraBacklogViewProps> = ({ projectId }) => {
  const {
    tasks,
    sprints,
    projects,
    members,
    createSprint,
    startSprint,
    completeSprint,
    updateSprint,
    deleteSprint,
    moveTaskToSprint,
    addNewTask,
    selectTask,
    updateTaskStatus,
    updateTask,
  } = useWorkspaceStore();
  const { currentUser, activeRole } = useAuthStore();
  const { language } = useUIStore();
  const isAr = language === 'ar';

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'story' | 'task' | 'bug'>('ALL');
  const [collapsedSprints, setCollapsedSprints] = useState<Record<string, boolean>>({});

  // Quick Add State
  const [activeSprintQuickAdd, setActiveSprintQuickAdd] = useState<string | null>(null);
  const [quickAddTitle, setQuickAddTitle] = useState('');
  const [quickAddType, setQuickAddType] = useState<'story' | 'task' | 'bug'>('story');
  const [quickAddPoints, setQuickAddPoints] = useState(3);

  // New Sprint Modal
  const [isCreateSprintModalOpen, setIsCreateSprintModalOpen] = useState(false);
  const [sprintNameInput, setSprintNameInput] = useState('');
  const [sprintGoalInput, setSprintGoalInput] = useState('');

  // Start Sprint Modal
  const [startingSprint, setStartingSprint] = useState<Sprint | null>(null);
  const [startDurationWeeks, setStartDurationWeeks] = useState(2);
  const [startGoal, setStartGoal] = useState('');

  // Edit Sprint Modal
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [editSprintName, setEditSprintName] = useState('');
  const [editSprintGoal, setEditSprintGoal] = useState('');
  const [editSprintStartDate, setEditSprintStartDate] = useState('');
  const [editSprintEndDate, setEditSprintEndDate] = useState('');

  const handleOpenEditSprint = (sprint: Sprint) => {
    setEditingSprint(sprint);
    setEditSprintName(sprint.name);
    setEditSprintGoal(sprint.goal || '');
    setEditSprintStartDate(sprint.startDate || '');
    setEditSprintEndDate(sprint.endDate || '');
  };

  const handleConfirmEditSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSprint || !editSprintName.trim()) return;
    await updateSprint(editingSprint.id, {
      name: editSprintName.trim(),
      goal: editSprintGoal.trim(),
      startDate: editSprintStartDate.trim() || undefined,
      endDate: editSprintEndDate.trim() || undefined,
    });
    setEditingSprint(null);
    showSnack(isAr ? 'تم تعديل بيانات السبرنت' : 'Sprint updated successfully', 'success');
  };

  const handleDeleteSprint = async (sprintId: string) => {
    if (
      confirm(
        isAr
          ? 'هل أنت متأكد من حذف هذا السبرنت؟ ستعود المهام إلى الـ Backlog.'
          : 'Are you sure you want to delete this sprint? Unfinished tasks will be moved to Backlog.'
      )
    ) {
      await deleteSprint(sprintId);
      setEditingSprint(null);
      showSnack(isAr ? 'تم حذف السبرنت' : 'Sprint deleted', 'info');
    }
  };

  // Project data
  const currentProject = projects.find((p) => p.id === projectId) || projects[0];
  const projectTasks = tasks.filter((t) => t.projectId === projectId || !t.projectId);
  const projectSprints = sprints.filter((s) => s.projectId === projectId);

  // If no sprints exist yet in this project, create a default Planned Sprint
  const ensureDefaultSprint = () => {
    if (projectSprints.length === 0) {
      createSprint(projectId, `${currentProject?.name || 'Project'} Sprint 1`, 'Core deliverables and foundational release');
    }
  };

  const toggleCollapse = (sprintId: string) => {
    setCollapsedSprints((prev) => ({ ...prev, [sprintId]: !prev[sprintId] }));
  };

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    const defaultName = `Sprint ${projectSprints.length + 1}`;
    await createSprint(projectId, sprintNameInput.trim() || defaultName, sprintGoalInput.trim());
    setSprintNameInput('');
    setSprintGoalInput('');
    setIsCreateSprintModalOpen(false);
    showSnack(isAr ? 'تم إنشاء السبرنت بنجاح' : 'Sprint created successfully!', 'success');
  };

  const handleConfirmStartSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startingSprint) return;
    await startSprint(startingSprint.id, startDurationWeeks, startGoal);
    setStartingSprint(null);
    showSnack(
      isAr ? `تم بدء ${startingSprint.name} بنجاح! تم تنشيط لوحة المهام.` : `${startingSprint.name} started! Board is now active.`,
      'success'
    );
  };

  const handleConfirmCompleteSprint = async (sprint: Sprint) => {
    await completeSprint(sprint.id);
    showSnack(
      isAr ? `تم إتمام ${sprint.name}! تم نقل المهام غير المكتملة إلى الـ Backlog.` : `${sprint.name} completed! Incomplete issues moved to Backlog.`,
      'info'
    );
  };

  const handleQuickAdd = async (sprintId: string | null) => {
    if (!quickAddTitle.trim()) return;

    await addNewTask({
      title: quickAddTitle.trim(),
      description: `Created via Jira Backlog for ${sprintId ? 'Sprint' : 'Backlog'}`,
      status: 'TODO',
      priority: 'MEDIUM',
      projectId,
      projectName: currentProject?.name || 'Main Project',
      tags: [quickAddType, sprintId ? 'sprint' : 'backlog'],
      sprintId,
      storyPoints: quickAddPoints,
      issueType: quickAddType,
      assignees: [{ id: currentUser?.id || 'u-1', name: currentUser?.name || 'Assignee' }],
      dueDate: 'Upcoming',
      subtasks: [],
    });

    setQuickAddTitle('');
    setActiveSprintQuickAdd(null);
    showSnack(isAr ? 'تمت إضافة العنصر' : 'Issue created!', 'success');
  };

  // Filter tasks
  const filterTask = (t: Task) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!t.title.toLowerCase().includes(q) && !t.id.toLowerCase().includes(q)) return false;
    }
    if (typeFilter !== 'ALL') {
      if ((t.issueType || 'task') !== typeFilter) return false;
    }
    return true;
  };

  // Backlog issues: tasks with no sprintId or sprintId === null
  const backlogIssues = projectTasks.filter((t) => !t.sprintId).filter(filterTask);

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'story':
        return (
          <span title="User Story" style={{ display: 'inline-flex' }}>
            <Bookmark size={15} color="#10b981" fill="#10b981" />
          </span>
        );
      case 'bug':
        return (
          <span title="Bug / Issue" style={{ display: 'inline-flex' }}>
            <Bug size={15} color="#ef4444" />
          </span>
        );
      default:
        return (
          <span title="Task" style={{ display: 'inline-flex' }}>
            <CheckSquare size={15} color="#2563eb" />
          </span>
        );
    }
  };

  return (
    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Filter & Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '520px' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', [isAr ? 'right' : 'left']: '12px', top: '10px' }} />
            <input
              type="text"
              placeholder={isAr ? 'بحث في الـ Backlog...' : 'Search backlog issues...'}
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

          {/* Type Filter */}
          <div className="filter-select-pill">
            <Filter size={14} color="var(--text-muted)" className="pill-icon" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              style={{
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-app)',
                color: 'var(--text-main)',
                fontSize: '12.5px',
                outline: 'none',
                fontWeight: 600,
                height: '35px',
              }}
            >
              <option value="ALL">{isAr ? 'جميع الأنواع' : 'All Types'}</option>
              <option value="story">📗 {isAr ? 'قصص المستخدم' : 'User Stories'}</option>
              <option value="task">⚡ {isAr ? 'مهام' : 'Tasks'}</option>
              <option value="bug">🐞 {isAr ? 'أخطاء / Bugs' : 'Bugs'}</option>
            </select>
          </div>
        </div>

        {/* Create Sprint Button */}
        <button
          type="button"
          onClick={() => {
            setSprintNameInput(`Sprint ${projectSprints.length + 1}`);
            setIsCreateSprintModalOpen(true);
          }}
          className="btn btn-primary"
          style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 700, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={15} />
          <span>{isAr ? 'إنشاء سبرنت جديد' : 'Create Sprint'}</span>
        </button>
      </div>

      {/* Sprints Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {projectSprints.length === 0 ? (
          <div
            className="card"
            style={{
              padding: '32px',
              textAlign: 'center',
              background: 'var(--bg-surface)',
              borderRadius: '14px',
              border: '2px dashed var(--border-light)',
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
              <Layers size={24} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
              {isAr ? 'لا توجد سبرنتات مجدولة حتى الآن' : 'No Sprints created yet'}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 16px auto' }}>
              {isAr
                ? 'أنشئ أول سبرنت لتنظيم مهام الفريق وحساب نقاط التقدير وفق منهجية أجايل (Agile/Scrum).'
                : 'Plan your team workload, assign story points, and commit to sprint deliverables.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSprintNameInput('Sprint 1');
                setIsCreateSprintModalOpen(true);
              }}
              className="btn btn-primary"
              style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 700 }}
            >
              <span>{isAr ? 'إنشاء Sprint 1' : 'Create Sprint 1'}</span>
            </button>
          </div>
        ) : (
          projectSprints.map((sprint) => {
            const isCollapsed = collapsedSprints[sprint.id] || false;
            const sprintTasks = projectTasks.filter((t) => t.sprintId === sprint.id).filter(filterTask);
            const totalPoints = sprintTasks.reduce((sum, t) => sum + (t.storyPoints || 1), 0);
            const isCompleted = sprint.status === 'COMPLETED';
            const isActive = sprint.status === 'ACTIVE';

            return (
              <div
                key={sprint.id}
                className="card"
                style={{
                  background: 'var(--bg-surface)',
                  borderRadius: '12px',
                  border: isActive ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                  overflow: 'hidden',
                  boxShadow: isActive ? 'var(--shadow-md)' : 'none',
                }}
              >
                {/* Sprint Card Header */}
                <div
                  style={{
                    padding: '14px 18px',
                    background: isActive ? 'rgba(37, 99, 235, 0.05)' : 'var(--bg-app)',
                    borderBottom: isCollapsed ? 'none' : '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => toggleCollapse(sprint.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '2px' }}
                    >
                      {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                    </button>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>
                          {sprint.name}
                        </span>
                        <span
                          className={`badge ${
                            isActive ? 'badge-primary' : isCompleted ? 'badge-success' : 'badge-purple'
                          }`}
                          style={{ fontSize: '11px', textTransform: 'uppercase' }}
                        >
                          {isActive ? (isAr ? 'نشط الآن' : 'ACTIVE') : isCompleted ? (isAr ? 'مكتمل' : 'COMPLETED') : (isAr ? 'مجدول' : 'PLANNED')}
                        </span>
                        {sprint.startDate && (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            ({sprint.startDate} - {sprint.endDate})
                          </span>
                        )}
                      </div>

                      {sprint.goal && (
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          🎯 {sprint.goal}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Story Points & Count Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                        {sprintTasks.length} {isAr ? 'تذاكر' : 'issues'}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
                        {totalPoints} {isAr ? 'نقاط' : 'pts'}
                      </span>
                    </div>

                    {/* Sprint Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditSprint(sprint)}
                        className="btn btn-secondary"
                        title={isAr ? 'تعديل السبرنت' : 'Edit Sprint'}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 700,
                          borderRadius: '6px',
                          border: '1px solid var(--border-light)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <Edit2 size={13} />
                        <span>{isAr ? 'تعديل' : 'Edit'}</span>
                      </button>

                      {!isCompleted && (
                        <>
                          {isActive ? (
                            <button
                              type="button"
                              onClick={() => handleConfirmCompleteSprint(sprint)}
                              className="btn btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 700, borderRadius: '6px', border: '1px solid var(--border-light)' }}
                            >
                              <CheckCircle2 size={13} color="var(--success)" />
                              <span>{isAr ? 'إتمام السبرنت' : 'Complete Sprint'}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setStartingSprint(sprint);
                                setStartGoal(sprint.goal || '');
                              }}
                              className="btn btn-primary"
                              style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 700, borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                              <Play size={12} fill="currentColor" />
                              <span>{isAr ? 'بدء السبرنت' : 'Start Sprint'}</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sprint Issues List */}
                {!isCollapsed && (
                  <div>
                    {sprintTasks.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                        {isAr ? 'السبرنت فارغ حالياً. اسحب تذاكر من الـ Backlog أو أضف مهمة جديدة أدناه.' : 'Sprint is empty. Plan tasks from Backlog or click + Create Issue below.'}
                      </div>
                    ) : (
                      <div>
                        {sprintTasks.map((task) => (
                          <div
                            key={task.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 18px',
                              borderBottom: '1px solid var(--border-light)',
                              cursor: 'pointer',
                              transition: 'background 0.15s ease',
                            }}
                            onClick={() => selectTask(task.id)}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-app)')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                              {getTypeIcon(task.issueType)}
                              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-family-mono)' }}>
                                {task.id}
                              </span>
                              <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-main)' }}>
                                {task.title}
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={(e) => e.stopPropagation()}>
                              {/* Move to Backlog action */}
                              <button
                                type="button"
                                className="btn-ghost"
                                onClick={() => moveTaskToSprint(task.id, null)}
                                title={isAr ? 'إعادة إلى الـ Backlog' : 'Move to Backlog'}
                                style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--text-muted)', borderRadius: '4px' }}
                              >
                                {isAr ? 'إلى Backlog' : 'To Backlog'}
                              </button>

                              {/* Priority Selector (Requirement: Easily edit priority) */}
                              <select
                                value={task.priority}
                                onChange={(e) => {
                                  updateTask(task.id, { priority: e.target.value as TaskPriority });
                                  showSnack(
                                    isAr ? `تم تعديل الأولوية إلى ${e.target.value}` : `Priority: ${e.target.value}`,
                                    'success'
                                  );
                                }}
                                title={isAr ? 'تعديل الأولوية' : 'Change priority'}
                                style={{
                                  padding: '3px 6px',
                                  fontSize: '11px',
                                  fontWeight: 800,
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
                                <option value="LOW">LOW</option>
                                <option value="MEDIUM">MED</option>
                                <option value="HIGH">HIGH</option>
                                <option value="URGENT">URG</option>
                              </select>

                              {/* Story Points */}
                              <span
                                style={{
                                  fontSize: '11.5px',
                                  fontWeight: 800,
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  background: 'var(--bg-app)',
                                  border: '1px solid var(--border-light)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'var(--text-main)',
                                }}
                              >
                                {task.storyPoints || 3}
                              </span>

                              {/* Status Select */}
                              <select
                                value={task.status}
                                onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--border-light)',
                                  background: task.status === 'DONE' ? '#ecfdf5' : task.status === 'IN_PROGRESS' ? '#eff6ff' : 'var(--bg-app)',
                                  color: task.status === 'DONE' ? '#065f46' : task.status === 'IN_PROGRESS' ? '#1e40af' : 'var(--text-main)',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                  outline: 'none',
                                }}
                              >
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="IN_REVIEW">In Review</option>
                                <option value="DONE">Done</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Inline Quick Add Issue in Sprint */}
                    {activeSprintQuickAdd === sprint.id ? (
                      <div style={{ padding: '10px 18px', background: 'var(--bg-app)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <select
                          value={quickAddType}
                          onChange={(e) => setQuickAddType(e.target.value as any)}
                          style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '12px' }}
                        >
                          <option value="story">📗 Story</option>
                          <option value="task">⚡ Task</option>
                          <option value="bug">🐞 Bug</option>
                        </select>
                        <input
                          type="text"
                          placeholder={isAr ? 'ما الذي يجب إنجازه؟ (عنوان التذكرة)' : 'What needs to be done?'}
                          value={quickAddTitle}
                          onChange={(e) => setQuickAddTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleQuickAdd(sprint.id);
                          }}
                          autoFocus
                          style={{
                            flex: 1,
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-light)',
                            fontSize: '13px',
                            outline: 'none',
                          }}
                        />
                        <select
                          value={quickAddPoints}
                          onChange={(e) => setQuickAddPoints(Number(e.target.value))}
                          style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '12px' }}
                        >
                          <option value={1}>1 pt</option>
                          <option value={2}>2 pts</option>
                          <option value={3}>3 pts</option>
                          <option value={5}>5 pts</option>
                          <option value={8}>8 pts</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleQuickAdd(sprint.id)}
                          className="btn btn-primary"
                          style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 700 }}
                        >
                          {isAr ? 'إضافة' : 'Add'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSprintQuickAdd(null)}
                          className="btn-ghost"
                          style={{ padding: '6px', fontSize: '12px' }}
                        >
                          {isAr ? 'إلغاء' : 'Cancel'}
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => setActiveSprintQuickAdd(sprint.id)}
                        style={{
                          padding: '10px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          background: 'var(--bg-surface)',
                          transition: 'color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                      >
                        <Plus size={15} />
                        <span>{isAr ? 'إضافة تذكرة / قصة مستخدم إلى السبرنت' : 'Create issue in this sprint'}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* ─── Backlog Section (Unplanned Issues) ─────────────────────────── */}
        <div
          className="card"
          style={{
            background: 'var(--bg-surface)',
            borderRadius: '12px',
            border: '1px solid var(--border-light)',
            overflow: 'hidden',
          }}
        >
          {/* Backlog Header */}
          <div
            style={{
              padding: '14px 18px',
              background: 'var(--bg-app)',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>
                {isAr ? 'سجل تراكم المهام (Backlog)' : 'Backlog'}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                {backlogIssues.length} {isAr ? 'تذاكر' : 'issues'}
              </span>
            </div>

            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {isAr ? 'العناصر المتبقية للتخطيط في السبرنتات القادمة' : 'Uncommitted issues for future planning'}
            </span>
          </div>

          {/* Backlog Issues List */}
          <div>
            {backlogIssues.length === 0 ? (
              <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                {isAr ? 'الـ Backlog فارغ! أضف قصص مستخدم أو تذاكر أدناه للبدء في التخطيط.' : 'Backlog is empty. Create issues below to start sprint planning.'}
              </div>
            ) : (
              <div>
                {backlogIssues.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 18px',
                      borderBottom: '1px solid var(--border-light)',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                    onClick={() => selectTask(task.id)}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-app)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      {getTypeIcon(task.issueType)}
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-family-mono)' }}>
                        {task.id}
                      </span>
                      <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-main)' }}>
                        {task.title}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={(e) => e.stopPropagation()}>
                      {/* Move to Sprint Dropdown */}
                      {projectSprints.length > 0 && (
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              moveTaskToSprint(task.id, e.target.value);
                              showSnack(isAr ? 'تم نقل التذكرة إلى السبرنت' : 'Moved to sprint!', 'success');
                            }
                          }}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-light)',
                            background: 'var(--bg-app)',
                            color: 'var(--primary)',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            outline: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="">{isAr ? '← نقل إلى سبرنت...' : 'Move to Sprint...'}</option>
                          {projectSprints.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.status})
                            </option>
                          ))}
                        </select>
                      )}

                      {/* Priority Selector */}
                      <select
                        value={task.priority}
                        onChange={(e) => {
                          updateTask(task.id, { priority: e.target.value as TaskPriority });
                          showSnack(
                            isAr ? `تم تعديل الأولوية إلى ${e.target.value}` : `Priority: ${e.target.value}`,
                            'success'
                          );
                        }}
                        title={isAr ? 'تعديل الأولوية' : 'Change priority'}
                        style={{
                          padding: '3px 6px',
                          fontSize: '11px',
                          fontWeight: 800,
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
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MED</option>
                        <option value="HIGH">HIGH</option>
                        <option value="URGENT">URG</option>
                      </select>

                      {/* Points */}
                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 800,
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: 'var(--bg-app)',
                          border: '1px solid var(--border-light)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-main)',
                        }}
                      >
                        {task.storyPoints || 3}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Add Issue in Backlog */}
            {activeSprintQuickAdd === 'backlog' ? (
              <div style={{ padding: '10px 18px', background: 'var(--bg-app)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <select
                  value={quickAddType}
                  onChange={(e) => setQuickAddType(e.target.value as any)}
                  style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '12px' }}
                >
                  <option value="story">📗 Story</option>
                  <option value="task">⚡ Task</option>
                  <option value="bug">🐞 Bug</option>
                </select>
                <input
                  type="text"
                  placeholder={isAr ? 'أدخل عنوان التذكرة أو قصة المستخدم...' : 'Enter backlog issue summary...'}
                  value={quickAddTitle}
                  onChange={(e) => setQuickAddTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleQuickAdd(null);
                  }}
                  autoFocus
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-light)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                <select
                  value={quickAddPoints}
                  onChange={(e) => setQuickAddPoints(Number(e.target.value))}
                  style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '12px' }}
                >
                  <option value={1}>1 pt</option>
                  <option value={2}>2 pts</option>
                  <option value={3}>3 pts</option>
                  <option value={5}>5 pts</option>
                  <option value={8}>8 pts</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleQuickAdd(null)}
                  className="btn btn-primary"
                  style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 700 }}
                >
                  {isAr ? 'إضافة' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSprintQuickAdd(null)}
                  className="btn-ghost"
                  style={{ padding: '6px', fontSize: '12px' }}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            ) : (
              <div
                onClick={() => setActiveSprintQuickAdd('backlog')}
                style={{
                  padding: '10px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  background: 'var(--bg-surface)',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <Plus size={15} />
                <span>{isAr ? 'إضافة عنصر إلى الـ Backlog' : 'Create issue in Backlog'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Create Sprint */}
      {isCreateSprintModalOpen && (
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
          onClick={() => setIsCreateSprintModalOpen(false)}
        >
          <div
            className="card"
            style={{ width: '100%', maxWidth: '460px', padding: '24px', background: 'var(--bg-surface)', borderRadius: '16px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px' }}>
              {isAr ? 'إنشاء سبرنت جديد (Jira Sprint)' : 'Create New Sprint'}
            </h3>

            <form onSubmit={handleCreateSprint} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                  {isAr ? 'اسم السبرنت' : 'Sprint Name'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sprint 2 - User Onboarding"
                  value={sprintNameInput}
                  onChange={(e) => setSprintNameInput(e.target.value)}
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

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                  {isAr ? 'هدف السبرنت (Sprint Goal)' : 'Sprint Goal'}
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Ship core authentication flows and team onboarding"
                  value={sprintGoalInput}
                  onChange={(e) => setSprintGoalInput(e.target.value)}
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateSprintModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 700 }}>
                  {isAr ? 'تأكيد الإنشاء' : 'Create Sprint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Sprint */}
      {editingSprint && (
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
          onClick={() => setEditingSprint(null)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '24px',
              background: 'var(--bg-surface)',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-modal)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
                {isAr ? `تعديل ${editingSprint.name}` : `Edit ${editingSprint.name}`}
              </h3>
              <button
                type="button"
                onClick={() => setEditingSprint(null)}
                className="btn-ghost"
                style={{ padding: '6px', cursor: 'pointer', borderRadius: '6px' }}
              >
                <ChevronDown size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmEditSprint} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                  {isAr ? 'اسم السبرنت' : 'Sprint Name'} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editSprintName}
                  onChange={(e) => setEditSprintName(e.target.value)}
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

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                  {isAr ? 'هدف السبرنت (Sprint Goal)' : 'Sprint Goal'}
                </label>
                <textarea
                  rows={2}
                  value={editSprintGoal}
                  onChange={(e) => setEditSprintGoal(e.target.value)}
                  placeholder="e.g. Deliver core auth, notifications, and navigation"
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-muted)' }}>
                    {isAr ? 'تاريخ البدء' : 'Start Date'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Nov 4"
                    value={editSprintStartDate}
                    onChange={(e) => setEditSprintStartDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-app)',
                      color: 'var(--text-main)',
                      fontSize: '12.5px',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-muted)' }}>
                    {isAr ? 'تاريخ الانتهاء' : 'End Date'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Nov 18"
                    value={editSprintEndDate}
                    onChange={(e) => setEditSprintEndDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-app)',
                      color: 'var(--text-main)',
                      fontSize: '12.5px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                <button
                  type="button"
                  onClick={() => handleDeleteSprint(editingSprint.id)}
                  className="btn-ghost"
                  style={{
                    padding: '8px 12px',
                    fontSize: '12.5px',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: '8px',
                  }}
                >
                  <Trash2 size={14} />
                  <span>{isAr ? 'حذف السبرنت' : 'Delete Sprint'}</span>
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setEditingSprint(null)}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 700 }}
                  >
                    {isAr ? 'حفظ التعديلات' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Start Sprint */}
      {startingSprint && (
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
          onClick={() => setStartingSprint(null)}
        >
          <div
            className="card"
            style={{ width: '100%', maxWidth: '480px', padding: '24px', background: 'var(--bg-surface)', borderRadius: '16px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px' }}>
              {isAr ? `بدء السبرنت: ${startingSprint.name}` : `Start ${startingSprint.name}`}
            </h3>

            <form onSubmit={handleConfirmStartSprint} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                  {isAr ? 'مدة السبرنت' : 'Duration'}
                </label>
                <select
                  value={startDurationWeeks}
                  onChange={(e) => setStartDurationWeeks(Number(e.target.value))}
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
                >
                  <option value={1}>{isAr ? 'أسبوع واحد (1 Week)' : '1 Week'}</option>
                  <option value={2}>{isAr ? 'أسبوعان (2 Weeks - Recommended)' : '2 Weeks (Recommended)'}</option>
                  <option value={3}>{isAr ? '3 أسابيع (3 Weeks)' : '3 Weeks'}</option>
                  <option value={4}>{isAr ? '4 أسابيع (4 Weeks)' : '4 Weeks'}</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                  {isAr ? 'هدف السبرنت (Sprint Goal)' : 'Sprint Goal'}
                </label>
                <textarea
                  rows={2}
                  placeholder="Define what the team will deliver in this sprint"
                  value={startGoal}
                  onChange={(e) => setStartGoal(e.target.value)}
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setStartingSprint(null)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '13px', fontWeight: 700 }}>
                  {isAr ? 'تأكيد وبدء السبرنت' : 'Start Sprint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
