let currentUser = null;
let deployMode = 'github';

async function init() {
  const res = await fetch('/api/auth/me');
  const data = await res.json();
  if (!data.success) {
    window.location.href = '/login.html';
    return;
  }
  currentUser = data.data;
  document.getElementById('greeting').innerText = `Good morning, ${currentUser.name} 👋`;
  document.getElementById('userInitials').innerText = currentUser.name.charAt(0).toUpperCase();
  document.getElementById('walletBalance').innerText = `₹${currentUser.wallet.balance}`;
  document.getElementById('refCode').value = currentUser.referralCode;

  loadDeployments();
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.innerText.toLowerCase() === tabId) item.classList.add('active');
    // For more robust matching:
    if (item.querySelector('span').innerText.toLowerCase() === tabId) item.classList.add('active');
  });
}

function setDeployMode(mode) {
  deployMode = mode;
  if (mode === 'github') {
    document.getElementById('gitForm').style.display = 'block';
    document.getElementById('zipForm').style.display = 'none';
    document.getElementById('btnGit').className = 'btn btn-primary';
    document.getElementById('btnZip').className = 'btn btn-outline';
  } else {
    document.getElementById('gitForm').style.display = 'none';
    document.getElementById('zipForm').style.display = 'block';
    document.getElementById('btnGit').className = 'btn btn-outline';
    document.getElementById('btnZip').className = 'btn btn-primary';
  }
}

async function startDeploy() {
  const name = document.getElementById('deployName').value;
  const buildCommand = document.getElementById('buildCmd').value;
  const runCommand = document.getElementById('runCmd').value;

  document.getElementById('deployProgress').style.display = 'block';
  const logsEl = document.getElementById('deployLogs');
  logsEl.innerHTML = '';

  let res;
  if (deployMode === 'github') {
    const repo = document.getElementById('gitRepo').value;
    const branch = document.getElementById('gitBranch').value;
    res = await fetch('/api/deploy/github', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, repo, branch, buildCommand, runCommand })
    });
  } else {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('zip', document.getElementById('zipFile').files[0]);
    formData.append('buildCommand', buildCommand);
    formData.append('runCommand', runCommand);
    res = await fetch('/api/deploy/zip', {
      method: 'POST',
      body: formData
    });
  }

  const data = await res.json();
  if (data.success) {
    setupSSE(data.data._id);
    loadDeployments(); // Reload the list
  } else {
    logsEl.innerHTML += `<div class="error">[ERROR] ${data.message}</div>`;
  }
}

function setupSSE(deployId) {
  const logsEl = document.getElementById('deployLogs');
  const es = new EventSource(`/api/deploy/${deployId}/logs/stream`);

  es.onmessage = (e) => {
    const data = JSON.parse(e.data);
    const div = document.createElement('div');
    if (data.text.includes('[SUCCESS]')) div.className = 'success';
    else if (data.text.includes('[ERROR]')) div.className = 'error';
    else if (data.text.includes('[INFO]')) div.className = 'info';
    div.innerText = data.text;
    logsEl.appendChild(div);
    logsEl.scrollTop = logsEl.scrollHeight;

    if (data.text.includes('[SUCCESS]') || data.text.includes('[ERROR]')) {
      // es.close(); // Keep open if we want live bot logs later? Brief says SSE for deploy logs.
    }
  };

  es.onerror = () => es.close();
}

async function loadDeployments() {
  const res = await fetch('/api/deploy');
  const data = await res.json();
  if (data.success) {
    const list = document.getElementById('deploymentList');
    const recent = document.getElementById('recentDeployments');
    list.innerHTML = '';
    recent.innerHTML = '';

    if (data.data.length === 0) {
      recent.innerHTML = '<p class="text-muted">No deployments yet.</p>';
      list.innerHTML = '<p class="text-muted">No deployments yet.</p>';
      return;
    }

    data.data.forEach(d => {
      const card = createDeployCard(d);
      list.appendChild(card.cloneNode(true));
      if (recent.children.length < 5) recent.appendChild(card);
    });
  }
}

function createDeployCard(d) {
  const div = document.createElement('div');
  div.className = 'glass-card mb-4';
  div.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: start;">
      <div>
        <h3 style="margin-bottom: 4px;">🤖 ${d.name}</h3>
        <div class="text-secondary" style="font-size: 11px;">${d.repo || 'ZIP Upload'} • ${new Date(d.createdAt).toLocaleString()}</div>
      </div>
      <span class="status-badge status-${d.status}">${d.status}</span>
    </div>
    <div style="display: flex; gap: 8px; margin-top: 16px;">
      <button class="btn btn-outline" style="font-size: 11px; padding: 6px 12px;" onclick="controlDeploy('${d._id}', 'restart')">↺ Restart</button>
      <button class="btn btn-outline" style="font-size: 11px; padding: 6px 12px;" onclick="controlDeploy('${d._id}', 'stop')">⏹ Stop</button>
      <button class="btn btn-outline" style="font-size: 11px; padding: 6px 12px; color: var(--error);" onclick="controlDeploy('${d._id}', 'delete')">🗑 Delete</button>
    </div>
  `;
  return div;
}

async function controlDeploy(id, action) {
  if (action === 'delete' && !confirm('Are you sure?')) return;
  const res = await fetch(`/api/deploy/${id}/control`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action })
  });
  const data = await res.json();
  if (data.success) loadDeployments();
}

function copyRef() {
  const el = document.getElementById('refCode');
  el.select();
  document.execCommand('copy');
  alert('Referral code copied!');
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/login.html';
}

init();
