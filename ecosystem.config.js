module.exports = {
  apps: [
    {
      name: 'saaslink-emis',
      script: 'dist/main.js',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        TS_NODE_PROJECT: 'tsconfig.paths.json',
      },
    },
    {
      name: 'saaslink-client',
      script: 'serve',
      env: {
        PM2_SERVE_PATH: './dist/client',
        PM2_SERVE_PORT: 8080,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html'
      }
    }
  ],
};
