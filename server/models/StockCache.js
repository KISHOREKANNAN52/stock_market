const mongoose = require('mongoose');

// Cache stock data to avoid hammering free APIs
const StockCacheSchema = new mongoose.Schema({
  symbol:    { type: String, required: true, unique: true, uppercase: true },
  data:      { type: mongoose.Schema.Types.Mixed },
  fetchedAt: { type: Date, default: Date.now }
});

// TTL index — auto-expire after 15 minutes
StockCacheSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 900 });

module.exports = mongoose.model('StockCache', StockCacheSchema);
