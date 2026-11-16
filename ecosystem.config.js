/**
 * ==============================================================================
 * PM2 Production Ecosystem Configuration for SaaSLink EMIS
 * ==============================================================================
 *
 * Guarantees a single, stable, zero-duplicate production instance.
 * - exec_mode: 'fork' + instances: 1 ensures NO duplicate cron jobs or race conditions.
 * - watch: false prevents unwanted restarts on user uploads or log file writes.
 * - autorestart: true ensures resilience against unexpected runtime exceptions.
 * - max_memory_restart: recycles memory safely if heap exceeds 1GB.
 */

module.exports = {
  apps: [
    {
      name: 'saaslink-api',
      script: 'dist/main.js',
      cwd: './',

      // STRICT SINGLE INSTANCE EXECUTION:
      // Prevents multiple cluster processes from duplicating cron schedulers,
      // payment webhooks, or background queue jobs.
      instances: 1,
      exec_mode: 'fork',

      // NEVER watch in production - prevents restarts when files are uploaded to public/uploads
      watch: false,
      ignore_watch: ['node_modules', 'public/uploads', 'logs', 'dist/client'],

      // Production Environment Variables
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      // Resilience & Restart Policies
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 3000, // 3s buffer to prevent fast-restart loops
      max_memory_restart: '1G',

      // Graceful Shutdown
      kill_timeout: 5000, // 5s for NestJS enableShutdownHooks() to close connections

      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
    },
  ],
};
