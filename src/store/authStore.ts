import { create } from 'zustand';
import { User, UserRole } from '@/types';

interface AuthState {
  currentUser: User | null;
  activeRole: UserRole;
  isAuthenticated: boolean;
  switchRole: (role: UserRole) => void;
  setCurrentUser: (user: Partial<User>) => void;
  loginUser: (user: User, role: UserRole, token?: string) => void;
  logoutUser: () => void;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  activeRole: 'ORG_MEMBER',
  isAuthenticated: false,

  checkAuth: () => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('syncup_access_token');
    const storedUser = localStorage.getItem('syncup_user');
    const storedRole = localStorage.getItem('syncup_role') as UserRole | null;

    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        set({
          currentUser: user,
          isAuthenticated: true,
          activeRole: storedRole || (user.isPlatformOwner ? 'PLATFORM_OWNER' : 'ORG_ADMIN'),
        });
        return true;
      } catch (e) {
        localStorage.removeItem('syncup_access_token');
        localStorage.removeItem('syncup_user');
      }
    }
    return false;
  },

  switchRole: (role) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('syncup_role', role);
    }
    set({ activeRole: role });
  },

  setCurrentUser: (userData) =>
    set((state) => {
      const updated = state.currentUser ? { ...state.currentUser, ...userData } : (userData as User);
      if (typeof window !== 'undefined') {
        localStorage.setItem('syncup_user', JSON.stringify(updated));
      }
      return { currentUser: updated };
    }),

  loginUser: (user, role, token) => {
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('syncup_access_token', token);
      localStorage.setItem('syncup_user', JSON.stringify(user));
      localStorage.setItem('syncup_role', role);
    }
    set({
      currentUser: user,
      activeRole: role,
      isAuthenticated: true,
    });
  },

  logoutUser: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('syncup_access_token');
      localStorage.removeItem('syncup_refresh_token');
      localStorage.removeItem('syncup_user');
      localStorage.removeItem('syncup_role');
    }
    set({
      currentUser: null,
      isAuthenticated: false,
    });
  },
}));
