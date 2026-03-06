const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
  from: { type: String, required: true },   // sender username
  to: { type: String, required: true },     // receiver username
  message: { type: String, required: true },
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
