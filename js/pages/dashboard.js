/**
 * EliteHosting — Dashboard Overview JS
 */
import { auth } from '../core/auth.js';
import { profileSB, deploymentsSB, creditsSB, notificationsSB } from '../core/supabase.js';
import { toast } from '../components/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
  await auth.requireAuth();

  initSidebar();
  await Promise.all([loadProfile(), loadStats(), loadRecentDeploys(), loadCredits()]);
  subscribeNotifications();
});

/* ── Sidebar ──────────────────────────────────────────────────── */
function initSidebar() {
  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  toggle?.addEventListener('click', () => {
    sidebar?.classList.toggle('mobile-open');
    toggle.setAttribute('aria-expanded', sidebar?.classList.contains('mobile-open') ? 'true' : 'false');
  });

  // Close sidebar on mobile link click
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth < 768) sidebar?.classList.remove('mobile-open');
    });
  });

  // Set active nav item
  const path = location.pathname;
  document.querySelectorAll('.nav-item[href]').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === path);
  });
}

/* ── Load Profile ─────────────────────────────────────────────── */
async function loadProfile() {
  try {
    const { data: profile } = await profileSB.getMe();
    setText('userName',    profile.username);
    setText('userEmail',   profile.email);
    setText('userInitial', (profile.username?.[0] || '?').toUpperCase());
    setText('sidebarUsername', '@' + profile.username);

    // Set credit balance everywhere
    const bal = parseFloat(profile.credit_balance || 0).toFixed(2);
    document.querySelectorAll('.credit-balance').forEach(el => el.textContent = bal);

    // Welcome message
    const hour = new Date().getHours();
    const greet = hour < 12 ? '🌅 Good morning' : hour < 17 ? '☀️ Good afternoon' : '🌙 Good evening';
    setText('greetMsg', `${greet}, ${profile.username || 'developer'}!`);
  } catch (err) {
    console.error('Profile load failed', err);
  }
}

/* ── Load Stats ───────────────────────────────────────────────── */
async function loadStats() {
  try {
    const { data } = await deploymentsSB.list({ limit: 100 });
    const deps = data?.deployments || [];

    const running  = deps.filter(d => d.status === 'running').length;
    const failed   = deps.filter(d => d.status === 'failed').length;
    const total    = deps.length;

    setText('statRunning',  running);
    setText('statTotal',    total);
    setText('statFailed',   failed);
    setText('statUptime',   running ? '99.8%' : '—');

    // Animate stat cards
    document.querySelectorAll('.stat-card').forEach((el, i) => {
      el.style.animationDelay = `${i * 80}ms`;
      el.classList.add('anim-fade-in');
    });
  } catch {
    setText('statRunning', '—');
    setText('statTotal',   '—');
  }
}

/* ── Recent Deploys ───────────────────────────────────────────── */
async function loadRecentDeploys() {
  const container = document.getElementById('recentDeploys');
  if (!container) return;

  try {
    const { data } = await deploymentsSB.list({ limit: 5 });
    const deps = data?.deployments || [];

    if (!deps.length) {
      container.innerHTML = `
        <div class="empty-state" style="text-align:center;padding:var(--s10)">
          <div style="font-size:40px;margin-bottom:var(--s4)">🚀</div>
          <h3 style="margin-bottom:var(--s2)">No deployments yet</h3>
          <p style="color:var(--text-muted);margin-bottom:var(--s5)">
            Deploy your first app in under 30 seconds
          </p>
          <a href="/dashboard/deploy-new.html" class="btn btn-electric btn-md">
            ⚡ New Deployment
          </a>
        </div>
      `;
      return;
    }

    container.innerHTML = deps.map(dep => renderDeployCard(dep)).join('');
  } catch {
    container.innerHTML = `<div class="card" style="color:var(--error);padding:var(--s5)">
      Failed to load deployments.
    </div>`;
  }
}

function renderDeployCard(dep) {
  const STATUS_MAP = {
    running:   { emoji: '🟢', cls: 'running',   label: 'Running'   },
    building:  { emoji: '🔵', cls: 'building',  label: 'Building'  },
    deploying: { emoji: '🟡', cls: 'deploying', label: 'Deploying' },
    stopped:   { emoji: '⚪', cls: 'stopped',   label: 'Stopped'   },
    failed:    { emoji: '🔴', cls: 'failed',    label: 'Failed'    },
    pending:   { emoji: '🟣', cls: 'pending',   label: 'Pending'   },
  };
  const s = STATUS_MAP[dep.status] || STATUS_MAP.stopped;
  const updatedAt = new Date(dep.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return `
    <a href="/dashboard/deploy-detail.html?id=${dep.id}" class="deploy-card ${s.cls}" aria-label="View ${dep.name}">
      <div>
        <div class="deploy-card-name">${escHtml(dep.name)}</div>
        ${dep.public_url ? `<div class="deploy-card-url">${dep.public_url.replace('https://','')}</div>` : ''}
        <div class="deploy-card-meta">
          <span>${dep.source_type === 'git' ? '⑇ Git' : '📦 ZIP'}</span>
          <span>${dep.framework || 'Auto'}</span>
          <span>Updated ${updatedAt}</span>
        </div>
      </div>
      <div class="deploy-card-actions">
        <span class="badge badge-${s.cls}">${s.emoji} ${s.label}</span>
      </div>
    </a>
  `;
}

/* ── Credits ────────────────────────────────────────────────────── */
async function loadCredits() {
  try {
    const { data } = await creditsSB.getBalance();
    const bal = parseFloat(data?.balance || 0);
    document.querySelectorAll('.credit-balance').forEach(el => el.textContent = bal.toFixed(2));

    // Credit warning
    if (bal < 1.5) {
      const warning = document.getElementById('creditWarning');
      if (warning) {
        warning.style.display = 'flex';
        setText('creditWarnBalance', bal.toFixed(2));
      }
    }
  } catch { /* non-fatal */ }
}

/* ── Notifications ──────────────────────────────────────────────── */
function subscribeNotifications() {
  notificationsSB.subscribe((notification) => {
    const msg = notification.message || notification.title;
    if (!msg) return;
    const type = notification.type || 'info';
    toast[type === 'success' ? 'success' : type === 'error' ? 'error' : 'info'](msg);
    updateNotifBadge();
  });
}

function updateNotifBadge() {
  const badge = document.getElementById('notifBadge');
  if (!badge) return;
  const current = parseInt(badge.textContent) || 0;
  badge.textContent = current + 1;
  badge.style.display = 'flex';
}

/* ── Helpers ────────────────────────────────────────────────────── */
function setText(id, txt) {
  const el = document.getElementById(id);
  if (el) el.textContent = txt;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
