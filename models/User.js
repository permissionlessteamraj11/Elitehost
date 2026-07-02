const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String },
  githubId: { type: String },
  githubToken: { type: String }, // Should be encrypted in a real app
  githubUsername: { type: String },
  wallet: {
    balance: { type: Number, default: 0 },
    transactions: [{
      date: { type: Date, default: Date.now },
      desc: String,
      amount: Number,
      type: { type: String, enum: ['credit', 'debit'] }
    }]
  },
  referralCode: { type: String, unique: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referralEarnings: { type: Number, default: 0 },
  plan: {
    name: { type: String, default: 'Free' },
    expiresAt: { type: Date }
  },
  isAdmin: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  banReason: { type: String },
  notifyAI: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
