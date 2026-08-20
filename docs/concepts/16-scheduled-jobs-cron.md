# Scheduled Jobs / Cron

## Overview
Scheduled jobs (or cron jobs) are background tasks that run automatically at predefined intervals or specific times. They are essential for maintenance, reporting, and automated workflows that don't require user interaction.

## Benefits
- Automates repetitive tasks
- Runs during off-peak hours to minimize impact
- Ensures regular maintenance without manual intervention
- Enables batch processing for efficiency
- Provides reliable timing for time-sensitive operations

## Implementation in Hexa
Hexa implements a worker process in `server/src/worker.js` that handles various scheduled tasks:

### Scheduled Jobs:
1. **Expired Data Cleanup** (Every hour)
   - Removes temporary files and expired cache entries
   - Helps maintain system performance and storage efficiency

2. **Notification Reminders** (Every 30 minutes)
   - Sends reminders for upcoming or overdue tasks
   - Improves user engagement and task completion rates

3. **Daily Report Generation** (Daily at 2:00 AM)
   - Generates usage statistics and activity reports
   - Provides insights for administrators and stakeholders

4. **Database Backup Verification** (Daily at 3:00 AM)
   - Verifies that database backups are occurring correctly
   - Ensures data integrity and disaster recovery readiness

### Technical Details:
- Uses `setInterval` for scheduling (in production, consider node-cron or agenda libraries)
- Each job includes error handling and logging
- Jobs are designed to be idempotent where possible
- Graceful shutdown handling for maintenance periods

## Best Practices
- Log job execution for monitoring and debugging
- Implement idempotency to handle potential duplicate runs
- Monitor job performance and execution times
- Consider using dedicated job queues for complex workflows
- Test jobs thoroughly in staging environments
- Alert on job failures for timely intervention