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

// Middleware
const allowedOrigins = [process.env.CLIENT_URL || 'http://localhost:5174', 'http://localhost:5173', 'http://localhost:5174'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.options('*', cors());
app.use(express.json());

// Routes
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/stocks',     require('./routes/stocks'));
app.use('/api/portfolio',  require('./routes/portfolio'));
app.use('/api/watchlist',  require('./routes/watchlist'));
app.use('/api/alerts',     require('./routes/alerts'));
app.use('/api/predict',    require('./routes/predict'));
app.use('/api/news',       require('./routes/news'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
