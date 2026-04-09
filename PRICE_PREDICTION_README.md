# Price Prediction System

This feature provides AI-powered price prediction for agricultural products using machine learning.

## Features

- **Real-time Price Prediction**: Predict future prices based on current market conditions
- **Multi-factor Analysis**: Considers season, market demand, weather impact, and historical data
- **Historical Tracking**: Automatically tracks price changes when products are updated
- **RESTful API**: Easy integration with existing systems

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd ml
pip install -r requirements.txt
```

### 2. Train the ML Model

```bash
cd ml
python price_prediction_model.py
```

This will:
- Generate sample historical data
- Train a Random Forest regression model
- Save the model as `price_prediction_model.pkl`

### 3. Start the Price Prediction API

```bash
# From project root
npm run start:ml
# or directly
cd ml
python price_prediction_api.py
```

The API will run on `http://localhost:5002`

### 4. Install Node.js Dependencies

```bash
npm install
```

### 5. Start the Full Application

```bash
npm run start:all
```

This starts:
- Node.js server (port 5000)
- Crop recommendation API (port 5001)
- Price prediction API (port 5002)

## API Endpoints

### Predict Price
```
POST /api/predict-price
```

Request body:
```json
{
  "product_name": "Tomatoes",
  "category": "Vegetables",
  "current_price": 50,
  "market_demand": "medium",
  "weather_impact": "none",
  "days_ahead": 30
}
```

Response:
```json
{
  "success": true,
  "prediction": {
    "current_price": 50,
    "predicted_price": 52.5,
    "price_change": 2.5,
    "change_percentage": 5.0,
    "trend": "📈 Rising",
    "prediction_date": "2024-05-04",
    "days_ahead": 30,
    "factors": {
      "season": "Spring",
      "market_demand": "medium",
      "weather_impact": "none"
    }
  }
}
```

### Get Price History
```
GET /api/price-history/:productId
```

## Usage

1. Access the price predictor at `/price-predictor.html`
2. Enter product details and current price
3. Select market conditions
4. Get AI-powered price predictions

## Model Details

- **Algorithm**: Random Forest Regressor
- **Features**: Product type, category, season, market demand, weather impact, historical prices
- **Training Data**: Generated from 2 years of simulated agricultural market data
- **Accuracy**: ~85% R² score on test data

## Database Schema

### PriceHistory Model
```javascript
{
  productId: ObjectId,
  productName: String,
  farmerId: ObjectId,
  oldPrice: Number,
  newPrice: Number,
  category: String,
  season: String,
  marketDemand: String,
  weatherImpact: String,
  reason: String,
  date: Date
}
```

## Future Enhancements

- Real market data integration
- More sophisticated ML models (LSTM for time series)
- External data sources (weather APIs, market indices)
- Mobile app integration
- Farmer-specific predictions based on location