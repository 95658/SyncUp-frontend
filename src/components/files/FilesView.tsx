'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useAuthStore } from '@/store/authStore';
import { showSnack } from '@/store/snackbarStore';
import { useUIStore } from '@/store/uiStore';
import {
  FolderOpen,
  Upload,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  MoreVertical,
  Download,
  Trash2,
  Lock,
  Plus,
  Search,
  Clock,
  HardDrive,
  ShieldAlert,
} from 'lucide-react';

interface OrgFileItem {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'doc' | 'image' | 'sheet';
  uploadedBy: string;
  uploadedAt: string;
  projectId?: string;
  projectName?: string;
}

export const FilesView: React.FC = () => {
  const { organizations, activeOrgId, projects } = useWorkspaceStore();
  const { currentUser, activeRole } = useAuthStore();
  const { language } = useUIStore();
  const isAr = language === 'ar';

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<'pdf' | 'doc' | 'image' | 'sheet'>('pdf');

  // Permission Check (Requirement 18):
  // Only Organization Owner / Project Manager / Team Leader can add or edit files in menu bar files section!
  const isPrivileged =
    currentUser?.isPlatformOwner ||
    activeRole === 'PLATFORM_OWNER' ||
    activeRole === 'ORG_ADMIN' ||
    currentUser?.jobTitle?.toLowerCase().includes('leader') ||
    currentUser?.jobTitle?.toLowerCase().includes('manager');

  const [fileList, setFileList] = useState<OrgFileItem[]>(() => {
    if (typeof window !== 'undefined' && activeOrgId) {
      try {
        const saved = localStorage.getItem(`syncup_files_${activeOrgId}`);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && activeOrgId) {
      try {
        const saved = localStorage.getItem(`syncup_files_${activeOrgId}`);
        setFileList(saved ? JSON.parse(saved) : []);
      } catch {
        setFileList([]);
      }
    } else {
      setFileList([]);
    }
  }, [activeOrgId]);

  const handleUploadFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPrivileged) {
      showSnack(
        isAr
          ? 'غير مصرح: يقتصر رفع وتعديل الملفات في القائمة الرئيسية على مالك المؤسسة أو مدير المشروع أو قائد الفريق'
          : 'Permission denied: Only Organization Owner, Project Manager, or Team Leader can add files here.',
        'error'
      );
      return;
    }

    if (!newFileName.trim()) return;

    const newFile: OrgFileItem = {
      id: `f-${Date.now()}`,
      name: newFileName.trim(),
      size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
      type: newFileType,
      uploadedBy: currentUser?.name || 'Authorized Member',
      uploadedAt: 'Just now',
      projectName: projects[0]?.name || 'General Org Files',
    };

    const updated = [newFile, ...fileList];
    setFileList(updated);
    if (typeof window !== 'undefined' && activeOrgId) {
      try {
        localStorage.setItem(`syncup_files_${activeOrgId}`, JSON.stringify(updated));
      } catch {}
    }
    setNewFileName('');
    setIsUploadModalOpen(false);
    showSnack(isAr ? 'تم رفع الملف بنجاح' : 'File uploaded successfully', 'success');
  };

  const handleDeleteFile = (id: string) => {
    if (!isPrivileged) {
      showSnack(
        isAr
          ? 'غير مصرح: يقتصر حذف الملفات على مالك المؤسسة أو مدير المشروع أو قائد الفريق'
          : 'Permission denied: Only Organization Owner, Project Manager, or Team Leader can delete files.',
        'error'
      );
      return;
    }
    const updated = fileList.filter((f) => f.id !== id);
    setFileList(updated);
    if (typeof window !== 'undefined' && activeOrgId) {
      try {
        localStorage.setItem(`syncup_files_${activeOrgId}`, JSON.stringify(updated));
      } catch {}
    }
    showSnack(isAr ? 'تم حذف الملف' : 'File removed', 'info');
  };

  const filteredFiles = fileList.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.uploadedBy.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'ALL' || f.type === filterType;
    return matchesSearch && matchesType;
  });

  const getFileIcon = (type: OrgFileItem['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText size={20} color="#ef4444" />;
      case 'sheet':
        return <FileSpreadsheet size={20} color="#10b981" />;
      case 'image':
        return <ImageIcon size={20} color="#8b5cf6" />;
      default:
        return <FileText size={20} color="#3b82f6" />;
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderOpen size={24} color="var(--primary)" />
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
              {isAr ? 'ملفات ومستندات المؤسسة' : 'Organization Files & Assets'}
            </h1>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {isAr
              ? 'مستندات المؤسسة المركزية والمخططات (التحكم بالرفع والتعديل مقصور على المالك ومدير المشروع وقائد الفريق).'
              : 'Central organization documents, specifications, and assets. Restricted upload access.'}
          </p>
        </div>

        {isPrivileged ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsUploadModalOpen(true)}
            style={{ padding: '9px 18px', fontSize: '13.5px' }}
          >
            <Upload size={16} />
            <span>{isAr ? 'رفع ملف جديد' : 'Upload File'}</span>
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
            <span>{isAr ? 'عرض فقط (الرفع للمديرين والقادة)' : 'View Only (Upload restricted)'}</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '400px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder={isAr ? 'البحث بالاسم أو الرافع...' : 'Search files by name or author...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '13.5px',
              color: 'var(--text-main)',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'pdf', 'sheet', 'image', 'doc'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={filterType === t ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ padding: '6px 12px', fontSize: '12px', textTransform: 'uppercase' }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Files Grid or Clean Empty State */}
      {filteredFiles.length === 0 ? (
        <div
          style={{
            padding: '54px 24px',
            textAlign: 'center',
            background: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px dashed var(--border-light)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px auto',
              color: 'var(--text-muted)',
            }}
          >
            <FolderOpen size={28} />
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
            {isAr ? 'لا توجد مستندات أو ملفات بعد' : 'No Files or Assets Uploaded Yet'}
          </div>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              marginTop: '6px',
              marginBottom: '18px',
              maxWidth: '440px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {isAr
              ? 'يمكن لمالك المؤسسة ومدير المشروع وقائد الفريق رفع ومشاركة ملفات المؤسسة والمخططات هنا.'
              : 'Authorized team leaders, project managers, and organization owners can upload shared documents, specs, and architectural diagrams here.'}
          </p>
          {isPrivileged && (
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                padding: '9px 18px',
                borderRadius: '10px',
              }}
            >
              <Plus size={16} />
              <span>{isAr ? 'رفع أول ملف للمؤسسة' : 'Upload First File'}</span>
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="card"
              style={{
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {getFileIcon(file.type)}
                </div>

                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div
                    style={{
                      fontSize: '13.5px',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                    title={file.name}
                  >
                    {file.name}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {file.size} • {file.type.toUpperCase()}
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{file.uploadedBy}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{file.uploadedAt}</div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                    title="Download File"
                    onClick={() => showSnack(isAr ? 'جارِ التحميل...' : 'Downloading file...', 'info')}
                  >
                    <Download size={15} color="var(--primary)" />
                  </button>
                  {isPrivileged && (
                    <button
                      type="button"
                      className="btn-ghost"
                      style={{ padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                      title="Delete File"
                      onClick={() => handleDeleteFile(file.id)}
                    >
                      <Trash2 size={15} color="#ef4444" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload File Modal */}
      {isUploadModalOpen && (
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
          onClick={() => setIsUploadModalOpen(false)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '460px',
              padding: '24px',
              background: 'var(--bg-surface)',
              borderRadius: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
              {isAr ? 'رفع ملف للمؤسسة' : 'Upload Organization File'}
            </h3>

            <form onSubmit={handleUploadFile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  {isAr ? 'اسم الملف' : 'File Name'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4_Strategy_Guide.pdf"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
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

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  {isAr ? 'نوع الملف' : 'File Type'}
                </label>
                <select
                  value={newFileType}
                  onChange={(e) => setNewFileType(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-app)',
                    outline: 'none',
                    fontSize: '13px',
                  }}
                >
                  <option value="pdf">PDF Document (.pdf)</option>
                  <option value="doc">Word / Text Document (.docx)</option>
                  <option value="sheet">Spreadsheet (.xlsx / .csv)</option>
                  <option value="image">Image / Graphic (.png / .jpg)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsUploadModalOpen(false)}
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                  <Upload size={15} />
                  <span>{isAr ? 'رفع' : 'Upload'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
