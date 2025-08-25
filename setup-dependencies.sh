#!/bin/bash

# 🛠️ Cosmos 2048 - Setup Dependencies
# Installa tutte le dipendenze necessarie per il deployment
# Supporta Ubuntu/Debian e configurazioni con memoria limitata

set -e

echo "🛠️ Cosmos 2048 - Setup Dependencies"
echo "====================================="

# Colori per output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

# Funzione per eseguire comandi con o senza sudo
run_cmd() {
    if [[ "$EUID" -eq 0 ]]; then
        "$@"
    else
        sudo "$@"
    fi
}

# Controllo utente root
if [[ "$EUID" -eq 0 ]]; then
    warn "⚠️  Esecuzione come ROOT rilevata!"
    warn "   Questo non è raccomandato per sicurezza."
    warn "   Le modifiche al sistema saranno applicate direttamente."
    echo ""
    read -p "Vuoi continuare come root? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        info "Installazione annullata. Esegui come utente normale per maggiore sicurezza."
        exit 0
    fi
    warn "Continuando come utente root..."
    echo ""
fi

# Rilevamento OS
if [[ -f /etc/os-release ]]; then
    . /etc/os-release
    OS=$NAME
    VERSION=$VERSION_ID
else
    error "Impossibile rilevare il sistema operativo"
fi

log "Sistema rilevato: $OS $VERSION"

# Controllo compatibilità
if [[ ! "$OS" =~ Ubuntu|Debian ]]; then
    warn "Questo installer è progettato per Ubuntu/Debian. Continuando comunque..."
fi

# Controllo requisiti di sistema
check_system_requirements() {
    info "Controllo requisiti di sistema..."
    
    # Controllo memoria (minimo 1GB)
    MEMORY_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}' 2>/dev/null || echo "0")
    if [ "$MEMORY_KB" -gt 0 ]; then
        MEMORY_MB=$((MEMORY_KB / 1024))
    else
        MEMORY_MB=$(free -m | grep '^Mem:' | awk '{print $2}' 2>/dev/null || echo "0")
    fi
    
    if [ $MEMORY_MB -lt 1000 ]; then
        error "Sistema ha ${MEMORY_MB}MB RAM. Minimo 1GB richiesto."
    else
        log "Memoria: ${MEMORY_MB}MB ✅"
    fi
    
    # Controllo spazio disco (minimo 10GB)
    DISK_AVAIL=$(df . | tail -1 | awk '{print $4}')
    DISK_AVAIL_GB=$((DISK_AVAIL / 1024 / 1024))
    
    if [ $DISK_AVAIL_GB -lt 10 ]; then
        error "Spazio disco disponibile: ${DISK_AVAIL_GB}GB. Minimo 10GB richiesto."
    else
        log "Spazio disco: ${DISK_AVAIL_GB}GB disponibili ✅"
    fi
}

# Aggiornamento sistema
update_system() {
    log "Aggiornamento pacchetti di sistema..."
    run_cmd apt-get update
    
    # Installazione dipendenze base
    log "Installazione dipendenze base..."
    run_cmd apt-get install -y \
        curl \
        wget \
        ca-certificates \
        gnupg \
        lsb-release \
        git \
        unzip \
        software-properties-common \
        apt-transport-https \
        net-tools \
        lsof
}

# Installazione Docker
install_docker() {
    info "Installazione Docker Engine..."
    
    # Rimozione versioni precedenti
    run_cmd apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Aggiunta chiave GPG ufficiale Docker
    run_cmd mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | run_cmd gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Aggiunta repository Docker
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | run_cmd tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Aggiornamento indice pacchetti
    run_cmd apt-get update
    
    # Installazione Docker Engine
    run_cmd apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Avvio e abilitazione Docker
    run_cmd systemctl start docker
    run_cmd systemctl enable docker
    
    # Aggiunta utente al gruppo docker (solo se non root)
    if [[ "$EUID" -ne 0 ]]; then
        run_cmd usermod -aG docker $USER
    fi
    
    log "Docker Engine installato con successo ✅"
}

# Riparazione Docker se necessario
fix_docker_if_needed() {
    if ! timeout 10 docker info &>/dev/null; then
        warn "Docker non risponde. Tentativo di riparazione..."
        
        # Stop servizi
        run_cmd systemctl stop docker 2>/dev/null || true
        run_cmd systemctl stop containerd 2>/dev/null || true
        
        # Pulizia file
        run_cmd rm -f /var/run/docker.sock
        run_cmd rm -f /var/run/docker.pid
        
        # Avvio servizi
        run_cmd systemctl start containerd
        sleep 3
        run_cmd systemctl start docker
        sleep 5
        
        # Controllo finale
        if timeout 15 docker info &>/dev/null; then
            log "Docker riparato con successo ✅"
        else
            error "Riparazione Docker fallita. Esegui ./fix-docker.sh per diagnostica dettagliata"
        fi
    fi
}

# Installazione Node.js (opzionale)
install_nodejs() {
    info "Installazione Node.js 18..."
    
    # Repository NodeSource
    curl -fsSL https://deb.nodesource.com/setup_18.x | run_cmd bash -
    
    # Installazione Node.js
    run_cmd apt-get install -y nodejs
    
    # Verifica installazione
    node_version=$(node --version)
    npm_version=$(npm --version)
    
    log "Node.js $node_version e npm $npm_version installati ✅"
}

# Installazione strumenti aggiuntivi
install_additional_tools() {
    info "Installazione strumenti di sviluppo..."
    
    run_cmd apt-get install -y \
        htop \
        tree \
        jq \
        nano \
        vim \
        ufw \
        fail2ban \
        ncdu \
        tmux
        
    log "Strumenti aggiuntivi installati ✅"
}

# Configurazione firewall
configure_firewall() {
    info "Configurazione firewall UFW..."
    
    # Abilitazione UFW
    run_cmd ufw --force enable
    run_cmd ufw default deny incoming
    run_cmd ufw default allow outgoing
    
    # Consentire SSH
    run_cmd ufw allow ssh
    
    # Consentire HTTP e HTTPS
    run_cmd ufw allow 80
    run_cmd ufw allow 443
    
    # Porte di sviluppo (opzionali - commentate per sicurezza)
    # run_cmd ufw allow 3017  # Frontend dev
    # run_cmd ufw allow 5017  # API dev
    # run_cmd ufw allow 27018 # MongoDB dev
    
    log "Firewall configurato ✅"
}

# Setup swap per sistemi con poca memoria
setup_swap() {
    if ! swapon --show | grep -q swap; then
        warn "Swap non rilevato. Creazione file swap da 2GB..."
        
        # Controllo spazio disco
        DISK_AVAIL_GB=$(df . | tail -1 | awk '{print int($4/1024/1024)}')
        if [ $DISK_AVAIL_GB -lt 3 ]; then
            warn "Spazio disco insufficiente per swap. Saltando..."
            return
        fi
        
        # Creazione file swap
        if [[ "$EUID" -eq 0 ]]; then
            fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1024 count=2097152
            chmod 600 /swapfile
            mkswap /swapfile
            swapon /swapfile
            echo '/swapfile none swap sw 0 0' >> /etc/fstab
        else
            run_cmd fallocate -l 2G /swapfile || run_cmd dd if=/dev/zero of=/swapfile bs=1024 count=2097152
            run_cmd chmod 600 /swapfile
            run_cmd mkswap /swapfile
            run_cmd swapon /swapfile
            echo '/swapfile none swap sw 0 0' | run_cmd tee -a /etc/fstab
        fi
        
        log "File swap da 2GB creato e attivato ✅"
    else
        log "Swap già disponibile ✅"
    fi
}

# Controllo e preparazione file di ambiente
setup_env_files() {
    info "Configurazione file di ambiente..."
    
    # File API
    if [ ! -f "apps/api/.env" ]; then
        if [ -f "apps/api/.env.example" ]; then
            cp apps/api/.env.example apps/api/.env
            log "File .env API creato da template ✅"
        else
            warn "File .env.example API non trovato"
        fi
    else
        log "File .env API già presente ✅"
    fi
    
    # File Frontend
    if [ ! -f "apps/web/.env.local" ]; then
        if [ -f "apps/web/.env.example" ]; then
            cp apps/web/.env.example apps/web/.env.local
            log "File .env.local Frontend creato da template ✅"
        else
            warn "File .env.example Frontend non trovato"
        fi
    else
        log "File .env.local Frontend già presente ✅"
    fi
}

# Ottimizzazioni per sistemi con memoria limitata
optimize_for_low_memory() {
    if [ $MEMORY_MB -lt 2048 ]; then
        info "Sistema con memoria limitata (${MEMORY_MB}MB). Applicando ottimizzazioni..."
        
        # Configurazione Docker per memoria limitata
        if [ ! -f "/etc/docker/daemon.json" ]; then
            run_cmd mkdir -p /etc/docker
            cat > /tmp/docker-daemon.json << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  }
}
EOF
            run_cmd mv /tmp/docker-daemon.json /etc/docker/daemon.json
            run_cmd systemctl restart docker
            log "Configurazione Docker ottimizzata per memoria limitata ✅"
        fi
    fi
}

# Funzione principale
main() {
    log "Inizio installazione dipendenze Cosmos 2048..."
    
    # Controlli preliminari
    check_system_requirements
    
    # Aggiornamento sistema
    update_system
    
    # Installazione Docker
    if ! command -v docker &> /dev/null; then
        install_docker
    else
        log "Docker già installato ✅"
    fi
    
    # Riparazione Docker se necessario
    fix_docker_if_needed
    
    # Node.js (opzionale)
    if ! command -v node &> /dev/null; then
        read -p "Installare Node.js per sviluppo locale? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_nodejs
        fi
    else
        log "Node.js già installato ✅"
    fi
    
    # Strumenti aggiuntivi
    read -p "Installare strumenti di sviluppo aggiuntivi? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        install_additional_tools
    fi
    
    # Firewall
    read -p "Configurare firewall UFW? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        configure_firewall
    fi
    
    # Setup swap
    setup_swap
    
    # Ottimizzazioni memoria
    optimize_for_low_memory
    
    # File di ambiente
    setup_env_files
    
    # Riepilogo finale
    echo ""
    echo "🎉 ${GREEN}Installazione dipendenze completata!${NC}"
    echo "======================================"
    echo "📋 Informazioni Sistema:"
    echo "   OS: $OS $VERSION"
    echo "   RAM: ${MEMORY_MB}MB"
    echo "   Docker: $(docker --version 2>/dev/null || echo 'Errore versione')"
    if command -v node &> /dev/null; then
        echo "   Node.js: $(node --version)"
    fi
    echo ""
    echo "🔄 Prossimi Passi:"
    echo "1. Se non sei root: logout e login per applicare modifiche gruppo docker"
    echo "2. Oppure esegui: newgrp docker"
    echo "3. Avvia produzione: ./deploy-production.sh"
    echo ""
    
    # Controllo se è necessario riavvio
    if [ -f /var/run/reboot-required ]; then
        warn "Riavvio del sistema potrebbe essere necessario"
    fi
    
    # Test finale Docker
    if timeout 10 docker info &>/dev/null; then
        log "✅ Test finale Docker: OK"
    else
        warn "⚠️  Docker potrebbe richiedere logout/login o riavvio"
    fi
}

# Esecuzione funzione principale
main "$@"
