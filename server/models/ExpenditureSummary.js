const mongoose = require('mongoose');

const ExpenditureSummarySchema = new mongoose.Schema({
  year: { type: Number, required: true },
  quarter: { type: String, enum: ['Q1', 'Q2', 'Q3', 'Q4'], required: true },
  headCode: { type: String, required: true },
  headName: { type: String, required: true },
  totalBilled: { type: Number, default: 0 },
  totalPassed: { type: Number, default: 0 },
  totalAllocated: { type: Number, default: 0 },
  totalPOValue: { type: Number, default: 0 },
  recordCount: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

ExpenditureSummarySchema.index(
  { year: 1, quarter: 1, headCode: 1 },
  { unique: true }
);

module.exports = mongoose.model('ExpenditureSummary', ExpenditureSummarySchema);
