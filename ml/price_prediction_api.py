from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)  # Allow frontend to access API

# Get the directory of the current script
script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, "price_prediction_model.pkl")

# Load the trained model
try:
    model_data = joblib.load(model_path)
    model = model_data["model"]
    scaler = model_data["scaler"]
    le_category = model_data["le_category"]
    le_season = model_data["le_season"]
    le_demand = model_data["le_demand"]
    le_weather = model_data["le_weather"]
    le_product = model_data["le_product"]
    features = model_data["features"]
    print("Price prediction model loaded successfully")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

def get_season_from_month(month):
    """Map month to season"""
    seasons = {
        12: 'Winter', 1: 'Winter', 2: 'Winter',
        3: 'Spring', 4: 'Spring', 5: 'Spring',
        6: 'Summer', 7: 'Summer', 8: 'Summer',
        9: 'Monsoon', 10: 'Monsoon', 11: 'Monsoon'
    }
    return seasons.get(month, 'Spring')

@app.route("/predict", methods=["POST"])
def predict_price():
    if not model:
        return jsonify({"error": "Model not loaded"}), 500

    try:
        data = request.get_json()
        print("Prediction request:", data)

        # Extract input parameters
        product_name = data.get("product_name", "").strip()
        category = data.get("category", "").strip()
        current_price = float(data.get("current_price", 0))
        market_demand = data.get("market_demand", "medium").lower()
        weather_impact = data.get("weather_impact", "none").lower()
        prediction_days = int(data.get("days_ahead", 30))  # Days to predict ahead

        # Validate inputs
        if not product_name or not category:
            return jsonify({"error": "Product name and category are required"}), 400

        if current_price <= 0:
            return jsonify({"error": "Valid current price is required"}), 400

        # Get current date info
        now = datetime.now()
        future_date = now.replace(day=min(now.day + prediction_days, 28))  # Avoid invalid dates

        # Prepare features for prediction
        try:
            category_enc = le_category.transform([category])[0]
        except ValueError:
            return jsonify({"error": f"Unknown category: {category}"}), 400

        try:
            product_enc = le_product.transform([product_name])[0]
        except ValueError:
            # If product not in training data, use a default encoding
            product_enc = 0

        season = get_season_from_month(future_date.month)
        try:
            season_enc = le_season.transform([season])[0]
        except ValueError:
            season_enc = le_season.transform(['Spring'])[0]

        try:
            demand_enc = le_demand.transform([market_demand])[0]
        except ValueError:
            demand_enc = le_demand.transform(['medium'])[0]

        try:
            weather_enc = le_weather.transform([weather_impact])[0]
        except ValueError:
            weather_enc = le_weather.transform(['none'])[0]

        # Create feature array
        feature_values = [
            category_enc,      # category_enc
            season_enc,        # season_enc
            demand_enc,        # demand_enc
            weather_enc,       # weather_enc
            product_enc,       # product_enc
            future_date.month, # month
            future_date.year,  # year
            future_date.timetuple().tm_yday,  # day_of_year
            current_price      # base_price
        ]

        # Scale features
        features_scaled = scaler.transform([feature_values])

        # Make prediction
        predicted_price = model.predict(features_scaled)[0]
        predicted_price = round(float(predicted_price), 2)

        # Calculate price change
        price_change = predicted_price - current_price
        change_percentage = round((price_change / current_price) * 100, 2)

        # Determine trend
        if change_percentage > 5:
            trend = "Rising"
        elif change_percentage < -5:
            trend = "Falling"
        else:
            trend = "Stable"

        result = {
            "current_price": current_price,
            "predicted_price": predicted_price,
            "price_change": round(price_change, 2),
            "change_percentage": change_percentage,
            "trend": trend,
            "prediction_date": future_date.strftime("%Y-%m-%d"),
            "days_ahead": prediction_days,
            "factors": {
                "season": season,
                "market_demand": market_demand,
                "weather_impact": weather_impact
            }
        }

        print(f"Prediction: {current_price} -> {predicted_price} ({change_percentage}%)")
        return jsonify(result)

    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy" if model else "unhealthy",
        "model_loaded": model is not None
    })

@app.route("/categories", methods=["GET"])
def get_categories():
    """Get available product categories"""
    if not model:
        return jsonify({"error": "Model not loaded"}), 500

    categories = le_category.classes_.tolist()
    return jsonify({"categories": categories})

@app.route("/products", methods=["GET"])
def get_products():
    """Get available product names"""
    if not model:
        return jsonify({"error": "Model not loaded"}), 500

    products = le_product.classes_.tolist()
    return jsonify({"products": products})

if __name__ == "__main__":
    print("Starting Price Prediction API on port 5002...")
    app.run(port=5002, debug=True, host='0.0.0.0')