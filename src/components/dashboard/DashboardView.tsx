'use client';

import React, { useState } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  ArrowUpRight,
  Video,
  Sparkles,
  Check,
  TrendingUp,
  Plus,
  Inbox,
  FolderPlus,
  Activity,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    tasks,
    meetings,
    activities,
    organizations,
    activeOrgId,
    setCurrentView,
    selectTask,
    addNewTask,
  } = useWorkspaceStore();
  const { currentUser } = useAuthStore();
  const { language } = useUIStore();
  const isAr = language === 'ar';

  const [taskFilter, setTaskFilter] = useState<'ALL' | 'HIGH' | 'DUE_SOON'>('ALL');
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);

  const currentOrg = organizations.find((o) => o.id === activeOrgId) || organizations[0] || {
    name: 'Workspace',
  };

  const toggleTaskComplete = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    setCompletedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const openTasks = tasks.filter((t) => t.status === 'TODO' || t.status === 'IN_PROGRESS');
  const inReviewTasks = tasks.filter((t) => t.status === 'IN_REVIEW');
  const overdueTasks = tasks.filter((t) => t.priority === 'HIGH' && t.status !== 'DONE');

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'HIGH') return t.priority === 'HIGH';
    if (taskFilter === 'DUE_SOON') return t.dueDate.includes('Oct') || t.dueDate.includes('Nov');
    return true;
  }).slice(0, 5);

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div style={{
      padding: '32px 36px',
      display: 'flex',
      flexDirection: 'column',
      gap: '28px',
      maxWidth: '1440px',
      margin: '0 auto',
      animation: 'fadeIn 0.25s ease-out',
    }}>
      {/* Top Banner / Welcome with Live Context */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '9999px',
            marginBottom: '10px',
          }}>
            <Sparkles size={13} color="#2563eb" />
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#1d4ed8', letterSpacing: '0.02em' }}>
              {currentOrg.name} Workspace Active
            </span>
          </div>

          <h1 style={{
            fontSize: '30px',
            fontWeight: 800,
            letterSpacing: isAr ? '0' : '-0.8px',
            color: 'var(--text-main)',
            lineHeight: 1.2,
            marginBottom: '6px',
          }}>
            {(() => {
              const hour = new Date().getHours();
              const name = currentUser?.name ? currentUser.name.split(' ')[0] : (isAr ? 'الفريق' : 'Team');
              if (isAr) {
                const greeting = hour < 12 ? 'صباح الخير' : 'مساء الخير';
                return `${greeting}، ${name} 👋`;
              }
              const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
              return `${greeting}, ${name} 👋`;
            })()}
          </h1>
          <p style={{ fontSize: '14.5px', color: '#64748b', fontWeight: 500 }}>
            {isAr
              ? `إليك ملخص الأداء اليومي وسرعة إنجاز المهام في مؤسسة ${currentOrg.name}.`
              : `Here is your daily pulse, team progress, and upcoming deliverables in ${currentOrg.name}.`}
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 16px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          fontSize: '13px',
          color: '#475569',
          fontWeight: 600,
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        }}>
          <Calendar size={15} color="#2563eb" />
          <span>{todayDate}</span>
        </div>
      </div>

      {/* Metrics Row (Strictly Real Data, Zero Fallbacks) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '20px',
      }}>
        {/* Card 1: Open Tasks */}
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CheckCircle2 size={24} color="#2563eb" />
            </div>
            <span className="badge badge-primary">
              {openTasks.length > 0 ? `${openTasks.length} active` : '0 active'}
            </span>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
              {openTasks.length}
            </div>
            <div style={{ fontSize: '13.5px', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
              Open Tasks
            </div>
          </div>
        </div>

        {/* Card 2: In Review */}
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Clock size={24} color="#d97706" />
            </div>
            <span className="badge badge-warning">
              Pending QA
            </span>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
              {inReviewTasks.length}
            </div>
            <div style={{ fontSize: '13.5px', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
              In Review
            </div>
          </div>
        </div>

        {/* Card 3: Overdue */}
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <AlertCircle size={24} color="#dc2626" />
            </div>
            <span className="badge badge-danger">
              High Priority
            </span>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
              {overdueTasks.length}
            </div>
            <div style={{ fontSize: '13.5px', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
              Urgent Items
            </div>
          </div>
        </div>

        {/* Card 4: Scheduled Meetings */}
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#f5f3ff',
              border: '1px solid #ddd6fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Video size={24} color="#7c3aed" />
            </div>
            <span className="badge badge-purple">
              {meetings.length > 0 ? `${meetings.length} scheduled` : '0 today'}
            </span>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
              {meetings.length}
            </div>
            <div style={{ fontSize: '13.5px', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
              Scheduled Meetings
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.45fr 1fr',
        gap: '24px',
        alignItems: 'start',
      }}>
        {/* Left Column: My Tasks */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '18px',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>
                Tasks
              </h2>
              <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
                {filteredTasks.length}
              </span>
            </div>

            {/* Filter pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setTaskFilter('ALL')}
                className={`btn btn-sm ${taskFilter === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '12px', padding: '5px 10px' }}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setTaskFilter('HIGH')}
                className={`btn btn-sm ${taskFilter === 'HIGH' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '12px', padding: '5px 10px' }}
              >
                Urgent
              </button>
              <button
                type="button"
                onClick={() => setCurrentView('projects')}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '12px', padding: '5px 10px' }}
              >
                <span>View Board</span>
                <ArrowUpRight size={13} />
              </button>
            </div>
          </div>

          {/* Task List or Clean Zero Empty State */}
          {filteredTasks.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px 24px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px dashed #cbd5e1',
            }}>
              <Inbox size={42} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
              <div style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>
                No tasks in {currentOrg.name} yet
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', maxWidth: '320px', margin: '6px auto 16px auto' }}>
                Kick off your sprint by creating the first actionable task for your team.
              </p>
              <button
                type="button"
                onClick={() => setCurrentView('projects')}
                className="btn btn-primary btn-sm"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                <Plus size={15} />
                <span>Create First Task</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredTasks.map((task) => {
                const isCompleted = completedTaskIds.includes(task.id) || task.status === 'DONE';
                const priorityClass =
                  task.priority === 'HIGH'
                    ? 'badge-danger'
                    : task.priority === 'MEDIUM'
                    ? 'badge-warning'
                    : 'badge-neutral';

                return (
                  <div
                    key={task.id}
                    onClick={() => selectTask(task.id)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      background: isCompleted ? '#f8fafc' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#2563eb';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 2px rgba(15, 23, 42, 0.03)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <button
                        type="button"
                        onClick={(e) => toggleTaskComplete(e, task.id)}
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '6px',
                          border: isCompleted ? '1.5px solid #10b981' : '1.5px solid #cbd5e1',
                          background: isCompleted ? '#10b981' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          padding: 0,
                          transition: 'all 0.15s ease',
                          flexShrink: 0,
                        }}
                      >
                        {isCompleted && <Check size={14} color="#ffffff" strokeWidth={3} />}
                      </button>

                      <div>
                        <div style={{
                          fontWeight: 600,
                          fontSize: '14px',
                          color: isCompleted ? '#94a3b8' : '#0f172a',
                          textDecoration: isCompleted ? 'line-through' : 'none',
                          marginBottom: '4px',
                        }}>
                          {task.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 500 }}>
                            {task.projectName}
                          </span>
                          <span style={{ fontSize: '11px', color: '#cbd5e1' }}>•</span>
                          <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                            Due {task.dueDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className={`badge ${priorityClass}`}>{task.priority}</span>
                      <ArrowUpRight size={15} color="#94a3b8" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Upcoming Meetings + Recent Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Upcoming Meetings Card */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>
                Upcoming Meetings
              </h2>
              <button
                type="button"
                onClick={() => setCurrentView('calendar')}
                className="btn btn-ghost btn-sm"
                style={{ color: '#2563eb', fontWeight: 700 }}
              >
                Calendar
              </button>
            </div>

            {meetings.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '28px 16px',
                background: '#f8fafc',
                borderRadius: '10px',
                border: '1px dashed #cbd5e1',
                fontSize: '13px',
                color: '#64748b',
              }}>
                <Video size={30} color="#94a3b8" style={{ margin: '0 auto 8px auto' }} />
                <div style={{ fontWeight: 700 }}>No meetings scheduled</div>
                <div style={{ fontSize: '11.5px', marginTop: '2px' }}>Your calendar is clear for today.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {meetings.slice(0, 3).map((meeting) => (
                  <div
                    key={meeting.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '4px',
                        height: '36px',
                        borderRadius: '4px',
                        background: meeting.color || '#2563eb',
                      }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>{meeting.title}</div>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>{meeting.date}, {meeting.timeRange}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity Live Feed */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>
                Recent Activity
              </h2>
              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                <span>Live Feed</span>
              </span>
            </div>

            {/* Live Feed: Real Team & Team Members Activity */}
            {activities.length === 0 ? (
              <div
                style={{
                  padding: '32px 16px',
                  textAlign: 'center',
                  background: 'var(--bg-app)',
                  borderRadius: '12px',
                  border: '1px dashed var(--border-light)',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'var(--bg-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 10px auto',
                    color: 'var(--text-muted)',
                  }}
                >
                  <Activity size={18} />
                </div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {isAr ? 'لا توجد أنشطة مسجلة بعد' : 'No recent activity yet'}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                  {isAr
                    ? 'ستظهر هنا تحركات المهام والتحديثات فور قيام أعضاء الفريق بها'
                    : 'Task updates, status changes, and member actions will appear here in real time.'}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div
                      className="avatar"
                      style={{
                        width: '32px',
                        height: '32px',
                        fontSize: '11px',
                        background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                        flexShrink: 0,
                      }}
                    >
                      {activity.userName ? activity.userName.split(' ').map((n) => n[0]).join('').substring(0, 2) : 'U'}
                    </div>
                    <div style={{ flex: 1, fontSize: '13px', lineHeight: 1.45 }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{activity.userName} </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{activity.action} </span>
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>&ldquo;{activity.target}&rdquo;</span>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {activity.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
