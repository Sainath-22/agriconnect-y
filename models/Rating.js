// models/Rating.js
const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  consumer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  rating: { type: Number, min: 1, max: 5, required: true }, // 1-5 stars
  review: { type: String, maxlength: 500 }, // Optional review text
  productName: String, // Name of product being rated
  categories: [String], // Tags: "Quality", "Delivery", "Communication", "Value"
  helpful: { type: Number, default: 0 }, // Count of helpful votes
  isVerifiedPurchase: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Rating", RatingSchema);
