const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const auth = require('../middleware/auth');

const CHATS_PATH = path.join(__dirname, '../db/chats.json');

router.post('/start', auth, (req, res) => {
    const chats = JSON.parse(fs.readFileSync(CHATS_PATH, 'utf8'));
    let thread = chats.find(c => c.userId === req.user.userId && !c.resolved);

    if (!thread) {
        thread = {
            id: crypto.randomUUID(),
            userId: req.user.userId,
            username: req.user.username,
            messages: [],
            resolved: false,
            createdAt: new Date().toISOString()
        };
        chats.push(thread);
        fs.writeFileSync(CHATS_PATH, JSON.stringify(chats, null, 2));
    }

    res.json({ success: true, data: thread });
});

router.get('/messages', auth, (req, res) => {
    const chats = JSON.parse(fs.readFileSync(CHATS_PATH, 'utf8'));
    const thread = chats.find(c => c.userId === req.user.userId && !c.resolved);
    res.json({ success: true, data: thread ? thread.messages : [] });
});

module.exports = router;
