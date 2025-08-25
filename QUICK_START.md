# ⚡ Quick Start Guide - Cosmos 2048

## 🚀 Quick Deployment (2 Commands)

### Step 1: Install Dependencies
```bash
# Clone the repository
git clone <your-repo-url>
cd cosmos-2048

# Install all dependencies (Docker, tools, etc.)
./setup-dependencies.sh
```

### Step 2: Choose Your Environment

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

## 🎮 Application Access

### Development:
- **🎮 Game**: http://localhost:3017
- **📡 API**: http://localhost:5017
- **🗄️ MongoDB**: localhost:27018

### Production:
- **🎮 Game**: http://localhost
- **🔍 Health Check**: http://localhost/health
- **📡 API**: http://localhost/api/*

---

## 🛠️ Script Overview

### `setup-dependencies.sh`
**Installs everything needed:**
- ✅ Docker Engine (latest)
- ✅ Docker Compose 
- ✅ Node.js 18 (optional)
- ✅ Development tools (htop, vim, jq, etc.)
- ✅ UFW Firewall
- ✅ System configuration and swap setup

### `deploy-production.sh`
**Production deployment:**
- 🔍 System requirements check
- ⚙️ Automatic environment setup
- 🏗️ Production build optimization
- 🚀 Service startup with health checks
- 💾 Complete verification

### `quick-fix.sh`
**Troubleshooting and management:**
- 🔄 Quick service restart
- 🔍 Complete system diagnosis
- 🔧 Docker repair
- 📋 Log viewing
- 🧹 Deep cleanup
- 🔄 Environment switching

---

## 🎯 Quick Commands

```bash
# Development
docker compose -f docker-compose.dev.yml up -d      # Start dev
docker compose -f docker-compose.dev.yml down       # Stop dev
docker compose -f docker-compose.dev.yml logs -f    # View dev logs

# Production
./deploy-production.sh                              # Deploy production
docker compose -f docker-compose.prod.yml ps        # Check status
docker compose -f docker-compose.prod.yml logs -f   # View production logs
docker compose -f docker-compose.prod.yml down      # Stop production

# Troubleshooting
./quick-fix.sh restart      # Quick restart
./quick-fix.sh diagnose     # Complete diagnosis
./quick-fix.sh fix-docker   # Fix Docker issues
./quick-fix.sh switch       # Switch between environments
```

---

## 📋 System Requirements

### Minimum Requirements:
- **OS**: Ubuntu 18.04+ / Debian 10+
- **RAM**: 2GB (4GB recommended)
- **Disk**: 10GB free space
- **Network**: Internet connection

### Ports Used:
- **Development**: 3017, 5017, 27018
- **Production**: 80, 443 (Nginx proxy)

---

## 🔧 Common Problem Resolution

### Docker won't start
```bash
./quick-fix.sh fix-docker
```

### Services timeout
```bash
./quick-fix.sh restart
```

### Switch environments
```bash
./quick-fix.sh switch
```

### Ports occupied
```bash
# Check what's using port 80:
sudo ss -tulpn | grep :80

# Stop common web servers:
sudo systemctl stop apache2 nginx
```

---

## 📚 Environment Configuration

### Development Environment (`docker-compose.dev.yml`)
- Source code mounted for live development
- Development build targets
- Direct port access (3017, 5017, 27018)
- Hot reloading enabled

### Production Environment (`docker-compose.prod.yml`)
- Production-optimized builds
- Nginx reverse proxy on port 80
- Health checks and monitoring
- SSL/HTTPS support ready

---

## 🚀 Advanced Usage

### SSL/HTTPS Setup
```bash
# Generate self-signed certificates for testing:
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/private.key \
    -out ssl/cert.pem \
    -subj "/CN=yourdomain.com"

# Enable SSL configuration:
cp nginx/nginx-ssl.conf nginx/nginx.conf
docker compose -f docker-compose.prod.yml restart nginx
```

### Environment Variables
```bash
# API environment (apps/api/.env)
NODE_ENV=production
PORT=5017
MONGODB_URI=mongodb://mongodb:27017/cosmos2048_prod
JWT_SECRET=your-secure-jwt-secret

# Frontend environment (apps/web/.env.local)
NEXT_PUBLIC_API_URL=http://localhost/api
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=stars1your-contract
NEXT_PUBLIC_ENABLE_NFT_MINTING=true
```

---

## 🎉 Complete First Startup

```bash
# Clone and setup
git clone <repo-url>
cd cosmos-2048
./setup-dependencies.sh

# Logout/login or:
newgrp docker

# Choose environment:
# For development:
docker compose -f docker-compose.dev.yml up -d

# For production:
./deploy-production.sh

# Test
curl http://localhost:3017  # Dev
curl http://localhost        # Prod
```

**🎮 The game is ready!** Choose your environment and start playing!

---

## 🔄 Switching Between Environments

```bash
# Use interactive menu
./quick-fix.sh

# Or switch directly
./quick-fix.sh switch

# Manual switch
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.prod.yml up -d
```

**🌟 Simple, clean, and efficient deployment!**
