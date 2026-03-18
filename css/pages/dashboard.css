/* ================================================================
   ELITEHOSTING.IN — Dashboard Styles v2.0
   With Advanced Fixed Bottom Navigation Bar
   ================================================================ */

/* ── Base Layout ─────────────────────────────────────────────── */
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-void);
}

/* ── Sidebar (Desktop) ───────────────────────────────────────── */
.sidebar {
  width: var(--sidebar-w);
  height: 100vh;
  position: fixed;
  top: 0; left: 0;
  background: var(--color-surface-1);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  z-index: var(--z-sticky);
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-logo {
  padding: var(--s5) var(--s5) var(--s4);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.sidebar-user {
  padding: var(--s4) var(--s4);
  display: flex;
  align-items: center;
  gap: var(--s3);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.sidebar-avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--grad-electric);
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 14px; color: #000;
  flex-shrink: 0;
}
.sidebar-user-info { min-width: 0; }
.sidebar-username {
  font-size: var(--text-sm); font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.sidebar-credits {
  font-size: var(--text-xs); color: var(--text-muted);
  font-family: var(--font-mono);
  margin-top: 1px;
}

.sidebar-nav {
  flex: 1;
  padding: var(--s3) var(--s3);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--s3);
  padding: 10px 12px;
  border-radius: var(--r-md);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-muted);
  text-decoration: none;
  cursor: pointer;
  transition: all var(--t-base);
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  position: relative;
}
.nav-item:hover {
  background: rgba(255,255,255,0.05);
  color: var(--text-primary);
}
.nav-item.active {
  background: var(--electric-soft);
  color: var(--electric);
  font-weight: 600;
}
.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0; top: 25%; bottom: 25%;
  width: 3px;
  background: var(--electric);
  border-radius: 0 2px 2px 0;
}
.nav-icon { font-size: 16px; flex-shrink: 0; width: 20px; text-align: center; }
.nav-label { flex: 1; }

.nav-section-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-disabled);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: var(--s4) 12px var(--s2);
}

.sidebar-footer {
  padding: var(--s3);
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

/* ── Dashboard Main ──────────────────────────────────────────── */
.dashboard-main {
  margin-left: var(--sidebar-w);
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  /* Bottom padding for fixed bottom nav on mobile */
  padding-bottom: 0;
}

/* ── Topbar ──────────────────────────────────────────────────── */
.topbar {
  height: 60px;
  background: rgba(10,9,15,0.92);
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--s6);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  gap: var(--s4);
}
.topbar-left {
  display: flex;
  align-items: center;
  gap: var(--s4);
  min-width: 0;
}
.topbar-title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.topbar-hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  width: 36px; height: 36px;
  align-items: center; justify-content: center;
  background: var(--color-surface-2);
  border: 1px solid var(--border);
  border-radius: var(--r-sm);
  cursor: pointer;
  flex-shrink: 0;
}
.topbar-hamburger span {
  display: block;
  width: 16px; height: 1.5px;
  background: var(--text-secondary);
  border-radius: 2px;
  transition: all var(--t-base);
}
.topbar-right {
  display: flex;
  align-items: center;
  gap: var(--s3);
  flex-shrink: 0;
}
.topbar-credits {
  display: flex;
  align-items: center;
  gap: var(--s2);
  padding: 6px 12px;
  background: var(--color-surface-2);
  border: 1px solid var(--border);
  border-radius: var(--r-pill);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--electric);
  font-family: var(--font-mono);
  white-space: nowrap;
}
.topbar-notif {
  position: relative;
  width: 36px; height: 36px;
  border-radius: var(--r-sm);
  background: var(--color-surface-2);
  border: 1px solid var(--border);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
  transition: all var(--t-base);
}
.topbar-notif:hover { border-color: var(--border-2); }
.notif-badge {
  position: absolute;
  top: -4px; right: -4px;
  min-width: 16px; height: 16px;
  background: var(--error);
  border-radius: var(--r-pill);
  font-size: 10px; font-weight: 700;
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  padding: 0 3px;
  border: 2px solid var(--color-void);
}
.topbar-avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--grad-electric);
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 13px;
  color: #000; cursor: pointer;
  flex-shrink: 0;
  transition: transform var(--t-base);
}
.topbar-avatar:hover { transform: scale(1.08); }

/* ── Dashboard Content ───────────────────────────────────────── */
.dashboard-content {
  padding: var(--s6);
  flex: 1;
}

/* ═══════════════════════════════════════════════════════════════
   FIXED BOTTOM NAVIGATION BAR — Advanced Mobile App Style
   ═══════════════════════════════════════════════════════════════ */

.bottom-nav {
  display: none; /* Hidden on desktop */
  position: fixed;
  bottom: 0; left: 0; right: 0;
  z-index: var(--z-modal);
  /* Glass morphism */
  background: rgba(8, 7, 14, 0.94);
  backdrop-filter: blur(32px) saturate(200%);
  -webkit-backdrop-filter: blur(32px) saturate(200%);
  border-top: 1px solid rgba(255,255,255,0.08);
  /* Safe area for phones with notch */
  padding-bottom: env(safe-area-inset-bottom, 0px);
  box-shadow: 0 -8px 40px rgba(0,0,0,0.6), 0 -1px 0 rgba(0,212,255,0.06);
}

/* Top accent line */
.bottom-nav::before {
  content: '';
  position: absolute;
  top: 0; left: 15%; right: 15%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent);
  pointer-events: none;
}

.bottom-nav-inner {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  padding: 8px 8px 10px;
  max-width: 600px;
  margin: 0 auto;
  position: relative;
}

/* ── Each Nav Button ─────────────────────────────────────────── */
.bn-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 16px;
  border: none;
  background: none;
  cursor: pointer;
  color: rgba(255,255,255,0.38);
  text-decoration: none;
  transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1);
  position: relative;
  min-width: 56px;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.bn-item:active {
  transform: scale(0.88);
}

/* Icon wrapper */
.bn-icon-wrap {
  position: relative;
  width: 42px; height: 42px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 14px;
  transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1);
  font-size: 20px;
}

/* Label */
.bn-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.01em;
  transition: all 0.22s ease;
  line-height: 1;
}

/* ── Active State ────────────────────────────────────────────── */
.bn-item.active {
  color: var(--electric);
}
.bn-item.active .bn-icon-wrap {
  background: rgba(0,212,255,0.12);
  box-shadow: 0 0 20px rgba(0,212,255,0.18), inset 0 1px 0 rgba(0,212,255,0.2);
  transform: translateY(-2px);
}
.bn-item.active .bn-label {
  color: var(--electric);
}

/* Active indicator dot */
.bn-item.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px; height: 4px;
  border-radius: 50%;
  background: var(--electric);
  box-shadow: 0 0 6px rgba(0,212,255,0.8);
}

/* Hover on non-active */
.bn-item:not(.active):hover {
  color: rgba(255,255,255,0.65);
}
.bn-item:not(.active):hover .bn-icon-wrap {
  background: rgba(255,255,255,0.06);
  transform: translateY(-2px);
}

/* ── Center Button (New Deploy) — Special ───────────────────── */
.bn-item.bn-center {
  margin-top: -18px;
  color: #000;
}

.bn-center .bn-icon-wrap {
  width: 54px; height: 54px;
  border-radius: 18px;
  background: var(--grad-electric);
  box-shadow:
    0 6px 24px rgba(0,212,255,0.45),
    0 2px 8px rgba(0,0,0,0.4),
    inset 0 1px 0 rgba(255,255,255,0.3);
  font-size: 22px;
  animation: center-btn-pulse 3s ease-in-out infinite;
}
@keyframes center-btn-pulse {
  0%,100% { box-shadow: 0 6px 24px rgba(0,212,255,.45), 0 2px 8px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.3); }
  50%     { box-shadow: 0 8px 32px rgba(0,212,255,.65), 0 2px 8px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.3); }
}

.bn-center .bn-label {
  color: rgba(255,255,255,0.6);
  font-size: 9px;
}

.bn-center:hover .bn-icon-wrap {
  transform: translateY(-4px) scale(1.06);
  box-shadow: 0 12px 36px rgba(0,212,255,0.6);
}

.bn-center.active .bn-icon-wrap {
  background: var(--grad-electric);
  transform: translateY(-4px);
}

/* Center button ring animation */
.bn-center .bn-icon-wrap::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 22px;
  border: 1.5px solid rgba(0,212,255,0.25);
  animation: center-ring 2.5s ease-in-out infinite;
}
@keyframes center-ring {
  0%,100% { opacity:0.4; transform:scale(1); }
  50%     { opacity:0.8; transform:scale(1.06); }
}

/* ── Badge on nav items ──────────────────────────────────────── */
.bn-badge {
  position: absolute;
  top: 2px; right: 6px;
  min-width: 16px; height: 16px;
  background: var(--error);
  border-radius: var(--r-pill);
  font-size: 9px; font-weight: 800;
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  padding: 0 3px;
  border: 2px solid var(--color-void);
  animation: badge-pop 0.4s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes badge-pop {
  from { transform:scale(0); opacity:0; }
  to   { transform:scale(1); opacity:1; }
}

/* Page transition ripple */
.bn-ripple {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(circle at center, rgba(0,212,255,0.25) 0%, transparent 70%);
  opacity: 0;
  pointer-events: none;
  animation: ripple-out 0.5s ease forwards;
}
@keyframes ripple-out {
  from { opacity:0.8; transform:scale(0.5); }
  to   { opacity:0;   transform:scale(2.5); }
}

/* ── Overview Cards ──────────────────────────────────────────── */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--s4);
  margin-bottom: var(--s6);
}
.overview-card {
  background: var(--color-surface-1);
  border: 1px solid var(--border);
  border-radius: var(--r-xl);
  padding: var(--s5);
  display: flex; flex-direction: column; gap: var(--s2);
  transition: all var(--t-base);
}
.overview-card:hover { border-color: var(--border-2); transform: translateY(-1px); }
.overview-card-top { display: flex; align-items: center; justify-content: space-between; }
.overview-card-icon {
  width: 40px; height: 40px;
  border-radius: var(--r-md);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
}
.overview-card-value {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--text-primary);
}
.overview-card-label {
  font-size: var(--text-xs);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* ── Deploy Cards ────────────────────────────────────────────── */
.deploy-list { display: flex; flex-direction: column; gap: var(--s3); }
.deploy-list-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: var(--s4);
}
.deploy-list-header h2 { font-size: var(--text-lg); font-weight: 700; }

/* ── Stats/Metric Cards ──────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--s4);
  margin-bottom: var(--s6);
}
.stat-card {
  background: var(--color-surface-1);
  border: 1px solid var(--border);
  border-radius: var(--r-xl);
  padding: var(--s5);
  display: flex; align-items: center; gap: var(--s4);
  transition: all var(--t-base);
}
.stat-card:hover { border-color: var(--border-2); }
.stat-icon { font-size: 24px; flex-shrink: 0; }
.stat-label { font-size: var(--text-xs); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: var(--s1); }
.stat-value { font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 800; }

/* ── Log Viewer ──────────────────────────────────────────────── */
.log-controls {
  display: flex; align-items: center; gap: var(--s3);
  padding: 10px 16px;
  background: var(--color-surface-2);
  border-bottom: 1px solid var(--border);
}

/* ── Metrics ─────────────────────────────────────────────────── */
.metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s5); }
.metric-chart-card {
  background: var(--color-surface-1);
  border: 1px solid var(--border);
  border-radius: var(--r-xl);
  overflow: hidden;
}
.metric-chart-header {
  padding: var(--s4) var(--s5);
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
}

/* ── Billing ─────────────────────────────────────────────────── */
.billing-hero {
  background: linear-gradient(135deg, rgba(0,212,255,0.06), rgba(124,58,237,0.06));
  border: 1px solid var(--border);
  border-radius: var(--r-2xl);
  padding: var(--s8); margin-bottom: var(--s6);
  display: flex; align-items: center; justify-content: space-between; gap: var(--s6);
}
.billing-balance-val {
  font-family: var(--font-display);
  font-size: 56px; font-weight: 800;
  color: var(--electric); line-height: 1;
}
.credit-packs-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--s4);
}
.credit-pack {
  background: var(--color-surface-1);
  border: 2px solid var(--border);
  border-radius: var(--r-xl);
  padding: var(--s5); text-align: center;
  transition: all var(--t-base);
  cursor: pointer; position: relative;
}
.credit-pack:hover { border-color: var(--electric); background: var(--electric-soft); }

/* ── AI Page ─────────────────────────────────────────────────── */
.ai-tasks-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--s4);
}
.ai-task {
  background: var(--color-surface-1);
  border: 1px solid var(--border);
  border-radius: var(--r-xl);
  padding: var(--s5);
  cursor: pointer;
  transition: all var(--t-base);
  text-align: center;
}
.ai-task:hover { border-color: var(--plasma); background: var(--plasma-soft); transform: translateY(-2px); }
.ai-task.selected { border-color: var(--plasma); background: var(--plasma-soft); }

/* ── Settings ────────────────────────────────────────────────── */
.settings-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--s5); background: var(--color-surface-1);
  border: 1px solid var(--border); border-radius: var(--r-lg); gap: var(--s4);
}

/* ── Admin ───────────────────────────────────────────────────── */
.admin-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--s4);
  margin-bottom: var(--s6);
}
.admin-table {
  width: 100%; border-collapse: collapse;
}
.admin-table th,
.admin-table td {
  padding: 12px 16px; text-align: left;
  border-bottom: 1px solid var(--border); font-size: var(--text-sm);
}
.admin-table th {
  background: var(--color-surface-2); color: var(--text-muted);
  font-size: var(--text-xs); text-transform: uppercase;
  letter-spacing: 0.06em; font-weight: 600;
}
.admin-table tr:hover td { background: rgba(255,255,255,0.02); }

/* ═══════════════════════════════════════════════════════════════
   RESPONSIVE — Mobile First
   ═══════════════════════════════════════════════════════════════ */

@media (max-width: 768px) {
  /* Hide desktop sidebar */
  .sidebar {
    transform: translateX(-100%);
    transition: transform var(--t-base);
    z-index: var(--z-modal);
    box-shadow: none;
  }
  .sidebar.mobile-open {
    transform: translateX(0);
    box-shadow: var(--shadow-xl);
  }

  /* Sidebar overlay */
  .sidebar-overlay {
    display: none;
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px);
    z-index: calc(var(--z-modal) - 1);
  }
  .sidebar-overlay.visible { display: block; }

  /* Main takes full width */
  .dashboard-main {
    margin-left: 0;
    padding-bottom: 80px; /* Space for bottom nav */
  }

  /* Show hamburger */
  .topbar-hamburger { display: flex; }

  /* Show bottom nav */
  .bottom-nav { display: block; }

  /* Responsive grids */
  .overview-grid     { grid-template-columns: repeat(2, 1fr); }
  .stats-grid        { grid-template-columns: repeat(2, 1fr); }
  .metrics-grid      { grid-template-columns: 1fr; }
  .admin-stats       { grid-template-columns: repeat(2, 1fr); }
  .ai-tasks-grid     { grid-template-columns: repeat(2, 1fr); }
  .credit-packs-grid { grid-template-columns: repeat(2, 1fr); }
  .billing-hero      { flex-direction: column; }
  .billing-balance-val { font-size: 40px; }
  .dashboard-content { padding: var(--s4); }

  /* Topbar */
  .topbar-credits { display: none; }
  .topbar { padding: 0 var(--s4); }
}

@media (max-width: 480px) {
  .overview-grid  { grid-template-columns: 1fr; }
  .stats-grid     { grid-template-columns: 1fr; }
  .admin-stats    { grid-template-columns: repeat(2, 1fr); }
  .bn-item        { min-width: 48px; padding: 6px 8px; }
  .bn-label       { font-size: 9px; }
}

/* Desktop: ensure bottom nav never shows */
@media (min-width: 769px) {
  .bottom-nav { display: none !important; }
  .sidebar-overlay { display: none !important; }
}
