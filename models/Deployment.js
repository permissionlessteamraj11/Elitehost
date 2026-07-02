const mongoose = require('mongoose');

const deploymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['github', 'zip'], required: true },
  repo: String,
  branch: String,
  buildCommand: String,
  runCommand: String,
  envVars: { type: Map, of: String }, // In production, these should be encrypted
  pm2Name: { type: String, unique: true },
  status: {
    type: String,
    enum: ['pending', 'building', 'running', 'stopped', 'failed', 'deleted'],
    default: 'pending'
  },
  errorMessage: String,
  deployedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Deployment', deploymentSchema);
