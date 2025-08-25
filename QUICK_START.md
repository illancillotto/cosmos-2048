# ⚡ Quick Start Guide - Cosmos 2048

## 🚀 Deployment Rapido (2 Comandi)

### Step 1: Installazione Dipendenze
```bash
# Clona il repository
git clone <your-repo-url>
cd cosmos-2048

# Installa tutte le dipendenze (Docker, tools, etc.)
./setup-dependencies.sh
```

### Step 2: Deploy Produzione
```bash
# Logout/login per applicare modifiche gruppo docker
# OPPURE esegui: newgrp docker

# Deploy automatico (rileva configurazione sistema)
./deploy-production.sh
```

## 🎮 Accesso Applicazione

Dopo il deployment:
- **🎮 Gioco**: http://localhost
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

## 📋 Requisiti Sistema

### Minimi (Low-memory mode):
- **OS**: Ubuntu 18.04+ / Debian 10+
- **RAM**: 1GB (con swap automatico)
- **Disk**: 10GB liberi
- **Network**: Connessione internet

### Raccomandati (Production mode):
- **RAM**: 2GB+
- **Disk**: 20GB+ liberi
- **CPU**: 2+ cores

### Porte utilizzate:
- **80**: HTTP (Nginx proxy)
- **443**: HTTPS (quando SSL abilitato)
- **3017, 5017, 27017**: Servizi interni

---

## 🔧 Risoluzione Problemi Comuni

### Docker non si avvia
```bash
./quick-fix.sh fix-docker
```

### Frontend timeout
```bash
./quick-fix.sh restart
```

### Memoria insufficiente
```bash
# Il sistema auto-crea swap, ma puoi verificare:
free -h
swapon --show

# Forza modalità memoria limitata:
./deploy-production.sh --force-low-memory
```

### Porte occupate
```bash
# Verifica cosa usa porta 80:
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

## 🚀 Deployment Avanzato

### SSL/HTTPS Setup
```bash
# Genera certificati self-signed per test:
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/private.key \
    -out ssl/cert.pem \
    -subj "/CN=yourdomain.com"

# Attiva configurazione SSL:
cp nginx/nginx-ssl.conf nginx/nginx.conf
docker compose -f docker-compose.prod.yml restart nginx
```

### Monitoraggio Produzione
```bash
# Stats in tempo reale:
docker stats

# Logs aggregati:
docker compose -f docker-compose.prod.yml logs -f

# Health check automatico:
watch -n 5 'curl -s http://localhost/health | jq .'
```

---

## 🎉 Primo Avvio Completo

```bash
# Clone e setup completo
git clone <repo-url>
cd cosmos-2048
./setup-dependencies.sh

# Logout/login oppure:
newgrp docker

# Deploy
./deploy-production.sh

# Test
curl http://localhost/health
open http://localhost
```

**🎮 Il gioco è pronto!** Vai su http://localhost e inizia a giocare!
