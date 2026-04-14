const Portfolio = require('../models/Portfolio');
const { generateHistory, NIFTY_COMPANIES } = require('./stockController');

// GET /api/portfolio
const getPortfolio = async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ user: req.user._id });
    if (!portfolio) return res.json({ items: [], totalValue: 0, totalPnl: 0 });

    // Enrich with current prices
    const enriched = portfolio.items.map(item => {
      const hist = generateHistory(item.symbol, 2);
      const cmp = hist[hist.length - 1]?.close || item.buyPrice;
      const pnl = (cmp - item.buyPrice) * item.qty;
      return { ...item.toObject(), cmp: +cmp.toFixed(2), pnl: +pnl.toFixed(2) };
    });

    const totalValue = enriched.reduce((s, i) => s + i.cmp * i.qty, 0);
    const totalInvested = enriched.reduce((s, i) => s + i.buyPrice * i.qty, 0);
    const totalPnl = totalValue - totalInvested;

    res.json({ items: enriched, totalValue: +totalValue.toFixed(2), totalPnl: +totalPnl.toFixed(2), totalInvested: +totalInvested.toFixed(2) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/portfolio
const addToPortfolio = async (req, res) => {
  try {
    const { symbol, qty, buyPrice } = req.body;
    if (!symbol || !qty || !buyPrice) return res.status(400).json({ message: 'Symbol, qty, buyPrice required' });

    const upper = symbol.toUpperCase();
    const company = NIFTY_COMPANIES.find(c => c.symbol === upper);
    const name = company ? company.name : upper;
    const sector = company ? company.sector : 'Other';

    let portfolio = await Portfolio.findOne({ user: req.user._id });
    if (!portfolio) portfolio = new Portfolio({ user: req.user._id, items: [] });

    const existing = portfolio.items.find(i => i.symbol === upper);
    if (existing) {
      const totalQty = existing.qty + qty;
      existing.buyPrice = +((existing.buyPrice * existing.qty + buyPrice * qty) / totalQty).toFixed(2);
      existing.qty = totalQty;
    } else {
      portfolio.items.push({ symbol: upper, name, sector, qty, buyPrice });
    }

    await portfolio.save();
    res.status(201).json({ message: 'Stock added to portfolio', portfolio: portfolio.items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/portfolio/:symbol
const removeFromPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user._id });
    if (!portfolio) return res.status(404).json({ message: 'Portfolio not found' });

    portfolio.items = portfolio.items.filter(i => i.symbol !== req.params.symbol.toUpperCase());
    await portfolio.save();
    res.json({ message: 'Removed', items: portfolio.items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getPortfolio, addToPortfolio, removeFromPortfolio };
