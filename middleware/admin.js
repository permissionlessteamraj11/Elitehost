const crypto = require('crypto');
const DeviceBan = require('../models/DeviceBan');

exports.isAdmin = (req, res, next) => {
  if (req.session && req.session.adminAuthenticated) {
    return next();
  }
  res.status(401).json({ success: false, message: 'Admin access only' });
};

exports.checkAdminBan = async (req, res, next) => {
  const fingerprint = crypto.createHash('sha256').update(req.ip + req.headers['user-agent']).digest('hex');
  const ban = await DeviceBan.findOne({ fingerprint });
  if (ban) {
    return res.status(403).json({ success: false, message: 'Access Denied — This device has been permanently blocked.' });
  }
  req.fingerprint = fingerprint;
  next();
};
