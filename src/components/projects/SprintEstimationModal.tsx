'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { showSnack } from '@/store/snackbarStore';
import { useAuthStore } from '@/store/authStore';
import {
  Sparkles,
  Trophy,
  Users,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  RotateCcw,
  ArrowRight,
  X,
  Play,
} from 'lucide-react';

const FIBONACCI_CARDS = [1, 2, 3, 5, 8, 13, 21];

export const SprintEstimationModal: React.FC = () => {
  const { isEstimationGameOpen, setEstimationGameOpen, language } = useUIStore();
  const { projects, selectedProjectId, meetings } = useWorkspaceStore();
  const { currentUser } = useAuthStore();
  const isAr = language === 'ar';

  const [sprintTitle, setSprintTitle] = useState('Sprint 1: Core Engine & Auth Security');
  const [sprintDesc, setSprintDesc] = useState('Complete role-based access, API security headers, and PostgreSQL tuning.');
  const [selectedCard, setSelectedCard] = useState<number | null>(5);
  const [isRevealed, setIsRevealed] = useState(false);
  const [calculatedDeadline, setCalculatedDeadline] = useState<string | null>(null);

  if (!isEstimationGameOpen) return null;

  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0] || {
    name: 'Main Workspace Project',
  };

  const teamVotes = [
    { name: currentUser?.name || 'You (Owner)', vote: selectedCard, role: 'Owner' },
    { name: 'Ziad Ghabour', vote: isRevealed ? (selectedCard ? selectedCard : 5) : '?', role: 'Admin' },
    { name: 'Sarah Lin', vote: isRevealed ? 8 : '?', role: 'QA Lead' },
    { name: 'Omar Khaled', vote: isRevealed ? 5 : '?', role: 'Frontend Lead' },
  ];

  const handleReveal = () => {
    setIsRevealed(true);
    // Average points:
    const avgPoints = selectedCard ? Math.round((selectedCard + 5 + 8 + 5) / 4) : 6;
    // Calculate estimated working days (e.g. 1 point = ~1.5 working days)
    const workingDays = Math.max(3, Math.round(avgPoints * 1.8));

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + workingDays);
    const formatted = deadline.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    setCalculatedDeadline(formatted);
  };

  const handleScheduleToCalendar = () => {
    if (!calculatedDeadline) return;

    // Add meeting/milestone to workspace meetings store
    const newMeeting = {
      id: `meet-sprint-${Date.now()}`,
      title: `🏁 ${sprintTitle} Deadline`,
      date: calculatedDeadline,
      timeRange: '05:00 PM - 06:00 PM',
      participants: [
        { id: '1', name: currentUser?.name || 'Owner' },
        { id: '2', name: 'Ziad Ghabour' },
        { id: '3', name: 'Sarah Lin' },
      ],
      color: '#10b981',
    };

    useWorkspaceStore.setState((state) => ({
      meetings: [newMeeting, ...state.meetings],
    }));

    showSnack(
      isAr
        ? `تمت جدولة موعد انتهاء السبرنت بنجاح في تقويم المشروع: ${calculatedDeadline}`
        : `Sprint deadline calculated & scheduled to project calendar: ${calculatedDeadline}!`,
      'success'
    );

    setEstimationGameOpen(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(5px)',
        zIndex: 9996,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={() => setEstimationGameOpen(false)}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '640px',
          background: 'var(--bg-surface)',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-light)',
          animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
              }}
            >
              <Trophy size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
                {isAr ? 'لعبة تخمين السبرنت (Planning Poker)' : 'Sprint Estimation Game'}
              </h2>
              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                {currentProject.name}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn-ghost"
            style={{ padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
            onClick={() => setEstimationGameOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Sprint Title & Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
              {isAr ? 'عنوان السبرنت' : 'Sprint Title'}
            </label>
            <input
              type="text"
              value={sprintTitle}
              onChange={(e) => setSprintTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-app)',
                fontSize: '13px',
                color: 'var(--text-main)',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
              {isAr ? 'وصف السبرنت والمخرجات' : 'Sprint Description & Scope'}
            </label>
            <textarea
              rows={2}
              value={sprintDesc}
              onChange={(e) => setSprintDesc(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-app)',
                fontSize: '13px',
                color: 'var(--text-main)',
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>
        </div>

        {/* Voting Cards (Fibonacci) */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>
            {isAr ? 'اختر بطاقتك التقديرية (نقاط القصة):' : 'Select your estimate card (Story Points):'}
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {FIBONACCI_CARDS.map((num) => {
              const isSelected = selectedCard === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => setSelectedCard(num)}
                  style={{
                    width: '56px',
                    height: '80px',
                    borderRadius: '12px',
                    background: isSelected ? 'var(--primary-gradient)' : 'var(--bg-surface)',
                    color: isSelected ? '#ffffff' : 'var(--text-main)',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-strong)',
                    fontSize: '22px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 6px 16px rgba(37, 99, 235, 0.35)' : 'var(--shadow-xs)',
                    transform: isSelected ? 'translateY(-6px) scale(1.05)' : 'none',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Team Table */}
        <div
          style={{
            background: 'var(--bg-app)',
            borderRadius: '12px',
            padding: '14px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              <Users size={14} />
              <span>{isAr ? 'أصوات أعضاء الفريق المشاركين' : 'Participating Team Members'}</span>
            </div>
            {!isRevealed && (
              <span className="badge badge-warning" style={{ fontSize: '10.5px' }}>
                {isAr ? 'جارِ التصويت...' : 'Voting in progress...'}
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
            {teamVotes.map((member, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-surface)',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {member.name}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{member.role}</div>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 900,
                    color: isRevealed ? 'var(--primary)' : 'var(--text-muted)',
                    marginTop: '4px',
                  }}
                >
                  {member.vote}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calculation Result */}
        {calculatedDeadline && (
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              animation: 'scaleIn 0.2s ease-out',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '14px' }}>
                <CheckCircle2 size={18} color="#10b981" />
                <span>{isAr ? 'الموعد النهائي المحسوب للسبرنت:' : 'Calculated Sprint Deadline:'}</span>
              </div>
              <div style={{ fontSize: '13px', marginTop: '2px', fontWeight: 700 }}>
                📅 {calculatedDeadline}
              </div>
            </div>

            <button
              type="button"
              className="btn"
              onClick={handleScheduleToCalendar}
              style={{
                background: '#10b981',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                fontSize: '12.5px',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
              }}
            >
              <CalendarIcon size={14} />
              <span>{isAr ? 'تثبيت بالتقويم' : 'Add to Calendar'}</span>
            </button>
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setEstimationGameOpen(false)}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            {isAr ? 'إلغاء' : 'Close'}
          </button>

          {!isRevealed ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleReveal}
              style={{ padding: '8px 20px', fontSize: '13px' }}
            >
              <Play size={15} />
              <span>{isAr ? 'كشف الأصوات وحساب الموعد' : 'Reveal & Calculate Deadline'}</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setIsRevealed(false);
                setCalculatedDeadline(null);
              }}
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              <RotateCcw size={15} />
              <span>{isAr ? 'إعادة التصويت' : 'Reset Round'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
