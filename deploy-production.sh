#!/bin/bash

# 🚀 Cosmos 2048 - Production Deployment
# Script unificato per il deployment in produzione
# Supporta sia sistemi con memoria normale che limitata

set -e

echo "🚀 Cosmos 2048 - Production Deployment"
echo "======================================"

# Colori per output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Funzioni per log colorati
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

# Configurazione globale
COMPOSE_FILE=""
DEPLOYMENT_TYPE=""
MEMORY_MB=0
LOW_MEMORY_THRESHOLD=2048

# Funzione per rilevare tipo di deployment
detect_deployment_type() {
    info "Rilevamento configurazione sistema..."
    
    # Rilevamento memoria
    MEMORY_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}' 2>/dev/null || echo "0")
    if [ "$MEMORY_KB" -gt 0 ]; then
        MEMORY_MB=$((MEMORY_KB / 1024))
    else
        MEMORY_MB=$(free -m | grep '^Mem:' | awk '{print $2}' 2>/dev/null || echo "2048")
    fi
    
    log "Memoria rilevata: ${MEMORY_MB}MB"
    
    # Scelta configurazione
    if [ $MEMORY_MB -lt $LOW_MEMORY_THRESHOLD ]; then
        warn "Sistema con memoria limitata rilevato (${MEMORY_MB}MB)"
        DEPLOYMENT_TYPE="low-memory"
        COMPOSE_FILE="docker-compose.low-memory.yml"
    else
        log "Sistema con memoria normale (${MEMORY_MB}MB)"
        DEPLOYMENT_TYPE="production"
        COMPOSE_FILE="docker-compose.prod.yml"
    fi
    
    # Possibilità di override manuale
    echo ""
    echo "Configurazione rilevata: $DEPLOYMENT_TYPE"
    echo "File compose: $COMPOSE_FILE"
    echo ""
    echo "Opzioni deployment:"
    echo "1) Auto-rilevato: $DEPLOYMENT_TYPE"
    echo "2) Produzione completa (raccomandato per >=2GB RAM)"
    echo "3) Memoria limitata (per sistemi <2GB RAM)"
    echo ""
    read -p "Scegli configurazione [1-3] (default: 1): " -n 1 -r
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
            # Mantiene auto-rilevato
            ;;
    esac
    
    log "Configurazione selezionata: $DEPLOYMENT_TYPE"
    log "File compose: $COMPOSE_FILE"
}

# Controllo prerequisiti
check_prerequisites() {
    step "Controllo prerequisiti..."
    
    # Docker
    if ! command -v docker &> /dev/null; then
        error "Docker non trovato. Esegui prima: ./setup-dependencies.sh"
    fi
    
    # Docker daemon
    if ! timeout 10 docker info &>/dev/null; then
        error "Docker daemon non in esecuzione. Avvia Docker o esegui: ./fix-docker.sh"
    fi
    
    log "Docker funzionante ✅"
    
    # Docker Compose
    if ! docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
        error "Docker Compose non trovato"
    fi
    
    log "Docker Compose disponibile ✅"
    
    # File di configurazione
    if [ ! -f "$COMPOSE_FILE" ]; then
        error "File di configurazione $COMPOSE_FILE non trovato"
    fi
    
    log "File di configurazione verificato ✅"
    
    # Controllo porte
    if ss -tulpn | grep -q ":80 " 2>/dev/null; then
        warn "Porta 80 già in uso. Potrebbe essere necessario fermare altri web server."
        echo "Per verificare: sudo ss -tulpn | grep :80"
        echo "Per fermare Apache: sudo systemctl stop apache2"
        echo "Per fermare Nginx: sudo systemctl stop nginx"
        echo ""
        read -p "Continuare comunque? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 0
        fi
    fi
}

# Setup ambiente
setup_environment() {
    step "Configurazione ambiente..."
    
    # Creazione file .env se mancanti
    if [ ! -f "apps/api/.env" ]; then
        if [ -f "apps/api/.env.example" ]; then
            cp apps/api/.env.example apps/api/.env
            log "File .env API creato da template"
        else
            warn "File .env.example API non trovato"
        fi
    fi
    
    if [ ! -f "apps/web/.env.local" ]; then
        if [ -f "apps/web/.env.example" ]; then
            cp apps/web/.env.example apps/web/.env.local
            log "File .env.local Frontend creato da template"
        else
            warn "File .env.example Frontend non trovato"
        fi
    fi
    
    # Generazione JWT_SECRET se necessario
    if ! grep -q "JWT_SECRET" apps/api/.env 2>/dev/null || grep -q "your-super-secure-jwt-secret" apps/api/.env 2>/dev/null; then
        JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64 | tr -d '\n')
        if [ -f "apps/api/.env" ]; then
            sed -i "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" apps/api/.env
        else
            echo "JWT_SECRET=${JWT_SECRET}" >> apps/api/.env
        fi
        log "JWT_SECRET generato e configurato ✅"
    fi
    
    log "File di ambiente configurati ✅"
}

# Setup swap per memoria limitata
setup_swap_if_needed() {
    if [ "$DEPLOYMENT_TYPE" = "low-memory" ] && ! swapon --show | grep -q swap; then
        step "Configurazione swap per memoria limitata..."
        
        DISK_AVAIL_GB=$(df . | tail -1 | awk '{print int($4/1024/1024)}')
        if [ $DISK_AVAIL_GB -lt 2 ]; then
            warn "Spazio disco insufficiente per swap (${DISK_AVAIL_GB}GB disponibili)"
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
        
        log "File swap da 1GB creato ✅"
    fi
}

# Pulizia container esistenti
cleanup_existing() {
    step "Pulizia container esistenti..."
    
    # Stop tutti i possibili compose file
    docker compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
    docker compose -f docker-compose.low-memory.yml down --remove-orphans 2>/dev/null || true
    docker compose down --remove-orphans 2>/dev/null || true
    
    # Pulizia container specifici se esistono
    docker rm -f cosmos2048-nginx-prod cosmos2048-frontend-prod cosmos2048-api-prod cosmos2048-mongodb-prod 2>/dev/null || true
    docker rm -f cosmos2048-nginx-low-mem cosmos2048-frontend-low-mem cosmos2048-api-low-mem cosmos2048-mongodb-low-mem 2>/dev/null || true
    
    # Pulizia risorse Docker per liberare spazio
    docker system prune -f
    docker volume prune -f 2>/dev/null || true
    
    log "Pulizia completata ✅"
}

# Build ottimizzato per memoria limitata
build_low_memory() {
    step "Build ottimizzato per memoria limitata..."
    
    # Build sequenziale per evitare problemi di memoria
    log "Build API service..."
    docker compose -f $COMPOSE_FILE build api
    docker builder prune -f
    
    log "Build Frontend service..."
    docker compose -f $COMPOSE_FILE build web
    docker builder prune -f
    
    log "Build completato ✅"
}

# Build normale per produzione
build_production() {
    step "Build produzione..."
    
    # Build parallelo con cache
    docker compose -f $COMPOSE_FILE build --parallel
    
    log "Build completato ✅"
}

# Avvio servizi
start_services() {
    step "Avvio servizi..."
    
    if [ "$DEPLOYMENT_TYPE" = "low-memory" ]; then
        # Avvio sequenziale per memoria limitata
        log "Avvio MongoDB..."
        docker compose -f $COMPOSE_FILE up -d mongodb
        
        # Attesa MongoDB
        log "Attesa avvio MongoDB..."
        for i in {1..30}; do
            if docker exec cosmos2048-mongodb-low-mem mongosh --eval "db.adminCommand('ping')" &>/dev/null || \
               docker exec cosmos2048-mongodb-low-mem mongo --eval "db.adminCommand('ping')" &>/dev/null; then
                log "MongoDB pronto ✅"
                break
            fi
            if [ $i -eq 30 ]; then
                error "MongoDB non si avvia"
            fi
            sleep 2
        done
        
        log "Avvio API..."
        docker compose -f $COMPOSE_FILE up -d api
        sleep 5
        
        log "Avvio Frontend..."
        docker compose -f $COMPOSE_FILE up -d web
        sleep 10
        
        log "Avvio Nginx..."
        docker compose -f $COMPOSE_FILE up -d nginx
        
    else
        # Avvio normale per produzione
        docker compose -f $COMPOSE_FILE up -d
    fi
    
    log "Servizi avviati ✅"
}

# Health check esteso
health_check() {
    step "Verifica stato servizi..."
    
    # Attesa stabilizzazione
    log "Attesa stabilizzazione servizi..."
    sleep 15
    
    # Controllo container
    echo ""
    info "Stato container:"
    docker compose -f $COMPOSE_FILE ps
    
    echo ""
    info "Uso risorse:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
    
    # Health check API
    echo ""
    log "Test connettività API..."
    for i in {1..30}; do
        if curl -f -m 10 http://localhost/health &>/dev/null; then
            log "✅ API Backend: FUNZIONANTE"
            break
        fi
        if [ $i -eq 30 ]; then
            warn "❌ API Backend: TIMEOUT (ma potrebbe ancora avviarsi)"
        fi
        sleep 3
    done
    
    # Health check Frontend
    log "Test connettività Frontend..."
    for i in {1..30}; do
        if curl -f -m 15 http://localhost/ &>/dev/null; then
            log "✅ Frontend: FUNZIONANTE"
            break
        fi
        if [ $i -eq 30 ]; then
            warn "❌ Frontend: TIMEOUT (ma potrebbe ancora avviarsi)"
            # Tentativo riavvio aggressivo per memoria limitata
            if [ "$DEPLOYMENT_TYPE" = "low-memory" ]; then
                log "Tentativo riavvio aggressivo frontend..."
                docker compose -f $COMPOSE_FILE stop web
                docker system prune -f
                sleep 5
                docker compose -f $COMPOSE_FILE up -d web
                sleep 20
                
                if curl -f -m 20 http://localhost/ &>/dev/null; then
                    log "✅ Frontend: FUNZIONANTE dopo riavvio"
                else
                    warn "❌ Frontend: ancora non risponde"
                fi
            fi
        fi
        sleep 3
    done
}

# Informazioni finali
show_final_info() {
    echo ""
    echo "🎉 ${GREEN}Cosmos 2048 Deployment Completato!${NC}"
    echo "=================================================="
    echo ""
    echo "📊 Configurazione:"
    echo "   Tipo: $DEPLOYMENT_TYPE"
    echo "   Memoria: ${MEMORY_MB}MB"
    echo "   File compose: $COMPOSE_FILE"
    echo ""
    echo "🌐 Accesso Applicazione:"
    echo "   🎮 Gioco: http://localhost"
    echo "   🔍 Health Check: http://localhost/health"
    echo "   📡 API: http://localhost/api/*"
    echo ""
    echo "🔧 Comandi Utili:"
    echo "   📋 Logs: docker compose -f $COMPOSE_FILE logs -f"
    echo "   📊 Status: docker compose -f $COMPOSE_FILE ps"
    echo "   ⏹️  Stop: docker compose -f $COMPOSE_FILE down"
    echo "   🔄 Restart: docker compose -f $COMPOSE_FILE restart"
    echo ""
    echo "🎯 Debugging:"
    echo "   🔍 Diagnosi: ./diagnose-issue.sh"
    echo "   🔄 Quick restart: ./quick-restart.sh"
    echo "   🔧 Fix Docker: ./fix-docker.sh"
    echo ""
    
    # Statistiche memoria per deployment low-memory
    if [ "$DEPLOYMENT_TYPE" = "low-memory" ]; then
        MEMORY_USED=$(free -m | grep '^Mem:' | awk '{print $3}')
        MEMORY_PERCENT=$((MEMORY_USED * 100 / MEMORY_MB))
        echo "💾 Uso Memoria: ${MEMORY_USED}MB / ${MEMORY_MB}MB (${MEMORY_PERCENT}%)"
        if [ $MEMORY_PERCENT -gt 85 ]; then
            warn "Uso memoria alto. Monitora prestazioni sistema."
        fi
        echo ""
        echo "⚡ Ottimizzazioni Applicate:"
        echo "   - Build sequenziali container"
        echo "   - Limiti memoria per tutti i servizi"
        echo "   - Cache MongoDB limitata a 256MB"
        echo "   - Node.js heap limitato a 256MB"
        echo "   - Swap attivato"
    fi
}

# Gestione errori
handle_error() {
    error "Deployment fallito durante: $1"
    echo ""
    echo "🔍 Suggerimenti per debugging:"
    echo "1. Controlla log: docker compose -f $COMPOSE_FILE logs"
    echo "2. Verifica spazio disco: df -h"
    echo "3. Verifica memoria: free -h"
    echo "4. Esegui diagnosi: ./diagnose-issue.sh"
    echo "5. Prova riparazione Docker: ./fix-docker.sh"
}

# Trap per gestire errori
trap 'handle_error "step corrente"' ERR

# Funzione principale
main() {
    log "Inizio deployment Cosmos 2048..."
    
    # Controllo se siamo nella directory corretta
    if [ ! -f "package.json" ] && [ ! -d "apps" ]; then
        error "Esegui questo script dalla directory root del progetto"
    fi
    
    # Steps principali
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
    
    log "Deployment completato con successo! 🎉"
}

# Controllo parametri da linea di comando
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
        echo "Uso: $0 [opzioni]"
        echo ""
        echo "Opzioni:"
        echo "  --force-production   Forza deployment produzione completa"
        echo "  --force-low-memory   Forza deployment memoria limitata"
        echo "  --help, -h          Mostra questo aiuto"
        echo ""
        exit 0
        ;;
esac

# Esecuzione funzione principale
main "$@"
