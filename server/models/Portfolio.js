const mongoose = require('mongoose');

const PortfolioItemSchema = new mongoose.Schema({
  symbol:    { type: String, required: true, uppercase: true },
  name:      { type: String, default: '' },
  sector:    { type: String, default: '' },
  qty:       { type: Number, required: true, min: 1 },
  buyPrice:  { type: Number, required: true },
  addedAt:   { type: Date, default: Date.now }
});

const PortfolioSchema = new mongoose.Schema({
  user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [PortfolioItemSchema],
  updatedAt: { type: Date, default: Date.now }
});

PortfolioSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Portfolio', PortfolioSchema);
