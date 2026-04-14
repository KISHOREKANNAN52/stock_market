const Watchlist = require('../models/Watchlist');
const Alert = require('../models/Alert');

// --- WATCHLIST ---
const getWatchlist = async (req, res) => {
  try {
    const wl = await Watchlist.findOne({ user: req.user._id });
    res.json(wl ? wl.symbols : []);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const addToWatchlist = async (req, res) => {
  try {
    const { symbol } = req.body;
    let wl = await Watchlist.findOne({ user: req.user._id });
    if (!wl) wl = new Watchlist({ user: req.user._id, symbols: [] });
    if (!wl.symbols.includes(symbol.toUpperCase())) wl.symbols.push(symbol.toUpperCase());
    await wl.save();
    res.json(wl.symbols);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const removeFromWatchlist = async (req, res) => {
  try {
    const wl = await Watchlist.findOne({ user: req.user._id });
    if (!wl) return res.json([]);
    wl.symbols = wl.symbols.filter(s => s !== req.params.symbol.toUpperCase());
    await wl.save();
    res.json(wl.symbols);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// --- ALERTS ---
const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.user._id }).sort('-createdAt');
    res.json(alerts);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const createAlert = async (req, res) => {
  try {
    const { symbol, targetPrice, condition } = req.body;
    const alert = await Alert.create({ user: req.user._id, symbol, targetPrice, condition });
    res.status(201).json(alert);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteAlert = async (req, res) => {
  try {
    await Alert.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Alert deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist, getAlerts, createAlert, deleteAlert };
