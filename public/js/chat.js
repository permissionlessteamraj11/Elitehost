let socket;
let threadId;
let currentUser;

async function initChat() {
    if (!auth.isLoggedIn()) return;

    const me = await auth.fetch('/api/auth/me');
    currentUser = me.data;

    const threadRes = await auth.fetch('/api/chat/start', { method: 'POST' });
    if (threadRes.success) {
        threadId = threadRes.data.id;

        // Load history
        const msgRes = await auth.fetch('/api/chat/messages');
        if (msgRes.success) {
            msgRes.data.forEach(appendMessage);
        }

        // Setup Socket
        socket = io();
        socket.emit('join', threadId);

        socket.on('message', (msg) => {
            appendMessage(msg);
            if (msg.from === 'admin') {
                document.getElementById('waitingMsg').style.display = 'none';
            }
        });
    }
}

function appendMessage(msg) {
    const container = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = `message message-${msg.from === 'user' ? 'user' : 'admin'}`;
    div.innerHTML = `
        <div style="font-size: 10px; opacity: 0.7; margin-bottom: 5px;">${msg.from.toUpperCase()} - ${new Date(msg.timestamp).toLocaleTimeString()}</div>
        <div>${msg.text}</div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

document.getElementById('chatForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('msgInput');
    const text = input.value;
    if (text && socket) {
        socket.emit('user:message', { threadId, text, userId: currentUser.id, username: currentUser.username });
        input.value = '';
        document.getElementById('waitingMsg').style.display = 'block';
    }
});

document.addEventListener('DOMContentLoaded', initChat);
