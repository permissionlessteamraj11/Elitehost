const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');
const passport = require('passport');

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);

router.get('/github', passport.authenticate('github', { scope: ['user:email', 'repo'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login.html' }), authController.githubCallback);

module.exports = router;
