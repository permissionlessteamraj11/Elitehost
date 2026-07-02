const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  details: String,
  ip: String
}, { timestamps: true });

module.exports = mongoose.model('AdminLog', adminLogSchema);
