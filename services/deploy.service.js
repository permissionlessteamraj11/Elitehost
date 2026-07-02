const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const simpleGit = require('simple-git');
const AdmZip = require('adm-zip');
const pm2Service = require('./pm2.service');
const Deployment = require('../models/Deployment');
const EventEmitter = require('events');

const deployEvents = new EventEmitter();

async function execStream(command, cwd, emitter, deployId) {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    const child = spawn(cmd, args, { cwd, shell: true });

    child.stdout.on('data', (data) => {
      emitter.emit('log', { deployId, text: data.toString() });
    });

    child.stderr.on('data', (data) => {
      emitter.emit('log', { deployId, text: data.toString() });
    });

    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with code ${code}`));
    });
  });
}

async function detectBuildCommand(dir) {
  try {
    await fs.access(path.join(dir, 'requirements.txt'));
    return 'pip install -r requirements.txt';
  } catch (e) {
    return null;
  }
}

async function detectRunCommand(dir) {
  const files = await fs.readdir(dir);
  for (const f of ['main.py', 'bot.py', 'app.py', 'run.py', 'start.py']) {
    if (files.includes(f)) return `python3 ${f}`;
  }
  const pyFiles = files.filter(f => f.endsWith('.py'));
  if (pyFiles.length === 1) return `python3 ${pyFiles[0]}`;
  return null;
}

exports.deployFromGitHub = async ({ userId, deployId, repoUrl, branch, buildCommand, runCommand, envVars, githubToken }) => {
  const dir = path.join(__dirname, '../deployments', userId.toString(), deployId.toString());
  await fs.mkdir(dir, { recursive: true });

  deployEvents.emit('log', { deployId, text: `[INFO] Starting deployment for ${deployId}\n` });

  try {
    // Clone
    const authUrl = githubToken ? repoUrl.replace('https://', `https://${githubToken}@`) : repoUrl;
    deployEvents.emit('log', { deployId, text: `[INFO] Cloning repository...\n` });
    const git = simpleGit();
    await git.clone(authUrl, dir, ['--branch', branch, '--depth', '1']);

    // Env
    if (envVars) {
      let envContent = "";
      for (const [k, v] of Object.entries(envVars)) {
        envContent += `${k}=${v}\n`;
      }
      await fs.writeFile(path.join(dir, '.env'), envContent);
    }

    // Commands
    const finalBuildCmd = buildCommand || await detectBuildCommand(dir);
    const finalRunCmd = runCommand || await detectRunCommand(dir);

    if (!finalRunCmd) throw new Error("Could not detect run command.");

    if (finalBuildCmd) {
      deployEvents.emit('log', { deployId, text: `[INFO] Running build: ${finalBuildCmd}\n` });
      await execStream(finalBuildCmd, dir, deployEvents, deployId);
    }

    deployEvents.emit('log', { deployId, text: `[INFO] Starting process...\n` });
    await pm2Service.start({
      name: deployId.toString(),
      script: finalRunCmd.split(' ')[0],
      args: finalRunCmd.split(' ').slice(1).join(' '),
      cwd: dir,
      env: { ...envVars, NODE_ENV: 'production' }
    });

    await Deployment.findByIdAndUpdate(deployId, { status: 'running', deployedAt: new Date(), runCommand: finalRunCmd, buildCommand: finalBuildCmd });
    deployEvents.emit('log', { deployId, text: `[SUCCESS] Deployment live!\n` });

  } catch (error) {
    deployEvents.emit('log', { deployId, text: `[ERROR] ${error.message}\n` });
    await Deployment.findByIdAndUpdate(deployId, { status: 'failed', errorMessage: error.message });
  }
};

exports.deployFromZip = async ({ userId, deployId, zipPath, buildCommand, runCommand, envVars }) => {
    const dir = path.join(__dirname, '../deployments', userId.toString(), deployId.toString());
    await fs.mkdir(dir, { recursive: true });

    deployEvents.emit('log', { deployId, text: `[INFO] Starting ZIP deployment for ${deployId}\n` });

    try {
      deployEvents.emit('log', { deployId, text: `[INFO] Extracting ZIP...\n` });
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(dir, true);
      await fs.unlink(zipPath);

      // Env
      if (envVars) {
        let envContent = "";
        for (const [k, v] of Object.entries(envVars)) {
          envContent += `${k}=${v}\n`;
        }
        await fs.writeFile(path.join(dir, '.env'), envContent);
      }

      const finalBuildCmd = buildCommand || await detectBuildCommand(dir);
      const finalRunCmd = runCommand || await detectRunCommand(dir);

      if (!finalRunCmd) throw new Error("Could not detect run command.");

      if (finalBuildCmd) {
        deployEvents.emit('log', { deployId, text: `[INFO] Running build: ${finalBuildCmd}\n` });
        await execStream(finalBuildCmd, dir, deployEvents, deployId);
      }

      deployEvents.emit('log', { deployId, text: `[INFO] Starting process...\n` });
      await pm2Service.start({
        name: deployId.toString(),
        script: finalRunCmd.split(' ')[0],
        args: finalRunCmd.split(' ').slice(1).join(' '),
        cwd: dir,
        env: { ...envVars, NODE_ENV: 'production' }
      });

      await Deployment.findByIdAndUpdate(deployId, { status: 'running', deployedAt: new Date(), runCommand: finalRunCmd, buildCommand: finalBuildCmd });
      deployEvents.emit('log', { deployId, text: `[SUCCESS] Deployment live!\n` });

    } catch (error) {
      deployEvents.emit('log', { deployId, text: `[ERROR] ${error.message}\n` });
      await Deployment.findByIdAndUpdate(deployId, { status: 'failed', errorMessage: error.message });
    }
  };

exports.deployEvents = deployEvents;
