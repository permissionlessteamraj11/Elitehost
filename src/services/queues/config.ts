import { Queue, Worker, QueueEvents } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  lazyConnect: true,
  retryStrategy: (times) => {
    if (process.env.NEXT_PHASE === 'phase-production-build') return null;
    const delay = Math.min(Math.pow(2, times - 1) * 500, 10000);
    return delay;
  }
});

connection.on('error', (err: any) => {
    const isExpectedError =
      err.code === 'ECONNREFUSED' ||
      err.message?.includes('Connection is closed');

    if (!isExpectedError) {
      console.error('[Redis] Connection Error:', err.message || err);
    }
});

export const buildQueue = new Queue('build-queue', { connection });
export const deployQueue = new Queue('deploy-queue', { connection });

export { connection };
