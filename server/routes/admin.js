const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const adminAuth = require('../middleware/adminAuth');

const USERS_PATH = path.join(__dirname, '../db/users.json');
const DEPLOYMENTS_PATH = path.join(__dirname, '../db/deployments.json');
const WITHDRAWALS_PATH = path.join(__dirname, '../db/withdrawals.json');
const PLANS_PATH = path.join(__dirname, '../db/plans.json');
const CHATS_PATH = path.join(__dirname, '../db/chats.json');
const BANS_PATH = path.join(__dirname, '../db/bans.json');

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'raj-papa-secret-key';

let failedAttempts = {};
const getBans = () => {
    if (!fs.existsSync(BANS_PATH)) return [];
    return JSON.parse(fs.readFileSync(BANS_PATH, 'utf8'));
};

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const clientIp = req.ip;

    const bans = getBans();
    if (bans.includes(clientIp)) {
        return res.status(403).json({ success: false, error: 'Device permanently banned from admin access.' });
    }

    if (username === 'rajpapa' && password === '28@RajPapa') {
        delete failedAttempts[clientIp];
        const token = jwt.sign({ username: 'rajpapa', role: 'admin' }, ADMIN_JWT_SECRET, { expiresIn: '12h' });
        return res.json({ success: true, data: { token } });
    }

    failedAttempts[clientIp] = (failedAttempts[clientIp] || 0) + 1;
    if (failedAttempts[clientIp] >= 3) {
        const bans = getBans();
        if (!bans.includes(clientIp)) {
            bans.push(clientIp);
            fs.writeFileSync(BANS_PATH, JSON.stringify(bans, null, 2));
        }
        return res.status(403).json({ success: false, error: 'Too many attempts. Device banned.' });
    }

    res.status(401).json({ success: false, error: `Invalid credentials. Attempt ${failedAttempts[clientIp]}/3` });
});

router.get('/stats', adminAuth, (req, res) => {
    const users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'));
    const deployments = JSON.parse(fs.readFileSync(DEPLOYMENTS_PATH, 'utf8'));
    const withdrawals = JSON.parse(fs.readFileSync(WITHDRAWALS_PATH, 'utf8'));

    const stats = {
        totalUsers: users.length,
        activeDeployments: deployments.filter(d => d.status === 'running').length,
        trialDeployments: deployments.filter(d => d.isTrial).length,
        pendingWithdrawals: withdrawals.filter(w => w.status === 'pending').length,
        totalRevenue: users.reduce((acc, u) => acc + (u.plan !== 'free' ? 100 : 0), 0) // Simplified revenue logic
    };
    res.json({ success: true, data: stats });
});

router.get('/users', adminAuth, (req, res) => {
    const users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'));
    res.json({ success: true, data: users });
});

router.put('/users/:id', adminAuth, (req, res) => {
    const users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'));
    const index = users.findIndex(u => u.id === req.params.id);
    if (index !== -1) {
        users[index] = { ...users[index], ...req.body };
        fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
        return res.json({ success: true, message: 'User updated' });
    }
    res.status(404).json({ success: false, error: 'User not found' });
});

router.delete('/users/:id', adminAuth, (req, res) => {
    let users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'));
    users = users.filter(u => u.id !== req.params.id);
    fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
    res.json({ success: true, message: 'User deleted' });
});

router.get('/deployments', adminAuth, (req, res) => {
    const deployments = JSON.parse(fs.readFileSync(DEPLOYMENTS_PATH, 'utf8'));
    res.json({ success: true, data: deployments });
});

router.get('/withdrawals', adminAuth, (req, res) => {
    const withdrawals = JSON.parse(fs.readFileSync(WITHDRAWALS_PATH, 'utf8'));
    res.json({ success: true, data: withdrawals });
});

router.post('/withdrawals/:id/approve', adminAuth, (req, res) => {
    const withdrawals = JSON.parse(fs.readFileSync(WITHDRAWALS_PATH, 'utf8'));
    const users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'));
    const index = withdrawals.findIndex(w => w.id === req.params.id);

    if (index !== -1 && withdrawals[index].status === 'pending') {
        const userIndex = users.findIndex(u => u.id === withdrawals[index].userId);
        if (userIndex !== -1) {
            users[userIndex].wallet -= withdrawals[index].amount;
            withdrawals[index].status = 'approved';
            withdrawals[index].processedAt = new Date().toISOString();

            fs.writeFileSync(WITHDRAWALS_PATH, JSON.stringify(withdrawals, null, 2));
            fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
            return res.json({ success: true, message: 'Withdrawal approved' });
        }
    }
    res.status(400).json({ success: false, error: 'Cannot approve withdrawal' });
});

router.post('/withdrawals/:id/reject', adminAuth, (req, res) => {
    const withdrawals = JSON.parse(fs.readFileSync(WITHDRAWALS_PATH, 'utf8'));
    const index = withdrawals.findIndex(w => w.id === req.params.id);
    if (index !== -1) {
        withdrawals[index].status = 'rejected';
        withdrawals[index].processedAt = new Date().toISOString();
        fs.writeFileSync(WITHDRAWALS_PATH, JSON.stringify(withdrawals, null, 2));
        return res.json({ success: true, message: 'Withdrawal rejected' });
    }
    res.status(404).json({ success: false, error: 'Withdrawal not found' });
});

router.get('/chats', adminAuth, (req, res) => {
    const chats = JSON.parse(fs.readFileSync(CHATS_PATH, 'utf8'));
    res.json({ success: true, data: chats });
});

router.get('/plans', adminAuth, (req, res) => {
    const plans = JSON.parse(fs.readFileSync(PLANS_PATH, 'utf8'));
    res.json({ success: true, data: plans });
});

router.post('/deployments/:id/stop', adminAuth, (req, res) => {
    const deployments = JSON.parse(fs.readFileSync(DEPLOYMENTS_PATH, 'utf8'));
    const index = deployments.findIndex(d => d.id === req.params.id);
    if (index !== -1) {
        deployments[index].status = 'stopped';
        deployments[index].logs.push({ from: 'system', text: 'Deployment stopped by admin.', timestamp: new Date().toISOString() });
        fs.writeFileSync(DEPLOYMENTS_PATH, JSON.stringify(deployments, null, 2));
        return res.json({ success: true, message: 'Deployment stopped' });
    }
    res.status(404).json({ success: false, error: 'Deployment not found' });
});

router.post('/users/:id/ban', adminAuth, (req, res) => {
    const users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'));
    const index = users.findIndex(u => u.id === req.params.id);
    if (index !== -1) {
        users[index].isBanned = true;
        fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
        return res.json({ success: true, message: 'User banned' });
    }
    res.status(404).json({ success: false, error: 'User not found' });
});

router.post('/users/:id/unban', adminAuth, (req, res) => {
    const users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'));
    const index = users.findIndex(u => u.id === req.params.id);
    if (index !== -1) {
        users[index].isBanned = false;
        fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
        return res.json({ success: true, message: 'User unbanned' });
    }
    res.status(404).json({ success: false, error: 'User not found' });
});

router.post('/users/:id/balance', adminAuth, (req, res) => {
    const { amount, action } = req.body;
    const users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'));
    const index = users.findIndex(u => u.id === req.params.id);
    if (index !== -1) {
        if (action === 'add') users[index].wallet += parseFloat(amount);
        else if (action === 'remove') users[index].wallet -= parseFloat(amount);
        fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
        return res.json({ success: true, message: `Balance ${action}ed` });
    }
    res.status(404).json({ success: false, error: 'User not found' });
});

module.exports = router;
