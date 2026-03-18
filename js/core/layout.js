/**
 * EliteHosting — Dashboard Layout v2.0
 * Injects: sidebar (desktop) + topbar + FIXED BOTTOM NAV (mobile)
 * Usage: import { injectLayout } from '/js/core/layout.js';
 *        await injectLayout({ title: 'Page Title' });
 */
import { auth }                               from './auth.js';
import { creditsSB, notificationsSB }        from './supabase.js';

/* ── Nav Items ─────────────────────────────────────────────────── */
// Bottom nav (5 items) — order matters
const BOTTOM_NAV = [
  {
    href:  '/dashboard/index.html',
    icon:  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
    label: 'Home',
    key:   'home',
  },
  {
    href:  '/dashboard/deploys.html',
    icon:  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
    label: 'Deploys',
    key:   'deploys',
  },
  {
    href:  '/dashboard/deploy-new.html',
    icon:  `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    label: 'Deploy',
    key:   'new',
    center: true,
  },
  {
    href:  '/dashboard/ai.html',
    icon:  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>`,
    label: 'AI',
    key:   'ai',
  },
  {
    href:  '/dashboard/settings.html',
    icon:  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
    label: 'Settings',
    key:   'settings',
  },
];

// Full sidebar nav
const SIDEBAR_NAV = [
  { href: '/dashboard/index.html',      icon: '🏠', label: 'Overview'     },
  { href: '/dashboard/deploys.html',    icon: '🚀', label: 'Deployments'  },
  { href: '/dashboard/deploy-new.html', icon: '⚡', label: 'New Deploy'   },
  { href: '/dashboard/billing.html',    icon: '💳', label: 'Billing'      },
  { href: '/dashboard/ai.html',         icon: '🤖', label: 'AI Assistant' },
  { href: '/dashboard/settings.html',   icon: '⚙️', label: 'Settings'    },
];

/* ── Main inject function ──────────────────────────────────────── */
export async function injectLayout(opts = {}) {
  const profile = await auth.getProfile().catch(() => null);
  const path    = location.pathname;

  injectSidebar(profile, path);
  injectTopbar(opts, profile);
  injectBottomNav(path);
  injectSidebarOverlay();

  // Load credits async
  loadCredits();

  // Realtime notifications
  subscribeNotifications();
}

/* ── Sidebar ───────────────────────────────────────────────────── */
function injectSidebar(profile, path) {
  const el = document.getElementById('sidebar');
  if (!el) return;

  const initial = (profile?.username?.[0] || '?').toUpperCase();

  el.innerHTML = `
    <!-- Logo -->
    <div class="sidebar-logo">
      <a href="/" style="text-decoration:none;display:flex;align-items:center;gap:10px;font-family:var(--font-display);font-weight:800;font-size:18px;color:var(--text-primary)">
        <div style="width:32px;height:32px;border-radius:8px;background:var(--grad-electric);display:flex;align-items:center;justify-content:center;font-size:16px;color:#000;flex-shrink:0">⚡</div>
        Elite<span style="color:var(--electric)">Hosting</span>
      </a>
    </div>

    <!-- User info -->
    <div class="sidebar-user">
      <div class="sidebar-avatar">${initial}</div>
      <div class="sidebar-user-info">
        <div class="sidebar-username" id="sidebarUsername">@${profile?.username || '…'}</div>
        <div class="sidebar-credits">
          💎 <span class="credit-balance">…</span> credits
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav" aria-label="Dashboard navigation">
      <div class="nav-section-label">Menu</div>
      ${SIDEBAR_NAV.map(item => `
        <a href="${item.href}"
           class="nav-item${path === item.href ? ' active' : ''}"
           aria-current="${path === item.href ? 'page' : 'false'}">
          <span class="nav-icon" aria-hidden="true">${item.icon}</span>
          <span class="nav-label">${item.label}</span>
        </a>
      `).join('')}
      ${profile?.roles?.some(r => ['admin','superadmin'].includes(r)) ? `
        <div class="nav-section-label" style="margin-top:var(--s2)">Admin</div>
        <a href="/admin/index.html"
           class="nav-item${path.startsWith('/admin') ? ' active' : ''}">
          <span class="nav-icon">🛡️</span>
          <span class="nav-label">Admin Panel</span>
        </a>
      ` : ''}
    </nav>

    <!-- Footer -->
    <div class="sidebar-footer">
      <a href="https://t.me/elitehosting_support" target="_blank" rel="noopener"
         class="nav-item">
        <span class="nav-icon">💬</span>
        <span class="nav-label">Support</span>
      </a>
      <button class="nav-item" id="sidebarLogoutBtn">
        <span class="nav-icon">🚪</span>
        <span class="nav-label">Logout</span>
      </button>
    </div>
  `;

  document.getElementById('sidebarLogoutBtn')?.addEventListener('click', async () => {
    await auth.logout();
    location.href = '/auth/login.html';
  });
}

/* ── Topbar ────────────────────────────────────────────────────── */
function injectTopbar(opts, profile) {
  const el = document.getElementById('topbar');
  if (!el) return;

  const initial = (profile?.username?.[0] || '?').toUpperCase();

  el.innerHTML = `
    <div class="topbar-left">
      <button class="topbar-hamburger" id="sidebarToggleBtn"
              aria-label="Toggle sidebar" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <h1 class="topbar-title">${opts.title || 'Dashboard'}</h1>
    </div>
    <div class="topbar-right">
      ${location.pathname !== '/dashboard/deploy-new.html' ? `
        <a href="/dashboard/deploy-new.html" class="btn btn-electric btn-sm"
           style="display:none" id="topbarDeployBtn">
          ⚡ Deploy
        </a>
      ` : ''}
      <div class="topbar-credits" title="Your credit balance">
        💎 <span class="credit-balance">…</span>
      </div>
      <button class="topbar-notif" id="notifBtn" aria-label="Notifications"
              title="Notifications">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        <span class="notif-badge" id="notifBadge" style="display:none">0</span>
      </button>
      <div class="topbar-avatar" title="${profile?.email || ''}" aria-label="Account">
        ${initial}
      </div>
    </div>
  `;

  // Show deploy button on all pages except deploy-new
  const deployBtn = document.getElementById('topbarDeployBtn');
  if (deployBtn) deployBtn.style.removeProperty('display');

  // Sidebar toggle (for mobile)
  document.getElementById('sidebarToggleBtn')?.addEventListener('click', () => {
    toggleSidebar();
  });
}

/* ── Bottom Navigation Bar ─────────────────────────────────────── */
function injectBottomNav(path) {
  // Remove existing if any
  document.getElementById('bottomNav')?.remove();

  const nav = document.createElement('nav');
  nav.id = 'bottomNav';
  nav.className = 'bottom-nav';
  nav.setAttribute('aria-label', 'Bottom navigation');

  nav.innerHTML = `
    <div class="bottom-nav-inner">
      ${BOTTOM_NAV.map(item => {
        // Determine active state
        let isActive = path === item.href;
        // Special case: deploy-new
        if (item.key === 'new' && path === '/dashboard/deploy-new.html') isActive = true;

        return `
          <a href="${item.href}"
             class="bn-item${item.center ? ' bn-center' : ''}${isActive ? ' active' : ''}"
             data-key="${item.key}"
             aria-label="${item.label}"
             aria-current="${isActive ? 'page' : 'false'}"
          >
            <div class="bn-icon-wrap" aria-hidden="true">${item.icon}</div>
            <span class="bn-label">${item.label}</span>
          </a>
        `;
      }).join('')}
    </div>
  `;

  document.body.appendChild(nav);

  // Tap ripple effect
  nav.querySelectorAll('.bn-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Ripple
      const ripple = document.createElement('span');
      ripple.className = 'bn-ripple';
      btn.querySelector('.bn-icon-wrap')?.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);

      // Close sidebar if open
      closeSidebar();
    });
  });
}

/* ── Sidebar Overlay ───────────────────────────────────────────── */
function injectSidebarOverlay() {
  document.getElementById('sidebarOverlay')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'sidebarOverlay';
  overlay.className = 'sidebar-overlay';
  overlay.addEventListener('click', closeSidebar);
  document.body.appendChild(overlay);
}

/* ── Sidebar Toggle Helpers ────────────────────────────────────── */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const btn     = document.getElementById('sidebarToggleBtn');
  const isOpen  = sidebar?.classList.toggle('mobile-open');
  overlay?.classList.toggle('visible', isOpen);
  btn?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  // Animate hamburger to X
  if (btn) btn.classList.toggle('open', isOpen);
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const btn     = document.getElementById('sidebarToggleBtn');
  sidebar?.classList.remove('mobile-open');
  overlay?.classList.remove('visible');
  btn?.setAttribute('aria-expanded', 'false');
  btn?.classList.remove('open');
}

/* ── Load Credits ──────────────────────────────────────────────── */
async function loadCredits() {
  try {
    const { data } = await creditsSB.getBalance();
    const bal = parseFloat(data?.balance ?? 0).toFixed(2);
    document.querySelectorAll('.credit-balance').forEach(el => el.textContent = bal);
  } catch { /* non-fatal */ }
}

/* ── Notifications ─────────────────────────────────────────────── */
function subscribeNotifications() {
  notificationsSB.subscribe(() => {
    const badge = document.getElementById('notifBadge');
    if (!badge) return;
    const count = (parseInt(badge.textContent) || 0) + 1;
    badge.textContent = count;
    badge.style.display = 'flex';
    badge.style.animation = 'none';
    requestAnimationFrame(() => { badge.style.animation = ''; });
  });
}
