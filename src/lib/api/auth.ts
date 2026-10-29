export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface LoginParams {
  email: string;
  password: string;
}

export interface AcceptInvitationParams {
  token: string;
  fullName: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string | null;
    isPlatformOwner: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  async login(params: LoginParams): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const msg = errorData.message || 'Invalid email or password';
      throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
    }

    const data: AuthResponse = await res.json();
    if (typeof window !== 'undefined') {
      localStorage.setItem('syncup_access_token', data.accessToken);
      localStorage.setItem('syncup_refresh_token', data.refreshToken);
      localStorage.setItem('syncup_user', JSON.stringify(data.user));
    }
    return data;
  },

  async acceptInvitation(params: AcceptInvitationParams): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/accept-invitation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const msg = errorData.message || 'Invitation is invalid or has expired';
      throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
    }

    const data: AuthResponse = await res.json();
    if (typeof window !== 'undefined') {
      localStorage.setItem('syncup_access_token', data.accessToken);
      localStorage.setItem('syncup_refresh_token', data.refreshToken);
      localStorage.setItem('syncup_user', JSON.stringify(data.user));
    }
    return data;
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('syncup_access_token');
      localStorage.removeItem('syncup_refresh_token');
      localStorage.removeItem('syncup_user');
      window.location.href = '/auth/login';
    }
  },

  getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('syncup_access_token');
    }
    return null;
  },
};
