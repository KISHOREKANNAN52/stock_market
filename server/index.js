```js
// ============================================================
// Nifty 50 Stock Analysis System — Express Server
// ============================================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// =======================
// ✅ CORS FIX (IMPORTANT)
// =======================
app.use(cors({
  origin: "*",   // allow all (for now)
  credentials: true
}));

app.use(express.json());

// =======================
// ✅ TEST ROUTES (ADD THIS)
// =======================

// Home route
app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// =======================
// ✅ YOUR EXISTING ROUTES
// =======================
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/stocks',     require('./routes/stocks'));
app.use('/api/portfolio',  require('./routes/portfolio'));
app.use('/api/watchlist',  require('./routes/watchlist'));
app.use('/api/alerts',     require('./routes/alerts'));
app.use('/api/predict',    require('./routes/predict'));
app.use('/api/news',       require('./routes/news'));

// =======================
// ✅ ERROR HANDLER
// =======================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// =======================
// ✅ START SERVER
// =======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```
