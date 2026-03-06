# 🎯 Rating System - Quick Start Guide

## ✅ Correct URLs (IMPORTANT!)

### ❌ WRONG URLs:
- `http://localhost:5000/public/rate-farmer.html` ← This will give 404 error
- `http://localhost:5000/public/my-ratings.html` ← This will give 404 error
- `http://localhost:5000/public/farmer-profile-view.html` ← This will give 404 error

### ✅ CORRECT URLs:
- **Rate a Farmer**: `http://localhost:5000/rate-farmer.html`
- **My Ratings**: `http://localhost:5000/my-ratings.html`
- **View Farmer Profile + Ratings**: `http://localhost:5000/farmer-profile-view.html?username=revanth`

---

## 🚀 Step-by-Step Testing

### Step 1: Open Rate Farmer Form
```
Go to: http://localhost:5000/rate-farmer.html
```

### Step 2: Fill the Form
```
Farmer Username:  revanth
Product Name:     drumstick
Rating:           ⭐⭐⭐⭐⭐ (5 stars)
Categories:       Select "Quality" and "Delivery"
Review:           "Fresh and amazing quality!"
```

### Step 3: Submit Rating
Click **"✅ Submit Rating"** button

### Step 4: View Ratings on Profile
```
Go to: http://localhost:5000/farmer-profile-view.html?username=revanth
Scroll down to "⭐ Ratings & Reviews" section
```

### Step 5: Manage Your Ratings
```
Go to: http://localhost:5000/my-ratings.html
See all ratings you submitted
Edit or Delete as needed
```

---

## 📡 API Endpoints (For Testing)

Open DevTools (F12) Console and run these:

### 1. Get Farmer by Username
```javascript
fetch('/api/user/by-username/revanth')
  .then(r => r.json())
  .then(d => console.log('Farmer:', d))
```

### 2. Submit a Rating
```javascript
// First, get farmer ID from above
const farmerId = 'PASTE_THE_ID_HERE';

fetch('/api/ratings', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  credentials: 'include',
  body: JSON.stringify({
    farmerId: farmerId,
    rating: 5,
    review: 'Excellent quality!',
    productName: 'drumstick',
    categories: ['Quality', 'Delivery']
  })
}).then(r => r.json()).then(d => console.log('Response:', d))
```

### 3. View Farmer's Ratings
```javascript
// Use the farmerId from step 1
const farmerId = 'PASTE_THE_ID_HERE';

fetch(`/api/ratings/farmer/${farmerId}`)
  .then(r => r.json())
  .then(d => console.log('Farmer Ratings:', d))
```

### 4. Get My Ratings (Must be Logged In)
```javascript
fetch('/api/my-ratings', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(d => console.log('My Ratings:', d))
```

### 5. Delete a Rating
```javascript
// Get ratingId from "Get My Ratings" response above
const ratingId = 'PASTE_THE_RATING_ID_HERE';

fetch(`/api/ratings/${ratingId}`, {
  method: 'DELETE',
  credentials: 'include'
})
  .then(r => r.json())
  .then(d => console.log('Deleted:', d))
```

---

## 🐛 Troubleshooting

### Problem: Still Getting 404 Error
**Solution**: Make sure you're NOT including `/public/` in the URL
- Remove `/public/` from your URL
- Use `http://localhost:5000/rate-farmer.html` not `http://localhost:5000/public/rate-farmer.html`

### Problem: Form Won't Submit
**Solution**: 
1. Make sure you're logged in first
2. Check browser console (F12) for error messages
3. Fill all required fields (farmer username and rating)

### Problem: Can't See Ratings on Profile
**Solution**:
1. Verify farmer username is correct (try: `revanth`)
2. Make sure you submitted a rating first
3. Refresh the page (Ctrl+R)
4. Check browser console for errors

### Problem: Get 401 or 403 Error
**Solution**:
1. You must be logged in to submit ratings
2. Log in first, then try rating
3. Only owner of rating can delete it

---

## 📋 Farmer Usernames to Test With

Use these existing farmers to test:
- `revanth` - Has 6 products (drumstick, guava, etc.)
- `pavan`
- `rajesh`

---

## ✨ Quick Demo

1. **Log in first** (use buyer account like `sharoni`)
2. Go to `http://localhost:5000/rate-farmer.html`
3. Enter farmer username: `revanth`
4. Rate 5 stars
5. Submit
6. See "✅ Rating submitted successfully!"
7. Go to `http://localhost:5000/farmer-profile-view.html?username=revanth`
8. Scroll down - See your rating under "⭐ Ratings & Reviews"

---

## 🎯 Complete URL Reference

| Page | Correct URL |
|------|-------------|
| Rate Farmer Form | `http://localhost:5000/rate-farmer.html` |
| My Ratings Dashboard | `http://localhost:5000/my-ratings.html` |
| Farmer Profile (with ratings) | `http://localhost:5000/farmer-profile-view.html?username=revanth` |
| Farmer Profile (different farmer) | `http://localhost:5000/farmer-profile-view.html?username=pavan` |

---

## 💡 Pro Tips

- Always include `?username=FARMER_NAME` when viewing farmer profiles
- You must be logged in to submit/delete ratings, but NOT to view them
- Categories are optional - you can select multiple
- Review text is optional - just rating is enough
- You can edit or delete your ratings anytime from "My Ratings"

---

**Server Status**: ✅ Running at `http://localhost:5000`

All rating features are working! Just use the correct URLs.
