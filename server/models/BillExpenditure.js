const mongoose = require('mongoose');

const BillExpenditureSchema = new mongoose.Schema({
  partyName: { type: String },
  a0: { type: String },
  srp: { type: String },
  spursc: { type: String },
  billAmount: { type: Number, required: true },
  passedAmount: { type: Number, default: 0 },
  deductedAmount: { type: Number, default: 0 },
  betAmount: { type: Number, default: 0 },
  coNumber: { type: String, index: true },
  voucherDate: { type: Date },
  allocation: { type: String },
  allocDesc: { type: String },
  pmtContr: { type: String },
  allocAmount: { type: Number, default: 0 },
  year: { type: Number },
  quarter: { type: String, enum: ['Q1', 'Q2', 'Q3', 'Q4', null] },
  uploadedAt: { type: Date, default: Date.now }
});

BillExpenditureSchema.index({ coNumber: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('BillExpenditure', BillExpenditureSchema);
