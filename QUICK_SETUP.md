# ⚡ Quick Setup Guide - Cosmos 2048

## 🚀 One-Command Production Setup

For Ubuntu/Debian systems, you can deploy Cosmos 2048 in production with these simple commands:

### Option 1: Automated Installation (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-repo/cosmos-2048.git
cd cosmos-2048

# Install all dependencies (Docker, tools, firewall, etc.)
./install-dependencies.sh

# Start production environment
./start-production.sh
```

### Option 2: Manual Docker Installation

```bash
# If you just need Docker installed
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Log out and back in, then:
./start-production.sh
```

## 🛠️ What Gets Installed

### `install-dependencies.sh` includes:
- ✅ **Docker Engine** (latest stable)
- ✅ **Docker Compose** (plugin and standalone)
- ✅ **Node.js 18** (optional, for development)
- ✅ **Development Tools** (htop, vim, jq, etc.)
- ✅ **UFW Firewall** (configured for web traffic)
- ✅ **System Updates** (security patches)

### `start-production.sh` includes:
- 🔍 **System Requirements Check** (RAM, disk, ports)
- 🐳 **Automatic Docker Installation** (if missing)
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
- **80**: HTTP (Nginx proxy)
- **443**: HTTPS (when SSL enabled)
- **3017**: Frontend (internal)
- **5017**: API (internal)
- **27017**: MongoDB (internal)

## 🌐 Access Your Application

Once deployment is complete:

- 🎮 **Game**: http://your-server-ip
- 🔍 **Health Check**: http://your-server-ip/health
- 📊 **API**: http://your-server-ip/api/*

## 🔧 Common Commands

```bash
# Check service status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Stop services
docker compose -f docker-compose.prod.yml down

# Restart services
docker compose -f docker-compose.prod.yml restart

# Update application
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
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
sudo ./start-production.sh
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

## 📞 Support

### Logs to check:
- **Application**: `docker compose -f docker-compose.prod.yml logs`
- **System**: `journalctl -u docker`
- **Nginx**: `docker compose -f docker-compose.prod.yml logs nginx`

### File locations:
- **Main app**: Current directory
- **Docker data**: `/var/lib/docker/`
- **Logs**: Container logs via Docker

---

## 🎉 That's It!

Your Cosmos 2048 game should now be running on port 80. Enjoy the Web3 gaming experience with NFT rewards!

**Need help?** Check the full [DEPLOYMENT.md](./DEPLOYMENT.md) guide for detailed configuration options.