import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { API_BASE_URL } from '@/lib/api';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCwZZ0w1qqfvEtWmPTOi2Jb3qCk2k3_WKk',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'syncup-cbcef.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'syncup-cbcef',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'syncup-cbcef.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '230429655894',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:230429655894:web:af630d8456807792054cf7',
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let messagingInstance: Messaging | null = null;

export function getClientMessaging(): Messaging | null {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'Notification' in window) {
    if (!messagingInstance) {
      messagingInstance = getMessaging(app);
    }
    return messagingInstance;
  }
  return null;
}

export async function requestWebPushPermission(): Promise<string | null> {
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
    console.warn('[FCM Web] Notifications or ServiceWorker not supported by this browser.');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('[FCM Web] Notification permission denied or dismissed:', permission);
      return null;
    }

    const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('[FCM Web] Service worker registered successfully');

    const messaging = getClientMessaging();
    if (!messaging) return null;

    const currentToken = await getToken(messaging, {
      serviceWorkerRegistration: swReg,
    });

    if (currentToken) {
      console.log('[FCM Web] Acquired registration token:', currentToken);

      // Register device token with backend
      const accessToken = localStorage.getItem('syncup_access_token');
      if (accessToken) {
        await fetch(`${API_BASE_URL}/notifications/device-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            token: currentToken,
            platform: 'WEB',
          }),
        });
        console.log('[FCM Web] Registered token with backend');
      }

      return currentToken;
    } else {
      console.warn('[FCM Web] No registration token available.');
      return null;
    }
  } catch (err) {
    console.error('[FCM Web] An error occurred while retrieving token:', err);
    return null;
  }
}

export function subscribeToForegroundMessages(
  onNotificationReceived: (payload: { title?: string; body?: string; data?: any }) => void
) {
  const messaging = getClientMessaging();
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    console.log('[FCM Web] Foreground message received:', payload);
    onNotificationReceived({
      title: payload.notification?.title || payload.data?.title,
      body: payload.notification?.body || payload.data?.body,
      data: payload.data,
    });
  });
}
