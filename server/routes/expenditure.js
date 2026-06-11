const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const multer = require('multer');
const parsePurchaseOrders = require('../services/parsePurchaseOrders');
const parseBillExpenditure = require('../services/parseBillExpenditure');
const buildSummaries = require('../services/buildSummaries');
const ExpenditureSummary = require('../models/ExpenditureSummary');
const BillExpenditure = require('../models/BillExpenditure');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${suffix}-${file.originalname}`);
  }
});

const excelMimeTypes = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/octet-stream'
]);

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isXlsx = file.originalname.toLowerCase().endsWith('.xlsx');
    if (!isXlsx || !excelMimeTypes.has(file.mimetype)) {
      const err = new Error('Only .xlsx files are supported');
      err.status = 415;
      cb(err);
      return;
    }
    cb(null, true);
  }
});

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const makeFilter = (query) => {
  const filter = {};
  if (query.year) filter.year = Number(query.year);
  if (query.quarter) filter.quarter = query.quarter;
  if (query.headCode) filter.headCode = query.headCode;
  return filter;
};

const quarterOrder = {
  Q1: 1,
  Q2: 2,
  Q3: 3,
  Q4: 4
};

const uploadAndParse = (parser) =>
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'Excel file is required' });
      return;
    }

    let counts;
    try {
      counts = await parser(req.file.path);
      const summary = await buildSummaries();
      res.json({ success: true, ...counts, ...summary });
    } finally {
      await fs.unlink(req.file.path).catch(() => {});
    }
  });

router.post('/upload/po', upload.single('file'), uploadAndParse(parsePurchaseOrders));
router.post('/upload/bill', upload.single('file'), uploadAndParse(parseBillExpenditure));

router.get(
  '/filters',
  asyncHandler(async (req, res) => {
    const [years, quarters, heads] = await Promise.all([
      ExpenditureSummary.distinct('year'),
      ExpenditureSummary.distinct('quarter'),
      ExpenditureSummary.find({}, { headCode: 1, headName: 1, _id: 0 }).lean()
    ]);

    const uniqueHeads = Array.from(
      new Map(heads.map((head) => [head.headCode, head])).values()
    ).sort((a, b) => a.headCode.localeCompare(b.headCode));

    res.json({
      success: true,
      years: years.filter(Boolean).sort((a, b) => b - a),
      quarters: quarters.filter(Boolean).sort((a, b) => quarterOrder[a] - quarterOrder[b]),
      headCodes: uniqueHeads
    });
  })
);

router.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const filter = makeFilter(req.query);
    const [summary] = await ExpenditureSummary.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalExpenditure: { $sum: '$totalPassed' },
          totalBilled: { $sum: '$totalBilled' },
          totalAllocated: { $sum: '$totalAllocated' },
          totalPOValue: { $sum: '$totalPOValue' },
          heads: { $addToSet: '$headCode' },
          periods: { $addToSet: { year: '$year', quarter: '$quarter' } }
        }
      }
    ]);

    const [highestHead] = await ExpenditureSummary.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { headCode: '$headCode', headName: '$headName' },
          amount: { $sum: '$totalPassed' }
        }
      },
      { $sort: { amount: -1 } },
      { $limit: 1 }
    ]);

    const periodCount = summary?.periods?.length || 0;
    res.json({
      success: true,
      totalExpenditure: summary?.totalExpenditure || 0,
      totalBilled: summary?.totalBilled || 0,
      totalAllocated: summary?.totalAllocated || 0,
      totalPOValue: summary?.totalPOValue || 0,
      highestHead: highestHead
        ? {
            headCode: highestHead._id.headCode,
            headName: highestHead._id.headName,
            amount: highestHead.amount
          }
        : null,
      averageQuarterly: periodCount ? (summary.totalExpenditure || 0) / periodCount : 0,
      totalBudgetHeads: summary?.heads?.length || 0
    });
  })
);

router.get(
  '/quarterly',
  asyncHandler(async (req, res) => {
    const data = await ExpenditureSummary.aggregate([
      { $match: makeFilter(req.query) },
      {
        $group: {
          _id: { year: '$year', quarter: '$quarter' },
          amount: { $sum: '$totalPassed' },
          billed: { $sum: '$totalBilled' }
        }
      },
      { $sort: { '_id.year': 1 } }
    ]);

    const sorted = data
      .map((item) => ({
        year: item._id.year,
        quarter: item._id.quarter,
        label: `${item._id.quarter} ${item._id.year}`,
        amount: item.amount,
        billed: item.billed
      }))
      .sort((a, b) => a.year - b.year || quarterOrder[a.quarter] - quarterOrder[b.quarter]);

    res.json({ success: true, data: sorted });
  })
);

router.get(
  '/by-head',
  asyncHandler(async (req, res) => {
    const data = await ExpenditureSummary.aggregate([
      { $match: makeFilter(req.query) },
      {
        $group: {
          _id: { headCode: '$headCode', headName: '$headName' },
          amount: { $sum: '$totalPassed' },
          billed: { $sum: '$totalBilled' },
          records: { $sum: '$recordCount' }
        }
      },
      { $sort: { amount: -1 } }
    ]);

    res.json({
      success: true,
      data: data.map((item) => ({
        headCode: item._id.headCode,
        headName: item._id.headName,
        amount: item.amount,
        billed: item.billed,
        records: item.records
      }))
    });
  })
);

router.get(
  '/distribution',
  asyncHandler(async (req, res) => {
    const data = await ExpenditureSummary.aggregate([
      { $match: makeFilter(req.query) },
      {
        $group: {
          _id: { headCode: '$headCode', headName: '$headName' },
          amount: { $sum: '$totalPassed' }
        }
      },
      { $sort: { amount: -1 } }
    ]);

    const total = data.reduce((sum, item) => sum + item.amount, 0);
    res.json({
      success: true,
      data: data.map((item) => ({
        headCode: item._id.headCode,
        headName: item._id.headName,
        amount: item.amount,
        percentage: total ? Number(((item.amount / total) * 100).toFixed(2)) : 0
      }))
    });
  })
);

router.get(
  '/raw',
  asyncHandler(async (req, res) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 100);
    const filter = {};
    if (req.query.year) filter.year = Number(req.query.year);
    if (req.query.quarter) filter.quarter = req.query.quarter;
    if (req.query.headCode) filter.allocation = req.query.headCode;

    const [items, total] = await Promise.all([
      BillExpenditure.find(filter)
        .sort({ voucherDate: -1, coNumber: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      BillExpenditure.countDocuments(filter)
    ]);

    res.json({ success: true, page, limit, total, data: items });
  })
);

module.exports = router;
