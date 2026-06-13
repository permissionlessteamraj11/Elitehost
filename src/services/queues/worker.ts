import { Worker } from 'bullmq';
import { connection } from './config';
import { db } from '@/lib/db/json-db';
import { decrypt } from '@/lib/security';

export const buildWorker = new Worker('build-queue', async (job) => {
  const { deploymentId, userId } = job.data;
  console.log(`Processing build job ${job.id} for deployment ${deploymentId}`);

  try {
    // 1. Get deployment and config from DB
    const deployment = await db.deployments.findOne((d: any) => d.id === deploymentId);
    if (!deployment) throw new Error("Deployment not found");

    const config = deployment.config;
    const user = await db.users.findOne((u: any) => u.id === userId);

    // Update status to 'building'
    await db.deployments.update((d: any) => d.id === deploymentId, { status: 'building' });

    // 2. Prepare Source
    if (config.source.type === 'github') {
      const token = user.github_token ? decrypt(user.github_token) : null;
      console.log(`Cloning ${config.source.repoUrl} (Branch: ${config.source.branch})`);
      // Logic to clone repo using token
    }

    // 3. Framework Detection (Simplified)
    const detectedFramework = config.projectType;
    console.log(`Detected framework: ${detectedFramework}`);

    // 4. Execution Plan
    const buildCmd = config.build.command || "npm install && npm run build";
    const startCmd = config.start.command || "npm start";

    console.log(`Running build: ${buildCmd}`);
    // Execute build...
    await new Promise(res => setTimeout(res, 3000));

    console.log(`Running deploy: ${startCmd}`);
    // Execute deploy...
    await new Promise(res => setTimeout(res, 2000));

    // 5. Success
    await db.deployments.update((d: any) => d.id === deploymentId, {
      status: 'ready',
      deployed_at: new Date().toISOString()
    });

    return { status: 'completed', deploymentId };
  } catch (err: any) {
    console.error(`Build failed for ${deploymentId}: ${err.message}`);
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
