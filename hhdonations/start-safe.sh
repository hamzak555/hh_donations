#!/bin/bash

echo "🛡️  Starting HH Donations in Safe Mode (Network-Friendly)"
echo "================================================"
echo ""

# Kill any existing Node processes
killall node 2>/dev/null

# Clear any locks
rm -rf node_modules/.cache

# Set environment for minimal network usage
export BROWSER=none
export HOST=127.0.0.1
export PORT=3000
export FAST_REFRESH=false
export DISABLE_ESLINT_PLUGIN=true
export GENERATE_SOURCEMAP=false
export WDS_SOCKET_PORT=3000
export CHOKIDAR_USEPOLLING=false
export WATCHPACK_POLLING=false
export NODE_OPTIONS="--max-old-space-size=256"

echo "✅ Environment configured for minimal resource usage"
echo ""
echo "Starting options:"
echo "1) Development mode (with hot reload) - May affect network"
echo "2) Production build (static files) - No network impact"
echo "3) Existing build (if available) - Fastest, no network impact"
echo ""
read -p "Choose option (1/2/3): " choice

case $choice in
  1)
    echo "Starting development server with minimal resources..."
    npm run start:lite
    ;;
  2)
    echo "Building production version..."
    npm run build
    echo "Starting production server..."
    npx serve -s build -p 3000
    ;;
  3)
    if [ -d "build" ]; then
      echo "Starting existing build..."
      npx serve -s build -p 3000
    else
      echo "No build found. Creating one..."
      npm run build
      npx serve -s build -p 3000
    fi
    ;;
  *)
    echo "Invalid option. Starting safest mode (existing build)..."
    npx serve -s build -p 3000
    ;;
esac