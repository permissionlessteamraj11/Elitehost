const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const helmet = require('helmet');
const fs = require('fs');
const { checkTrialExpiry } = require('./utils/trial');
require('./db/init')();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      "font-src": ["'self'", "https://fonts.gstatic.com"],
      "img-src": ["'self'", "data:", "https://*"]
    },
  },
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/deploy', require('./routes/deploy'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/chat', require('./routes/chat'));

// Admin UI route
app.get('/raj', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin/raj.html'));
});

// Socket.IO for Chat
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join', (threadId) => {
    socket.join(threadId);
  });

  socket.on('user:message', ({ threadId, text, userId, username }) => {
    const chats = JSON.parse(fs.readFileSync(path.join(__dirname, 'db/chats.json'), 'utf8'));
    const thread = chats.find(c => c.id === threadId);
    if (thread) {
      const msg = { from: 'user', text, timestamp: new Date().toISOString() };
      thread.messages.push(msg);
      fs.writeFileSync(path.join(__dirname, 'db/chats.json'), JSON.stringify(chats, null, 2));
      io.to(threadId).emit('message', msg);
    }
  });

  socket.on('admin:message', ({ threadId, text }) => {
    const chats = JSON.parse(fs.readFileSync(path.join(__dirname, 'db/chats.json'), 'utf8'));
    const thread = chats.find(c => c.id === threadId);
    if (thread) {
      const msg = { from: 'admin', text, timestamp: new Date().toISOString() };
      thread.messages.push(msg);
      fs.writeFileSync(path.join(__dirname, 'db/chats.json'), JSON.stringify(chats, null, 2));
      io.to(threadId).emit('message', msg);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Background jobs
setInterval(checkTrialExpiry, 60000);
console.log('🕒 Trial expiry background job initialized.');

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
