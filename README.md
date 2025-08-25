# 🌌 Cosmos 2048

Una esperienza di gioco Web3 completa che combina la meccanica classica del 2048 con l'ecosistema Cosmos, offrendo NFT rewards reali e un'interfaccia utente di livello professionale.

## ✨ Caratteristiche Principali

🎮 **Gameplay Avanzato**: 2048 con tessere dei token dell'ecosistema Cosmos  
🔗 **Integrazione Keplr**: Autenticazione wallet ADR-036 completa  
🎡 **Wheel of Fortune**: Sistema di premi interattivo con ricompense NFT  
🏆 **Minting NFT Reale**: Minting di badge CW721 su Stargaze  
📱 **Design Responsivo**: Esperienza ottimizzata per mobile e desktop  
🎨 **UI Professionale**: Animazioni fluide e design moderno  

## 🚀 Avvio Rapido

1. **Configura i file di ambiente:**
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

2. **Avvia con Docker:**
   ```bash
   docker compose up -d --build
   ```

3. **Accedi all'applicazione:**
   - Frontend: http://localhost:3017
   - API Health: http://localhost:5017/health
   - MongoDB: localhost:27017

## 🏗️ Architettura

- **Frontend**: Next.js 14 + Tailwind CSS + Framer Motion (porta 3017)
- **Backend**: Express.js + MongoDB + JWT Auth (porta 5017)
- **Database**: MongoDB (porta 27017)
- **Blockchain**: Integrazione Stargaze per NFT minting
- **Wallet**: Keplr con supporto ADR-036

## 🎮 Flusso di Gioco Completo

1. **Connetti Wallet Keplr** → Autenticazione ADR-036 sicura
2. **Gioca a 2048 Cosmos** → Tessere dei token dell'ecosistema
3. **Fine Partita** → Modal con opzioni di reward
4. **Gira la Ruota** → Wheel of Fortune interattiva
5. **Vinci Premio** → Minting automatico di NFT badge
6. **Collezione Badge** → Visualizza i tuoi NFT nella galleria

## 🎯 API Endpoints

### Autenticazione
- `GET /health` - Health check API
- `POST /auth/guest` - Crea utente guest con JWT token
- `POST /auth/wallet` - Autenticazione wallet Keplr (ADR-036)

### Gameplay  
- `POST /scores` - Invia punteggio partita (richiede auth)
- `GET /leaderboard` - Classifica globale migliori giocatori

### Web3 Features
- `POST /wheel/spin` - Gira la ruota della fortuna
- `POST /mint/badge` - Minting NFT badge su Stargaze

## 🛠️ Sviluppo Locale

### Sviluppo senza Docker

1. **Avvia MongoDB:**
   ```bash
   docker run -d -p 27017:27017 mongo:7
   ```

2. **Avvia API:**
   ```bash
   cd apps/api
   npm install
   npm run dev
   ```

3. **Avvia Frontend:**
   ```bash
   cd apps/web  
   npm install
   npm run dev
   ```

### Prerequisiti per Testing
- **Estensione Keplr** installata nel browser
- **Network Stargaze** aggiunto a Keplr  
- **Token STARS** nel wallet per le fee di gas

## 🌌 Token Cosmos nell'Ecosistema

Il gioco presenta una progressione completa attraverso i principali token dell'ecosistema Cosmos:

| Valore | Token | Simbolo | Descrizione |
|--------|-------|---------|-------------|
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

## 🎁 Sistema di Reward NFT

### Rarità dei Premi
- 🥉 **Comune** (40%): Badge standard
- 🥈 **Non Comune** (30%): Badge con effetti speciali
- 🥇 **Raro** (15%): Badge premium con animazioni
- 💎 **Epico** (10%): Badge esclusivo con metadati unici
- 👑 **Leggendario** (4%): Badge ultra-raro collezionabile
- 😅 **Nessun Premio** (1%): Riprova!

## ⚙️ Configurazione

### Variabili d'Ambiente
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

## 📁 Struttura Progetto

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

## 🚀 Tecnologie Utilizzate

### Frontend
- **Next.js 14**: Framework React per produzione
- **Tailwind CSS**: Framework CSS utility-first
- **Framer Motion**: Libreria animazioni avanzate
- **CosmJS**: SDK per integrazione blockchain Cosmos
- **Keplr Types**: Tipizzazioni per wallet Keplr

### Backend  
- **Express.js**: Framework web minimalista
- **MongoDB + Mongoose**: Database NoSQL e ODM
- **JWT**: Autenticazione JSON Web Token
- **bcryptjs**: Hashing password sicuro
- **CORS + Helmet**: Sicurezza e CORS

### Blockchain
- **Stargaze**: Network per NFT minting
- **CW721**: Standard NFT Cosmos
- **ADR-036**: Autenticazione off-chain sicura

## 🎯 Features Completate

### ✅ Core Game
- [x] Meccaniche 2048 complete con controlli touch/keyboard
- [x] Sistema di punteggio e best score tracking
- [x] Responsive design per mobile e desktop
- [x] Animazioni fluide e feedback visivo

### ✅ Integrazione Web3
- [x] Connessione Keplr wallet con ADR-036
- [x] Autenticazione sicura off-chain
- [x] Minting NFT reale su Stargaze
- [x] Gestione stati wallet e transazioni

### ✅ Sistema Rewards
- [x] Wheel of Fortune interattiva
- [x] Sistema rarità premi con pesi probabilistici
- [x] Minting automatico NFT badge
- [x] Galleria collezione NFT utente

### ✅ UI/UX Professionale
- [x] Design system coerente con tema Cosmos
- [x] Animazioni Framer Motion per micro-interazioni
- [x] Componenti modulari e riutilizzabili
- [x] Accessibilità e performance ottimizzate

## 📈 Performance & Ottimizzazioni

- **60 FPS**: Animazioni fluide garantite
- **Mobile-First**: Design responsive ottimizzato
- **Bundle Size**: Ottimizzazioni Next.js per produzione
- **Lazy Loading**: Componenti caricati on-demand
- **Error Boundaries**: Gestione errori robusta

## 🔒 Sicurezza

- **ADR-036 Compliance**: Autenticazione off-chain sicura
- **JWT Tokens**: Sessioni sicure con scadenza
- **Input Validation**: Validazione dati lato client e server
- **CORS Configuration**: Configurazione sicura delle origini
- **Helmet.js**: Headers di sicurezza HTTP

## 🌍 Deploy in Produzione

### Requisiti Pre-Deploy
1. **Smart Contract CW721** deployato su Stargaze
2. **Dominio e certificato SSL** configurati
3. **MongoDB Atlas** o istanza MongoDB produzione
4. **IPFS/Arweave** per storage metadati NFT

### Steps di Deploy
```bash
# 1. Build dell'applicazione
npm run build

# 2. Configurazione environment produzione
cp .env.example .env.production

# 3. Deploy con Docker
docker compose -f docker-compose.prod.yml up -d

# 4. Verifica health checks
curl https://your-domain.com/health
```

## 🤝 Contributing

1. Fork del repository
2. Crea feature branch (`git checkout -b feature/amazing-feature`)
3. Commit delle modifiche (`git commit -m 'Add amazing feature'`)
4. Push al branch (`git push origin feature/amazing-feature`)
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è distribuito sotto licenza MIT. Vedi il file `LICENSE` per dettagli.

## 🙏 Acknowledgments

- **Cosmos Ecosystem**: Per l'ecosistema blockchain interoperabile
- **Stargaze**: Per la piattaforma NFT
- **Keplr Team**: Per il wallet e l'integrazione
- **2048 Original**: Ispirazione dal gioco originale di Gabriele Cirulli

---

## 🌟 Status del Progetto

**🎉 PRODUZIONE-READY**: Tutte le funzionalità core sono implementate e testate!

- ✅ **MVP Completo**: Gioco funzionante con leaderboard
- ✅ **Web3 Integration**: Keplr + Stargaze completamente integrati  
- ✅ **Professional UI**: Design e animazioni di livello enterprise
- ✅ **Mobile Optimized**: Esperienza mobile nativa
- ✅ **NFT Rewards**: Sistema di premi blockchain reale

**🚀 Pronto per il lancio nel Cosmos ecosystem!**