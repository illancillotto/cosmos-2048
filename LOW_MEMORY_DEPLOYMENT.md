# 🔧 Low Memory Deployment - Cosmos 2048

## 🎯 For VPS with 1GB RAM

Se hai un VPS con solo 1GB di RAM, usa questa modalità ottimizzata che:

### ✅ **Ottimizzazioni Applicate:**
- **Build sequenziale** dei container (evita OOM kills)
- **Limiti di memoria** su tutti i servizi
- **Swap file automatico** (1GB) se mancante  
- **MongoDB cache ridotta** a 256MB
- **Node.js heap limitato** a 256MB per servizio
- **Nginx ottimizzato** con meno worker e cache ridotta
- **Mode development** per il frontend (più veloce da compilare)

## 🚀 **Deployment Low Memory**

```bash
# Usa lo script ottimizzato per 1GB RAM
./start-low-memory.sh
```

## 📊 **Utilizzo Memoria Previsto:**
- **MongoDB**: ~128-256MB
- **API Backend**: ~150-300MB  
- **Frontend**: ~150-300MB
- **Nginx**: ~32-64MB
- **Sistema + Docker**: ~200-300MB
- **Totale**: ~660-1220MB (con swap come buffer)

## 🛠️ **Se hai problemi di memoria:**

```bash
# Monitora l'utilizzo memoria in tempo reale
docker stats

# Verifica la memoria di sistema
free -h

# Controlla se lo swap è attivo
swapon --show

# Pulisci risorse Docker inutilizzate
docker system prune -f
```

## ⚡ **Performance Tips:**

### **1. Riduci il carico:**
- Usa il gioco in orari non di picco per il primo avvio
- Evita più utenti simultanei durante il build

### **2. Ottimizza il sistema:**
```bash
# Aumenta lo swap se necessario
sudo fallocate -l 2G /swapfile2
sudo chmod 600 /swapfile2
sudo mkswap /swapfile2
sudo swapon /swapfile2
```

### **3. Monitora le performance:**
```bash
# Controlla i container più "pesanti"
docker stats --format "table {{.Name}}\t{{.MemUsage}}\t{{.CPUPerc}}"

# Logs per problemi di memoria
docker compose -f docker-compose.low-memory.yml logs
```

## 🔄 **Comandi Utili:**

```bash
# Avvia modalità low-memory
./start-low-memory.sh

# Ferma i servizi
docker compose -f docker-compose.low-memory.yml down

# Restart singolo servizio
docker compose -f docker-compose.low-memory.yml restart api

# Logs in tempo reale
docker compose -f docker-compose.low-memory.yml logs -f

# Status dei container
docker compose -f docker-compose.low-memory.yml ps
```

## ⚠️ **Limitazioni Modalità Low-Memory:**

- **Performance ridotta** rispetto alla modalità standard
- **Frontend in dev mode** (non ottimizzato per produzione)
- **Cache limitata** per risparmiare RAM  
- **Concorrenza ridotta** (meno connessioni simultanee)
- **Timeout più brevi** per liberare risorse rapidamente

## 🎯 **Quando usare questa modalità:**

✅ **VPS con 1GB RAM**  
✅ **Server di sviluppo/testing**  
✅ **Demo o proof-of-concept**  
✅ **Budget limitato**  

❌ **Produzione ad alto traffico**  
❌ **Più di 10 utenti simultanei**  
❌ **Applicazioni mission-critical**

---

**🌟 Questa modalità ti permette di far girare Cosmos 2048 anche con risorse limitate!**