const Deployment = require('../models/Deployment');
const deployService = require('../services/deploy.service');
const pm2Service = require('../services/pm2.service');
const path = require('path');

exports.deployGitHub = async (req, res) => {
  try {
    const { name, repo, branch, buildCommand, runCommand, envVars } = req.body;

    const deployment = await Deployment.create({
      userId: req.user._id,
      name,
      type: 'github',
      repo,
      branch,
      buildCommand,
      runCommand,
      envVars,
      pm2Name: `deploy-${Date.now()}` // Will update with ID after creation if needed
    });

    deployment.pm2Name = deployment._id.toString();
    await deployment.save();

    // Trigger async deploy
    deployService.deployFromGitHub({
      userId: req.user._id,
      deployId: deployment._id,
      repoUrl: repo,
      branch,
      buildCommand,
      runCommand,
      envVars,
      githubToken: req.user.githubToken
    });

    res.status(202).json({ success: true, data: deployment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deployZip = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No ZIP file uploaded' });

    const { name, buildCommand, runCommand, envVars } = req.body;
    const parsedEnv = envVars ? JSON.parse(envVars) : {};

    const deployment = await Deployment.create({
      userId: req.user._id,
      name,
      type: 'zip',
      buildCommand,
      runCommand,
      envVars: parsedEnv,
      pm2Name: `deploy-${Date.now()}`
    });

    deployment.pm2Name = deployment._id.toString();
    await deployment.save();

    deployService.deployFromZip({
      userId: req.user._id,
      deployId: deployment._id,
      zipPath: req.file.path,
      buildCommand,
      runCommand,
      envVars: parsedEnv
    });

    res.status(202).json({ success: true, data: deployment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDeployments = async (req, res) => {
  try {
    const deployments = await Deployment.find({ userId: req.user._id, status: { $ne: 'deleted' } }).sort('-createdAt');
    res.json({ success: true, data: deployments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const deployment = await Deployment.findById(req.params.id);
    if (!deployment || deployment.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Deployment not found' });
    }
    const stats = await pm2Service.status(deployment._id.toString());
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.controlDeployment = async (req, res) => {
  try {
    const { action } = req.body;
    const deployment = await Deployment.findById(req.params.id);
    if (!deployment || deployment.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Deployment not found' });
    }

    if (action === 'start') {
      // Logic to start... usually pm2.start with saved config
      // For simplicity, we assume it's already configured in PM2
      await pm2Service.restart(deployment._id.toString());
      deployment.status = 'running';
    } else if (action === 'stop') {
      await pm2Service.stop(deployment._id.toString());
      deployment.status = 'stopped';
    } else if (action === 'restart') {
      await pm2Service.restart(deployment._id.toString());
      deployment.status = 'running';
    } else if (action === 'delete') {
      try { await pm2Service.delete(deployment._id.toString()); } catch(e) {}
      deployment.status = 'deleted';
    }

    await deployment.save();
    res.json({ success: true, message: `Deployment ${action}ed` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.streamLogs = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const onLog = (data) => {
    if (data.deployId.toString() === req.params.id) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  };

  deployService.deployEvents.on('log', onLog);

  req.on('close', () => {
    deployService.deployEvents.off('log', onLog);
  });
};
