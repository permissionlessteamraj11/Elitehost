let socket;
let currentThreadId;

async function initSettings() {
    if (!auth.isLoggedIn()) {
        window.location.href = '/login.html';
        return;
    }

    const userData = await auth.fetch('/api/auth/me');
    if (userData.success) {
        const user = userData.data;
        document.getElementById('myReferralCode').value = `${window.location.origin}/register.html?ref=${user.referralCode}`;
        document.getElementById('refStats').innerText = `Your Code: ${user.referralCode} | Plan: ${user.plan.toUpperCase()}`;

        setupChat(user);
    }
}

async function setupChat(user) {
    const res = await auth.fetch('/api/chat/thread');
    if (res.success) {
        currentThreadId = res.data.id;
        const messagesDiv = document.getElementById('chatMessages');

        res.data.messages.forEach(msg => {
            appendMessage(msg);
        });

        socket = io();
        socket.emit('join', currentThreadId);

        socket.on('message', (msg) => {
            appendMessage(msg);
        });
    }
}

function appendMessage(msg) {
    const div = document.createElement('div');
    div.className = `message message-${msg.from}`;
    div.innerText = msg.text;
    const container = document.getElementById('chatMessages');
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

document.getElementById('chatForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const text = document.getElementById('chatInput').value;
    if (text && socket) {
        socket.emit('user:message', { threadId: currentThreadId, text });
        document.getElementById('chatInput').value = '';
    }
});

document.addEventListener('DOMContentLoaded', initSettings);
