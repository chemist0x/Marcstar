# 🌍 BEPPE — A autonomous agent on a mission to end World Hunger

> *Most AI agents trade tokens and post memes. Beppe has a different job.*

Beppe is a fully autonomous AI agent powered by Claude (OpenClaw) whose sole purpose is to help end world hunger. It earns money, buys grocery gift cards, and donates them to food banks — no humans required.

---

## What Beppe Does

```
earn funds → check food bank needs → buy gift cards → donate → repeat
```

Every cycle, Beppe:
1. **Checks its wallet** — balance, spending limits, reserves
2. **Finds food banks** in highest-need areas via directory lookup
3. **Purchases digital gift cards** from grocery retailers (Walmart, Kroger, Safeway, etc.)
4. **Donates them** to verified food banks
5. **Logs everything** with full transparency

---

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/yourname/beppe
cd beppe
npm install

# 2. Set your API key
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# 3. Run a single cycle
npm start

# 4. Run autonomously (every 60 minutes)
npm run auto

# 5. Launch the mission control dashboard
npm run dashboard
# → Open http://localhost:3000
```

---

## Architecture

```
beppe/
├── index.js                    # Entry point / CLI
├── src/
│   ├── agent/
│   │   └── beppe.js            # 🧠 Core agent loop (OpenClaw)
│   ├── wallet/
│   │   └── wallet.js           # 💰 Self-managed wallet 
│   ├── actions/
│   │   ├── registry.js         # 🔧 Tool registry (Claude tools)
│   │   ├── foodBankDirectory.js# 🏦 Food bank lookup
│   │   └── giftCardPurchaser.js# 🎁 Gift card API
│   ├── ui/
│   │   ├── server.js           # 🌐 Dashboard API
│   │   └── public/index.html   # 📊 Mission control UI
│   └── utils/
│       ├── logger.js           # Console logging
│       └── missionLog.js       # Persistent cycle log
└── data/                       # Auto-created: ledger, donations, logs
```

---

## Under the Hood

### OpenClaw (Claude Agentic Loop)
Beppe uses Claude's tool-use API in a loop:
- Claude decides what to do next
- Calls tools (check_wallet, find_food_banks, purchase_gift_card, donate_gift_card)
- Receives results, reasons about them, acts again
- Stops when the cycle is complete

### Self-Managed Wallet
- Local JSON ledger tracks every transaction
- Built-in spending rules: max 40% per cycle, 10% reserve always maintained
- All credits and debits are timestamped and permanent

### Tools Available to Beppe
| Tool | What it does |
|------|-------------|
| `check_wallet` | Balance, limits, recent transactions |
| `find_food_banks` | Search by region, sorted by need score |
| `purchase_gift_card` | Buy from Walmart, Kroger, Safeway, etc. |
| `donate_gift_card` | Send code to food bank |
| `get_mission_stats` | Total meals, banks helped, donations |
| `simulate_earnings` | Earn via affiliate/grants/donations |

---

## Production Integrations

Replace the simulated layers with real APIs:

| Layer | Demo | Production |
|-------|------|-----------|
| Gift Cards | codes | [CashStar](https://www.cashstar.com) / Blackhawk Network |
| Food Banks | Static list | [Feeding America API](https://www.feedingamerica.org) |
| Wallet | Local JSON | Phantom Wallet |
| Earnings | Simulated | Real affiliate links, donation forms |

---

## Mission Control Dashboard

Run `npm run dashboard` to open the live UI:
- 📊 Real-time wallet balance
- 🍽️ Animated meals counter
- 📋 Full transaction feed
- 🏦 Food banks helped
- ▶ Manual cycle trigger

---

## Requirements
- Node.js 18+
- Anthropic API key (`ANTHROPIC_API_KEY`)

---

## License
MIT — Fork it, deploy it, feed people.

---

*"Every meal matters."* — Beppe
