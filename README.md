# BLW Expenditure Analysis Module

Internal expenditure analytics prototype for Banaras Locomotive Works.

## Local Setup

1. Start MongoDB locally:
   ```powershell
   mongod --dbpath C:\data\db
   ```
2. Install JavaScript dependencies:
   ```powershell
   npm run install:all
   ```
3. Install Python dependencies:
   ```powershell
   cd ml
   python -m pip install -r requirements.txt
   ```
4. Copy `.env.example` to `.env` and adjust values only if needed.
5. Run all services:
   ```powershell
   npm run dev
   ```

The React app runs on `http://localhost:5173`, Express on `http://localhost:5000`, and Flask on `http://localhost:5001`.

## Data Upload

Use the Settings page to upload:

- `BLW_PurchaseOrders*.xlsx`
- `BLW_BillExpenditureData*.xlsx`

Dashboard expenditure totals use `PASSEDAM` as the primary actual expenditure metric.
