/**
 * EliteHosting — Deploy Detail Page JS
 * Live logs via Supabase Realtime · Metrics charts · Tabs · Actions
 */
import { auth } from '../core/auth.js';
import { deploymentsSB } from '../core/supabase.js';
import { toast } from '../components/toast.js';
import { modal } from '../components/modal.js';
import { Terminal } from '../components/terminal.js';
import { MetricsChart } from '../components/metricsChart.js';

let deployment = null;
let terminal   = null;
let charts     = {};
let logUnsub   = null;
let statusUnsub = null;
let refreshInterval = null;

document.addEventListener('DOMContentLoaded', async () => {
  await auth.requireAuth();

  const id = new URLSearchParams(location.search).get('id');
  if (!id) { location.href = '/dashboard/deploys.html'; return; }

  initSidebar();
  initTabs();

  terminal = new Terminal(document.getElementById('logBody'), { height: '380px', maxLines: 800 });

  await loadDeployment(id);

  // Action buttons
  document.getElementById('btnRedeploy')?.addEventListener('click', () => doAction('redeploy', id));
  document.getElementById('btnStop')?.addEventListener('click',     () => doAction('stop', id));
  document.getElementById('btnDelete')?.addEventListener('click',   () => doAction('delete', id));
  document.getElementById('btnDownloadLog')?.addEventListener('click', () => terminal.downloadLog());
  document.getElementById('btnClearLog')?.addEventListener('click',   () => terminal.clear());
  document.getElementById('btnPauseLogs')?.addEventListener('click',  togglePauseLogs);

  // Copy URL
  document.getElementById('btnCopyUrl')?.addEventListener('click', () => {
    const url = deployment?.public_url;
    if (url) { navigator.clipboard.writeText(url); toast.success('URL copied!'); }
  });

  // Auto-refresh when building
  refreshInterval = setInterval(() => {
    if (deployment && ['building','deploying','pending'].includes(deployment.status)) {
      loadDeployment(id, { silent: true });
    }
  }, 20000);

  window.addEventListener('beforeunload', cleanup);
});

function initSidebar() {
  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('mobile-open');
  });
}

/* ── Load Deployment ─────────────────────────────────────────────── */
async function loadDeployment(id, opts = {}) {
  try {
    if (!opts.silent) showHeaderSkeleton();
    const { data } = await deploymentsSB.get(id);
    deployment = data;
    renderHeader(data);
    renderInfoTable(data);
    updateActionButtons(data);
    initMetrics(data);

    if (!opts.silent) {
      await loadBuildLogs(id);
      subscribeRealtime(id);
    }
  } catch (err) {
    if (err?.status === 404) {
      toast.error('Deployment not found');
      setTimeout(() => location.href = '/dashboard/deploys.html', 1500);
    }
  }
}

async function loadBuildLogs(id) {
  try {
    const { data } = await deploymentsSB.getBuildLogs(id);
    if (data?.logs?.length) {
      data.logs.forEach(l => terminal.addLine(l.level || 'info', l.message, l.created_at));
    } else {
      terminal.addLine('system', 'No build logs available yet.', new Date());
    }
  } catch { /* logs not critical */ }
}

/* ── Realtime ──────────────────────────────────────────────────── */
function subscribeRealtime(id) {
  // Live logs
  logUnsub = deploymentsSB.subscribeLogs(id, (log) => {
    terminal.addLine(log.level || 'info', log.message, log.created_at);
  });

  // Status changes
  statusUnsub = deploymentsSB.subscribeStatus(id, (update) => {
    deployment = { ...deployment, ...update };
    renderHeader(deployment);
    updateActionButtons(deployment);
    terminal.setLive(['building','deploying'].includes(update.status));

    if (update.status === 'running') {
      toast.success(`🎉 ${deployment.name} is live!`);
    } else if (update.status === 'failed') {
      toast.error(`❌ Build failed for ${deployment.name}`);
    }
  });

  terminal.setLive(['building','deploying'].includes(deployment?.status));
}

/* ── Header ──────────────────────────────────────────────────────── */
function renderHeader(dep) {
  const S = {
    running:   { emoji:'🟢', label:'Running',   css:'running'   },
    building:  { emoji:'🔵', label:'Building',  css:'building'  },
    deploying: { emoji:'🟡', label:'Deploying', css:'deploying' },
    stopped:   { emoji:'⚪', label:'Stopped',   css:'stopped'   },
    failed:    { emoji:'🔴', label:'Failed',    css:'failed'    },
    pending:   { emoji:'🟣', label:'Pending',   css:'pending'   },
  };
  const s = S[dep.status] || S.stopped;

  setText('deployName',   dep.name);
  setText('deployStatusBadge', `${s.emoji} ${s.label}`);
  document.getElementById('deployStatusBadge')?.setAttribute('data-status', dep.status);
  document.getElementById('deployStatusBadge')?.className.replace(/badge-\w+/,'');
  const badge = document.getElementById('deployStatusBadge');
  if (badge) badge.className = `badge badge-${s.css}`;

  if (dep.public_url) {
    const urlEl = document.getElementById('deployUrl');
    if (urlEl) {
      urlEl.textContent = dep.public_url.replace('https://','');
      urlEl.href = dep.public_url;
    }
    document.getElementById('deployUrlGroup')?.style.removeProperty('display');
  }

  document.title = `${dep.name} — EliteHosting.in`;
}

function showHeaderSkeleton() {
  setText('deployName', '');
  document.getElementById('deployName')?.classList.add('skeleton','skeleton-title');
}

/* ── Info Table ─────────────────────────────────────────────────── */
function renderInfoTable(dep) {
  const rows = [
    ['ID',           dep.id],
    ['Source',       dep.source_type === 'git' ? (dep.repo_url || '—') : 'ZIP Upload'],
    ['Branch',       dep.branch || '—'],
    ['Framework',    dep.framework || 'Auto-detected'],
    ['Start Cmd',    dep.start_cmd],
    ['Build Cmd',    dep.build_cmd || '—'],
    ['Port',         dep.port],
    ['Created',      new Date(dep.created_at).toLocaleString('en-IN')],
    ['Updated',      new Date(dep.updated_at).toLocaleString('en-IN')],
  ];
  const tbody = document.getElementById('infoTableBody');
  if (!tbody) return;
  tbody.innerHTML = rows.map(([k,v]) => `
    <tr>
      <td style="color:var(--text-muted);font-size:12px;padding:10px 16px;border-bottom:1px solid var(--border);white-space:nowrap">${k}</td>
      <td style="font-family:var(--font-mono);font-size:12px;padding:10px 16px;border-bottom:1px solid var(--border);color:var(--electric);word-break:break-all">${escHtml(String(v ?? '—'))}</td>
    </tr>
  `).join('');
}

/* ── Metrics ─────────────────────────────────────────────────────── */
function initMetrics(dep) {
  if (dep.status !== 'running') return;
  const cpuEl = document.getElementById('cpuChart');
  const ramEl = document.getElementById('ramChart');

  if (cpuEl && !charts.cpu) {
    charts.cpu = new MetricsChart(cpuEl, { maxValue: 100, color: '#00D4FF', unit: '%', maxPoints: 40 });
  }
  if (ramEl && !charts.ram) {
    charts.ram = new MetricsChart(ramEl, { maxValue: 512, color: '#7C3AED', unit: 'MB', maxPoints: 40 });
  }

  // Seed with stored metrics
  const metrics = dep.containers?.[0]?.metrics_json;
  if (metrics) {
    charts.cpu?.update(metrics.cpu_percent || 0);
    charts.ram?.update(metrics.memory_usage_mb || 0);
    setText('metricCpu',  `${(metrics.cpu_percent || 0).toFixed(1)}%`);
    setText('metricRam',  `${(metrics.memory_usage_mb || 0).toFixed(0)} MB`);
    setText('metricNetRx', fmtBytes(metrics.network_rx || 0));
    setText('metricNetTx', fmtBytes(metrics.network_tx || 0));
  }
}

/* ── Actions ─────────────────────────────────────────────────────── */
async function doAction(action, id) {
  if (action === 'delete') {
    const ok = await modal.confirm(
      `Delete <strong>${escHtml(deployment?.name || '')}</strong>?<br>
       <span style="color:var(--text-muted);font-size:var(--text-sm)">Cannot be undone. All logs and data will be removed.</span>`,
      { title: 'Delete Deployment', danger: true, okText: '🗑 Delete Forever' }
    );
    if (!ok) return;
  }

  const btnMap = { redeploy: 'btnRedeploy', stop: 'btnStop', delete: 'btnDelete' };
  const btn = document.getElementById(btnMap[action]);
  btn?.classList.add('btn-loading'); if (btn) btn.disabled = true;

  try {
    if (action === 'redeploy') {
      await deploymentsSB.redeploy(id);
      terminal.clear();
      terminal.addLine('system', '─── Redeployment triggered ───', new Date());
      terminal.setLive(true);
      toast.success('🔄 Redeployment started!');
    } else if (action === 'stop') {
      await deploymentsSB.stop(id);
      toast.success('⏹ Deployment stopping...');
    } else if (action === 'delete') {
      await deploymentsSB.remove(id);
      cleanup();
      toast.success('🗑 Deleted');
      setTimeout(() => location.href = '/dashboard/deploys.html', 800);
      return;
    }
    await loadDeployment(id, { silent: true });
  } catch (err) {
    toast.error(err?.data?.error || `${action} failed`);
  } finally {
    btn?.classList.remove('btn-loading'); if (btn) btn.disabled = false;
  }
}

function updateActionButtons(dep) {
  const show = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('hidden', !val);
  };
  show('btnStop',     dep.status === 'running');
  show('btnRedeploy', ['stopped','failed','running','building'].includes(dep.status));
}

/* ── Tabs ─────────────────────────────────────────────────────────── */
function initTabs() {
  document.querySelectorAll('[data-tab-trigger]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tabTrigger;
      document.querySelectorAll('[data-tab-trigger]').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('[data-tab-panel]').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(`[data-tab-panel="${target}"]`)?.classList.add('active');
    });
  });
}

/* ── Pause Logs ──────────────────────────────────────────────────── */
let logsPaused = false;
function togglePauseLogs() {
  logsPaused = !logsPaused;
  const btn = document.getElementById('btnPauseLogs');
  if (logsPaused) {
    terminal.pause();
    if (btn) btn.textContent = '▶ Resume';
    toast.info('Logs paused');
  } else {
    terminal.resume();
    if (btn) btn.textContent = '⏸ Pause';
    toast.info('Logs resumed');
  }
}

/* ── Cleanup ─────────────────────────────────────────────────────── */
function cleanup() {
  logUnsub?.();
  statusUnsub?.();
  clearInterval(refreshInterval);
}

/* ── Helpers ─────────────────────────────────────────────────────── */
function setText(id, txt) {
  const el = document.getElementById(id);
  if (el) el.textContent = txt;
}

function fmtBytes(b) {
  if (!b) return '0 B';
  const k = 1024, s = ['B','KB','MB','GB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${(b / Math.pow(k, i)).toFixed(1)} ${s[i]}`;
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
