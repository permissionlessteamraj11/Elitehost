/**
 * EliteHosting — Dashboard Shared Layout
 * Injects sidebar + topbar HTML so every dashboard page shares one template.
 * Usage: import and call injectLayout() before your page script.
 */
import { auth } from './auth.js';
import { creditsSB, notificationsSB } from './supabase.js';

const NAV_ITEMS = [
  { href: '/dashboard/index.html',      icon: '🏠', label: 'Overview'     },
  { href: '/dashboard/deploys.html',    icon: '🚀', label: 'Deployments'  },
  { href: '/dashboard/deploy-new.html', icon: '⚡', label: 'New Deploy'   },
  { href: '/dashboard/billing.html',    icon: '💳', label: 'Billing'      },
  { href: '/dashboard/ai.html',         icon: '🤖', label: 'AI Assistant' },
  { href: '/dashboard/settings.html',   icon: '⚙️', label: 'Settings'    },
];

export async function injectLayout(opts = {}) {
  const profile = await auth.getProfile().catch(() => null);

  // ── Sidebar ────────────────────────────────────────────────────
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.innerHTML = `
      <div class="sidebar-logo">
        <a href="/" style="text-decoration:none;display:flex;align-items:center;gap:var(--s2);font-family:var(--font-display);font-weight:800;font-size:18px;color:var(--text-primary)">
          ⚡ Elite<span style="color:var(--electric)">Hosting</span>
        </a>
      </div>

      <div class="sidebar-user">
        <div class="sidebar-avatar">${(profile?.username?.[0] || '?').toUpperCase()}</div>
        <div class="sidebar-user-info">
          <div class="sidebar-username" id="sidebarUsername">@${profile?.username || '…'}</div>
          <div class="sidebar-credits"><span class="credit-balance">…</span> credits</div>
        </div>
      </div>

      <nav class="sidebar-nav" aria-label="Dashboard navigation">
        ${NAV_ITEMS.map(item => `
          <a href="${item.href}"
             class="nav-item${location.pathname === item.href ? ' active' : ''}"
             aria-current="${location.pathname === item.href ? 'page' : 'false'}">
            <span class="nav-icon" aria-hidden="true">${item.icon}</span>
            <span class="nav-label">${item.label}</span>
          </a>
        `).join('')}
        ${profile?.roles?.includes('admin') ? `
          <a href="/admin/index.html" class="nav-item${location.pathname.startsWith('/admin') ? ' active' : ''}">
            <span class="nav-icon">🛡️</span>
            <span class="nav-label">Admin Panel</span>
          </a>
        ` : ''}
      </nav>

      <div class="sidebar-footer">
        <a href="https://t.me/elitehosting_support" target="_blank" rel="noopener"
           class="nav-item" style="font-size:var(--text-sm)">
          <span class="nav-icon">💬</span><span class="nav-label">Support</span>
        </a>
        <button class="nav-item w-full" id="logoutBtn" style="background:none;border:none;cursor:pointer;text-align:left;color:var(--text-secondary)">
          <span class="nav-icon">🚪</span><span class="nav-label">Logout</span>
        </button>
      </div>
    `;

    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
      await auth.logout();
      location.href = '/auth/login.html';
    });
  }

  // ── Topbar ─────────────────────────────────────────────────────
  const topbar = document.getElementById('topbar');
  if (topbar) {
    topbar.innerHTML = `
      <div class="topbar-left">
        <button class="topbar-hamburger" id="sidebarToggle" aria-label="Toggle sidebar" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
        <h1 class="topbar-title">${opts.title || 'Dashboard'}</h1>
      </div>
      <div class="topbar-right">
        <a href="/dashboard/deploy-new.html" class="btn btn-electric btn-sm" style="display:none" id="topbarNewDeploy">
          ⚡ Deploy
        </a>
        <div class="topbar-credits" title="Your credit balance">
          💎 <span class="credit-balance">…</span>
        </div>
        <button class="topbar-notif" id="notifBtn" aria-label="Notifications">
          🔔
          <span class="notif-badge" id="notifBadge" style="display:none">0</span>
        </button>
        <div class="topbar-avatar" title="${profile?.email || ''}">${(profile?.username?.[0] || '?').toUpperCase()}</div>
      </div>
    `;

    // Show deploy button everywhere except deploy-new page
    if (location.pathname !== '/dashboard/deploy-new.html') {
      document.getElementById('topbarNewDeploy')?.style.removeProperty('display');
    }

    // Sidebar toggle
    document.getElementById('sidebarToggle')?.addEventListener('click', () => {
      const sb = document.getElementById('sidebar');
      const open = sb?.classList.toggle('mobile-open');
      document.getElementById('sidebarToggle')?.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // ── Load Credits ───────────────────────────────────────────────
  try {
    const { data } = await creditsSB.getBalance();
    const bal = parseFloat(data?.balance ?? 0).toFixed(2);
    document.querySelectorAll('.credit-balance').forEach(el => el.textContent = bal);
  } catch { /* non-fatal */ }

  // ── Subscribe Notifications ────────────────────────────────────
  notificationsSB.subscribe((notif) => {
    const badge = document.getElementById('notifBadge');
    if (badge) {
      badge.style.display = 'flex';
      badge.textContent = parseInt(badge.textContent || '0') + 1;
    }
  });
}
