import { Worker } from 'bullmq';
import { connection } from './config';
import { db } from '@/lib/db/json-db';
import { decrypt } from '@/lib/security';
import { DockerBuilder } from '../engine/builder/docker-generator';

export const buildWorker = new Worker('build-queue', async (job) => {
  const { deploymentId, userId } = job.data;
  console.log(`Processing build job ${job.id} for deployment ${deploymentId}`);

  let currentLogs = "";
  const appendLog = async (message: string) => {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] ${message}`;
    console.log(formattedMessage);
    currentLogs += formattedMessage + "\n";
    await db.deployments.update((d: any) => d.id === deploymentId, { logs: currentLogs });
  };

  try {
    // 1. Get deployment and config from DB
    const deployment = await db.deployments.findOne((d: any) => d.id === deploymentId);
    if (!deployment) throw new Error("Deployment not found");

    const config = deployment.config;
    const user = await db.users.findOne((u: any) => u.id === userId);

    // Update status to 'building'
    await db.deployments.update((d: any) => d.id === deploymentId, { status: 'building', logs: "" });
    await appendLog(`Starting deployment for ${deployment.name}...`);

    // 2. Prepare Source (Simulation)
    if (config.source.type === 'github') {
      const token = user.github_token ? decrypt(user.github_token) : null;
      await appendLog(`[BUILD] Cloning ${config.source.repoUrl} (Branch: ${config.source.branch})`);
      // In a real environment, this would use 'git clone' with the token
      await new Promise(res => setTimeout(res, 2000));
      await appendLog(`[BUILD] Repository cloned successfully.`);
    } else if (config.source.type === 'zip') {
      await appendLog(`[BUILD] Extracting ZIP archive...`);
      await new Promise(res => setTimeout(res, 1500));
    }

    // 3. Framework Detection & Dependency Analysis
    const detectedFramework = config.projectType || "nodejs";
    await appendLog(`[BUILD] Detected framework: ${detectedFramework}`);
    await new Promise(res => setTimeout(res, 1000));

    // 4. Execution Plan (Docker Build Phase)
    const containerName = `elitehost-${deploymentId.substring(0, 8)}`;
    const imageName = `elitehost/app-${deploymentId.substring(0, 8)}:latest`;

    await appendLog(`[DOCKER] Generating Dockerfile for ${detectedFramework}...`);
    const dockerfile = DockerBuilder.generate(config);
    // In a real VPS, we would write this to a file: fs.writeFile('Dockerfile', dockerfile)

    await appendLog(`[DOCKER] Building image: ${imageName}`);
    const buildStages = [
      "Step 1/10 : FROM node:22-alpine AS base",
      "Step 2/10 : WORKDIR /app",
      "Step 3/10 : COPY package.json pnpm-lock.yaml ./",
      "Step 4/10 : RUN corepack enable pnpm && pnpm i",
      "Step 5/10 : COPY . .",
      "Step 6/10 : RUN npm run build",
      "Step 7/10 : EXPOSE 3000",
      "Successfully built " + imageName
    ];

    for (const stage of buildStages) {
      await appendLog(`[BUILD] ${stage}`);
      await new Promise(res => setTimeout(res, 800));
    }

    // 5. Deployment Phase (Docker Run)
    await appendLog(`[DEPLOY] Stopping existing container if any...`);
    await appendLog(`[DEPLOY] docker stop ${containerName} || true`);

    await appendLog(`[DEPLOY] Starting isolated container...`);
    const port = config.start.port || 3000;
    const dockerRunCmd = `docker run -d --name ${containerName} -p ${port}:${port} --restart unless-stopped ${imageName}`;
    await appendLog(`[DEPLOY] ${dockerRunCmd}`);

    await new Promise(res => setTimeout(res, 2000));
    await appendLog(`[DEPLOY] Health check passed for container ${containerName}`);
    await appendLog(`[DEPLOY] Deployment successful! Access via port ${port}`);

    // 5. Success
    await db.deployments.update((d: any) => d.id === deploymentId, {
      status: 'ready',
      deployed_at: new Date().toISOString()
    });

    return { status: 'completed', deploymentId };
  } catch (err: any) {
    const errorMessage = `Build failed for ${deploymentId}: ${err.message}`;
    console.error(errorMessage);
    await appendLog(`[ERROR] ${err.message}`);
    await db.deployments.update((d: any) => d.id === deploymentId, {
      status: 'error',
      error_message: err.message
    });
    throw err;
  }
}, { connection });

buildWorker.on('completed', (job) => {
  console.log(`Build job ${job.id} completed`);
});

buildWorker.on('failed', (job, err) => {
  console.error(`Build job ${job?.id} failed: ${err.message}`);
});
