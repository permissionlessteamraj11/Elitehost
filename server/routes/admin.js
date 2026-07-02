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

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'raj-papa-secret-key';

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'Raj' && password === '28@RajPapa') {
        const token = jwt.sign({ username: 'Raj', role: 'admin' }, ADMIN_JWT_SECRET, { expiresIn: '12h' });
        return res.json({ success: true, data: { token } });
    }
    res.status(401).json({ success: false, error: 'Invalid admin credentials' });
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

module.exports = router;
