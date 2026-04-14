// ============================================================
// AI Prediction Module — Moving Average Crossover + RSI + Vol
// In production, replace with Python ML microservice or an LLM
// ============================================================
const { generateHistory, calcRSI, calcSMA, calcVolatility } = require('./stockController');

// POST /api/predict  { symbol }
const predict = (req, res) => {
  try {
    const { symbol } = req.body;
    if (!symbol) return res.status(400).json({ message: 'Symbol required' });

    const hist = generateHistory(symbol.toUpperCase(), 252);
    const closes = hist.map(h => h.close);

    const sma20  = calcSMA(closes, 20);
    const sma50  = calcSMA(closes, 50);
    const sma200 = calcSMA(closes, 200);
    const rsi    = calcRSI(closes);
    const vol    = calcVolatility(closes);
    const price  = closes[closes.length - 1];

    // --- Scoring System ---
    let score = 0; // -10 to +10
    const signals = [];

    // 1. Golden/Death Cross
    if (sma20 > sma50) { score += 2; signals.push({ label: 'Golden Cross (20>50 SMA)', type: 'bullish' }); }
    else { score -= 2; signals.push({ label: 'Death Cross (20<50 SMA)', type: 'bearish' }); }

    // 2. Price vs SMA200
    if (price > sma200) { score += 2; signals.push({ label: 'Price above 200-SMA (Uptrend)', type: 'bullish' }); }
    else { score -= 2; signals.push({ label: 'Price below 200-SMA (Downtrend)', type: 'bearish' }); }

    // 3. RSI signals
    if (rsi < 30) { score += 3; signals.push({ label: `RSI Oversold (${rsi})`, type: 'bullish' }); }
    else if (rsi > 70) { score -= 3; signals.push({ label: `RSI Overbought (${rsi})`, type: 'bearish' }); }
    else if (rsi > 50) { score += 1; signals.push({ label: `RSI Bullish Zone (${rsi})`, type: 'bullish' }); }
    else { score -= 1; signals.push({ label: `RSI Bearish Zone (${rsi})`, type: 'bearish' }); }

    // 4. Volatility
    if (vol < 20) { score += 1; signals.push({ label: 'Low Volatility (stable)', type: 'neutral' }); }
    else if (vol > 40) { score -= 1; signals.push({ label: 'High Volatility (risky)', type: 'bearish' }); }

    // --- Recommendation ---
    let recommendation, trend;
    if (score >= 4)       { recommendation = 'BUY';  trend = 'UP'; }
    else if (score <= -4) { recommendation = 'SELL'; trend = 'DOWN'; }
    else                  { recommendation = 'HOLD'; trend = score > 0 ? 'UP' : 'DOWN'; }

    // --- 30-day price projection ---
    const dailyReturn = (sma20 - sma200) / sma200 / 200; // implied drift
    const forecast = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() + (i + 1) * 86400000).toISOString().split('T')[0],
      predicted: +(price * Math.pow(1 + dailyReturn, i + 1) * (1 + (Math.random() - 0.5) * 0.005)).toFixed(2),
      isForecast: true
    }));

    const predictedPrice = forecast[forecast.length - 1].predicted;
    const growthPercent  = +((predictedPrice - price) / price * 100).toFixed(2);
    const confidence     = Math.min(95, Math.max(40, 50 + Math.abs(score) * 5));

    res.json({
      symbol: symbol.toUpperCase(), currentPrice: +price.toFixed(2),
      predictedPrice, growthPercent, confidence,
      recommendation, trend, score,
      signals, sma20, sma50, sma200, rsi, volatility: vol,
      forecast,
      history: hist.slice(-60).map(h => ({ date: h.date, actual: h.close, isForecast: false }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { predict };
