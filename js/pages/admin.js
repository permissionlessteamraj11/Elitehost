/**
 * EliteHosting — Admin Panel JS
 */
import { auth } from '../core/auth.js';
import { adminSB } from '../core/supabase.js';
import { toast } from '../components/toast.js';
import { modal } from '../components/modal.js';

document.addEventListener('DOMContentLoaded', async () => {
  await auth.requireAdmin();
  initSidebar();
  initTabs();
  await loadStats();
  await loadUsers();
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
  document.querySelectorAll('[data-admin-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-admin-tab]').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('[data-admin-panel]').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = btn.dataset.adminTab;
      document.querySelector(`[data-admin-panel="${panel}"]`)?.classList.add('active');
      if (panel === 'deployments') loadAdminDeploys();
      if (panel === 'broadcast')   initBroadcast();
    });
  });
}

/* ── Stats ─────────────────────────────────────────────────────── */
async function loadStats() {
  try {
    const { data } = await adminSB.getStats();
    setText('statTotalUsers',    (data.total_users   || 0).toLocaleString('en-IN'));
    setText('statTodayUsers',    '+' + (data.new_today   || 0));
    setText('statRunning',       (data.running_deploys || 0).toLocaleString('en-IN'));
    setText('statTotalDeploys',  (data.total_deploys   || 0).toLocaleString('en-IN'));
    setText('statQueueLen',      (data.queue_length     || 0));
    setText('statRevenue',       '₹' + (data.revenue_month || 0).toLocaleString('en-IN'));
    setText('statActiveUsers',   (data.active_users_today || 0).toLocaleString('en-IN'));
  } catch {
    toast.error('Failed to load admin stats');
  }
}

/* ── Users ─────────────────────────────────────────────────────── */
let usersPage = 0;
async function loadUsers(page = 0) {
  const container = document.getElementById('usersList');
  if (!container) return;

  if (page === 0) showSkeleton(container, 5);

  const search = document.getElementById('userSearch')?.value.trim() || '';

  try {
    const { data } = await adminSB.getUsers({ page, search, limit: 20 });
    const users = data?.users || [];
    const total = data?.total || 0;

    if (!users.length) {
      container.innerHTML = `<div class="card" style="text-align:center;padding:var(--s8);color:var(--text-muted)">No users found</div>`;
      return;
    }

    container.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--s4)">
        <p style="color:var(--text-muted);font-size:var(--text-sm)">${total.toLocaleString('en-IN')} users</p>
        <div style="display:flex;gap:var(--s3)">
          <button class="btn btn-ghost btn-sm" id="prevPage" ${page === 0 ? 'disabled' : ''}>← Prev</button>
          <span style="color:var(--text-muted);font-size:var(--text-sm);align-self:center">Page ${page + 1}</span>
          <button class="btn btn-ghost btn-sm" id="nextPage" ${users.length < 20 ? 'disabled' : ''}>Next →</button>
        </div>
      </div>
      <div class="card" style="overflow:hidden;padding:0">
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:var(--color-surface-2)">
              <th style="padding:12px 16px;text-align:left;font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:600">User</th>
              <th style="padding:12px 16px;text-align:left;font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:600">Credits</th>
              <th style="padding:12px 16px;text-align:left;font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:600">Deploys</th>
              <th style="padding:12px 16px;text-align:left;font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:600">Joined</th>
              <th style="padding:12px 16px;text-align:left;font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:600">Status</th>
              <th style="padding:12px 16px;text-align:right;font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:600">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => renderUserRow(u)).join('')}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('prevPage')?.addEventListener('click', () => loadUsers(page - 1));
    document.getElementById('nextPage')?.addEventListener('click', () => loadUsers(page + 1));
    usersPage = page;

    // User action buttons
    container.querySelectorAll('[data-user-action]').forEach(btn => {
      btn.addEventListener('click', () => handleUserAction(btn.dataset.userAction, btn.dataset.userId, btn.dataset.username));
    });
  } catch {
    container.innerHTML = `<div class="card" style="color:var(--error);padding:var(--s5)">Failed to load users.</div>`;
  }
}

function renderUserRow(u) {
  const joined = new Date(u.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  const isBanned = u.is_banned;
  return `
    <tr style="border-bottom:1px solid var(--border)">
      <td style="padding:12px 16px">
        <div style="font-weight:600;font-size:var(--text-sm)">${escHtml(u.username)}</div>
        <div style="font-size:11px;color:var(--text-muted)">${escHtml(u.email)}</div>
      </td>
      <td style="padding:12px 16px;font-family:var(--font-mono);color:var(--electric)">
        ${parseFloat(u.credit_balance || 0).toFixed(2)}
      </td>
      <td style="padding:12px 16px;color:var(--text-muted);font-size:var(--text-sm)">
        ${u.deploy_count || 0}
      </td>
      <td style="padding:12px 16px;font-size:var(--text-xs);color:var(--text-muted)">${joined}</td>
      <td style="padding:12px 16px">
        ${isBanned
          ? `<span class="badge badge-failed">🚫 Banned</span>`
          : `<span class="badge badge-running">✅ Active</span>`
        }
      </td>
      <td style="padding:12px 16px;text-align:right">
        <div style="display:flex;gap:var(--s2);justify-content:flex-end">
          <button class="btn btn-ghost btn-xs" data-user-action="credits" data-user-id="${u.id}" data-username="${escHtml(u.username)}" title="Grant Credits">💳</button>
          <button class="btn btn-${isBanned ? 'electric' : 'danger'} btn-xs"
                  data-user-action="${isBanned ? 'unban' : 'ban'}" data-user-id="${u.id}" data-username="${escHtml(u.username)}"
                  title="${isBanned ? 'Unban' : 'Ban'} user">
            ${isBanned ? '✅' : '🚫'}
          </button>
        </div>
      </td>
    </tr>
  `;
}

async function handleUserAction(action, userId, username) {
  if (action === 'credits') {
    const amount = await promptCredits(username);
    if (!amount) return;
    try {
      await adminSB.grantCredits(userId, amount, 'Admin grant');
      toast.success(`✅ Granted ${amount} credits to @${username}`);
      loadUsers(usersPage);
    } catch { toast.error('Failed to grant credits'); }
  }
  else if (action === 'ban') {
    const ok = await modal.confirm(
      `Ban <strong>@${escHtml(username)}</strong>? They won't be able to login.`,
      { title: 'Ban User', danger: true, okText: '🚫 Ban User' }
    );
    if (!ok) return;
    try {
      await adminSB.banUser(userId, true);
      toast.success(`@${username} banned`);
      loadUsers(usersPage);
    } catch { toast.error('Failed to ban user'); }
  }
  else if (action === 'unban') {
    try {
      await adminSB.banUser(userId, false);
      toast.success(`@${username} unbanned`);
      loadUsers(usersPage);
    } catch { toast.error('Failed to unban user'); }
  }
}

async function promptCredits(username) {
  return new Promise(resolve => {
    modal.open({
      title: `Grant Credits — @${escHtml(username)}`,
      content: `
        <div class="input-group">
          <label class="input-label" for="grantAmount">Amount (credits)</label>
          <input type="number" id="grantAmount" class="input" min="0.1" max="100" step="0.5" value="5" placeholder="e.g. 5">
          <span class="input-hint">1 credit = 1 week of 1 running deployment</span>
        </div>
        <div class="input-group" style="margin-top:var(--s4)">
          <label class="input-label" for="grantReason">Reason</label>
          <input type="text" id="grantReason" class="input" placeholder="Refund, support, etc.">
        </div>
      `,
      footer: `
        <button class="btn btn-ghost btn-md" id="cancelGrant">Cancel</button>
        <button class="btn btn-electric btn-md" id="confirmGrant">Grant Credits</button>
      `,
      onClose: () => resolve(null),
    });
    document.getElementById('cancelGrant')?.addEventListener('click', () => { modal.close(); resolve(null); });
    document.getElementById('confirmGrant')?.addEventListener('click', () => {
      const amount = parseFloat(document.getElementById('grantAmount')?.value);
      if (!amount || amount <= 0) { toast.warn('Enter a valid amount'); return; }
      modal.close();
      resolve(amount);
    });
  });
}

/* ── Admin Deploys ──────────────────────────────────────────────── */
async function loadAdminDeploys() {
  const container = document.getElementById('adminDeploysList');
  if (!container) return;
  showSkeleton(container, 5);
  try {
    // Uses adminSB to get all deployments (bypasses RLS)
    // In a real implementation, this would call an admin edge function
    container.innerHTML = `<div class="card" style="text-align:center;padding:var(--s8);color:var(--text-muted)">
      Admin deployments view — connect to your Supabase Edge Function.
    </div>`;
  } catch { container.innerHTML = `<div style="color:var(--error)">Failed to load</div>`; }
}

/* ── Broadcast ──────────────────────────────────────────────────── */
function initBroadcast() {
  const form = document.getElementById('broadcastForm');
  if (!form || form.dataset.initialized) return;
  form.dataset.initialized = 'true';

  const preview = document.getElementById('broadcastPreview');
  const msgInput = document.getElementById('broadcastMsg');
  msgInput?.addEventListener('input', () => {
    if (preview) preview.innerHTML = msgInput.value.replace(/\n/g, '<br>');
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const type  = document.querySelector('[data-broadcast-type].active')?.dataset.broadcastType || 'info';
    const msg   = msgInput?.value.trim();
    if (!msg) { toast.warn('Message required'); return; }

    const totalEl = document.getElementById('broadcastTotal');
    // Estimate recipients
    const total = parseInt(document.getElementById('statTotalUsers')?.textContent?.replace(/,/g,'')) || 0;

    const ok = await modal.confirm(
      `Send broadcast to <strong>~${total.toLocaleString('en-IN')} users</strong>?`,
      { title: '📢 Send Broadcast', okText: 'Send Now' }
    );
    if (!ok) return;

    const btn = form.querySelector('[type="submit"]');
    btn.classList.add('btn-loading'); btn.disabled = true;

    try {
      await adminSB.broadcast({ type, message: msg });
      toast.success('📢 Broadcast sent!');
      form.reset();
      if (preview) preview.innerHTML = '';
    } catch {
      toast.error('Broadcast failed');
    } finally {
      btn.classList.remove('btn-loading'); btn.disabled = false;
    }
  });

  // Type buttons
  document.querySelectorAll('[data-broadcast-type]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-broadcast-type]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// User search
document.getElementById('userSearch')?.addEventListener('input', () => {
  clearTimeout(window._searchTimeout);
  window._searchTimeout = setTimeout(() => loadUsers(0), 400);
});

document.getElementById('btnRefreshStats')?.addEventListener('click', loadStats);

/* ── Helpers ─────────────────────────────────────────────────────── */
function showSkeleton(el, n) {
  el.innerHTML = Array(n).fill(0).map(() =>
    `<div class="card" style="padding:var(--s4)">
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text" style="width:60%"></div>
    </div>`
  ).join('');
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

async function loadAdminDeploys() {
  // alias
}
