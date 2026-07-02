const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const auth = require('../middleware/auth');

const WITHDRAWALS_PATH = path.join(__dirname, '../db/withdrawals.json');
const USERS_PATH = path.join(__dirname, '../db/users.json');
const PLANS_PATH = path.join(__dirname, '../db/plans.json');
const { processReferralCommission } = require('../utils/referral');

router.get('/balance', auth, (req, res) => {
    res.json({ success: true, data: { credits: req.userData.credits, wallet: req.userData.wallet } });
});

router.post('/withdraw', auth, (req, res) => {
    const { amount, method, details } = req.body;

    if (amount < 100) {
        return res.status(400).json({ success: false, error: 'Minimum withdrawal amount is ₹100' });
    }

    if (req.userData.wallet < amount) {
        return res.status(400).json({ success: false, error: 'Insufficient wallet balance' });
    }

    const withdrawals = JSON.parse(fs.readFileSync(WITHDRAWALS_PATH, 'utf8'));
    const newWithdrawal = {
        id: crypto.randomUUID(),
        userId: req.user.userId,
        username: req.user.username,
        amount,
        method,
        details,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        processedAt: null
    };

    withdrawals.push(newWithdrawal);
    fs.writeFileSync(WITHDRAWALS_PATH, JSON.stringify(withdrawals, null, 2));

    res.json({ success: true, message: 'Withdrawal request submitted successfully' });
});

router.get('/transactions', auth, (req, res) => {
    const withdrawals = JSON.parse(fs.readFileSync(WITHDRAWALS_PATH, 'utf8'));
    const userWithdrawals = withdrawals.filter(w => w.userId === req.user.userId);
    res.json({ success: true, data: userWithdrawals });
});

router.post('/purchase', auth, (req, res) => {
    const { planId } = req.body;
    const plans = JSON.parse(fs.readFileSync(PLANS_PATH, 'utf8'));
    const plan = plans.find(p => p.id === planId);

    if (!plan || plan.id === 'free') return res.status(400).json({ success: false, error: 'Invalid plan selected' });

    const users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'));
    const userIndex = users.findIndex(u => u.id === req.user.userId);

    if (userIndex !== -1) {
        users[userIndex].plan = plan.id;
        users[userIndex].credits += plan.credits;
        fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));

        // Trigger referral commission
        processReferralCommission(req.user.userId, plan.price);

        return res.json({ success: true, message: `Successfully purchased ${plan.name} plan!` });
    }
    res.status(404).json({ success: false, error: 'User not found' });
});

module.exports = router;
