const BillExpenditure = require('../models/BillExpenditure');
const PurchaseOrder = require('../models/PurchaseOrder');
const ExpenditureSummary = require('../models/ExpenditureSummary');

const buildSummaries = async () => {
  await ExpenditureSummary.deleteMany({});

  const billGroups = await BillExpenditure.aggregate([
    {
      $match: {
        year: { $ne: null },
        quarter: { $in: ['Q1', 'Q2', 'Q3', 'Q4'] }
      }
    },
    {
      $group: {
        _id: {
          year: '$year',
          quarter: '$quarter',
          headCode: '$allocation'
        },
        headName: { $first: '$allocDesc' },
        totalBilled: { $sum: '$billAmount' },
        totalPassed: { $sum: '$passedAmount' },
        totalAllocated: { $sum: '$allocAmount' },
        recordCount: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.quarter': 1, '_id.headCode': 1 } }
  ]);

  const poGroups = await PurchaseOrder.aggregate([
    {
      $match: {
        year: { $ne: null },
        quarter: { $in: ['Q1', 'Q2', 'Q3', 'Q4'] }
      }
    },
    {
      $group: {
        _id: { year: '$year', quarter: '$quarter' },
        totalPOValue: { $sum: '$poValueUnit' }
      }
    }
  ]);

  const poByPeriod = new Map(
    poGroups.map((item) => [`${item._id.year}-${item._id.quarter}`, item.totalPOValue])
  );

  const docs = billGroups.map((item) => ({
    year: item._id.year,
    quarter: item._id.quarter,
    headCode: item._id.headCode || 'UNALLOCATED',
    headName: item.headName || 'Unallocated',
    totalBilled: item.totalBilled,
    totalPassed: item.totalPassed,
    totalAllocated: item.totalAllocated,
    totalPOValue: poByPeriod.get(`${item._id.year}-${item._id.quarter}`) || 0,
    recordCount: item.recordCount,
    updatedAt: new Date()
  }));

  if (docs.length) {
    await ExpenditureSummary.insertMany(docs, { ordered: false });
  }

  return { summaries: docs.length };
};

module.exports = buildSummaries;
