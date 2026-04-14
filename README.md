# 📊 Nifty 50 Stock Market Analysis System

A **production-ready full-stack web application** for analysing Nifty 50 stocks with real-time data, interactive charts, AI-powered predictions, MongoDB-backed portfolio management, and JWT authentication.

---

## 🏗️ Tech Stack

| Layer      | Technology                              |
|------------|------------------------------------------|
| Frontend   | React 18 + Vite + TypeScript             |
| Styling    | Tailwind CSS + Custom CSS Variables      |
| Charts     | Recharts                                 |
| State      | Zustand                                  |
| Routing    | React Router v6                          |
| Backend    | Node.js + Express (MVC)                  |
| Database   | MongoDB + Mongoose                       |
| Auth       | JWT (JSON Web Tokens) + bcryptjs         |
| HTTP       | Axios (with auth interceptors)           |

---

## 📂 Project Structure

```
nifty50/
├── client/                     # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx        # Auth (Login / Register)
│   │   │   ├── Dashboard.tsx        # Market overview, gainers/losers
│   │   │   ├── StockDetail.tsx      # OHLCV chart + technicals
│   │   │   ├── PortfolioPage.tsx    # MongoDB-backed portfolio
│   │   │   ├── PredictionPage.tsx   # AI BUY/HOLD/SELL signals
│   │   │   ├── WatchlistPage.tsx    # Saved watchlist
│   │   │   ├── NewsPage.tsx         # Market news feed
│   │   │   └── MarketReportPage.tsx # Full NIFTY 50 report
│   │   ├── components/
│   │   │   └── Layout.tsx           # Sidebar + header shell
│   │   ├── context/
│   │   │   └── authStore.ts         # Zustand auth state
│   │   ├── utils/
│   │   │   └── api.ts               # Axios client
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript interfaces
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
└── server/                     # Node.js + Express backend
    ├── models/
    │   ├── User.js              # Users collection
    │   ├── Portfolio.js         # Portfolio collection
    │   ├── Watchlist.js         # Watchlist collection
    │   ├── Alert.js             # Price alerts collection
    │   └── StockCache.js        # Optional cache (TTL 15min)
    ├── controllers/
    │   ├── authController.js    # Register / Login / Me
    │   ├── stockController.js   # OHLCV data + technicals
    │   ├── portfolioController.js
    │   ├── predictController.js # MA crossover + RSI AI
    │   ├── watchlistController.js
    │   └── newsController.js
    ├── routes/
    │   ├── auth.js
    │   ├── stocks.js
    │   ├── portfolio.js
    │   ├── watchlist.js
    │   ├── alerts.js
    │   ├── predict.js
    │   └── news.js
    ├── middleware/
    │   └── auth.js              # JWT protect middleware
    ├── config/
    │   └── db.js                # Mongoose connection
    ├── .env
    ├── index.js
    └── package.json
```

---

## 🚀 Quick Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### 1. Clone / extract the project

### 2. Setup Backend
```bash
cd server
npm install
# Edit .env — set your MONGO_URI
npm run dev        # Starts on http://localhost:5000
```

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev        # Starts on http://localhost:5173
```

---

## ⚙️ Environment Variables

**server/.env**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/nifty50
JWT_SECRET=your_super_secret_key_here
CLIENT_URL=http://localhost:5173
```

For **MongoDB Atlas**, replace MONGO_URI with:
```
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/nifty50
```

---

## 🔗 REST API Endpoints

| Method | Endpoint                  | Auth | Description                    |
|--------|---------------------------|------|--------------------------------|
| POST   | /api/auth/register        | ❌   | Register new user              |
| POST   | /api/auth/login           | ❌   | Login, returns JWT token       |
| GET    | /api/auth/me              | ✅   | Current user info              |
| GET    | /api/stocks               | ❌   | All NIFTY 50 + gainers/losers  |
| GET    | /api/stocks/:symbol       | ❌   | Stock detail + history         |
| GET    | /api/stocks/:symbol/history?period=1M | ❌ | OHLCV history    |
| POST   | /api/predict              | ❌   | AI prediction for symbol       |
| GET    | /api/portfolio            | ✅   | User's portfolio with P&L      |
| POST   | /api/portfolio            | ✅   | Add stock to portfolio         |
| DELETE | /api/portfolio/:symbol    | ✅   | Remove stock from portfolio    |
| GET    | /api/watchlist            | ✅   | User's watchlist               |
| POST   | /api/watchlist            | ✅   | Add to watchlist               |
| DELETE | /api/watchlist/:symbol    | ✅   | Remove from watchlist          |
| GET    | /api/alerts               | ✅   | All price alerts               |
| POST   | /api/alerts               | ✅   | Create price alert             |
| DELETE | /api/alerts/:id           | ✅   | Delete alert                   |
| GET    | /api/news                 | ❌   | Market news (category filter)  |
| GET    | /api/health               | ❌   | Health check                   |

---

## 🧠 AI Prediction Logic

The prediction engine (`/api/predict`) uses a **scoring system (-10 to +10)**:

| Signal                    | Weight |
|---------------------------|--------|
| Golden Cross (SMA20>SMA50)| +2     |
| Price above SMA200        | +2     |
| RSI < 30 (Oversold)       | +3     |
| RSI > 70 (Overbought)     | -3     |
| RSI 50–70 (Bullish zone)  | +1     |
| Low volatility (<20%)     | +1     |
| High volatility (>40%)    | -1     |

**Recommendation thresholds:**
- Score ≥ 4 → **BUY**
- Score ≤ -4 → **SELL**
- Otherwise → **HOLD**

---

## 📦 MongoDB Collections

| Collection  | Purpose                              |
|-------------|--------------------------------------|
| users       | Auth: name, email, hashed password   |
| portfolios  | User portfolio items (per-user doc)  |
| watchlists  | User watchlist symbols               |
| alerts      | Price alerts with trigger conditions |
| stockcaches | Optional: TTL cache for API calls    |

---

## ✨ Features

- ✅ JWT Auth (Login / Register)
- ✅ Live NIFTY index ticker simulation
- ✅ All 50 stocks with OHLCV history
- ✅ Interactive price/volume/indicator charts (period: 1W–1Y)
- ✅ Technical analysis: RSI, SMA20/50/200, Volatility
- ✅ AI Prediction: BUY / HOLD / SELL with 30-day price forecast
- ✅ Portfolio: Add, track, P&L, sector allocation, export CSV
- ✅ Watchlist: Save and monitor favourite stocks
- ✅ Price Alerts: Set target price alerts
- ✅ Market News: Filtered by category + sentiment
- ✅ Market Report: Full sortable table + sector performance chart
- ✅ Responsive dark UI with sidebar navigation
- ✅ Loading states, error handling, toast feedback

---

## 🔮 To upgrade to real data

Replace the mock `generateHistory()` in `stockController.js` with:
- **Alpha Vantage** (free tier): `https://www.alphavantage.co/documentation/`
- **Yahoo Finance** unofficial: `yahoo-finance2` npm package
- **NSE India** unofficial: `https://github.com/shaktiwadekar9/nse-india-api`

---

> Built for educational purposes. Not financial advice.
