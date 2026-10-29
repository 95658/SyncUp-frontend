import { create } from 'zustand';
import { Language, translations } from '@/lib/i18n';

interface UIState {
  theme: 'light' | 'dark';
  language: Language;
  mouseAnimation: boolean;
  isPageLoading: boolean;
  isProfileModalOpen: boolean;
  isLogoutConfirmOpen: boolean;
  isNotificationOpen: boolean;
  viewingNotification: any | null;
  isEstimationGameOpen: boolean;

  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  toggleMouseAnimation: () => void;
  setPageLoading: (loading: boolean) => void;
  setProfileModalOpen: (open: boolean) => void;
  setLogoutConfirmOpen: (open: boolean) => void;
  setNotificationOpen: (open: boolean) => void;
  setViewingNotification: (notification: any | null) => void;
  setEstimationGameOpen: (open: boolean) => void;
  initUIFromStorage: () => void;
  t: (key: keyof typeof translations['en']) => string;
}

const getInitialLang = (): Language => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('syncup_lang');
    if (saved === 'ar' || saved === 'en') return saved;
  }
  return 'en';
};

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('syncup_theme');
    if (saved === 'light' || saved === 'dark') return saved;
  }
  return 'light';
};

export const useUIStore = create<UIState>((set, get) => ({
  theme: getInitialTheme(),
  language: getInitialLang(),
  mouseAnimation: true,
  isPageLoading: false,
  isProfileModalOpen: false,
  isLogoutConfirmOpen: false,
  isNotificationOpen: false,
  viewingNotification: null,
  isEstimationGameOpen: false,

  initUIFromStorage: () => {
    if (typeof window !== 'undefined') {
      const savedLang = (localStorage.getItem('syncup_lang') as Language) || 'en';
      const savedTheme = (localStorage.getItem('syncup_theme') as 'light' | 'dark') || 'light';
      document.documentElement.setAttribute('dir', savedLang === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', savedLang);
      document.documentElement.setAttribute('data-theme', savedTheme);
      set({ language: savedLang, theme: savedTheme });
    }
  },

  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('syncup_theme', next);
    }
    set({ theme: next });
  },

  setLanguage: (lang) => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', lang);
      localStorage.setItem('syncup_lang', lang);
    }
    set({ language: lang });
  },

  toggleMouseAnimation: () => {
    const next = !get().mouseAnimation;
    if (typeof window !== 'undefined') {
      localStorage.setItem('syncup_mouse_anim', String(next));
    }
    set({ mouseAnimation: next });
  },

  setPageLoading: (loading) => set({ isPageLoading: loading }),
  setProfileModalOpen: (open) => set({ isProfileModalOpen: open }),
  setLogoutConfirmOpen: (open) => set({ isLogoutConfirmOpen: open }),
  setNotificationOpen: (open) => set({ isNotificationOpen: open }),
  setViewingNotification: (notification) => set({ viewingNotification: notification }),
  setEstimationGameOpen: (open) => set({ isEstimationGameOpen: open }),

  t: (key) => {
    const lang = get().language;
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  },
}));
