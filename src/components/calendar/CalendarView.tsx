'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { showSnack } from '@/store/snackbarStore';
import { calendarApi } from '@/lib/api';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Video,
  Clock,
  Users,
  ExternalLink,
  CalendarPlus,
  X,
  Lock,
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { meetings, members, organizations, activeOrgId } = useWorkspaceStore();
  const { currentUser, activeRole } = useAuthStore();
  const { language } = useUIStore();
  const isAr = language === 'ar';

  const isPlatformOwner = currentUser?.isPlatformOwner || activeRole === 'PLATFORM_OWNER';
  const isOrgOwner = activeRole === 'ORG_ADMIN' || isPlatformOwner;

  const [calendarViewMode, setCalendarViewMode] = useState<'month' | 'week'>('month');
  const [selectedDay, setSelectedDay] = useState(20);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(9); // October (0-indexed: 9)
  const [isNewMeetingModalOpen, setIsNewMeetingModalOpen] = useState(false);

  // New Meeting Form
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDesc, setMeetingDesc] = useState('');
  const [meetingDate, setMeetingDate] = useState('2026-10-28');
  const [meetingStartTime, setMeetingStartTime] = useState('10:00');
  const [meetingEndTime, setMeetingEndTime] = useState('11:00');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  // Members for meeting invites
  const availableMembers = members;

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // 31 days ribbon
  const allDays = Array.from({ length: 31 }, (_, i) => {
    const num = i + 1;
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      num,
      name: dayNames[(num + 2) % 7],
      isToday: num === 20 && selectedMonthIndex === 9,
    };
  });

  const visibleDays = calendarViewMode === 'week' ? allDays.slice(14, 21) : allDays;

  // Load live meetings from backend
  useEffect(() => {
    if (!activeOrgId) return;
    calendarApi.getMeetings(activeOrgId).then((liveMeetings) => {
      if (Array.isArray(liveMeetings) && liveMeetings.length > 0) {
        const formatted = liveMeetings.map((m: any) => ({
          id: m.id,
          title: m.title,
          description: m.description || '',
          date: new Date(m.startTime).toISOString().split('T')[0],
          timeRange: `${new Date(m.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(m.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          participants: (m.participants || []).map((p: any) => ({
            id: p.userId,
            name: p.user?.fullName || 'Member',
            avatarUrl: p.user?.avatarUrl,
          })),
          color: '#2563eb',
          externalLink: m.meetingUrl || 'https://meet.google.com/new',
        }));
        useWorkspaceStore.setState({ meetings: formatted });
      }
    }).catch(() => null);
  }, [activeOrgId]);

  // Requirement 33: Create meeting and appear on calendar
  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOrgOwner) {
      showSnack(
        isAr ? 'غير مصرح: يقتصر إنشاء وجدولة الاجتماعات على مالك المؤسسة' : 'Permission denied: Only Organization Owner can schedule meetings.',
        'error'
      );
      return;
    }

    if (!meetingTitle.trim() || !activeOrgId) return;

    const startIso = new Date(`${meetingDate}T${meetingStartTime}:00Z`).toISOString();
    const endIso = new Date(`${meetingDate}T${meetingEndTime}:00Z`).toISOString();

    let createdId = `meet-${Date.now()}`;
    try {
      const res = await calendarApi.createMeeting(activeOrgId, {
        title: meetingTitle.trim(),
        description: meetingDesc.trim(),
        startTime: startIso,
        endTime: endIso,
        meetingUrl: 'https://meet.google.com/new',
      });
      if (res?.id) createdId = res.id;
    } catch (err: any) {
      console.warn('Backend meeting save fallback:', err);
    }

    const timeRangeFormatted = `${meetingStartTime} - ${meetingEndTime}`;

    const newMeeting = {
      id: createdId,
      title: meetingTitle.trim(),
      description: meetingDesc.trim(),
      date: meetingDate,
      timeRange: timeRangeFormatted,
      participants: selectedParticipants.map((id) => {
        const m = availableMembers.find((mem) => mem.id === id);
        return {
          id,
          name: m?.user?.name || (m?.user as any)?.fullName || 'Member',
          avatarUrl: (m?.user as any)?.avatarUrl,
        };
      }),
      color: '#2563eb',
      externalLink: 'https://meet.google.com/new',
    };

    useWorkspaceStore.setState((state) => ({
      meetings: [newMeeting, ...state.meetings],
    }));

    setMeetingTitle('');
    setMeetingDesc('');
    setSelectedParticipants([]);
    setIsNewMeetingModalOpen(false);
    showSnack(isAr ? 'تمت جدولة الاجتماع بنجاح' : 'Meeting scheduled and added to calendar!', 'success');
  };

  // Requirement 33: Google Calendar Integration URL generator
  const getGoogleCalendarUrl = (meeting: any) => {
    const title = encodeURIComponent(meeting.title);
    const details = encodeURIComponent(`${meeting.description || ''}\nScheduled via SyncUp Workspace`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=SyncUp+Online+Meeting`;
  };

  return (
    <div
      style={{
        padding: '28px 32px',
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarIcon size={24} color="var(--primary)" />
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
              {isAr ? 'التقويم وجدولة الاجتماعات' : 'Calendar & Meetings'}
            </h1>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {isAr
              ? 'متابعة مواعيد السبرنتات، الميتنج، ومزامنة الاجتماعات مع تقويم جوجل.'
              : 'Schedule and coordinate team standups, sprint reviews, and deadlines with Google Calendar integration.'}
          </p>
        </div>

        {isOrgOwner ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsNewMeetingModalOpen(true)}
            style={{ padding: '9px 18px', fontSize: '13.5px' }}
          >
            <Plus size={16} />
            <span>{isAr ? 'جدولة اجتماع جديد' : 'New Meeting'}</span>
          </button>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-light)',
              fontSize: '12px',
              color: 'var(--text-muted)',
              fontWeight: 600,
            }}
          >
            <Lock size={13} />
            <span>{isAr ? 'الجدولة لمالك المؤسسة فقط' : 'Scheduling restricted to Org Owner'}</span>
          </div>
        )}
      </div>

      {/* Calendar Controls (Requirement 32: Switch months/weeks, scroll days) */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
            {months[selectedMonthIndex]} 2026
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setSelectedMonthIndex((prev) => (prev > 0 ? prev - 1 : 11))}
              style={{ padding: '6px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setSelectedMonthIndex((prev) => (prev < 11 ? prev + 1 : 0))}
              style={{ padding: '6px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Month / Week Switcher (Requirement 32) */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setCalendarViewMode('week')}
            className={calendarViewMode === 'week' ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '12.5px' }}
          >
            {isAr ? 'أسبوع' : 'Week'}
          </button>
          <button
            type="button"
            onClick={() => setCalendarViewMode('month')}
            className={calendarViewMode === 'month' ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '12.5px' }}
          >
            {isAr ? 'شهر' : 'Month'}
          </button>
        </div>
      </div>

      {/* Scrollable Days Ribbon (Requirement 32) */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '8px',
        }}
      >
        {visibleDays.map((d) => {
          const isSelected = selectedDay === d.num;
          return (
            <div
              key={d.num}
              onClick={() => setSelectedDay(d.num)}
              className="card"
              style={{
                minWidth: '68px',
                padding: '12px 8px',
                textAlign: 'center',
                cursor: 'pointer',
                background: isSelected ? 'var(--primary)' : 'var(--bg-surface)',
                color: isSelected ? '#ffffff' : 'var(--text-main)',
                border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-light)',
                transition: 'all var(--transition-fast)',
                flexShrink: 0,
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 600, opacity: isSelected ? 0.9 : 0.6 }}>
                {d.name}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '4px' }}>{d.num}</div>
              {d.isToday && !isSelected && (
                <div
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    margin: '4px auto 0 auto',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Meetings List */}
      <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
          {isAr
            ? `الاجتماعات المجدولة ليوم ${selectedDay} ${months[selectedMonthIndex]} 2026`
            : `Scheduled Meetings for ${months[selectedMonthIndex]} ${selectedDay}, 2026`}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {meetings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
              No meetings scheduled for this date.
            </div>
          ) : (
            meetings.map((m) => (
              <div
                key={m.id}
                style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-app)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '5px',
                      height: '46px',
                      borderRadius: '3px',
                      background: m.color || 'var(--primary)',
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-main)' }}>{m.title}</div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '12.5px',
                        color: 'var(--text-muted)',
                        marginTop: '4px',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} />
                        {m.timeRange}
                      </span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={13} />
                        {m.participants.length} {isAr ? 'مشاركين' : 'participants'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Requirement 33: Google Calendar Integration */}
                  <a
                    href={getGoogleCalendarUrl(m)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ padding: '7px 14px', fontSize: '12.5px' }}
                    title="Export event to Google Calendar"
                  >
                    <CalendarPlus size={14} color="var(--primary)" />
                    <span>{isAr ? 'تقويم جوجل' : 'Google Calendar'}</span>
                  </a>

                  {m.externalLink && (
                    <a
                      href={m.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ padding: '7px 14px', fontSize: '12.5px' }}
                    >
                      <Video size={14} />
                      <span>{isAr ? 'انضمام' : 'Join Call'}</span>
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Meeting Modal (Requirement 33) */}
      {isNewMeetingModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9995,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            animation: 'fadeIn 0.15s ease-out',
          }}
          onClick={() => setIsNewMeetingModalOpen(false)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '480px',
              padding: '26px',
              background: 'var(--bg-surface)',
              borderRadius: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
              {isAr ? 'جدولة اجتماع ودعوة الأعضاء' : 'Schedule Meeting & Invite Team'}
            </h3>

            <form onSubmit={handleCreateMeeting} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                  {isAr ? 'عنوان الاجتماع' : 'Meeting Title'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sprint 1 Review & Estimation"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
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
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                  {isAr ? 'الوصف ومحاور الاجتماع' : 'Description & Agenda'}
                </label>
                <textarea
                  rows={2}
                  placeholder="Meeting agenda and topics..."
                  value={meetingDesc}
                  onChange={(e) => setMeetingDesc(e.target.value)}
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

              {/* Requirement 9: Choose Date and Time */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                  {isAr ? 'تاريخ الاجتماع' : 'Meeting Date'} *
                </label>
                <input
                  type="date"
                  required
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
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
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                    {isAr ? 'وقت البدء' : 'Start Time'} *
                  </label>
                  <input
                    type="time"
                    required
                    value={meetingStartTime}
                    onChange={(e) => setMeetingStartTime(e.target.value)}
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
                    {isAr ? 'وقت الانتهاء' : 'End Time'} *
                  </label>
                  <input
                    type="time"
                    required
                    value={meetingEndTime}
                    onChange={(e) => setMeetingEndTime(e.target.value)}
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
              </div>

              {/* Requirement 9: Select team members checklist */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                  {isAr ? 'دعوة أعضاء الفريق للاجتماع' : 'Invite Team Members'} ({selectedParticipants.length} selected)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto', padding: '8px', background: 'var(--bg-app)', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                  {availableMembers.map((m) => {
                    const isChecked = selectedParticipants.includes(m.id);
                    return (
                      <label
                        key={m.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          background: isChecked ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedParticipants([...selectedParticipants, m.id]);
                            } else {
                              setSelectedParticipants(selectedParticipants.filter((id) => id !== m.id));
                            }
                          }}
                        />
                        <div
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            background: 'var(--primary-gradient)',
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {m.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                            {m.user?.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {m.user?.email} • {m.role}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsNewMeetingModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                  {isAr ? 'جدولة الاجتماع' : 'Schedule Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
