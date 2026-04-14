// routes/portfolio.js
const express = require('express');
const router = express.Router();
const { getPortfolio, addToPortfolio, removeFromPortfolio } = require('../controllers/portfolioController');
const { protect } = require('../middleware/auth');
router.get('/', protect, getPortfolio);
router.post('/', protect, addToPortfolio);
router.delete('/:symbol', protect, removeFromPortfolio);
module.exports = router;
