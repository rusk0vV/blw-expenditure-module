# agent.md — Codex Agent Instructions
## BLW Expenditure Analysis Module

---

## Your Role

You are a full-stack MERN developer building an **Expenditure Analysis Dashboard** for Banaras Locomotive Works (BLW), a government institution under Indian Railways. This is an internal analytics module for an intern project. Build it incrementally, verify each layer before moving to the next, and never skip steps.

---

## Project Bootstrap Order

Follow this exact sequence. Do **not** jump ahead.

```
1.  Scaffold directory structure
2.  Set up MongoDB + Mongoose models (two schemas)
3.  Write the Excel parsers for both file types
4.  Build the data transformation service (raw → expenditure aggregates)
5.  Build Express API routes
6.  Build the ML forecasting microservice (Python/Flask)
7.  Scaffold React frontend with routing
8.  Build reusable UI components
9.  Wire dashboard with real API data
10. Implement chart visualizations
11. Implement forecasting section
12. Add Overview and Settings pages
13. Final integration test + README
```

---

## Directory Structure to Create

```
blw-expenditure/
├── client/                             # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── expenditureApi.js
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── QuarterlyChart.jsx
│   │   │   ├── HeadWiseChart.jsx
│   │   │   ├── DistributionChart.jsx
│   │   │   └── ForecastSection.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Overview.jsx
│   │   │   └── Settings.jsx
│   │   ├── context/
│   │   │   └── ThemeContext.jsx
│   │   ├── utils/
│   │   │   └── formatCurrency.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                             # Node.js + Express backend
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── PurchaseOrder.js            # Schema for PO file
│   │   ├── BillExpenditure.js          # Schema for Bill file
│   │   └── ExpenditureSummary.js       # Aggregated view schema
│   ├── routes/
│   │   ├── expenditure.js
│   │   └── forecast.js
│   ├── services/
│   │   ├── parsePurchaseOrders.js      # Parser for BLW_PurchaseOrders.xlsx
│   │   ├── parseBillExpenditure.js     # Parser for BLW_BillExpenditureData.xlsx
│   │   └── buildSummaries.js          # Aggregation service run after upload
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── app.js
│   └── package.json
│
├── ml/                                 # Python Flask forecasting service
│   ├── app.py
│   ├── train.py
│   ├── requirements.txt
│   └── README.md
│
├── uploads/                            # Temp folder for Excel uploads (gitignored)
├── .env.example
└── README.md
```

---

## Step 1 — MongoDB Schemas

### PurchaseOrder schema  (`server/models/PurchaseOrder.js`)

Maps directly to columns in `BLW_PurchaseOrders_Sample.xlsx`.

```js
const mongoose = require('mongoose');
const PurchaseOrderSchema = new mongoose.Schema({
  poKey:          { type: String },
  poNo:           { type: Number, required: true },
  poDate:         { type: Date },
  vname:          { type: String },          // Vendor name
  ns:             { type: String },          // Unit (Nos./Kgs./Set)
  poValueUnit:    { type: Number },
  plNo:           { type: String },
  description:    { type: String },
  poSr:           { type: Number },
  consnm:         { type: String },
  poQty:          { type: Number },
  dpdt:           { type: Date },            // Delivery date
  shortName:      { type: String },
  supgey:         { type: String },
  canQty:         { type: Number, default: 0 },
  rly:            { type: String, default: 'BLW' },
  insp:           { type: String },
  agency:         { type: String },          // OTHER / RDSO / CONSG / CLW
  pv1:            { type: Number, default: 0 },
  istat:          { type: String },
  dpStart:        { type: Date },
  qtyRnoi:        { type: Number },
  stkNs:          { type: String },
  tend:           { type: String },          // ADV / LT
  tyi:            { type: String },
  ai:             { type: String },
  rate:           { type: Number },
  // derived fields added by parser
  year:           { type: Number },          // extracted from poDate
  quarter:        { type: String },          // Q1–Q4, derived from poDate
  uploadedAt:     { type: Date, default: Date.now }
});
module.exports = mongoose.model('PurchaseOrder', PurchaseOrderSchema);
```

### BillExpenditure schema  (`server/models/BillExpenditure.js`)

Maps directly to columns in `BLW_BillExpenditureData_Sample.xlsx`.

```js
const mongoose = require('mongoose');
const BillExpenditureSchema = new mongoose.Schema({
  partyName:    { type: String },
  a0:           { type: String },
  srp:          { type: String },
  spursc:       { type: String },
  billAmount:   { type: Number, required: true },
  passedAmount: { type: Number },
  deductedAmount:{ type: Number },
  betAmount:    { type: Number },
  coNumber:     { type: String },
  voucherDate:  { type: Date },
  allocation:   { type: String },           // allocation code
  allocDesc:    { type: String },           // e.g. WKSHOP MANF SUS.-LOCO WSHOPS
  pmtContr:     { type: String },
  allocAmount:  { type: Number },
  // derived fields
  year:         { type: Number },           // extracted from voucherDate
  quarter:      { type: String },           // Q1–Q4
  uploadedAt:   { type: Date, default: Date.now }
});
module.exports = mongoose.model('BillExpenditure', BillExpenditureSchema);
```

### ExpenditureSummary schema  (`server/models/ExpenditureSummary.js`)

Pre-aggregated document rebuilt every time data is uploaded. This is what the dashboard reads.

```js
const mongoose = require('mongoose');
const ExpenditureSummarySchema = new mongoose.Schema({
  year:        { type: Number, required: true },
  quarter:     { type: String, enum: ['Q1','Q2','Q3','Q4'], required: true },
  headCode:    { type: String, required: true },   // allocation code
  headName:    { type: String, required: true },   // allocDesc
  totalBilled: { type: Number, default: 0 },
  totalPassed: { type: Number, default: 0 },
  totalPOValue:{ type: Number, default: 0 },
  recordCount: { type: Number, default: 0 },
  updatedAt:   { type: Date, default: Date.now }
});
ExpenditureSummarySchema.index({ year: 1, quarter: 1, headCode: 1 }, { unique: true });
module.exports = mongoose.model('ExpenditureSummary', ExpenditureSummarySchema);
```

---

## Step 2 — Excel Parsers

### parsePurchaseOrders.js  (`server/services/parsePurchaseOrders.js`)

```
- Read the xlsx file using the `xlsx` npm package.
- Skip row 1 (header). Parse from row 2 onward.
- Column mapping (0-indexed):
    0  → poKey         (string)
    1  → poNo          (number)
    2  → poDate        (parse with new Date(), extract year + quarter)
    3  → vname
    4  → ns
    5  → poValueUnit   (parseFloat)
    6  → plNo
    7  → description
    8  → poSr          (parseInt)
    9  → consnm
    10 → poQty         (parseFloat)
    11 → dpdt          (parse date)
    12 → shortName
    13 → supgey
    14 → canQty        (parseFloat, default 0)
    15 → rly
    16 → insp
    17 → agency
    18 → pv1           (parseFloat, default 0)
    19 → istat
    20 → dpStart       (parse date, nullable)
    21 → qtyRnoi       (parseFloat)
    22 → stkNs
    23 → tend
    24 → tyi
    25 → ai
    26 → rate          (parseFloat)
- Derive year and quarter from poDate:
    Q1 = Jan–Mar, Q2 = Apr–Jun, Q3 = Jul–Sep, Q4 = Oct–Dec
- Skip rows where poNo is missing or NaN.
- Use bulkWrite with upsert on { poNo } as the unique key.
- Return { inserted, updated, skipped } counts.
```

### parseBillExpenditure.js  (`server/services/parseBillExpenditure.js`)

```
- Row 1 is a workbook ID header (e.g. "120301260000433") — skip it.
- Row 2 is the column header row.
- Parse from row 3 onward.
- Column mapping (0-indexed):
    0  → (row number, ignore)
    1  → partyName
    2  → a0
    3  → srp
    4  → spursc
    5  → billAmount    (parseFloat, required)
    6  → passedAmount  (parseFloat)
    7  → deductedAmount(parseFloat)
    8  → betAmount     (parseFloat)
    9  → coNumber      (string)
    10 → voucherDate   (parse date, extract year + quarter)
    11 → allocation
    12 → allocDesc
    13 → pmtContr
    14 → allocAmount   (parseFloat)
- Skip rows where billAmount is missing or NaN.
- Use bulkWrite with upsert on { coNumber } as the unique key.
- Return { inserted, updated, skipped } counts.
```

### buildSummaries.js  (`server/services/buildSummaries.js`)

Called automatically after either parser completes. Rebuilds `ExpenditureSummary` collection.

```
- Drop the ExpenditureSummary collection.
- Run a MongoDB aggregation on BillExpenditure, grouped by { year, quarter, allocation, allocDesc }.
- For each group, sum: totalBilled, totalPassed, recordCount.
- Join with PurchaseOrder aggregation (group by { year, quarter, agency }) for totalPOValue.
- Insert all result documents into ExpenditureSummary.
```

---

## Step 3 — Express API Routes

### `server/routes/expenditure.js`

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/expenditure/upload/po` | Upload Purchase Orders xlsx |
| POST | `/api/expenditure/upload/bill` | Upload Bill Expenditure xlsx |
| GET | `/api/expenditure/summary` | Stat cards: total, highest head, avg quarterly, head count |
| GET | `/api/expenditure/quarterly` | Grouped by year+quarter for bar chart |
| GET | `/api/expenditure/by-head` | Grouped by headName for horizontal bar chart |
| GET | `/api/expenditure/distribution` | Percentage share per head for donut chart |
| GET | `/api/expenditure/raw` | Paginated raw BillExpenditure records |
| GET | `/api/expenditure/filters` | Returns distinct years, quarters, headCodes for dropdown population |

All GET routes accept optional query params: `?year=&quarter=&headCode=`

After each POST upload, call `buildSummaries()` before returning the response.

### `server/routes/forecast.js`

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/forecast` | Fetch last 8 quarters from ExpenditureSummary, POST to Flask, return prediction |

---

## Step 4 — Flask ML Microservice

### File: `ml/app.py`

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from train import predict_next_quarter

app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    historical = data.get('historical', [])
    result = predict_next_quarter(historical)
    return jsonify(result)

if __name__ == '__main__':
    app.run(port=5001, debug=True)
```

### File: `ml/train.py`

```python
import numpy as np
from sklearn.ensemble import RandomForestRegressor

QUARTER_MAP = {'Q1': 1, 'Q2': 2, 'Q3': 3, 'Q4': 4}

def build_features(historical):
    """
    historical: list of { year: int, quarter: str, amount: float }
    Sorted by year+quarter ascending before feature building.
    Returns X (features) and y (targets) as numpy arrays.
    
    Features per row: [time_index, quarter_number, lag_1, lag_2]
      - time_index: sequential int starting at 1
      - quarter_number: 1–4
      - lag_1: amount from previous quarter (0 if unavailable)
      - lag_2: amount from 2 quarters back (0 if unavailable)
    """
    # sort
    data = sorted(historical, key=lambda r: (r['year'], QUARTER_MAP[r['quarter']]))
    amounts = [r['amount'] for r in data]
    X, y = [], []
    for i, row in enumerate(data):
        t = i + 1
        q = QUARTER_MAP[row['quarter']]
        lag1 = amounts[i-1] if i >= 1 else 0
        lag2 = amounts[i-2] if i >= 2 else 0
        X.append([t, q, lag1, lag2])
        y.append(row['amount'])
    return np.array(X), np.array(y), data, amounts

def predict_next_quarter(historical):
    if len(historical) < 4:
        # Fallback: 3-period simple moving average
        amounts = [r['amount'] for r in sorted(
            historical, key=lambda r: (r['year'], QUARTER_MAP[r['quarter']])
        )]
        predicted = round(sum(amounts[-3:]) / min(3, len(amounts)), 2)
        last = amounts[-1]
        growth = round(((predicted - last) / last) * 100, 1) if last else 0
        last_row = sorted(historical, key=lambda r: (r['year'], QUARTER_MAP[r['quarter']]))[-1]
        next_q, next_y = next_quarter_label(last_row['quarter'], last_row['year'])
        return {
            'predicted_amount': predicted,
            'growth_rate': growth,
            'model_used': 'MovingAverage',
            'projection_label': f'{next_q} {next_y}',
            'confidence': 'low'
        }

    X, y, data, amounts = build_features(historical)

    # Train Random Forest
    model = RandomForestRegressor(n_estimators=200, random_state=42)
    model.fit(X, y)

    # Predict next quarter
    last_row = data[-1]
    next_q, next_y = next_quarter_label(last_row['quarter'], last_row['year'])
    next_t = len(data) + 1
    next_q_num = QUARTER_MAP[next_q]
    lag1 = amounts[-1]
    lag2 = amounts[-2] if len(amounts) >= 2 else 0

    pred = model.predict([[next_t, next_q_num, lag1, lag2]])[0]
    predicted = round(float(pred), 2)
    growth = round(((predicted - lag1) / lag1) * 100, 1) if lag1 else 0

    # Confidence: high if enough data, medium otherwise
    confidence = 'high' if len(historical) >= 8 else 'medium'

    return {
        'predicted_amount': predicted,
        'growth_rate': growth,
        'model_used': 'RandomForestRegressor',
        'projection_label': f'{next_q} {next_y}',
        'confidence': confidence,
        'feature_importance': dict(zip(
            ['time_index', 'quarter_number', 'lag_1', 'lag_2'],
            [round(v, 4) for v in model.feature_importances_]
        ))
    }

def next_quarter_label(quarter, year):
    q_num = QUARTER_MAP[quarter]
    if q_num == 4:
        return 'Q1', year + 1
    return f'Q{q_num + 1}', year
```

### File: `ml/requirements.txt`
```
flask
flask-cors
scikit-learn
numpy
pandas
```

---

## Step 5 — React Frontend

### Navbar (`components/Navbar.jsx`)
- Fixed top bar with BLW logo text on left.
- Right-side links: Overview | Settings (use React Router `<Link>`).
- Active link highlighted. Respect current theme from ThemeContext.

### Dashboard Page (`pages/Dashboard.jsx`)
Layout:
1. **Filter bar** — three dropdowns: Year, Quarter, Head Code. Populated from `/api/expenditure/filters`. On change, refetch all data.
2. **Stat cards row** — four cards: Total Expenditure | Highest Spending Head | Avg Quarterly Expenditure | Total Budget Heads.
3. **Charts row** — three panels: Quarterly Expenditure (bar) | Head-wise Expenditure (horizontal bar) | Expenditure Distribution (donut).
4. **Forecast section** — two cards: Predicted Next Quarter Expenditure | Expected Growth Rate.

### StatCard (`components/StatCard.jsx`)
Props: `{ label, value, sub }`. Displays label small + value large (₹ formatted) + optional sub-label.

### Charts — use Recharts
- `QuarterlyChart.jsx` — `<BarChart>` X-axis labels as `Q1 2024`, `Q2 2024`, etc. Data from `/api/expenditure/quarterly`.
- `HeadWiseChart.jsx` — `<BarChart layout="vertical">` sorted descending. Data from `/api/expenditure/by-head`.
- `DistributionChart.jsx` — `<PieChart>` donut style with legend. Data from `/api/expenditure/distribution`.

Show skeleton loader while fetching. Show "No data available" if API returns empty array.

### ForecastSection (`components/ForecastSection.jsx`)
- On mount, call `/api/forecast`.
- Render predicted amount in large ₹ format.
- Render growth rate with `+` prefix and green if positive, red if negative.
- Show confidence badge (High / Medium / Low).
- Expandable "More..." section showing model name and feature importances.

### Settings Page (`pages/Settings.jsx`)
- Theme selector: Light | Dark | Government Blue.
- Currency display toggle: ₹ symbol vs "INR".
- Two separate upload buttons: one for Purchase Orders xlsx, one for Bill Expenditure xlsx.
- Each upload shows a progress state and result summary (rows inserted/updated/skipped).
- Changes persist to `localStorage`.

### Overview Page (`pages/Overview.jsx`)
Static page. Use content from `aboutModule.md`.

---

## Step 6 — Environment Variables

`.env.example`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/blw_expenditure
FLASK_URL=http://localhost:5001
CLIENT_URL=http://localhost:5173
```

---

## Step 7 — Vite Proxy

`client/vite.config.js`: proxy `/api` → `http://localhost:5000`.

---

## Libraries to Install

### Server
```
express mongoose dotenv cors multer xlsx morgan axios
```

### Client
```
react react-dom react-router-dom axios recharts
```

### ML
```
flask flask-cors scikit-learn numpy pandas
```

### Root (dev convenience)
```
concurrently   # run all three services with one command
```

Root `package.json` scripts:
```json
"dev": "concurrently \"npm run server\" \"npm run client\" \"npm run ml\"",
"server": "cd server && node app.js",
"client": "cd client && vite",
"ml": "cd ml && python app.py"
```

---

## Testing Checklist

- [ ] POST `/api/expenditure/upload/po` with PO xlsx returns `{ inserted, updated, skipped }`
- [ ] POST `/api/expenditure/upload/bill` with Bill xlsx returns same
- [ ] After both uploads, ExpenditureSummary collection is populated in MongoDB Compass
- [ ] GET `/api/expenditure/summary` returns all four stat values (non-zero)
- [ ] GET `/api/expenditure/quarterly` returns array sorted by year+quarter
- [ ] GET `/api/expenditure/filters` returns distinct years, quarters, headCodes
- [ ] Flask `POST /predict` called directly returns valid JSON with `predicted_amount`
- [ ] Dashboard stat cards all populated, no placeholder text visible
- [ ] All three charts render with actual data
- [ ] Forecast shows amount, growth rate, confidence badge
- [ ] Filter dropdowns update all charts and stats simultaneously
- [ ] Theme toggle from Settings changes dashboard appearance

---

## What NOT to Do

- Do not hardcode any data values. Everything reads from MongoDB.
- Do not use `create-react-app`. Use Vite.
- Do not put API call logic inside React components. Keep it in `src/api/expenditureApi.js`.
- Do not use Logistic Regression for the forecast — it is a classifier. Use Random Forest Regressor.
- Do not merge both Excel schemas into one Mongoose model. Keep PurchaseOrder and BillExpenditure separate.
- Do not skip `buildSummaries.js`. The dashboard reads from ExpenditureSummary, not raw collections.
