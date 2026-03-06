// ============================================
// Payment System Handler
// ============================================

let currentOrderId = null;
let currentPaymentAmount = null;
let currentOrderSellerPhone = null;

// Open Payment Modal
function openPaymentModal(orderId, amount, orderDetails = {}) {
  currentOrderId = orderId;
  currentPaymentAmount = amount;
  currentOrderSellerPhone = orderDetails.sellerPhone || null;
  
  // Display total amount
  document.getElementById('paymentAmount').textContent = parseFloat(amount).toFixed(2);
  
  // Display breakdown details if provided
  if (orderDetails.productPrice && orderDetails.quantity) {
    document.getElementById('paymentPrice').textContent = parseFloat(orderDetails.productPrice).toFixed(2);
    document.getElementById('paymentQty').textContent = orderDetails.quantity;
    document.getElementById('paymentTotal').textContent = parseFloat(amount).toFixed(2);
  } else {
    // If no breakdown, hide the breakdown section
    const breakdownSection = document.querySelector('[style*="border-top"]');
    if (breakdownSection) {
      breakdownSection.style.display = 'none';
    }
  }
  
  document.getElementById('paymentModal').style.display = 'flex';
  
  // Reset form
  document.getElementById('upiForm').style.display = 'none';
  document.getElementById('upiId').value = '';
}

// Close Payment Modal
function closePaymentModal() {
  document.getElementById('paymentModal').style.display = 'none';
  currentOrderId = null;
  currentPaymentAmount = null;
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
  const modal = document.getElementById('paymentModal');
  if (event.target === modal) {
    closePaymentModal();
  }
});

// Simple toast UI for confirmations
function showToast(message, success = true, timeout = 3000) {
  const existing = document.getElementById('pc-toast');
  if (existing) existing.remove();

  const div = document.createElement('div');
  div.id = 'pc-toast';
  div.textContent = message;
  div.style.position = 'fixed';
  div.style.right = '20px';
  div.style.bottom = '20px';
  div.style.padding = '10px 14px';
  div.style.borderRadius = '6px';
  div.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
  div.style.zIndex = 9999;
  div.style.color = '#fff';
  div.style.background = success ? 'linear-gradient(90deg,#34c759,#28a745)' : 'linear-gradient(90deg,#ff6b6b,#ff3b30)';
  document.body.appendChild(div);

  setTimeout(() => {
    div.style.transition = 'opacity 300ms';
    div.style.opacity = '0';
    setTimeout(() => div.remove(), 350);
  }, timeout);
}

// ============================================
// UPI Payment
// ============================================

function selectUPI() {
  const upiForm = document.getElementById('upiForm');
  if (upiForm.style.display === 'none') {
    upiForm.style.display = 'block';
    document.getElementById('upiId').focus();
  } else {
    upiForm.style.display = 'none';
  }
}

function initiateUPIPayment() {
  const upiId = document.getElementById('upiId').value.trim();
  
  if (!upiId) {
    alert('Please enter your UPI ID');
    return;
  }
  
  if (!upiId.match(/^[a-zA-Z0-9._-]+@[a-zA-Z]+$/)) {
    alert('Please enter a valid UPI ID (e.g., name@upi)');
    return;
  }

  fetch('/api/payment/initiate-upi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: currentOrderId,
      amount: currentPaymentAmount,
      buyerUPI: upiId
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.message.includes('generated')) {
      // Store deep links and show app selection
      window.upiDeepLinks = data.deepLinks;
      alert('UPI payment initiated. Please select an app to complete payment.');
    } else {
      alert('Error: ' + data.message);
    }
  })
  .catch(err => {
    console.error('Error:', err);
    alert('Error initiating UPI payment');
  });
}

function redirectToUPIApp(appName) {
  if (!window.upiDeepLinks || !window.upiDeepLinks[appName]) {
    alert('App link not available');
    return;
  }

  const link = window.upiDeepLinks[appName];
  
  // Try to open the app
  window.location.href = link;
  
  // If app not installed, show fallback
  setTimeout(() => {
    const fallbackLinks = {
      phonepe: 'https://play.google.com/store/apps/details?id=com.phonepe.app',
      googlepay: 'https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user',
      paytm: 'https://play.google.com/store/apps/details?id=com.paytm',
      whatsapp: 'https://www.whatsapp.com'
    };
    
    if (fallbackLinks[appName]) {
      // Show option to install
      const shouldInstall = confirm(`${appName} app not found. Would you like to install it?`);
      if (shouldInstall) {
        window.location.href = fallbackLinks[appName];
      }
    }
  }, 1000);
}

// ============================================
// PhonePe Payment
// ============================================

function initiatePhonePePayment() {
  showLoadingSpinner();
  
  // Notify PhonePe user (seller) with UPI/payment link (simulated)
  const upiId = document.getElementById('upiId') ? document.getElementById('upiId').value : '';

  // Send notification to seller (SMS or other channel) so PhonePe user gets payable link/message
  fetch('/api/notify-phonepe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: currentOrderSellerPhone,
      upiId: upiId,
      amount: currentPaymentAmount,
      orderId: currentOrderId
    })
  })
  .then(res => res.json())
  .then(notifyResp => {
    // Show a UI confirmation/toast about notification
    if (notifyResp && notifyResp.success) {
      showToast('Notification sent to seller.', true);
    } else {
      showToast('Notification could not be sent (simulated).', false);
    }

    // After notifying, initiate PhonePe payment flow (existing endpoint)
    return fetch('/api/payment/initiate-phonepe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: currentOrderId, amount: currentPaymentAmount })
    });
  })
  .then(res => res.json())
  .then(data => {
    hideLoadingSpinner();
    if (data.appLink) {
      // Try to open PhonePe app
      const appLink = data.appLink;
      window.location.href = appLink;
      // Fallback to web if app not installed
      setTimeout(() => {
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        }
      }, 1500);
    }
  })
  .catch(err => {
    hideLoadingSpinner();
    console.error('Error:', err);
    showToast('Error initiating PhonePe payment', false);
  });
}

// ============================================
// Google Pay Payment
// ============================================

function initiateGooglePayPayment() {
  showLoadingSpinner();
  
  fetch('/api/payment/initiate-googlepay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: currentOrderId,
      amount: currentPaymentAmount
    })
  })
  .then(res => res.json())
  .then(data => {
    hideLoadingSpinner();
    
    if (data.upiLink) {
      // Open Google Pay via UPI
      window.location.href = data.upiLink;
    }
  })
  .catch(err => {
    hideLoadingSpinner();
    console.error('Error:', err);
    alert('Error initiating Google Pay payment');
  });
}

// ============================================
// PayTM Payment
// ============================================

function initiatePayTMPayment() {
  showLoadingSpinner();
  
  fetch('/api/payment/initiate-paytm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: currentOrderId,
      amount: currentPaymentAmount,
      customerPhone: getCurrentUserPhone() // Implement based on your auth
    })
  })
  .then(res => res.json())
  .then(data => {
    hideLoadingSpinner();
    
    if (data.redirectUrl) {
      window.location.href = data.redirectUrl;
    } else if (data.appLink) {
      window.location.href = data.appLink;
    }
  })
  .catch(err => {
    hideLoadingSpinner();
    console.error('Error:', err);
    alert('Error initiating PayTM payment');
  });
}

// ============================================
// Net Banking Payment
// ============================================

function initiateNetBanking() {
  alert('Net Banking payment - Coming soon! Please use UPI or wallet payment for now.');
  // Implement gateway integration (Razorpay, PayU, etc.)
}

// ============================================
// Helper Functions
// ============================================

function showLoadingSpinner() {
  const spinner = document.createElement('div');
  spinner.id = 'paymentSpinner';
  spinner.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000;">
      <div style="background: white; padding: 30px; border-radius: 12px; text-align: center;">
        <div style="border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
        <p style="margin: 0; font-family: 'Poppins', sans-serif;">Processing Payment...</p>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </div>
  `;
  document.body.appendChild(spinner);
}

function hideLoadingSpinner() {
  const spinner = document.getElementById('paymentSpinner');
  if (spinner) {
    spinner.remove();
  }
}

function getCurrentUserPhone() {
  // Get phone from session or user profile
  // This should be implemented based on your auth system
  return localStorage.getItem('userPhone') || '';
}

// ============================================
// Payment Verification (Callback Handler)
// ============================================

function verifyPayment(orderId, transactionId, paymentMode) {
  fetch('/api/payment/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: orderId,
      transactionId: transactionId,
      paymentMode: paymentMode
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.message.includes('successfully')) {
      showPaymentSuccess(orderId);
    } else {
      showPaymentError(data.message);
    }
  })
  .catch(err => {
    console.error('Verification error:', err);
    showPaymentError('Payment verification failed');
  });
}

function checkPaymentStatus(orderId) {
  fetch(`/api/payment/status/${orderId}`)
    .then(res => res.json())
    .then(data => {
      console.log('Payment Status:', data);
      return data;
    })
    .catch(err => console.error('Status check error:', err));
}

// ============================================
// Success/Error Handlers
// ============================================

function showPaymentSuccess(orderId) {
  const message = `
    ✅ Payment Successful!
    
    Order ID: ${orderId}
    Your order has been confirmed and will be delivered soon.
    You will receive an email confirmation shortly.
  `;
  
  alert(message);
  closePaymentModal();
  
  // Redirect to order history or dashboard
  setTimeout(() => {
    window.location.href = '/farmer-orders.html';
  }, 2000);
}

function showPaymentError(message) {
  alert('❌ Payment Failed\n\n' + message + '\n\nPlease try again.');
}

// ============================================
// Order Placement with Payment
// ============================================

async function placeOrderWithPayment(productId, quantity) {
  try {
    // Calculate amount based on product price and quantity
    const productResponse = await fetch(`/api/products/${productId}`)
      .catch(() => null);
    
    let totalAmount = 0;
    let productPrice = 0;
    
    if (productResponse && productResponse.ok) {
      const product = await productResponse.json();
      productPrice = product.price || 0;
      totalAmount = productPrice * quantity;
    }

    // First create order in database
    const orderResponse = await fetch('/api/orders/place-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: productId,
        quantity: quantity,
        totalAmount: totalAmount
      })
    });

    const orderData = await orderResponse.json();
    
    if (orderData.order && orderData.order._id) {
      // Open payment modal with calculated amount and breakdown
      const amount = orderData.order.totalAmount || totalAmount || 0;
      openPaymentModal(orderData.order._id, amount, {
        productPrice: productPrice,
        quantity: quantity
      });
    } else {
      alert('Error creating order: ' + orderData.message);
    }
  } catch (err) {
    console.error('Order placement error:', err);
    alert('Error placing order');
  }
}

// ============================================
// QR Code Payment (Alternative Method)
// ============================================

// Open Payment Modal from Orders Page (with order data or fetched details)
async function openPaymentModalFromOrder(orderId, orderData = null) {
  try {
    let amount = 0;
    let productPrice = 0;
    let quantity = 0;
    
    // If order data is passed directly, use it
    if (orderData) {
      amount = orderData.totalAmount || 0;
      productPrice = orderData.productPrice || 0;
      quantity = orderData.quantity || 0;
    } else {
      // Otherwise fetch from backend
      const response = await fetch(`/api/orders/${orderId}`);
      
      if (response && response.ok) {
        const order = await response.json();
        amount = order.totalAmount || 0;
        productPrice = order.productPrice || 0;
        quantity = order.quantity || 0;
      } else {
        console.error('Could not fetch order details, trying fallback');
        alert('⚠️ Could not load order details. Please try again.');
        return;
      }
    }
    
    // Open payment modal with order details (include sellerPhone when available)
    openPaymentModal(orderId, amount, {
      productPrice: productPrice,
      quantity: quantity,
      sellerPhone: (orderData && orderData.sellerPhone) || (typeof order !== 'undefined' && order.sellerPhone) || null
    });
  } catch (err) {
    console.error('Error opening payment modal:', err);
    alert('❌ Error loading order. Please try again.');
  }
}

// Handler for Pay Now buttons using data- attributes to avoid inline JS issues
function handlePayNowButton(btn) {
  try {
    const orderId = btn.dataset.orderid;
    const totalAmount = parseFloat(btn.dataset.totalamount) || 0;
    const productPrice = parseFloat(btn.dataset.productprice) || 0;
    const quantity = parseInt(btn.dataset.quantity) || 0;
    const sellerPhone = btn.dataset.sellerphone || null;

    // Use openPaymentModalFromOrder with orderData to avoid an extra fetch when data is present
    openPaymentModalFromOrder(orderId, {
      totalAmount: totalAmount,
      productPrice: productPrice,
      quantity: quantity,
      sellerPhone: sellerPhone
    });
  } catch (err) {
    console.error('handlePayNowButton error:', err);
    alert('Error opening payment. Please try again.');
  }
}

function generatePaymentQR(upiId, amount, orderId) {
  const upiString = `upi://pay?pa=${upiId}&pn=AgriConnect&am=${amount}&tn=Order${orderId}`;
  
  // Use a QR code API to generate QR
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;
  
  return qrCodeUrl;
}

function displayPaymentQR(upiId, amount, orderId) {
  const qrUrl = generatePaymentQR(upiId, amount, orderId);
  
  const qrModal = document.createElement('div');
  qrModal.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000;">
      <div style="background: white; padding: 30px; border-radius: 12px; text-align: center;">
        <h3 style="margin-top: 0; font-family: 'Poppins';">Scan to Pay</h3>
        <img src="${qrUrl}" alt="Payment QR Code" style="width: 200px; height: 200px; margin: 20px 0;">
        <p style="font-family: 'Poppins'; color: #666;">Amount: ₹${amount}</p>
        <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-family: 'Poppins';">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(qrModal);
}
