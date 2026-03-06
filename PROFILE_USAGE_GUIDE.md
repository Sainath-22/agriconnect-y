# 🎯 Quick Start: Save Profiles to MongoDB

## Prerequisites
1. **MongoDB is running** on `mongodb://127.0.0.1:27017/greenfields`
2. **Node.js server is running** on port 5000
3. **You are logged in** to the application

## For Consumers

### Step 1: Navigate to Profile
- Go to `http://localhost:5000/consumer-profile.html`
- Or click "Profile" from the consumer dashboard

### Step 2: Fill Profile Information
1. **Upload Profile Image**
   - Click on the image area or upload zone
   - Select an image file
   - Image preview will show

2. **Enter Details**
   - Name (required)
   - Role (Farmer/Buyer/Both)
   - Location
   - Summary
   - Products/Interests
   - Community/FPO
   - Certifications
   - Preferred Payment
   - Languages
   - Contact Email (required)

### Step 3: Save
- Click "Save Profile" button
- Wait for success message
- Profile is now saved to MongoDB ✅

### Step 4: View/Edit Profile
- Saved profile displays with all information
- Click "Edit Profile" to make changes
- Changes are automatically saved to MongoDB

---

## For Farmers

### Step 1: Navigate to Profile
- Go to `http://localhost:5000/farmer-profile.html`
- Or access from farmer dashboard

### Step 2: Fill Profile Information
Same process as consumers:
1. Upload profile image
2. Enter name, location, products
3. Add FPO/Community info
4. Include certifications
5. Enter contact information
6. Add summary

### Step 3: Save
- Click "Save Profile" button
- Confirmation message appears
- Profile saved to MongoDB ✅

### Step 4: View/Edit
- View your saved profile
- Click "Edit Profile" to update
- Changes persist in MongoDB

---

## Testing via Browser Console

### Test 1: Save a Profile
```javascript
fetch('/api/profile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'testuser',
    name: 'Test User',
    role: 'Farmer',
    location: 'Test Location',
    products: 'Tomatoes',
    contact: 'test@example.com'
  })
})
.then(r => r.json())
.then(d => console.log(d))
```

### Test 2: Retrieve a Profile
```javascript
fetch('/api/profile/testuser')
  .then(r => r.json())
  .then(d => console.log(d))
```

### Test 3: Get All Farmers
```javascript
fetch('/api/profile/role/farmer')
  .then(r => r.json())
  .then(d => console.log(d))
```

### Test 4: Get All Buyers
```javascript
fetch('/api/profile/role/buyer')
  .then(r => r.json())
  .then(d => console.log(d))
```

---

## Testing via MongoDB Shell

### Connect to MongoDB
```bash
mongo
use greenfields
```

### View All Profiles
```javascript
db.profiles.find()
```

### Find Specific Profile
```javascript
db.profiles.findOne({ username: 'testuser' })
```

### Find All Farmers
```javascript
db.profiles.find({ role: 'Farmer' })
```

### Find All Buyers
```javascript
db.profiles.find({ role: 'Buyer' })
```

### Delete a Profile
```javascript
db.profiles.deleteOne({ username: 'testuser' })
```

---

## Success Indicators ✅

### On Frontend:
- ✅ "Profile saved to database successfully!" message appears
- ✅ Profile displays correctly after saving
- ✅ Edit button works to modify profile
- ✅ Image preview shows correctly

### In MongoDB:
- ✅ New document appears in `profiles` collection
- ✅ Document has all fields (username, name, role, etc.)
- ✅ `createdAt` and `updatedAt` timestamps present
- ✅ Image stored as Base64 string

### In Browser DevTools:
- ✅ No console errors
- ✅ Network tab shows POST 200 response
- ✅ Response JSON includes `success: true`

---

## Common Issues & Solutions

### ❌ Profile not saving?
**Solution:**
1. Check MongoDB is running: `tasklist | grep mongod`
2. Check server console for error messages
3. Open browser DevTools → Network → check response

### ❌ Image not loading?
**Solution:**
1. File should be < 10MB (limit set in server)
2. Try different image format (.jpg, .png, .gif)
3. Check console for Base64 encoding errors

### ❌ Getting 404 error?
**Solution:**
1. Verify server is running on port 5000
2. Check URL is correct: `http://localhost:5000`
3. Verify profile routes registered in server.js

### ❌ Profile not loading on page load?
**Solution:**
1. Make sure you're logged in (username in localStorage)
2. Check if profile exists in MongoDB
3. Clear browser cache and reload

---

## Database Schema

```javascript
Profile {
  _id: ObjectId,
  userId: ObjectId (references User),
  username: String (unique, required),
  name: String,
  role: String (Farmer/Buyer/Both),
  location: String,
  summary: String,
  products: String,
  fpo: String,
  cert: String,
  payment: String,
  languages: String,
  contact: String,
  image: String (Base64),
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/profile` | Save/Update profile |
| GET | `/api/profile/:username` | Get profile by username |
| GET | `/api/profile/role/farmer` | Get all farmer profiles |
| GET | `/api/profile/role/buyer` | Get all buyer profiles |

---

## Files Modified

1. ✅ `routes/profile.js` - Enhanced with new endpoints
2. ✅ `server.js` - Registered profile routes
3. ✅ `public/consumer-profile.html` - MongoDB integration
4. ✅ `public/farmer-profile.html` - Complete rewrite
5. ✅ `models/Profile.js` - Already had schema

---

## Next Steps

1. ✅ Test consumer profile saving
2. ✅ Test farmer profile saving
3. ✅ Verify data in MongoDB
4. ✅ Test profile editing
5. ✅ Test image upload
6. ✅ Test retrieval by role

**Ready to use! 🚀**
