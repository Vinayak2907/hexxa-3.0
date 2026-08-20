// Scheduled Jobs / Cron Module
// Uses node-cron package to execute background maintenance tasks
import cron from 'node-cron';

export function initCronJobs() {
  // Schedule hourly cache and session cleanup task at minute 0
  const cleanupJob = cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Executing hourly Hexa cache & session cleanup job');
  }, {
    scheduled: true,
    timezone: 'UTC'
  });

  // Schedule daily summary report task at 00:00 UTC
  const reportJob = cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Executing daily task analytics summary job');
  }, {
    scheduled: true,
    timezone: 'UTC'
  });

  console.log('✓ Scheduled background cron jobs initialized (hourly cleanup, daily report)');
  return { cleanupJob, reportJob };
}

export default initCronJobs;
