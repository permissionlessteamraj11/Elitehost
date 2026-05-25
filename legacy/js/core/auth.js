/**
 * EliteHosting — Auth Manager
 * @module auth
 * Wraps Supabase auth with app-specific logic
 */

import api from './supabase.js';

export const auth = {
  // ── Session ──────────────────────────────────────────────────
  async getSession() {
    return await api.auth.getSession();
  },

  async getUser() {
    return await api.auth.getUser();
  },

  async getProfile() {
    try {
      const { data } = await api.profile.getMe();
      return data;
    } catch { return null; }
  },

  isLoggedIn() {
    // Synchronous check using cached session
    try {
      const stored = localStorage.getItem('sb-' + location.hostname.split('.')[0] + '-auth-token')
        || localStorage.getItem('supabase.auth.token');
      if (!stored) return false;
      const parsed = JSON.parse(stored);
      const exp = parsed?.expires_at || parsed?.currentSession?.expires_at;
      return exp ? Date.now() / 1000 < exp : false;
    } catch { return false; }
  },

  async isAdmin() {
    const profile = await this.getProfile();
    return profile?.roles?.some(r => ['admin', 'superadmin'].includes(r)) ?? false;
  },

  async logout() {
    await api.auth.signOut();
  },

  // ── Guards ───────────────────────────────────────────────────
  async requireAuth(redirect = '/auth/login.html') {
    const session = await this.getSession();
    if (!session) {
      const returnTo = encodeURIComponent(location.pathname + location.search);
      location.href = `${redirect}?returnTo=${returnTo}`;
      throw new Error('Unauthenticated');
    }
    return session;
  },

  async requireAdmin() {
    await this.requireAuth();
    const isAdmin = await this.isAdmin();
    if (!isAdmin) {
      location.href = '/dashboard/index.html';
      throw new Error('Forbidden');
    }
  },

  async requireGuest() {
    const session = await this.getSession();
    if (session) {
      const returnTo = new URLSearchParams(location.search).get('returnTo');
      location.href = returnTo || '/dashboard/index.html';
    }
  },

  onAuthStateChange(callback) {
    api.auth.onAuthStateChange(callback);
  },
};

export default auth;
