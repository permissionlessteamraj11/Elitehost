const mongoose = require('mongoose');

const deviceBanSchema = new mongoose.Schema({
  fingerprint: { type: String, required: true, unique: true },
  reason: String,
  bannedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DeviceBan', deviceBanSchema);
