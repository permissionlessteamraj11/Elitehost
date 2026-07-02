const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const simpleGit = require('simple-git');
const AdmZip = require('adm-zip');
const auth = require('../middleware/auth');
const { deductCredits, getCreditsCost } = require('../utils/credits');
const { checkAndStartTrial } = require('../utils/trial');

const DEPLOYMENTS_PATH = path.join(__dirname, '../db/deployments.json');
const UPLOADS_PATH = path.join(__dirname, '../../uploads');

if (!fs.existsSync(UPLOADS_PATH)) fs.mkdirSync(UPLOADS_PATH, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_PATH),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.zip', '.js', '.py', '.php'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

const createDeployment = async (req, type, source) => {
  const deployments = JSON.parse(fs.readFileSync(DEPLOYMENTS_PATH, 'utf8'));
  const userId = req.user.userId;
  const cost = getCreditsCost(type);

  let isTrial = false;
  let trialExpiresAt = null;

  if (!req.userData.trialUsed && req.userData.plan === 'free') {
      const trialEnd = checkAndStartTrial(userId);
      if (trialEnd) {
          isTrial = true;
          trialExpiresAt = trialEnd;
      }
  }

  if (!isTrial) {
      if (!deductCredits(userId, type)) {
          throw new Error('Insufficient credits');
      }
  }

  const deployId = crypto.randomUUID();
  const logs = [
    { from: 'system', text: `Initialising ${type} deployment...`, timestamp: new Date().toISOString() }
  ];

  // Simulated Execution Engine
  setTimeout(async () => {
    try {
        if (type === 'github') {
            logs.push({ from: 'system', text: `Cloning repository: ${source}...`, timestamp: new Date().toISOString() });
            // In a real production env: await simpleGit().clone(source, path.join(UPLOADS_PATH, deployId));
            logs.push({ from: 'system', text: 'Fetching dependencies...', timestamp: new Date().toISOString() });
            logs.push({ from: 'system', text: 'Build optimized.', timestamp: new Date().toISOString() });
        } else if (type === 'zip') {
            logs.push({ from: 'system', text: `Extracting ${source}...`, timestamp: new Date().toISOString() });
            // const zip = new AdmZip(path.join(UPLOADS_PATH, source));
            // zip.extractAllTo(path.join(UPLOADS_PATH, deployId), true);
            logs.push({ from: 'system', text: 'Analyzing package.json...', timestamp: new Date().toISOString() });
        } else if (type === 'rawcode') {
            logs.push({ from: 'system', text: 'Compiling source code...', timestamp: new Date().toISOString() });
        }

        logs.push({ from: 'system', text: 'Starting application process...', timestamp: new Date().toISOString() });
        logs.push({ from: 'system', text: 'Deployment successful!', timestamp: new Date().toISOString() });

        // Persist final logs
        const currentDeploys = JSON.parse(fs.readFileSync(DEPLOYMENTS_PATH, 'utf8'));
        const idx = currentDeploys.findIndex(d => d.id === deployId);
        if (idx !== -1) {
            currentDeploys[idx].logs = [...currentDeploys[idx].logs, ...logs.slice(1)];
            fs.writeFileSync(DEPLOYMENTS_PATH, JSON.stringify(currentDeploys, null, 2));
        }
    } catch (e) {
        console.error('Deployment execution failed', e);
    }
  }, 2000);

  const newDeploy = {
    id: deployId,
    userId,
    name: req.body.name || 'Untitled Project',
    type,
    source,
    envVars: req.body.envVars || {},
    status: 'running',
    creditsCost: isTrial ? 0 : cost,
    isTrial,
    trialExpiresAt,
    createdAt: new Date().toISOString(),
    logs,
    url: `${deployId.substring(0, 8)}.deployments.local`
  };

  deployments.push(newDeploy);
  fs.writeFileSync(DEPLOYMENTS_PATH, JSON.stringify(deployments, null, 2));
  return newDeploy;
};

router.post('/github', auth, async (req, res) => {
  try {
    const deploy = await createDeployment(req, 'github', req.body.repoUrl);
    res.json({ success: true, data: deploy });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/zip', auth, upload.single('file'), async (req, res) => {
  try {
    const deploy = await createDeployment(req, 'zip', req.file.filename);
    res.json({ success: true, data: deploy });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/file', auth, upload.single('file'), async (req, res) => {
  try {
    const deploy = await createDeployment(req, 'file', req.file.filename);
    res.json({ success: true, data: deploy });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/rawcode', auth, async (req, res) => {
  try {
    const deploy = await createDeployment(req, 'rawcode', req.body.code);
    res.json({ success: true, data: deploy });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.get('/list', auth, (req, res) => {
  const deployments = JSON.parse(fs.readFileSync(DEPLOYMENTS_PATH, 'utf8'));
  res.json({ success: true, data: deployments.filter(d => d.userId === req.user.userId) });
});

router.get('/:id/logs', auth, (req, res) => {
    const deployments = JSON.parse(fs.readFileSync(DEPLOYMENTS_PATH, 'utf8'));
    const deploy = deployments.find(d => d.id === req.params.id && d.userId === req.user.userId);
    if (!deploy) return res.status(404).json({ success: false, error: 'Deployment not found' });
    res.json({ success: true, data: deploy.logs });
});

router.post('/:id/stop', auth, (req, res) => {
    const deployments = JSON.parse(fs.readFileSync(DEPLOYMENTS_PATH, 'utf8'));
    const index = deployments.findIndex(d => d.id === req.params.id && d.userId === req.user.userId);
    if (index === -1) return res.status(404).json({ success: false, error: 'Deployment not found' });

    deployments[index].status = 'stopped';
    deployments[index].logs.push({ from: 'system', text: 'Deployment stopped by user.', timestamp: new Date().toISOString() });
    fs.writeFileSync(DEPLOYMENTS_PATH, JSON.stringify(deployments, null, 2));
    res.json({ success: true, message: 'Deployment stopped' });
});

router.delete('/:id', auth, (req, res) => {
    let deployments = JSON.parse(fs.readFileSync(DEPLOYMENTS_PATH, 'utf8'));
    deployments = deployments.filter(d => !(d.id === req.params.id && d.userId === req.user.userId));
    fs.writeFileSync(DEPLOYMENTS_PATH, JSON.stringify(deployments, null, 2));
    res.json({ success: true, message: 'Deployment deleted' });
});

module.exports = router;
