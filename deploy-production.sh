#!/bin/bash

# 🚀 Cosmos 2048 - Production Deployment
# Unified script for production deployment

set -e

echo "🚀 Cosmos 2048 - Production Deployment"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Colored logging functions
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

step() {
    echo -e "${PURPLE}[$(date +'%H:%M:%S')] STEP:${NC} $1"
}

# Global configuration
COMPOSE_FILE="docker-compose.prod.yml"
DEPLOYMENT_TYPE="production"

# Check prerequisites
check_prerequisites() {
    step "Checking prerequisites..."
    
    # Docker
    if ! command -v docker &> /dev/null; then
        error "Docker not found. Run first: ./setup-dependencies.sh"
    fi
    
    # Docker daemon
    if ! timeout 10 docker info &>/dev/null; then
        error "Docker daemon not running. Start Docker or run: ./quick-fix.sh fix-docker"
    fi
    
    log "Docker working ✅"
    
    # Docker Compose
    if ! docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
        error "Docker Compose not found"
    fi
    
    log "Docker Compose available ✅"
    
    # Configuration file
    if [ ! -f "$COMPOSE_FILE" ]; then
        error "Configuration file $COMPOSE_FILE not found"
    fi
    
    log "Configuration file verified ✅"
    
    # Port check
    if ss -tulpn | grep -q ":80 " 2>/dev/null; then
        warn "Port 80 already in use. You may need to stop other web servers."
        echo "To check: sudo ss -tulpn | grep :80"
        echo "To stop Apache: sudo systemctl stop apache2"
        echo "To stop Nginx: sudo systemctl stop nginx"
        echo ""
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 0
        fi
    fi
}

# Setup environment
setup_environment() {
    step "Setting up environment..."
    
    # Create .env files if missing
    if [ ! -f "apps/api/.env" ]; then
        if [ -f "apps/api/.env.example" ]; then
            cp apps/api/.env.example apps/api/.env
            log "API .env file created from template"
        else
            warn "API .env.example file not found"
        fi
    fi
    
    if [ ! -f "apps/web/.env.local" ]; then
        if [ -f "apps/web/.env.example" ]; then
            cp apps/web/.env.example apps/web/.env.local
            log "Frontend .env.local file created from template"
        else
            warn "Frontend .env.example file not found"
        fi
    fi
    
    # Generate JWT_SECRET if needed
    if ! grep -q "JWT_SECRET" apps/api/.env 2>/dev/null || grep -q "your-super-secure-jwt-secret" apps/api/.env 2>/dev/null; then
        JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64 | tr -d '\n')
        if [ -f "apps/api/.env" ]; then
            sed -i "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" apps/api/.env
        else
            echo "JWT_SECRET=${JWT_SECRET}" >> apps/api/.env
        fi
        log "JWT_SECRET generated and configured ✅"
    fi
    
    log "Environment files configured ✅"
}

# Cleanup existing containers
cleanup_existing() {
    step "Cleaning up existing containers..."
    
    # Stop all possible compose files
    docker compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
    docker compose -f docker-compose.dev.yml down --remove-orphans 2>/dev/null || true
    docker compose down --remove-orphans 2>/dev/null || true
    
    # Cleanup specific containers if they exist
    docker rm -f cosmos2048-nginx-prod cosmos2048-web-prod cosmos2048-api-prod cosmos2048-mongodb-prod 2>/dev/null || true
    docker rm -f cosmos2048-web-dev cosmos2048-api-dev cosmos2048-mongodb-dev 2>/dev/null || true
    
    # Cleanup Docker resources to free space
    docker system prune -f
    docker volume prune -f 2>/dev/null || true
    
    log "Cleanup completed ✅"
}

# Build production
build_production() {
    step "Production build..."
    
    # Parallel build with cache
    docker compose -f $COMPOSE_FILE build --parallel
    
    log "Build completed ✅"
}

# Start services
start_services() {
    step "Starting services..."
    
    # Start all services
    docker compose -f $COMPOSE_FILE up -d
    
    log "Services started ✅"
}

# Extended health check
health_check() {
    step "Verifying service status..."
    
    # Wait for stabilization
    log "Waiting for services to stabilize..."
    sleep 15
    
    # Container status
    echo ""
    info "Container status:"
    docker compose -f $COMPOSE_FILE ps
    
    echo ""
    info "Resource usage:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
    
    # API health check
    echo ""
    log "Testing API connectivity..."
    for i in {1..30}; do
        if curl -f -m 10 http://localhost/health &>/dev/null; then
            log "✅ API Backend: WORKING"
            break
        fi
        if [ $i -eq 30 ]; then
            warn "❌ API Backend: TIMEOUT (but may still be starting)"
        fi
        sleep 3
    done
    
    # Frontend health check
    log "Testing Frontend connectivity..."
    for i in {1..30}; do
        if curl -f -m 15 http://localhost/ &>/dev/null; then
            log "✅ Frontend: WORKING"
            break
        fi
        if [ $i -eq 30 ]; then
            warn "❌ Frontend: TIMEOUT (but may still be starting)"
        fi
        sleep 3
    done
}

# Final information
show_final_info() {
    echo ""
    echo "🎉 ${GREEN}Cosmos 2048 Production Deployment Completed!${NC}"
    echo "=================================================="
    echo ""
    echo "📊 Configuration:"
    echo "   Type: $DEPLOYMENT_TYPE"
    echo "   Compose file: $COMPOSE_FILE"
    echo ""
    echo "🌐 Application Access:"
    echo "   🎮 Game: http://localhost"
    echo "   🔍 Health Check: http://localhost/health"
    echo "   📡 API: http://localhost/api/*"
    echo ""
    echo "🔧 Useful Commands:"
    echo "   📋 Logs: docker compose -f $COMPOSE_FILE logs -f"
    echo "   📊 Status: docker compose -f $COMPOSE_FILE ps"
    echo "   ⏹️  Stop: docker compose -f $COMPOSE_FILE down"
    echo "   🔄 Restart: docker compose -f $COMPOSE_FILE restart"
    echo ""
    echo "🎯 Debugging:"
    echo "   🔍 Diagnosis: ./quick-fix.sh diagnose"
    echo "   🔄 Quick restart: ./quick-fix.sh restart"
    echo "   🔧 Fix Docker: ./quick-fix.sh fix-docker"
    echo ""
    echo "🚀 Development:"
    echo "   💻 Start dev: docker compose -f docker-compose.dev.yml up -d"
    echo "   🛑 Stop dev: docker compose -f docker-compose.dev.yml down"
}

# Error handling
handle_error() {
    error "Deployment failed during: $1"
    echo ""
    echo "🔍 Debugging suggestions:"
    echo "1. Check logs: docker compose -f $COMPOSE_FILE logs"
    echo "2. Verify disk space: df -h"
    echo "3. Verify memory: free -h"
    echo "4. Run diagnosis: ./quick-fix.sh diagnose"
    echo "5. Try Docker repair: ./quick-fix.sh fix-docker"
}

# Trap to handle errors
trap 'handle_error "current step"' ERR

# Main function
main() {
    log "Starting Cosmos 2048 production deployment..."
    
    # Check if we're in the correct directory
    if [ ! -f "package.json" ] && [ ! -d "apps" ]; then
        error "Run this script from the project root directory"
    fi
    
    # Main steps
    check_prerequisites
    setup_environment
    cleanup_existing
    build_production
    start_services
    health_check
    show_final_info
    
    log "Production deployment completed successfully! 🎉"
}

# Command line parameter check
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h          Show this help"
        echo ""
        echo "This script deploys Cosmos 2048 in production mode."
        echo "For development, use: docker compose -f docker-compose.dev.yml up -d"
        echo ""
        exit 0
        ;;
esac

# Run main function
main "$@"
