# moduleGuidelines.md — Development Guidelines
## BLW Expenditure Analysis Module

---

## 1. Architecture Overview

This module follows a **three-tier architecture**:

```
┌─────────────────────┐
│   React Client      │  Port 5173 (Vite dev) / Port 80 (production)
│   (Visualization)   │
└────────┬────────────┘
         │ REST (JSON over HTTP)
┌────────▼────────────┐
│   Express Server    │  Port 5000
│   (API + Parsers)   │
└────────┬────────────┘
         │                    │ HTTP (internal only)
┌────────▼──────────┐   ┌────▼───────────────┐
│   MongoDB         │   │   Flask ML          │  Port 5001
│   3 collections   │   │   (Forecasting)     │
└───────────────────┘   └────────────────────┘
```

The Express server is the **only contact point** for the React client.
The client never calls Flask directly. Express fetches data from MongoDB
and proxies forecast requests to Flask internally.

---

## 2. MongoDB Collections

There are three collections in the `blw_expenditure` database:

| `purchaseorders` | BLW_PO_Railways_Dummy_Data.xlsx | Raw PO records |
| `billexpenditures` | BLW_CO6_Dummy_Data.xlsx | Raw bill/voucher records |
| `expendituresummaries` | Built automatically | Pre-aggregated view for dashboard |

The dashboard **only reads from `expendituresummaries`**. The raw collections exist for audit and re-aggregation. Every time a new Excel file is uploaded, `buildSummaries.js` drops and rebuilds `expendituresummaries` from the two raw collections.

---

## 3. Data Flow

### Ingestion Flow
```
User uploads Excel in Settings page
  → POST /api/expenditure/upload/po   OR   /upload/bill
    → multer saves file to uploads/
      → parsePurchaseOrders.js OR parseBillExpenditure.js
        → bulkWrite upsert into raw collection
          → buildSummaries.js runs
            → drops + rebuilds expendituresummaries
              → file deleted from uploads/
                → response: { inserted, updated, skipped }
```

### Dashboard Flow
```
Page load / filter change
  → GET /api/expenditure/filters       (populate dropdowns)
  → GET /api/expenditure/summary       (stat cards)
  → GET /api/expenditure/quarterly     (bar chart)
  → GET /api/expenditure/by-head       (horizontal bar chart)
  → GET /api/expenditure/distribution  (donut chart)
    → all query ExpenditureSummary with $match filter
      → aggregation pipelines → JSON → Recharts
```

### Forecasting Flow
```
ForecastSection mounts
  → GET /api/forecast (Express)
    → queries ExpenditureSummary: last 8 quarters, total per quarter
      → POST http://localhost:5001/predict
          body: { historical: [ { year, quarter, amount }, ... ] }
        → train.py builds features, trains RandomForestRegressor
          → returns { predicted_amount, growth_rate, model_used,
                      projection_label, confidence, feature_importance }
            → Express passes response to client
              → ForecastSection renders cards
```

---

## 4. ML Model — Full Explanation

### Problem Type
This is a **time-series regression** problem. We are predicting a continuous rupee value (next quarter's total expenditure). Logistic Regression is a classifier (predicts a category, not a number) and must never be used here.

### Why Random Forest Regressor
| Property | Why it matters here |
|---|---|
| Handles small datasets | BLW data spans a few years — maybe 8–20 quarters total |
| No feature scaling needed | Bill amounts are in lakhs; no need to normalise |
| Robust to outliers | One unusually high quarter (e.g. capital expenditure) won't break the model |
| Non-linear patterns | Expenditure often spikes in Q4 (financial year-end) — RF captures this |
| Feature importance output | Shows which features (lag values, quarter) drive the prediction |

### Feature Engineering
Each data point (one row in the training set) is one historical quarter. Features are:

| Feature | How it is built | Why |
|---|---|---|
| `time_index` | Sequential int: Q1 2021 = 1, Q2 2021 = 2, … | Captures overall trend |
| `quarter_number` | Q1=1, Q2=2, Q3=3, Q4=4 | Captures seasonality |
| `lag_1` | Amount from the immediately prior quarter | Most recent signal |
| `lag_2` | Amount from 2 quarters ago | Short-term momentum |

### Training on Every Request
The model is **retrained on every `/predict` call** — it is not persisted to disk. This is intentional because:
- The dataset is tiny (rarely more than 20 rows), so training takes under 100ms.
- Retraining ensures the model always reflects the latest uploaded data.
- No stale model files to manage.

### Fallback Behaviour
If fewer than 4 data points are available (e.g. the module is brand new and only one quarter of data has been uploaded), the model falls back to a **3-period simple moving average** and flags `"confidence": "low"` in the response.

### Confidence Levels Returned
| Condition | `confidence` value |
|---|---|
| Fewer than 4 quarters | `"low"` (moving average fallback) |
| 4–7 quarters | `"medium"` (RF with limited data) |
| 8+ quarters | `"high"` (RF with sufficient history) |

---

## 5. Excel File Format Contract

### File 1 — Purchase Orders

Filename pattern: `BLW_PO_Railways_Dummy_Data*.xlsx`
Header row: **Row 1** (Sheet name: `PO_Data`)

| Column Index | Column Name | Type | Notes |
|---|---|---|---|
| 0 | S.No. | Number | Serial number |
| 1 | P.O. No. | String | Required. Unique identifier / key. |
| 2 | Date of Issue | Date string | Used to derive year + quarter |
| 3 | Vendor Name | String | Vendor name |
| 4 | Material Description | String | Item/Service description |
| 5 | Budget Category | String | Used to derive department/headCode |
| 6 | Quantity | Number | |
| 7 | Unit | String | |
| 8 | Accepted Rate (₹) | Number | Unit rate |
| 9 | Value of Contract (₹ in Lakhs) | Number | Formula result (computed manually as Qty * Rate) |
| 10 | Tender Type | String | Open/Global/etc. |
| 11 | Delivery Period (Days) | Number | |
| 12 | Status | String | Completed/Ongoing/Cancelled |
| 13 | Portal Source | String | E-procurement source (e.g. IREPS) |

### File 2 — Bill Expenditure Data

Filename pattern: `BLW_CO6_Dummy_Data*.xlsx`
Header row: **Row 1** (Sheet name: `CO6_Data`)

| Column Index | Column Name | Type | Notes |
|---|---|---|---|
| 0 | S.No. | Number | Serial number |
| 1 | Reg Date | Date string | Used to derive year + quarter |
| 2 | CO6 Reg Ref | String | Required. Unique key (CO number). |
| 3 | Party Name / Contractor | String | Contractor name |
| 4 | Department | String | Department/Allocation head code and description |
| 5 | Compliance Interval | String | e.g. Monthly, Quarterly, Yearly |
| 6 | Status | String | Passed, Pending, Returned |
| 7 | Claim Amount (₹) | Number | Claim value |
| 8 | Passed Amount (₹) | Number | Passed value |

### Quarter Derivation (same logic for both files)
```js
function getQuarter(date) {
  const month = new Date(date).getMonth() + 1; // 1–12
  if (month <= 3)  return 'Q1';
  if (month <= 6)  return 'Q2';
  if (month <= 9)  return 'Q3';
  return 'Q4';
}
```

---

## 6. MongoDB Compass Setup (Local Development)

MongoDB Compass is the GUI for browsing and inspecting the database. You do not need to configure anything special in the code — Compass connects to the same local MongoDB instance that Express uses.

### Steps to set up

**1. Start MongoDB service on your laptop**

Open a terminal and run:
```
mongod --dbpath C:\data\db
```
If the `C:\data\db` folder doesn't exist, create it first. Keep this terminal open while developing.

**2. Open MongoDB Compass**

- Launch Compass.
- In the connection string field, enter exactly:
  ```
  mongodb://localhost:27017
  ```
- Click Connect.

**3. What you will see after your first data upload**

- A database named `blw_expenditure` will appear automatically (MongoDB creates it when Express first writes to it).
- Inside it, three collections: `purchaseorders`, `billexpenditures`, `expendituresummaries`.
- You can browse documents, run queries, and check aggregation results directly here.

**4. Useful things to do in Compass during development**

| Task | How |
|---|---|
| Check if upload worked | Open `billexpenditures` → count documents |
| Inspect a parsed document | Click any document, verify year + quarter fields are set correctly |
| Check aggregation output | Open `expendituresummaries` → should have one doc per (year, quarter, headCode) combination |
| Manually drop a collection to re-test ingestion | Click the collection → click the trash icon |
| Run a test aggregation | Use the Aggregation tab inside a collection |

**5. The `.env` connection string**

In your project's `.env` file:
```
MONGO_URI=mongodb://localhost:27017/blw_expenditure
```
This is all Express needs. Compass and Express share the same MongoDB process — there is no separate configuration.

**6. You do NOT need to**
- Create the database manually in Compass.
- Create collections manually.
- Set up any users or authentication for local development.
MongoDB creates everything automatically when the app first writes data.

---

## 7. Frontend Coding Standards

### Component Rules
- Functional components with hooks only. No class components.
- Each component lives in its own file.
- No component exceeds 150 lines. Extract sub-components if needed.

### API Calls
- All Axios calls in `src/api/expenditureApi.js`. Components never call `axios` directly.
- Every API function returns the `data` field only, not the full Axios response object.
- Every component that fetches data handles three states: loading, error, data.

### Currency Formatting
Always use the utility, never format inline:
```js
// src/utils/formatCurrency.js
export const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  }).format(amount);
```

### Theming
- CSS custom properties (`--bg-primary`, `--text-primary`, `--accent`) defined per theme class on `<body>`.
- Components use CSS variables only, never hardcoded hex colours.
- Theme classes: `body.theme-light`, `body.theme-dark`, `body.theme-gov-blue`.

---

## 8. Color Palette

### Light Theme (default)
| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#FAF8F5` | Page background |
| `--bg-card` | `#FFFFFF` | Card backgrounds |
| `--text-primary` | `#1A1A1A` | Main text |
| `--text-secondary` | `#6B7280` | Labels, sub-text |
| `--accent` | `#C8A96E` | Railway gold highlights |
| `--border` | `#E5E2DC` | Card borders |

### Government Blue Theme (BLW official)
| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#0A2240` | Navy background |
| `--bg-card` | `#0D2D57` | Card backgrounds |
| `--text-primary` | `#FFFFFF` | Main text |
| `--accent` | `#FF9933` | Saffron (Indian Railways) |

---

## 9. Chart Configuration Standards

- `ResponsiveContainer` width `100%`, height `300px` for all charts.
- Primary colour from `--accent` CSS variable.
- Every `<Tooltip>` uses `formatINR` formatter.
- Every chart has a `<Legend>` at the bottom.
- X-axis labels rotated `-30deg` when more than 6 items.
- Skeleton placeholder (200px, animated) while loading.
- Centered "No data available for the selected filters." when array is empty.

---

## 10. Error Handling Contract

### Backend
- All routes wrapped in `try/catch`.
- Error shape: `{ success: false, message: "...", error: err.message }`
- HTTP 400 for bad input, 500 for server errors.
- Multer file type errors: 415 Unsupported Media Type.

### Frontend
- Failed API calls: red banner at the top of the affected section only.
- Never let one failed chart crash the whole Dashboard — use per-component error boundaries.

---

## 11. File Upload Constraints

- Accepted MIME type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Max file size: 10 MB
- Files stored temporarily in `uploads/`, deleted immediately after parsing completes.

---

## 12. Environment & Deployment Notes

- All secrets in `.env`. Never commit `.env`.
- `.env.example` documents all required variables without values.
- For local dev: MongoDB running locally (see Section 6 above).
- Flask runs as a separate process. Use `concurrently` in root `package.json` for `npm run dev`.
- For production: Docker Compose — one container each for Nginx (React build), Express, Flask, MongoDB.

---

## 13. Pre-Start Checklist for the Coding Agent

Ask the user to confirm these before writing any code:

1. Confirm exact column names from the real Excel files (Section 5 is based on sample files — real files may differ slightly).
2. What financial years does the data span? (Affects filter dropdown defaults.)
3. Should forecast auto-run on Dashboard load, or require a manual button click?
4. Is user authentication needed?
5. Deployment target — local laptop only, or a BLW internal server?
