#!/bin/bash

echo "🔍 Network Timeout Diagnostic & Fix"
echo "===================================="
echo ""

# 1. Test current connection
echo "📡 Testing API connectivity..."
curl -s -o /dev/null -w "Connection time: %{time_connect}s\nTotal time: %{time_total}s\n" https://api.anthropic.com/
echo ""

# 2. Check for resource hogs
echo "📊 Top bandwidth consumers:"
lsof -i -n | grep ESTABLISHED | awk '{print $1}' | sort | uniq -c | sort -rn | head -5
echo ""

# 3. Count open connections
echo "🔗 Open connections by state:"
netstat -an | grep tcp | awk '{print $6}' | sort | uniq -c
echo ""

# 4. Kill Chrome/Wavebox helper processes
echo "🧹 Cleaning up browser processes..."
pkill -f "Chrome Helper" 2>/dev/null
pkill -f "Wavebox Helper" 2>/dev/null
echo "Cleaned up helper processes"
echo ""

# 5. Clear local DNS cache (user-level)
echo "🔄 Clearing DNS cache..."
dscacheutil -flushcache 2>/dev/null
echo "DNS cache cleared"
echo ""

# 6. Test connection again
echo "📡 Re-testing API connectivity..."
curl -s -o /dev/null -w "Connection time: %{time_connect}s\nTotal time: %{time_total}s\n" https://api.anthropic.com/
echo ""

echo "✅ Immediate fixes applied!"
echo ""
echo "📝 Manual steps to run in Terminal:"
echo "-----------------------------------"
echo "sudo sysctl -w net.inet.tcp.sendspace=524288"
echo "sudo sysctl -w net.inet.tcp.recvspace=524288"
echo "sudo sysctl -w net.inet.tcp.delayed_ack=0"
echo "sudo dscacheutil -flushcache"
echo ""
echo "🎯 Additional recommendations:"
echo "1. Close Wavebox/Chrome tabs you're not using"
echo "2. Disable browser extensions temporarily"
echo "3. Check if VPN is active and try disabling it"
echo "4. Restart your router if issues persist"