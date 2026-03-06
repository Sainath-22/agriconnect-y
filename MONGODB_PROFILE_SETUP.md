# MongoDB Profile Setup Guide

## 🎯 Overview
This guide explains how consumer and farmer profiles are now saved to MongoDB in AgriConnect.

## ✅ What Has Been Implemented

### 1. **Database Schema (Profile Model)**
Located in: `models/Profile.js`

```javascript
const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  username: { type: String, required: true, unique: true },
  name: String,
  role: { type: String, required: true },
  location: String,
  summary: String,
  products: String,
  fpo: String,
  cert: String,
  payment: String,
  languages: String,
  contact: String,
  image: String,
}, { timestamps: true });
```

### 2. **Profile Routes**
Located in: `routes/profile.js`

#### Endpoints:
- **POST** `/api/profile` - Save/Update a profile
  - Body: Profile data (username, name, role, location, etc.)
  - Response: `{ success: true, profile: {...} }`

- **GET** `/api/profile/:username` - Retrieve a profile by username
  - Response: Profile data or 404 if not found

- **GET** `/api/profile/role/farmer` - Get all farmer profiles
  - Response: Array of farmer profiles

- **GET** `/api/profile/role/buyer` - Get all buyer profiles
  - Response: Array of buyer profiles

### 3. **Backend Server Integration**
Located in: `server.js`

Profile routes are registered:
```javascript
const profileRoutes = require("./routes/profile");
app.use("/api/profile", profileRoutes);
```

### 4. **Consumer Profile UI**
Located in: `public/consumer-profile.html`

**Features:**
- Upload profile image with preview
- Enter profile details (name, location, products, FPO, certifications, payment, languages, contact)
- Save profile to MongoDB
- Edit existing profiles
- Display saved profiles
- Fallback to localStorage if needed

### 5. **Farmer Profile UI**
Located in: `public/farmer-profile.html`

**Features:**
- Similar to consumer profile
- Image upload with preview
- Complete profile editing capabilities
- Save to MongoDB
- Display profile information

## 🚀 How to Use

### For Consumers:
1. Navigate to Consumer Dashboard
2. Click "Profile" in the sidebar
3. Fill in your profile details:
   - Upload a profile image
   - Enter name, location, interests
   - Specify certifications, languages, payment preferences
4. Click "Save Profile"
5. Profile is saved to MongoDB
6. To edit, click "Edit Profile" button

### For Farmers:
1. Navigate to Farmer Dashboard
2. Click "Profile" in the sidebar (or `farmer-profile.html`)
3. Fill in your profile details:
   - Upload a profile image
   - Enter name, location, products
   - Add FPO/Community information
   - Include certifications and contact info
4. Click "Save Profile"
5. Profile is saved to MongoDB
6. To edit, click "Edit Profile" button

## 📊 MongoDB Documents

Example Profile Document in MongoDB:

```json
{
  "_id": ObjectId("..."),
  "userId": ObjectId("..."),
  "username": "farmer_john",
  "name": "John Smith",
  "role": "Farmer",
  "location": "Punjab, India",
  "summary": "Organic vegetable farmer with 10 years experience",
  "products": "Tomatoes, Carrots, Lettuce",
  "fpo": "Punjab Farmers Association",
  "cert": "Organic Certification (APEDA)",
  "payment": "Bank Transfer, UPI",
  "languages": "Hindi, English, Punjabi",
  "contact": "john@example.com",
  "image": "data:image/png;base64,...",
  "createdAt": "2025-01-21T10:30:00.000Z",
  "updatedAt": "2025-01-21T10:30:00.000Z"
}
```

## 🔄 Data Flow

### Saving a Profile:
1. User fills out profile form in HTML
2. JavaScript collects form data
3. Sends POST request to `/api/profile`
4. Backend saves to MongoDB
5. Response confirms success
6. UI updates with saved profile

### Loading a Profile:
1. Page loads, gets username from localStorage
2. Fetches profile from `/api/profile/:username`
3. If not found in DB, tries localStorage
4. Displays profile information
5. Form fields auto-populate for editing

## 🔐 Important Notes

### Image Storage:
- Images are stored as Base64 encoded data URIs
- Stored directly in MongoDB
- Can be displayed directly as `<img src="data:image/..."/>`

### Validation:
- Username is required and unique
- Email format is validated on frontend
- Backend checks for required fields

### Session Management:
- Uses localStorage to track logged-in user
- Profile is tied to username
- MongoDB stores with timestamps

## 📝 API Examples

### Save Profile:
```bash
POST http://localhost:5000/api/profile
Content-Type: application/json

{
  "username": "farmer_john",
  "name": "John Smith",
  "role": "Farmer",
  "location": "Punjab",
  "products": "Tomatoes, Carrots",
  "fpo": "Punjab FPO",
  "cert": "Organic",
  "payment": "Bank Transfer",
  "languages": "Hindi, English",
  "contact": "john@example.com",
  "summary": "Experience farmer",
  "image": "data:image/png;base64,..."
}
```

### Get Profile:
```bash
GET http://localhost:5000/api/profile/farmer_john
```

### Get All Farmers:
```bash
GET http://localhost:5000/api/profile/role/farmer
```

## ✨ Features

- ✅ Save consumer profiles to MongoDB
- ✅ Save farmer profiles to MongoDB
- ✅ Image upload and preview
- ✅ Edit existing profiles
- ✅ Retrieve profiles by username
- ✅ Get profiles by role (farmer/buyer)
- ✅ Timestamps for tracking
- ✅ Fallback to localStorage
- ✅ Responsive design

## 🔧 MongoDB Connection

Make sure MongoDB is running:

```bash
# On Windows
mongod

# Or if using MongoDB as a service, it should auto-start
```

Connection string in `server.js`:
```javascript
mongoose.connect("mongodb://127.0.0.1:27017/greenfields", {...})
```

## 📂 File Changes Summary

| File | Changes |
|------|---------|
| `routes/profile.js` | Added endpoints for saving/getting profiles |
| `server.js` | Registered profile routes |
| `public/consumer-profile.html` | Updated to save to MongoDB |
| `public/farmer-profile.html` | Complete rewrite with MongoDB integration |

## 🐛 Troubleshooting

### Profile not saving?
- Check MongoDB is running
- Check browser console for errors
- Check server logs for errors

### Image not loading?
- Make sure image is properly encoded as Base64
- Check browser console for errors

### Profile not loading?
- Clear browser cache
- Check username in localStorage
- Check MongoDB connection

## 📞 Support

For issues or questions about the profile system, check:
1. Browser console for client-side errors
2. Server console for backend errors
3. MongoDB connection status

---

**Last Updated:** January 21, 2026
