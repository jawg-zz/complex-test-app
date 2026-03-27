import Bull from 'bull';
import Redis from 'ioredis';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT) || 6379;

const redis = new Redis({
  host: redisHost,
  port: redisPort,
});

const emailQueue = new Bull('email-notifications', {
  redis: {
    host: redisHost,
    port: redisPort,
  },
});

const cleanupQueue = new Bull('task-cleanup', {
  redis: {
    host: redisHost,
    port: redisPort,
  },
});

console.log('Worker service started');
console.log(`Connected to Redis at ${redisHost}:${redisPort}`);

emailQueue.process(async (job) => {
  const { to, subject, body } = job.data;
  console.log(`[Email] Sending email to: ${to}`);
  console.log(`[Email] Subject: ${subject}`);
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log(`[Email] Email sent successfully to: ${to}`);
  return { success: true, to };
});

cleanupQueue.process(async (job) => {
  const { taskId, daysOld } = job.data;
  console.log(`[Cleanup] Cleaning up task: ${taskId} (${daysOld} days old)`);
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log(`[Cleanup] Task ${taskId} cleaned up`);
  return { success: true, taskId };
});

emailQueue.on('completed', (job, result) => {
  console.log(`[Email] Job completed: ${job.id}`, result);
});

emailQueue.on('failed', (job, err) => {
  console.error(`[Email] Job failed: ${job.id}`, err);
});

cleanupQueue.on('completed', (job, result) => {
  console.log(`[Cleanup] Job completed: ${job.id}`, result);
});

cleanupQueue.on('failed', (job, err) => {
  console.error(`[Cleanup] Job failed: ${job.id}`, err);
});

async function healthCheck() {
  try {
    await redis.ping();
    return { status: 'healthy', redis: 'connected' };
  } catch (error) {
    return { status: 'unhealthy', redis: 'disconnected' };
  }
}

setInterval(async () => {
  const health = await healthCheck();
  console.log(`[Health] ${new Date().toISOString()} -`, health);
}, 30000);

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing worker...');
  await emailQueue.close();
  await cleanupQueue.close();
  await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing worker...');
  await emailQueue.close();
  await cleanupQueue.close();
  await redis.quit();
  process.exit(0);
});
