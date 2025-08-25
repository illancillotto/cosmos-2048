#!/bin/bash

# 🛠️ Cosmos 2048 - Setup Dependencies
# Installs all necessary dependencies for deployment
# Supports Ubuntu/Debian systems

set -e

echo "🛠️ Cosmos 2048 - Setup Dependencies"
echo "====================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

# Helper function to run commands with or without sudo
run_cmd() {
    if [[ "$EUID" -eq 0 ]]; then
        "$@"
    else
        sudo "$@"
    fi
}

# Check if running as root
if [[ "$EUID" -eq 0 ]]; then
    warn "⚠️  Running as ROOT user detected!"
    warn "   This is not recommended for security reasons."
    warn "   System modifications will be applied directly."
    echo ""
    read -p "Do you want to continue as root? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        info "Installation cancelled. Run as regular user for better security."
        exit 0
    fi
    warn "Continuing as root user..."
    echo ""
fi

# OS Detection
if [[ -f /etc/os-release ]]; then
    . /etc/os-release
    OS=$NAME
    VERSION=$VERSION_ID
else
    error "Cannot detect operating system"
fi

log "Detected OS: $OS $VERSION"

# Compatibility check
if [[ ! "$OS" =~ Ubuntu|Debian ]]; then
    warn "This installer is designed for Ubuntu/Debian. Proceeding anyway..."
fi

# Check system requirements
check_system_requirements() {
    info "Checking system requirements..."
    
    # Memory check (minimum 1GB)
    MEMORY_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}' 2>/dev/null || echo "0")
    if [ "$MEMORY_KB" -gt 0 ]; then
        MEMORY_MB=$((MEMORY_KB / 1024))
    else
        MEMORY_MB=$(free -m | grep '^Mem:' | awk '{print $2}' 2>/dev/null || echo "0")
    fi
    
    if [ $MEMORY_MB -lt 1000 ]; then
        error "System has ${MEMORY_MB}MB RAM. Minimum 1GB required."
    else
        log "Memory: ${MEMORY_MB}MB ✅"
    fi
    
    # Disk space check (minimum 10GB)
    DISK_AVAIL=$(df . | tail -1 | awk '{print $4}')
    DISK_AVAIL_GB=$((DISK_AVAIL / 1024 / 1024))
    
    if [ $DISK_AVAIL_GB -lt 10 ]; then
        error "Available disk space: ${DISK_AVAIL_GB}GB. Minimum 10GB required."
    else
        log "Disk space: ${DISK_AVAIL_GB}GB available ✅"
    fi
}

# System update
update_system() {
    log "Updating system packages..."
    run_cmd apt-get update
    
    # Install base dependencies
    log "Installing base dependencies..."
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

# Docker installation
install_docker() {
    info "Installing Docker Engine..."
    
    # Remove old versions
    run_cmd apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Add Docker's official GPG key
    run_cmd mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | run_cmd gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Add Docker repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | run_cmd tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Update package index
    run_cmd apt-get update
    
    # Install Docker Engine
    run_cmd apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Start and enable Docker
    run_cmd systemctl start docker
    run_cmd systemctl enable docker
    
    # Add user to docker group (only if not root)
    if [[ "$EUID" -ne 0 ]]; then
        run_cmd usermod -aG docker $USER
    fi
    
    log "Docker Engine installed successfully ✅"
}

# Fix Docker if needed
fix_docker_if_needed() {
    if ! timeout 10 docker info &>/dev/null; then
        warn "Docker not responding. Attempting repair..."
        
        # Stop services
        run_cmd systemctl stop docker 2>/dev/null || true
        run_cmd systemctl stop containerd 2>/dev/null || true
        
        # Cleanup files
        run_cmd rm -f /var/run/docker.sock
        run_cmd rm -f /var/run/docker.pid
        
        # Start services
        run_cmd systemctl start containerd
        sleep 3
        run_cmd systemctl start docker
        sleep 5
        
        # Final check
        if timeout 15 docker info &>/dev/null; then
            log "Docker repaired successfully ✅"
        else
            error "Docker repair failed. Run ./quick-fix.sh fix-docker for detailed diagnostics"
        fi
    fi
}

# Node.js installation (optional)
install_nodejs() {
    info "Installing Node.js 18..."
    
    # NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_18.x | run_cmd bash -
    
    # Install Node.js
    run_cmd apt-get install -y nodejs
    
    # Verify installation
    node_version=$(node --version)
    npm_version=$(npm --version)
    
    log "Node.js $node_version and npm $npm_version installed ✅"
}

# Install additional tools
install_additional_tools() {
    info "Installing development tools..."
    
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
        
    log "Additional tools installed ✅"
}

# Firewall configuration
configure_firewall() {
    info "Configuring UFW firewall..."
    
    # Enable UFW
    run_cmd ufw --force enable
    run_cmd ufw default deny incoming
    run_cmd ufw default allow outgoing
    
    # Allow SSH
    run_cmd ufw allow ssh
    
    # Allow HTTP and HTTPS
    run_cmd ufw allow 80
    run_cmd ufw allow 443
    
    # Development ports
    run_cmd ufw allow 3017  # Frontend dev
    run_cmd ufw allow 5017  # API dev
    run_cmd ufw allow 27018 # MongoDB dev
    
    log "Firewall configured ✅"
}

# Setup swap for low-memory systems
setup_swap() {
    if ! swapon --show | grep -q swap; then
        warn "No swap detected. Creating 2GB swap file..."
        
        # Check disk space
        DISK_AVAIL_GB=$(df . | tail -1 | awk '{print int($4/1024/1024)}')
        if [ $DISK_AVAIL_GB -lt 3 ]; then
            warn "Insufficient disk space for swap. Skipping..."
            return
        fi
        
        # Create swap file
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
        
        log "2GB swap file created and activated ✅"
    else
        log "Swap already available ✅"
    fi
}

# Check and setup environment files
setup_env_files() {
    info "Setting up environment files..."
    
    # API file
    if [ ! -f "apps/api/.env" ]; then
        if [ -f "apps/api/.env.example" ]; then
            cp apps/api/.env.example apps/api/.env
            log "API .env file created from template ✅"
        else
            warn "API .env.example file not found"
        fi
    else
        log "API .env file already exists ✅"
    fi
    
    # Frontend file
    if [ ! -f "apps/web/.env.local" ]; then
        if [ -f "apps/web/.env.example" ]; then
            cp apps/web/.env.example apps/web/.env.local
            log "Frontend .env.local file created from template ✅"
        else
            warn "Frontend .env.example file not found"
        fi
    else
        log "Frontend .env.local file already exists ✅"
    fi
}

# Main function
main() {
    log "Starting Cosmos 2048 dependencies installation..."
    
    # Preliminary checks
    check_system_requirements
    
    # System update
    update_system
    
    # Docker installation
    if ! command -v docker &> /dev/null; then
        install_docker
    else
        log "Docker already installed ✅"
    fi
    
    # Fix Docker if needed
    fix_docker_if_needed
    
    # Node.js (optional)
    if ! command -v node &> /dev/null; then
        read -p "Install Node.js for local development? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_nodejs
        fi
    else
        log "Node.js already installed ✅"
    fi
    
    # Additional tools
    read -p "Install additional development tools? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        install_additional_tools
    fi
    
    # Firewall
    read -p "Configure UFW firewall? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        configure_firewall
    fi
    
    # Setup swap
    setup_swap
    
    # Environment files
    setup_env_files
    
    # Final summary
    echo ""
    echo "🎉 ${GREEN}Dependencies installation completed!${NC}"
    echo "========================================="
    echo "📋 System Information:"
    echo "   OS: $OS $VERSION"
    echo "   RAM: ${MEMORY_MB}MB"
    echo "   Docker: $(docker --version 2>/dev/null || echo 'Version error')"
    if command -v node &> /dev/null; then
        echo "   Node.js: $(node --version)"
    fi
    echo ""
    echo "🔄 Next Steps:"
    echo "1. If not root: logout and login to apply docker group changes"
    echo "2. Or run: newgrp docker"
    echo "3. Start development: docker compose -f docker-compose.dev.yml up -d"
    echo "4. Start production: ./deploy-production.sh"
    echo ""
    
    # Check if reboot is needed
    if [ -f /var/run/reboot-required ]; then
        warn "System reboot may be required"
    fi
    
    # Final Docker test
    if timeout 10 docker info &>/dev/null; then
        log "✅ Final Docker test: OK"
    else
        warn "⚠️  Docker may require logout/login or reboot"
    fi
}

# Run main function
main "$@"
