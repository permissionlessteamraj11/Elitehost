const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { generateReferralCode } = require('../utils/referral');
const auth = require('../middleware/auth');

const USERS_PATH = path.join(__dirname, '../db/users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Too many requests, please try again later.', code: 'RATE_LIMIT_EXCEEDED' }
});

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, referralCode } = req.body;
    const users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'));

    if (users.find(u => u.email === email)) {
      return res.status(400).json({ success: false, error: 'Email already exists', code: 'EMAIL_EXISTS' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: crypto.randomUUID(),
      username,
      email,
      passwordHash,
      credits: 0,
      wallet: 0.00,
      referralCode: generateReferralCode(),
      referredBy: referralCode || null,
      plan: "free",
      trialUsed: false,
      trialStartedAt: null,
      trialEndsAt: null,
      createdAt: new Date().toISOString(),
      isAdmin: false
    };

    users.push(newUser);
    fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/login', authLimit, async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'));
    const user = users.find(u => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, data: { token, user: { id: user.id, username: user.username, email: user.email, isAdmin: user.isAdmin } } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/me', auth, (req, res) => {
  const { passwordHash, ...userData } = req.userData;
  res.json({ success: true, data: userData });
});

module.exports = router;
