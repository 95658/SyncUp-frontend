'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { showSnack } from '@/store/snackbarStore';
import { projectsApi, organizationsApi } from '@/lib/api';
import { OrganizationMember, Team } from '@/types';
import {
  UserPlus,
  Search,
  Mail,
  Shield,
  MoreVertical,
  CheckCircle2,
  Clock,
  Trash2,
  X,
  Users,
  Award,
  TrendingUp,
  UserCheck,
  UserX,
  Edit2,
  Lock,
  FolderPlus,
  Plus,
  Briefcase,
  Layers,
  Check,
  Crown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const TEAM_PRESET_COLORS = [
  '#2563eb', // Blue
  '#10b981', // Emerald
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#ec4899', // Pink
];

export const MembersView: React.FC = () => {
  const {
    members,
    organizations,
    activeOrgId,
    projects,
    teams,
    isInviteMemberModalOpen,
    setInviteMemberModalOpen,
    addNewMember,
    removeMember,
    toggleMemberStatus,
    createTeam,
    updateTeam,
    deleteTeam,
    assignMemberToTeam,
    assignMemberToProjects,
    updateMemberDetails,
  } = useWorkspaceStore();
  const { currentUser, activeRole } = useAuthStore();
  const { language } = useUIStore();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'members' | 'quality' | 'teams' | 'invitations'>('members');
  const [search, setSearch] = useState('');

  // ─── Team Modal State (Create / Edit Team) ──────────────────────────────────
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamDesc, setTeamDesc] = useState('');
  const [teamColor, setTeamColor] = useState('#2563eb');
  const [teamLeadId, setTeamLeadId] = useState('');
  const [teamProjectIds, setTeamProjectIds] = useState<string[]>([]);

  // ─── Assign Member to Team & Project Modal State ────────────────────────────
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<OrganizationMember | null>(null);
  const [assignedTeam, setAssignedTeam] = useState('');
  const [assignedProjectIds, setAssignedProjectIds] = useState<string[]>([]);

  // ─── Edit Member Role / Title Modal State ──────────────────────────────────
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<OrganizationMember | null>(null);
  const [editRole, setEditRole] = useState<'ADMIN' | 'MEMBER' | 'TEAM_LEADER' | 'QA' | 'PM'>('MEMBER');
  const [editTitle, setEditTitle] = useState('');

  // ─── Invite Member Modal State ──────────────────────────────────────────────
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteTitle, setInviteTitle] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER' | 'TEAM_LEADER' | 'QA' | 'PM'>('MEMBER');
  const [inviteTeam, setInviteTeam] = useState('');
  const [inviteProjectIds, setInviteProjectIds] = useState<string[]>([]);

  const [pendingInvites, setPendingInvites] = useState<{
    id: string;
    name: string;
    email: string;
    title: string;
    role: string;
    team: string;
    projectType: string;
    date: string;
  }[]>([]);

  // Fetch real pending invitations from backend (FR-INV-005)
  useEffect(() => {
    if (!activeOrgId) return;
    organizationsApi
      .getInvitations(activeOrgId)
      .then((invites) => {
        if (Array.isArray(invites)) {
          setPendingInvites(
            invites.map((inv: any) => ({
              id: inv.id,
              name: inv.email.split('@')[0],
              email: inv.email,
              title: 'Invited Member',
              role: inv.role,
              team: 'Engineering',
              projectType: 'General',
              date: new Date(inv.createdAt).toLocaleDateString(),
            }))
          );
        }
      })
      .catch(() => null);
  }, [activeOrgId]);

  const currentOrg = organizations.find((o) => o.id === activeOrgId) || organizations[0] || {
    name: 'Workspace',
  };

  const isPlatformOwner = currentUser?.isPlatformOwner || activeRole === 'PLATFORM_OWNER';
  const isOrgOwner = activeRole === 'ORG_ADMIN' || isPlatformOwner;

  const filteredMembers = members.filter(
    (m) =>
      (m.user?.name || (m.user as any)?.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.user?.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.team || '').toLowerCase().includes(search.toLowerCase())
  );

  // Helper to open Team Create/Edit Modal
  const openCreateTeamModal = () => {
    setEditingTeam(null);
    setTeamName('');
    setTeamDesc('');
    setTeamColor('#2563eb');
    setTeamLeadId('');
    setTeamProjectIds([]);
    setIsTeamModalOpen(true);
  };

  const openEditTeamModal = (team: Team) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setTeamDesc(team.description || '');
    setTeamColor(team.color || '#2563eb');
    setTeamLeadId(team.leadId || '');
    setTeamProjectIds(team.projectIds || []);
    setIsTeamModalOpen(true);
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    try {
      if (editingTeam) {
        await updateTeam(editingTeam.id, {
          name: teamName.trim(),
          description: teamDesc.trim(),
          color: teamColor,
          leadId: teamLeadId || undefined,
          projectIds: teamProjectIds,
        });
        showSnack(isAr ? 'تم تحديث الفريق بنجاح' : `Team "${teamName}" updated successfully!`, 'success');
      } else {
        await createTeam({
          name: teamName.trim(),
          description: teamDesc.trim(),
          color: teamColor,
          leadId: teamLeadId || undefined,
          projectIds: teamProjectIds,
        });
        showSnack(isAr ? 'تم إنشاء الفريق بنجاح' : `Team "${teamName}" created successfully!`, 'success');
      }
      setIsTeamModalOpen(false);
    } catch (err: any) {
      showSnack(err.message || 'Failed to save team', 'error');
    }
  };

  const handleDeleteTeam = async (team: Team) => {
    if (confirm(isAr ? `هل أنت متأكد من حذف فريق "${team.name}"؟` : `Are you sure you want to delete team "${team.name}"?`)) {
      await deleteTeam(team.id);
      showSnack(isAr ? 'تم حذف الفريق بنجاح' : `Team "${team.name}" deleted.`, 'info');
    }
  };

  // Open Assignment modal for a member
  const openAssignModal = (member: OrganizationMember) => {
    setSelectedMember(member);
    setAssignedTeam(member.team || '');
    
    // Member's assigned project IDs: combine assignedProjectIds + any project where user is listed
    const userMemberId = member.user?.id || member.userId;
    const existingProjects = projects
      .filter((p) => member.assignedProjectIds?.includes(p.id) || p.teamMembers?.some((tm) => tm.id === userMemberId))
      .map((p) => p.id);

    setAssignedProjectIds(Array.from(new Set(existingProjects)));
    setIsAssignModalOpen(true);
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    try {
      // 1. Assign Team
      await assignMemberToTeam(selectedMember.id, assignedTeam);

      // 2. Assign Projects
      await assignMemberToProjects(selectedMember.id, assignedProjectIds);

      // 3. Attempt sync with backend API for added projects
      if (activeOrgId) {
        for (const projId of assignedProjectIds) {
          projectsApi.addProjectMember(activeOrgId, projId, selectedMember.id).catch(() => null);
        }
      }

      const memberName = selectedMember.user?.name || 'Member';
      showSnack(
        isAr
          ? `تم تحديث تعيين ${memberName} للفريق والمشاريع بنجاح`
          : `Updated team and project assignments for ${memberName}!`,
        'success'
      );
      setIsAssignModalOpen(false);
      setSelectedMember(null);
    } catch (err: any) {
      showSnack(err.message || 'Failed to update assignments', 'error');
    }
  };

  // Open Edit Role / Title modal
  const openEditMemberModal = (member: OrganizationMember) => {
    setEditingMember(member);
    setEditRole((member.role as any) || 'MEMBER');
    setEditTitle((member.user as any)?.jobTitle || '');
    setIsEditMemberModalOpen(true);
  };

  const handleSaveMemberDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    try {
      await updateMemberDetails(editingMember.id, {
        role: editRole,
        jobTitle: editTitle.trim(),
      });
      showSnack(isAr ? 'تم تحديث بيانات العضو بنجاح' : 'Member details updated successfully!', 'success');
      setIsEditMemberModalOpen(false);
      setEditingMember(null);
    } catch (err: any) {
      showSnack(err.message || 'Failed to update member', 'error');
    }
  };

  // Suspend / Activate Member
  const handleToggleSuspendMember = async (member: OrganizationMember) => {
    if (!activeOrgId) return;
    const nextStatus = member.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await organizationsApi.updateMemberStatus(activeOrgId, member.id, nextStatus);
      await toggleMemberStatus(member.id);
      showSnack(
        isAr
          ? `تم تغيير حالة العضو إلى: ${nextStatus}`
          : `Member ${member.user?.name || (member.user as any)?.fullName} status changed to ${nextStatus}`,
        'info'
      );
    } catch (err: any) {
      showSnack(err.message || 'Failed to update member status', 'error');
    }
  };

  // Remove Member
  const handleRemoveMember = async (memberId: string) => {
    if (!activeOrgId) return;
    if (confirm(isAr ? 'هل أنت متأكد من إزالة هذا العضو من المؤسسة؟' : 'Are you sure you want to remove this member from the organization?')) {
      try {
        await organizationsApi.removeMember(activeOrgId, memberId);
        await removeMember(memberId);
        showSnack(isAr ? 'تمت إزالة العضو من المؤسسة بنجاح' : 'Member removed from organization', 'info');
      } catch (err: any) {
        showSnack(err.message || 'Failed to remove member', 'error');
      }
    }
  };

  // Invite Member with Team & Projects
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !activeOrgId) return;

    try {
      const inviteRes = await organizationsApi.inviteMember(activeOrgId, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      const chosenTeam = inviteTeam || (teams[0]?.name || 'Core Engineering');

      // Also create local member record so they are immediately visible in the UI
      await addNewMember({
        userId: `user-${Date.now()}`,
        role: inviteRole,
        team: chosenTeam,
        assignedProjectIds: inviteProjectIds,
        user: {
          id: `user-${Date.now()}`,
          name: inviteName.trim() || inviteEmail.split('@')[0],
          fullName: inviteName.trim() || inviteEmail.split('@')[0],
          email: inviteEmail.trim(),
          jobTitle: inviteTitle.trim() || 'Software Engineer',
        },
      });

      const newInvite = {
        id: inviteRes?.id || `inv-${Date.now()}`,
        name: inviteName.trim() || inviteEmail.split('@')[0],
        email: inviteEmail.trim(),
        title: inviteTitle.trim() || 'Software Engineer',
        role: inviteRole,
        team: chosenTeam,
        projectType: 'Software',
        date: 'Today',
      };

      setPendingInvites((prev) => [newInvite, ...prev]);
      setInviteName('');
      setInviteEmail('');
      setInviteTitle('');
      setInviteTeam('');
      setInviteProjectIds([]);
      setInviteMemberModalOpen(false);
      showSnack(
        isAr ? `تمت إضافة ودعوة ${inviteEmail} بنجاح!` : `Invitation sent to ${inviteEmail} and added to workspace!`,
        'success'
      );
    } catch (err: any) {
      showSnack(err.message || 'Failed to send invitation', 'error');
    }
  };

  return (
    <div
      style={{
        padding: '32px 36px',
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
              {currentOrg.name} {isAr ? 'الأعضاء والفرق' : 'Members & Teams'}
            </h1>
            <span
              style={{
                fontSize: '11.5px',
                padding: '3px 8px',
                borderRadius: '6px',
                fontWeight: 700,
                background: 'rgba(37, 99, 235, 0.12)',
                color: 'var(--primary)',
              }}
            >
              {members.length} {isAr ? 'عضو' : 'Members'} • {teams.length} {isAr ? 'فرق' : 'Teams'}
            </span>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {isAr
              ? 'إنشاء الفرق وتعيين الموظفين إليها وربط كل موظف بالمشاريع المحددة لإدارة سلسة للصلاحيات.'
              : 'Create teams, organize team members, and assign every employee to specific teams and projects.'}
          </p>
        </div>

        {isOrgOwner ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={openCreateTeamModal}
              style={{ padding: '9px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              <Users size={16} />
              <span>{isAr ? '+ إنشاء فريق جديد' : '+ Create New Team'}</span>
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setInviteTeam(teams[0]?.name || '');
                setInviteProjectIds(projects[0] ? [projects[0].id] : []);
                setInviteMemberModalOpen(true);
              }}
              style={{ padding: '9px 18px', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <UserPlus size={16} />
              <span>{isAr ? 'دعوة عضو جديد' : 'Invite Member'}</span>
            </button>
          </div>
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
            <span>{isAr ? 'إدارة الأعضاء والفرق لمالك المؤسسة' : 'Management restricted to Org Owner'}</span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '2px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '16px' }}>
          {[
            { id: 'members', label: isAr ? `الأعضاء (${filteredMembers.length})` : `Members (${filteredMembers.length})`, icon: Users },
            { id: 'teams', label: isAr ? `الفرق والأقسام (${teams.length})` : `Teams & Squads (${teams.length})`, icon: Layers },
            { id: 'quality', label: isAr ? 'تقييم وجودة الأداء' : 'Team Quality & KPIs', icon: Award },
            { id: 'invitations', label: isAr ? `الدعوات (${pendingInvites.length})` : `Invitations (${pendingInvites.length})`, icon: Mail },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 6px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', [isAr ? 'right' : 'left']: '10px', top: '10px' }} />
          <input
            type="text"
            placeholder={isAr ? 'البحث بالاسم أو البريد أو الفريق...' : 'Search members, team, email...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: isAr ? '7px 32px 7px 12px' : '7px 12px 7px 32px',
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

      {/* ─── TAB 1: MEMBERS TABLE ────────────────────────────────────────── */}
      {activeTab === 'members' && (
        <div className="card" style={{ padding: '0px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isAr ? 'right' : 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '14px 18px' }}>{isAr ? 'العضو' : 'Member'}</th>
                  <th style={{ padding: '14px 18px' }}>{isAr ? 'الدور والمنصب' : 'Role & Title'}</th>
                  <th style={{ padding: '14px 18px' }}>{isAr ? 'الفريق' : 'Team'}</th>
                  <th style={{ padding: '14px 18px' }}>{isAr ? 'المشاريع المعينة' : 'Assigned Projects'}</th>
                  <th style={{ padding: '14px 18px' }}>{isAr ? 'حالة الحساب' : 'Account Status'}</th>
                  <th style={{ padding: '14px 18px' }}>{isAr ? 'تاريخ الانضمام' : 'Joined Date'}</th>
                  {isOrgOwner && <th style={{ padding: '14px 18px', textAlign: 'center' }}>{isAr ? 'إجراءات' : 'Actions'}</th>}
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => {
                  const memberTeamObj = teams.find((t) => t.name === member.team);
                  const userMemberId = member.user?.id || member.userId;
                  const memberProjects = projects.filter(
                    (p) => member.assignedProjectIds?.includes(p.id) || p.teamMembers?.some((tm) => tm.id === userMemberId)
                  );

                  return (
                    <tr key={member.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s ease' }}>
                      {/* Member Info */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            className="avatar"
                            style={{
                              width: '36px',
                              height: '36px',
                              background: memberTeamObj?.color || 'var(--primary-gradient)',
                              color: '#fff',
                              fontSize: '12px',
                              fontWeight: 700,
                            }}
                          >
                            {member.user?.name ? member.user.name.split(' ').map((n) => n[0]).join('').substring(0, 2) : 'M'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{member.user?.name}</span>
                              {member.role === 'OWNER' && (
                                <span title="Organization Owner" style={{ color: '#eab308', display: 'inline-flex' }}>
                                  <Crown size={14} />
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{member.user?.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role & Title */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span
                            className="badge"
                            style={{
                              width: 'fit-content',
                              fontSize: '11px',
                              fontWeight: 700,
                              background:
                                member.role === 'OWNER'
                                  ? 'rgba(234, 179, 8, 0.15)'
                                  : member.role === 'ADMIN'
                                  ? 'rgba(37, 99, 235, 0.15)'
                                  : 'var(--bg-subtle)',
                              color:
                                member.role === 'OWNER'
                                  ? '#ca8a04'
                                  : member.role === 'ADMIN'
                                  ? 'var(--primary)'
                                  : 'var(--text-secondary)',
                              border: '1px solid var(--border-light)',
                            }}
                          >
                            {member.role}
                          </span>
                          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                            {(member.user as any)?.jobTitle || 'Engineer'}
                          </span>
                        </div>
                      </td>

                      {/* Team Column with badge and 1-click assign */}
                      <td style={{ padding: '14px 18px' }}>
                        {member.team ? (
                          <div
                            onClick={() => isOrgOwner && openAssignModal(member)}
                            title={isOrgOwner ? 'Click to change team' : undefined}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 10px',
                              borderRadius: '8px',
                              background: memberTeamObj?.color ? `${memberTeamObj.color}15` : 'rgba(37, 99, 235, 0.1)',
                              border: `1px solid ${memberTeamObj?.color ? `${memberTeamObj.color}40` : 'var(--border-light)'}`,
                              color: memberTeamObj?.color || 'var(--primary)',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: isOrgOwner ? 'pointer' : 'default',
                            }}
                          >
                            <span
                              style={{
                                width: '7px',
                                height: '7px',
                                borderRadius: '50%',
                                background: memberTeamObj?.color || 'var(--primary)',
                              }}
                            />
                            <span>{member.team}</span>
                          </div>
                        ) : (
                          isOrgOwner ? (
                            <button
                              type="button"
                              onClick={() => openAssignModal(member)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                background: 'transparent',
                                border: '1px dashed var(--border-light)',
                                color: 'var(--text-muted)',
                                fontSize: '11.5px',
                                cursor: 'pointer',
                              }}
                            >
                              <Plus size={13} />
                              <span>{isAr ? 'تعيين لفريق' : 'Assign Team'}</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>—</span>
                          )
                        )}
                      </td>

                      {/* Assigned Projects Column */}
                      <td style={{ padding: '14px 18px' }}>
                        {memberProjects.length > 0 ? (
                          <div
                            onClick={() => isOrgOwner && openAssignModal(member)}
                            title={isOrgOwner ? 'Click to manage assigned projects' : undefined}
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '5px',
                              cursor: isOrgOwner ? 'pointer' : 'default',
                            }}
                          >
                            {memberProjects.map((p) => (
                              <span
                                key={p.id}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  background: 'var(--bg-subtle)',
                                  border: '1px solid var(--border-light)',
                                  fontSize: '11.5px',
                                  fontWeight: 600,
                                  color: 'var(--text-main)',
                                }}
                              >
                                <Briefcase size={11} color="var(--primary)" />
                                {p.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          isOrgOwner ? (
                            <button
                              type="button"
                              onClick={() => openAssignModal(member)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                background: 'transparent',
                                border: '1px dashed var(--border-light)',
                                color: 'var(--text-muted)',
                                fontSize: '11.5px',
                                cursor: 'pointer',
                              }}
                            >
                              <Plus size={13} />
                              <span>{isAr ? 'تعيين لمشروع' : 'Assign Project'}</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>—</span>
                          )
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 18px' }}>
                        <span className={`badge ${member.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                          {member.status}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td style={{ padding: '14px 18px', color: 'var(--text-muted)' }}>
                        {member.joinedAt || 'Today'}
                      </td>

                      {/* Actions */}
                      {isOrgOwner && (
                        <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            {/* Assign Team & Project */}
                            <button
                              type="button"
                              className="btn-ghost"
                              onClick={() => openAssignModal(member)}
                              title={isAr ? 'تعيين الفريق والمشاريع' : 'Assign Team & Projects'}
                              style={{ padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                            >
                              <FolderPlus size={16} color="var(--primary)" />
                            </button>

                            {/* Edit Role / Title */}
                            <button
                              type="button"
                              className="btn-ghost"
                              onClick={() => openEditMemberModal(member)}
                              title={isAr ? 'تعديل الدور والمسمى الوظيفي' : 'Edit Role & Title'}
                              style={{ padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                            >
                              <Edit2 size={15} color="var(--text-secondary)" />
                            </button>

                            {/* Suspend / Activate */}
                            {member.role !== 'OWNER' && (
                              <button
                                type="button"
                                className="btn-ghost"
                                onClick={() => handleToggleSuspendMember(member)}
                                title={member.status === 'ACTIVE' ? 'Suspend Member' : 'Activate Member'}
                                style={{ padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                              >
                                {member.status === 'ACTIVE' ? <UserX size={15} color="#ef4444" /> : <UserCheck size={15} color="#10b981" />}
                              </button>
                            )}

                            {/* Remove Member */}
                            {member.role !== 'OWNER' && (
                              <button
                                type="button"
                                className="btn-ghost"
                                onClick={() => handleRemoveMember(member.id)}
                                title="Remove Member"
                                style={{ padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                              >
                                <Trash2 size={15} color="#94a3b8" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 2: TEAMS & SQUADS ───────────────────────────────────────── */}
      {activeTab === 'teams' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Subheader */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
                {isAr ? 'الفرق والأقسام المنظمة' : 'Functional Teams & Squads'}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {isAr
                  ? 'قسّم موظفي مؤسستك لفرق متخصصة، وعيّن قائد لكل فريق والمشاريع المرتبطة به.'
                  : 'Group organization members into functional teams with dedicated leaders and linked projects.'}
              </p>
            </div>
            {isOrgOwner && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={openCreateTeamModal}
                style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={16} />
                <span>{isAr ? 'إضافة فريق جديد' : 'New Team'}</span>
              </button>
            )}
          </div>

          {/* Teams Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
            {teams.map((team) => {
              const teamMembers = members.filter((m) => m.team === team.name);
              const teamProjects = projects.filter((p) => team.projectIds?.includes(p.id));
              const leadMember = members.find((m) => m.id === team.leadId || m.userId === team.leadId);

              return (
                <div
                  key={team.id}
                  className="card"
                  style={{
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    borderTop: `4px solid ${team.color || '#2563eb'}`,
                    position: 'relative',
                  }}
                >
                  {/* Team Card Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          background: team.color ? `${team.color}18` : 'rgba(37, 99, 235, 0.1)',
                          color: team.color || 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '15px',
                        }}
                      >
                        <Users size={18} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>{team.name}</h4>
                        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                          {teamMembers.length} {isAr ? 'أعضاء' : 'Members'}
                        </span>
                      </div>
                    </div>

                    {isOrgOwner && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          type="button"
                          className="btn-ghost"
                          onClick={() => openEditTeamModal(team)}
                          title="Edit Team"
                          style={{ padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                        >
                          <Edit2 size={14} color="var(--text-secondary)" />
                        </button>
                        <button
                          type="button"
                          className="btn-ghost"
                          onClick={() => handleDeleteTeam(team)}
                          title="Delete Team"
                          style={{ padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} color="#ef4444" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {team.description && (
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {team.description}
                    </p>
                  )}

                  {/* Team Lead */}
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12.5px',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{isAr ? 'قائد الفريق:' : 'Team Lead:'}</span>
                    {leadMember || team.leadName ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background: team.color || 'var(--primary)',
                            color: '#fff',
                            fontSize: '10px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {(leadMember?.user?.name || team.leadName)?.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                          {leadMember?.user?.name || team.leadName}
                        </span>
                      </div>
                    ) : (
                      <span
                        onClick={() => isOrgOwner && openEditTeamModal(team)}
                        style={{ color: 'var(--text-muted)', cursor: isOrgOwner ? 'pointer' : 'default', textDecoration: isOrgOwner ? 'underline' : 'none' }}
                      >
                        {isAr ? 'لم يحدد بعد' : 'Not assigned'}
                      </span>
                    )}
                  </div>

                  {/* Linked Projects */}
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                      {isAr ? 'المشاريع المرتبطة' : 'Linked Projects'}
                    </div>
                    {teamProjects.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {teamProjects.map((p) => (
                          <span
                            key={p.id}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: 'var(--bg-subtle)',
                              border: '1px solid var(--border-light)',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              color: 'var(--text-main)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Briefcase size={11} color={team.color || 'var(--primary)'} />
                            {p.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {isAr ? 'لا توجد مشاريع مرتبطة حالياً' : 'No projects linked yet'}
                      </span>
                    )}
                  </div>

                  {/* Team Members List */}
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                      {isAr ? 'أعضاء الفريق' : 'Team Members'} ({teamMembers.length})
                    </div>
                    {teamMembers.length > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                        {teamMembers.map((m) => (
                          <div
                            key={m.id}
                            title={`${m.user?.name} (${m.role})`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '3px 8px',
                              borderRadius: '20px',
                              background: 'var(--bg-app)',
                              border: '1px solid var(--border-light)',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              color: 'var(--text-main)',
                            }}
                          >
                            <div
                              style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                background: team.color || 'var(--primary)',
                                color: '#fff',
                                fontSize: '9px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {m.user?.name?.charAt(0) || 'M'}
                            </div>
                            <span>{m.user?.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {isAr ? 'لا يوجد أعضاء في هذا الفريق بعد.' : 'No members assigned to this team yet.'}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 3: TEAM QUALITY & KPIS ─────────────────────────────────── */}
      {activeTab === 'quality' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="stat-card">
              <span className="badge badge-success">Quality Score</span>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>97.4%</div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Sprint Bug Rework Ratio &lt; 2.6%</div>
            </div>

            <div className="stat-card">
              <span className="badge badge-primary">On-Time Velocity</span>
              <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--primary)', marginTop: '4px' }}>95.2%</div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Tasks delivered within deadline</div>
            </div>

            <div className="stat-card">
              <span className="badge badge-purple">Code Review Acceptance</span>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#8b5cf6', marginTop: '4px' }}>98.0%</div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>First-pass approval rate</div>
            </div>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
              {isAr ? 'تقييم جودة أعضاء الفريق الفردية' : 'Member Performance & Quality Breakdown'}
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isAr ? 'right' : 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '11.5px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 14px' }}>Member</th>
                    <th style={{ padding: '10px 14px' }}>Team</th>
                    <th style={{ padding: '10px 14px' }}>Quality Rating</th>
                    <th style={{ padding: '10px 14px' }}>Completed Sprints</th>
                    <th style={{ padding: '10px 14px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((m, idx) => {
                    const quality = 95 + ((idx * 3) % 5);
                    return (
                      <tr key={m.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-main)' }}>
                          {m.user?.name}
                        </td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                          {m.team || 'Core Engineering'}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span className="badge badge-success" style={{ fontWeight: 800 }}>
                            {quality}% Excellent
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>
                          {8 + (idx % 4)} Sprints
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ color: '#10b981', fontWeight: 700, fontSize: '12px' }}>● Top Performer</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: INVITATIONS ─────────────────────────────────────────── */}
      {activeTab === 'invitations' && (
        <div className="card" style={{ padding: '24px' }}>
          {pendingInvites.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
              <Mail size={36} style={{ margin: '0 auto 10px auto', opacity: 0.5 }} />
              <div style={{ fontWeight: 700, fontSize: '15px' }}>No pending invitations</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isAr ? 'right' : 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '11.5px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 14px' }}>Name & Email</th>
                    <th style={{ padding: '10px 14px' }}>Title & Role</th>
                    <th style={{ padding: '10px 14px' }}>Team</th>
                    <th style={{ padding: '10px 14px' }}>Sent Date</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingInvites.map((inv) => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{inv.name}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{inv.email}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className="badge badge-primary">{inv.role}</span>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{inv.title}</div>
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{inv.team}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>{inv.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── MODAL 1: CREATE / EDIT TEAM MODAL ───────────────────────────── */}
      {isTeamModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 9996,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            animation: 'fadeIn 0.15s ease-out',
          }}
          onClick={() => setIsTeamModalOpen(false)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '28px',
              background: 'var(--bg-surface)',
              borderRadius: '18px',
              boxShadow: 'var(--shadow-xl)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>
                  {editingTeam
                    ? (isAr ? 'تعديل بيانات الفريق' : 'Edit Team')
                    : (isAr ? 'إنشاء فريق عمل جديد' : 'Create New Team')}
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {isAr
                    ? 'حدد اسم الفريق، اللون المميز، قائد الفريق والمشاريع المخصصة.'
                    : 'Configure team identity, team lead, and linked projects.'}
                </p>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setIsTeamModalOpen(false)}
                style={{ padding: '6px', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTeam} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Team Name */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                  {isAr ? 'اسم الفريق' : 'Team Name'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mobile Engineering, DevOps Squad, Growth"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
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

              {/* Color Preset Picker */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                  {isAr ? 'اللون المميز للفريق' : 'Accent Color'}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {TEAM_PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setTeamColor(c)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: c,
                        border: teamColor === c ? '3px solid var(--text-main)' : '2px solid transparent',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease',
                        transform: teamColor === c ? 'scale(1.15)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                  {isAr ? 'وصف الفريق والمهام' : 'Team Description'}
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Responsible for iOS & Android app development and release cycles."
                  value={teamDesc}
                  onChange={(e) => setTeamDesc(e.target.value)}
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

              {/* Team Leader Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                  {isAr ? 'قائد الفريق (Team Leader)' : 'Team Leader'}
                </label>
                <select
                  value={teamLeadId}
                  onChange={(e) => setTeamLeadId(e.target.value)}
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
                  <option value="">{isAr ? '-- بدون قائد محدد --' : '-- No leader selected --'}</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.user?.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Linked Projects Multi-select */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                  {isAr ? 'المشاريع المرتبطة بهذا الفريق' : 'Linked Projects for this Team'}
                </label>
                {projects.length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {isAr ? 'لا توجد مشاريع مضافة حتى الآن.' : 'No projects available yet.'}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '120px', overflowY: 'auto' }}>
                    {projects.map((p) => {
                      const isSelected = teamProjectIds.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setTeamProjectIds(teamProjectIds.filter((id) => id !== p.id));
                            } else {
                              setTeamProjectIds([...teamProjectIds, p.id]);
                            }
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: `1px solid ${isSelected ? teamColor : 'var(--border-light)'}`,
                            background: isSelected ? `${teamColor}15` : 'var(--bg-app)',
                            color: isSelected ? teamColor : 'var(--text-secondary)',
                            fontWeight: isSelected ? 700 : 500,
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          {isSelected && <Check size={13} />}
                          <span>{p.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '8px 20px', fontSize: '13px', fontWeight: 700 }}
                >
                  {editingTeam ? (isAr ? 'حفظ التغييرات' : 'Save Changes') : (isAr ? 'إنشاء الفريق' : 'Create Team')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: ASSIGN MEMBER TO TEAM & PROJECTS MODAL ─────────────── */}
      {isAssignModalOpen && selectedMember && (
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
            animation: 'fadeIn 0.15s ease-out',
          }}
          onClick={() => setIsAssignModalOpen(false)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '28px',
              background: 'var(--bg-surface)',
              borderRadius: '18px',
              boxShadow: 'var(--shadow-xl)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-main)' }}>
                  {isAr ? 'تعيين الفريق والمشاريع' : 'Assign Team & Projects'}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {isAr ? 'حدد الفريق المخصص للموظف والمشاريع التي يعمل عليها.' : 'Assign this employee to a specific team and active project(s).'}
                </p>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setIsAssignModalOpen(false)}
                style={{ padding: '6px', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Member Profile Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-light)',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'var(--primary-gradient)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 800,
                  }}
                >
                  {selectedMember.user?.name?.charAt(0) || 'M'}
                </div>
                <div>
                  <div style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {selectedMember.user?.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {selectedMember.user?.email} • {selectedMember.role}
                  </div>
                </div>
              </div>

              {/* Team Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                  {isAr ? 'الفريق المعين له' : 'Assigned Team'} *
                </label>
                <select
                  value={assignedTeam}
                  onChange={(e) => setAssignedTeam(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    fontSize: '13.5px',
                    outline: 'none',
                    fontWeight: 600,
                  }}
                >
                  <option value="">{isAr ? '-- بدون فريق (غير محدد) --' : '-- No Team (Unassigned) --'}</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assigned Projects (Multi-Select Checkboxes / Pills) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {isAr ? 'المشاريع المعين إليها الموظف' : 'Assigned Project(s)'}
                  </label>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {assignedProjectIds.length} {isAr ? 'محدد' : 'selected'}
                  </span>
                </div>

                {projects.length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '12px', background: 'var(--bg-app)', borderRadius: '8px' }}>
                    {isAr ? 'لا توجد مشاريع منشأة بعد في المؤسسة.' : 'No projects available in this organization yet.'}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                    {projects.map((p) => {
                      const isChecked = assignedProjectIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            if (isChecked) {
                              setAssignedProjectIds(assignedProjectIds.filter((id) => id !== p.id));
                            } else {
                              setAssignedProjectIds([...assignedProjectIds, p.id]);
                            }
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '9px 12px',
                            borderRadius: '8px',
                            border: `1px solid ${isChecked ? 'var(--primary)' : 'var(--border-light)'}`,
                            background: isChecked ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-app)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                              style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '4px',
                                border: `1.5px solid ${isChecked ? 'var(--primary)' : 'var(--border-light)'}`,
                                background: isChecked ? 'var(--primary)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                              }}
                            >
                              {isChecked && <Check size={12} />}
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: isChecked ? 700 : 500, color: 'var(--text-main)' }}>
                              {p.name}
                            </span>
                          </div>
                          <span className="badge badge-neutral" style={{ fontSize: '10.5px' }}>
                            {p.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '8px 22px', fontSize: '13px', fontWeight: 700 }}
                >
                  {isAr ? 'حفظ التعيين' : 'Save Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: EDIT MEMBER ROLE & TITLE MODAL ─────────────────────── */}
      {isEditMemberModalOpen && editingMember && (
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
            animation: 'fadeIn 0.15s ease-out',
          }}
          onClick={() => setIsEditMemberModalOpen(false)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '460px',
              padding: '26px',
              background: 'var(--bg-surface)',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-xl)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
                  {isAr ? 'تعديل الدور والمسمى الوظيفي' : 'Edit Role & Job Title'}
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  {editingMember.user?.name} ({editingMember.user?.email})
                </p>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setIsEditMemberModalOpen(false)}
                style={{ padding: '6px', border: 'none', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveMemberDetails} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                  {isAr ? 'الدور في المنظمة' : 'Organization Role'} *
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
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
                  <option value="MEMBER">Standard Member</option>
                  <option value="TEAM_LEADER">Team Leader</option>
                  <option value="PM">Project Manager (PM)</option>
                  <option value="QA">QA Engineer</option>
                  <option value="ADMIN">Organization Admin</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                  {isAr ? 'المسمى الوظيفي' : 'Job Title'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lead Full Stack Engineer"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditMemberModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }}>
                  {isAr ? 'حفظ' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 4: INVITE MEMBER WITH TEAM & PROJECTS ─────────────────── */}
      {isInviteMemberModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 9995,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            animation: 'fadeIn 0.15s ease-out',
          }}
          onClick={() => setInviteMemberModalOpen(false)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '540px',
              padding: '28px',
              background: 'var(--bg-surface)',
              borderRadius: '18px',
              boxShadow: 'var(--shadow-xl)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>
                  {isAr ? 'دعوة وتعيين عضو جديد' : 'Invite & Assign New Member'}
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {isAr
                    ? 'أدخل بيانات الموظف، واختر الفريق والمشاريع التي سيبدأ العمل عليها مباشرة.'
                    : 'Add employee details, pick their team, and assign them directly to projects.'}
                </p>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setInviteMemberModalOpen(false)}
                style={{ padding: '6px', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendInvite} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Name & Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                    {isAr ? 'الاسم الكامل' : 'Full Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-app)',
                      color: 'var(--text-main)',
                      outline: 'none',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                    {isAr ? 'البريد الإلكتروني' : 'Work Email'} *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-app)',
                      color: 'var(--text-main)',
                      outline: 'none',
                      fontSize: '13px',
                    }}
                  />
                </div>
              </div>

              {/* Title & Role */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                    {isAr ? 'المسمى الوظيفي' : 'Job Title'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Backend Engineer"
                    value={inviteTitle}
                    onChange={(e) => setInviteTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-app)',
                      color: 'var(--text-main)',
                      outline: 'none',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                    {isAr ? 'الدور (Role)' : 'Role'} *
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-app)',
                      color: 'var(--text-main)',
                      outline: 'none',
                      fontSize: '13px',
                    }}
                  >
                    <option value="MEMBER">Standard Member</option>
                    <option value="TEAM_LEADER">Team Leader</option>
                    <option value="PM">Project Manager (PM)</option>
                    <option value="QA">QA Engineer</option>
                    <option value="ADMIN">Organization Admin</option>
                  </select>
                </div>
              </div>

              {/* Team Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                  {isAr ? 'الفريق التابع له' : 'Assigned Team'} *
                </label>
                <select
                  value={inviteTeam || (teams[0]?.name || '')}
                  onChange={(e) => setInviteTeam(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    fontSize: '13px',
                  }}
                >
                  {teams.length === 0 ? (
                    <option value="Core Engineering">Core Engineering</option>
                  ) : (
                    teams.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Project Assignment */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                  {isAr ? 'تعيين المشاريع الأولية للموظف' : 'Initial Project Assignment'}
                </label>
                {projects.length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {isAr ? 'لا توجد مشاريع مضافة حالياً.' : 'No projects available yet.'}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {projects.map((p) => {
                      const isSelected = inviteProjectIds.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setInviteProjectIds(inviteProjectIds.filter((id) => id !== p.id));
                            } else {
                              setInviteProjectIds([...inviteProjectIds, p.id]);
                            }
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-light)'}`,
                            background: isSelected ? 'rgba(37, 99, 235, 0.1)' : 'var(--bg-app)',
                            color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: isSelected ? 700 : 500,
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          {isSelected && <Check size={13} />}
                          <span>{p.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setInviteMemberModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 22px', fontSize: '13px', fontWeight: 700 }}>
                  {isAr ? 'إرسال الدعوة وإضافة العضو' : 'Send Invite & Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
