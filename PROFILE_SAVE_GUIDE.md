# Profile Save to MongoDB - Complete Guide

## Overview
When a user clicks the "Save Profile" button in the consumer-profile.html, the profile data is now properly saved to MongoDB.

## How It Works

### 1. **Frontend (consumer-profile.html)**
- User fills in the profile form with their details:
  - Name, Role, Location, Summary, Products, FPO, Certifications, Payment, Languages, Contact
  - Profile image can be uploaded (stored as base64)
- Click "Save Profile" button
- Frontend validates required fields (Name, Role, Contact)
- Sends POST request to `/api/profile` with JSON data

### 2. **Backend (server.js)**
- Server listens on `localhost:5000`
- Route: `POST /api/profile` (defined in routes/profile.js)

### 3. **Profile Routes (routes/profile.js)**
The POST handler:
- Receives profile data
- Validates username is provided
- Checks if profile exists for that username
  - If EXISTS: Updates the existing profile
  - If NEW: Creates a new profile document
- Returns success response with saved profile data

### 4. **MongoDB (models/Profile.js)**
Stores in collection with these fields:
```javascript
{
  userId,          // Reference to User model (optional)
  username,        // Unique identifier for profile
  name,            // User's full name
  role,            // Farmer, Buyer, or Both
  location,        // User's location
  summary,         // Bio/summary
  products,        // Products they grow/buy
  fpo,             // Farmer Producer Organization
  cert,            // Certifications
  payment,         // Payment preferences
  languages,       // Languages spoken
  contact,         // Email/phone
  image,           // Profile picture (base64 encoded)
  createdAt,       // Auto-timestamp
  updatedAt        // Auto-timestamp
}
```

## Testing the Flow

### Prerequisites
✅ MongoDB running on `localhost:27017`
✅ Server running on `localhost:5000`

### Steps to Test
1. Open browser: `http://localhost:5000/public/consumer-profile.html`
2. Fill in the profile form:
   - Name: "John Farmer"
   - Role: "Farmer"
   - Contact: "john@example.com"
   - (Fill other fields as desired)
3. Click "Save Profile"
4. Check response:
   - ✅ Success alert should appear: "✅ Profile saved to MongoDB successfully!"
   - Profile data displays in the profile display section
5. Refresh the page - profile should persist from MongoDB

### Browser Console Logs
You should see:
```
📤 Sending profile data: {username, name, role, ...}
📥 Server response: {success: true, profile: {...}, message: "Profile saved successfully!"}
```

### Server Console Logs
Look for:
```
📝 Saving profile for username: john_doe
📦 Profile data: {...}
✨ Creating new profile  (first time)
OR
🔄 Updating existing profile  (subsequent saves)
✅ Profile saved successfully: {...}
```

## Features Added

✅ **Validation** - Required fields checked before sending
✅ **Error Handling** - Detailed error messages for debugging
✅ **Logging** - Server logs every save attempt with data
✅ **Auto-Update** - Automatically updates if profile exists
✅ **Persistence** - Data saved in MongoDB & localStorage fallback
✅ **Feedback** - User receives clear success/error messages

## Troubleshooting

### "Profile not found" error
- ✅ This is normal on first load - profile will be created on first save

### "Failed to save profile" error
- Check MongoDB is running: `mongosh` or MongoDB Atlas connection
- Check server is running and listening on port 5000
- Check browser console for detailed error message
- Look at server console for error details

### Profile not persisting
- Check MongoDB connection string in server.js (line 139)
- Verify collections exist in MongoDB with: `db.profiles.find()`

## Making the Feature Work

The implementation is now complete. When users:
1. Fill out the profile form
2. Click "Save Profile"

The data will be **automatically stored in MongoDB** with:
- Automatic creation or update logic
- Full error handling
- User-friendly feedback messages
- Data persistence across sessions

## Next Steps (Optional)
- Add image upload to server (currently base64 in frontend)
- Add user authentication to link profile with User ID
- Add profile deletion functionality
- Add profile search/filtering by role/location
