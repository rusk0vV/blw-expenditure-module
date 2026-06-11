const XLSX = require('xlsx');

const readRows = (filePath, sheetIndex = 0) => {
  const workbook = XLSX.readFile(filePath, { cellDates: true });
  const sheetName = workbook.SheetNames[sheetIndex];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: null });
};

const toStringValue = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

const toNumber = (value, fallback = null) => {
  if (value === null || value === undefined || value === '') return fallback;
  const cleaned = String(value).replace(/,/g, '').trim();
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toDate = (value) => {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) return new Date(parsed.y, parsed.m - 1, parsed.d);
  }

  const raw = String(value).trim();
  if (!raw) return null;

  const date = new Date(raw);
  if (!Number.isNaN(date.getTime())) return date;

  const match = raw.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2,4})$/);
  if (!match) return null;

  const months = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11
  };
  const day = Number(match[1]);
  const month = months[match[2].toLowerCase()];
  let year = Number(match[3]);
  if (year < 100) year += year >= 70 ? 1900 : 2000;
  const parsed = new Date(year, month, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getQuarter = (date) => {
  if (!date) return null;
  const month = date.getMonth() + 1;
  if (month <= 3) return 'Q1';
  if (month <= 6) return 'Q2';
  if (month <= 9) return 'Q3';
  return 'Q4';
};

const yearAndQuarter = (date) => ({
  year: date ? date.getFullYear() : null,
  quarter: getQuarter(date)
});

const bulkResultCounts = (result, skipped) => ({
  inserted: result.upsertedCount || 0,
  updated: result.modifiedCount || 0,
  skipped
});

module.exports = {
  readRows,
  toStringValue,
  toNumber,
  toDate,
  yearAndQuarter,
  bulkResultCounts
};
