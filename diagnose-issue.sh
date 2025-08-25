#!/bin/bash

# 🔍 Quick diagnostic script for Cosmos 2048 timeout issues

echo "🔍 Diagnosing Cosmos 2048 Timeout Issues"
echo "========================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "📊 1. Container Status:"
echo "----------------------"
docker compose -f docker-compose.low-memory.yml ps

echo ""
echo "💾 2. Memory Usage:"
echo "------------------"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

echo ""
echo "📋 3. Frontend Container Logs (last 20 lines):"
echo "-----------------------------------------------"
docker compose -f docker-compose.low-memory.yml logs --tail=20 web

echo ""
echo "📋 4. API Container Logs (last 10 lines):"
echo "------------------------------------------"
docker compose -f docker-compose.low-memory.yml logs --tail=10 api

echo ""
echo "🌐 5. Network Connectivity Test:"
echo "--------------------------------"
echo "Testing internal container connectivity..."

# Test if frontend container responds internally
echo -n "Frontend internal (port 3017): "
if docker exec cosmos2048-nginx-low-mem wget -q --timeout=5 --tries=1 -O /dev/null http://web:3017/ 2>/dev/null; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ TIMEOUT/ERROR${NC}"
fi

# Test if API responds internally  
echo -n "API internal (port 5017): "
if docker exec cosmos2048-nginx-low-mem wget -q --timeout=5 --tries=1 -O /dev/null http://api:5017/health 2>/dev/null; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ TIMEOUT/ERROR${NC}"
fi

echo ""
echo "🔧 6. System Resources:"
echo "----------------------"
free -h
echo ""
df -h /

echo ""
echo "🎯 7. Suggested Actions:"
echo "------------------------"

# Check if frontend is running
if ! docker compose -f docker-compose.low-memory.yml ps web | grep -q "Up"; then
    echo -e "${RED}❌ Frontend container is not running${NC}"
    echo "   → Try: docker compose -f docker-compose.low-memory.yml restart web"
fi

# Check memory usage
MEMORY_PERCENT=$(free | grep '^Mem:' | awk '{print int($3/$2 * 100)}')
if [ $MEMORY_PERCENT -gt 90 ]; then
    echo -e "${RED}❌ Memory usage is very high (${MEMORY_PERCENT}%)${NC}"
    echo "   → Try: docker system prune -f"
    echo "   → Or: sudo swapoff -a && sudo swapon -a"
fi

echo ""
echo "🔄 Quick Fix Commands:"
echo "---------------------"
echo "# Restart all services:"
echo "docker compose -f docker-compose.low-memory.yml restart"
echo ""
echo "# Rebuild and restart frontend:"
echo "docker compose -f docker-compose.low-memory.yml up -d --build web"
echo ""
echo "# Check real-time logs:"
echo "docker compose -f docker-compose.low-memory.yml logs -f web"