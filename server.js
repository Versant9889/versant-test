require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripeRoutes = require('./src/api/stripe');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.PRODUCTION_CLIENT_URL
    : 'http://localhost:3001'
}));

// Routes
app.use('/api', stripeRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});