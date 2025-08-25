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

# System requirements check
check_system_requirements() {
    info "Checking system requirements..."
    
    # Check available memory (at least 2GB recommended)
    MEMORY_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}' 2>/dev/null || echo "0")
    if [ "$MEMORY_KB" -gt 0 ]; then
        MEMORY_GB=$((MEMORY_KB / 1024 / 1024))
    else
        # Fallback method
        MEMORY_MB=$(free -m | grep '^Mem:' | awk '{print $2}' 2>/dev/null || echo "0")
        MEMORY_GB=$((MEMORY_MB / 1024))
    fi
    
    if [ $MEMORY_GB -lt 2 ]; then
        warn "System has ${MEMORY_GB}GB RAM. Minimum 2GB recommended for production."
    else
        log "Memory: ${MEMORY_GB}GB ✅"
    fi
    
    # Check available disk space (at least 10GB recommended)
    DISK_AVAIL=$(df . | tail -1 | awk '{print $4}')
    DISK_AVAIL_GB=$((DISK_AVAIL / 1024 / 1024))
    
    if [ $DISK_AVAIL_GB -lt 10 ]; then
        warn "Available disk space: ${DISK_AVAIL_GB}GB. Minimum 10GB recommended."
    else
        log "Disk space: ${DISK_AVAIL_GB}GB available ✅"
    fi
    
    # Check if port 80 is available
    if ss -tulpn | grep -q ":80 " 2>/dev/null; then
        warn "Port 80 is already in use. You may need to stop other web servers."
        info "To check what's using port 80: sudo ss -tulpn | grep :80"
        info "To stop Apache: sudo systemctl stop apache2"
        info "To stop Nginx: sudo systemctl stop nginx"
    else
        log "Port 80 is available ✅"
    fi
}

# Function to install Docker
install_docker() {
    info "Installing Docker..."
    
    # Update package index
    sudo apt-get update
    
    # Install prerequisites
    sudo apt-get install -y \
        ca-certificates \
        curl \
        gnupg \
        lsb-release
    
    # Add Docker's official GPG key
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Add Docker repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Update package index again
    sudo apt-get update
    
    # Install Docker Engine
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    
    # Start and enable Docker service
    sudo systemctl start docker
    sudo systemctl enable docker
    
    log "Docker installed successfully ✅"
    warn "Please log out and log back in for Docker group changes to take effect"
    warn "Or run: newgrp docker"
}

# Function to install Docker Compose (standalone)
install_docker_compose() {
    info "Installing Docker Compose standalone..."
    
    # Download latest Docker Compose
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    
    # Make it executable
    sudo chmod +x /usr/local/bin/docker-compose
    
    # Create symlink for docker compose (if needed)
    sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    log "Docker Compose installed successfully ✅"
}

# Check if running as root
if [[ "$EUID" -eq 0 ]]; then
    warn "⚠️  Running as ROOT user detected!"
    warn "   This is not recommended for security reasons."
    warn "   Docker containers will run with root privileges."
    warn "   Consider running as a regular user with sudo access."
    echo ""
    read -p "Do you want to continue as root? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        info "Execution cancelled. Run as regular user for better security."
        exit 0
    fi
    warn "Continuing as root user..."
    echo ""
fi

# Check and install Docker if needed
if ! command -v docker &> /dev/null; then
    warn "Docker not found. Installing Docker..."
    
    # Check if we're on Ubuntu/Debian
    if ! command -v apt-get &> /dev/null; then
        error "This installer currently supports Ubuntu/Debian systems only"
    fi
    
    install_docker
    
    # Test Docker installation
    if ! docker --version &> /dev/null; then
        error "Docker installation failed"
    fi
else
    log "Docker found ✅"
fi

# Check Docker Compose (plugin or standalone)
if ! docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
    warn "Docker Compose not found. Installing Docker Compose..."
    install_docker_compose
    
    # Test installation
    if ! docker compose version &> /dev/null && ! docker-compose --version &> /dev/null; then
        error "Docker Compose installation failed"
    fi
else
    log "Docker Compose found ✅"
fi

# Function to start Docker daemon
start_docker_daemon() {
    warn "Docker daemon not running. Attempting to start..."
    
    # Try to start Docker service
    if sudo systemctl start docker; then
        log "Docker service start command executed"
    else
        warn "systemctl start docker failed, trying alternative methods..."
    fi
    
    # Wait a bit longer for Docker to start
    sleep 5
    
    # Check if Docker started
    if docker info &> /dev/null; then
        log "Docker daemon started successfully ✅"
        return 0
    fi
    
    # Try enabling Docker service
    warn "Docker still not running. Trying to enable Docker service..."
    sudo systemctl enable docker
    sudo systemctl start docker
    sleep 5
    
    if docker info &> /dev/null; then
        log "Docker daemon started after enabling service ✅"
        return 0
    fi
    
    # Check Docker service status
    warn "Checking Docker service status..."
    sudo systemctl status docker --no-pager -l
    
    # Try to restart Docker
    warn "Attempting Docker restart..."
    sudo systemctl restart docker
    sleep 8
    
    if docker info &> /dev/null; then
        log "Docker daemon started after restart ✅"
        return 0
    fi
    
    # Check for common issues
    warn "Diagnosing Docker daemon issues..."
    
    # Check if Docker socket exists
    if [ ! -S /var/run/docker.sock ]; then
        warn "Docker socket not found at /var/run/docker.sock"
    fi
    
    # Check Docker logs
    warn "Recent Docker daemon logs:"
    sudo journalctl -u docker.service --lines=10 --no-pager
    
    # Try manual Docker daemon start (as last resort)
    warn "Attempting manual Docker daemon start..."
    if sudo dockerd --host=unix:///var/run/docker.sock --host=tcp://0.0.0.0:2375 &>/dev/null &
    then
        DOCKER_PID=$!
        sleep 5
        if docker info &> /dev/null; then
            log "Docker daemon started manually ✅"
            return 0
        else
            # Kill the manual daemon if it didn't work
            sudo kill $DOCKER_PID 2>/dev/null || true
        fi
    fi
    
    # Final troubleshooting suggestions
    error "Failed to start Docker daemon. 

🔧 QUICK FIX: Run the Docker troubleshooting script:
   ./fix-docker.sh

Or try these manual troubleshooting steps:

1. Check Docker service status:
   sudo systemctl status docker

2. Check system logs for errors:
   sudo journalctl -u docker.service --lines=20

3. Try restarting Docker service:
   sudo systemctl restart docker

4. Check if there are permission issues:
   sudo chown root:docker /var/run/docker.sock
   sudo chmod 660 /var/run/docker.sock

5. If all else fails, reboot the system:
   sudo reboot

For detailed diagnostics: ./verify-installation.sh"
}

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    start_docker_daemon
fi

# Set Docker commands based on user
if [[ "$EUID" -eq 0 ]]; then
    # Running as root - use direct commands
    DOCKER_CMD="docker"
    DOCKER_COMPOSE_CMD="docker compose"
    log "Using direct Docker commands (running as root)"
else
    # Check if user is in docker group
    if ! groups $USER | grep -q docker; then
        warn "User not in docker group. You may need to run commands with sudo or logout/login."
        info "Adding user to docker group..."
        sudo usermod -aG docker $USER
        warn "Please run 'newgrp docker' or logout and login again for changes to take effect"
        
        # For the current session, we'll use sudo for docker commands if needed
        DOCKER_CMD="sudo docker"
        DOCKER_COMPOSE_CMD="sudo docker compose"
    else
        DOCKER_CMD="docker"
        DOCKER_COMPOSE_CMD="docker compose"
    fi
fi

log "Docker and Docker Compose verified ✅"

# Check system requirements
check_system_requirements

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
$DOCKER_COMPOSE_CMD -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true

# Clean up development containers if present
if $DOCKER_COMPOSE_CMD ps -q &> /dev/null; then
    warn "Stopping development environment..."
    $DOCKER_COMPOSE_CMD down --remove-orphans
fi

# Build images
log "Building Docker images..."
$DOCKER_COMPOSE_CMD -f docker-compose.prod.yml build --no-cache

# Start services
log "Starting production services..."
$DOCKER_COMPOSE_CMD -f docker-compose.prod.yml up -d

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
$DOCKER_COMPOSE_CMD -f docker-compose.prod.yml logs --tail=50 -f