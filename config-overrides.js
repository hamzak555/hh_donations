const path = require('path');

module.exports = function override(config, env) {
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname, 'src'),
  };
  
  // Add webpack dev server optimizations to prevent network issues
  if (env === 'development') {
    config.devServer = {
      ...config.devServer,
      // Only serve on localhost, don't expose to network
      host: 'localhost',
      // Disable automatic browser opening
      open: false,
      // Reduce websocket connections
      webSocketServer: 'ws',
      // Disable hot module replacement to reduce network traffic
      hot: false,
      // Use less aggressive live reloading
      liveReload: true,
      // Compress responses to reduce bandwidth
      compress: true,
      // Set specific port
      port: 3000,
      // Disable host checking
      allowedHosts: 'auto',
      // Client-side optimizations
      client: {
        webSocketURL: 'ws://localhost:3000/ws',
        // Reduce overlay for errors
        overlay: {
          errors: true,
          warnings: false,
        },
        // Reduce reconnect attempts
        reconnect: 3,
      },
      // Watch options to reduce file system polling
      watchOptions: {
        ignored: /node_modules/,
        // Increase poll interval to reduce CPU/network usage
        poll: 1000,
        aggregateTimeout: 300,
      },
    };
  }
  
  return config;
};