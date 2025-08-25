#!/bin/bash

# 🚀 Cosmos 2048 Production Startup Script
# Handles complete Docker production environment startup

set -e

echo "🌌 Starting Cosmos 2048 - Production"
echo "===================================="

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

# Verify Docker
if ! command -v docker &> /dev/null; then
    error "Docker is not installed or not accessible"
fi

if ! command -v docker compose &> /dev/null; then
    error "Docker Compose is not installed or not accessible"
fi

log "Docker and Docker Compose verified ✅"

# Verify required files
if [ ! -f "docker-compose.prod.yml" ]; then
    error "docker-compose.prod.yml file not found"
fi

if [ ! -f "nginx/nginx.conf" ]; then
    error "nginx/nginx.conf file not found"
fi

log "Configuration files verified ✅"

# Check if .env files exist
if [ ! -f "apps/api/.env" ]; then
    warn "API .env file not found, copying from .env.example"
    if [ -f "apps/api/.env.example" ]; then
        cp apps/api/.env.example apps/api/.env
        info "API .env file created from template"
    else
        error "API .env.example file not found"
    fi
fi

if [ ! -f "apps/web/.env.local" ]; then
    warn "Frontend .env.local file not found"
    if [ -f "apps/web/.env.example" ]; then
        cp apps/web/.env.example apps/web/.env.local
        info "Frontend .env.local file created from template"
    fi
fi

# Stop any running containers
log "Stopping existing containers..."
docker compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true

# Clean up development containers if present
if docker compose ps -q &> /dev/null; then
    warn "Stopping development environment..."
    docker compose down --remove-orphans
fi

# Build images
log "Building Docker images..."
docker compose -f docker-compose.prod.yml build --no-cache

# Start services
log "Starting production services..."
docker compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
log "Waiting for services to start..."
sleep 10

# Verify health checks
log "Verifying service status..."

# Health check API
for i in {1..30}; do
    if curl -f http://localhost/health &>/dev/null; then
        log "✅ API Backend: UP"
        break
    fi
    if [ $i -eq 30 ]; then
        error "❌ API Backend: DOWN (timeout)"
    fi
    sleep 2
done

# Health check Frontend
for i in {1..30}; do
    if curl -f http://localhost/ &>/dev/null; then
        log "✅ Frontend: UP"
        break
    fi
    if [ $i -eq 30 ]; then
        error "❌ Frontend: DOWN (timeout)"
    fi
    sleep 2
done

# Show final information
echo ""
echo "🎉 ${GREEN}Cosmos 2048 started successfully!${NC}"
echo "=================================="
echo "🌐 Application: http://localhost"
echo "🔍 Health Check: http://localhost/health"
echo "📊 Logs: docker compose -f docker-compose.prod.yml logs -f"
echo "⏹️  Stop: docker compose -f docker-compose.prod.yml down"
echo ""

# Show initial logs
info "Initial logs (Ctrl+C to exit):"
docker compose -f docker-compose.prod.yml logs --tail=50 -f