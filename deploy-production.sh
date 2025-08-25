#!/bin/bash

# 🚀 Cosmos 2048 - Production Deployment
# Unified script for production deployment
# Supports both normal and low-memory systems

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
COMPOSE_FILE=""
DEPLOYMENT_TYPE=""
MEMORY_MB=0
LOW_MEMORY_THRESHOLD=2048

# Function to detect deployment type
detect_deployment_type() {
    info "Detecting system configuration..."
    
    # Memory detection
    MEMORY_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}' 2>/dev/null || echo "0")
    if [ "$MEMORY_KB" -gt 0 ]; then
        MEMORY_MB=$((MEMORY_KB / 1024))
    else
        MEMORY_MB=$(free -m | grep '^Mem:' | awk '{print $2}' 2>/dev/null || echo "2048")
    fi
    
    log "Detected memory: ${MEMORY_MB}MB"
    
    # Configuration choice
    if [ $MEMORY_MB -lt $LOW_MEMORY_THRESHOLD ]; then
        warn "Low-memory system detected (${MEMORY_MB}MB)"
        DEPLOYMENT_TYPE="low-memory"
        COMPOSE_FILE="docker-compose.low-memory.yml"
    else
        log "Normal memory system detected (${MEMORY_MB}MB)"
        DEPLOYMENT_TYPE="production"
        COMPOSE_FILE="docker-compose.prod.yml"
    fi
    
    # Manual override possibility
    echo ""
    echo "Detected configuration: $DEPLOYMENT_TYPE"
    echo "Compose file: $COMPOSE_FILE"
    echo ""
    echo "Deployment options:"
    echo "1) Auto-detected: $DEPLOYMENT_TYPE"
    echo "2) Full production (recommended for >=2GB RAM)"
    echo "3) Low memory (for systems <2GB RAM)"
    echo ""
    read -p "Choose configuration [1-3] (default: 1): " -n 1 -r
    echo
    
    case $REPLY in
        2)
            DEPLOYMENT_TYPE="production"
            COMPOSE_FILE="docker-compose.prod.yml"
            ;;
        3)
            DEPLOYMENT_TYPE="low-memory"
            COMPOSE_FILE="docker-compose.low-memory.yml"
            ;;
        *)
            # Keep auto-detected
            ;;
    esac
    
    log "Selected configuration: $DEPLOYMENT_TYPE"
    log "Compose file: $COMPOSE_FILE"
}

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

# Setup swap per memoria limitata
setup_swap_if_needed() {
    if [ "$DEPLOYMENT_TYPE" = "low-memory" ] && ! swapon --show | grep -q swap; then
        step "Setting up swap for low memory..."
        
        DISK_AVAIL_GB=$(df . | tail -1 | awk '{print int($4/1024/1024)}')
        if [ $DISK_AVAIL_GB -lt 2 ]; then
            warn "Insufficient disk space for swap (${DISK_AVAIL_GB}GB available)"
            return
        fi
        
        if [[ "$EUID" -eq 0 ]]; then
            fallocate -l 1G /swapfile || dd if=/dev/zero of=/swapfile bs=1024 count=1048576
            chmod 600 /swapfile
            mkswap /swapfile
            swapon /swapfile
            echo '/swapfile none swap sw 0 0' >> /etc/fstab
        else
            sudo fallocate -l 1G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1024 count=1048576
            sudo chmod 600 /swapfile
            sudo mkswap /swapfile
            sudo swapon /swapfile
            echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
        fi
        
        log "1GB swap file created ✅"
    fi
}

# Cleanup existing containers
cleanup_existing() {
    step "Cleaning up existing containers..."
    
    # Stop all possible compose files
    docker compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
    docker compose -f docker-compose.low-memory.yml down --remove-orphans 2>/dev/null || true
    docker compose down --remove-orphans 2>/dev/null || true
    
    # Cleanup specific containers if they exist
    docker rm -f cosmos2048-nginx-prod cosmos2048-frontend-prod cosmos2048-api-prod cosmos2048-mongodb-prod 2>/dev/null || true
    docker rm -f cosmos2048-nginx-low-mem cosmos2048-frontend-low-mem cosmos2048-api-low-mem cosmos2048-mongodb-low-mem 2>/dev/null || true
    
    # Cleanup Docker resources to free space
    docker system prune -f
    docker volume prune -f 2>/dev/null || true
    
    log "Cleanup completed ✅"
}

# Build optimized for low memory
build_low_memory() {
    step "Build optimized for low memory..."
    
    # Sequential build to avoid memory issues
    log "Building API service..."
    docker compose -f $COMPOSE_FILE build api
    docker builder prune -f
    
    log "Building Frontend service..."
    docker compose -f $COMPOSE_FILE build web
    docker builder prune -f
    
    log "Build completed ✅"
}

# Normal build for production
build_production() {
    step "Production build..."
    
    # Parallel build with cache
    docker compose -f $COMPOSE_FILE build --parallel
    
    log "Build completed ✅"
}

# Start services
start_services() {
    step "Starting services..."
    
    if [ "$DEPLOYMENT_TYPE" = "low-memory" ]; then
        # Sequential startup for low memory
        log "Starting MongoDB..."
        docker compose -f $COMPOSE_FILE up -d mongodb
        
        # Wait for MongoDB
        log "Waiting for MongoDB to start..."
        for i in {1..30}; do
            if docker exec cosmos2048-mongodb-low-mem mongosh --eval "db.adminCommand('ping')" &>/dev/null || \
               docker exec cosmos2048-mongodb-low-mem mongo --eval "db.adminCommand('ping')" &>/dev/null; then
                log "MongoDB ready ✅"
                break
            fi
            if [ $i -eq 30 ]; then
                error "MongoDB failed to start"
            fi
            sleep 2
        done
        
        log "Starting API..."
        docker compose -f $COMPOSE_FILE up -d api
        sleep 5
        
        log "Starting Frontend..."
        docker compose -f $COMPOSE_FILE up -d web
        sleep 10
        
        log "Starting Nginx..."
        docker compose -f $COMPOSE_FILE up -d nginx
        
    else
        # Normal startup for production
        docker compose -f $COMPOSE_FILE up -d
    fi
    
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
            # Aggressive restart attempt for low memory
            if [ "$DEPLOYMENT_TYPE" = "low-memory" ]; then
                log "Attempting aggressive frontend restart..."
                docker compose -f $COMPOSE_FILE stop web
                docker system prune -f
                sleep 5
                docker compose -f $COMPOSE_FILE up -d web
                sleep 20
                
                if curl -f -m 20 http://localhost/ &>/dev/null; then
                    log "✅ Frontend: WORKING after restart"
                else
                    warn "❌ Frontend: still not responding"
                fi
            fi
        fi
        sleep 3
    done
}

# Final information
show_final_info() {
    echo ""
    echo "🎉 ${GREEN}Cosmos 2048 Deployment Completed!${NC}"
    echo "=================================================="
    echo ""
    echo "📊 Configuration:"
    echo "   Type: $DEPLOYMENT_TYPE"
    echo "   Memory: ${MEMORY_MB}MB"
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
    
    # Memory statistics for low-memory deployment
    if [ "$DEPLOYMENT_TYPE" = "low-memory" ]; then
        MEMORY_USED=$(free -m | grep '^Mem:' | awk '{print $3}')
        MEMORY_PERCENT=$((MEMORY_USED * 100 / MEMORY_MB))
        echo "💾 Memory Usage: ${MEMORY_USED}MB / ${MEMORY_MB}MB (${MEMORY_PERCENT}%)"
        if [ $MEMORY_PERCENT -gt 85 ]; then
            warn "High memory usage. Monitor system performance."
        fi
        echo ""
        echo "⚡ Optimizations Applied:"
        echo "   - Sequential container builds"
        echo "   - Memory limits for all services"
        echo "   - MongoDB cache limited to 256MB"
        echo "   - Node.js heap limited to 256MB"
        echo "   - Swap activated"
    fi
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
    log "Starting Cosmos 2048 deployment..."
    
    # Check if we're in the correct directory
    if [ ! -f "package.json" ] && [ ! -d "apps" ]; then
        error "Run this script from the project root directory"
    fi
    
    # Main steps
    detect_deployment_type
    check_prerequisites
    setup_environment
    setup_swap_if_needed
    cleanup_existing
    
    if [ "$DEPLOYMENT_TYPE" = "low-memory" ]; then
        build_low_memory
    else
        build_production
    fi
    
    start_services
    health_check
    show_final_info
    
    log "Deployment completed successfully! 🎉"
}

# Command line parameter check
case "${1:-}" in
    --force-production)
        DEPLOYMENT_TYPE="production"
        COMPOSE_FILE="docker-compose.prod.yml"
        ;;
    --force-low-memory)
        DEPLOYMENT_TYPE="low-memory"
        COMPOSE_FILE="docker-compose.low-memory.yml"
        ;;
    --help|-h)
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --force-production   Force full production deployment"
        echo "  --force-low-memory   Force low-memory deployment"
        echo "  --help, -h          Show this help"
        echo ""
        exit 0
        ;;
esac

# Run main function
main "$@"
