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
const { spawn } = require('child_process');

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
  const { buildCommand, deployCommand, githubToken, envVars } = req.body;

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

  // Actual Execution Engine
  setTimeout(async () => {
    const deployDir = path.join(UPLOADS_PATH, deployId);
    if (!fs.existsSync(deployDir)) fs.mkdirSync(deployDir, { recursive: true });

    const addLog = (text) => {
        logs.push({ from: 'system', text, timestamp: new Date().toISOString() });
        const currentDeploys = JSON.parse(fs.readFileSync(DEPLOYMENTS_PATH, 'utf8'));
        const idx = currentDeploys.findIndex(d => d.id === deployId);
        if (idx !== -1) {
            currentDeploys[idx].logs = [...logs];
            fs.writeFileSync(DEPLOYMENTS_PATH, JSON.stringify(currentDeploys, null, 2));
        }
    };

    const updatePID = (pid) => {
        const currentDeploys = JSON.parse(fs.readFileSync(DEPLOYMENTS_PATH, 'utf8'));
        const idx = currentDeploys.findIndex(d => d.id === deployId);
        if (idx !== -1) {
            currentDeploys[idx].pid = pid;
            fs.writeFileSync(DEPLOYMENTS_PATH, JSON.stringify(currentDeploys, null, 2));
        }
    };

    try {
        if (envVars && Object.keys(envVars).length > 0) {
            addLog(`Loading environment variables: ${Object.keys(envVars).join(', ')}`);
        }

        if (type === 'github') {
            let cloneUrl = source;
            if (githubToken) {
                cloneUrl = source.replace('https://', `https://${githubToken}@`);
            }
            addLog(`Cloning repository: ${source}...`);
            await simpleGit().clone(cloneUrl, deployDir);
            addLog('Clone successful.');

            const finalBuildCmd = buildCommand || (fs.existsSync(path.join(deployDir, 'requirements.txt')) ? 'pip install -r requirements.txt' : null);
            if (finalBuildCmd) {
                addLog(`Running build: ${finalBuildCmd}`);
                await new Promise((resolve, reject) => {
                    const [cmd, ...args] = finalBuildCmd.split(' ');
                    const proc = spawn(cmd, args, { cwd: deployDir, env: { ...process.env, ...envVars } });
                    proc.stdout.on('data', (data) => addLog(data.toString()));
                    proc.stderr.on('data', (data) => addLog(`Stderr: ${data.toString()}`));
                    proc.on('close', (code) => code === 0 ? resolve() : reject(new Error(`Exit code ${code}`)));
                });
            }

            const finalDeployCmd = deployCommand || (fs.existsSync(path.join(deployDir, 'main.py')) ? 'python3 main.py' : null);
            if (finalDeployCmd) {
                addLog(`Starting application: ${finalDeployCmd}`);
                const [cmd, ...args] = finalDeployCmd.split(' ');
                const proc = spawn(cmd, args, { cwd: deployDir, env: { ...process.env, ...envVars } });
                updatePID(proc.pid);
                proc.stdout.on('data', (data) => addLog(data.toString()));
                proc.stderr.on('data', (data) => addLog(`Runtime Stderr: ${data.toString()}`));
                proc.on('error', (err) => addLog(`Runtime Error: ${err.message}`));
            }

        } else if (type === 'zip') {
            const zipPath = path.join(UPLOADS_PATH, source);
            addLog(`Extracting ZIP: ${source}...`);
            const zip = new AdmZip(zipPath);
            zip.extractAllTo(deployDir, true);
            addLog('Extraction complete.');

            if (buildCommand) {
                addLog(`Running build: ${buildCommand}`);
                await new Promise((resolve, reject) => {
                    const [cmd, ...args] = buildCommand.split(' ');
                    const proc = spawn(cmd, args, { cwd: deployDir, env: { ...process.env, ...envVars } });
                    proc.stdout.on('data', (data) => addLog(data.toString()));
                    proc.on('close', (code) => resolve());
                });
            }
            if (deployCommand) {
                addLog(`Starting application: ${deployCommand}`);
                const [cmd, ...args] = deployCommand.split(' ');
                const proc = spawn(cmd, args, { cwd: deployDir, env: { ...process.env, ...envVars } });
                updatePID(proc.pid);
            }

        } else if (type === 'file') {
            const filePath = path.join(UPLOADS_PATH, source);
            addLog(`Deploying single file: ${source}`);
            fs.copyFileSync(filePath, path.join(deployDir, source));
            const cmdStr = source.endsWith('.py') ? `python3 ${source}` : (source.endsWith('.js') ? `node ${source}` : null);
            if (cmdStr) {
                addLog(`Running: ${cmdStr}`);
                const [cmd, ...args] = cmdStr.split(' ');
                const proc = spawn(cmd, args, { cwd: deployDir, env: { ...process.env, ...envVars } });
                updatePID(proc.pid);
            }
        }

        addLog('Deployment setup completed.');
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

    const pid = deployments[index].pid;
    if (pid) {
        try {
            process.kill(pid, 'SIGTERM');
            deployments[index].logs.push({ from: 'system', text: `Terminated process (PID: ${pid})`, timestamp: new Date().toISOString() });
        } catch (e) {
            console.error(`Failed to kill process ${pid}:`, e);
        }
    }

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
