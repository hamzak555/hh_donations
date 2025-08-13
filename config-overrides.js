const path = require('path');

module.exports = function override(config, env) {
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname, 'src'),
  };
  
  // CRITICAL: Fix webpack dev server to prevent network timeouts
  if (env === 'development') {
    // Disable webpack features that cause excessive recompilation
    config.watchOptions = {
      aggregateTimeout: 2000, // Wait 2 seconds before rebuilding
      poll: false, // Completely disable polling
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/build/**',
        '**/dist/**',
        '**/*.log',
        '**/.env*'
      ]
    };

    // Optimize module federation to prevent duplicate requests
    config.optimization = {
      ...config.optimization,
      removeAvailableModules: false,
      removeEmptyChunks: false,
      splitChunks: false,
      runtimeChunk: false,
      sideEffects: false,
      providedExports: false,
      usedExports: false
    };

    // Configure dev server with HMR enabled
    config.devServer = {
      ...config.devServer,
      host: 'localhost',
      port: 3000,
      hot: true, // Enable HMR
      liveReload: true, // Enable live reload
      webSocketServer: 'ws', // Enable WebSocket for HMR
      static: {
        watch: true // Enable static file watching
      },
      client: {
        overlay: true, // Show errors in browser
        progress: true // Show compilation progress
      },
      compress: true,
      historyApiFallback: true
    };

    // Disable performance hints that cause overhead
    config.performance = false;

    // Enable filesystem cache for faster rebuilds
    config.cache = {
      type: 'filesystem',
      allowCollectingMemory: true,
      compression: false,
      hashAlgorithm: 'md4',
      idleTimeout: 60000,
      idleTimeoutForInitialStore: 5000,
      maxAge: 5184000000,
      maxMemoryGenerations: 1,
      memoryCacheUnaffected: true,
      name: 'hhdonations-dev-cache',
      store: 'pack',
      version: '1.0.0'
    };

    // Disable source maps to reduce memory and CPU
    config.devtool = false;
  }
  
  return config;
};