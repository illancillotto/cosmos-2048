# 🌌 Cosmos 2048

A complete Web3 gaming experience that combines classic 2048 mechanics with the Cosmos ecosystem, featuring real NFT rewards and a professional-grade user interface.

## ✨ Key Features

🎮 **Advanced Gameplay**: 2048 with Cosmos ecosystem token tiles  
🔗 **Keplr Integration**: Complete ADR-036 wallet authentication  
🎡 **Wheel of Fortune**: Interactive reward system with NFT prizes  
🏆 **Real NFT Minting**: CW721 badge minting on Stargaze  
📱 **Responsive Design**: Optimized experience for mobile and desktop  
🎨 **Professional UI**: Smooth animations and modern design  

## 🚀 Quick Start

### ⚡ One-Command Production Deployment

For Ubuntu/Debian servers:

```bash
# Clone and install everything
git clone https://github.com/your-repo/cosmos-2048.git
cd cosmos-2048

# Option 1: Full automated installation
./install-dependencies.sh    # Installs Docker, tools, firewall
./start-production.sh        # Deploys on port 80

# Option 2: Quick production start (auto-installs Docker)
./start-production.sh        # Handles Docker installation automatically
```

### 🛠️ Development Setup

1. **Setup environment files:**
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

2. **Start development environment:**
   ```bash
   docker compose up -d --build
   ```

3. **Access the application:**
   
   **Development:**
   - Frontend: http://localhost:3017
   - API Health: http://localhost:5017/health
   - MongoDB: localhost:27017
   
   **Production (with Nginx Proxy):**
   - 🌐 **Application**: http://localhost (port 80)
   - 🔍 **Health Check**: http://localhost/health
   - 📊 **API**: http://localhost/api/*

### 🔍 Verify Installation

```bash
# Check if everything is properly installed and running
./verify-installation.sh
```

## 🏗️ Architecture

### Development
- **Frontend**: Next.js 14 + Tailwind CSS + Framer Motion (port 3017)
- **Backend**: Express.js + MongoDB + JWT Auth (port 5017)
- **Database**: MongoDB (port 27017)

### Production
- **Reverse Proxy**: Nginx (port 80/443)
- **Frontend**: Next.js Standalone Build (port 3017 internal)
- **Backend**: Express.js Production (port 5017 internal)
- **Database**: MongoDB with persistent volumes (port 27017 internal)
- **Caching**: Redis for performance (port 6379 internal)

### Blockchain
- **Network**: Stargaze Mainnet for NFT minting
- **Wallet**: Keplr with ADR-036 support
- **Standard**: CW721 for NFT badges

## 🎮 Complete Game Flow

1. **Connect Keplr Wallet** → Secure ADR-036 authentication
2. **Play Cosmos 2048** → Ecosystem token tiles
3. **Game Over** → Modal with reward options
4. **Spin the Wheel** → Interactive Wheel of Fortune
5. **Win Prize** → Automatic NFT badge minting
6. **Badge Collection** → View your NFTs in the gallery

## 🎯 API Endpoints

### Authentication
- `GET /health` - API health check
- `POST /auth/guest` - Create guest user with JWT token
- `POST /auth/wallet` - Keplr wallet authentication (ADR-036)

### Gameplay  
- `POST /scores` - Submit game score (requires auth)
- `GET /leaderboard` - Global leaderboard of best players

### Web3 Features
- `POST /wheel/spin` - Spin the wheel of fortune
- `POST /mint/badge` - Mint NFT badge on Stargaze

## 🛠️ Local Development

### Development without Docker

1. **Start MongoDB:**
   ```bash
   docker run -d -p 27017:27017 mongo:7
   ```

2. **Start API:**
   ```bash
   cd apps/api
   npm install
   npm run dev
   ```

3. **Start Frontend:**
   ```bash
   cd apps/web  
   npm install
   npm run dev
   ```

### Prerequisites for Testing
- **Keplr Extension** installed in browser
- **Stargaze Network** added to Keplr  
- **STARS tokens** in wallet for gas fees

## 🌌 Cosmos Ecosystem Tokens

The game features a complete progression through major Cosmos ecosystem tokens:

| Value | Token | Symbol | Description |
|-------|-------|--------|-------------|
| **2** | ATOM | ⚛️ | Cosmos Hub - Internet of Blockchains |
| **4** | OSMO | 🧪 | Osmosis DEX - Liquidity Hub |
| **8** | JUNO | 🌀 | Smart Contracts Platform |
| **16** | STARS | ⭐ | Stargaze - NFT Marketplace |
| **32** | SCRT | 🔐 | Secret Network - Privacy |
| **64** | EVMOS | 🚀 | EVM Compatibility |
| **128** | AKT | ☁️ | Akash - Decentralized Cloud |
| **256** | REGEN | 🌱 | Climate Solutions |
| **512** | CRO | 💎 | Cronos Chain |
| **1024** | KAVA | 🔥 | DeFi Platform |
| **2048** | COSMOS | 🌌 | Ultimate Achievement |

## 🎁 NFT Reward System

### Prize Rarities
- 🥉 **Common** (40%): Standard badges
- 🥈 **Uncommon** (30%): Badges with special effects
- 🥇 **Rare** (15%): Premium badges with animations
- 💎 **Epic** (10%): Exclusive badges with unique metadata
- 👑 **Legendary** (4%): Ultra-rare collectible badges
- 😅 **No Prize** (1%): Try again!

## ⚙️ Configuration

### Environment Variables
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:5017
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=stars1...
NEXT_PUBLIC_BASE_TOKEN_URI=https://api.cosmos2048.com/metadata/
NEXT_PUBLIC_ENABLE_NFT_MINTING=true

# Backend (.env)
PORT=5017
MONGODB_URI=mongodb://localhost:27017/cosmos2048
JWT_SECRET=your-jwt-secret-key
NODE_ENV=development
```

## 📁 Project Structure

```
cosmos-2048/
├── docker-compose.yml
├── README.md
├── apps/
│   ├── web/                    # Next.js Frontend
│   │   ├── app/
│   │   │   ├── page.js         # Main game page
│   │   │   ├── layout.js       # App layout
│   │   │   └── globals.css     # Global styles
│   │   ├── components/         # React Components
│   │   │   ├── GameOverModal.jsx
│   │   │   ├── WheelOfFortune.jsx
│   │   │   ├── BadgeGallery.jsx
│   │   │   ├── TokenLegend.jsx
│   │   │   └── HUD.jsx
│   │   ├── contexts/
│   │   │   └── WalletContext.js # Wallet state management
│   │   └── lib/               # Core Logic
│   │       ├── game2048.js     # Game engine
│   │       ├── cosmosMap.js    # Token mapping
│   │       ├── keplr.js        # Keplr integration
│   │       └── nftMinter.js    # NFT minting
│   └── api/                   # Express Backend
│       ├── src/
│       │   ├── server.js       # Main server
│       │   ├── models/         # MongoDB models
│       │   ├── routes/         # API routes
│       │   └── utils/          # Utilities
│       └── package.json
```

## 🚀 Technologies Used

### Frontend
- **Next.js 14**: React framework for production
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Advanced animation library
- **CosmJS**: SDK for Cosmos blockchain integration
- **Keplr Types**: Type definitions for Keplr wallet

### Backend  
- **Express.js**: Minimalist web framework
- **MongoDB + Mongoose**: NoSQL database and ODM
- **JWT**: JSON Web Token authentication
- **bcryptjs**: Secure password hashing
- **CORS + Helmet**: Security and CORS

### Production
- **Nginx**: Reverse proxy and load balancer
- **Redis**: Caching layer for performance
- **Docker Multi-stage**: Optimized build
- **SSL/TLS**: Complete HTTPS support

### Blockchain
- **Stargaze**: Network for NFT minting
- **CW721**: Cosmos NFT standard
- **ADR-036**: Secure off-chain authentication

## 🎯 Completed Features

### ✅ Core Game
- [x] Complete 2048 mechanics with touch/keyboard controls
- [x] Score system and best score tracking
- [x] Responsive design for mobile and desktop
- [x] Smooth animations and visual feedback

### ✅ Web3 Integration
- [x] Keplr wallet connection with ADR-036
- [x] Secure off-chain authentication
- [x] Real NFT minting on Stargaze
- [x] Wallet state and transaction management

### ✅ Rewards System
- [x] Interactive Wheel of Fortune
- [x] Prize rarity system with probabilistic weights
- [x] Automatic NFT badge minting
- [x] User NFT collection gallery

### ✅ Professional UI/UX
- [x] Consistent design system with Cosmos theme
- [x] Framer Motion animations for micro-interactions
- [x] Modular and reusable components
- [x] Optimized accessibility and performance

## 📈 Performance & Optimizations

- **60 FPS**: Guaranteed smooth animations
- **Mobile-First**: Optimized responsive design
- **Bundle Size**: Next.js optimizations for production
- **Lazy Loading**: On-demand component loading
- **Error Boundaries**: Robust error handling

## 🔒 Security

- **ADR-036 Compliance**: Secure off-chain authentication
- **JWT Tokens**: Secure sessions with expiration
- **Input Validation**: Client and server-side data validation
- **CORS Configuration**: Secure origin configuration
- **Helmet.js**: HTTP security headers

## 🌍 Production Deployment

### 🔄 Nginx Reverse Proxy Setup

The production configuration uses **Nginx as a reverse proxy** to serve the application on **standard port 80**:

```
Internet (port 80/443)
    ↓
🔄 Nginx Reverse Proxy
    ├── / → Frontend Next.js (port 3017 internal)
    ├── /api/ → Backend Express (port 5017 internal)
    └── /health → Health Check API
```

### 🚀 Production Startup

#### Automatic Method (Recommended)
```bash
# Automatic script with complete verification and setup
./start-production.sh
```

#### Manual Method
```bash
# 1. Setup environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 2. Deploy with Nginx proxy
docker compose -f docker-compose.prod.yml up -d --build

# 3. Verify service status
docker compose -f docker-compose.prod.yml ps

# 4. Test endpoints
curl -f http://localhost/health      # API
curl -f http://localhost/           # Frontend
```

### 🛡️ SSL Configuration (Optional)

```bash
# Generate self-signed certificates (testing)
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/private.key \
    -out ssl/cert.pem \
    -subj "/CN=localhost"

# Enable SSL configuration
cp nginx/nginx-ssl.conf nginx/nginx.conf
docker compose -f docker-compose.prod.yml restart nginx
```

### 📊 Production Monitoring

```bash
# Real-time logs
docker compose -f docker-compose.prod.yml logs -f

# Health checks
curl -f http://localhost/health

# Performance monitoring
docker stats
```

### 🔧 Service Management

```bash
# Start production
docker compose -f docker-compose.prod.yml up -d

# Stop production
docker compose -f docker-compose.prod.yml down

# Update and rebuild
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

## 📚 Additional Documentation

- **[QUICK_SETUP.md](./QUICK_SETUP.md)**: One-command production deployment guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Complete deployment and production configuration guide
- **[COSMOS_INTEGRATION_SUMMARY.md](./COSMOS_INTEGRATION_SUMMARY.md)**: Web3 implementation details
- **[UI_IMPROVEMENTS_SUMMARY.md](./UI_IMPROVEMENTS_SUMMARY.md)**: UI/UX improvements documentation

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is distributed under the MIT License. See the `LICENSE` file for details.

## 🙏 Acknowledgments

- **Cosmos Ecosystem**: For the interoperable blockchain ecosystem
- **Stargaze**: For the NFT platform
- **Keplr Team**: For the wallet and integration
- **2048 Original**: Inspiration from Gabriele Cirulli's original game

---

## 🌟 Project Status

**🎉 PRODUCTION-READY**: All core features are implemented and tested!

- ✅ **Complete MVP**: Functional game with leaderboard
- ✅ **Web3 Integration**: Keplr + Stargaze fully integrated  
- ✅ **Professional UI**: Enterprise-level design and animations
- ✅ **Mobile Optimized**: Native mobile experience
- ✅ **NFT Rewards**: Real blockchain reward system

**🚀 Ready for launch in the Cosmos ecosystem!**