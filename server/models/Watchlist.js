const mongoose = require('mongoose');

const WatchlistSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  symbols: [{ type: String, uppercase: true }],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Watchlist', WatchlistSchema);
