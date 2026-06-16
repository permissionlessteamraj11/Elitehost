import { Queue, Worker, QueueEvents } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  lazyConnect: true, // Don't connect immediately to avoid build errors if Redis is down
  retryStrategy: (times) => {
    // Only retry in production or if we really need it, else fail fast during build
    if (process.env.NEXT_PHASE === 'phase-production-build') return null;
    return Math.min(times * 50, 2000);
  }
});

export const buildQueue = new Queue('build-queue', { connection });
export const deployQueue = new Queue('deploy-queue', { connection });

export { connection };
