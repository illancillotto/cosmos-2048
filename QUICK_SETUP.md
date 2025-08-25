# ⚡ Quick Setup Guide - Cosmos 2048

## 🚀 Two-Environment Setup

Cosmos 2048 now uses a simplified two-environment approach:

- **🔄 Development**: For local development and testing
- **🚀 Production**: For production deployment

## 🛠️ Quick Installation

### 1. Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-repo/cosmos-2048.git
cd cosmos-2048

# Install all dependencies (Docker, tools, firewall, etc.)
./setup-dependencies.sh
```

### 2. Choose Your Environment

#### Development Environment
```bash
# Start development environment
docker compose -f docker-compose.dev.yml up -d

# Access development services
# Frontend: http://localhost:3017
# API: http://localhost:5017
# MongoDB: localhost:27018
```

#### Production Environment
```bash
# Deploy to production
./deploy-production.sh

# Access production application
# Main app: http://localhost
# Health check: http://localhost/health
# API: http://localhost/api/*
```

## 🎯 Environment Comparison

| Feature | Development | Production |
|---------|-------------|------------|
| **Ports** | 3017, 5017, 27018 | 80, 443 (Nginx proxy) |
| **Build** | Development target | Production target |
| **Volumes** | Source code mounted | Optimized bundles |
| **Database** | Local MongoDB | Production MongoDB |
| **Proxy** | None | Nginx reverse proxy |
| **Use Case** | Development, testing | Production deployment |

## 🛠️ What Gets Installed

### `setup-dependencies.sh` includes:
- ✅ **Docker Engine** (latest stable)
- ✅ **Docker Compose** (plugin and standalone)
- ✅ **Node.js 18** (optional, for development)
- ✅ **Development Tools** (htop, vim, jq, etc.)
- ✅ **UFW Firewall** (configured for web traffic)
- ✅ **System Updates** (security patches)

### `deploy-production.sh` includes:
- 🔍 **System Requirements Check** (RAM, disk, ports)
- ⚙️ **Environment Setup** (copies .env files)
- 🏗️ **Image Building** (optimized production builds)
- 🚀 **Service Startup** (Nginx proxy on port 80)
- 💾 **Health Verification** (ensures all services are up)

## 📋 System Requirements

### Minimum Requirements:
- **OS**: Ubuntu 18.04+ or Debian 10+
- **RAM**: 2GB (4GB recommended)
- **Disk**: 10GB free space
- **Network**: Internet connection for downloads

### Ports Used:
- **Development**: 3017 (Frontend), 5017 (API), 27018 (MongoDB)
- **Production**: 80 (HTTP), 443 (HTTPS), internal services

## 🌐 Access Your Application

### Development:
- 🎮 **Game**: http://localhost:3017
- 📡 **API**: http://localhost:5017
- 🗄️ **MongoDB**: localhost:27018

### Production:
- 🎮 **Game**: http://localhost
- 🔍 **Health Check**: http://localhost/health
- 📊 **API**: http://localhost/api/*

## 🔧 Common Commands

```bash
# Development
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml logs -f

# Production
./deploy-production.sh
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml down

# Troubleshooting
./quick-fix.sh diagnose
./quick-fix.sh restart
./quick-fix.sh switch
```

## 🛡️ Security Features

### Automatic Security Setup:
- **Firewall** (UFW) configured
- **Rate limiting** (10 req/s API, 30 req/s web)
- **Security headers** (XSS, CSRF, etc.)
- **Non-root containers**
- **JWT authentication**

### Manual SSL Setup (Optional):
```bash
# Generate self-signed certificate
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/private.key \
    -out ssl/cert.pem \
    -subj "/CN=your-domain.com"

# Enable SSL configuration
cp nginx/nginx-ssl.conf nginx/nginx.conf
docker compose -f docker-compose.prod.yml restart nginx
```

## 🔍 Troubleshooting

### If port 80 is occupied:
```bash
# Check what's using port 80
sudo ss -tulpn | grep :80

# Stop common web servers
sudo systemctl stop apache2
sudo systemctl stop nginx
```

### If Docker permission denied:
```bash
# Add user to docker group and refresh
sudo usermod -aG docker $USER
newgrp docker

# Or use sudo temporarily
sudo ./deploy-production.sh
```

### If services won't start:
```bash
# Check system resources
docker system df
df -h
free -h

# Clean up Docker
docker system prune -a
```

### Switch between environments:
```bash
# Use the interactive menu
./quick-fix.sh

# Or switch directly
./quick-fix.sh switch
```

## 📞 Support

### Logs to check:
- **Development**: `docker compose -f docker-compose.dev.yml logs`
- **Production**: `docker compose -f docker-compose.prod.yml logs`
- **System**: `journalctl -u docker`
- **Nginx**: `docker compose -f docker-compose.prod.yml logs nginx`

### File locations:
- **Main app**: Current directory
- **Docker data**: `/var/lib/docker/`
- **Logs**: Container logs via Docker

---

## 🎉 That's It!

Your Cosmos 2048 game can now run in either development or production mode with just two simple commands!

**Need help?** Check the full [DEPLOYMENT.md](./DEPLOYMENT.md) guide for detailed configuration options.