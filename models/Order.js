const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  productName: String,
  productPrice: Number,
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sellerName: String,
  sellerEmail: String,
  sellerPhone: String,
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  buyerName: String,
  buyerEmail: String,
  buyerPhone: String,
  buyerAddress: String,
  quantity: Number,
  totalAmount: Number,
  paymentMode: String, // "upi", "phonepe", "googlepay", "paytm", "card", "netbanking"
  paymentStatus: { type: String, default: "Pending" }, // Pending, Completed, Failed
  paymentId: String, // Transaction ID
  status: { type: String, default: "Pending" }, // Order status
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
