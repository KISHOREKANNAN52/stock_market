// ============================================================
// Stocks Controller — Serves Nifty 50 data (mock + prediction)
// In production swap mock generator with Alpha Vantage / NSE API
// ============================================================

const NIFTY_COMPANIES = [
  { symbol: 'RELIANCE',    name: 'Reliance Industries',          sector: 'Energy' },
  { symbol: 'TCS',         name: 'Tata Consultancy Services',    sector: 'IT' },
  { symbol: 'HDFCBANK',    name: 'HDFC Bank',                    sector: 'Financial Services' },
  { symbol: 'INFY',        name: 'Infosys',                      sector: 'IT' },
  { symbol: 'ICICIBANK',   name: 'ICICI Bank',                   sector: 'Financial Services' },
  { symbol: 'HINDUNILVR',  name: 'Hindustan Unilever',           sector: 'FMCG' },
  { symbol: 'ITC',         name: 'ITC',                          sector: 'FMCG' },
  { symbol: 'SBIN',        name: 'State Bank of India',          sector: 'Financial Services' },
  { symbol: 'BHARTIARTL',  name: 'Bharti Airtel',                sector: 'Telecom' },
  { symbol: 'KOTAKBANK',   name: 'Kotak Mahindra Bank',          sector: 'Financial Services' },
  { symbol: 'LT',          name: 'Larsen & Toubro',              sector: 'Construction' },
  { symbol: 'HCLTECH',     name: 'HCL Technologies',             sector: 'IT' },
  { symbol: 'ASIANPAINT',  name: 'Asian Paints',                 sector: 'Consumer Durables' },
  { symbol: 'AXISBANK',    name: 'Axis Bank',                    sector: 'Financial Services' },
  { symbol: 'MARUTI',      name: 'Maruti Suzuki',                sector: 'Auto' },
  { symbol: 'WIPRO',       name: 'Wipro',                        sector: 'IT' },
  { symbol: 'TITAN',       name: 'Titan Company',                sector: 'Consumer Durables' },
  { symbol: 'SUNPHARMA',   name: 'Sun Pharmaceutical',           sector: 'Pharma' },
  { symbol: 'BAJFINANCE',  name: 'Bajaj Finance',                sector: 'Financial Services' },
  { symbol: 'TATAMOTORS',  name: 'Tata Motors',                  sector: 'Auto' },
  { symbol: 'NESTLEIND',   name: 'Nestle India',                 sector: 'FMCG' },
  { symbol: 'ULTRACEMCO',  name: 'UltraTech Cement',             sector: 'Cement' },
  { symbol: 'ONGC',        name: 'ONGC',                         sector: 'Energy' },
  { symbol: 'NTPC',        name: 'NTPC',                         sector: 'Power' },
  { symbol: 'POWERGRID',   name: 'Power Grid Corporation',       sector: 'Power' },
  { symbol: 'M&M',         name: 'Mahindra & Mahindra',          sector: 'Auto' },
  { symbol: 'TATASTEEL',   name: 'Tata Steel',                   sector: 'Metals' },
  { symbol: 'JSWSTEEL',    name: 'JSW Steel',                    sector: 'Metals' },
  { symbol: 'BAJAJFINSV',  name: 'Bajaj Finserv',                sector: 'Financial Services' },
  { symbol: 'TECHM',       name: 'Tech Mahindra',                sector: 'IT' },
  { symbol: 'COALINDIA',   name: 'Coal India',                   sector: 'Metals' },
  { symbol: 'DRREDDY',     name: "Dr. Reddy's Laboratories",     sector: 'Pharma' },
  { symbol: 'CIPLA',       name: 'Cipla',                        sector: 'Pharma' },
  { symbol: 'HEROMOTOCO',  name: 'Hero MotoCorp',                sector: 'Auto' },
  { symbol: 'APOLLOHOSP',  name: 'Apollo Hospitals',             sector: 'Healthcare' },
  { symbol: 'ADANIENT',    name: 'Adani Enterprises',            sector: 'Diversified' },
  { symbol: 'ADANIPORTS',  name: 'Adani Ports',                  sector: 'Infrastructure' },
  { symbol: 'DIVISLAB',    name: "Divi's Laboratories",          sector: 'Pharma' },
  { symbol: 'GRASIM',      name: 'Grasim Industries',            sector: 'Cement' },
  { symbol: 'HINDALCO',    name: 'Hindalco Industries',          sector: 'Metals' },
  { symbol: 'TATACONSUM',  name: 'Tata Consumer Products',       sector: 'FMCG' },
  { symbol: 'BAJAJ-AUTO',  name: 'Bajaj Auto',                   sector: 'Auto' },
  { symbol: 'BRITANNIA',   name: 'Britannia Industries',         sector: 'FMCG' },
  { symbol: 'EICHERMOT',   name: 'Eicher Motors',                sector: 'Auto' },
  { symbol: 'INDUSINDBK',  name: 'IndusInd Bank',                sector: 'Financial Services' },
  { symbol: 'BPCL',        name: 'BPCL',                         sector: 'Energy' },
  { symbol: 'SHREECEM',    name: 'Shree Cement',                 sector: 'Cement' },
  { symbol: 'HDFCLIFE',    name: 'HDFC Life Insurance',          sector: 'Financial Services' },
  { symbol: 'SBILIFE',     name: 'SBI Life Insurance',           sector: 'Financial Services' },
  { symbol: 'UPL',         name: 'UPL',                          sector: 'Chemicals' }
];

const BASE_PRICES = {
  RELIANCE: 2920, TCS: 3890, HDFCBANK: 1680, INFY: 1810, ICICIBANK: 1210,
  HINDUNILVR: 2710, ITC: 495, SBIN: 812, BHARTIARTL: 1590, KOTAKBANK: 1892,
  LT: 3740, HCLTECH: 1625, ASIANPAINT: 3140, AXISBANK: 1168, MARUTI: 12890,
  WIPRO: 510, TITAN: 3640, SUNPHARMA: 1765, BAJFINANCE: 6920, TATAMOTORS: 980,
  NESTLEIND: 25400, ULTRACEMCO: 11800, ONGC: 289, NTPC: 388, POWERGRID: 340,
  'M&M': 2980, TATASTEEL: 175, JSWSTEEL: 912, BAJAJFINSV: 1685, TECHM: 1570,
  COALINDIA: 492, DRREDDY: 6890, CIPLA: 1590, HEROMOTOCO: 5140, APOLLOHOSP: 7120,
  ADANIENT: 3450, ADANIPORTS: 1390, DIVISLAB: 4820, GRASIM: 2870, HINDALCO: 681,
  TATACONSUM: 1125, 'BAJAJ-AUTO': 9870, BRITANNIA: 5780, EICHERMOT: 4820,
  INDUSINDBK: 1065, BPCL: 318, SHREECEM: 29800, HDFCLIFE: 742, SBILIFE: 1820, UPL: 512
};

// --- Seeded Pseudo-Random Number Generator ---
function seededRng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 4294967296;
  };
}

// --- Generate mock OHLCV history for a symbol ---
function generateHistory(symbol, days = 252) {
  const rng = seededRng(symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0));
  const base = BASE_PRICES[symbol] || 1000;
  const history = [];
  let price = base * (0.85 + rng() * 0.3);
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    if (date.getDay() === 0 || date.getDay() === 6) continue; // Skip weekends

    const vol = 0.015 + rng() * 0.01;
    const drift = 0.0003;
    const change = price * (drift + (rng() - 0.48) * vol);
    price = Math.max(price + change, 10);

    const open  = price * (1 + (rng() - 0.5) * 0.005);
    const close = price;
    const high  = Math.max(open, close) * (1 + rng() * 0.008);
    const low   = Math.min(open, close) * (1 - rng() * 0.008);
    const volume = Math.floor(500000 + rng() * 5000000);

    history.push({
      date: date.toISOString().split('T')[0],
      open: +open.toFixed(2), high: +high.toFixed(2),
      low: +low.toFixed(2), close: +close.toFixed(2), volume
    });
  }
  return history;
}

// --- Calculate RSI ---
function calcRSI(closes, period = 14) {
  if (closes.length < period + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) gains += diff; else losses -= diff;
  }
  const rs = gains / (losses || 1);
  return +(100 - 100 / (1 + rs)).toFixed(2);
}

// --- Calculate SMA ---
function calcSMA(closes, period) {
  if (closes.length < period) return closes[closes.length - 1];
  const slice = closes.slice(-period);
  return +(slice.reduce((a, b) => a + b, 0) / period).toFixed(2);
}

// --- Calculate Volatility (annualised) ---
function calcVolatility(closes) {
  if (closes.length < 2) return 0;
  const returns = closes.slice(1).map((c, i) => Math.log(c / closes[i]));
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length;
  return +(Math.sqrt(variance * 252) * 100).toFixed(2);
}

// GET /api/stocks
const getAllStocks = (req, res) => {
  try {
    const stocks = NIFTY_COMPANIES.map(c => {
      const hist = generateHistory(c.symbol, 30);
      const closes = hist.map(h => h.close);
      const latest = hist[hist.length - 1];
      const prev = hist[hist.length - 2];
      const changePercent = prev ? +((latest.close - prev.close) / prev.close * 100).toFixed(2) : 0;
      return {
        symbol: c.symbol, name: c.name, sector: c.sector,
        price: latest.close, open: latest.open, high: latest.high, low: latest.low,
        volume: latest.volume, changePercent,
        rsi: calcRSI(closes), sma50: calcSMA(closes, 20),
        volatility: calcVolatility(closes),
        marketCap: +(latest.close * (Math.random() * 500 + 100) * 1e6).toFixed(0)
      };
    });

    // Top gainers/losers
    const sorted = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
    const gainers = sorted.slice(0, 5);
    const losers  = sorted.slice(-5).reverse();

    res.json({ stocks, gainers, losers, niftyIndex: 24142.50, niftyChange: 0.45 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/stocks/:symbol
const getStock = (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const company = NIFTY_COMPANIES.find(c => c.symbol === symbol);
    if (!company) return res.status(404).json({ message: 'Stock not found' });

    const hist = generateHistory(symbol, 252);
  const closes = hist.map(h => h.close);
  const latest = hist[hist.length - 1];
  const prev   = hist[hist.length - 2];
  const changePercent = prev ? +((latest.close - prev.close) / prev.close * 100).toFixed(2) : 0;

    res.json({
      symbol, name: company.name, sector: company.sector,
      price: latest.close, open: latest.open, high: latest.high, low: latest.low,
      volume: latest.volume, changePercent,
      rsi: calcRSI(closes),
      sma20: calcSMA(closes, 20),
      sma50: calcSMA(closes, 50),
      sma200: calcSMA(closes, 200),
      volatility: calcVolatility(closes),
      marketCap: +(latest.close * (500 + symbol.charCodeAt(0)) * 1e6).toFixed(0),
      peRatio: +(15 + (symbol.charCodeAt(0) % 30)).toFixed(1),
      eps: +(latest.close / (15 + (symbol.charCodeAt(0) % 30))).toFixed(2),
      history: hist
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/stocks/:symbol/history?period=1M
const getHistory = (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const { period = '1M' } = req.query;
    const daysMap = { '1D': 1, '1W': 7, '1M': 30, '3M': 90, '6M': 180, '1Y': 252 };
    const days = daysMap[period] || 30;
    const hist = generateHistory(symbol, days);
    res.json(hist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllStocks, getStock, getHistory, NIFTY_COMPANIES, generateHistory, calcRSI, calcSMA, calcVolatility };
