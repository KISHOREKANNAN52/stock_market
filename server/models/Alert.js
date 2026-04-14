const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol:      { type: String, required: true, uppercase: true },
  targetPrice: { type: Number, required: true },
  condition:   { type: String, enum: ['GE', 'LE'], required: true }, // GE = >=, LE = <=
  triggered:   { type: Boolean, default: false },
  createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', AlertSchema);
