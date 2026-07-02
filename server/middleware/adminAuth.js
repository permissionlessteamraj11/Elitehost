const jwt = require('jsonwebtoken');

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'raj-papa-secret-key';

module.exports = (req, res, next) => {
  const token = req.headers['x-admin-token'] || req.headers['authorization']?.split(' ')[1];
  const adminUsername = req.headers['x-admin-username'];

  if (!token || adminUsername !== 'Raj') {
    return res.status(403).json({ success: false, error: 'Admin access denied', code: 'FORBIDDEN' });
  }

  try {
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);
    if (decoded.username !== 'Raj') {
      return res.status(403).json({ success: false, error: 'Forbidden', code: 'FORBIDDEN' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Invalid admin token', code: 'INVALID_ADMIN_TOKEN' });
  }
};
