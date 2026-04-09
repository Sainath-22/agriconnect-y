import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import datetime

# Generate sample historical price data
def generate_sample_data():
    np.random.seed(42)

    # Product categories
    categories = ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Meat']
    products = {
        'Vegetables': ['Tomatoes', 'Potatoes', 'Onions', 'Carrots', 'Spinach'],
        'Fruits': ['Apples', 'Bananas', 'Oranges', 'Mangoes', 'Grapes'],
        'Grains': ['Rice', 'Wheat', 'Corn', 'Barley', 'Oats'],
        'Dairy': ['Milk', 'Cheese', 'Butter', 'Yogurt', 'Cream'],
        'Meat': ['Chicken', 'Beef', 'Pork', 'Fish', 'Lamb']
    }

    # Seasons
    seasons = ['Winter', 'Spring', 'Summer', 'Monsoon', 'Autumn']

    # Market demand levels
    demand_levels = ['low', 'medium', 'high']

    # Weather impacts
    weather_impacts = ['none', 'low', 'medium', 'high']

    data = []

    # Generate data for 2 years
    start_date = datetime.datetime(2022, 1, 1)
    end_date = datetime.datetime(2024, 1, 1)

    current_date = start_date
    while current_date < end_date:
        for category in categories:
            for product in products[category]:
                # Base price varies by product and category
                base_price = np.random.uniform(20, 200)

                # Seasonal variation
                season_multiplier = {
                    'Winter': 1.2,
                    'Spring': 1.0,
                    'Summer': 0.9,
                    'Monsoon': 0.8,
                    'Autumn': 1.1
                }[seasons[current_date.month % 5]]

                # Demand variation
                demand = np.random.choice(demand_levels)
                demand_multiplier = {'low': 0.8, 'medium': 1.0, 'high': 1.3}[demand]

                # Weather impact
                weather = np.random.choice(weather_impacts)
                weather_multiplier = {'none': 1.0, 'low': 0.95, 'medium': 0.9, 'high': 0.85}[weather]

                # Random fluctuation
                random_factor = np.random.uniform(0.9, 1.1)

                # Calculate final price
                price = base_price * season_multiplier * demand_multiplier * weather_multiplier * random_factor
                price = round(price, 2)

                data.append({
                    'date': current_date.strftime('%Y-%m-%d'),
                    'product_name': product,
                    'category': category,
                    'season': seasons[current_date.month % 5],
                    'market_demand': demand,
                    'weather_impact': weather,
                    'base_price': base_price,
                    'price': price,
                    'month': current_date.month,
                    'year': current_date.year,
                    'day_of_year': current_date.timetuple().tm_yday
                })

        # Move to next week
        current_date += datetime.timedelta(days=7)

    return pd.DataFrame(data)

# Create and train the model
def train_price_prediction_model():
    print("🔄 Generating sample historical data...")
    df = generate_sample_data()

    # Save sample data for reference
    df.to_csv('price_history_data.csv', index=False)
    print(f"✅ Generated {len(df)} historical price records")

    # Encode categorical variables
    le_category = LabelEncoder()
    le_season = LabelEncoder()
    le_demand = LabelEncoder()
    le_weather = LabelEncoder()
    le_product = LabelEncoder()

    df['category_enc'] = le_category.fit_transform(df['category'])
    df['season_enc'] = le_season.fit_transform(df['season'])
    df['demand_enc'] = le_demand.fit_transform(df['market_demand'])
    df['weather_enc'] = le_weather.fit_transform(df['weather_impact'])
    df['product_enc'] = le_product.fit_transform(df['product_name'])

    # Features for prediction
    features = [
        'category_enc', 'season_enc', 'demand_enc', 'weather_enc',
        'product_enc', 'month', 'year', 'day_of_year', 'base_price'
    ]

    X = df[features]
    y = df['price']

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Train model
    print("🔄 Training Random Forest Regressor...")
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=20,
        random_state=42,
        n_jobs=-1
    )

    model.fit(X_train_scaled, y_train)

    # Evaluate model
    y_pred = model.predict(X_test_scaled)
    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print("📊 Model Performance:")
    print(f"   Mean Absolute Error: {mae:.2f}")
    print(f"   Mean Squared Error: {mse:.2f}")
    print(f"   R² Score: {r2:.4f}")

    # Save model and encoders
    model_data = {
        'model': model,
        'scaler': scaler,
        'le_category': le_category,
        'le_season': le_season,
        'le_demand': le_demand,
        'le_weather': le_weather,
        'le_product': le_product,
        'features': features,
        'performance': {
            'mae': mae,
            'mse': mse,
            'r2': r2
        }
    }

    joblib.dump(model_data, 'price_prediction_model.pkl')
    print("✅ Model saved as 'price_prediction_model.pkl'")

    return model_data

if __name__ == "__main__":
    train_price_prediction_model()