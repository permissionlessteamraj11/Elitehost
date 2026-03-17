/**
 * EliteHosting — AI Assistant Page JS
 */
import { auth } from '../core/auth.js';
import { aiSB, deploymentsSB, creditsSB } from '../core/supabase.js';
import { toast } from '../components/toast.js';
import { modal } from '../components/modal.js';

const AI_TASKS = [
  { id: 'dockerfile',   icon: '🐳', label: 'Dockerfile',      cost: 0.25, desc: 'Generate optimized Dockerfile for your app' },
  { id: 'compose',      icon: '📦', label: 'docker-compose',  cost: 0.25, desc: 'Create docker-compose.yml for multi-service apps' },
  { id: 'envguide',     icon: '🔑', label: 'Env Variables',   cost: 0.10, desc: 'Suggest required environment variables' },
  { id: 'startcmd',     icon: '▶',  label: 'Start Command',   cost: 0.10, desc: 'Find the right start command for your framework' },
  { id: 'debug',        icon: '🔧', label: 'Fix Build Error',  cost: 0.50, desc: 'Analyze and fix deployment errors' },
  { id: 'optimize',     icon: '⚡', label: 'Optimize Build',   cost: 0.50, desc: 'Speed up build time and reduce image size' },
  { id: 'readme',       icon: '📖', label: 'Generate README',  cost: 0.25, desc: 'Create README.md from your code' },
  { id: 'chat',         icon: '💬', label: 'AI Chat',          cost: 0.10, desc: 'Ask anything about your deployment' },
];

let selectedTask = null;
let chatHistory  = [];
let deployments  = [];
let creditBalance = 0;

document.addEventListener('DOMContentLoaded', async () => {
  await auth.requireAuth();
  initSidebar();

  const [, creds] = await Promise.all([
    loadDeployments(),
    loadBalance(),
  ]);

  renderTaskGrid();
  initChatUI();
});

function initSidebar() {
  document.getElementById('sidebarToggle')?.addEventListener('click', () =>
    document.getElementById('sidebar')?.classList.toggle('mobile-open')
  );
  document.querySelectorAll('.nav-item[href]').forEach(a =>
    a.classList.toggle('active', a.getAttribute('href') === location.pathname)
  );
}

async function loadDeployments() {
  try {
    const { data } = await deploymentsSB.list({ limit: 50 });
    deployments = data?.deployments || [];
    renderDeploySelect();
  } catch { /* non-fatal */ }
}

async function loadBalance() {
  try {
    const { data } = await creditsSB.getBalance();
    creditBalance = parseFloat(data?.balance ?? 0);
    document.querySelectorAll('.credit-balance').forEach(el => el.textContent = creditBalance.toFixed(2));
  } catch { /* non-fatal */ }
}

function renderTaskGrid() {
  const grid = document.getElementById('taskGrid');
  if (!grid) return;

  grid.innerHTML = AI_TASKS.map(t => `
    <button class="card ai-task-card" data-task="${t.id}"
            style="text-align:left;cursor:pointer;transition:all var(--t-base);padding:var(--s5)"
            aria-label="${t.label} — ${t.desc}">
      <div style="display:flex;align-items:center;gap:var(--s3);margin-bottom:var(--s2)">
        <span style="font-size:24px">${t.icon}</span>
        <span style="font-weight:600;font-size:var(--text-base)">${t.label}</span>
      </div>
      <p style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:var(--s3)">${t.desc}</p>
      <div style="display:flex;align-items:center;gap:var(--s2)">
        <span class="badge badge-stopped" style="font-size:10px">${t.cost} credits</span>
      </div>
    </button>
  `).join('');

  grid.querySelectorAll('.ai-task-card').forEach(card => {
    card.addEventListener('click', () => {
      const task = AI_TASKS.find(t => t.id === card.dataset.task);
      if (task) selectTask(task);
    });
  });
}

function renderDeploySelect() {
  const sel = document.getElementById('deploySelect');
  if (!sel || !deployments.length) return;

  sel.innerHTML = `<option value="">— No specific deployment —</option>` +
    deployments.map(d => `<option value="${d.id}">${escHtml(d.name)} (${d.status})</option>`).join('');
}

function selectTask(task) {
  selectedTask = task;
  document.querySelectorAll('.ai-task-card').forEach(c => c.classList.remove('card-electric'));
  document.querySelector(`[data-task="${task.id}"]`)?.classList.add('card-electric');

  const panel = document.getElementById('taskPanel');
  if (panel) {
    panel.style.display = 'block';
    setText('taskTitle',   task.icon + ' ' + task.label);
    setText('taskCost',    task.cost.toFixed(2) + ' credits');
    setText('taskBalance', creditBalance.toFixed(2) + ' credits');
    document.getElementById('taskCostOk')?.classList.toggle('hidden', creditBalance < task.cost);
    document.getElementById('taskCostWarn')?.classList.toggle('hidden', creditBalance >= task.cost);

    // Show context input for relevant tasks
    const ctxGroup = document.getElementById('contextGroup');
    if (ctxGroup) {
      ctxGroup.style.display = ['debug','optimize','chat'].includes(task.id) ? 'block' : 'none';
    }
    if (task.id === 'chat') {
      document.getElementById('chatSection')?.style.setProperty('display', 'block');
      document.getElementById('singleResultSection')?.style.setProperty('display', 'none');
    } else {
      document.getElementById('chatSection')?.style.setProperty('display', 'none');
      document.getElementById('singleResultSection')?.style.setProperty('display', 'block');
    }
  }
}

function initChatUI() {
  document.getElementById('taskRunBtn')?.addEventListener('click', runTask);
  document.getElementById('chatSendBtn')?.addEventListener('click', sendChat);
  document.getElementById('chatInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); }
  });
}

async function runTask() {
  if (!selectedTask) { toast.warn('Select an AI task first'); return; }
  if (creditBalance < selectedTask.cost) {
    toast.error('Insufficient credits. Please top up your account.');
    return;
  }

  const btn = document.getElementById('taskRunBtn');
  btn.classList.add('btn-loading'); btn.disabled = true;

  const deployId = document.getElementById('deploySelect')?.value || null;
  const context  = document.getElementById('contextInput')?.value?.trim() || '';

  try {
    const { data } = await aiSB.execute({
      task:         selectedTask.id,
      deploymentId: deployId || undefined,
      context,
      confirmed:    true,
    });

    creditBalance = Math.max(0, creditBalance - selectedTask.cost);
    document.querySelectorAll('.credit-balance').forEach(el => el.textContent = creditBalance.toFixed(2));

    renderResult(data.content, selectedTask);
  } catch (err) {
    toast.error(err?.data?.error || 'AI task failed. Try again.');
  } finally {
    btn.classList.remove('btn-loading'); btn.disabled = false;
  }
}

function renderResult(content, task) {
  const container = document.getElementById('aiResult');
  if (!container) return;

  container.style.display = 'block';
  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--s4)">
      <h3 style="font-size:var(--text-base)">${task.icon} ${task.label} Result</h3>
      <div style="display:flex;gap:var(--s2)">
        <button class="btn btn-ghost btn-sm" onclick="copyResult()">📋 Copy</button>
        <button class="btn btn-ghost btn-sm" onclick="clearResult()">✕</button>
      </div>
    </div>
    <div id="resultContent" class="terminal" style="padding:var(--s4);border-radius:var(--r-lg);max-height:500px;overflow-y:auto">
      <pre style="font-family:var(--font-mono);font-size:12px;line-height:1.65;white-space:pre-wrap;color:var(--text-secondary)">${escHtml(content)}</pre>
    </div>
  `;
}

window.copyResult = function() {
  const el = document.getElementById('resultContent');
  const text = el?.querySelector('pre')?.textContent || '';
  navigator.clipboard.writeText(text);
  toast.success('Copied to clipboard!');
};

window.clearResult = function() {
  const container = document.getElementById('aiResult');
  if (container) container.style.display = 'none';
};

/* ── Chat UI ─────────────────────────────────────────────────────── */
async function sendChat() {
  const input = document.getElementById('chatInput');
  const message = input?.value.trim();
  if (!message) return;

  if (creditBalance < 0.10) {
    toast.error('Insufficient credits for chat.');
    return;
  }

  input.value = '';
  appendChatMsg('user', message);

  const thinkingEl = appendChatMsg('assistant', '⏳ Thinking...');
  const sendBtn = document.getElementById('chatSendBtn');
  sendBtn.disabled = true;

  const deployId = document.getElementById('deploySelect')?.value || null;

  try {
    chatHistory.push({ role: 'user', content: message });

    const { data } = await aiSB.execute({
      task: 'chat',
      context: message,
      history: chatHistory,
      deploymentId: deployId || undefined,
      confirmed: true,
    });

    chatHistory.push({ role: 'assistant', content: data.content });
    creditBalance = Math.max(0, creditBalance - 0.10);
    document.querySelectorAll('.credit-balance').forEach(el => el.textContent = creditBalance.toFixed(2));

    thinkingEl.innerHTML = formatChatMessage(data.content);
  } catch (err) {
    thinkingEl.innerHTML = `<span style="color:var(--error)">❌ ${escHtml(err?.data?.error || 'Failed to get response')}</span>`;
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
}

function appendChatMsg(role, content) {
  const chatEl = document.getElementById('chatMessages');
  if (!chatEl) return null;

  const div = document.createElement('div');
  div.style.cssText = `
    display:flex; gap:var(--s3); margin-bottom:var(--s4);
    ${role === 'user' ? 'flex-direction:row-reverse' : ''}
  `;

  const avatar = document.createElement('div');
  avatar.style.cssText = `
    width:32px; height:32px; border-radius:50%; flex-shrink:0;
    background:${role === 'user' ? 'var(--electric)' : 'var(--plasma)'};
    display:flex; align-items:center; justify-content:center;
    font-size:14px; color:#fff;
  `;
  avatar.textContent = role === 'user' ? '👤' : '🤖';

  const bubble = document.createElement('div');
  bubble.style.cssText = `
    background:${role === 'user' ? 'var(--electric-soft)' : 'var(--color-surface-2)'};
    border:1px solid ${role === 'user' ? 'rgba(0,212,255,0.2)' : 'var(--border)'};
    border-radius:var(--r-lg);
    padding:var(--s3) var(--s4);
    max-width:75%;
    font-size:var(--text-sm);
    line-height:1.6;
  `;
  bubble.innerHTML = typeof content === 'string' ? formatChatMessage(content) : content;

  div.appendChild(avatar);
  div.appendChild(bubble);
  chatEl.appendChild(div);
  chatEl.scrollTop = chatEl.scrollHeight;
  return bubble;
}

function formatChatMessage(text) {
  // Basic markdown: code blocks, bold, inline code
  return escHtml(text)
    .replace(/```([\s\S]*?)```/g, '<pre style="background:var(--color-surface-3);padding:var(--s3);border-radius:var(--r-sm);overflow-x:auto;margin:var(--s2) 0;font-size:11px">$1</pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
