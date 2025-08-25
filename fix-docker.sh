#!/bin/bash

# 🔧 Docker Troubleshooting and Fix Script
# Diagnoses and attempts to fix common Docker daemon issues

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🔧 Docker Troubleshooting & Fix Utility"
echo "======================================"

# Functions for colored logs
log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] WARNING:${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ERROR:${NC} $1"
}

info() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] INFO:${NC} $1"
}

# Check if running as root
if [[ "$EUID" -eq 0 ]]; then
    warn "⚠️  Running as ROOT user detected!"
    warn "   This script will make system-level changes directly."
    warn "   Running as a regular user with sudo is recommended for security."
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

# Function to diagnose Docker installation
diagnose_docker() {
    info "Diagnosing Docker installation..."
    
    # Check if Docker is installed
    if command -v docker &> /dev/null; then
        log "Docker binary found: $(which docker)"
        docker --version
    else
        error "Docker binary not found"
        return 1
    fi
    
    # Check Docker service
    echo ""
    info "Docker service status:"
    run_cmd systemctl status docker --no-pager -l || true
    
    # Check Docker daemon logs
    echo ""
    info "Recent Docker daemon logs:"
    run_cmd journalctl -u docker.service --lines=20 --no-pager || true
    
    # Check Docker socket
    echo ""
    info "Checking Docker socket..."
    if [ -S /var/run/docker.sock ]; then
        log "Docker socket exists: /var/run/docker.sock"
        ls -la /var/run/docker.sock
    else
        warn "Docker socket not found at /var/run/docker.sock"
    fi
    
    # Check user groups (only if not root)
    if [[ "$EUID" -ne 0 ]]; then
        echo ""
        info "User group membership:"
        groups $USER
        
        if groups $USER | grep -q docker; then
            log "User is in docker group ✅"
        else
            warn "User is NOT in docker group ❌"
        fi
    fi
    
    # Check system resources
    echo ""
    info "System resources:"
    free -h
    df -h /var/lib/docker 2>/dev/null || df -h /
    
    # Check for conflicts
    echo ""
    info "Checking for service conflicts..."
    
    if systemctl is-active --quiet containerd; then
        log "containerd service is running"
    else
        warn "containerd service is not running"
    fi
    
    # Check Docker daemon connectivity
    echo ""
    info "Testing Docker daemon connectivity..."
    if timeout 10 docker info &>/dev/null; then
        log "Docker daemon is responsive ✅"
        return 0
    else
        error "Docker daemon is not responsive ❌"
        return 1
    fi
}

# Function to fix Docker installation
fix_docker() {
    info "Attempting to fix Docker installation..."
    
    # Stop Docker service
    warn "Stopping Docker service..."
    run_cmd systemctl stop docker 2>/dev/null || true
    run_cmd systemctl stop containerd 2>/dev/null || true
    
    # Clean up Docker files
    warn "Cleaning up Docker files..."
    run_cmd rm -f /var/run/docker.sock
    run_cmd rm -f /var/run/docker.pid
    
    # Fix permissions
    warn "Fixing Docker permissions..."
    run_cmd chown root:root /usr/bin/docker 2>/dev/null || true
    run_cmd chmod +x /usr/bin/docker 2>/dev/null || true
    
    # Add user to docker group (only if not root)
    if [[ "$EUID" -ne 0 ]]; then
        warn "Adding user to docker group..."
        run_cmd usermod -aG docker $USER
    fi
    
    # Enable and start containerd
    info "Starting containerd service..."
    run_cmd systemctl enable containerd
    run_cmd systemctl start containerd
    sleep 3
    
    # Enable and start Docker
    info "Starting Docker service..."
    run_cmd systemctl enable docker
    run_cmd systemctl start docker
    sleep 5
    
    # Wait for Docker socket
    info "Waiting for Docker socket..."
    for i in {1..30}; do
        if [ -S /var/run/docker.sock ]; then
            break
        fi
        sleep 1
    done
    
    # Fix socket permissions
    if [ -S /var/run/docker.sock ]; then
        if [[ "$EUID" -eq 0 ]]; then
            chown root:docker /var/run/docker.sock 2>/dev/null || chown root:root /var/run/docker.sock
            chmod 660 /var/run/docker.sock
        else
            run_cmd chown root:docker /var/run/docker.sock
            run_cmd chmod 660 /var/run/docker.sock
        fi
        log "Fixed Docker socket permissions"
    fi
    
    # Test Docker
    sleep 3
    if timeout 15 docker info &>/dev/null; then
        log "Docker is now working! ✅"
        return 0
    else
        error "Docker is still not working after fix attempt ❌"
        return 1
    fi
}

# Main function
main() {
    info "Starting Docker diagnosis..."
    
    # Run diagnosis
    if diagnose_docker; then
        log "Docker appears to be working correctly"
        exit 0
    fi
    
    echo ""
    warn "Docker issues detected. Attempting automatic fixes..."
    
    # Try to fix
    if fix_docker; then
        log "Docker has been fixed successfully!"
        if [[ "$EUID" -ne 0 ]]; then
            info "You may need to run 'newgrp docker' or logout/login for group changes"
        fi
        exit 0
    fi
    
    echo ""
    error "All fix attempts failed. Manual intervention required:"
    echo ""
    echo "1. Check system logs: journalctl -u docker.service -f"
    echo "2. Check for disk space issues: df -h"
    echo "3. Check for conflicting software"
    echo "4. Consider rebooting the system: reboot"
    echo "5. Consult Docker documentation or support"
    
    exit 1
}

# Run main function
main "$@"