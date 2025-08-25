#!/bin/bash

# 🔧 Cosmos 2048 - Quick Fix & Troubleshooting
# Script unificato per diagnosi e risoluzione rapida problemi

set -e

echo "🔧 Cosmos 2048 - Quick Fix & Troubleshooting"
echo "============================================="

# Colori per output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Funzioni per log
log() { echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"; }
warn() { echo -e "${YELLOW}[$(date +'%H:%M:%S')] WARNING:${NC} $1"; }
error() { echo -e "${RED}[$(date +'%H:%M:%S')] ERROR:${NC} $1"; }
info() { echo -e "${BLUE}[$(date +'%H:%M:%S')] INFO:${NC} $1"; }

# Auto-detect compose file
detect_compose_file() {
    if docker compose -f docker-compose.low-memory.yml ps --services &>/dev/null; then
        echo "docker-compose.low-memory.yml"
    elif docker compose -f docker-compose.prod.yml ps --services &>/dev/null; then
        echo "docker-compose.prod.yml"
    else
        echo "docker-compose.yml"
    fi
}

COMPOSE_FILE=$(detect_compose_file)
log "Rilevato file compose: $COMPOSE_FILE"

# Quick restart
quick_restart() {
    info "🔄 Riavvio rapido servizi..."
    
    # Stop servizi web
    docker compose -f $COMPOSE_FILE stop web nginx 2>/dev/null || true
    
    # Pulizia rapida
    docker system prune -f
    
    # Riavvio
    docker compose -f $COMPOSE_FILE up -d
    
    log "Riavvio completato"
}

# Diagnosi completa
diagnose() {
    info "🔍 Diagnosi sistema..."
    
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
    info "🔧 Riparazione Docker..."
    
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
        log "Docker riparato ✅"
    else
        error "Riparazione Docker fallita"
    fi
}

# Menu interattivo
show_menu() {
    echo ""
    echo "Seleziona azione:"
    echo "1) 🔄 Quick restart"
    echo "2) 🔍 Diagnosi completa"
    echo "3) 🔧 Fix Docker"
    echo "4) 📋 Mostra logs"
    echo "5) 🧹 Pulizia profonda"
    echo "6) ❌ Esci"
    echo ""
    read -p "Scelta [1-6]: " -n 1 -r
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
            log "Pulizia completata"
            ;;
        6) exit 0 ;;
        *) warn "Opzione non valida" ;;
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
        *) 
            echo "Uso: $0 [restart|diagnose|fix-docker|logs]"
            exit 1
            ;;
    esac
fi
