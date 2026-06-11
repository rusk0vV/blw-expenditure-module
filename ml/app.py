from flask import Flask, request, jsonify
from flask_cors import CORS
from train import predict_next_quarter

app = Flask(__name__)
CORS(app)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"success": True, "service": "blw-forecast"})


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True) or {}
    historical = data.get("historical", [])
    result = predict_next_quarter(historical)
    return jsonify(result)


if __name__ == "__main__":
    app.run(port=5001, debug=True)
