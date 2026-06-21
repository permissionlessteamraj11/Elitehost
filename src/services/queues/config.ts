import { Queue, Worker, QueueEvents } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  lazyConnect: true, // Don't connect immediately to avoid build errors if Redis is down
  retryStrategy: (times) => {
    // Only retry in production or if we really need it, else fail fast during build
    if (process.env.NEXT_PHASE === 'phase-production-build') return null;

    // More resilient exponential backoff: 500ms, 1s, 2s, 4s, 8s, up to 10s
    const delay = Math.min(Math.pow(2, times - 1) * 500, 10000);
    return delay;
  }
});

// Handle connection errors gracefully to avoid unhandled exception log spam
const handleRedisError = (err: any, context: string) => {
  const isExpectedError =
    err.code === 'ECONNREFUSED' ||
    err.message?.includes('Connection is closed') ||
    err.message?.includes('ECONNREFUSED');

  if (!isExpectedError) {
    console.error(`[Redis] ${context} Error:`, err.message || err);
  }
};

connection.on('error', (err) => handleRedisError(err, 'Connection'));

export const buildQueue = new Queue('build-queue', { connection });
buildQueue.on('error', (err) => handleRedisError(err, 'BuildQueue'));

export const deployQueue = new Queue('deploy-queue', { connection });
deployQueue.on('error', (err) => handleRedisError(err, 'DeployQueue'));

export { connection };
