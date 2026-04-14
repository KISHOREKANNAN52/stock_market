// routes/predict.js
const express = require('express');
const r1 = express.Router();
const { predict } = require('../controllers/predictController');
r1.post('/', predict);
module.exports = r1;
