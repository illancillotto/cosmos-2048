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

### Step 2: Production Deploy
```bash
# Logout/login to apply docker group changes
# OR run: newgrp docker

# Automatic deployment (detects system configuration)
./deploy-production.sh
```

## 🎮 Application Access

After deployment:
- **🎮 Game**: http://localhost
- **🔍 Health Check**: http://localhost/health  
- **📡 API**: http://localhost/api/*

---

## 🛠️ Script Unificati

### `setup-dependencies.sh`
**Installa tutto il necessario:**
- ✅ Docker Engine (latest)
- ✅ Docker Compose 
- ✅ Node.js 18 (opzionale)
- ✅ Strumenti sviluppo (htop, vim, jq, etc.)
- ✅ UFW Firewall
- ✅ Configurazione swap per memoria limitata
- ✅ Ottimizzazioni sistema

### `deploy-production.sh`
**Deploy intelligente:**
- 🔍 Auto-rileva memoria sistema
- 🐳 Sceglie configurazione ottimale
- ⚙️ Setup ambiente automatico
- 🏗️ Build ottimizzato
- 🚀 Avvio servizi
- 💾 Health check completo

**Modalità disponibili:**
- **Auto-detect**: Sceglie automaticamente in base alla memoria
- **Production**: Per sistemi >=2GB RAM (completo con Redis)
- **Low-memory**: Per sistemi <2GB RAM (ottimizzato)

### `quick-fix.sh`
**Troubleshooting rapido:**
- 🔄 Restart rapido servizi
- 🔍 Diagnosi completa sistema
- 🔧 Riparazione Docker
- 📋 Visualizzazione logs
- 🧹 Pulizia profonda

---

## 🎯 Comandi Rapidi

```bash
# Deploy forzando configurazione specifica
./deploy-production.sh --force-production     # Forza produzione completa
./deploy-production.sh --force-low-memory     # Forza memoria limitata

# Troubleshooting
./quick-fix.sh restart      # Riavvio rapido
./quick-fix.sh diagnose     # Diagnosi completa
./quick-fix.sh fix-docker   # Ripara Docker
./quick-fix.sh logs         # Mostra logs

# Gestione servizi
docker compose -f docker-compose.prod.yml ps          # Status produzione
docker compose -f docker-compose.low-memory.yml ps    # Status memoria limitata
docker compose -f docker-compose.prod.yml logs -f     # Logs in tempo reale
docker compose -f docker-compose.prod.yml down        # Stop servizi
```

---

## 📋 System Requirements

### Minimum (Low-memory mode):
- **OS**: Ubuntu 18.04+ / Debian 10+
- **RAM**: 1GB (with automatic swap)
- **Disk**: 10GB free
- **Network**: Internet connection

### Recommended (Production mode):
- **RAM**: 2GB+
- **Disk**: 20GB+ free
- **CPU**: 2+ cores

### Ports used:
- **80**: HTTP (Nginx proxy)
- **443**: HTTPS (when SSL enabled)
- **3017, 5017, 27017**: Internal services

---

## 🔧 Common Problem Resolution

### Docker won't start
```bash
./quick-fix.sh fix-docker
```

### Frontend timeout
```bash
./quick-fix.sh restart
```

### Insufficient memory
```bash
# System auto-creates swap, but you can verify:
free -h
swapon --show

# Force low-memory mode:
./deploy-production.sh --force-low-memory
```

### Ports occupied
```bash
# Check what's using port 80:
sudo ss -tulpn | grep :80

# Stop common web servers:
sudo systemctl stop apache2 nginx
```

---

## 📚 File Configurazione

### Ambiente API (`apps/api/.env`)
```bash
NODE_ENV=production
PORT=5017
MONGODB_URI=mongodb://mongodb:27017/cosmos2048_prod
JWT_SECRET=auto-generated-32-char-secret
```

### Ambiente Frontend (`apps/web/.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost/api
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=stars1your-contract
NEXT_PUBLIC_ENABLE_NFT_MINTING=true
```

---

## 🚀 Advanced Deployment

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

### Production Monitoring
```bash
# Real-time stats:
docker stats

# Aggregated logs:
docker compose -f docker-compose.prod.yml logs -f

# Automatic health check:
watch -n 5 'curl -s http://localhost/health | jq .'
```

---

## 🎉 Complete First Startup

```bash
# Clone and complete setup
git clone <repo-url>
cd cosmos-2048
./setup-dependencies.sh

# Logout/login or:
newgrp docker

# Deploy
./deploy-production.sh

# Test
curl http://localhost/health
open http://localhost
```

**🎮 The game is ready!** Go to http://localhost and start playing!
