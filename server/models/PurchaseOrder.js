const mongoose = require('mongoose');

const PurchaseOrderSchema = new mongoose.Schema({
  poKey: { type: String },
  poNo: { type: Number, required: true, unique: true, index: true },
  poDate: { type: Date },
  vname: { type: String },
  ns: { type: String },
  poValueUnit: { type: Number, default: 0 },
  plNo: { type: String },
  description: { type: String },
  poSr: { type: Number },
  consnm: { type: String },
  poQty: { type: Number },
  dpdt: { type: Date },
  shortName: { type: String },
  supgey: { type: String },
  canQty: { type: Number, default: 0 },
  rly: { type: String, default: 'BLW' },
  insp: { type: String },
  agency: { type: String },
  pv1: { type: Number, default: 0 },
  istat: { type: String },
  dpStart: { type: Date },
  qtyRnoi: { type: Number },
  stkNs: { type: String },
  tend: { type: String },
  tyi: { type: String },
  ai: { type: String },
  rate: { type: Number },
  year: { type: Number },
  quarter: { type: String, enum: ['Q1', 'Q2', 'Q3', 'Q4', null] },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PurchaseOrder', PurchaseOrderSchema);
