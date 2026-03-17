/**
 * EliteHosting — Settings Page JS
 */
import { auth } from '../core/auth.js';
import { profileSB, authSB } from '../core/supabase.js';
import { toast } from '../components/toast.js';
import { modal } from '../components/modal.js';

document.addEventListener('DOMContentLoaded', async () => {
  await auth.requireAuth();
  initSidebar();
  initTabs();
  await loadProfile();
});

function initSidebar() {
  document.getElementById('sidebarToggle')?.addEventListener('click', () =>
    document.getElementById('sidebar')?.classList.toggle('mobile-open')
  );
  document.querySelectorAll('.nav-item[href]').forEach(a =>
    a.classList.toggle('active', a.getAttribute('href') === location.pathname)
  );
}

function initTabs() {
  document.querySelectorAll('[data-settings-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-settings-tab]').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('[data-settings-panel]').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(`[data-settings-panel="${btn.dataset.settingsTab}"]`)?.classList.add('active');
    });
  });
}

async function loadProfile() {
  try {
    const { data: profile } = await profileSB.getMe();

    // Populate profile fields
    setVal('settingUsername',    profile.username);
    setVal('settingDisplayName', profile.display_name || profile.username);
    setVal('settingEmail',       profile.email);
    setText('settingEmailDisplay', profile.email);
    setText('settingCreatedAt',  new Date(profile.created_at).toLocaleDateString('en-IN', { year:'numeric', month:'long', day:'numeric' }));

    // Referral
    setText('myReferralCode', profile.referral_code || '—');
    const refLink = `https://www.elitehosting.in/auth/register.html?ref=${profile.referral_code || ''}`;
    setText('referralLink', refLink);

    // Telegram linked?
    if (profile.telegram_username) {
      setText('telegramStatus', '@' + profile.telegram_username);
      document.getElementById('telegramLinked')?.style.removeProperty('display');
      document.getElementById('telegramUnlinked')?.style.setProperty('display', 'none');
    }

    initProfileForm(profile);
    initPasswordForm();
    initTelegramLink(profile);
    initDangerZone(profile);
    initReferral(profile);
  } catch {
    toast.error('Failed to load settings');
  }
}

function initProfileForm(profile) {
  const form = document.getElementById('profileForm');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const displayName = document.getElementById('settingDisplayName')?.value.trim();
    const btn = form.querySelector('[type="submit"]');
    btn.classList.add('btn-loading'); btn.disabled = true;

    try {
      await profileSB.updateProfile({ display_name: displayName });
      toast.success('✅ Profile updated!');
    } catch (err) {
      toast.error(err?.data?.error || 'Update failed');
    } finally {
      btn.classList.remove('btn-loading'); btn.disabled = false;
    }
  });
}

function initPasswordForm() {
  const form = document.getElementById('passwordForm');
  const passEl = document.getElementById('newPassword');
  const segs = document.querySelectorAll('[data-pass-seg]');

  passEl?.addEventListener('input', () => {
    const str = calcStrength(passEl.value);
    segs.forEach((seg, i) => {
      seg.className = `strength-seg${i < str ? ` active-${str}` : ''}`;
    });
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const current = document.getElementById('currentPassword')?.value;
    const newPass  = passEl?.value;
    const confirm  = document.getElementById('confirmPassword')?.value;

    if (newPass !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (calcStrength(newPass) < 2) {
      toast.error('Password too weak');
      return;
    }

    const btn = form.querySelector('[type="submit"]');
    btn.classList.add('btn-loading'); btn.disabled = true;

    try {
      await authSB.updatePassword(newPass);
      toast.success('✅ Password changed!');
      form.reset();
    } catch (err) {
      toast.error(err?.data?.error || 'Password change failed');
    } finally {
      btn.classList.remove('btn-loading'); btn.disabled = false;
    }
  });
}

function initTelegramLink(profile) {
  const btn = document.getElementById('btnLinkTelegram');
  if (!btn) return;

  // Generate one-time link token
  btn.addEventListener('click', async () => {
    btn.classList.add('btn-loading'); btn.disabled = true;
    try {
      const { data } = await profileSB.linkTelegram();
      const url = `https://t.me/elitehosting_bot?start=${data.token}`;
      await modal.alert(`
        <p style="margin-bottom:var(--s4);color:var(--text-secondary)">
          Click the button below to open Telegram and link your account.
          Or copy this link:
        </p>
        <div style="display:flex;align-items:center;gap:var(--s3);background:var(--color-surface-2);padding:var(--s3);border-radius:var(--r-md);margin-bottom:var(--s4)">
          <code style="flex:1;font-size:11px;word-break:break-all;color:var(--electric)">${url}</code>
          <button class="btn btn-ghost btn-sm" onclick="navigator.clipboard.writeText('${url}');event.target.textContent='✅'">📋</button>
        </div>
        <a href="${url}" target="_blank" class="btn btn-electric btn-md w-full">Open Telegram Bot →</a>
      `, 'Link Telegram');
    } catch {
      toast.error('Failed to generate Telegram link token');
    } finally {
      btn.classList.remove('btn-loading'); btn.disabled = false;
    }
  });
}

function initReferral(profile) {
  const code = profile.referral_code || '';
  const link = `https://www.elitehosting.in/auth/register.html?ref=${code}`;

  document.getElementById('btnCopyReferral')?.addEventListener('click', () => {
    navigator.clipboard.writeText(link);
    toast.success('Referral link copied! 🎉');
  });

  document.getElementById('btnShareReferral')?.addEventListener('click', () => {
    if (navigator.share) {
      navigator.share({ title: 'EliteHosting.in', text: 'India ka best app hosting! 2 free credits on signup.', url: link });
    } else {
      navigator.clipboard.writeText(link);
      toast.success('Link copied!');
    }
  });

  // Load referral stats
  loadReferralStats();
}

async function loadReferralStats() {
  // Referral stats placeholder — would come from a Supabase query
  setText('refEarned', '—');
  setText('refPending', '—');
  setText('refTotal',   '—');
}

function initDangerZone(profile) {
  document.getElementById('btnSignOutAll')?.addEventListener('click', async () => {
    const ok = await modal.confirm('Sign out from all devices?', { title: 'Sign Out Everywhere', okText: 'Sign Out All' });
    if (!ok) return;
    try {
      await authSB.signOut();
      location.href = '/auth/login.html';
    } catch { toast.error('Failed'); }
  });

  document.getElementById('btnDeleteAccount')?.addEventListener('click', async () => {
    const ok = await modal.confirm(
      `<strong style="color:var(--error)">Permanently delete your account?</strong><br><br>
       All deployments, credits, and data will be deleted. This cannot be undone.`,
      { title: '⚠️ Delete Account', danger: true, okText: 'Delete My Account' }
    );
    if (!ok) return;
    toast.warn('Account deletion is processed within 48 hours. Contact support@elitehosting.in');
  });
}

/* ── Helpers ─────────────────────────────────────────────────────── */
function calcStrength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}
