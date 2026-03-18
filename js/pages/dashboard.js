/**
 * EliteHosting — Dashboard Overview JS (Fixed)
 */
import { auth }                               from '../core/auth.js';
import { profileSB, deploymentsSB, creditsSB } from '../core/supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
  try { await auth.requireAuth(); } catch { return; }
  await Promise.all([loadProfile(), loadStats(), loadRecentDeploys(), loadCredits()]);
});

/* ── Profile ───────────────────────────────────────────────────── */
async function loadProfile() {
  try {
    const { data: p } = await profileSB.getMe();
    const hour = new Date().getHours();
    const greet = hour < 12 ? '🌅 Good morning' : hour < 17 ? '☀️ Good afternoon' : '🌙 Good evening';
    setText('greetTime', greet);
    setText('greetName', p.username || 'developer');

    // Credit balance everywhere
    const bal = parseFloat(p.credit_balance ?? 0);
    document.querySelectorAll('.credit-balance').forEach(el => el.textContent = bal.toFixed(2));

    // Low credit warning
    if (bal < 1.5) {
      const w = document.getElementById('creditWarning');
      if (w) {
        w.style.display = 'flex';
        setText('creditWarnBal', bal.toFixed(2));
      }
    }
  } catch (e) {
    console.error('Profile load:', e);
    window.dbToast?.('Could not load profile', 'error');
  }
}

/* ── Stats ─────────────────────────────────────────────────────── */
async function loadStats() {
  try {
    const { data } = await deploymentsSB.list({ limit: 100 });
    const deps   = data.deployments;
    const running = deps.filter(d => d.status === 'running').length;
    setText('statRunning', running);
    setText('statTotal',   deps.length);
    setText('statFailed',  deps.filter(d => d.status === 'failed').length);
  } catch {
    setText('statRunning', '—');
    setText('statTotal',   '—');
    setText('statFailed',  '—');
  }
}

/* ── Credits ───────────────────────────────────────────────────── */
async function loadCredits() {
  try {
    const { data } = await creditsSB.getBalance();
    const bal = parseFloat(data.balance ?? 0).toFixed(2);
    document.querySelectorAll('.credit-balance').forEach(el => el.textContent = bal);
  } catch {}
}

/* ── Recent Deploys ────────────────────────────────────────────── */
async function loadRecentDeploys() {
  const container = document.getElementById('recentDeploys');
  if (!container) return;
  try {
    const { data } = await deploymentsSB.list({ limit: 5 });
    const deps = data.deployments;
    if (!deps.length) {
      container.innerHTML = `
        <div class="db-empty">
          <div class="db-empty-icon">🚀</div>
          <h3 class="db-empty-title">No apps yet</h3>
          <p class="db-empty-sub">Deploy your first app in 30 seconds</p>
          <a href="/dashboard/deploy-new.html"
             style="display:inline-flex;align-items:center;gap:6px;padding:12px 24px;background:var(--grad-electric);border-radius:100px;color:#000;font-weight:700;font-size:14px;text-decoration:none;touch-action:manipulation">
            ⚡ Deploy Now
          </a>
        </div>`;
      return;
    }
    container.innerHTML = deps.map(dep => renderDeployCard(dep)).join('');
  } catch (e) {
    container.innerHTML = `
      <div class="db-card" style="color:var(--error);font-size:13px">
        ❌ Failed to load apps. <button onclick="location.reload()"
          style="color:var(--electric);background:none;border:none;cursor:pointer;text-decoration:underline">Retry</button>
      </div>`;
  }
}

function renderDeployCard(dep) {
  const STATUS = {
    running:   'st-running',
    building:  'st-building',
    deploying: 'st-building',
    stopped:   'st-stopped',
    failed:    'st-failed',
    pending:   'st-building',
  };
  const BADGE = {
    running:'Running', building:'Building', deploying:'Deploying',
    stopped:'Stopped', failed:'Failed', pending:'Starting…',
  };
  const cls   = STATUS[dep.status] || 'st-stopped';
  const badge = BADGE[dep.status]  || 'Unknown';
  const meta  = dep.repo_url ? dep.repo_url.replace('https://github.com/','') : dep.framework || 'App';
  const date  = new Date(dep.updated_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'});

  return `
    <a href="/dashboard/deploy-detail.html?id=${dep.id}" class="db-deploy-card ${cls}">
      <div class="db-deploy-dot"></div>
      <div class="db-deploy-info">
        <div class="db-deploy-name">${esc(dep.name)}</div>
        <div class="db-deploy-meta">${esc(meta)} · ${date}</div>
      </div>
      <span class="db-deploy-badge">${badge}</span>
    </a>`;
}

function setText(id, txt) { const el = document.getElementById(id); if (el) el.textContent = txt; }
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
