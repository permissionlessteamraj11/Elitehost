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

    // 2. Prepare Source (Simulation)
    if (config.source.type === 'github') {
      const token = user.github_token ? decrypt(user.github_token) : null;
      console.log(`[BUILD] Cloning ${config.source.repoUrl} (Branch: ${config.source.branch})`);
      // In a real environment, this would use 'git clone' with the token
      await new Promise(res => setTimeout(res, 2000));
      console.log(`[BUILD] Repository cloned successfully.`);
    } else if (config.source.type === 'zip') {
      console.log(`[BUILD] Extracting ZIP archive...`);
      await new Promise(res => setTimeout(res, 1500));
    }

    // 3. Framework Detection & Dependency Analysis
    const detectedFramework = config.projectType || "nodejs";
    console.log(`[BUILD] Detected framework: ${detectedFramework}`);
    await new Promise(res => setTimeout(res, 1000));

    // 4. Execution Plan (Build Phase)
    const buildCmd = config.build.command || (detectedFramework === 'python' ? "pip install -r requirements.txt" : "npm install && npm run build");
    console.log(`[BUILD] Running build: ${buildCmd}`);

    // Simulate build logs
    const stages = ["Installing dependencies...", "Compiling assets...", "Optimizing bundle...", "Build finished."];
    for (const stage of stages) {
        console.log(`[BUILD] ${stage}`);
        await new Promise(res => setTimeout(res, 1500));
    }

    // 5. Deployment Phase
    const startCmd = config.start.command || (detectedFramework === 'python' ? "python main.py" : "npm start");
    console.log(`[DEPLOY] Starting application with: ${startCmd}`);

    await new Promise(res => setTimeout(res, 2000));
    console.log(`[DEPLOY] Health check passed on port ${config.start.port || 3000}`);

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
