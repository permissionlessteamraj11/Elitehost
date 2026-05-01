/**
 * EliteHosting — Supabase Client v2
 * Fixed: return value structures, user caching, notification subscribe
 * Added: paymentSB for QR-based payment requests
 */

// ── CONFIG ────────────────────────────────────────────────────────
const SUPABASE_URL      = window.__ENV?.SUPABASE_URL      || 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = window.__ENV?.SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

// ── Supabase SDK loader ───────────────────────────────────────────
let _sb = null;
let _profile = null;   // cached profile
let _profileAuth = null; // which auth_id was cached

async function sb() {
  if (_sb) return _sb;
  if (!window.supabase) {
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      s.integrity = 'sha384-sfbOag7cEcqn2DK53T/iBNAH/2cMCf7bSzJDwBhV117A0z/NIj9Usei1jKIBY1Ae';
      s.crossOrigin = 'anonymous';
      s.onload = res; s.onerror = () => rej(new Error('Supabase SDK load failed (SRI check might have failed)'));
      document.head.appendChild(s);
    });
  }
  _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'eh-session',
    },
  });
  return _sb;
}

// ── Get current auth user (cached) ───────────────────────────────
async function authUser() {
  const c = await sb();
  const { data, error } = await c.auth.getUser();
  if (error || !data.user) throw { data: { error: 'Not authenticated. Please log in.' } };
  return data.user;
}

// ── Get profile from public.users (cached per auth_id) ───────────
async function getProfile(forceRefresh = false) {
  const c  = await sb();
  const au = await authUser();
  if (!forceRefresh && _profile && _profileAuth === au.id) return _profile;
  const { data, error } = await c.from('users').select('*').eq('auth_id', au.id).maybeSingle();
  if (error) throw { data: { error: `Profile error: ${error.message}` } };
  if (!data)  throw { data: { error: 'Profile not found. Please contact support.' } };
  _profile     = data;
  _profileAuth = au.id;
  return data;
}

// Clear profile cache (call on logout / profile update)
function clearCache() { _profile = null; _profileAuth = null; }

// ══════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════
export const authSB = {
  async signUp({ email, password, username, referralCode }) {
    const c = await sb();
    const { data, error } = await c.auth.signUp({
      email, password,
      options: {
        data: { username, display_name: username },
        emailRedirectTo: `${location.origin}/auth/verify-email.html`,
      },
    });
    if (error) {
      if (error.message.includes('already registered')) throw { data: { error: 'This email is already registered.' } };
      throw { data: { error: error.message } };
    }
    // Handle referral code after signup
    if (referralCode && data.user?.id) {
      setTimeout(() => _handleReferral(data.user.id, referralCode), 2000);
    }
    return data;
  },

  async signIn({ email, password }) {
    const c = await sb();
    clearCache();
    const { data, error } = await c.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        throw { data: { error: 'Please verify your email first. Check your inbox.' } };
      }
      if (error.message.toLowerCase().includes('invalid login')) {
        throw { data: { error: 'Wrong email or password. Please try again.' } };
      }
      throw { data: { error: error.message } };
    }
    // Update last_login_at non-blocking
    c.from('users').update({ last_login_at: new Date().toISOString() })
      .eq('auth_id', data.user.id).then(() => {});
    const profile = await getProfile();
    return { data: { user: profile, session: data.session } };
  },

  async signInWithGitHub() {
    const c = await sb();
    const { error } = await c.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${location.origin}/auth/oauth-callback.html` },
    });
    if (error) throw { data: { error: error.message } };
  },

  async signInWithGoogle() {
    const c = await sb();
    const { error } = await c.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/oauth-callback.html` },
    });
    if (error) throw { data: { error: error.message } };
  },

  async signOut() {
    const c = await sb();
    clearCache();
    await c.auth.signOut();
    location.href = '/auth/login.html';
  },

  async getSession() {
    const c = await sb();
    const { data } = await c.auth.getSession();
    return data?.session || null;
  },

  async getUser() {
    const c = await sb();
    const { data } = await c.auth.getUser();
    return data?.user || null;
  },

  async resetPassword(email) {
    const c = await sb();
    const { error } = await c.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/reset-password.html`,
    });
    if (error) throw { data: { error: error.message } };
    return { data: { success: true } };
  },

  async updatePassword(newPassword) {
    const c = await sb();
    const { error } = await c.auth.updateUser({ password: newPassword });
    if (error) throw { data: { error: error.message } };
    return { data: { success: true } };
  },

  onAuthStateChange(callback) {
    sb().then(c => c.auth.onAuthStateChange(callback));
  },
};

// ══════════════════════════════════════════════════════════════════
// PROFILE
// ══════════════════════════════════════════════════════════════════
export const profileSB = {
  async getMe() {
    const data = await getProfile();
    return { data };
  },

  async updateProfile(updates) {
    const c = await sb();
    const au = await authUser();
    const payload = {};
    if (updates.display_name !== undefined) payload.display_name = updates.display_name;
    if (updates.username !== undefined)     payload.username = updates.username;
    payload.updated_at = new Date().toISOString();

    const { data, error } = await c.from('users').update(payload)
      .eq('auth_id', au.id).select().single();
    if (error) throw { data: { error: error.message } };
    _profile = data; // update cache
    return { data };
  },

  async linkTelegram() {
    // Returns a token the user sends to the bot
    const profile = await getProfile();
    const token = btoa(`${profile.id}:${Date.now()}`).replace(/=/g, '');
    return { data: { token } };
  },
};

// ══════════════════════════════════════════════════════════════════
// DEPLOYMENTS  — returns { data: { deployments: [...] } }
// ══════════════════════════════════════════════════════════════════
export const deploymentsSB = {
  async list({ status, limit = 50, offset = 0 } = {}) {
    const c       = await sb();
    const profile = await getProfile();

    let q = c.from('deployments')
      .select('*, containers(*)', { count: 'exact' })
      .eq('owner_id', profile.id)
      .neq('status', 'deleted')
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) q = q.eq('status', status);

    const { data, error, count } = await q;
    if (error) throw { data: { error: error.message } };
    return { data: { deployments: data || [], total: count || 0 } };
  },

  async get(id) {
    const c = await sb();
    const { data, error } = await c.from('deployments')
      .select('*, containers(*)')
      .eq('id', id).maybeSingle();
    if (error) throw { data: { error: error.message } };
    if (!data) throw { status: 404, data: { error: 'Deployment not found' } };
    return { data };
  },

  async create(payload) {
    const c       = await sb();
    const profile = await getProfile(true); // force refresh

    if (profile.credit_balance < 1.0) {
      throw { data: { error: 'Insufficient credits. Need at least 1 credit to deploy.' } };
    }

    // Check name uniqueness
    const { data: existing } = await c.from('deployments')
      .select('id').eq('owner_id', profile.id).eq('name', payload.name).maybeSingle();
    if (existing) throw { data: { error: `App name "${payload.name}" already exists.` } };

    const newDep = {
      owner_id:    profile.id,
      name:        payload.name,
      slug:        `${payload.name}-${profile.id.slice(0,8)}`,
      source_type: payload.sourceType || 'git',
      repo_url:    payload.repoUrl    || null,
      branch:      payload.branch     || 'main',
      framework:   payload.framework  || null,
      start_cmd:   payload.startCmd,
      build_cmd:   payload.buildCmd   || null,
      port:        payload.port       || 3000,
      env_vars_enc: payload.envVars ? JSON.stringify(payload.envVars) : null,
      status:      'pending',
    };

    const { data, error } = await c.from('deployments').insert(newDep).select().single();
    if (error) throw { data: { error: error.message } };
    return { data };
  },

  async restart(id) {
    const c = await sb();
    // In v14, restart increments a counter and sets status to pending
    const { data: current } = await c.from('deployments').select('restart_count').eq('id', id).single();
    const newCount = (current?.restart_count || 0) + 1;

    const { data, error } = await c.from('deployments')
      .update({
        status: 'pending',
        restart_count: newCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', id).select().single();
    if (error) throw { data: { error: error.message } };
    return { data };
  },

  async redeploy(id) {
    const c = await sb();
    const { data, error } = await c.from('deployments')
      .update({ status: 'pending', updated_at: new Date().toISOString() })
      .eq('id', id).select().single();
    if (error) throw { data: { error: error.message } };
    return { data };
  },

  async stop(id) {
    const c = await sb();
    const { data, error } = await c.from('deployments')
      .update({ status: 'stopped', updated_at: new Date().toISOString() })
      .eq('id', id).select().single();
    if (error) throw { data: { error: error.message } };
    return { data };
  },

  async remove(id) {
    const c = await sb();
    const { error } = await c.from('deployments')
      .update({ status: 'deleted', updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw { data: { error: error.message } };
    return { data: { success: true } };
  },

  async getBuildLogs(id, limit = 200) {
    const c = await sb();
    const { data, error } = await c.from('build_logs')
      .select('*').eq('deployment_id', id)
      .order('created_at', { ascending: true }).limit(limit);
    if (error) return { data: { logs: [] } };
    return { data: { logs: data || [] } };
  },

  async subscribeLogs(deploymentId, callback) {
    const c = await sb();
    const channel = c.channel(`logs:${deploymentId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public',
        table: 'build_logs', filter: `deployment_id=eq.${deploymentId}`,
      }, payload => callback(payload.new))
      .subscribe();
    return () => c.removeChannel(channel);
  },

  async subscribeStatus(deploymentId, callback) {
    const c = await sb();
    const filter = deploymentId ? `id=eq.${deploymentId}` : undefined;
    const ch = c.channel(`deploy-status${deploymentId ? ':' + deploymentId : ':all'}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public',
        table: 'deployments', ...(filter ? { filter } : {}),
      }, payload => callback(payload.new))
      .subscribe();
    return () => c.removeChannel(ch);
  },
};

// ══════════════════════════════════════════════════════════════════
// CREDITS  — returns { data: { balance, expiringCredits, transactions } }
// ══════════════════════════════════════════════════════════════════
export const creditsSB = {
  async getBalance() {
    const profile = await getProfile(true);
    const c = await sb();
    // Expiring credits in 7 days
    const soon = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: exp } = await c.from('credits')
      .select('*').eq('user_id', profile.id)
      .gt('remaining', 0).lt('expires_at', soon)
      .order('expires_at', { ascending: true });
    return {
      data: {
        balance: profile.credit_balance ?? 0,
        expiringCredits: exp || [],
      },
    };
  },

  async getTransactions(limit = 20) {
    const c       = await sb();
    const profile = await getProfile();
    const { data, error } = await c.from('transactions')
      .select('*').eq('user_id', profile.id)
      .order('created_at', { ascending: false }).limit(limit);
    if (error) throw { data: { error: error.message } };
    return { data: { transactions: data || [] } };
  },
};

// ══════════════════════════════════════════════════════════════════
// PAYMENTS (QR-based)
// ══════════════════════════════════════════════════════════════════
export const paymentSB = {
  async submitRequest({ packId, amountInr, creditsRequested, screenshotBase64, upiRef }) {
    const c       = await sb();
    const profile = await getProfile();

    // Upload screenshot to Supabase Storage
    let screenshotUrl = null;
    if (screenshotBase64) {
      const fileName = `payments/${profile.id}/${Date.now()}.jpg`;
      const blob = await fetch(screenshotBase64).then(r => r.blob());
      const { data: upload, error: upErr } = await c.storage
        .from('payment-screenshots')
        .upload(fileName, blob, { contentType: 'image/jpeg', upsert: false });
      if (upErr) {
        // Continue without screenshot if storage not configured
        console.warn('Screenshot upload failed:', upErr.message);
      } else {
        const { data: urlData } = c.storage.from('payment-screenshots').getPublicUrl(fileName);
        screenshotUrl = urlData?.publicUrl || null;
      }
    }

    const { data, error } = await c.from('payment_requests').insert({
      user_id:             profile.id,
      amount_inr:          amountInr,
      credits_requested:   creditsRequested,
      pack_id:             packId,
      screenshot_url:      screenshotUrl,
      upi_ref:             upiRef || null,
      status:              'pending',
    }).select().single();

    if (error) throw { data: { error: error.message } };
    return { data };
  },

  async getMyRequests() {
    const c       = await sb();
    const profile = await getProfile();
    const { data, error } = await c.from('payment_requests')
      .select('*').eq('user_id', profile.id)
      .order('created_at', { ascending: false });
    if (error) throw { data: { error: error.message } };
    return { data: { requests: data || [] } };
  },
};

// ══════════════════════════════════════════════════════════════════
// AI
// ══════════════════════════════════════════════════════════════════
export const aiSB = {
  async execute({ task, context, deploymentId, history, confirmed }) {
    const c = await sb();
    const session = await c.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) throw { data: { error: 'Not authenticated' } };

    try {
      const { data, error } = await c.functions.invoke('ai-execute', {
        body: { task, context, deploymentId, history, confirmed },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (error) throw { data: { error: error.message } };
      return { data };
    } catch (err) {
      // Fallback: return helpful message if edge function not deployed
      if (err?.data?.error?.includes('FunctionsError') || err.message?.includes('non-2xx')) {
        return {
          data: {
            content: `AI Edge Function not configured yet.\n\nTo enable AI features, deploy the 'ai-execute' Supabase Edge Function.\n\nSee: https://supabase.com/docs/guides/functions`,
          },
        };
      }
      throw err;
    }
  },
};

// ══════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════
export const notificationsSB = {
  async list(limit = 20) {
    const c       = await sb();
    const profile = await getProfile();
    const { data, error } = await c.from('notifications')
      .select('*').eq('user_id', profile.id)
      .order('created_at', { ascending: false }).limit(limit);
    if (error) return { data: [] };
    return { data: data || [] };
  },

  async markRead(id) {
    const c = await sb();
    await c.from('notifications').update({ is_read: true }).eq('id', id);
  },

  // Subscribe without userId param — gets from session
  subscribe(callback) {
    getProfile().then(profile => {
      sb().then(c => {
        c.channel(`notifs:${profile.id}`)
          .on('postgres_changes', {
            event: 'INSERT', schema: 'public',
            table: 'notifications', filter: `user_id=eq.${profile.id}`,
          }, payload => callback(payload.new))
          .subscribe();
      });
    }).catch(() => { /* not logged in */ });
  },
};

// ══════════════════════════════════════════════════════════════════
// ADMIN (requires admin role in public.users)
// ══════════════════════════════════════════════════════════════════
export const adminSB = {
  async verifyAdmin() {
    const profile = await getProfile(true);
    if (!profile?.roles?.some(r => ['admin','superadmin'].includes(r))) {
      throw { data: { error: 'Access denied: admin only' } };
    }
    return profile;
  },

  async getStats() {
    const c = await sb();
    await this.verifyAdmin();
    const [users, deploys, running, pending_payments] = await Promise.all([
      c.from('users').select('id', { count: 'exact', head: true }),
      c.from('deployments').select('id', { count: 'exact', head: true }).neq('status','deleted'),
      c.from('deployments').select('id', { count: 'exact', head: true }).eq('status','running'),
      c.from('payment_requests').select('id', { count: 'exact', head: true }).eq('status','pending'),
    ]);
    // Today signups
    const today = new Date(); today.setHours(0,0,0,0);
    const { count: todayUsers } = await c.from('users')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    return {
      data: {
        total_users:       users.count       || 0,
        new_today:         todayUsers        || 0,
        total_deploys:     deploys.count     || 0,
        running_deploys:   running.count     || 0,
        pending_payments:  pending_payments.count || 0,
      },
    };
  },

  async getUsers({ page = 0, limit = 20, search = '' } = {}) {
    const c = await sb();
    await this.verifyAdmin();
    let q = c.from('users').select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);
    if (search) q = q.or(`email.ilike.%${search}%,username.ilike.%${search}%`);
    const { data, error, count } = await q;
    if (error) throw { data: { error: error.message } };
    return { data: { users: data || [], total: count || 0 } };
  },

  async banUser(userId, ban) {
    const c = await sb();
    await this.verifyAdmin();
    const { error } = await c.from('users')
      .update({ is_banned: ban, ban_reason: ban ? 'Admin ban' : null })
      .eq('id', userId);
    if (error) throw { data: { error: error.message } };
    return { data: { success: true } };
  },

  async grantCredits(userId, amount, description) {
    const c = await sb();
    await this.verifyAdmin();
    const { error } = await c.rpc('add_credits', {
      p_user_id:    userId,
      p_amount:     amount,
      p_source:     'admin_grant',
      p_description: description || `Admin grant: ${amount} credits`,
    });
    if (error) throw { data: { error: error.message } };
    return { data: { success: true } };
  },

  async getPaymentRequests({ status = 'pending' } = {}) {
    const c = await sb();
    await this.verifyAdmin();
    let q = c.from('payment_requests')
      .select('*, users(username, email, credit_balance)')
      .order('created_at', { ascending: false });
    if (status !== 'all') q = q.eq('status', status);
    const { data, error } = await q;
    if (error) throw { data: { error: error.message } };
    return { data: { requests: data || [] } };
  },

  async approvePayment(requestId, adminNote = '') {
    const c = await sb();
    const admin = await this.verifyAdmin();

    // Get request
    const { data: req, error: reqErr } = await c.from('payment_requests')
      .select('*').eq('id', requestId).single();
    if (reqErr || !req) throw { data: { error: 'Payment request not found' } };
    if (req.status !== 'pending') throw { data: { error: 'Already processed' } };

    // Grant credits
    const { error: credErr } = await c.rpc('add_credits', {
      p_user_id:     req.user_id,
      p_amount:      req.credits_requested,
      p_source:      'purchase',
      p_description: `Payment ₹${req.amount_inr} approved — ${req.credits_requested} credits`,
      p_expires_at:  new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    });
    if (credErr) throw { data: { error: credErr.message } };

    // Update request status
    const { error: updErr } = await c.from('payment_requests').update({
      status:      'approved',
      admin_note:  adminNote,
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
    }).eq('id', requestId);
    if (updErr) throw { data: { error: updErr.message } };

    // Notify user
    await c.from('notifications').insert({
      user_id: req.user_id,
      type:    'success',
      title:   'Payment Approved! 🎉',
      message: `₹${req.amount_inr} payment approved. ${req.credits_requested} credits added to your account.`,
    });

    return { data: { success: true } };
  },

  async rejectPayment(requestId, adminNote = '') {
    const c = await sb();
    const admin = await this.verifyAdmin();
    const { error } = await c.from('payment_requests').update({
      status:      'rejected',
      admin_note:  adminNote,
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
    }).eq('id', requestId);
    if (error) throw { data: { error: error.message } };

    // Get req for notification
    const { data: req } = await c.from('payment_requests').select('user_id,amount_inr').eq('id',requestId).single();
    if (req) {
      await c.from('notifications').insert({
        user_id: req.user_id,
        type:    'error',
        title:   'Payment Review',
        message: `Your ₹${req.amount_inr} payment could not be verified. Note: ${adminNote || 'Contact support.'}`,
      });
    }
    return { data: { success: true } };
  },

  async broadcast({ message, type = 'info' }) {
    const c = await sb();
    const admin = await this.verifyAdmin();
    const { data: br, error } = await c.from('broadcasts').insert({
      admin_id: admin.id, type, message,
    }).select().single();
    if (error) throw { data: { error: error.message } };

    // Get all non-banned users
    const { data: users } = await c.from('users').select('id').eq('is_banned', false);
    if (users?.length) {
      const notifs = users.map(u => ({
        user_id: u.id, type, title: 'System Announcement', message,
        data: { broadcast_id: br.id },
      }));
      for (let i = 0; i < notifs.length; i += 100) {
        await c.from('notifications').insert(notifs.slice(i, i + 100));
      }
    }
    return { data: br };
  },

  // Admin login: checks Supabase auth + verifies admin role
  async adminLogin(email, password) {
    const c = await sb();
    clearCache();
    const { data, error } = await c.auth.signInWithPassword({ email, password });
    if (error) throw { data: { error: 'Invalid credentials' } };
    const profile = await getProfile(true);
    if (!profile?.roles?.some(r => ['admin','superadmin'].includes(r))) {
      await c.auth.signOut();
      clearCache();
      throw { data: { error: 'Access denied: not an admin account' } };
    }
    return { data: { profile, session: data.session } };
  },
};

// ── Referral handler (internal) ───────────────────────────────────
async function _handleReferral(newUserAuthId, referralCode) {
  try {
    const c = await sb();
    const { data: referrer } = await c.from('users').select('id')
      .eq('referral_code', referralCode.toUpperCase().trim()).maybeSingle();
    if (!referrer) return;
    const { data: newUser } = await c.from('users').select('id')
      .eq('auth_id', newUserAuthId).maybeSingle();
    if (!newUser) return;
    await c.from('referrals').insert({ referrer_id: referrer.id, referred_id: newUser.id });
    await c.from('users').update({ referred_by: referrer.id }).eq('id', newUser.id);
    // Give referrer bonus
    await c.rpc('add_credits', {
      p_user_id: referrer.id, p_amount: 0.5,
      p_source: 'referral', p_description: 'Referral bonus: 0.5 credits',
    });
  } catch (e) { console.warn('Referral handling failed:', e); }
}

// ── Export ────────────────────────────────────────────────────────
export { getProfile, clearCache, sb as getSupabaseClient };
export default { authSB, profileSB, deploymentsSB, creditsSB, paymentSB, aiSB, notificationsSB, adminSB };
