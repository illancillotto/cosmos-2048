#!/bin/bash

# 🔧 Cosmos 2048 - Quick Fix & Troubleshooting
# Unified script for diagnosis and quick problem resolution

set -e

echo "🔧 Cosmos 2048 - Quick Fix & Troubleshooting"
echo "============================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log() { echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"; }
warn() { echo -e "${YELLOW}[$(date +'%H:%M:%S')] WARNING:${NC} $1"; }
error() { echo -e "${RED}[$(date +'%H:%M:%S')] ERROR:${NC} $1"; }
info() { echo -e "${BLUE}[$(date +'%H:%M:%S')] INFO:${NC} $1"; }

# Auto-detect compose file
detect_compose_file() {
    if docker compose -f docker-compose.prod.yml ps --services &>/dev/null; then
        echo "docker-compose.prod.yml"
    elif docker compose -f docker-compose.dev.yml ps --services &>/dev/null; then
        echo "docker-compose.dev.yml"
    else
        echo "docker-compose.yml"
    fi
}

COMPOSE_FILE=$(detect_compose_file)
log "Detected compose file: $COMPOSE_FILE"

# Quick restart
quick_restart() {
    info "🔄 Quick restart of services..."
    
    # Stop services
    docker compose -f $COMPOSE_FILE stop web nginx 2>/dev/null || true
    
    # Quick cleanup
    docker system prune -f
    
    # Restart
    docker compose -f $COMPOSE_FILE up -d
    
    log "Restart completed"
}

# Complete diagnosis
diagnose() {
    info "🔍 System diagnosis..."
    
    echo ""
    echo "📊 Container Status:"
    docker compose -f $COMPOSE_FILE ps
    
    echo ""
    echo "💾 Memory Usage:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
    
    echo ""
    echo "🌐 Network Test:"
    if curl -f -m 5 http://localhost/health &>/dev/null; then
        echo "✅ API: OK"
    else
        echo "❌ API: FAIL"
    fi
    
    if curl -f -m 10 http://localhost/ &>/dev/null; then
        echo "✅ Frontend: OK"
    else
        echo "❌ Frontend: FAIL"
    fi
    
    echo ""
    echo "🔧 System Resources:"
    free -h
    echo ""
    df -h /
}

# Fix Docker
fix_docker() {
    info "🔧 Docker repair..."
    
    # Stop Docker
    sudo systemctl stop docker 2>/dev/null || true
    sudo systemctl stop containerd 2>/dev/null || true
    
    # Cleanup
    sudo rm -f /var/run/docker.sock /var/run/docker.pid
    
    # Restart services
    sudo systemctl start containerd
    sleep 3
    sudo systemctl start docker
    sleep 5
    
    # Test
    if docker info &>/dev/null; then
        log "Docker repaired ✅"
    else
        error "Docker repair failed"
    fi
}

# Switch environment
switch_environment() {
    info "🔄 Switching environment..."
    
    echo ""
    echo "Current environment: $COMPOSE_FILE"
    echo ""
    echo "Available environments:"
    echo "1) Development (docker-compose.dev.yml)"
    echo "2) Production (docker-compose.prod.yml)"
    echo ""
    read -p "Choose environment [1-2]: " -n 1 -r
    echo
    
    case $REPLY in
        1)
            NEW_COMPOSE="docker-compose.dev.yml"
            ;;
        2)
            NEW_COMPOSE="docker-compose.prod.yml"
            ;;
        *)
            warn "Invalid option, keeping current environment"
            return
            ;;
    esac
    
    if [ "$COMPOSE_FILE" != "$NEW_COMPOSE" ]; then
        log "Switching to $NEW_COMPOSE..."
        docker compose -f $COMPOSE_FILE down 2>/dev/null || true
        COMPOSE_FILE=$NEW_COMPOSE
        log "Environment switched to $COMPOSE_FILE"
    else
        log "Already using $NEW_COMPOSE"
    fi
}

# Interactive menu
show_menu() {
    echo ""
    echo "Select action:"
    echo "1) 🔄 Quick restart"
    echo "2) 🔍 Complete diagnosis"
    echo "3) 🔧 Fix Docker"
    echo "4) 📋 Show logs"
    echo "5) 🧹 Deep cleanup"
    echo "6) 🔄 Switch environment"
    echo "7) ❌ Exit"
    echo ""
    read -p "Choice [1-7]: " -n 1 -r
    echo
    
    case $REPLY in
        1) quick_restart ;;
        2) diagnose ;;
        3) fix_docker ;;
        4) docker compose -f $COMPOSE_FILE logs --tail=50 ;;
        5) 
            docker compose -f $COMPOSE_FILE down
            docker system prune -af
            docker volume prune -f
            log "Cleanup completed"
            ;;
        6) switch_environment ;;
        7) exit 0 ;;
        *) warn "Invalid option" ;;
    esac
}

# Main
if [ $# -eq 0 ]; then
    show_menu
else
    case "$1" in
        restart) quick_restart ;;
        diagnose) diagnose ;;
        fix-docker) fix_docker ;;
        logs) docker compose -f $COMPOSE_FILE logs -f ;;
        switch) switch_environment ;;
        *) 
            echo "Usage: $0 [restart|diagnose|fix-docker|logs|switch]"
            exit 1
            ;;
    esac
fi
