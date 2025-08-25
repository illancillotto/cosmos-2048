#!/bin/bash

# 🔄 Quick restart script for timeout issues

echo "🔄 Quick Restart - Cosmos 2048"
echo "==============================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] WARNING:${NC} $1"
}

# Check current status
log "Checking current container status..."
docker compose -f docker-compose.low-memory.yml ps

# Check memory
MEMORY_USED=$(free -m | grep '^Mem:' | awk '{print $3}')
MEMORY_TOTAL=$(free -m | grep '^Mem:' | awk '{print $2}')
MEMORY_PERCENT=$((MEMORY_USED * 100 / MEMORY_TOTAL))

echo ""
log "Memory usage: ${MEMORY_USED}MB / ${MEMORY_TOTAL}MB (${MEMORY_PERCENT}%)"

if [ $MEMORY_PERCENT -gt 85 ]; then
    warn "High memory usage detected. Cleaning up..."
    docker system prune -f
    log "Docker cleanup completed"
fi

# Restart problematic services
log "Restarting frontend service..."
docker compose -f docker-compose.low-memory.yml restart web

log "Waiting for frontend to start..."
sleep 10

# Test connectivity
log "Testing connectivity..."
for i in {1..10}; do
    if curl -f -m 5 http://localhost/health &>/dev/null; then
        log "✅ API is responding"
        break
    fi
    if [ $i -eq 10 ]; then
        warn "❌ API still not responding"
    fi
    sleep 2
done

for i in {1..10}; do
    if curl -f -m 10 http://localhost/ &>/dev/null; then
        log "✅ Frontend is responding"
        break
    fi
    if [ $i -eq 10 ]; then
        warn "❌ Frontend still not responding"
        log "Trying more aggressive restart..."
        
        # More aggressive restart
        docker compose -f docker-compose.low-memory.yml stop web
        docker system prune -f
        sleep 5
        docker compose -f docker-compose.low-memory.yml up -d web
        sleep 15
        
        if curl -f -m 15 http://localhost/ &>/dev/null; then
            log "✅ Frontend is now responding after aggressive restart"
        else
            warn "❌ Frontend still not working. Check logs: docker compose -f docker-compose.low-memory.yml logs web"
        fi
    fi
    sleep 3
done

log "Quick restart completed"
echo ""
echo "🔍 To monitor:"
echo "docker compose -f docker-compose.low-memory.yml logs -f web"
echo ""
echo "🌐 Test URL:"
echo "http://localhost/"