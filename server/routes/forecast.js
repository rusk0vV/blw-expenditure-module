const express = require('express');
const axios = require('axios');
const ExpenditureSummary = require('../models/ExpenditureSummary');

const router = express.Router();

const quarterOrder = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 };

router.get('/', async (req, res, next) => {
  try {
    const grouped = await ExpenditureSummary.aggregate([
      {
        $group: {
          _id: { year: '$year', quarter: '$quarter' },
          amount: { $sum: '$totalPassed' }
        }
      }
    ]);

    const historical = grouped
      .map((item) => ({
        year: item._id.year,
        quarter: item._id.quarter,
        amount: item.amount
      }))
      .sort((a, b) => a.year - b.year || quarterOrder[a.quarter] - quarterOrder[b.quarter])
      .slice(-8);

    if (!historical.length) {
      res.json({
        success: true,
        predicted_amount: 0,
        growth_rate: 0,
        model_used: 'NoData',
        projection_label: 'No data',
        confidence: 'low',
        historical: []
      });
      return;
    }

    const flaskUrl = process.env.FLASK_URL || 'http://localhost:5001';
    const { data } = await axios.post(`${flaskUrl}/predict`, { historical }, { timeout: 5000 });
    res.json({ success: true, ...data, historical });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
