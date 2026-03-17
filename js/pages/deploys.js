/**
 * EliteHosting — Deploys List Page JS
 */
import { auth } from '../core/auth.js';
import { deploymentsSB } from '../core/supabase.js';
import { toast } from '../components/toast.js';
import { modal } from '../components/modal.js';

let allDeps = [];
let activeFilter = 'all';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', async () => {
  await auth.requireAuth();
  initSidebar();
  await loadDeploys();
  initFilters();
  initSearch();
  subscribeRealtime();
});

function initSidebar() {
  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  toggle?.addEventListener('click', () => sidebar?.classList.toggle('mobile-open'));
  const path = location.pathname;
  document.querySelectorAll('.nav-item[href]').forEach(a =>
    a.classList.toggle('active', a.getAttribute('href') === path)
  );
}

async function loadDeploys() {
  const container = document.getElementById('deploysContainer');
  showSkeleton(container);

  try {
    const { data } = await deploymentsSB.list({ limit: 50 });
    allDeps = data?.deployments || [];
    renderDeploys();
    updateCounts();
  } catch {
    container.innerHTML = `<div class="card" style="color:var(--error);padding:var(--s6)">
      ❌ Failed to load deployments. <button class="btn btn-ghost btn-sm" onclick="location.reload()">Retry</button>
    </div>`;
  }
}

function renderDeploys() {
  const container = document.getElementById('deploysContainer');
  let deps = allDeps;

  // Filter by status
  if (activeFilter !== 'all') {
    deps = deps.filter(d => d.status === activeFilter);
  }
  // Filter by search
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

  container.innerHTML = deps.map(dep => renderDeployCard(dep)).join('');

  // Attach action buttons
  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault(); e.stopPropagation();
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      await handleAction(action, id, btn);
    });
  });
}

function renderDeployCard(dep) {
  const S = {
    running:   { e: '🟢', c: 'running',   l: 'Running'   },
    building:  { e: '🔵', c: 'building',  l: 'Building'  },
    deploying: { e: '🟡', c: 'deploying', l: 'Deploying' },
    stopped:   { e: '⚪', c: 'stopped',   l: 'Stopped'   },
    failed:    { e: '🔴', c: 'failed',    l: 'Failed'    },
    pending:   { e: '🟣', c: 'pending',   l: 'Pending'   },
  };
  const s = S[dep.status] || S.stopped;
  const updated = new Date(dep.updated_at).toLocaleString('en-IN', {
    day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'
  });

  const canStop    = dep.status === 'running';
  const canStart   = dep.status === 'stopped';
  const canRedeploy= ['stopped','failed','running'].includes(dep.status);

  return `
    <a href="/dashboard/deploy-detail.html?id=${dep.id}"
       class="deploy-card ${s.c}" style="display:grid;grid-template-columns:1fr auto;gap:var(--s4);align-items:start">
      <div>
        <div style="display:flex;align-items:center;gap:var(--s3);margin-bottom:var(--s2)">
          <span class="deploy-card-name">${escHtml(dep.name)}</span>
          <span class="badge badge-${s.c}">${s.e} ${s.l}</span>
        </div>
        ${dep.public_url ? `
          <div class="deploy-card-url">
            <a href="${dep.public_url}" target="_blank" rel="noopener"
               onclick="event.stopPropagation()"
               style="color:var(--electric)">
              🌐 ${dep.public_url.replace('https://','')}
            </a>
          </div>
        ` : ''}
        <div class="deploy-card-meta">
          <span>${dep.source_type === 'git' ? '⑇ ' + (dep.branch || 'main') : '📦 ZIP'}</span>
          <span>${dep.framework || 'Auto-detect'}</span>
          <span>Port ${dep.port || 3000}</span>
          <span>⏱ ${updated}</span>
        </div>
      </div>
      <div style="display:flex;gap:var(--s2);flex-wrap:wrap;justify-content:flex-end" onclick="event.stopPropagation()">
        ${canRedeploy ? `<button class="btn btn-ghost btn-sm" data-action="redeploy" data-id="${dep.id}" aria-label="Redeploy ${dep.name}">🔄 Deploy</button>` : ''}
        ${canStop    ? `<button class="btn btn-ghost btn-sm" data-action="stop"     data-id="${dep.id}" aria-label="Stop ${dep.name}">⏹ Stop</button>` : ''}
        ${canStart   ? `<button class="btn btn-ghost btn-sm" data-action="start"    data-id="${dep.id}" aria-label="Start ${dep.name}">▶ Start</button>` : ''}
        <button class="btn btn-danger btn-sm" data-action="delete" data-id="${dep.id}" aria-label="Delete ${dep.name}">🗑</button>
      </div>
    </a>
  `;
}

function renderEmpty() {
  if (activeFilter !== 'all' || searchQuery) {
    return `
      <div class="card text-center" style="padding:var(--s10)">
        <div style="font-size:36px;margin-bottom:var(--s4)">🔍</div>
        <h3 style="margin-bottom:var(--s2)">No results</h3>
        <p style="color:var(--text-muted)">No deployments match your filter.</p>
        <button class="btn btn-ghost btn-md" style="margin-top:var(--s4)" onclick="clearFilters()">Clear Filters</button>
      </div>
    `;
  }
  return `
    <div class="card text-center" style="padding:var(--s12)">
      <div style="font-size:48px;margin-bottom:var(--s5)">🚀</div>
      <h3 style="margin-bottom:var(--s3)">No deployments yet</h3>
      <p style="color:var(--text-muted);margin-bottom:var(--s6)">
        Deploy your first app in under 30 seconds — just push to Git or upload a ZIP.
      </p>
      <a href="/dashboard/deploy-new.html" class="btn btn-electric btn-lg">⚡ New Deployment</a>
    </div>
  `;
}

function initFilters() {
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      renderDeploys();
    });
  });
}

function initSearch() {
  const input = document.getElementById('searchInput');
  input?.addEventListener('input', () => {
    searchQuery = input.value.trim();
    renderDeploys();
  });
}

window.clearFilters = function() {
  activeFilter = 'all';
  searchQuery = '';
  document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
  document.querySelector('[data-filter="all"]')?.classList.add('active');
  const si = document.getElementById('searchInput');
  if (si) si.value = '';
  renderDeploys();
};

async function handleAction(action, id, btn) {
  const dep = allDeps.find(d => d.id === id);
  if (!dep) return;

  if (action === 'delete') {
    const ok = await modal.confirm(
      `Delete <strong>${escHtml(dep.name)}</strong>?<br>
       <span style="color:var(--text-muted);font-size:var(--text-sm)">This action cannot be undone.</span>`,
      { title: 'Delete Deployment', danger: true, okText: '🗑 Delete' }
    );
    if (!ok) return;
  }

  const origText = btn.innerHTML;
  btn.innerHTML = '<span class="anim-spin" style="display:inline-block">↻</span>';
  btn.disabled = true;

  try {
    if (action === 'redeploy') {
      await deploymentsSB.redeploy(id);
      // Update local state
      const d = allDeps.find(x => x.id === id);
      if (d) d.status = 'pending';
      toast.success(`🔄 Redeploying ${dep.name}...`);
    } else if (action === 'stop') {
      await deploymentsSB.stop(id);
      const d = allDeps.find(x => x.id === id);
      if (d) d.status = 'stopped';
      toast.success(`⏹ ${dep.name} stopped`);
    } else if (action === 'start') {
      await deploymentsSB.redeploy(id);
      const d = allDeps.find(x => x.id === id);
      if (d) d.status = 'pending';
      toast.success(`▶ Starting ${dep.name}...`);
    } else if (action === 'delete') {
      await deploymentsSB.remove(id);
      allDeps = allDeps.filter(x => x.id !== id);
      toast.success(`🗑 ${dep.name} deleted`);
    }
    renderDeploys();
    updateCounts();
  } catch (err) {
    toast.error(err?.data?.error || `Action failed`);
    btn.innerHTML = origText;
    btn.disabled = false;
  }
}

function updateCounts() {
  const running = allDeps.filter(d => d.status === 'running').length;
  const all     = allDeps.length;
  setText('countAll', all);
  setText('countRunning', running);
  setText('countStopped', allDeps.filter(d => d.status === 'stopped').length);
  setText('countFailed', allDeps.filter(d => d.status === 'failed').length);
}

function subscribeRealtime() {
  // Live status updates for any deployment in the list
  deploymentsSB.subscribeStatus(null, ({ id, status, public_url }) => {
    const dep = allDeps.find(d => d.id === id);
    if (!dep) return;
    dep.status = status;
    if (public_url) dep.public_url = public_url;
    renderDeploys();
    updateCounts();
  });
}

function showSkeleton(el) {
  el.innerHTML = Array(3).fill(0).map(() => `
    <div class="card" style="padding:var(--s5)">
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-text" style="width:60%"></div>
      <div class="skeleton skeleton-text" style="width:40%;margin-top:var(--s3)"></div>
    </div>
  `).join('');
}

function setText(id, txt) {
  const el = document.getElementById(id);
  if (el) el.textContent = txt;
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
