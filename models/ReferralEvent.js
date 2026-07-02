const mongoose = require('mongoose');

const referralEventSchema = new mongoose.Schema({
  referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referredUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: String,
  planAmount: Number,
  commission: Number,
  status: { type: String, enum: ['pending', 'credited'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('ReferralEvent', referralEventSchema);
