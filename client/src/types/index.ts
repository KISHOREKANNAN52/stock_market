export interface StockSummary {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  changePercent: number;
  rsi: number;
  sma50: number;
  volatility: number;
  marketCap: number;
}

export interface StockDetail extends StockSummary {
  sma20: number;
  sma200: number;
  peRatio: number;
  eps: number;
  history: OHLCVBar[];
}

export interface OHLCVBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StocksResponse {
  stocks: StockSummary[];
  gainers: StockSummary[];
  losers: StockSummary[];
  niftyIndex: number;
  niftyChange: number;
}

export interface PortfolioItem {
  _id?: string;
  symbol: string;
  name: string;
  sector: string;
  qty: number;
  buyPrice: number;
  cmp: number;
  pnl: number;
}

export interface PortfolioData {
  items: PortfolioItem[];
  totalValue: number;
  totalPnl: number;
  totalInvested: number;
}

export interface PredictionResult {
  symbol: string;
  currentPrice: number;
  predictedPrice: number;
  growthPercent: number;
  confidence: number;
  recommendation: 'BUY' | 'HOLD' | 'SELL';
  trend: 'UP' | 'DOWN';
  score: number;
  signals: { label: string; type: 'bullish' | 'bearish' | 'neutral' }[];
  sma20: number;
  sma50: number;
  sma200: number;
  rsi: number;
  volatility: number;
  forecast: { date: string; predicted: number; isForecast: boolean }[];
  history: { date: string; actual: number; isForecast: boolean }[];
}

export interface NewsItem {
  id: number;
  title: string;
  source: string;
  time: string;
  category: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  url: string;
}

export interface PriceAlert {
  _id: string;
  symbol: string;
  targetPrice: number;
  condition: 'GE' | 'LE';
  triggered: boolean;
  createdAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
}
