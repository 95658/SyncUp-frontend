'use client';

import { useEffect } from 'react';
import { requestWebPushPermission, subscribeToForegroundMessages } from '@/lib/firebase';
import { showSnack } from '@/store/snackbarStore';

export function usePushNotifications() {
  useEffect(() => {
    // Only execute on client side
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('syncup_access_token');
    if (!token) return;

    // Request permission & sync token with backend
    requestWebPushPermission().catch((err) => {
      console.warn('[PushNotifications] Could not register web push:', err);
    });

    // Handle foreground notifications
    const unsubscribe = subscribeToForegroundMessages((payload) => {
      const title = payload.title || 'New Notification';
      const body = payload.body ? `: ${payload.body}` : '';
      showSnack(`${title}${body}`, 'info');
    });

    return () => {
      unsubscribe();
    };
  }, []);
}
