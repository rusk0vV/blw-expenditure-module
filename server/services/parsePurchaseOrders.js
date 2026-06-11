const PurchaseOrder = require('../models/PurchaseOrder');
const {
  readRows,
  toStringValue,
  toNumber,
  toDate,
  yearAndQuarter,
  bulkResultCounts
} = require('./excelUtils');

const parsePurchaseOrders = async (filePath) => {
  const rows = readRows(filePath);
  const operations = [];
  let skipped = 0;

  rows.slice(1).forEach((row) => {
    const poNo = toNumber(row[1]);
    if (!poNo) {
      skipped += 1;
      return;
    }

    const poDate = toDate(row[2]);
    const derived = yearAndQuarter(poDate);
    const document = {
      poKey: toStringValue(row[0]),
      poNo,
      poDate,
      vname: toStringValue(row[3]),
      ns: toStringValue(row[4]),
      poValueUnit: toNumber(row[5], 0),
      plNo: toStringValue(row[6]),
      description: toStringValue(row[7]),
      poSr: toNumber(row[8]),
      consnm: toStringValue(row[9]),
      poQty: toNumber(row[10]),
      dpdt: toDate(row[11]),
      shortName: toStringValue(row[12]),
      supgey: toStringValue(row[13]),
      canQty: toNumber(row[14], 0),
      rly: toStringValue(row[15]) || 'BLW',
      insp: toStringValue(row[16]),
      agency: toStringValue(row[17]),
      pv1: toNumber(row[18], 0),
      istat: toStringValue(row[19]),
      dpStart: toDate(row[20]),
      qtyRnoi: toNumber(row[21]),
      stkNs: toStringValue(row[22]),
      tend: toStringValue(row[23]),
      tyi: toStringValue(row[24]),
      ai: toStringValue(row[25]),
      rate: toNumber(row[26]),
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
