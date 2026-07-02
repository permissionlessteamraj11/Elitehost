let currentAdminThread = null;
let adminSocket;

async function checkAdminAuth() {
    if (auth.isAdminLoggedIn()) {
        document.getElementById('adminLoginOverlay').style.display = 'none';
        initAdminDashboard();
        initAdminSocket();
    }
}

document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = document.getElementById('adminUser').value;
    const pass = document.getElementById('adminPass').value;
    await adminLogin(user, pass);
    checkAdminAuth();
});

function showSection(id) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));

    document.getElementById(id).classList.add('active');
    event.target.classList.add('active');

    if (id === 'stats') loadStats();
    if (id === 'users') loadUsers();
    if (id === 'deployments') loadDeploys();
    if (id === 'withdrawals') loadWithdrawals();
    if (id === 'chats') loadChats();
}

async function loadStats() {
    const res = await auth.fetchAdmin('/api/admin/stats');
    if (res.success) {
        document.getElementById('s-totalUsers').innerText = res.data.totalUsers;
        document.getElementById('s-activeDeploys').innerText = res.data.activeDeployments;
        document.getElementById('s-pendingWithdraw').innerText = res.data.pendingWithdrawals;
        document.getElementById('s-totalRevenue').innerText = `₹${res.data.totalRevenue}`;
    }
}

async function loadUsers() {
    const res = await auth.fetchAdmin('/api/admin/users');
    if (res.success) {
        const tbody = document.querySelector('#adminUsersTable tbody');
        tbody.innerHTML = res.data.map(u => `
            <tr>
                <td>${u.username}</td>
                <td>${u.email}</td>
                <td>${u.credits}</td>
                <td>₹${u.wallet}</td>
                <td><button class="btn btn-outline btn-sm" onclick="editCredits('${u.id}')">EDIT</button></td>
            </tr>
        `).join('');
    }
}

async function loadDeploys() {
    const res = await auth.fetchAdmin('/api/admin/deployments');
    if (res.success) {
        const tbody = document.querySelector('#adminDeploysTable tbody');
        tbody.innerHTML = res.data.map(d => `
            <tr>
                <td>${d.name}</td>
                <td>${d.userId.substring(0, 8)}...</td>
                <td>${d.type.toUpperCase()}</td>
                <td><span class="badge badge-${d.status}">${d.status}</span></td>
                <td>
                    ${d.status === 'running' ? `<button class="btn btn-outline btn-sm" onclick="stopDeployAdmin('${d.id}')">STOP</button>` : ''}
                </td>
            </tr>
        `).join('');
    }
}

async function stopDeployAdmin(id) {
    if (confirm('Stop this deployment?')) {
        const res = await auth.fetchAdmin(`/api/admin/deployments/${id}/stop`, { method: 'POST' });
        if (res.success) loadDeploys();
    }
}

async function editCredits(id) {
    const amount = prompt('Enter new credit balance:');
    if (amount !== null) {
        const res = await auth.fetchAdmin(`/api/admin/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ credits: parseInt(amount) })
        });
        if (res.success) loadUsers();
    }
}

async function loadWithdrawals() {
    const res = await auth.fetchAdmin('/api/admin/withdrawals');
    if (res.success) {
        const tbody = document.querySelector('#adminWithdrawTable tbody');
        tbody.innerHTML = res.data.filter(w => w.status === 'pending').map(w => `
            <tr>
                <td>${w.username}</td>
                <td>₹${w.amount}</td>
                <td>${w.method}</td>
                <td>${w.details}</td>
                <td><button class="btn btn-primary btn-sm" onclick="approveWithdraw('${w.id}')">APPROVE</button></td>
            </tr>
        `).join('');
    }
}

async function approveWithdraw(id) {
    if (confirm('Approve this withdrawal?')) {
        const res = await auth.fetchAdmin(`/api/admin/withdrawals/${id}/approve`, { method: 'POST' });
        if (res.success) loadWithdrawals();
    }
}

async function loadChats() {
    const res = await auth.fetchAdmin('/api/admin/chats');
    if (res.success) {
        const list = document.getElementById('adminChatsList');
        list.innerHTML = res.data.map(c => `
            <div class="panel" style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${c.username}</strong><br>
                    <small class="text-muted">${c.messages.length} messages</small>
                </div>
                <button class="btn btn-primary btn-sm" onclick="openAdminChat('${c.id}', '${c.username}')">OPEN CHAT</button>
            </div>
        `).join('');
    }
}

function initAdminSocket() {
    adminSocket = io();
    adminSocket.on('message', (msg) => {
        if (currentAdminThread && msg.timestamp) {
            appendAdminMessage(msg);
        }
    });
}

function openAdminChat(id, username) {
    currentAdminThread = id;
    document.getElementById('adminChatTitle').innerText = `CHAT WITH ${username.toUpperCase()}`;
    document.getElementById('adminChatMessages').innerHTML = '';

    // Fetch history
    auth.fetchAdmin('/api/admin/chats').then(res => {
        const thread = res.data.find(c => c.id === id);
        thread.messages.forEach(appendAdminMessage);
    });

    adminSocket.emit('join', id);
    document.getElementById('adminChatModal').style.display = 'flex';
}

function appendAdminMessage(msg) {
    const container = document.getElementById('adminChatMessages');
    const div = document.createElement('div');
    div.className = `message message-${msg.from === 'user' ? 'user' : 'admin'}`;
    div.innerHTML = `<div>${msg.text}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

document.getElementById('adminChatForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const text = document.getElementById('adminMsgInput').value;
    if (text && currentAdminThread) {
        adminSocket.emit('admin:message', { threadId: currentAdminThread, text });
        document.getElementById('adminMsgInput').value = '';
    }
});

function closeAdminChat() {
    document.getElementById('adminChatModal').style.display = 'none';
    currentAdminThread = null;
}

function initAdminDashboard() {
    loadStats();
}

document.addEventListener('DOMContentLoaded', checkAdminAuth);
