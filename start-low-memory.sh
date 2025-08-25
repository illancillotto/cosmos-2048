#!/bin/bash

# 🚀 Cosmos 2048 Low Memory Deployment Script
# Optimized for VPS with 1GB RAM - builds services sequentially

set -e

echo "🌌 Starting Cosmos 2048 - Low Memory Mode"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions for colored logs
log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] WARNING:${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ERROR:${NC} $1"
    exit 1
}

info() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] INFO:${NC} $1"
}

# Check Docker
if ! command -v docker &> /dev/null; then
    error "Docker is not installed. Please run ./install-dependencies.sh first"
fi

if ! docker info &> /dev/null; then
    error "Docker daemon is not running. Please start Docker: sudo systemctl start docker"
fi

# Memory optimization settings
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# System memory check
MEMORY_MB=$(free -m | grep '^Mem:' | awk '{print $2}')
log "Detected ${MEMORY_MB}MB RAM - Using low memory optimizations"

if [ $MEMORY_MB -lt 800 ]; then
    error "System has less than 800MB RAM. Minimum 1GB required."
fi

# Setup swap if not present (helps with memory pressure)
setup_swap() {
    if ! swapon --show | grep -q swap; then
        warn "No swap detected. Creating 1GB swap file to help with memory..."
        
        # Check available disk space
        DISK_AVAIL_GB=$(df . | tail -1 | awk '{print int($4/1024/1024)}')
        if [ $DISK_AVAIL_GB -lt 2 ]; then
            warn "Low disk space. Skipping swap creation."
            return
        fi
        
        # Create swap file
        sudo fallocate -l 1G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1024 count=1048576
        sudo chmod 600 /swapfile
        sudo mkswap /swapfile
        sudo swapon /swapfile
        
        # Make it permanent
        echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
        
        log "1GB swap file created and activated ✅"
    else
        log "Swap already available ✅"
    fi
}

# Setup swap
setup_swap

# Check required files
if [ ! -f "docker-compose.low-memory.yml" ]; then
    error "docker-compose.low-memory.yml file not found"
fi

if [ ! -f "nginx/nginx.conf" ]; then
    error "nginx/nginx.conf file not found"
fi

log "Configuration files verified ✅"

# Setup environment files
if [ ! -f "apps/api/.env" ]; then
    warn "API .env file not found, copying from example"
    if [ -f "apps/api/.env.example" ]; then
        cp apps/api/.env.example apps/api/.env
        log "API .env file created ✅"
    fi
fi

if [ ! -f "apps/web/.env.local" ]; then
    warn "Frontend .env.local file not found"
    if [ -f "apps/web/.env.example" ]; then
        cp apps/web/.env.example apps/web/.env.local
        log "Frontend .env.local file created ✅"
    fi
fi

# Stop any existing containers
log "Stopping existing containers..."
docker compose -f docker-compose.low-memory.yml down --remove-orphans 2>/dev/null || true
docker compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
docker compose down --remove-orphans 2>/dev/null || true

# Clean up unused Docker resources to free memory
log "Cleaning up Docker resources..."
docker system prune -f
docker volume prune -f

# Sequential build to avoid memory issues
log "Building services sequentially to avoid memory issues..."

# Build API first (smaller)
log "Building API service..."
docker compose -f docker-compose.low-memory.yml build api

# Clean build cache to free memory
docker builder prune -f

# Build Frontend (larger, but now we have more memory)
log "Building Frontend service..."
docker compose -f docker-compose.low-memory.yml build web

# Clean again
docker builder prune -f

# Start services one by one
log "Starting MongoDB..."
docker compose -f docker-compose.low-memory.yml up -d mongodb

# Wait for MongoDB to be ready
log "Waiting for MongoDB to start..."
for i in {1..30}; do
    # Try both mongosh (newer) and mongo (older) commands
    if docker exec cosmos2048-mongodb-low-mem mongosh --eval "db.adminCommand('ping')" &>/dev/null || \
       docker exec cosmos2048-mongodb-low-mem mongo --eval "db.adminCommand('ping')" &>/dev/null; then
        log "MongoDB is ready ✅"
        break
    fi
    if [ $i -eq 30 ]; then
        error "MongoDB failed to start"
    fi
    sleep 2
done

# Start API
log "Starting API service..."
docker compose -f docker-compose.low-memory.yml up -d api

# Wait for API
log "Waiting for API to start..."
sleep 5

# Start Frontend
log "Starting Frontend service..."
docker compose -f docker-compose.low-memory.yml up -d web

# Wait for Frontend
log "Waiting for Frontend to start..."
sleep 10

# Start Nginx last
log "Starting Nginx proxy..."
docker compose -f docker-compose.low-memory.yml up -d nginx

# Health checks with extended timeout for slow systems
log "Performing health checks..."

# Check API
for i in {1..60}; do
    if curl -f http://localhost/health &>/dev/null; then
        log "✅ API Backend: UP"
        break
    fi
    if [ $i -eq 60 ]; then
        warn "❌ API Backend: Timeout (but may still be starting)"
    fi
    sleep 3
done

# Check Frontend
for i in {1..60}; do
    if curl -f http://localhost/ &>/dev/null; then
        log "✅ Frontend: UP"
        break
    fi
    if [ $i -eq 60 ]; then
        warn "❌ Frontend: Timeout (but may still be starting)"
    fi
    sleep 3
done

# Show container status
echo ""
log "Container Status:"
docker compose -f docker-compose.low-memory.yml ps

# Show memory usage
echo ""
log "Memory Usage:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Show final information
echo ""
echo "🎉 ${GREEN}Cosmos 2048 Low Memory deployment completed!${NC}"
echo "================================================"
echo "🌐 Application: http://localhost"
echo "🔍 Health Check: http://localhost/health"
echo "📊 Container Status: docker compose -f docker-compose.low-memory.yml ps"
echo "📋 Logs: docker compose -f docker-compose.low-memory.yml logs -f"
echo "⏹️  Stop: docker compose -f docker-compose.low-memory.yml down"
echo ""

# Memory usage info
MEMORY_USED=$(free -m | grep '^Mem:' | awk '{print $3}')
echo "💾 Memory Usage: ${MEMORY_USED}MB / ${MEMORY_MB}MB"
if [ $MEMORY_USED -gt 800 ]; then
    warn "High memory usage detected. Monitor system performance."
fi

echo ""
info "Low memory optimizations applied:"
echo "- Sequential container builds"
echo "- Memory limits on all services" 
echo "- Swap file activated"
echo "- MongoDB cache limited to 256MB"
echo "- Node.js heap limited to 256MB"
echo "- Development mode for faster startup"