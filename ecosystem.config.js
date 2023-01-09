module.exports = {
  apps: [
    {
      name: 'redux-boilerplate',
      script: 'npm',
      args: 'run prod',
      env: {
        NODE_ENV: 'production',
        BASE_URL: 'http://localhost',
      },
      // npm run build && pm2 start ecosystem.config.js --only hospital-new-prod --env production
    },
  ],
  deploy: {
    production: {
      user: 'SSH_USERNAME',
      host: 'SSH_HOSTMACHINE',
      ref: 'origin/master',
      repo: 'GIT_REPOSITORY',
      path: 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy':
        'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },
}
