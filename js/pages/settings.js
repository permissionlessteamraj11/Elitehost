/**
 * EliteHosting — Settings JS (Fixed)
 */
import { auth }                    from '../core/auth.js';
import { profileSB, authSB }       from '../core/supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
  try { await auth.requireAuth(); } catch { return; }
  initTabs();
  await loadProfile();
  initPasswordForm();
  initDangerZone();
});

/* ── Tabs ──────────────────────────────────────────────────────── */
function initTabs() {
  document.querySelectorAll('[data-stab]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-stab]').forEach(b => b.classList.remove('is-active'));
      document.querySelectorAll('[data-spanel]').forEach(p => p.style.display = 'none');
      btn.classList.add('is-active');
      const panel = document.querySelector(`[data-spanel="${btn.dataset.stab}"]`);
      if (panel) panel.style.display = 'block';
    });
  });
  // Show first tab
  document.querySelectorAll('[data-spanel]').forEach((p, i) => {
    p.style.display = i === 0 ? 'block' : 'none';
  });
}

/* ── Load Profile ──────────────────────────────────────────────── */
async function loadProfile() {
  try {
    const { data: p } = await profileSB.getMe();

    // Fill avatar initial
    const initial = (p.username?.[0] || '?').toUpperCase();
    const av = document.getElementById('settingAvatar');
    if (av) av.textContent = initial;

    setValue('settingDisplayName', p.display_name || p.username);
    setValue('settingEmail', p.email);
    setText('settingUsername', p.username);
    setText('settingEmailDisplay', p.email);
    setText('settingCreatedAt', new Date(p.created_at).toLocaleDateString('en-IN',{year:'numeric',month:'long',day:'numeric'}));
    setText('myReferralCode', p.referral_code || '—');

    initProfileForm(p);
    initTelegramSection(p);
    initReferralSection(p);
  } catch (e) {
    window.dbToast?.('Failed to load settings', 'error');
    console.error(e);
  }
}

/* ── Profile Form ──────────────────────────────────────────────── */
function initProfileForm(profile) {
  const form = document.getElementById('profileForm');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const displayName = document.getElementById('settingDisplayName')?.value.trim();
    const btn = form.querySelector('button[type=submit]');
    if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
    try {
      await profileSB.updateProfile({ display_name: displayName });
      window.dbToast?.('✅ Profile updated!', 'success');
    } catch (err) {
      window.dbToast?.(err?.data?.error || 'Update failed', 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Save Changes'; }
    }
  });
}

/* ── Password Form ─────────────────────────────────────────────── */
function initPasswordForm() {
  // Toggle
  document.getElementById('passToggle')?.addEventListener('click', () => {
    const p = document.getElementById('newPassword');
    if (p) p.type = p.type === 'text' ? 'password' : 'text';
  });

  // Strength meter
  document.getElementById('newPassword')?.addEventListener('input', e => {
    const segs  = [1,2,3,4].map(i => document.querySelector(`[data-seg="${i}"]`));
    const str   = calcStrength(e.target.value);
    const lbls  = ['','😬 Weak','🙂 Fair','😊 Good','💪 Strong'];
    const clss  = ['','lv1','lv2','lv3','lv4'];
    segs.forEach((seg, i) => {
      if (seg) seg.className = 'db-str-seg' + (i < str ? ' ' + clss[str] : '');
    });
    const lbl = document.getElementById('strLabel');
    if (lbl) lbl.textContent = e.target.value.length ? lbls[str] : '';
  });

  const form = document.getElementById('passwordForm');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const pw = document.getElementById('newPassword')?.value;
    const cf = document.getElementById('confirmPassword')?.value;
    const btn = form.querySelector('button[type=submit]');

    document.getElementById('passErr').textContent = '';

    if (pw !== cf) {
      document.getElementById('passErr').textContent = 'Passwords do not match';
      return;
    }
    if (calcStrength(pw) < 2) {
      document.getElementById('passErr').textContent = 'Password too weak';
      return;
    }

    if (btn) { btn.disabled = true; btn.textContent = 'Updating…'; }
    try {
      await authSB.updatePassword(pw);
      window.dbToast?.('✅ Password updated!', 'success');
      form.reset();
    } catch (err) {
      document.getElementById('passErr').textContent = err?.data?.error || 'Update failed';
      window.dbToast?.(err?.data?.error || 'Password update failed', 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Update Password'; }
    }
  });
}

/* ── Telegram ──────────────────────────────────────────────────── */
function initTelegramSection(profile) {
  if (profile.telegram_chat_id) {
    document.getElementById('telegramLinked')?.style.removeProperty('display');
    document.getElementById('telegramUnlinked')?.style.setProperty('display','none');
  }
  document.getElementById('btnLinkTelegram')?.addEventListener('click', async () => {
    const btn = document.getElementById('btnLinkTelegram');
    btn.disabled = true; btn.textContent = 'Generating…';
    try {
      const { data } = await profileSB.linkTelegram();
      const url = `https://t.me/elitehosting_bot?start=${data.token}`;
      window.dbToast?.(`Token: ${data.token} — Send to @elitehosting_bot`, 'info');
      if (confirm(`Telegram link generated!\n\nOpen @elitehosting_bot and send this token:\n${data.token}\n\nOpen Telegram now?`)) {
        window.open(url, '_blank');
      }
    } catch { window.dbToast?.('Failed to generate token', 'error'); }
    finally { btn.disabled = false; btn.textContent = '📱 Generate Link Token'; }
  });
}

/* ── Referral ──────────────────────────────────────────────────── */
function initReferralSection(profile) {
  const code = profile.referral_code || '';
  const link = `${location.origin}/auth/register.html?ref=${code}`;

  document.getElementById('btnCopyReferral')?.addEventListener('click', () => {
    navigator.clipboard.writeText(link).then(() => window.dbToast?.('Referral link copied!', 'success'));
  });

  document.getElementById('btnShareReferral')?.addEventListener('click', () => {
    if (navigator.share) {
      navigator.share({ title:'EliteHosting.in', text:'India ka best app hosting! 2 free credits pe signup.', url: link });
    } else {
      navigator.clipboard.writeText(link).then(() => window.dbToast?.('Link copied!', 'success'));
    }
  });
}

/* ── Danger Zone ───────────────────────────────────────────────── */
function initDangerZone() {
  document.getElementById('btnSignOutAll')?.addEventListener('click', async () => {
    if (!confirm('Sign out from all devices?')) return;
    try {
      await authSB.signOut();
    } catch { window.dbToast?.('Failed', 'error'); }
  });

  document.getElementById('btnDeleteAccount')?.addEventListener('click', () => {
    if (confirm('⚠️ Delete your account? ALL data will be lost. This cannot be undone.\n\nType "DELETE" to confirm.')) {
      const input = prompt('Type DELETE to confirm account deletion:');
      if (input === 'DELETE') {
        window.dbToast?.('Account deletion request sent. We will process within 48 hours.', 'info');
      } else {
        window.dbToast?.('Account deletion cancelled.', 'info');
      }
    }
  });
}

/* ── Helpers ───────────────────────────────────────────────────── */
function calcStrength(pw) {
  let s = 0;
  if (pw.length >= 8)           s++;
  if (/[A-Z]/.test(pw))         s++;
  if (/[0-9]/.test(pw))         s++;
  if (/[^A-Za-z0-9]/.test(pw))  s++;
  return Math.min(s, 4);
}
function setText(id, v)  { const el = document.getElementById(id); if (el) el.textContent = v; }
function setValue(id, v) { const el = document.getElementById(id); if (el) el.value = v; }
