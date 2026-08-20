// Worker Process / Scheduled Jobs Demo Page
// Demonstrates background task processing for maintenance and reports

import React, { useState, useEffect } from 'react';
import PageContainer from '../components/PageContainer.jsx';
import './WorkerDemo.css';

function WorkerDemo() {
  const [workerStatus, setWorkerStatus] = useState('unknown');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkerStatus = async () => {
      setLoading(true);
      try {
        // In a real implementation, we would fetch worker status from an API endpoint
        // For demo purposes, we'll simulate checking if the worker is running
        setWorkerStatus('running');

        // Simulate job data
        const simulatedJobs = [
          {
            id: 'cleanup-expired-data',
            name: 'Expired Data Cleanup',
            description: 'Cleans up expired temporary data',
            schedule: 'Every hour',
            lastRun: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
            nextRun: new Date(Date.now() + 30 * 60 * 1000), // In 30 minutes
            status: 'healthy'
          },
          {
            id: 'send-notification-reminders',
            name: 'Notification Reminders',
            description: 'Sends reminders for upcoming or overdue tasks',
            schedule: 'Every 30 minutes',
            lastRun: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
            nextRun: new Date(Date.now() + 20 * 60 * 1000), // In 20 minutes
            status: 'healthy'
          },
          {
            id: 'generate-daily-reports',
            name: 'Daily Report Generation',
            description: 'Generates daily usage and activity reports',
            schedule: 'Daily at 2:00 AM',
            lastRun: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
            nextRun: new Date(Date.now() + 12 * 60 * 60 * 1000), // In 12 hours
            status: 'healthy'
          },
          {
            id: 'verify-database-backup',
            name: 'Database Backup Verification',
            description: 'Verifies that database backups are occurring correctly',
            schedule: 'Daily at 3:00 AM',
            lastRun: new Date(Date.now() - 15 * 60 * 60 * 1000), // 15 hours ago
            nextRun: new Date(Date.now() + 9 * 60 * 60 * 1000), // In 9 hours
            status: 'healthy'
          }
        ];

        setJobs(simulatedJobs);
      } catch (err) {
        setError('Failed to fetch worker status');
        console.error('Worker status error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkerStatus();

    // Set up interval to refresh status every 30 seconds
    const intervalId = setInterval(fetchWorkerStatus, 30 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <PageContainer
      title="Worker Process / Scheduled Jobs Demo"
      subtitle="Explore background task processing for maintenance and reports"
    >
      <div className="worker-demo-page">
        <h2>Understanding Worker Processes and Scheduled Jobs</h2>

        <div className="concept-box">
          <h3>What is a Worker Process?</h3>
          <p>
            A worker process is a background service that handles tasks that don't require
            immediate user interaction, such as data cleanup, report generation, email sending,
            and system maintenance.
          </p>
        </div>

        <div className="concept-box">
          <h3>Benefits of Worker Processes</h3>
          <ul>
            <li><strong>Improved Application Responsiveness:</strong> Long-running tasks don't block user requests</li>
            <li><strong>Resource Efficiency:</strong> Tasks can be scheduled during off-peak hours</li>
            <li><strong>Reliability:</strong> Workers can retry failed tasks and provide monitoring</li>
            <li><strong>Scalability:</strong> Multiple workers can distribute workload</li>
          </ul>
        </div>

        <div className="concept-box">
          <h3>How Hexa Implements Worker Processes</h3>
          <p>
            Hexa uses a worker process in <code>server/src/worker.js</code> that handles:
          </p>
          <ol>
            <li>Cleaning up expired temporary data (every hour)</li>
            <li>Sending notification reminders (every 30 minutes)</li>
            <li>Generating daily reports (every day at 2 AM)</li>
            <li>Verifying database backups (every day at 3 AM)</li>
          </ol>
        </div>

        <div className="concept-box">
          <h3>Worker Status</h3>
          <div className={`status-indicator ${workerStatus}`}>
            <span className="status-dot"></span>
            <span className="status-text">
              Worker Process: {workerStatus === 'running' ? '������ Running' : workerStatus === 'stopped' ? '���� Stopped' : '������ Unknown'}
            </span>
          </div>
        </div>

        {loading && (
          <div className="loading">
            <p>Loading worker status...</p>
          </div>
        )}

        {!loading && jobs.length > 0 && (
          <div className="concept-box">
            <h3>Scheduled Jobs</h3>
            <div className="jobs-table">
              {jobs.map(job => (
                <div key={job.id} className="job-card">
                  <div className="job-header">
                    <h4>{job.name}</h4>
                    <span className={`job-status ${job.status}`}>{job.status}</span>
                  </div>
                  <p className="job-description">{job.description}</p>
                  <div className="job-details">
                    <p><strong>Schedule:</strong> {job.schedule}</p>
                    <p><strong>Last Run:</strong> {job.lastRun.toLocaleString()}</p>
                    <p><strong>Next Run:</strong> {job.nextRun.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <h4>Error:</h4>
            <p>{error}</p>
          </div>
        )}

        <div className="concept-box">
          <h3>Implementation Details</h3>
          <p>
            The worker process uses <code>setInterval</code> for scheduling (in production,
            you'd use a dedicated cron library like <code>node-cron</code> or <code>agenda</code>):
          </p>
          <ul>
            <li><strong>Cleanup Expired Data:</strong> Runs every hour to remove temporary files and expired cache entries</li>
            <li><strong>Notification Reminders:</strong> Runs every 30 minutes to send upcoming task notifications</li>
            <li><strong>Daily Reports:</strong> Runs at 2 AM daily to generate usage statistics and reports</li>
            <li><strong>Backup Verification:</strong> Runs at 3 AM daily to verify backup integrity</li>
          </ul>
        </div>

        <div className="concept-box">
          <h3>Best Practices</h3>
          <ul>
            <li>Use proper logging for worker activities</li>
            <li>Implement graceful shutdown handling</li>
            <li>Monitor worker health and performance</li>
            <li>Handle errors appropriately to prevent worker crashes</li>
            <li>Consider using message queues (like Redis or RabbitMQ) for complex workflows</li>
          </ul>
        </div>
      </div>
    </PageContainer>
  );
}

export default WorkerDemo;