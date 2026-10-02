/**
 * PM2 Process Manager Configuration for KonsulYuk Backend
 * Runtime: Deno (TypeScript)
 * Usage:
 *   pm2 start ecosystem.config.cjs
 *   pm2 restart ecosystem.config.cjs
 *   pm2 stop ecosystem.config.cjs
 *   pm2 logs konsulyuk-backend
 */

module.exports = {
  apps: [
    {
      name: "konsulyuk-backend",
      script: "src/index.ts",
      interpreter: "deno",
      interpreter_args: "run -A",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      restart_delay: 2000,
      env: {
        PORT: 5000,
        NODE_ENV: "production",
      },
      env_development: {
        PORT: 5000,
        NODE_ENV: "development",
      },
      time: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      merge_logs: true,
    },
  ],
}
