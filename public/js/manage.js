async function initManage() {
    if (!auth.isLoggedIn()) {
        window.location.href = '/login.html';
        return;
    }

    const res = await auth.fetch('/api/deploy/list');
    if (res.success) {
        const list = document.getElementById('deploymentsList');
        list.innerHTML = '';

        res.data.forEach(deploy => {
            const card = document.createElement('div');
            card.className = 'panel';
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h3 style="margin-bottom: 5px;">${deploy.name}</h3>
                        <p class="text-muted" style="font-size: 11px;">TYPE: ${deploy.type.toUpperCase()} | URL: ${deploy.url}</p>
                    </div>
                    <span class="badge badge-${deploy.status}">${deploy.status}</span>
                </div>
                <div style="margin-top: 20px; display: flex; gap: 10px;">
                    <button class="btn btn-outline btn-sm" onclick="viewLogs('${deploy.id}')">LOGS</button>
                    ${deploy.status === 'running' ?
                        `<button class="btn btn-outline btn-sm" onclick="stopDeploy('${deploy.id}')" style="color: var(--error); border-color: var(--error);">STOP</button>` :
                        `<button class="btn btn-primary btn-sm" onclick="alert('Starting...')">START</button>`
                    }
                    <button class="btn btn-outline btn-sm" onclick="deleteDeploy('${deploy.id}')" style="opacity: 0.5;">DELETE</button>
                </div>
            `;
            list.appendChild(card);
        });

        if (res.data.length === 0) {
            list.innerHTML = '<div class="panel" style="text-align: center;">No deployments found.</div>';
        }
    }
}

async function viewLogs(id) {
    const res = await auth.fetch(`/api/deploy/${id}/logs`);
    if (res.success) {
        const content = document.getElementById('logsContent');
        content.innerText = res.data.map(l => `[${new Date(l.timestamp).toLocaleTimeString()}] ${l.text}`).join('\n');
        document.getElementById('logsModal').style.display = 'flex';
    }
}

function closeLogs() {
    document.getElementById('logsModal').style.display = 'none';
}

async function stopDeploy(id) {
    if (confirm('Are you sure you want to stop this deployment?')) {
        const res = await auth.fetch(`/api/deploy/${id}/stop`, { method: 'POST' });
        if (res.success) {
            initManage();
        }
    }
}

async function deleteDeploy(id) {
    if (confirm('Permanent delete? This cannot be undone.')) {
        const res = await auth.fetch(`/api/deploy/${id}`, { method: 'DELETE' });
        if (res.success) {
            initManage();
        }
    }
}

document.addEventListener('DOMContentLoaded', initManage);
