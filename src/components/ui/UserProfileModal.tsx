'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { showSnack } from '@/store/snackbarStore';
import { User, Camera, Mail, Shield, Briefcase, Phone, Upload, Trash2, X, Save } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

export const UserProfileModal: React.FC = () => {
  const { isProfileModalOpen, setProfileModalOpen, language } = useUIStore();
  const { currentUser, setCurrentUser, activeRole } = useAuthStore();

  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [jobTitle, setJobTitle] = useState(currentUser?.jobTitle || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [phone, setPhone] = useState('+1 (555) 019-2834');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.name || '');
      setJobTitle(currentUser.jobTitle || '');
      setAvatarUrl(currentUser.avatarUrl || '');
    }
  }, [currentUser, isProfileModalOpen]);

  if (!isProfileModalOpen) return null;

  const isAr = language === 'ar';

  // Requirement 2: Handle genuine photo file upload from device
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showSnack(isAr ? 'يرجى اختيار ملف صورة صالح' : 'Please select a valid image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showSnack(isAr ? 'حجم الصورة يجب ألا يتجاوز 5 ميجابايت' : 'Image size must be less than 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAvatarUrl(result);
        showSnack(isAr ? 'تم تحميل الصورة للمعاينة' : 'Photo loaded! Click Save to apply', 'info');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    showSnack(isAr ? 'تمت إزالة صورة الملف الشخصي' : 'Profile photo removed', 'info');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // 1. Update in local Auth Store immediately
      setCurrentUser({
        name: fullName.trim(),
        jobTitle: jobTitle.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
      });

      // 2. Sync with backend profile if token exists
      const token = typeof window !== 'undefined' ? localStorage.getItem('syncup_access_token') : null;
      if (token) {
        await fetch(`${API_BASE_URL}/users/profile`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName: fullName.trim(),
            jobTitle: jobTitle.trim(),
            avatarUrl: avatarUrl.trim() || undefined,
            phone: phone.trim(),
          }),
        }).catch(() => null);
      }

      showSnack(isAr ? 'تم تحديث الملف الشخصي والصورة بنجاح' : 'Profile photo and details updated!', 'success');
      setProfileModalOpen(false);
    } catch (err: any) {
      showSnack(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
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
      onClick={() => setProfileModalOpen(false)}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'var(--bg-surface)',
          borderRadius: '18px',
          padding: '28px',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-light)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
              {isAr ? 'الملف الشخصي وصورة الحساب' : 'User Profile & Picture'}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {isAr ? 'قم برفع صورتك وتعديل معلومات حسابك' : 'Upload your real photo and update your personal info.'}
            </p>
          </div>
          <button
            type="button"
            className="btn-ghost"
            style={{ padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            onClick={() => setProfileModalOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Requirement 2: Genuine Profile Pic File Upload */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            padding: '16px',
            background: 'var(--bg-app)',
            borderRadius: '14px',
            border: '1px solid var(--border-light)',
          }}>
            <div style={{ position: 'relative' }}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid var(--primary)',
                    boxShadow: 'var(--shadow-md)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'var(--primary-gradient)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '26px',
                    fontWeight: 800,
                    boxShadow: 'var(--shadow-md)',
                  }}
                >
                  {fullName ? fullName.split(' ').map((n) => n[0]).join('').substring(0, 2) : 'ZG'}
                </div>
              )}

              {/* Camera icon trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Change Photo"
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: '#ffffff',
                  border: '2px solid var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <Camera size={14} />
              </button>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {isAr ? 'صورة الملف الشخصي' : 'Profile Picture'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {isAr ? 'PNG أو JPG أو WEBP حتى 5 ميجابايت' : 'PNG, JPG or WEBP up to 5MB'}
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-primary"
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Upload size={14} />
                  <span>{isAr ? 'رفع صورة من جهازك' : 'Upload from Device'}</span>
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="btn btn-secondary"
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      color: 'var(--danger)',
                    }}
                  >
                    <Trash2 size={13} />
                    <span>{isAr ? 'حذف' : 'Remove'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              {isAr ? 'الاسم الكامل' : 'Full Name'}
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-app)',
                fontSize: '13.5px',
                color: 'var(--text-main)',
                outline: 'none',
              }}
            />
          </div>

          {/* Job Title */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              {isAr ? 'المسمى الوظيفي' : 'Job Title'}
            </label>
            <div style={{ position: 'relative' }}>
              <Briefcase size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                placeholder="e.g. Lead Product Architect"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 38px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-app)',
                  fontSize: '13.5px',
                  color: 'var(--text-main)',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              {isAr ? 'رقم الهاتف' : 'Phone Number'}
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 38px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-app)',
                  fontSize: '13.5px',
                  color: 'var(--text-main)',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Read-Only Account Details */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            padding: '12px 14px',
            background: 'var(--bg-app)',
            borderRadius: '10px',
            border: '1px solid var(--border-light)',
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {isAr ? 'البريد الإلكتروني' : 'Account Email'}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: 600, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser?.email || 'user@example.com'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {isAr ? 'الدور الحالي' : 'Workspace Role'}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 700, marginTop: '2px' }}>
                {activeRole.replace('_', ' ')}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setProfileModalOpen(false)}
              style={{ padding: '9px 16px', borderRadius: '9px', fontSize: '13px' }}
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary"
              style={{
                padding: '9px 20px',
                borderRadius: '9px',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
              }}
            >
              <Save size={16} />
              <span>{isSaving ? (isAr ? 'جارٍ الحفظ...' : 'Saving...') : (isAr ? 'حفظ التغييرات' : 'Save Changes')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
