#!/bin/bash

# 🛠️ Cosmos 2048 Dependencies Installer
# Installs all required dependencies for production deployment

set -e

echo "🛠️ Installing Cosmos 2048 Dependencies"
echo "======================================"

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

# Helper function to run commands with or without sudo
run_cmd() {
    if [[ "$EUID" -eq 0 ]]; then
        # Running as root - execute directly
        "$@"
    else
        # Running as regular user - use sudo
        sudo "$@"
    fi
}

# Check if running as root
if [[ "$EUID" -eq 0 ]]; then
    warn "⚠️  Running as ROOT user detected!"
    warn "   This is generally not recommended for security reasons."
    warn "   System modifications will be applied directly without sudo."
    warn "   Consider running as a regular user with sudo access."
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

# Detect OS
if [[ -f /etc/os-release ]]; then
    . /etc/os-release
    OS=$NAME
    VERSION=$VERSION_ID
else
    error "Cannot detect operating system"
fi

log "Detected OS: $OS $VERSION"

# Check if we're on a supported system
if [[ ! "$OS" =~ Ubuntu|Debian ]]; then
    warn "This installer is designed for Ubuntu/Debian. Proceeding with caution..."
fi

# Update system packages
log "Updating system packages..."
run_cmd apt-get update

# Install basic dependencies
log "Installing basic dependencies..."
run_cmd apt-get install -y \
    curl \
    wget \
    ca-certificates \
    gnupg \
    lsb-release \
    git \
    unzip \
    software-properties-common \
    apt-transport-https

# Function to install Docker
install_docker() {
    info "Installing Docker Engine..."
    
    # Remove old Docker versions
    sudo apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Add Docker's official GPG key
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Add Docker repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Update package index
    sudo apt-get update
    
    # Install Docker Engine
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Start and enable Docker
    sudo systemctl start docker
    sudo systemctl enable docker
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    
    log "Docker Engine installed successfully ✅"
}

# Function to install Node.js (for development)
install_nodejs() {
    info "Installing Node.js..."
    
    # Install NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    
    # Install Node.js
    sudo apt-get install -y nodejs
    
    # Verify installation
    node_version=$(node --version)
    npm_version=$(npm --version)
    
    log "Node.js $node_version and npm $npm_version installed successfully ✅"
}

# Function to install additional tools
install_tools() {
    info "Installing additional development tools..."
    
    # Install useful tools
    sudo apt-get install -y \
        htop \
        tree \
        jq \
        nano \
        vim \
        net-tools \
        lsof \
        ufw \
        fail2ban
        
    log "Additional tools installed successfully ✅"
}

# Function to configure firewall
configure_firewall() {
    info "Configuring firewall..."
    
    # Install and configure UFW
    sudo ufw --force enable
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    
    # Allow SSH
    sudo ufw allow ssh
    
    # Allow HTTP and HTTPS
    sudo ufw allow 80
    sudo ufw allow 443
    
    # Allow development ports (optional)
    # sudo ufw allow 3017  # Next.js dev
    # sudo ufw allow 5017  # API dev
    
    log "Firewall configured successfully ✅"
}

# Main installation flow
main() {
    log "Starting dependency installation..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        install_docker
    else
        log "Docker already installed ✅"
    fi
    
    # Check Node.js (optional for development)
    if ! command -v node &> /dev/null; then
        read -p "Install Node.js for local development? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_nodejs
        fi
    else
        log "Node.js already installed ✅"
    fi
    
    # Install additional tools
    read -p "Install additional development tools (htop, vim, etc.)? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        install_tools
    fi
    
    # Configure firewall
    read -p "Configure firewall (UFW)? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        configure_firewall
    fi
    
    # System information
    echo ""
    echo "🎉 ${GREEN}Installation completed successfully!${NC}"
    echo "=================================="
    echo "📋 System Information:"
    echo "   OS: $OS $VERSION"
    echo "   Docker: $(docker --version 2>/dev/null || echo 'Not installed')"
    if command -v node &> /dev/null; then
        echo "   Node.js: $(node --version)"
    fi
    echo ""
    echo "🔄 Next Steps:"
    echo "1. Log out and log back in (or run: newgrp docker)"
    echo "2. Run: ./start-production.sh"
    echo ""
    
    # Check if reboot is needed
    if [ -f /var/run/reboot-required ]; then
        warn "System reboot may be required for some changes to take effect"
    fi
}

# Run main function
main "$@"