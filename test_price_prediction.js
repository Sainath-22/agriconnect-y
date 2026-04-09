// test_price_prediction.js
const axios = require('axios');

async function testPricePrediction() {
  const testCases = [
    {
      product_name: "Tomatoes",
      category: "Vegetables",
      current_price: 50,
      market_demand: "medium",
      weather_impact: "none",
      days_ahead: 30
    },
    {
      product_name: "Rice",
      category: "Grains",
      current_price: 80,
      market_demand: "high",
      weather_impact: "low",
      days_ahead: 60
    },
    {
      product_name: "Apples",
      category: "Fruits",
      current_price: 120,
      market_demand: "low",
      weather_impact: "high",
      days_ahead: 90
    }
  ];

  console.log("🧪 Testing Price Prediction API\n");

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    try {
      console.log(`Test ${i + 1}: ${testCase.product_name} (${testCase.category})`);
      console.log(`Current Price: ₹${testCase.current_price}`);

      const response = await axios.post('http://localhost:5002/predict', testCase);
      const prediction = response.data;

      console.log(`Predicted Price: ₹${prediction.predicted_price}`);
      console.log(`Change: ${prediction.change_percentage > 0 ? '+' : ''}${prediction.change_percentage}%`);
      console.log(`Trend: ${prediction.trend}`);
      console.log(`Factors: Season=${prediction.factors.season}, Demand=${prediction.factors.market_demand}, Weather=${prediction.factors.weather_impact}`);
      console.log("---\n");

    } catch (error) {
      console.error(`❌ Test ${i + 1} failed:`, error.message);
    }
  }
}

testPricePrediction();