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
  const rows = readRows(filePath);
  const operations = [];
  let skipped = 0;

  rows.slice(2).forEach((row, index) => {
    const billAmount = toNumber(row[5]);
    if (billAmount === null) {
      skipped += 1;
      return;
    }

    const fallbackKey = `row-${index + 3}-${toStringValue(row[1])}-${toStringValue(row[10])}`;
    const coNumber = toStringValue(row[9]) || fallbackKey;
    const voucherDate = toDate(row[10]);
    const derived = yearAndQuarter(voucherDate);
    const document = {
      partyName: toStringValue(row[1]),
      a0: toStringValue(row[2]),
      srp: toStringValue(row[3]),
      spursc: toStringValue(row[4]),
      billAmount,
      passedAmount: toNumber(row[6], 0),
      deductedAmount: toNumber(row[7], 0),
      betAmount: toNumber(row[8], 0),
      coNumber,
      voucherDate,
      allocation: toStringValue(row[11]) || 'UNALLOCATED',
      allocDesc: toStringValue(row[12]) || 'Unallocated',
      pmtContr: toStringValue(row[13]),
      allocAmount: toNumber(row[14], 0),
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
