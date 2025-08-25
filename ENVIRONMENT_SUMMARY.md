# 🌟 Cosmos 2048 - Environment Summary

## 🎯 Simplified Two-Environment Setup

Cosmos 2048 has been simplified to use just two environments for easier management and deployment.

---

## 🔄 Development Environment

**File**: `docker-compose.dev.yml`

### Purpose
- Local development and testing
- Source code mounting for hot reloading
- Development build targets
- Direct port access

### Services
- **Frontend**: Next.js on port 3017
- **API**: Express.js on port 5017  
- **MongoDB**: Database on port 27018

### Usage
```bash
# Start development
docker compose -f docker-compose.dev.yml up -d

# Access services
# Frontend: http://localhost:3017
# API: http://localhost:5017
# MongoDB: localhost:27018

# Stop development
docker compose -f docker-compose.dev.yml down
```

---

## 🚀 Production Environment

**File**: `docker-compose.prod.yml`

### Purpose
- Production deployment
- Nginx reverse proxy on port 80
- Production-optimized builds
- Health checks and monitoring

### Services
- **Nginx**: Reverse proxy on ports 80/443
- **Frontend**: Next.js production build (internal port 3017)
- **API**: Express.js production (internal port 5017)
- **MongoDB**: Production database (internal port 27017)

### Usage
```bash
# Deploy production
./deploy-production.sh

# Access application
# Main app: http://localhost
# Health check: http://localhost/health
# API: http://localhost/api/*

# Manage production
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml down
```

---

## 🔧 Management Scripts

### `setup-dependencies.sh`
- Installs Docker, tools, firewall
- System configuration and optimization
- Environment file setup

### `deploy-production.sh`
- Production deployment automation
- Environment setup and verification
- Health checks and monitoring

### `quick-fix.sh`
- Troubleshooting and diagnosis
- Service management
- Environment switching

---

## 🔄 Environment Switching

### Quick Switch
```bash
# Interactive menu
./quick-fix.sh

# Direct switch
./quick-fix.sh switch
```

### Manual Switch
```bash
# Development → Production
docker compose -f docker-compose.dev.yml down
./deploy-production.sh

# Production → Development
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.dev.yml up -d
```

---

## 📊 Port Summary

| Environment | Frontend | API | Database | Proxy |
|-------------|----------|-----|----------|-------|
| **Development** | 3017 | 5017 | 27018 | None |
| **Production** | 3017 (internal) | 5017 (internal) | 27017 (internal) | 80/443 |

---

## 🎉 Benefits of Simplified Setup

✅ **Easier Management**: Only two environments to maintain  
✅ **Clear Purpose**: Development vs Production clearly defined  
✅ **Simplified Scripts**: No more complex variant detection  
✅ **Better UX**: Clear commands for each environment  
✅ **Easier Troubleshooting**: Simple environment switching  
✅ **Reduced Confusion**: No more multiple docker-compose variants  

---

## 🚀 Quick Commands Reference

```bash
# Development
docker compose -f docker-compose.dev.yml up -d

# Production
./deploy-production.sh

# Troubleshooting
./quick-fix.sh diagnose
./quick-fix.sh restart
./quick-fix.sh switch

# Environment info
docker compose -f docker-compose.dev.yml ps
docker compose -f docker-compose.prod.yml ps
```

**🌟 Simple, clean, and efficient deployment!**
