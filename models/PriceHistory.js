// models/PriceHistory.js
const mongoose = require("mongoose");

const PriceHistorySchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  productName: String,
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  oldPrice: { type: Number, required: true },
  newPrice: { type: Number, required: true },
  category: String,
  location: String, // farmer's location if available
  season: String, // current season
  marketDemand: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  weatherImpact: { type: String, enum: ['none', 'low', 'medium', 'high'], default: 'none' },
  reason: String, // reason for price change
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("PriceHistory", PriceHistorySchema);