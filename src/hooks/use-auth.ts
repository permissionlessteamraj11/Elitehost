import { create } from 'zustand';

interface AuthState {
  user: any | null;
  profile: any | null;
  loading: boolean;
  setUser: (user: any | null) => void;
  setProfile: (profile: any | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  signOut: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    set({ user: null, profile: null });
    window.location.href = '/auth/login';
  },
}));
