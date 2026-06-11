# BLW Forecast Service

Small Flask service for next-quarter expenditure forecasting.

```powershell
python -m pip install -r requirements.txt
python app.py
```

Endpoint:

- `POST /predict` with `{ "historical": [{ "year": 2026, "quarter": "Q2", "amount": 100000 }] }`
