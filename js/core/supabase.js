/**
 * EliteHosting — Supabase Client Module
 * @module supabase
 * Replaces custom backend — uses Supabase directly from frontend
 */

// ── CONFIG ───────────────────────────────────────────────────────
const SUPABASE_URL = window.__ENV?.SUPABASE_URL || 'https://jrjzkpxlpiovhwithxbo.supabase.co';
const SUPABASE_ANON_KEY = window.__ENV?.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyanprcHhscGlvdmh3aXRoeGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNDUzNDQsImV4cCI6MjA4NDgyMTM0NH0.aRbGjlOVUrRK5Ji-P1W-LJ6HUVYuJeU2pixABEWCYYY';

// ── Load Supabase SDK ─────────────────────────────────────────────
let _client = null;

async function getClient() {
  if (_client) return _client;
  if (!window.supabase) {
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  _client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
  return _client;
}

// ── AUTH ──────────────────────────────────────────────────────────
export const authSB = {
  async signUp({ email, password, username, referralCode }) {
    const sb = await getClient();
    const { data, error } = await sb.auth.signUp({
      email, password,
      options: {
        data: { username, display_name: username },
        emailRedirectTo: `${location.origin}/auth/verify-email.html`,
      },
    });
    if (error) throw { data: { error: error.message } };
    // Handle referral code
    if (referralCode && data.user) {
      await handleReferral(data.user.id, referralCode);
    }
    return data;
  },

  async signIn({ email, password }) {
    const sb = await getClient();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Email not confirmed')) throw { data: { error: 'Please verify your email first.' } };
      throw { data: { error: 'Invalid email or password.' } };
    }
    // Update last login
    await sb.from('users').update({ last_login_at: new Date().toISOString() }).eq('auth_id', data.user.id);
    return { data: { accessToken: data.session.access_token, user: await getProfile(data.user.id) } };
  },

  async signInWithGitHub() {
    const sb = await getClient();
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${location.origin}/auth/oauth-callback.html` },
    });
    if (error) throw error;
  },

  async signInWithGoogle() {
    const sb = await getClient();
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/oauth-callback.html` },
    });
    if (error) throw error;
  },

  async signOut() {
    const sb = await getClient();
    await sb.auth.signOut();
    localStorage.removeItem('eh_user');
    window.location.href = '/auth/login.html';
  },

  async getSession() {
    const sb = await getClient();
    const { data } = await sb.auth.getSession();
    return data.session;
  },

  async getUser() {
    const sb = await getClient();
    const { data } = await sb.auth.getUser();
    return data.user;
  },

  onAuthStateChange(callback) {
    getClient().then(sb => {
      sb.auth.onAuthStateChange(callback);
    });
  },

  async resetPasswordForEmail(email) {
    const sb = await getClient();
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/reset-password.html`,
    });
    if (error) throw { data: { error: error.message } };
  },

  async updatePassword(newPassword) {
    const sb = await getClient();
    const { error } = await sb.auth.updateUser({ password: newPassword });
    if (error) throw { data: { error: error.message } };
  },
};

// ── PROFILE ───────────────────────────────────────────────────────
async function getProfile(authId) {
  const sb = await getClient();
  const { data } = await sb.from('users').select('*').eq('auth_id', authId).single();
  return data;
}

export const profileSB = {
  async getMe() {
    const sb = await getClient();
    const { data: user } = await sb.auth.getUser();
    if (!user.user) throw { data: { error: 'Not authenticated' } };
    const { data, error } = await sb.from('users').select('*').eq('auth_id', user.user.id).single();
    if (error) throw { data: { error: error.message } };
    return { data };
  },

  async updateProfile(updates) {
    const sb = await getClient();
    const { data: user } = await sb.auth.getUser();
    const { data, error } = await sb.from('users')
      .update({ display_name: updates.displayName, updated_at: new Date().toISOString() })
      .eq('auth_id', user.user.id)
      .select().single();
    if (error) throw { data: { error: error.message } };
    return { data };
  },

  async linkTelegram(chatId) {
    const sb = await getClient();
    const { data: user } = await sb.auth.getUser();
    const { error } = await sb.from('users').update({ telegram_chat_id: chatId }).eq('auth_id', user.user.id);
    if (error) throw { data: { error: error.message } };
    return { data: { success: true } };
  },
};

// ── DEPLOYMENTS ───────────────────────────────────────────────────
export const deploymentsSB = {
  async list({ status, limit = 20, offset = 0 } = {}) {
    const sb = await getClient();
    const { data: authUser } = await sb.auth.getUser();
    const profile = await getProfile(authUser.user.id);

    let q = sb.from('deployments')
      .select('*, containers(*)')
      .eq('owner_id', profile.id)
      .neq('status', 'deleted')
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) q = q.eq('status', status);

    const { data, error, count } = await q;
    if (error) throw { data: { error: error.message } };
    return { data, pagination: { total: count, limit, offset } };
  },

  async get(id) {
    const sb = await getClient();
    const { data, error } = await sb.from('deployments')
      .select('*, containers(*), users(username, email)')
      .eq('id', id).single();
    if (error) throw { status: error.code === 'PGRST116' ? 404 : 400, data: { error: error.message } };
    return { data };
  },

  async create(payload) {
    const sb = await getClient();
    const { data: authUser } = await sb.auth.getUser();
    const profile = await getProfile(authUser.user.id);

    // Check credits
    if (profile.credit_balance < 1.0) {
      throw { data: { error: 'Insufficient credits. You need at least 1 credit to deploy.' } };
    }

    // Check name uniqueness
    const { data: existing } = await sb.from('deployments')
      .select('id').eq('owner_id', profile.id).eq('name', payload.name).not('status', 'eq', 'deleted').maybeSingle();
    if (existing) throw { data: { error: `Deployment name "${payload.name}" already exists.` } };

    const slug = `${payload.name}-${profile.username}`;
    const { data, error } = await sb.from('deployments').insert({
      owner_id:    profile.id,
      name:        payload.name,
      slug:        slug,
      source_type: payload.sourceType,
      repo_url:    payload.repoUrl,
      branch:      payload.branch || 'main',
      start_cmd:   payload.startCmd,
      build_cmd:   payload.buildCmd,
      port:        payload.port || 3000,
      env_vars_enc: payload.envVars ? JSON.stringify(payload.envVars) : null,
      status:      'pending',
    }).select().single();

    if (error) throw { data: { error: error.message } };

    // Add build log entry
    await sb.from('build_logs').insert({
      deployment_id: data.id,
      level: 'system',
      message: '🚀 Deployment queued. Build will start shortly.',
    });

    // Create notification
    await sb.from('notifications').insert({
      user_id: profile.id,
      type: 'deploy_queued',
      title: 'Deployment Queued',
      message: `${payload.name} is queued for deployment.`,
      data: { deployment_id: data.id },
    });

    return { data };
  },

  async redeploy(id) {
    const sb = await getClient();
    const { data: authUser } = await sb.auth.getUser();
    const profile = await getProfile(authUser.user.id);

    if (profile.credit_balance < 1.0) {
      throw { data: { error: 'Insufficient credits.' } };
    }

    const { data, error } = await sb.from('deployments')
      .update({ status: 'pending', updated_at: new Date().toISOString() })
      .eq('id', id).eq('owner_id', profile.id).select().single();
    if (error) throw { data: { error: error.message } };

    await sb.from('build_logs').insert({
      deployment_id: id, level: 'system',
      message: '🔄 Redeploy triggered.',
    });
    return { data };
  },

  async stop(id) {
    const sb = await getClient();
    const { data: authUser } = await sb.auth.getUser();
    const profile = await getProfile(authUser.user.id);
    const { data, error } = await sb.from('deployments')
      .update({ status: 'stopped', updated_at: new Date().toISOString() })
      .eq('id', id).eq('owner_id', profile.id).select().single();
    if (error) throw { data: { error: error.message } };
    return { data };
  },

  async remove(id) {
    const sb = await getClient();
    const { data: authUser } = await sb.auth.getUser();
    const profile = await getProfile(authUser.user.id);
    const { error } = await sb.from('deployments')
      .update({ status: 'deleted', updated_at: new Date().toISOString() })
      .eq('id', id).eq('owner_id', profile.id);
    if (error) throw { data: { error: error.message } };
    return { data: { success: true } };
  },

  async getBuildLogs(deploymentId, { limit = 200, after } = {}) {
    const sb = await getClient();
    let q = sb.from('build_logs')
      .select('*')
      .eq('deployment_id', deploymentId)
      .order('created_at', { ascending: true })
      .limit(limit);
    if (after) q = q.gt('created_at', after);
    const { data, error } = await q;
    if (error) throw { data: { error: error.message } };
    return { data };
  },

  // Real-time subscription
  subscribeLogs(deploymentId, callback) {
    getClient().then(sb => {
      const channel = sb.channel(`logs:${deploymentId}`)
        .on('postgres_changes', {
          event: 'INSERT', schema: 'public',
          table: 'build_logs',
          filter: `deployment_id=eq.${deploymentId}`,
        }, payload => callback(payload.new))
        .subscribe();
      return () => sb.removeChannel(channel);
    });
  },

  subscribeStatus(deploymentId, callback) {
    getClient().then(sb => {
      const channel = sb.channel(`deploy:${deploymentId}`)
        .on('postgres_changes', {
          event: 'UPDATE', schema: 'public',
          table: 'deployments', filter: `id=eq.${deploymentId}`,
        }, payload => callback(payload.new))
        .subscribe();
      return () => sb.removeChannel(channel);
    });
  },
};

// ── CREDITS ───────────────────────────────────────────────────────
export const creditsSB = {
  async getBalance() {
    const sb = await getClient();
    const { data: authUser } = await sb.auth.getUser();
    const profile = await getProfile(authUser.user.id);
    return { data: { balance: profile.credit_balance } };
  },

  async getTransactions({ limit = 20 } = {}) {
    const sb = await getClient();
    const { data: authUser } = await sb.auth.getUser();
    const profile = await getProfile(authUser.user.id);
    const { data, error } = await sb.from('transactions')
      .select('*').eq('user_id', profile.id)
      .order('created_at', { ascending: false }).limit(limit);
    if (error) throw { data: { error: error.message } };
    return { data };
  },

  async getExpiringCredits() {
    const sb = await getClient();
    const { data: authUser } = await sb.auth.getUser();
    const profile = await getProfile(authUser.user.id);
    const in7days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await sb.from('credits')
      .select('*').eq('user_id', profile.id)
      .gt('remaining', 0).lt('expires_at', in7days)
      .order('expires_at', { ascending: true });
    return { data: data || [] };
  },

  // Stripe checkout — calls your Stripe backend edge function
  async createCheckout(pack) {
    const sb = await getClient();
    const session = await sb.auth.getSession();
    const { data, error } = await sb.functions.invoke('create-checkout', {
      body: { pack },
      headers: { Authorization: `Bearer ${session.data.session?.access_token}` },
    });
    if (error) throw { data: { error: error.message } };
    return { data };
  },
};

// ── AI ────────────────────────────────────────────────────────────
export const aiSB = {
  async execute({ task, context, deploymentId, history }) {
    const sb = await getClient();
    const session = await sb.auth.getSession();
    const { data, error } = await sb.functions.invoke('ai-execute', {
      body: { task, context, deploymentId, history },
      headers: { Authorization: `Bearer ${session.data.session?.access_token}` },
    });
    if (error) throw { data: { error: error.message } };
    return { data };
  },
};

// ── NOTIFICATIONS ─────────────────────────────────────────────────
export const notificationsSB = {
  async list({ limit = 20, unread } = {}) {
    const sb = await getClient();
    const { data: authUser } = await sb.auth.getUser();
    const profile = await getProfile(authUser.user.id);
    let q = sb.from('notifications')
      .select('*').eq('user_id', profile.id)
      .order('created_at', { ascending: false }).limit(limit);
    if (unread) q = q.eq('is_read', false);
    const { data, error } = await q;
    if (error) throw { data: { error: error.message } };
    return { data };
  },

  async markRead(id) {
    const sb = await getClient();
    await sb.from('notifications').update({ is_read: true }).eq('id', id);
  },

  async markAllRead() {
    const sb = await getClient();
    const { data: authUser } = await sb.auth.getUser();
    const profile = await getProfile(authUser.user.id);
    await sb.from('notifications').update({ is_read: true }).eq('user_id', profile.id);
  },

  subscribe(userId, callback) {
    getClient().then(sb => {
      sb.channel(`notifs:${userId}`)
        .on('postgres_changes', {
          event: 'INSERT', schema: 'public',
          table: 'notifications', filter: `user_id=eq.${userId}`,
        }, payload => callback(payload.new))
        .subscribe();
    });
  },
};

// ── ADMIN ─────────────────────────────────────────────────────────
export const adminSB = {
  async getStats() {
    const sb = await getClient();
    const [users, deploys, running] = await Promise.all([
      sb.from('users').select('id', { count: 'exact', head: true }),
      sb.from('deployments').select('id', { count: 'exact', head: true }).neq('status', 'deleted'),
      sb.from('deployments').select('id', { count: 'exact', head: true }).eq('status', 'running'),
    ]);
    return {
      data: {
        totalUsers: users.count || 0,
        totalDeployments: deploys.count || 0,
        runningDeployments: running.count || 0,
      }
    };
  },

  async getUsers({ limit = 50, offset = 0, search } = {}) {
    const sb = await getClient();
    let q = sb.from('users').select('*').order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    if (search) q = q.or(`email.ilike.%${search}%,username.ilike.%${search}%`);
    const { data, error } = await q;
    if (error) throw { data: { error: error.message } };
    return { data };
  },

  async grantCredits(userId, amount, reason) {
    const sb = await getClient();
    const { data, error } = await sb.rpc('add_credits', {
      p_user_id: userId, p_amount: amount,
      p_source: 'admin_grant', p_description: reason,
    });
    if (error) throw { data: { error: error.message } };
    return { data };
  },

  async banUser(userId, reason) {
    const sb = await getClient();
    const { error } = await sb.from('users').update({ is_banned: true, ban_reason: reason }).eq('id', userId);
    if (error) throw { data: { error: error.message } };
    return { data: { success: true } };
  },

  async broadcast(message, type = 'info') {
    const sb = await getClient();
    const { data: authUser } = await sb.auth.getUser();
    const profile = await getProfile(authUser.user.id);
    // Insert broadcast message
    const { data, error } = await sb.from('broadcasts').insert({
      admin_id: profile.id, type, message,
    }).select().single();
    if (error) throw { data: { error: error.message } };
    // Create notifications for all users
    const { data: users } = await sb.from('users').select('id').eq('is_banned', false);
    if (users) {
      const notifications = users.map(u => ({
        user_id: u.id, type: 'broadcast', title: 'System Announcement', message, data: { broadcast_id: data.id },
      }));
      // Batch insert 100 at a time
      for (let i = 0; i < notifications.length; i += 100) {
        await sb.from('notifications').insert(notifications.slice(i, i + 100));
      }
    }
    return { data };
  },
};

// ── REFERRALS ─────────────────────────────────────────────────────
async function handleReferral(newUserAuthId, referralCode) {
  const sb = await getClient();
  const { data: referrer } = await sb.from('users').select('id').eq('referral_code', referralCode.toUpperCase()).maybeSingle();
  if (!referrer) return;
  const { data: newUser } = await sb.from('users').select('id').eq('auth_id', newUserAuthId).maybeSingle();
  if (!newUser) return;
  await sb.from('referrals').insert({ referrer_id: referrer.id, referred_id: newUser.id });
  // Update referred_by
  await sb.from('users').update({ referred_by: referrer.id }).eq('auth_id', newUserAuthId);
}

// ── EXPORT COMBINED API ───────────────────────────────────────────
export const api = {
  auth: authSB,
  profile: profileSB,
  deployments: deploymentsSB,
  credits: creditsSB,
  ai: aiSB,
  notifications: notificationsSB,
  admin: adminSB,
  getClient,
};

export default api;
