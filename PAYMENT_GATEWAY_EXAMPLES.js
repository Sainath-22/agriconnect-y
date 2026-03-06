// ============================================
// Real Payment Gateway Integration Examples
// ============================================
// This file contains examples for integrating with real payment providers
// Copy relevant sections to /routes/payment.js when ready for production

// ============================================
// 1. PHONEPE PRODUCTION INTEGRATION
// ============================================

/*
Install: npm install axios crypto

Production PhonePe Implementation:

const axios = require('axios');
const crypto = require('crypto');

// PhonePe Configuration
const PHONEPE_HOST_URL = "https://api.phonepe.com";
const PHONEPE_APP_ID = process.env.PHONEPE_MERCHANT_ID;
const PHONEPE_MERCHANT_KEY = process.env.PHONEPE_API_KEY;

async function initiatePhonePePayment(req, res) {
  try {
    const { orderId, amount, buyerEmail, buyerPhone } = req.body;
    
    const merchantTransactionId = `AGRI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const userId = req.session.user.id;

    // Prepare payload
    const payload = {
      merchantId: PHONEPE_APP_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: userId,
      amount: amount * 100, // Convert to paise
      redirectUrl: `${process.env.APP_URL}/payment-callback`,
      redirectMode: "REDIRECT",
      callbackUrl: `${process.env.APP_URL}/api/payment/phonepe-callback`,
      mobileNumber: buyerPhone,
      paymentInstrument: {
        type: "UPI_QR"
      }
    };

    // Encode payload
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
    
    // Create checksum
    const checksum = crypto
      .createHash('sha256')
      .update(encodedPayload + '/pg/v1/pay' + PHONEPE_MERCHANT_KEY)
      .digest('hex');

    // Call PhonePe API
    const response = await axios.post(
      `${PHONEPE_HOST_URL}/apis/hermes/pg/v1/pay`,
      { request: encodedPayload },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': `${checksum}###1`
        }
      }
    );

    // Update order with transaction ID
    await Order.findByIdAndUpdate(orderId, {
      paymentMode: 'phonepe',
      paymentId: merchantTransactionId,
      paymentStatus: 'Pending'
    });

    res.json({
      success: true,
      data: response.data,
      redirectUrl: response.data.data.instrumentResponseData.redirectUrl
    });

  } catch (err) {
    console.error('PhonePe Error:', err);
    res.status(500).json({ success: false, message: 'Payment initiation failed' });
  }
}

// PhonePe Callback Handler
async function phonepeCallback(req, res) {
  try {
    const { code, merchantTransactionId } = req.query;
    
    if (code === 'PAYMENT_SUCCESS') {
      // Verify payment with PhonePe
      const checksum = crypto
        .createHash('sha256')
        .update(`${merchantTransactionId}/pg/v1/status/${PHONEPE_APP_ID}${PHONEPE_MERCHANT_KEY}`)
        .digest('hex');

      const response = await axios.get(
        `${PHONEPE_HOST_URL}/apis/hermes/pg/v1/status/${PHONEPE_APP_ID}/${merchantTransactionId}`,
        {
          headers: {
            'X-VERIFY': `${checksum}###1`,
            'X-MERCHANT-ID': PHONEPE_APP_ID
          }
        }
      );

      if (response.data.success) {
        // Update order status
        const order = await Order.findOneAndUpdate(
          { paymentId: merchantTransactionId },
          {
            paymentStatus: 'Completed',
            status: 'Confirmed'
          },
          { new: true }
        );

        // Redirect to success page
        res.redirect(`/payment-success?orderId=${order._id}`);
      }
    } else {
      // Payment failed
      res.redirect(`/payment-failure?merchantTransactionId=${merchantTransactionId}`);
    }
  } catch (err) {
    console.error('Callback Error:', err);
    res.redirect('/payment-failure');
  }
}
*/

// ============================================
// 2. PAYTM PRODUCTION INTEGRATION
// ============================================

/*
Install: npm install paytmchecksum

Production PayTM Implementation:

const PaytmChecksum = require("paytmchecksum");

const PAYTM_HOST = "https://securegw.paytm.in/";
const PAYTM_MERCHANT_ID = process.env.PAYTM_MERCHANT_ID;
const PAYTM_MERCHANT_KEY = process.env.PAYTM_API_KEY;
const PAYTM_WEBSITE = process.env.PAYTM_WEBSITE || "DEFAULT";

async function initiatePayTMPayment(req, res) {
  try {
    const { orderId, amount, customerPhone, customerEmail } = req.body;

    const paytmParams = {};
    paytmParams.body = {
      requestType: "Payment",
      mid: PAYTM_MERCHANT_ID,
      websiteName: PAYTM_WEBSITE,
      orderId: orderId,
      callbackUrl: `${process.env.APP_URL}/api/payment/paytm-callback`,
      txnAmount: {
        value: amount.toString(),
        currency: "INR"
      },
      userInfo: {
        custId: customerPhone
      }
    };

    // Generate checksum
    const checksum = await PaytmChecksum.generateSignature(
      JSON.stringify(paytmParams.body),
      PAYTM_MERCHANT_KEY
    );

    paytmParams.head = {
      signature: checksum
    };

    // Update order
    await Order.findByIdAndUpdate(orderId, {
      paymentMode: 'paytm',
      paymentStatus: 'Pending'
    });

    res.json({
      success: true,
      data: paytmParams,
      paymentGatewayURL: PAYTM_HOST + "theia/api/v1/initiateTransaction?mid=" + PAYTM_MERCHANT_ID + "&orderId=" + orderId
    });

  } catch (err) {
    console.error('PayTM Error:', err);
    res.status(500).json({ success: false, message: 'Payment initiation failed' });
  }
}

// PayTM Callback Handler
async function paytmCallback(req, res) {
  try {
    const { ORDERID, STATUS, CHECKSUMHASH } = req.body;

    // Verify checksum
    const isValidChecksum = PaytmChecksum.verifySignatureByString(
      JSON.stringify(req.body),
      PAYTM_MERCHANT_KEY,
      CHECKSUMHASH
    );

    if (isValidChecksum && STATUS === 'TXN_SUCCESS') {
      // Update order
      const order = await Order.findByIdAndUpdate(ORDERID, {
        paymentStatus: 'Completed',
        status: 'Confirmed'
      }, { new: true });

      // Send confirmation
      res.json({ success: true, orderId: ORDERID });
    } else {
      res.json({ success: false, message: 'Payment verification failed' });
    }
  } catch (err) {
    console.error('PayTM Callback Error:', err);
    res.status(500).json({ success: false });
  }
}
*/

// ============================================
// 3. GOOGLE PAY PRODUCTION INTEGRATION
// ============================================

/*
Install: npm install google-pay-api

Production Google Pay Implementation:

const GooglePayAPI = require('google-pay-api');

const GOOGLE_PAY_CONFIG = {
  merchantId: process.env.GOOGLE_MERCHANT_ID,
  merchantName: 'AgriConnect',
  apiVersion: 2,
  apiVersionMinor: 0
};

async function initiateGooglePayPayment(req, res) {
  try {
    const { orderId, amount } = req.body;

    const paymentDataRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
      merchantInfo: {
        merchantName: "AgriConnect"
      },
      allowedPaymentMethods: [
        {
          type: "CARD",
          parameters: {
            allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
            allowedCardNetworks: ["MASTERCARD", "VISA"]
          },
          tokenizationSpecification: {
            type: "PAYMENT_GATEWAY",
            parameters: {
              gateway: "stripe",
              gatewayMerchantId: process.env.STRIPE_MERCHANT_ID
            }
          }
        }
      ],
      transactionInfo: {
        totalPriceStatus: "FINAL",
        totalPrice: amount.toString(),
        currencyCode: "INR",
        transactionId: orderId
      },
      callbackIntents: ["PAYMENT_AUTHORIZATION"],
      shippingAddressRequired: false
    };

    // Update order
    await Order.findByIdAndUpdate(orderId, {
      paymentMode: 'googlepay',
      paymentStatus: 'Pending'
    });

    res.json({
      success: true,
      paymentDataRequest: paymentDataRequest
    });

  } catch (err) {
    console.error('Google Pay Error:', err);
    res.status(500).json({ success: false, message: 'Payment initiation failed' });
  }
}

// Google Pay Payment Handler
async function handleGooglePayToken(req, res) {
  try {
    const { token, orderId } = req.body;

    // Charge using Stripe
    const charge = await stripe.charges.create({
      amount: Math.round(order.totalAmount * 100),
      currency: 'inr',
      source: token
    });

    // Update order
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'Completed',
      status: 'Confirmed',
      paymentId: charge.id
    });

    res.json({ success: true, chargeId: charge.id });

  } catch (err) {
    console.error('Google Pay Token Error:', err);
    res.status(500).json({ success: false });
  }
}
*/

// ============================================
// 4. RAZORPAY ALTERNATIVE INTEGRATION
// ============================================

/*
Install: npm install razorpay

Production Razorpay Implementation (Supports all payment methods):

const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

async function initiateRazorpayPayment(req, res) {
  try {
    const { orderId, amount, buyerEmail, buyerPhone } = req.body;
    const order = await Order.findById(orderId);

    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // Amount in paise
      currency: "INR",
      receipt: orderId.toString(),
      payment_capture: 1,
      notes: {
        orderId: orderId,
        buyerEmail: buyerEmail,
        buyerPhone: buyerPhone
      }
    });

    res.json({
      success: true,
      orderId: razorpayOrder.id,
      key_id: process.env.RAZORPAY_KEY_ID,
      amount: amount * 100,
      email: buyerEmail,
      phone: buyerPhone
    });

  } catch (err) {
    console.error('Razorpay Error:', err);
    res.status(500).json({ success: false });
  }
}

// Razorpay Webhook Handler
async function razorpayWebhook(req, res) {
  try {
    const { event, payload } = req.body;

    if (event === 'payment.authorized') {
      const { payment } = payload;
      
      // Update order
      await Order.findByIdAndUpdate(payment.notes.orderId, {
        paymentStatus: 'Completed',
        status: 'Confirmed',
        paymentId: payment.id
      });

      res.json({ success: true });
    }
  } catch (err) {
    console.error('Webhook Error:', err);
    res.status(500).json({ success: false });
  }
}
*/

// ============================================
// 5. STRIPE INTEGRATION (International)
// ============================================

/*
Install: npm install stripe

Production Stripe Implementation:

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function initiateStripePayment(req, res) {
  try {
    const { orderId, amount, buyerEmail } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'Order #' + orderId
            },
            unit_amount: Math.round(amount * 100)
          },
          quantity: 1
        }
      ],
      customer_email: buyerEmail,
      success_url: `${process.env.APP_URL}/payment-success?orderId=${orderId}`,
      cancel_url: `${process.env.APP_URL}/payment-cancel?orderId=${orderId}`,
      metadata: {
        orderId: orderId
      }
    });

    res.json({
      success: true,
      sessionId: session.id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });

  } catch (err) {
    console.error('Stripe Error:', err);
    res.status(500).json({ success: false });
  }
}

// Stripe Webhook
async function stripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const { metadata } = event.data.object;
      
      await Order.findByIdAndUpdate(metadata.orderId, {
        paymentStatus: 'Completed',
        status: 'Confirmed'
      });
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook Error:', err);
    res.status(400).send();
  }
}
*/

// ============================================
// USAGE INSTRUCTIONS
// ============================================

/*
To use any of these production integrations:

1. Choose your payment gateway
   - PhonePe: Best for Indian UPI market
   - PayTM: Popular in India
   - Google Pay: International + India
   - Razorpay: All payment methods
   - Stripe: International markets

2. Install required package:
   npm install [package-name]

3. Set up environment variables:
   .env file with API keys

4. Copy relevant code to /routes/payment.js

5. Update the payment modal to show correct method

6. Test with sandbox/test credentials

7. Deploy to production

Each gateway has:
- Initiation function (creates payment session)
- Callback handler (verifies payment)
- Database update (saves transaction)
- Error handling (logs failures)

Full documentation:
- PhonePe: https://developer.phonepe.com/
- PayTM: https://developer.paytm.com/
- Google Pay: https://pay.google.com/about/documentation/
- Razorpay: https://razorpay.com/docs/
- Stripe: https://stripe.com/docs/

*/

module.exports = {
  // Export functions if used as module
  // initiatePhonePePayment,
  // initiatePayTMPayment,
  // initiateGooglePayPayment,
  // initiateRazorpayPayment,
  // initiateStripePayment
};
