# 🧪 Payment System - Testing Guide

## ✅ Pre-Testing Checklist

Before you start testing, make sure:

- [ ] Server is running: `npm start`
- [ ] MongoDB is connected
- [ ] You're logged in as a consumer
- [ ] You have at least one order in your account
- [ ] Browser console is open (F12)
- [ ] You have a test device or mobile emulator ready

---

## 🎬 Test Scenario 1: Basic UI Test

**Objective**: Verify payment modal appears correctly

### Steps:
1. Navigate to `http://localhost:5000/orders.html`
2. Look for orders with "💳 PAYMENT PENDING" badge
3. Click the blue "💳 Pay Now" button
4. **Expected Result**: Beautiful payment modal opens with:
   - Amount displayed at top
   - 4 payment method sections
   - UPI, PhonePe, Google Pay, PayTM buttons
   - Security info at bottom

### What to Look For:
```
✅ Modal appears
✅ Amount is correct
✅ All buttons visible
✅ Gradient design looks good
✅ Close button works
✅ Modal is responsive
```

### If It Fails:
- Check browser console for errors
- Verify payment-handler.js is loaded (Network tab)
- Check if orders.html includes payment-handler.js script tag

---

## 🎬 Test Scenario 2: UPI Payment Flow

**Objective**: Test UPI payment initiation and app selection

### Steps:

1. Click "📱 UPI" button in payment modal
2. **Expected**: UPI input form appears with:
   - Text field for UPI ID
   - 4 app buttons (PhonePe, Google Pay, PayTM, WhatsApp)
   - "Proceed with UPI" button

3. Enter test UPI ID: `testuser@upi`

4. Click "PhonePe" button

5. **Expected**: 
   - API call to `/api/payment/initiate-upi` succeeds
   - Response includes deep links
   - PhonePe app tries to open (or fallback shows)

### Browser Console Check:
```javascript
// You should see in console:
// POST /api/payment/initiate-upi 200 OK
// Response with deepLinks object
```

### What to Verify:
```
✅ UPI form appears when clicking UPI button
✅ Input field accepts UPI ID
✅ App buttons are clickable
✅ API call is made on form submit
✅ Response contains deepLinks
✅ PhonePe deep link is generated
```

### Test Data:
```
Valid UPI Format Examples:
- testuser@upi
- john@okhdfcbank
- farmer@paytm
- consumer@googlepay

Invalid (Should reject):
- justname
- @bank
- name@
```

---

## 🎬 Test Scenario 3: Direct Payment Gateway Test

**Objective**: Test PhonePe, Google Pay, PayTM direct payments

### Test PhonePe Direct:

1. Open payment modal
2. Click "💳 PhonePe" button (in Digital Wallets section)
3. **Expected**:
   - Loading spinner appears
   - API call: POST `/api/payment/initiate-phonepe`
   - Response with redirect URL
   - App attempts to open

### Test Google Pay:

1. Open payment modal
2. Click "💰 Google Pay" button
3. **Expected**:
   - API call: POST `/api/payment/initiate-googlepay`
   - UPI link generated
   - Redirect attempt

### Test PayTM:

1. Open payment modal
2. Click "💳 PayTM" button
3. **Expected**:
   - API call: POST `/api/payment/initiate-paytm`
   - Redirect to PayTM gateway
   - Response with transaction details

### Console Verification:
```javascript
// Each should show in Network tab:
POST /api/payment/initiate-phonepe
POST /api/payment/initiate-googlepay
POST /api/payment/initiate-paytm

// Each response should include:
{
  orderId: "...",
  amount: 500,
  transactionId: "AGRI-XXXX",
  deepLinks or redirectUrl
}
```

---

## 🎬 Test Scenario 4: Payment Status Check

**Objective**: Verify payment status API works

### Using Browser Console:

```javascript
// Get order ID from page
const orderId = "607f1f77bcf86cd799439011"; // Replace with actual

// Check payment status
fetch(`/api/payment/status/${orderId}`)
  .then(r => r.json())
  .then(d => console.log('Payment Status:', d));
```

### Expected Response:
```json
{
  "orderId": "607f1f77bcf86cd799439011",
  "paymentStatus": "Pending",
  "paymentMode": "upi",
  "amount": 500,
  "transactionId": "AGRI-XXXXXX-XXXXXX",
  "orderStatus": "Pending"
}
```

### What to Check:
```
✅ Status endpoint responds
✅ Returns correct order ID
✅ Shows payment status
✅ Shows payment mode
✅ Shows amount
✅ Shows transaction ID
```

---

## 🎬 Test Scenario 5: Order Card Integration

**Objective**: Verify payment status displays on order cards

### What to Look For:

Before payment:
```
Badge: 🟠 PENDING      💳 PAYMENT PENDING
Buttons: [Email] [Call] [Chat] [Pay Now]
```

After payment (simulate):
```
Badge: ✅ CONFIRMED    ✓ PAID
Buttons: [Email] [Call] [Chat]
(No "Pay Now" button)
```

### Steps:
1. Open orders page
2. Check order card badges
3. Verify "Pay Now" button only shows when payment is pending
4. Click payment button
5. Verify modal opens with correct amount
6. Verify amount matches order total

---

## 🎬 Test Scenario 6: Modal Responsiveness

**Objective**: Test payment modal on different screen sizes

### Desktop (1920px):
```
✅ Modal is centered
✅ Width ~600px
✅ All content visible
✅ Good spacing
```

### Tablet (768px):
```
✅ Modal is responsive
✅ Text readable
✅ Buttons clickable
✅ Scroll if needed
```

### Mobile (375px):
```
✅ Modal fills screen (95%)
✅ Header visible
✅ All buttons stacked
✅ Easy to tap
✅ Scroll works
```

### Test Using:
- Chrome DevTools → Device Mode
- Test at: 375px, 768px, 1920px widths

---

## 🎬 Test Scenario 7: Error Handling

**Objective**: Verify errors are handled gracefully

### Test Invalid UPI:

1. Click UPI button
2. Enter invalid UPI: `justname`
3. Click submit
4. **Expected**: Alert shows "Invalid UPI format"

### Test Missing Order:

1. Open browser console
2. Run:
   ```javascript
   openPaymentModal("invalidid", 100);
   ```
3. **Expected**: No error in console, modal opens with amount

### Test Network Error:

1. Open DevTools → Network tab
2. Right-click any request → Block request domain
3. Try to pay
4. **Expected**: User-friendly error message

---

## 📊 Test Data Setup

### Sample Order for Testing:

```javascript
// Create test order if needed:
{
  productName: "Organic Tomatoes",
  quantity: 5,
  totalAmount: 500,
  paymentMode: null,
  paymentStatus: "Pending",
  status: "Pending"
}
```

### Test Amounts:
```
Small: ₹100
Medium: ₹500 (default test)
Large: ₹1000
Bulk: ₹10000
```

---

## 🔍 Manual Testing Checklist

### Payment Modal Display:
- [ ] Modal appears when clicking "Pay Now"
- [ ] Modal has correct styling
- [ ] Close button works
- [ ] Modal closes when clicking outside
- [ ] Amount displays correctly

### UPI Testing:
- [ ] UPI button shows/hides form
- [ ] Input accepts text
- [ ] App buttons are clickable
- [ ] Deep links generate correctly
- [ ] Error on invalid format
- [ ] All 4 apps available

### Gateway Testing:
- [ ] PhonePe button works
- [ ] Google Pay button works
- [ ] PayTM button works
- [ ] Correct API endpoints called
- [ ] Responses include needed data
- [ ] Loading states show

### Status Testing:
- [ ] Status API returns data
- [ ] Payment status correct
- [ ] Transaction ID present
- [ ] Amount accurate
- [ ] Order ID matches

### UI/UX Testing:
- [ ] Buttons are responsive
- [ ] Text is readable
- [ ] Colors are consistent
- [ ] Animations are smooth
- [ ] Mobile friendly
- [ ] Accessible

---

## 🐛 Debugging Guide

### Enable Verbose Logging:

Add to `payment-handler.js`:
```javascript
console.log('Payment Modal Opened', { orderId, amount });
console.log('Payment Method Selected', { method });
console.log('API Response', data);
```

### Check Network Requests:

DevTools → Network tab:
```
Filter: XHR
Look for: /api/payment/
Check: 
- Status (should be 200)
- Response body
- Headers
- Timing
```

### Monitor Console:

DevTools → Console:
```javascript
// Watch for errors
// Check API responses
// Verify function calls
// Track state changes
```

### Database Check:

Check MongoDB:
```javascript
// In MongoDB Atlas or shell
db.orders.findOne({ _id: ObjectId("...") })

// Look for:
// - paymentMode
// - paymentStatus
// - paymentId
// - totalAmount
```

---

## ✅ Acceptance Criteria

All tests passed when:

✅ Modal opens correctly
✅ All payment methods available
✅ UPI form works properly
✅ No JavaScript errors
✅ API endpoints respond
✅ Status checks work
✅ Mobile responsive
✅ Data saves to database
✅ Order status updates
✅ No console errors

---

## 📝 Test Report Template

```
PAYMENT SYSTEM TEST REPORT
Date: ___________
Tester: ________

┌─ UI Tests ─────────────────────────┐
│ Modal Display ................. ✅  │
│ Styling ...................... ✅  │
│ Responsiveness ............... ✅  │
└────────────────────────────────────┘

┌─ Payment Method Tests ──────────────┐
│ UPI .......................... ✅  │
│ PhonePe ...................... ✅  │
│ Google Pay ................... ✅  │
│ PayTM ........................ ✅  │
└────────────────────────────────────┘

┌─ API Tests ────────────────────────┐
│ Initiate UPI ................. ✅  │
│ Initiate PhonePe ............ ✅  │
│ Status Check ................ ✅  │
│ Error Handling .............. ✅  │
└────────────────────────────────────┘

┌─ Data Tests ───────────────────────┐
│ Order Updated ............... ✅  │
│ Payment ID Generated ......... ✅  │
│ Status Tracked .............. ✅  │
└────────────────────────────────────┘

Issues Found: _____
Blockers: _____
Recommendations: _____

Overall Status: ✅ READY / ⚠️ ISSUES / ❌ BLOCKED
```

---

## 🎓 Troubleshooting

### Problem: "Payment modal is not opening"
**Solution:**
```
1. Check if payment-handler.js is loaded
2. Open DevTools → Sources
3. Search for "payment-handler.js"
4. If not found, check script tag in orders.html
5. Verify file exists at /public/payment-handler.js
```

### Problem: "UPI app not opening"
**Solution:**
```
1. Check UPI format (should be name@bank)
2. Verify deep link is correct
3. Check if app is installed
4. Try different app (PhonePe, Google Pay)
5. Check browser console for errors
```

### Problem: "API returns 404"
**Solution:**
```
1. Verify server is running
2. Check /routes/payment.js exists
3. Check server.js has: app.use("/api/payment", paymentRoutes)
4. Restart server after changes
5. Check endpoint URL spelling
```

### Problem: "Payment status not updating"
**Solution:**
```
1. Check MongoDB is running
2. Verify Order schema includes payment fields
3. Check database connection string
4. Verify payment API response
5. Check order ID is correct
```

---

**Test Version:** 1.0.0
**Last Updated:** February 3, 2026
**Status:** Ready for Testing

Start with Scenario 1, then proceed sequentially. ✅
