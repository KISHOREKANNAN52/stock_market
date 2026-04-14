const express = require('express');
const router = express.Router();
const { getAlerts, createAlert, deleteAlert } = require('../controllers/watchlistController');
const { protect } = require('../middleware/auth');
router.get('/', protect, getAlerts);
router.post('/', protect, createAlert);
router.delete('/:id', protect, deleteAlert);
module.exports = router;
