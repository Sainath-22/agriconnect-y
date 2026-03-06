# Farmer Rating System - Feature Guide

## Overview
Complete farmer rating system that allows consumers to rate farmers and view ratings on farmer profiles.

## Components Created

### 1. Rating Model (`models/Rating.js`)
- **Fields**: farmer, consumer, rating (1-5), review, productName, categories, isVerifiedPurchase, timestamps
- **Features**: Stores consumer feedback about farmers

### 2. API Endpoints (`server.js`)

#### Submit/Update Rating
- **POST** `/api/ratings`
- **Auth**: Required (consumer must be logged in)
- **Body**: 
  ```json
  {
    "farmerId": "farmer_id",
    "rating": 4,
    "review": "Great quality products!",
    "productName": "Tomatoes",
    "categories": ["Quality", "Delivery"]
  }
  ```
- **Response**: `{success: true, message: "...", rating: {...}}`

#### Get Farmer's Ratings
- **GET** `/api/ratings/farmer/:farmerId`
- **Auth**: Not required
- **Response**: 
  ```json
  {
    "success": true,
    "ratings": [...],
    "average": 4.5,
    "count": 12,
    "breakdown": {5: 8, 4: 3, 3: 1, 2: 0, 1: 0}
  }
  ```

#### Get User by Username
- **GET** `/api/user/by-username/:username`
- **Response**: `{_id: "...", username: "farmer1", role: "farmer"}`

#### Get Consumer's Ratings
- **GET** `/api/my-ratings`
- **Auth**: Required
- **Response**: `{success: true, ratings: [...]}`

#### Delete Rating
- **DELETE** `/api/ratings/:ratingId`
- **Auth**: Required (consumer must be owner)
- **Response**: `{success: true, message: "..."}`

### 3. UI Pages

#### Rate Farmer Page (`public/rate-farmer.html`)
- **Features**:
  - Search farmer by username
  - 5-star interactive rating selector
  - Optional product name field
  - Review text area (max 500 chars)
  - Category tags (Quality, Delivery, Communication, Value, Packaging)
  - Verified purchase flag
  - Success/error notifications
  
- **Workflow**:
  1. Enter farmer username
  2. Select 1-5 stars
  3. Optionally add product name and review
  4. Select relevant categories
  5. Submit to `/api/ratings`
  6. Form clears on success

#### Farmer Profile View (`public/farmer-profile-view.html`)
- **New Section**: Rating & Reviews display
- **Features**:
  - Average rating with star display
  - 5-star breakdown bar chart
  - List of recent reviews with:
    - Consumer username
    - Rating stars
    - Review text (if provided)
    - Product name (if provided)
    - Category tags (if selected)
    - Verified purchase indicator
    - Review date
  - "Rate This Farmer" button linking to rate-farmer.html

### 4. Data Flow

```
Consumer View Farmer Profile
    ↓
Farmer Profile Page Loads (`/api/farmer-profile/:username`)
    ↓
Fetch Farmer Ratings (`/api/ratings/farmer/:farmerId`)
    ↓
Display Average Rating + Breakdown
    ↓
Show Recent Reviews
    ↓
Click "Rate This Farmer" Button
    ↓
Navigate to `/public/rate-farmer.html`
    ↓
Search Farmer by Username (`/api/user/by-username/:username`)
    ↓
Submit Rating (`POST /api/ratings`)
    ↓
Store in MongoDB
    ↓
Display Success Message
```

## Usage Examples

### For Consumers (Rating Submission)

1. **Open Rating Page**
   - Navigate to `http://localhost:5000/public/rate-farmer.html`
   - Or click "⭐ Rate This Farmer" button on farmer profile

2. **Submit Rating**
   ```
   - Enter Farmer Username: "farmer1"
   - Product Name: "Fresh Tomatoes" (optional)
   - Rating: Click 5 stars
   - Categories: Select "Quality", "Delivery"
   - Review: "Best quality vegetables in town! Fast delivery too."
   - Click "✅ Submit Rating"
   ```

3. **Result**
   - Rating saved to database
   - Success message displayed
   - Form cleared for next rating

### For Consumers (View Ratings)

1. **Open Farmer Profile**
   - Navigate to farmer profile page
   - Example: `?username=farmer1`

2. **View Ratings Section**
   - Average rating with stars
   - 5-star breakdown showing distribution
   - Recent reviews with consumer feedback
   - "Rate This Farmer" button

## Testing

### Test Endpoints

```bash
# 1. Get user by username
GET http://localhost:5000/api/user/by-username/farmer1

# 2. Submit rating (with auth)
POST http://localhost:5000/api/ratings
Content-Type: application/json
Body: {
  "farmerId": "USER_ID_HERE",
  "rating": 5,
  "review": "Excellent!",
  "categories": ["Quality"]
}

# 3. Get farmer's ratings
GET http://localhost:5000/api/ratings/farmer/USER_ID_HERE

# 4. Get my ratings (with auth)
GET http://localhost:5000/api/my-ratings

# 5. Delete rating
DELETE http://localhost:5000/api/ratings/RATING_ID_HERE
```

### Sample Test Data

```javascript
// Rating submission test
const ratingData = {
  farmerId: "507f1f77bcf86cd799439011", // Replace with actual ID
  rating: 4,
  review: "Good quality and fast delivery!",
  productName: "Tomatoes",
  categories: ["Quality", "Delivery", "Value"]
};

// Would result in response:
{
  success: true,
  message: "Rating submitted successfully",
  rating: {
    _id: "...",
    farmer: "507f1f77bcf86cd799439011",
    consumer: "507f1f77bcf86cd799439012",
    rating: 4,
    review: "Good quality and fast delivery!",
    productName: "Tomatoes",
    categories: ["Quality", "Delivery", "Value"],
    isVerifiedPurchase: true,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  }
}
```

## Files Modified/Created

| File | Type | Changes |
|------|------|---------|
| `models/Rating.js` | Created | Rating schema with validation |
| `server.js` | Modified | 5 new API endpoints |
| `public/rate-farmer.html` | Created | Rating submission form UI |
| `public/farmer-profile-view.html` | Modified | Rating display section |

## Browser Storage & Session Requirements

- **Authentication**: User must be logged in to submit ratings
  - Session ID stored in browser cookies
  - Validated on server for `/api/ratings` POST requests
- **Data**: All ratings stored in MongoDB
  - Persists across browser sessions
  - No client-side storage required

## Next Steps

### Planned Enhancements
1. ✅ Basic rating submission
2. ✅ Rating display on profile
3. ⏳ Rating filters on product listing
4. ⏳ Consumer dashboard showing their ratings
5. ⏳ Farmer dashboard showing received ratings
6. ⏳ Email notifications for new ratings
7. ⏳ Merchant response system

### Integration Points
- **Linked to Orders**: Could link ratings to specific orders
- **Verified Purchase Flag**: Already included, can use to filter
- **Product Categorization**: Reviews can be filtered by product
- **Consumer Trust**: Use average rating for "Trusted Farmer" badge

## Configuration

### Database Connection
- Uses existing MongoDB connection from `server.js`
- No additional configuration needed

### Authentication
- Uses existing express-session setup
- Consumer ID extracted from `req.session.userId`

### API Base URL
- All endpoints relative to `http://localhost:5000`
- Adjust in HTML files if server runs on different port

## Error Handling

The system handles:
- ✓ Missing required fields
- ✓ Invalid rating values (must be 1-5)
- ✓ User not found
- ✓ Unauthorized access (must be logged in)
- ✓ Duplicate ratings (updates existing instead)
- ✓ Database errors with user-friendly messages

## Security Considerations

- ✓ Authentication required for rating submission
- ✓ Consumers can only delete their own ratings
- ✓ Farmer ID validated against database
- ✓ Input validation on review text (max 500 chars)
- ✓ Rating value restricted to 1-5 range

## Deployment Notes

Before deploying to production:

1. Add CORS configuration if frontend/backend on different domains
2. Set `credentials: "include"` in fetch calls (already done)
3. Review rating guidelines and content policy
4. Consider adding rate limiting to prevent spam ratings
5. Add moderation queue for reviews if needed
6. Set up email notifications for farmers
7. Add dispute resolution mechanism
