# 💳 Payment System - Visual Guide & Flow Diagrams

## 🎯 System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AGRICONNECT PAYMENT SYSTEM                       │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│   CONSUMER SIDE      │
├──────────────────────┤
│ 1. View Orders       │
│ 2. See Amount        │
│ 3. Click "Pay Now"   │
│ 4. Select Payment    │
│ 5. Enter Details     │
│ 6. Complete Payment  │
│ 7. Get Confirmation  │
└──────────────────────┘
          ↓
┌──────────────────────────────────────────┐
│        PAYMENT MODAL (Beautiful UI)      │
├──────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐ │
│  │   Amount: ₹500                      │ │
│  ├─────────────────────────────────────┤ │
│  │ UPI [📱]  PhonePe [💳]              │ │
│  │ Google Pay [💰]  PayTM [💳]         │ │
│  │ Net Banking [🏦]                     │ │
│  └─────────────────────────────────────┘ │
└──────────────────────────────────────────┘
          ↓
┌──────────────────────────────────────────┐
│    BACKEND PAYMENT ROUTES (payment.js)  │
├──────────────────────────────────────────┤
│ POST /api/payment/initiate-upi           │
│ POST /api/payment/initiate-phonepe       │
│ POST /api/payment/initiate-googlepay     │
│ POST /api/payment/initiate-paytm         │
│ POST /api/payment/verify-payment         │
│ GET  /api/payment/status/:orderId        │
└──────────────────────────────────────────┘
          ↓
┌──────────────────────────────────────────┐
│      PAYMENT GATEWAYS & UPI APPS         │
├──────────────────────────────────────────┤
│  ┌──────┬──────┬──────┬──────────┐      │
│  │PhonePe│Google │PayTM │WhatsApp│      │
│  │      │Pay   │      │         │      │
│  │ 📱   │ 💰   │ 💳   │    W    │      │
│  └──────┴──────┴──────┴──────────┘      │
└──────────────────────────────────────────┘
          ↓
┌──────────────────────────────────────────┐
│      FARMER'S UPI/BANK ACCOUNT           │
├──────────────────────────────────────────┤
│   Money Received ✅                      │
│   Transaction ID: AGRI-XXXX-XXXX         │
│   Amount: ₹500                           │
└──────────────────────────────────────────┘
          ↓
┌──────────────────────────────────────────┐
│      ORDER STATUS UPDATE                 │
├──────────────────────────────────────────┤
│  Status: Pending → Confirmed ✅           │
│  Payment: Pending → Completed ✅          │
│  Notification: Sent to Farmer             │
└──────────────────────────────────────────┘
```

---

## 🔄 Payment Flow - Step by Step

### Flow 1: UPI Direct Transfer

```
CONSUMER                           BACKEND                    PAYMENT APP
    │                                │                              │
    │─── Click "Pay Now" ───→        │                              │
    │                                │                              │
    │← Opens Payment Modal ───────   │                              │
    │                                │                              │
    │─── Select UPI ─────────────→   │                              │
    │                                │                              │
    │─── Enter UPI ID ───────────→   │                              │
    │  (name@upi)                    │                              │
    │                                │                              │
    │─── Select App ─────────────→   │                              │
    │  (PhonePe/Google Pay/PayTM)    │                              │
    │                                │                              │
    │← Deep Link Generated ──────────│                              │
    │                                │                              │
    │─────────── Redirect to App ────────────────────────────→      │
    │                                │                          Open App
    │                                │                              │
    │                                │                         Enter PIN/
    │                                │                         Biometric
    │                                │                              │
    │                                │          Confirm Payment    │
    │                                │◄─────────────────────────────│
    │                                │                              │
    │                                │─── Transfer to Farmer UPI ──→
    │                                │                              │
    │← Success Page ─────────────────│                              │
    │                                │                              │
    │── Payment Verified ───────────→│                              │
    │                                │                              │
    │   Order Status Updated: ✅     │                              │
    │   Payment Status: Completed    │                              │
```

### Flow 2: Direct Gateway Payment (PhonePe/Google Pay)

```
CONSUMER                   BACKEND              PAYMENT GATEWAY
    │                         │                         │
    │─ Click "PhonePe" ──→    │                         │
    │                         │                         │
    │                         │─ Create Session ──→    │
    │                         │                         │
    │                         │← Session ID ────────   │
    │                         │                         │
    │← Redirect URL ─────     │                         │
    │                         │                         │
    │─ Follow Redirect ──────────────────────────→    │
    │                         │                    Open App/Web
    │                         │                         │
    │                         │            Complete Payment
    │                         │                         │
    │                         │← Callback/Webhook ──   │
    │                         │                         │
    │← Success Page ─────     │                         │
    │                         │                         │
    │  Payment Verified ✅    │                         │
```

---

## 🎨 UI Layout - Payment Modal

```
╔════════════════════════════════════════════════════════╗
║              SELECT PAYMENT METHOD                     ║
║                        ✕                              ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║              Total Amount: ₹500                        ║
║                                                        ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  💳 UPI PAYMENT                                       ║
║  ┌─────────────┐                                      ║
║  │  📱         │                                      ║
║  │   UPI       │  Click to show UPI form              ║
║  │  Direct     │                                      ║
║  └─────────────┘                                      ║
║                                                        ║
║  ═══════════════════════════════════════════════════  ║
║                                                        ║
║  🎯 DIGITAL WALLETS                                  ║
║  ┌──────────┬──────────┬──────────┐                  ║
║  │  📱      │  💰      │   💳    │                  ║
║  │ PhonePe  │Google Pay│  PayTM  │                  ║
║  │Fast&Sec  │ Instant  │ Popular │                  ║
║  └──────────┴──────────┴──────────┘                  ║
║                                                        ║
║  ═══════════════════════════════════════════════════  ║
║                                                        ║
║  🏦 BANK TRANSFER                                    ║
║  ┌──────────────────┐                                ║
║  │       🏦         │                                ║
║  │  Net Banking     │                                ║
║  │   All Banks      │                                ║
║  └──────────────────┘                                ║
║                                                        ║
║  ✅ Your payment is secure and encrypted            ║
║  ✅ Direct transfer to farmer's account             ║
║  ✅ Transaction reference will be provided          ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

### UPI Form (When UPI Selected)

```
╔════════════════════════════════════════════════════════╗
║                                                        ║
║  Enter your UPI ID                                   ║
║  ┌──────────────────────────────────────────────────┐║
║  │ name@upi                                          ││
║  └──────────────────────────────────────────────────┘║
║                                                        ║
║  Available UPI Apps:                                 ║
║  ┌──────┬──────┬──────┬──────┐                      ║
║  │ PP   │ GP   │ PT   │  W   │                      ║
║  │Phone │Google│PayTM │WhatsA│                      ║
║  │  Pe  │ Pay  │      │  pp  │                      ║
║  └──────┴──────┴──────┴──────┘                      ║
║                                                        ║
║  ┌──────────────────────────────────────────────────┐║
║  │     Proceed with UPI                              ││
║  └──────────────────────────────────────────────────┘║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

---

## 📊 Order Card Layout - Payment Status

### Before Payment
```
┌────────────────────────────────────┐
│ 🟠 PENDING      💳 PAYMENT PENDING │
├────────────────────────────────────┤
│                                    │
│ Fresh Vegetables                   │
│ Seller: Farmer John                │
│ Email: john@mail.com               │
│ Phone: +91-9876543210              │
│ Amount: ₹500                       │
│                                    │
│ [Email] [Call] [💬 Chat] [💳 Pay] │
│                                    │
│ 🕒 Feb 3, 2026 10:30 AM            │
│                                    │
└────────────────────────────────────┘
```

### After Payment
```
┌────────────────────────────────────┐
│ ✅ CONFIRMED      ✓ PAID            │
├────────────────────────────────────┤
│                                    │
│ Fresh Vegetables                   │
│ Seller: Farmer John                │
│ Email: john@mail.com               │
│ Phone: +91-9876543210              │
│ Amount: ₹500                       │
│                                    │
│ [Email] [Call] [💬 Chat]           │
│                                    │
│ 🕒 Feb 3, 2026 10:30 AM            │
│                                    │
└────────────────────────────────────┘
```

---

## 🔀 Data Flow Diagram

```
                          CONSUMER
                             ↓
                      ┌──────────────┐
                      │  orders.html │
                      └──────────────┘
                             ↓
              ┌──────────────────────────────┐
              │  Click "💳 Pay Now" Button  │
              └──────────────────────────────┘
                             ↓
              ┌──────────────────────────────┐
              │ payment-handler.js executes │
              │  - Opens payment modal      │
              │  - Displays amount          │
              └──────────────────────────────┘
                             ↓
         ┌───────────────────────────────────────────┐
         │    Choose Payment Method                 │
         ├───────────────────────────────────────────┤
         │ Option 1: UPI       (Deep Link)          │
         │ Option 2: PhonePe   (Gateway API)        │
         │ Option 3: Google Pay (Gateway API)       │
         │ Option 4: PayTM     (Gateway API)        │
         └───────────────────────────────────────────┘
                             ↓
              ┌──────────────────────────────┐
              │  Backend API (payment.js)   │
              │  /api/payment/initiate-*    │
              └──────────────────────────────┘
                             ↓
              ┌──────────────────────────────┐
              │  Database Update (Order)     │
              │  - paymentMode set          │
              │  - paymentStatus: Pending   │
              │  - paymentId generated      │
              └──────────────────────────────┘
                             ↓
         ┌───────────────────────────────────────────┐
         │    Redirect to Payment App/Gateway        │
         └───────────────────────────────────────────┘
                             ↓
              ┌──────────────────────────────┐
              │  Consumer Completes Payment │
              └──────────────────────────────┘
                             ↓
              ┌──────────────────────────────┐
              │  /api/payment/verify-payment │
              └──────────────────────────────┘
                             ↓
              ┌──────────────────────────────┐
              │  Order Status: Confirmed    │
              │  Payment Status: Completed  │
              │  Farmer notified            │
              └──────────────────────────────┘
                             ↓
              ┌──────────────────────────────┐
              │ Success Page Displayed      │
              │ Consumer gets Confirmation  │
              └──────────────────────────────┘
```

---

## 🌍 URL Flow Diagram

```
Browser                          Server
  │                                │
  ├─ GET /orders.html ───────→    │
  │                                │
  │← HTML Response ────────────────┤
  │                                │
  ├─ Click "Pay Now" ──────────→   │
  │                                │
  ├─ payment-handler.js loaded     │
  │                                │
  ├─ POST /api/payment/initiate-upi ──→ payment.js
  │                                │
  │← { deepLinks, orderId } ──────┤
  │                                │
  ├─ redirectToUPIApp('phonepe') ──→ phonepe://...
  │                                │
  │  (User confirms payment)        │
  │                                │
  ├─ POST /api/payment/verify-payment ──→ Update Order
  │                                │
  │← { message: "verified" } ──────┤
  │                                │
  └─ Display success page          │
```

---

## 🔐 Security Flow

```
┌─────────────────────────────────────────────────────┐
│           SECURITY CHECKPOINTS                      │
└─────────────────────────────────────────────────────┘

1. SESSION CHECK
   ↓
   Is user logged in? ✅
   ↓

2. ORDER OWNERSHIP
   ↓
   Does this order belong to user? ✅
   ↓

3. INPUT VALIDATION
   ↓
   UPI format valid? ✅
   Amount valid? ✅
   ↓

4. TRANSACTION ID
   ↓
   Unique ID generated? ✅
   ↓

5. PAYMENT PROCESSING
   ↓
   Via secure gateway? ✅
   ↓

6. ORDER UPDATE
   ↓
   Database updated? ✅
   ↓

7. CONFIRMATION
   ↓
   User notified? ✅
   Farmer notified? ✅
   ↓
   
✅ SECURE PAYMENT COMPLETED
```

---

## 📱 Mobile Flow Diagram

```
┌──────────────────────────────────┐
│     MOBILE DEVICE (Android)      │
├──────────────────────────────────┤
│                                  │
│ [Browser]                        │
│ └─ AgriConnect App               │
│    └─ My Orders                  │
│       └─ Order with "Pay Now"    │
│                                  │
│          [💳 Pay Now]            │
│                 ↓                │
│    ┌──────────────────────┐     │
│    │ Select Payment Method │     │
│    ├──────────────────────┤     │
│    │ 📱 UPI               │     │
│    │ 💳 PhonePe           │     │
│    │ 💰 Google Pay        │     │
│    │ 💳 PayTM             │     │
│    └──────────────────────┘     │
│              ↓                  │
│    [Select PhonePe]             │
│              ↓                  │
│    Opens PhonePe App            │
│    Shows Payment Request         │
│    Amount: ₹500                 │
│    Recipient: Farmer            │
│              ↓                  │
│    [Confirm Payment]            │
│    [Enter PIN/Biometric]        │
│              ↓                  │
│    ✅ Payment Success           │
│              ↓                  │
│    Back to Browser              │
│    Show Confirmation            │
│              ↓                  │
│    [View Order Details]         │
│    Status: ✅ PAID              │
│                                  │
└──────────────────────────────────┘
```

---

## 📊 Database Schema Visualization

```
Order Collection
┌────────────────────────────────────┐
│         EXISTING FIELDS            │
├────────────────────────────────────┤
│ _id (ObjectId)                     │
│ productId (ObjectId)               │
│ productName (String)               │
│ productPrice (Number)              │
│ sellerId (ObjectId)                │
│ sellerName (String)                │
│ sellerEmail (String)               │
│ sellerPhone (String)               │
│ buyer (ObjectId)                   │
│ buyerName (String)                 │
│ buyerEmail (String)                │
│ buyerPhone (String)                │
│ buyerAddress (String)              │
│ quantity (Number)                  │
│ status (String)                    │
│ createdAt (Date)                   │
├────────────────────────────────────┤
│      NEW PAYMENT FIELDS ✨         │
├────────────────────────────────────┤
│ totalAmount (Number)               │
│ paymentMode (String)               │
│ paymentStatus (String)             │
│ paymentId (String)                 │
│ updatedAt (Date)                   │
└────────────────────────────────────┘
```

---

**Created:** February 3, 2026
**Version:** 1.0.0
**Status:** ✅ Complete

