# ⭐ Farmer Rating System - Quick Reference Card

## 🎯 Quick Links

| Action | URL |
|--------|-----|
| **Rate a Farmer** | `http://localhost:5000/public/rate-farmer.html` |
| **View Farmer Profile & Ratings** | `http://localhost:5000/public/farmer-profile-view.html?username=farmer1` |
| **Manage My Ratings** | `http://localhost:5000/public/my-ratings.html` |

## 🔌 API Endpoints Quick Ref

### 1. Get Farmer by Username
```
GET /api/user/by-username/farmer1
→ {_id: "...", username: "farmer1", role: "farmer"}
```

### 2. Submit Rating
```
POST /api/ratings
Body: {farmerId, rating (1-5), review, productName, categories}
→ {success: true, rating: {...}}
```

### 3. Get Farmer's Ratings
```
GET /api/ratings/farmer/507f1f77bcf86cd799439011
→ {ratings: [...], average: 4.5, count: 10, breakdown: {5:6, 4:3, ...}}
```

### 4. Get My Ratings
```
GET /api/my-ratings
→ {ratings: [... all ratings by consumer ...]}
```

### 5. Delete Rating
```
DELETE /api/ratings/507f1f77bcf86cd799439012
→ {success: true, message: "Rating deleted"}
```

## 📱 Pages Overview

### Rate Farmer Page
- **Location**: `public/rate-farmer.html`
- **Purpose**: Submit new ratings
- **Features**: Star selector, categories, review text
- **Auth**: Required ✓

### Farmer Profile Page
- **Location**: `public/farmer-profile-view.html?username=farmer1`
- **Purpose**: View farmer info + ratings
- **Features**: Products, ratings section, review list
- **Auth**: Not required

### My Ratings Page
- **Location**: `public/my-ratings.html`
- **Purpose**: Manage own ratings
- **Features**: View, edit, delete ratings
- **Auth**: Required ✓

## 🎨 UI Components

### Star Selector
```html
<div class="star-rating">
  ★ ★ ★ ★ ★
</div>
```
- Click to select (1-5 stars)
- Hover shows preview
- Color changes on selection

### Category Tags
```
Quality | Delivery | Communication | Value | Packaging
```
- Click to toggle selection
- Multiple selections allowed
- Visual feedback on selection

### Rating Cards
```
👤 Farmer Name          ★★★★★
Review text here...
📦 Tomatoes
[Quality] [Delivery]
✓ Verified Purchase
```

## 💾 Data Structure

### Rating Object
```javascript
{
  _id: "507f...",
  farmer: "507f...",          // ObjectId
  consumer: "507f...",        // ObjectId
  rating: 4,                  // 1-5
  review: "Great farmer!",    // max 500 chars
  productName: "Tomatoes",    // optional
  categories: ["Quality", "Delivery"],
  isVerifiedPurchase: true,
  createdAt: "2024-01-15T10:30:00Z"
}
```

## 🧪 Testing Commands

### cURL Examples
```bash
# Get farmer ID
curl http://localhost:5000/api/user/by-username/farmer1

# Get farmer's ratings
curl http://localhost:5000/api/ratings/farmer/FARMER_ID

# Submit rating (requires session)
curl -X POST http://localhost:5000/api/ratings \
  -H "Content-Type: application/json" \
  -b "connect.sid=SESSION_ID" \
  -d '{"farmerId":"ID","rating":5,"review":"Great!"}'

# Get my ratings (requires session)
curl http://localhost:5000/api/my-ratings \
  -b "connect.sid=SESSION_ID"

# Delete rating (requires session)
curl -X DELETE http://localhost:5000/api/ratings/RATING_ID \
  -b "connect.sid=SESSION_ID"
```

## ✅ Validation Rules

| Field | Rules |
|-------|-------|
| **Farmer Username** | Must exist in database |
| **Rating** | Must be 1-5 |
| **Review** | Max 500 characters |
| **Categories** | Optional, 0-5 selections |
| **Product Name** | Optional, any text |
| **Authentication** | Required for POST/DELETE |

## 📊 Display Formats

### Average Rating
```
4.5 ★★★★☆
```

### Breakdown Chart
```
5★ ████████ 8
4★ ███ 3
3★ █ 1
2★  0
1★  0
```

### Review Display
```
👤 john_doe        ★★★★★
Feb 15, 2024

📦 Tomatoes

"Excellent quality and fast delivery! 
Highly recommended."

[Quality] [Delivery] [Value]

✓ Verified Purchase
```

## 🎯 Workflow Summary

### Consumer Flow
1. Browse farmer profile
2. See ratings & reviews
3. Click "Rate This Farmer"
4. Submit rating form
5. Return to profile
6. See updated average

### Management Flow
1. Go to "My Ratings"
2. See all submissions
3. View statistics
4. Edit if needed
5. Delete if unwanted
6. Confirm changes

## ⚠️ Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Form won't submit | Check browser console, verify username exists, ensure logged in |
| Ratings not showing | Refresh page, check farmer ID, verify data was saved |
| Can't delete rating | Must be logged in as rating author, not someone else's |
| Edit modal closed | Try again, refresh page, check console for errors |
| Username not found | Check spelling, ensure farmer account exists |

## 🚀 Performance Tips

- Clear browser cache if issues persist
- Use browser DevTools (F12) to check network requests
- Check MongoDB logs for database issues
- Verify authentication cookie is set
- Test in incognito window to rule out cache issues

## 📞 Support Info

**If something breaks:**
1. Check browser console (F12 → Console)
2. Look for error messages
3. Check server logs
4. Verify MongoDB connection
5. Review documentation files

**Key Files:**
- `models/Rating.js` - Data model
- `server.js` - API endpoints (search "FARMER RATINGS")
- `public/rate-farmer.html` - Submission form
- `public/farmer-profile-view.html` - Profile display
- `public/my-ratings.html` - Management dashboard

## 🎓 Learning Resources

- `RATING_FEATURE_GUIDE.md` - Detailed features
- `RATING_SYSTEM_COMPLETE_GUIDE.md` - Full implementation
- `RATING_FEATURE_MAP.md` - Architecture & flow diagrams

## ✨ Quick Feature List

```
✅ 5-star rating system
✅ Review text (500 char max)
✅ Category tagging
✅ Product association
✅ Verified purchase badge
✅ View farmer ratings
✅ Manage own ratings
✅ Edit ratings
✅ Delete ratings
✅ Statistics dashboard
✅ Mobile responsive
✅ Authentication required
```

## 📈 Stats You Can Track

- Total ratings submitted: `GET /api/my-ratings`
- Average rating given: Calculate from ratings[]
- Recommended count: Filter rating >= 4
- Ratings received (for farmers): `GET /api/ratings/farmer/:id`
- Distribution: Use breakdown object {5:n, 4:n, 3:n, 2:n, 1:n}

---

**Version**: 1.0  
**Status**: ✅ Production Ready  
**Last Updated**: January 2024

For detailed guides, see the markdown documentation files.
