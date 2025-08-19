# Cosmos 2048

A full-stack 2048 game with Cosmos theme featuring leaderboards and future NFT minting capabilities.

## Quick Start

1. **Setup environment files:**
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

2. **Start with Docker:**
   ```bash
   docker compose up -d --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:3017
   - API Health: http://localhost:5017/health
   - MongoDB: localhost:27017

## Architecture

- **Frontend**: Next.js (JavaScript) on port 3017
- **Backend**: Express + MongoDB on port 5017  
- **Database**: MongoDB on port 27017

## API Endpoints

### Phase 1 (MVP - Implemented)

- `GET /health` - API health check
- `POST /auth/guest` - Create guest user and get JWT token
- `POST /auth/wallet` - Wallet auth (placeholder for ADR-036)
- `POST /scores` - Submit game score (requires auth)
- `GET /leaderboard` - Get best scores leaderboard

### Phase 2 (Stubs - Ready for implementation)

- `POST /wheel/spin` - Spin wheel of fortune (stub)
- `POST /mint/badge` - Mint NFT badge on Stargaze (stub)

## Game Features

- **2048 Gameplay**: Classic 2048 mechanics with keyboard controls
- **Guest Login**: Quick start without wallet connection
- **Score Tracking**: Submit and track personal best scores
- **Leaderboard**: Global ranking of best players
- **Responsive Design**: Works on desktop and mobile

## Development

### Local Development (without Docker)

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

## Roadmap - Phase 2

- **Keplr Integration**: Real wallet connection using ADR-036
- **Stargaze NFTs**: Actual minting of badges and collectibles
- **Wheel of Fortune**: Reward system with NFT prizes
- **Cosmos Theming**: Token-based tile designs (ATOM, OSMO, JUNO, etc.)

## Project Structure

```
cosmos-2048/
├── docker-compose.yml
├── README.md
├── apps/
│   ├── web/                 # Next.js Frontend
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── app/page.js      # Main game page
│   │   ├── components/      # React components
│   │   └── lib/            # Game logic
│   └── api/                # Express Backend
│       ├── Dockerfile
│       ├── package.json
│       └── src/
│           ├── server.js
│           ├── models/     # Mongoose models
│           ├── routes/     # API routes
│           └── utils/      # JWT utilities
```