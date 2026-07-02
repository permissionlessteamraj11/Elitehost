const User = require('../models/User');
const Deployment = require('../models/Deployment');
const SupportMessage = require('../models/SupportMessage');
const AdminLog = require('../models/AdminLog');
const DeviceBan = require('../models/DeviceBan');
const pm2Service = require('../services/pm2.service');

exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    req.session.adminAuthenticated = true;
    return res.json({ success: true, message: 'Admin authenticated' });
  }

  // Failed attempt - in real app, track this for fingerprint ban
  res.status(401).json({ success: false, message: 'Invalid admin credentials' });
};

exports.getStats = async (req, res) => {
  const totalUsers = await User.countDocuments();
  const activeBots = await Deployment.countDocuments({ status: 'running' });
  res.json({ success: true, data: { totalUsers, activeBots } });
};

exports.getUsers = async (req, res) => {
  const users = await User.find().sort('-createdAt');
  res.json({ success: true, data: users });
};

exports.manageUser = async (req, res) => {
  const { action, userId } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  if (action === 'ban') user.isBanned = true;
  else if (action === 'unban') user.isBanned = false;

  await user.save();
  res.json({ success: true, message: `User ${action}ned` });
};

exports.getDeployments = async (req, res) => {
  const deployments = await Deployment.find().populate('userId', 'name email').sort('-createdAt');
  res.json({ success: true, data: deployments });
};
