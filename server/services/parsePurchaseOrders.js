const PurchaseOrder = require('../models/PurchaseOrder');
const {
  readRows,
  toStringValue,
  toNumber,
  toDate,
  yearAndQuarter,
  bulkResultCounts
} = require('./excelUtils');

const getDepartment = (category) => {
  const cat = String(category || '').trim().toLowerCase();
  if (cat.includes('civil')) return 'Civil';
  if (cat.includes('electrical')) return 'Electrical';
  if (cat.includes('signalling') || cat.includes('it & electronics') || cat.includes('s&t')) return 'S&T';
  return 'Mechanical'; // fallback for loco spares, machinery, lubricants, misc, admin, etc.
};

const parsePurchaseOrders = async (filePath) => {
  const rows = readRows(filePath, 'PO_Data');
  const operations = [];
  let skipped = 0;

  rows.slice(1).forEach((row) => {
    const poNo = toStringValue(row[1]);
    if (!poNo) {
      skipped += 1;
      return;
    }

    const poDate = toDate(row[2]);
    const derived = yearAndQuarter(poDate);
    
    const qty = toNumber(row[6], 0);
    const rate = toNumber(row[8], 0);
    const contractValueAbsolute = Math.round(qty * rate);

    const document = {
      poKey: toStringValue(row[13]), // Portal Source
      poNo,
      poDate,
      vname: toStringValue(row[3]), // Vendor Name
      ns: toStringValue(row[7]), // Unit
      poValueUnit: contractValueAbsolute, // absolute Rupees
      plNo: getDepartment(row[5]), // Budget Category / Department
      description: toStringValue(row[4]), // Material Description
      poSr: toNumber(row[0]), // S.No.
      consnm: toStringValue(row[3]),
      poQty: toNumber(row[6]), // Quantity
      dpdt: null,
      shortName: toStringValue(row[3]),
      supgey: toStringValue(row[13]),
      canQty: 0,
      rly: 'BLW',
      insp: '',
      agency: toStringValue(row[13]), // Portal Source
      pv1: contractValueAbsolute,
      istat: toStringValue(row[12]), // Status
      dpStart: poDate,
      qtyRnoi: toNumber(row[11]), // Delivery Period (Days)
      stkNs: '',
      tend: toStringValue(row[10]), // Tender Type
      tyi: '',
      ai: '',
      rate: toNumber(row[8]), // Accepted Rate
      year: derived.year,
      quarter: derived.quarter,
      uploadedAt: new Date()
    };

    operations.push({
      updateOne: {
        filter: { poNo },
        update: { $set: document },
        upsert: true
      }
    });
  });

  if (!operations.length) return { inserted: 0, updated: 0, skipped };
  const result = await PurchaseOrder.bulkWrite(operations, { ordered: false });
  return bulkResultCounts(result, skipped);
};

module.exports = parsePurchaseOrders;
