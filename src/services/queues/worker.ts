import { Worker } from 'bullmq';
import { connection } from './config';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/security';
import { DockerBuilder } from '../engine/builder/docker-generator';
import { VPSManager } from '../vps-manager';
import fs from 'fs/promises';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export const buildWorker = new Worker('build-queue', async (job) => {
  const { deploymentId, userId } = job.data;
  console.log(`Processing build job ${job.id} for deployment ${deploymentId}`);

  const appendLog = async (message: string) => {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] ${message}`;
    console.log(formattedMessage);
    const d = await prisma.deployment.findUnique({ where: { id: deploymentId } });
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        logs: (d?.logs || "") + formattedMessage + "\n"
      }
    });
  };

  const workDir = path.join(process.cwd(), 'data', 'builds', deploymentId);

  try {
    const deployment = await prisma.deployment.findUnique({ where: { id: deploymentId } });
    if (!deployment) throw new Error("Deployment not found");

    const config = typeof deployment.config === 'string' ? JSON.parse(deployment.config) : deployment.config;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    await prisma.deployment.update({
      where: { id: deploymentId },
      data: { status: 'BUILDING', logs: "" }
    });

    await appendLog(`Starting deployment for ${deployment.name}...`);
    await fs.mkdir(workDir, { recursive: true });

    // 1. Source Retrieval
    if (config.source.type === 'github') {
      const token = user?.github_token ? decrypt(user.github_token) : null;
      const repoUrl = config.source.repoUrl;
      const branch = config.source.branch || 'main';

      let authenticatedUrl = repoUrl;
      if (token) {
        authenticatedUrl = repoUrl.replace('https://', `https://${token}@`);
      }

      await appendLog(`[BUILD] Cloning repository: ${repoUrl} (Branch: ${branch})`);
      await execFileAsync('git', ['clone', '--depth', '1', '-b', branch, authenticatedUrl, workDir]);
      await appendLog(`[BUILD] Repository cloned successfully.`);
    } else if (config.source.type === 'zip') {
      await appendLog(`[BUILD] Processing ZIP archive...`);
      // ZIP extraction logic would go here
      await new Promise(res => setTimeout(res, 1000));
    } else if (config.source.type === 'raw') {
        await appendLog(`[BUILD] Creating project from raw code...`);
        const fileName = config.runtime?.language === 'python' ? 'app.py' : 'index.js';
        await fs.writeFile(path.join(workDir, fileName), config.source.rawCode || "");
    }

    // 2. Framework Detection
    let detectedFramework = config.projectType || "nodejs";
    try {
        const files = await fs.readdir(workDir);
        if (files.includes('package.json')) {
            detectedFramework = 'nodejs';
        } else if (files.includes('requirements.txt') || files.includes('main.py') || files.includes('app.py')) {
            detectedFramework = 'python';
        } else if (files.includes('index.html')) {
            detectedFramework = 'static';
        }
    } catch (e) {}

    await appendLog(`[BUILD] Detected framework: ${detectedFramework}`);

    // 3. Docker Image Generation
    const containerName = `elitehost-${deploymentId.substring(0, 8)}`;
    const imageName = `elitehost/app-${deploymentId.substring(0, 8)}:latest`;

    await appendLog(`[DOCKER] Generating Dockerfile for ${detectedFramework}...`);
    const dockerfile = DockerBuilder.generate({ ...config, projectType: detectedFramework });
    await fs.writeFile(path.join(workDir, 'Dockerfile'), dockerfile);

    await appendLog(`[DOCKER] Building image: ${imageName}`);

    // Real Docker build
    const buildProcess = execFile('docker', ['build', '-t', imageName, workDir]);
    buildProcess.stdout?.on('data', (data) => appendLog(`[BUILD] ${data.toString().trim()}`));
    buildProcess.stderr?.on('data', (data) => appendLog(`[BUILD ERROR] ${data.toString().trim()}`));

    await new Promise((resolve, reject) => {
        buildProcess.on('close', (code) => {
            if (code === 0) resolve(null);
            else reject(new Error(`Docker build failed with code ${code}`));
        });
    });

    // 4. Deployment
    await appendLog(`[DEPLOY] Finding available port...`);
    const hostPort = await VPSManager.findAvailablePort(30000, 40000);

    await appendLog(`[DEPLOY] Stopping existing container if any...`);
    await VPSManager.deleteContainer(containerName);

    await appendLog(`[DEPLOY] Starting container ${containerName} on port ${hostPort}...`);
    const containerId = await VPSManager.createContainer({
        name: containerName,
        image: imageName,
        memoryLimit: '512m',
        cpuLimit: 0.5,
        ports: { container: config.start?.port || 3000, host: hostPort },
        env: config.env?.public || {}
    });

    await appendLog(`[DEPLOY] Container started: ${containerId}`);
    await appendLog(`[DEPLOY] Deployment successful!`);

    await prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        status: 'READY',
        container_id: containerId,
        port: hostPort,
        deployed_at: new Date()
      }
    });

    return { status: 'completed', deploymentId };
  } catch (err: any) {
    await appendLog(`[ERROR] ${err.message}`);
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        status: 'ERROR',
        error_message: err.message
      }
    });
    throw err;
  } finally {
      try {
        await fs.rm(workDir, { recursive: true, force: true });
      } catch (e) {
          console.error(`Cleanup failed for ${workDir}:`, e);
      }
  }
}, { connection });
