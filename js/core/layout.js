/**
 * EliteHosting — Layout v3.0
 * Sidebar · Topbar · Bottom Nav · Toast system
 */
import { auth }                         from './auth.js';
import { creditsSB, notificationsSB }   from './supabase.js';

/* ── SVG Icons ─────────────────────────────────────────────────── */
const ICONS = {
  home: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9"/><path d="M3 12v9h18v-9"/></svg>`,
  deploys: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="5" rx="1"/><rect x="2" y="10" width="20" height="5" rx="1"/><rect x="2" y="17" width="20" height="5" rx="1"/><circle cx="6" cy="5.5" r="1" fill="currentColor"/><circle cx="6" cy="12.5" r="1" fill="currentColor"/><circle cx="6" cy="19.5" r="1" fill="currentColor"/></svg>`,
  plus: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  ai: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 014 4v1h1a3 3 0 010 6h-1v1a4 4 0 01-8 0v-1H7a3 3 0 010-6h1V6a4 4 0 014-4z"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/><path d="M9 15s1 1.5 3 1.5 3-1.5 3-1.5"/></svg>`,
  settings: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
  notif: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>`,
  menu: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  bolt: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor"/></svg>`,
};

/* ── Bottom Nav Config ─────────────────────────────────────────── */
const BNAV = [
  { href: '/dashboard/index.html',      key: 'home',     icon: ICONS.home,     label: 'Home' },
  { href: '/dashboard/deploys.html',    key: 'deploys',  icon: ICONS.deploys,  label: 'Apps' },
  { href: '/dashboard/deploy-new.html', key: 'new',      icon: ICONS.plus,     label: 'Deploy', center: true },
  { href: '/dashboard/ai.html',         key: 'ai',       icon: ICONS.ai,       label: 'AI' },
  { href: '/dashboard/settings.html',   key: 'settings', icon: ICONS.settings, label: 'Settings' },
];

/* ── Sidebar Nav ───────────────────────────────────────────────── */
const SNAV = [
  { href: '/dashboard/index.html',      icon: '🏠', label: 'Overview'     },
  { href: '/dashboard/deploys.html',    icon: '🚀', label: 'Deployments'  },
  { href: '/dashboard/deploy-new.html', icon: '⚡', label: 'New Deploy'   },
  { href: '/dashboard/billing.html',    icon: '💳', label: 'Billing'      },
  { href: '/dashboard/ai.html',         icon: '🤖', label: 'AI Assistant' },
  { href: '/dashboard/settings.html',   icon: '⚙️', label: 'Settings'    },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════════ */
export async function injectLayout(opts = {}) {
  const profile = await auth.getProfile().catch(() => null);
  const path    = location.pathname;

  buildSidebar(profile, path);
  buildTopbar(opts, profile, path);
  buildBottomNav(path);
  buildOverlay();
  initToast();

  loadCredits();
  subscribeNotifs();
}

/* ── Sidebar ───────────────────────────────────────────────────── */
function buildSidebar(profile, path) {
  const el = document.getElementById('db-sidebar');
  if (!el) return;

  const init = (profile?.username?.[0] || '?').toUpperCase();

  el.innerHTML = `
    <div class="db-sidebar-logo">
      <a href="/" class="db-logo-link">
        <div class="db-logo-icon">⚡</div>
        Elite<span style="color:var(--electric)">Host</span><span style="font-size:10px;margin-left:4px;opacity:0.6">v14.0</span>
      </a>
    </div>

    <div class="db-sidebar-user">
      <div class="db-user-avatar">${init}</div>
      <div>
        <div class="db-user-name">@${profile?.username || '…'}</div>
        <div class="db-user-credits">💎 <span class="credit-balance">…</span> cr</div>
      </div>
    </div>

    <nav class="db-sidebar-nav" aria-label="Main navigation">
      <div class="db-nav-section">Dashboard</div>
      ${SNAV.map(item => `
        <a href="${item.href}"
           class="db-nav-link${path === item.href ? ' is-active' : ''}"
           aria-current="${path === item.href ? 'page' : 'false'}">
          <span class="db-nav-icon">${item.icon}</span>
          <span class="db-nav-label">${item.label}</span>
        </a>
      `).join('')}
      ${profile?.roles?.some(r => ['admin','superadmin'].includes(r)) ? `
        <div class="db-nav-section" style="margin-top:8px">Admin</div>
        <a href="/admin/index.html"
           class="db-nav-link${path.startsWith('/admin') ? ' is-active' : ''}">
          <span class="db-nav-icon">🛡️</span>
          <span class="db-nav-label">Admin Panel</span>
        </a>
      ` : ''}
    </nav>

    <div class="db-sidebar-footer">
      <a href="https://t.me/elitehosting_support" target="_blank" rel="noopener noreferrer"
         class="db-nav-link">
        <span class="db-nav-icon">💬</span>
        <span class="db-nav-label">Support</span>
      </a>
      <button class="db-nav-link" id="db-logout-btn" style="border:none;background:none;color:var(--text-muted)">
        <span class="db-nav-icon">🚪</span>
        <span class="db-nav-label">Logout</span>
      </button>
    </div>
  `;

  document.getElementById('db-logout-btn')?.addEventListener('click', async () => {
    showToast('Signing out…', 'info');
    await auth.logout();
    location.href = '/auth/login.html';
  });
}

/* ── Topbar ────────────────────────────────────────────────────── */
function buildTopbar(opts, profile, path) {
  const el = document.getElementById('db-topbar');
  if (!el) return;

  const init = (profile?.username?.[0] || '?').toUpperCase();
  const showDeploy = path !== '/dashboard/deploy-new.html';

  el.innerHTML = `
    <div class="db-topbar-left">
      <button class="db-menu-btn" id="db-menu-btn" aria-label="Open menu" aria-expanded="false" aria-controls="db-sidebar">
        ${ICONS.menu}
      </button>
      <h1 class="db-topbar-title">${opts.title || 'Dashboard'}</h1>
      <span style="font-size:9px;background:var(--grad-electric);color:#000;padding:1px 5px;border-radius:4px;font-weight:800;margin-left:4px">v14.0</span>
    </div>
    <div class="db-topbar-right">
      ${showDeploy ? `
        <a href="/dashboard/deploy-new.html"
           class="db-credit-pill"
           aria-label="New deployment">
          ${ICONS.bolt}
          <span class="credit-text">Deploy</span>
        </a>
      ` : ''}
      <a href="/dashboard/billing.html" class="db-credit-pill" aria-label="Credit balance">
        💎 <span class="credit-balance">…</span>
      </a>
      <button class="db-notif-btn" id="db-notif-btn" aria-label="Notifications">
        ${ICONS.notif}
        <span class="db-notif-dot" id="db-notif-dot"></span>
      </button>
      <a href="/dashboard/settings.html" class="db-topbar-avatar" aria-label="Settings">${init}</a>
    </div>
  `;

  document.getElementById('db-menu-btn')?.addEventListener('click', toggleSidebar);
}

/* ── Bottom Nav ────────────────────────────────────────────────── */
function buildBottomNav(path) {
  document.getElementById('db-bnav')?.remove();

  const nav = document.createElement('nav');
  nav.id = 'db-bnav';
  nav.className = 'db-bnav';
  nav.setAttribute('aria-label', 'Bottom navigation');

  nav.innerHTML = `
    <div class="db-bnav-inner">
      ${BNAV.map(item => {
        const active = path === item.href;
        return `
          <a href="${item.href}"
             class="db-bn-item${item.center ? ' bn-center' : ''}${active ? ' is-active' : ''}"
             aria-label="${item.label}"
             aria-current="${active ? 'page' : 'false'}"
          >
            <div class="db-bn-icon" aria-hidden="true">${item.icon}</div>
            <span class="db-bn-label">${item.label}</span>
          </a>
        `;
      }).join('')}
    </div>
  `;

  document.body.appendChild(nav);
}

/* ── Overlay ───────────────────────────────────────────────────── */
function buildOverlay() {
  document.getElementById('db-overlay')?.remove();
  const ov = document.createElement('div');
  ov.id = 'db-overlay';
  ov.className = 'db-overlay';
  ov.addEventListener('click', closeSidebar);
  document.body.appendChild(ov);
}

/* ── Sidebar Toggle ────────────────────────────────────────────── */
function toggleSidebar() {
  const sb  = document.getElementById('db-sidebar');
  const ov  = document.getElementById('db-overlay');
  const btn = document.getElementById('db-menu-btn');
  const open = sb?.classList.toggle('is-open');
  ov?.classList.toggle('show', open);
  btn?.setAttribute('aria-expanded', open ? 'true' : 'false');
}
function closeSidebar() {
  document.getElementById('db-sidebar')?.classList.remove('is-open');
  document.getElementById('db-overlay')?.classList.remove('show');
  document.getElementById('db-menu-btn')?.setAttribute('aria-expanded', 'false');
}

/* ── Credits ───────────────────────────────────────────────────── */
async function loadCredits() {
  try {
    const { data } = await creditsSB.getBalance();
    const bal = parseFloat(data?.balance ?? 0).toFixed(2);
    document.querySelectorAll('.credit-balance').forEach(el => el.textContent = bal);
  } catch { /* non-fatal */ }
}

/* ── Notifications ─────────────────────────────────────────────── */
function subscribeNotifs() {
  notificationsSB.subscribe(() => {
    const dot = document.getElementById('db-notif-dot');
    if (dot) dot.style.display = 'block';
  });
}

/* ── Toast System ──────────────────────────────────────────────── */
let _toastEl = null;
let _toastTimer;

function initToast() {
  _toastEl = document.getElementById('db-toast');
  if (!_toastEl) {
    _toastEl = document.createElement('div');
    _toastEl.id = 'db-toast';
    _toastEl.setAttribute('role', 'status');
    _toastEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(_toastEl);
  }
}

export function showToast(msg, type = 'info', duration = 3000) {
  if (!_toastEl) { _toastEl = document.getElementById('db-toast'); }
  if (!_toastEl) return;
  clearTimeout(_toastTimer);
  const icons = { success:'✓', error:'✕', warn:'⚠', info:'ℹ' };
  _toastEl.className = `${type}`;
  _toastEl.innerHTML = `<span>${icons[type] || 'ℹ'}</span>${msg}`;
  _toastEl.classList.add('show');
  _toastTimer = setTimeout(() => _toastEl?.classList.remove('show'), duration);
}

/* Make toast globally available */
window.dbToast = showToast;
