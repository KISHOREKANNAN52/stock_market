const express = require('express');
const router = express.Router();
const { getAllStocks, getStock, getHistory } = require('../controllers/stockController');

router.get('/', getAllStocks);
router.get('/:symbol', getStock);
router.get('/:symbol/history', getHistory);

module.exports = router;
