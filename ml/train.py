import numpy as np
from sklearn.ensemble import RandomForestRegressor

QUARTER_MAP = {"Q1": 1, "Q2": 2, "Q3": 3, "Q4": 4}


def _clean_historical(historical):
    cleaned = []
    for row in historical:
        quarter = row.get("quarter")
        if quarter not in QUARTER_MAP:
            continue
        try:
            cleaned.append(
                {
                    "year": int(row.get("year")),
                    "quarter": quarter,
                    "amount": float(row.get("amount", 0)),
                }
            )
        except (TypeError, ValueError):
            continue
    return sorted(cleaned, key=lambda r: (r["year"], QUARTER_MAP[r["quarter"]]))


def next_quarter_label(quarter, year):
    q_num = QUARTER_MAP[quarter]
    if q_num == 4:
        return "Q1", year + 1
    return f"Q{q_num + 1}", year


def build_features(historical):
    data = _clean_historical(historical)
    amounts = [row["amount"] for row in data]
    x_values = []
    y_values = []

    for index, row in enumerate(data):
        x_values.append(
            [
                index + 1,
                QUARTER_MAP[row["quarter"]],
                amounts[index - 1] if index >= 1 else 0,
                amounts[index - 2] if index >= 2 else 0,
            ]
        )
        y_values.append(row["amount"])

    return np.array(x_values), np.array(y_values), data, amounts


def predict_next_quarter(historical):
    data = _clean_historical(historical)
    if not data:
        return {
            "predicted_amount": 0,
            "growth_rate": 0,
            "model_used": "NoData",
            "projection_label": "No data",
            "confidence": "low",
        }

    if len(data) < 4:
        amounts = [row["amount"] for row in data]
        window = amounts[-3:]
        predicted = round(sum(window) / len(window), 2)
        last = amounts[-1]
        growth = round(((predicted - last) / last) * 100, 1) if last else 0
        next_q, next_y = next_quarter_label(data[-1]["quarter"], data[-1]["year"])
        return {
            "predicted_amount": predicted,
            "growth_rate": growth,
            "model_used": "MovingAverage",
            "projection_label": f"{next_q} {next_y}",
            "confidence": "low",
        }

    x_values, y_values, data, amounts = build_features(data)
    model = RandomForestRegressor(n_estimators=200, random_state=42)
    model.fit(x_values, y_values)

    next_q, next_y = next_quarter_label(data[-1]["quarter"], data[-1]["year"])
    next_features = [
        len(data) + 1,
        QUARTER_MAP[next_q],
        amounts[-1],
        amounts[-2] if len(amounts) >= 2 else 0,
    ]
    predicted = round(float(model.predict([next_features])[0]), 2)
    last = amounts[-1]
    growth = round(((predicted - last) / last) * 100, 1) if last else 0
    confidence = "high" if len(data) >= 8 else "medium"

    return {
        "predicted_amount": predicted,
        "growth_rate": growth,
        "model_used": "RandomForestRegressor",
        "projection_label": f"{next_q} {next_y}",
        "confidence": confidence,
        "feature_importance": dict(
            zip(
                ["time_index", "quarter_number", "lag_1", "lag_2"],
                [round(float(value), 4) for value in model.feature_importances_],
            )
        ),
    }
