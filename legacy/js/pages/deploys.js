/**
 * EliteHosting — Deploys List (Fixed)
 */
import { auth }           from '../core/auth.js';
import { deploymentsSB }  from '../core/supabase.js';

let allDeps     = [];
let activeFilter = 'all';
let searchQuery  = '';

document.addEventListener('DOMContentLoaded', async () => {
  try { await auth.requireAuth(); } catch { return; }
  initFilters();
  initSearch();
  await loadDeploys();
  subscribeRealtime();
});

/* ── Load ──────────────────────────────────────────────────────── */
async function loadDeploys() {
  const container = document.getElementById('deploysContainer');
  if (!container) return;
  showSkeleton(container);

  try {
    const { data } = await deploymentsSB.list({ limit: 50 });
    allDeps = data.deployments || [];
    renderDeploys();
    updateCounts();
  } catch (e) {
    container.innerHTML = `
      <div class="db-card" style="color:var(--error);font-size:13px;padding:16px">
        ❌ Failed to load deployments.
        <button onclick="location.reload()"
          style="margin-left:8px;color:var(--electric);background:none;border:none;cursor:pointer;text-decoration:underline">
          Retry
        </button>
      </div>`;
  }
}

/* ── Render ────────────────────────────────────────────────────── */
function renderDeploys() {
  const container = document.getElementById('deploysContainer');
  if (!container) return;

  let deps = allDeps;
  if (activeFilter !== 'all') deps = deps.filter(d => d.status === activeFilter);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    deps = deps.filter(d =>
      d.name.toLowerCase().includes(q) ||
      (d.repo_url || '').toLowerCase().includes(q) ||
      (d.framework || '').toLowerCase().includes(q)
    );
  }

  if (!deps.length) {
    container.innerHTML = renderEmpty();
    return;
  }
  container.innerHTML = deps.map(d => renderCard(d)).join('');

  // Action buttons
  container.querySelectorAll('[data-dep-action]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      handleAction(btn.dataset.depAction, btn.dataset.depId, btn);
    });
  });
}

function renderCard(dep) {
  const STATUS = {
    running:   { cls:'st-running',  badge:'ACTIVE'  },
    building:  { cls:'st-building', badge:'BUILDING' },
    deploying: { cls:'st-building', badge:'DEPLOYING'},
    stopped:   { cls:'st-stopped',  badge:'STOPPED'  },
    failed:    { cls:'st-failed',   badge:'FAILED'   },
    pending:   { cls:'st-building', badge:'STARTING' },
  };
  const s    = STATUS[dep.status] || STATUS.stopped;
  const meta = dep.repo_url ? dep.repo_url.replace('https://github.com/','') : dep.framework || 'Generic App';
  const date = new Date(dep.updated_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'});
  const isRunning = dep.status === 'running';

  const canStop    = dep.status === 'running';
  const canStart   = dep.status === 'stopped';
  const canRedeploy= ['stopped','failed','running','building'].includes(dep.status);

  return `
    <div style="position:relative;margin-bottom:12px">
      <a href="/dashboard/deploy-detail.html?id=${dep.id}" class="db-deploy-card ${s.cls}" style="background:var(--color-surface-1);border-radius:14px;padding:16px;border:1px solid var(--border)">
        <div class="db-deploy-dot" style="${isRunning ? 'box-shadow:0 0 10px var(--mint)' : ''}"></div>
        <div class="db-deploy-info">
          <div class="db-deploy-name" style="font-weight:700;font-size:15px;display:flex;align-items:center;gap:8px">
            ${esc(dep.name)}
            ${isRunning ? '<span style="font-size:9px;color:var(--mint);font-family:var(--font-mono);background:var(--success-bg);padding:1px 4px;border-radius:4px">LIVE</span>' : ''}
          </div>
          <div class="db-deploy-meta" style="font-size:11px;opacity:0.6;margin-top:2px">
            <span style="color:var(--electric)">${esc(meta)}</span> • Updated ${date}
          </div>
        </div>
        <div style="text-align:right">
          <span class="db-deploy-badge" style="font-size:10px;font-weight:800;letter-spacing:0.02em">${s.badge}</span>
        </div>
      </a>
      <div style="display:flex;gap:6px;padding:8px 0 0 12px;flex-wrap:wrap">
        ${canRedeploy ? `<button class="db-action-btn" style="padding:6px 12px;font-size:11px;min-height:32px" data-dep-action="redeploy" data-dep-id="${dep.id}">🔄 RE-DEPLOY</button>` : ''}
        ${canStop     ? `<button class="db-action-btn" style="padding:6px 12px;font-size:11px;min-height:32px" data-dep-action="stop"     data-dep-id="${dep.id}">⏹ STOP</button>` : ''}
        ${canStart    ? `<button class="db-action-btn" style="padding:6px 12px;font-size:11px;min-height:32px" data-dep-action="start"    data-dep-id="${dep.id}">▶ START</button>` : ''}
        <button class="db-action-btn danger" style="padding:6px 12px;font-size:11px;min-height:32px;margin-left:auto" data-dep-action="delete" data-dep-id="${dep.id}">🗑 DELETE</button>
      </div>
    </div>`;
}

function renderEmpty() {
  if (activeFilter !== 'all' || searchQuery) {
    return `<div class="db-empty"><div class="db-empty-icon">🔍</div>
      <h3 class="db-empty-title">No results</h3>
      <p class="db-empty-sub">No apps match your filter.</p>
      <button onclick="clearFilters()" class="db-action-btn primary" style="margin:0 auto">Clear Filters</button>
    </div>`;
  }
  return `<div class="db-empty">
    <div class="db-empty-icon">🚀</div>
    <h3 class="db-empty-title">No deployments yet</h3>
    <p class="db-empty-sub">Deploy your first app in under 30 seconds — git push or upload a ZIP.</p>
    <a href="/dashboard/deploy-new.html"
       style="display:inline-flex;padding:12px 24px;background:var(--grad-electric);border-radius:100px;color:#000;font-weight:700;font-size:14px;text-decoration:none;touch-action:manipulation">
      ⚡ Deploy Now
    </a>
  </div>`;
}

/* ── Actions ───────────────────────────────────────────────────── */
async function handleAction(action, id, btn) {
  const dep = allDeps.find(d => d.id === id);
  if (!dep) return;

  if (action === 'delete') {
    if (!confirm(`Delete "${dep.name}"? This cannot be undone.`)) return;
  }

  const origHTML = btn.innerHTML;
  btn.innerHTML  = '<span style="display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:db-spin-kf .65s linear infinite"></span>';
  btn.disabled   = true;

  try {
    if (action === 'redeploy' || action === 'start') {
      await deploymentsSB.redeploy(id);
      const d = allDeps.find(x => x.id === id);
      if (d) d.status = 'pending';
      window.dbToast?.(`🔄 ${dep.name} deploying…`, 'info');
    } else if (action === 'stop') {
      await deploymentsSB.stop(id);
      const d = allDeps.find(x => x.id === id);
      if (d) d.status = 'stopped';
      window.dbToast?.(`⏹ ${dep.name} stopped`, 'info');
    } else if (action === 'delete') {
      await deploymentsSB.remove(id);
      allDeps = allDeps.filter(x => x.id !== id);
      window.dbToast?.(`🗑 ${dep.name} deleted`, 'success');
    }
    renderDeploys();
    updateCounts();
  } catch (err) {
    window.dbToast?.(err?.data?.error || 'Action failed', 'error');
    btn.innerHTML = origHTML;
    btn.disabled  = false;
  }
}

/* ── Filters ───────────────────────────────────────────────────── */
function initFilters() {
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      activeFilter = btn.dataset.filter;
      renderDeploys();
    });
  });
}

function initSearch() {
  document.getElementById('searchInput')?.addEventListener('input', e => {
    searchQuery = e.target.value.trim();
    renderDeploys();
  });
}

window.clearFilters = function () {
  activeFilter = 'all';
  searchQuery  = '';
  document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('is-active'));
  document.querySelector('[data-filter="all"]')?.classList.add('is-active');
  const si = document.getElementById('searchInput');
  if (si) si.value = '';
  renderDeploys();
};

/* ── Counts ────────────────────────────────────────────────────── */
function updateCounts() {
  setText('countAll',     allDeps.length);
  setText('countRunning', allDeps.filter(d => d.status === 'running').length);
  setText('countStopped', allDeps.filter(d => d.status === 'stopped').length);
  setText('countFailed',  allDeps.filter(d => d.status === 'failed').length);
}

/* ── Realtime ──────────────────────────────────────────────────── */
function subscribeRealtime() {
  deploymentsSB.subscribeStatus(null, ({ id, status, public_url }) => {
    const dep = allDeps.find(d => d.id === id);
    if (!dep) return;
    dep.status = status;
    if (public_url) dep.public_url = public_url;
    renderDeploys();
    updateCounts();
  });
}

/* ── Helpers ───────────────────────────────────────────────────── */
function showSkeleton(el) {
  el.innerHTML = [1,2,3].map(() =>
    `<div class="db-skel" style="height:72px;border-radius:16px"></div>`
  ).join('<div style="height:8px"></div>');
}

function setText(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
