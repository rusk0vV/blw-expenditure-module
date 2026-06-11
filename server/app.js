require('dotenv').config({ path: '../.env' });
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const expenditureRoutes = require('./routes/expenditure');
const forecastRoutes = require('./routes/forecast');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, service: 'blw-expenditure-api' });
});

app.use('/api/expenditure', expenditureRoutes);
app.use('/api/forecast', forecastRoutes);
app.use(errorHandler);

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Express API running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start API:', err.message);
    process.exit(1);
  });
