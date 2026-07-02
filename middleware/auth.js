const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;
  if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user || req.user.isBanned) {
      return res.status(401).json({ success: false, message: 'User not found or banned' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || (roles.includes('admin') && !req.user.isAdmin)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    next();
  };
};
