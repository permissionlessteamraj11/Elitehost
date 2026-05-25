import { Queue, Worker, QueueEvents } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const buildQueue = new Queue('build-queue', { connection });
export const deployQueue = new Queue('deploy-queue', { connection });

export { connection };
