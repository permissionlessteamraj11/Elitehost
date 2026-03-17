/**
 * EliteHosting — New Deployment Wizard JS
 * 4-step: Source → Configure → Env Vars → Review & Deploy
 */
import { auth } from '../core/auth.js';
import { deploymentsSB, creditsSB } from '../core/supabase.js';
import { toast } from '../components/toast.js';

let step = 1;
const MAX_STEPS = 4;
let deployData = {
  name: '', sourceType: 'git',
  repoUrl: '', branch: 'main',
  zipFile: null, zipName: '',
  startCmd: '', buildCmd: '', port: 3000,
  envVars: [], // [{key, value, secret}]
  framework: '',
};

document.addEventListener('DOMContentLoaded', async () => {
  await auth.requireAuth();
  initSidebar();

  // Check credits
  try {
    const { data } = await creditsSB.getBalance();
    const bal = parseFloat(data?.balance || 0);
    if (bal < 1) {
      document.getElementById('noCreditsBanner')?.style.setProperty('display', 'flex');
    }
    document.querySelectorAll('.credit-balance').forEach(el => el.textContent = bal.toFixed(2));
  } catch { /* non-fatal */ }

  initWizardNav();
  initStep1();
  initStep2();
  initStep3();
  initStep4();
  initDropzone();
  showStep(1);
});

function initSidebar() {
  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  toggle?.addEventListener('click', () => sidebar?.classList.toggle('mobile-open'));
  document.querySelectorAll('.nav-item[href]').forEach(a =>
    a.classList.toggle('active', a.getAttribute('href') === location.pathname)
  );
}

/* ── Wizard Navigation ──────────────────────────────────────────── */
function initWizardNav() {
  document.getElementById('btnNext')?.addEventListener('click', async () => {
    if (await validateCurrentStep()) goNext();
  });
  document.getElementById('btnBack')?.addEventListener('click', () => {
    if (step > 1) { step--; showStep(step); }
  });
  document.getElementById('btnDeploy')?.addEventListener('click', doDeploy);
}

function showStep(n) {
  step = n;
  document.querySelectorAll('.wizard-step-content').forEach((el, i) => {
    el.classList.toggle('active', i + 1 === n);
    el.hidden = i + 1 !== n;
  });
  document.querySelectorAll('.wizard-step').forEach((el, i) => {
    el.classList.toggle('active', i + 1 === n);
    el.classList.toggle('done', i + 1 < n);
  });

  // Button visibility
  const btnBack  = document.getElementById('btnBack');
  const btnNext  = document.getElementById('btnNext');
  const btnDeploy = document.getElementById('btnDeploy');

  btnBack?.classList.toggle('hidden', n === 1);
  btnNext?.classList.toggle('hidden', n === MAX_STEPS);
  btnDeploy?.classList.toggle('hidden', n !== MAX_STEPS);

  // Update review on last step
  if (n === MAX_STEPS) buildReview();
}

function goNext() {
  if (step < MAX_STEPS) { step++; showStep(step); }
}

/* ── Step 1: Source ─────────────────────────────────────────────── */
function initStep1() {
  const nameEl   = document.getElementById('appName');
  const gitBtn   = document.getElementById('srcGit');
  const zipBtn   = document.getElementById('srcZip');
  const gitBlock = document.getElementById('gitBlock');
  const zipBlock = document.getElementById('zipBlock');

  // App name: sanitize
  nameEl?.addEventListener('input', () => {
    nameEl.value = nameEl.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-');
    deployData.name = nameEl.value;
    clearError(nameEl);
  });

  // Source toggle
  function setSourceType(type) {
    deployData.sourceType = type;
    gitBtn?.classList.toggle('active', type === 'git');
    zipBtn?.classList.toggle('active', type === 'zip');
    gitBlock && (gitBlock.hidden = type !== 'git');
    zipBlock && (zipBlock.hidden = type !== 'zip');
  }

  gitBtn?.addEventListener('click', () => setSourceType('git'));
  zipBtn?.addEventListener('click', () => setSourceType('zip'));
  setSourceType('git');

  // Repo URL auto-set branch
  document.getElementById('repoUrl')?.addEventListener('input', (e) => {
    deployData.repoUrl = e.target.value.trim();
    clearError(e.target);
  });

  document.getElementById('branch')?.addEventListener('input', (e) => {
    deployData.branch = e.target.value.trim() || 'main';
  });

  // Quick branch buttons
  document.querySelectorAll('[data-branch]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.branch;
      const inp = document.getElementById('branch');
      if (inp) { inp.value = val; deployData.branch = val; }
    });
  });
}

/* ── Step 2: Configure ──────────────────────────────────────────── */
function initStep2() {
  // Framework quick-picks
  document.querySelectorAll('[data-framework]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-framework]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      deployData.framework = btn.dataset.framework;

      // Auto-fill commands based on framework
      const PRESETS = {
        nodejs:   { start: 'npm start',                  build: '',                     port: 3000 },
        nextjs:   { start: 'npm start',                  build: 'npm run build',        port: 3000 },
        express:  { start: 'node index.js',              build: '',                     port: 3000 },
        nestjs:   { start: 'node dist/main',             build: 'npm run build',        port: 3000 },
        flask:    { start: 'gunicorn app:app --bind 0.0.0.0:$PORT', build: 'pip install -r requirements.txt', port: 5000 },
        django:   { start: 'gunicorn core.wsgi:application --bind 0.0.0.0:$PORT', build: 'pip install -r requirements.txt', port: 8000 },
        fastapi:  { start: 'uvicorn main:app --host 0.0.0.0 --port $PORT', build: 'pip install -r requirements.txt', port: 8000 },
        go:       { start: './app',                      build: 'go build -o app .',    port: 8080 },
        docker:   { start: '',                           build: '',                     port: 3000 },
      };
      const p = PRESETS[btn.dataset.framework] || {};
      const startEl = document.getElementById('startCmd');
      const buildEl = document.getElementById('buildCmd');
      const portEl  = document.getElementById('port');
      if (startEl && p.start !== undefined) { startEl.value = p.start; deployData.startCmd = p.start; }
      if (buildEl && p.build !== undefined) { buildEl.value = p.build; deployData.buildCmd = p.build; }
      if (portEl  && p.port)               { portEl.value  = p.port;  deployData.port     = p.port; }
    });
  });

  // Manual field sync
  ['startCmd','buildCmd','port'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', (e) => {
      deployData[id] = id === 'port' ? parseInt(e.target.value) || 3000 : e.target.value;
      clearError(e.target);
    });
  });

  // Port quick-buttons
  document.querySelectorAll('[data-port]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = parseInt(btn.dataset.port);
      const inp = document.getElementById('port');
      if (inp) { inp.value = val; deployData.port = val; }
    });
  });
}

/* ── Step 3: Env Vars ───────────────────────────────────────────── */
function initStep3() {
  const addBtn  = document.getElementById('addEnvBtn');
  const keyEl   = document.getElementById('envKey');
  const valEl   = document.getElementById('envVal');
  const secEl   = document.getElementById('envSecret');
  const listEl  = document.getElementById('envList');

  addBtn?.addEventListener('click', () => {
    const key = keyEl?.value.trim().toUpperCase().replace(/\s/g, '_');
    const val = valEl?.value;
    if (!key) { toast.warn('Enter a variable name'); keyEl?.focus(); return; }
    if (deployData.envVars.some(e => e.key === key)) {
      toast.warn(`${key} already exists`); keyEl?.focus(); return;
    }
    deployData.envVars.push({ key, value: val, secret: secEl?.checked });
    if (keyEl) keyEl.value = '';
    if (valEl) valEl.value = '';
    if (secEl) secEl.checked = false;
    renderEnvList();
  });

  // Enter key to add
  [keyEl, valEl].forEach(el => {
    el?.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); addBtn?.click(); }
    });
  });

  function renderEnvList() {
    if (!listEl) return;
    if (!deployData.envVars.length) {
      listEl.innerHTML = '<p style="color:var(--text-muted);font-size:var(--text-sm);text-align:center;padding:var(--s4)">No environment variables added.</p>';
      return;
    }
    listEl.innerHTML = deployData.envVars.map((e, i) => `
      <div style="display:flex;align-items:center;gap:var(--s3);padding:var(--s3) 0;border-bottom:1px solid var(--border)">
        <span class="badge ${e.secret ? 'badge-running' : 'badge-stopped'}" style="min-width:50px;justify-content:center">
          ${e.secret ? '🔒' : '📝'}
        </span>
        <code style="flex:1;font-size:11px;color:var(--electric)">${escHtml(e.key)}</code>
        <span style="flex:1;font-size:12px;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
          ${e.secret ? '••••••••' : escHtml(e.value || '(empty)')}
        </span>
        <button class="btn btn-danger btn-xs" onclick="removeEnv(${i})" aria-label="Remove ${escHtml(e.key)}">✕</button>
      </div>
    `).join('');
  }

  window.removeEnv = function(i) {
    deployData.envVars.splice(i, 1);
    renderEnvList();
  };

  renderEnvList();
}

/* ── Step 4: Review ─────────────────────────────────────────────── */
function initStep4() {
  document.getElementById('btnEditStep1')?.addEventListener('click', () => showStep(1));
  document.getElementById('btnEditStep2')?.addEventListener('click', () => showStep(2));
  document.getElementById('btnEditStep3')?.addEventListener('click', () => showStep(3));
}

function buildReview() {
  const rows = [
    ['App Name',    deployData.name || '—'],
    ['Source',      deployData.sourceType === 'git' ? `⑇ ${deployData.repoUrl || '—'} (${deployData.branch})` : `📦 ${deployData.zipName || 'ZIP File'}`],
    ['Framework',   deployData.framework || 'Auto-detect'],
    ['Start Cmd',   deployData.startCmd || '—'],
    ['Build Cmd',   deployData.buildCmd || '(none)'],
    ['Port',        deployData.port || 3000],
    ['Env Vars',    `${deployData.envVars.length} (${deployData.envVars.filter(e=>e.secret).length} secrets)`],
  ];

  const el = document.getElementById('reviewTable');
  if (el) {
    el.innerHTML = rows.map(([k, v]) => `
      <tr>
        <td style="color:var(--text-muted);font-size:12px;padding:10px 0;border-bottom:1px solid var(--border);white-space:nowrap;padding-right:var(--s5)">${k}</td>
        <td style="font-size:13px;padding:10px 0;border-bottom:1px solid var(--border);color:var(--electric);font-family:var(--font-mono);word-break:break-all">${escHtml(String(v))}</td>
      </tr>
    `).join('');
  }
}

/* ── Dropzone ───────────────────────────────────────────────────── */
function initDropzone() {
  const zone    = document.getElementById('dropzone');
  const fileInput = document.getElementById('zipInput');
  if (!zone) return;

  zone.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', () => handleFile(fileInput.files[0]));

  zone.addEventListener('dragover', e => {
    e.preventDefault(); zone.classList.add('drag-over');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('drag-over');
    handleFile(e.dataTransfer.files[0]);
  });

  function handleFile(file) {
    if (!file) return;
    if (!file.name.endsWith('.zip')) { toast.error('Only ZIP files accepted.'); return; }
    if (file.size > 100 * 1024 * 1024) { toast.error('Max file size is 100 MB.'); return; }
    deployData.zipFile = file;
    deployData.zipName = file.name;
    zone.classList.add('has-file');
    zone.innerHTML = `
      <div class="dropzone-icon">📦</div>
      <div class="dropzone-title">${escHtml(file.name)}</div>
      <div class="dropzone-sub">${(file.size / 1024 / 1024).toFixed(2)} MB — ready to upload</div>
    `;
  }
}

/* ── Validation ─────────────────────────────────────────────────── */
async function validateCurrentStep() {
  if (step === 1) {
    if (!deployData.name || deployData.name.length < 2) {
      setError(document.getElementById('appName'), 'App name required (min 2 chars)'); return false;
    }
    if (!deployData.name.match(/^[a-z0-9-]{2,40}$/)) {
      setError(document.getElementById('appName'), 'Only lowercase letters, numbers, hyphens'); return false;
    }
    if (deployData.sourceType === 'git') {
      const url = document.getElementById('repoUrl')?.value.trim();
      if (!url || !url.includes('github.com') && !url.includes('gitlab.com') && !url.includes('bitbucket.org')) {
        setError(document.getElementById('repoUrl'), 'Enter a valid GitHub/GitLab URL'); return false;
      }
      deployData.repoUrl = url;
    } else {
      if (!deployData.zipFile) { toast.warn('Please upload a ZIP file.'); return false; }
    }
  }
  if (step === 2) {
    if (!deployData.startCmd.trim()) {
      setError(document.getElementById('startCmd'), 'Start command required'); return false;
    }
    const port = parseInt(document.getElementById('port')?.value);
    if (!port || port < 1 || port > 65535) {
      setError(document.getElementById('port'), 'Valid port 1–65535 required'); return false;
    }
    deployData.port = port;
  }
  return true;
}

/* ── Deploy ─────────────────────────────────────────────────────── */
async function doDeploy() {
  const btn = document.getElementById('btnDeploy');
  btn.classList.add('btn-loading'); btn.disabled = true;

  try {
    let payload;
    if (deployData.sourceType === 'zip' && deployData.zipFile) {
      // Upload as multipart
      const form = new FormData();
      form.append('name',     deployData.name);
      form.append('sourceType', 'zip');
      form.append('startCmd', deployData.startCmd);
      form.append('buildCmd', deployData.buildCmd || '');
      form.append('port',     deployData.port);
      form.append('framework', deployData.framework || '');
      form.append('envVars',  JSON.stringify(deployData.envVars));
      form.append('zipFile',  deployData.zipFile);
      payload = { formData: form };
    } else {
      payload = {
        name:       deployData.name,
        sourceType: 'git',
        repoUrl:    deployData.repoUrl,
        branch:     deployData.branch || 'main',
        startCmd:   deployData.startCmd,
        buildCmd:   deployData.buildCmd,
        port:       deployData.port,
        framework:  deployData.framework,
        envVars:    deployData.envVars,
      };
    }

    const { data } = await deploymentsSB.create(payload);
    toast.success('🚀 Deployment started!');
    setTimeout(() => {
      location.href = `/dashboard/deploy-detail.html?id=${data.id}`;
    }, 800);
  } catch (err) {
    toast.error(err?.data?.error || 'Deployment failed. Try again.');
  } finally {
    btn.classList.remove('btn-loading'); btn.disabled = false;
  }
}

/* ── Helpers ────────────────────────────────────────────────────── */
function setError(el, msg) {
  if (!el) { toast.error(msg); return; }
  el.classList.add('error');
  const hint = el.closest('.input-group')?.querySelector('.input-error-msg');
  if (hint) hint.textContent = msg;
}

function clearError(el) {
  el.classList.remove('error');
  const hint = el.closest('.input-group')?.querySelector('.input-error-msg');
  if (hint) hint.textContent = '';
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
