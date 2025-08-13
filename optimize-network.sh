#!/bin/bash

# Network Optimization Script for macOS
# Fixes API timeouts and connection errors

echo "🔧 Applying network optimizations..."

# 1. Increase TCP buffer sizes for better throughput
echo "📈 Increasing TCP buffers..."
sudo sysctl -w net.inet.tcp.sendspace=524288
sudo sysctl -w net.inet.tcp.recvspace=524288

# 2. Optimize TCP settings
echo "⚡ Optimizing TCP settings..."
sudo sysctl -w net.inet.tcp.delayed_ack=0  # Disable delayed ACK
sudo sysctl -w net.inet.tcp.mssdflt=1460    # Optimize MSS

# 3. Clear DNS cache
echo "🧹 Clearing DNS cache..."
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# 4. Reset network interfaces
echo "🔄 Resetting network interface..."
sudo ifconfig en0 down
sleep 1
sudo ifconfig en0 up

# 5. Kill stale connections
echo "🗑️  Cleaning up stale connections..."
sudo killall -9 networkd 2>/dev/null
sudo killall -9 mDNSResponder 2>/dev/null

# 6. Restart network services
echo "🚀 Restarting network services..."
sudo launchctl stop com.apple.mDNSResponder
sudo launchctl start com.apple.mDNSResponder

echo "✅ Network optimizations applied!"
echo ""
echo "📊 Current settings:"
sysctl net.inet.tcp.sendspace net.inet.tcp.recvspace net.inet.tcp.delayed_ack
echo ""
echo "🎯 Next steps:"
echo "1. Close unnecessary browser tabs/apps"
echo "2. Restart Claude Code"
echo "3. Test the connection again"