const BillExpenditure = require('../models/BillExpenditure');
const {
  readRows,
  toStringValue,
  toNumber,
  toDate,
  yearAndQuarter,
  bulkResultCounts
} = require('./excelUtils');

const parseBillExpenditure = async (filePath) => {
  const rows = readRows(filePath, 'CO6_Data');
  const operations = [];
  let skipped = 0;

  rows.slice(1).forEach((row, index) => {
    const billAmount = toNumber(row[7]);
    if (billAmount === null) {
      skipped += 1;
      return;
    }

    const fallbackKey = `row-${index + 2}-${toStringValue(row[1])}-${toStringValue(row[3])}`;
    const coNumber = toStringValue(row[2]) || fallbackKey;
    const voucherDate = toDate(row[1]);
    const derived = yearAndQuarter(voucherDate);
    const document = {
      partyName: toStringValue(row[3]),
      a0: '',
      srp: '',
      spursc: '',
      billAmount,
      passedAmount: toNumber(row[8], 0),
      deductedAmount: Math.max(0, billAmount - toNumber(row[8], 0)),
      betAmount: 0,
      coNumber,
      voucherDate,
      allocation: toStringValue(row[4]) || 'UNALLOCATED',
      allocDesc: toStringValue(row[4]) || 'Unallocated',
      pmtContr: toStringValue(row[5]),
      status: toStringValue(row[6]),
      allocAmount: 0,
      year: derived.year,
      quarter: derived.quarter,
      uploadedAt: new Date()
    };

    operations.push({
      updateOne: {
        filter: { coNumber },
        update: { $set: document },
        upsert: true
      }
    });
  });

  if (!operations.length) return { inserted: 0, updated: 0, skipped };
  const result = await BillExpenditure.bulkWrite(operations, { ordered: false });
  return bulkResultCounts(result, skipped);
};

module.exports = parseBillExpenditure;
