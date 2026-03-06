const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const User = require("../models/User");
const crypto = require("crypto");

// ============================================
// UPI Payment Handler
// ============================================

// Detect available UPI apps and redirect
router.post("/initiate-upi", async (req, res) => {
  try {
    const { orderId, amount, buyerUPI } = req.body;

    if (!orderId || !amount || !buyerUPI) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate UPI format (basic validation)
    if (!buyerUPI.match(/^[a-zA-Z0-9._-]+@[a-zA-Z]+$/)) {
      return res.status(400).json({ message: "Invalid UPI ID format" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Generate transaction reference
    const transactionRef = `AGRI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Generate UPI deep links for different apps
    const upiLink = `upi://pay?pa=${process.env.FARMER_UPI || "agriconnect@okhdfcbank"}&pn=AgriConnect&am=${amount}&tn=Order%20${orderId}&tr=${transactionRef}`;

    const deepLinks = {
      phonepe: `phonepe://pay?pa=${process.env.FARMER_UPI || "agriconnect@okhdfcbank"}&pn=AgriConnect&am=${amount}&tn=Order%20${orderId}`,
      googlepay: `tez://upi/pay?pa=${process.env.FARMER_UPI || "agriconnect@okhdfcbank"}&pn=AgriConnect&am=${amount}&tr=${transactionRef}`,
      paytm: `paytmmp://money/payment?to=${process.env.FARMER_UPI || "agriconnect@okhdfcbank"}&amount=${amount}`,
      whatsapp: `https://api.whatsapp.com/send?phone=${process.env.FARMER_PHONE || "919999999999"}&text=UPI%20Payment%20Request%20for%20Order%20${orderId}%20-%20Amount:%20₹${amount}`,
      generic: upiLink
    };

    // Update order with pending payment
    order.paymentMode = "upi";
    order.paymentStatus = "Pending";
    order.paymentId = transactionRef;
    await order.save();

    res.json({
      message: "UPI payment links generated",
      orderId,
      amount,
      transactionRef,
      deepLinks,
      upiId: buyerUPI
    });

  } catch (err) {
    console.error("UPI initiation error:", err);
    res.status(500).json({ message: "Error initiating UPI payment" });
  }
});

// ============================================
// PhonePe Payment Handler
// ============================================

router.post("/initiate-phonepe", async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Generate transaction ID
    const transactionId = `AGRI-PHONEPE-${Date.now()}`;

    // PhonePe Standard API (requires merchant account)
    // For now, we'll create a redirect URL
    const redirectUrl = `https://www.phonepe.com/pay?${new URLSearchParams({
      merchantId: process.env.PHONEPE_MERCHANT_ID || "demo",
      orderId: orderId,
      amount: amount * 100, // Amount in paise
      successUrl: `${process.env.APP_URL || "http://localhost:5000"}/payment-success?orderId=${orderId}`,
      failureUrl: `${process.env.APP_URL || "http://localhost:5000"}/payment-failure?orderId=${orderId}`
    }).toString()}`;

    // Update order
    order.paymentMode = "phonepe";
    order.paymentStatus = "Pending";
    order.paymentId = transactionId;
    await order.save();

    res.json({
      message: "PhonePe payment initiated",
      orderId,
      amount,
      transactionId,
      redirectUrl,
      appLink: `phonepe://pay?pa=${process.env.FARMER_UPI || "agriconnect@okhdfcbank"}&pn=AgriConnect&am=${amount}&tn=Order%20${orderId}`
    });

  } catch (err) {
    console.error("PhonePe error:", err);
    res.status(500).json({ message: "Error initiating PhonePe payment" });
  }
});

// ============================================
// Google Pay Handler
// ============================================

router.post("/initiate-googlepay", async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const transactionId = `AGRI-GPAY-${Date.now()}`;

    // Google Pay UPI deep link
    const upiLink = `upi://pay?pa=${process.env.FARMER_UPI || "agriconnect@okhdfcbank"}&pn=AgriConnect%20Farmer&am=${amount}&tn=Order%20${orderId}&tr=${transactionId}`;

    // Update order
    order.paymentMode = "googlepay";
    order.paymentStatus = "Pending";
    order.paymentId = transactionId;
    await order.save();

    res.json({
      message: "Google Pay payment initiated",
      orderId,
      amount,
      transactionId,
      upiLink,
      appLink: `tez://upi/pay?pa=${process.env.FARMER_UPI || "agriconnect@okhdfcbank"}&pn=AgriConnect&am=${amount}&tr=${transactionId}`
    });

  } catch (err) {
    console.error("Google Pay error:", err);
    res.status(500).json({ message: "Error initiating Google Pay payment" });
  }
});

// ============================================
// PayTM Handler
// ============================================

router.post("/initiate-paytm", async (req, res) => {
  try {
    const { orderId, amount, customerPhone } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const transactionId = `AGRI-PAYTM-${Date.now()}`;

    // PayTM redirect (requires merchant account setup)
    const paytmUrl = `https://securegw.paytm.in/web/merchantpgp?${new URLSearchParams({
      MERCHANT_ID: process.env.PAYTM_MERCHANT_ID || "AgriConnect",
      ORDER_ID: orderId,
      CUST_ID: customerPhone,
      TXN_AMOUNT: amount,
      CHANNEL_ID: "WEB",
      WEBSITE: process.env.PAYTM_WEBSITE || "DEFAULT"
    }).toString()}`;

    // Update order
    order.paymentMode = "paytm";
    order.paymentStatus = "Pending";
    order.paymentId = transactionId;
    await order.save();

    res.json({
      message: "PayTM payment initiated",
      orderId,
      amount,
      transactionId,
      redirectUrl: paytmUrl,
      appLink: `paytmmp://money/payment?to=${process.env.FARMER_UPI || "agriconnect@okhdfcbank"}&amount=${amount}`
    });

  } catch (err) {
    console.error("PayTM error:", err);
    res.status(500).json({ message: "Error initiating PayTM payment" });
  }
});

// ============================================
// Simulate Payment Success (for testing)
// ============================================

router.post("/verify-payment", async (req, res) => {
  try {
    const { orderId, transactionId, paymentMode } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: "Completed",
        status: "Confirmed",
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Send confirmation emails (optional - implement later)
    console.log(`✅ Payment verified for Order ${orderId} via ${paymentMode}`);

    res.json({
      message: "Payment verified successfully",
      order
    });

  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ message: "Error verifying payment" });
  }
});

// ============================================
// Payment Status Check
// ============================================

router.get("/status/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      orderId: order._id,
      paymentStatus: order.paymentStatus,
      paymentMode: order.paymentMode,
      amount: order.totalAmount,
      transactionId: order.paymentId,
      orderStatus: order.status
    });

  } catch (err) {
    console.error("Status check error:", err);
    res.status(500).json({ message: "Error checking payment status" });
  }
});

module.exports = router;
