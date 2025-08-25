# 🚀 Production Deployment Guide - Cosmos 2048

## 🏗️ Two-Environment Architecture

Cosmos 2048 uses a simplified two-environment approach:

- **🔄 Development**: `docker-compose.dev.yml` - For local development and testing
- **🚀 Production**: `docker-compose.prod.yml` - For production deployment with Nginx proxy

### 📋 Production Architecture

```
Internet (port 80/443)
    ↓
🔄 Nginx Reverse Proxy
    ├── / → Frontend Next.js (port 3017)
    ├── /api/ → Backend Express (port 5017)
    └── /health → Health Check API
```

## 🛠️ Quick Setup

### 1. Development Environment
```bash
# Start development environment
docker compose -f docker-compose.dev.yml up -d

# Access development services
# Frontend: http://localhost:3017
# API: http://localhost:5017
# MongoDB: localhost:27018
```

### 2. Production Environment
```bash
# Deploy to production
./deploy-production.sh

# Access production application
# Main app: http://localhost
# Health check: http://localhost/health
# API: http://localhost/api/*
```

### 3. Manual Production Setup
```bash
# Copy environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# Build and start production
docker compose -f docker-compose.prod.yml up -d --build

# Verify status
docker compose -f docker-compose.prod.yml ps
```

## 🔧 SSL Configuration (Optional)

### Self-Signed Certificate Generation (Testing)
```bash
# Create SSL directory
mkdir -p ssl

# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/private.key \
    -out ssl/cert.pem \
    -subj "/CN=localhost"
```

### SSL Configuration
```bash
# Replace nginx configuration
cp nginx/nginx-ssl.conf nginx/nginx.conf

# Restart services
docker compose -f docker-compose.prod.yml restart nginx
```

## 🎛️ Environment Variables

### Backend (.env)
```bash
# Security
JWT_SECRET=your-super-secure-jwt-secret-change-this!

# Database
MONGODB_URI=mongodb://mongodb:27017/cosmos2048_prod

# Server
NODE_ENV=production
PORT=5017
```

### Frontend (.env.local)
```bash
# API
NEXT_PUBLIC_API_URL=http://localhost/api

# NFT Configuration
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=stars1your-contract-address
NEXT_PUBLIC_ENABLE_NFT_MINTING=true
```

## 📊 Monitoring

### Real-time Logs
```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f nginx
docker compose -f docker-compose.prod.yml logs -f web
docker compose -f docker-compose.prod.yml logs -f api
```

### Health Checks
```bash
# API Backend
curl -f http://localhost/health

# Frontend
curl -f http://localhost/

# Docker service status
docker compose -f docker-compose.prod.yml ps
```

### Performance Metrics
```bash
# Resource usage
docker stats

# Disk space
docker system df

# Clean unused images
docker system prune -f
```

## 🛡️ Security

### Security Headers (Nginx)
- **X-Frame-Options**: Clickjacking protection
- **X-Content-Type-Options**: MIME sniffing prevention  
- **X-XSS-Protection**: XSS protection
- **Referrer-Policy**: Referrer control
- **HSTS**: Transport security (HTTPS only)

### Rate Limiting
- **API**: 10 requests/second
- **Web**: 30 requests/second
- **Burst**: Buffer for traffic spikes

### User Security
- **Non-root user**: Containers run with dedicated user
- **Read-only filesystem**: Container compromise protection
- **Resource limits**: CPU and memory limitations

## 🔄 Service Management

### Useful Commands
```bash
# Start production
docker compose -f docker-compose.prod.yml up -d

# Stop production  
docker compose -f docker-compose.prod.yml down

# Restart specific service
docker compose -f docker-compose.prod.yml restart nginx

# Update and rebuild
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

# Backup database
docker exec cosmos2048-mongodb-prod mongodump --out /backup

# Restore database
docker exec cosmos2048-mongodb-prod mongorestore /backup
```

### Application Update
```bash
# 1. Backup database
docker exec cosmos2048-mongodb-prod mongodump --out /backup

# 2. Stop services
docker compose -f docker-compose.prod.yml down

# 3. Update code (git pull, etc.)
git pull origin main

# 4. Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build

# 5. Verify health
curl -f http://localhost/health
```

## 🚀 Remote Server Deployment

### Server Setup
```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Clone repository
git clone https://github.com/your-repo/cosmos-2048.git
cd cosmos-2048

# Setup production
./setup-dependencies.sh
./deploy-production.sh
```

### Domain Configuration
```bash
# /etc/nginx/sites-available/cosmos2048
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔍 Troubleshooting

### Common Issues

#### Port 80 occupied
```bash
# Find process using port 80
sudo lsof -i :80

# Stop existing Apache/Nginx
sudo systemctl stop apache2
sudo systemctl stop nginx
```

#### Containers won't start
```bash
# Check error logs
docker compose -f docker-compose.prod.yml logs

# Check disk space
df -h

# Clean Docker cache
docker system prune -a
```

#### Database not connected
```bash
# Verify MongoDB
docker exec -it cosmos2048-mongodb-prod mongosh --eval "db.adminCommand('ping')"

# Reset database
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d
```

#### Switch between environments
```bash
# Use quick-fix script
./quick-fix.sh switch

# Or manually
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.dev.yml up -d
```

## 📈 Performance Tuning

### Nginx Optimizations
- **Gzip compression**: Enabled for all text files
- **Static asset caching**: 1 year for immutable assets  
- **Connection keepalive**: Reduced connection overhead
- **Worker processes**: CPU-based auto-scaling

### Next.js Optimizations
- **Standalone output**: Production-optimized bundle
- **SWC minification**: Fast JavaScript minification
- **Image optimization**: Automatic image optimization
- **Console removal**: Remove console.log in production

### MongoDB Optimizations
- **Persistent volumes**: Persistent storage
- **Connection pooling**: Optimized connection pool
- **Indexes**: Automatic indexes on frequent queries

---

## 🎯 Production Deployment Checklist

- [ ] ✅ SSL certificates configured (if needed)
- [ ] ✅ Production environment variables configured
- [ ] ✅ Secure JWT secret generated
- [ ] ✅ Automatic database backup configured
- [ ] ✅ Log monitoring active
- [ ] ✅ Health checks working
- [ ] ✅ Rate limiting configured
- [ ] ✅ Security headers active
- [ ] ✅ Performance testing completed

---

## 🔄 Environment Switching

### Quick Environment Switch
```bash
# Use the interactive menu
./quick-fix.sh

# Or switch directly
./quick-fix.sh switch
```

### Manual Environment Management
```bash
# Development
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml down

# Production
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml down
```

**🌟 Your Cosmos 2048 is ready for launch with simple environment management!**