# Save Both Farmer & Consumer Profiles to MongoDB ✅

## Overview
Both farmer and consumer profiles are now fully configured to save to MongoDB with proper validation and error handling.

## Architecture

### Shared Profile API
**Endpoint:** `POST /api/profile`
**Location:** `routes/profile.js`

Both farmer and consumer profiles use the SAME endpoint which:
- Checks if profile exists (by username)
- Updates if exists
- Creates if new
- Stores in MongoDB `profiles` collection

### MongoDB Collection: `profiles`
```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference to User),
  username: String (unique),
  name: String,
  role: String ("Farmer" or "Buyer"),
  location: String,
  summary: String,
  products: String,
  fpo: String,
  cert: String,
  payment: String,
  languages: String,
  contact: String,
  image: String (base64),
  createdAt: Date,
  updatedAt: Date
}
```

## Files Updated

### 1. **routes/profile.js** ✅
- POST handler: Save/update profile
- GET handler: Retrieve profile by username
- Full logging for debugging
- Error handling

### 2. **public/consumer-profile.html** ✅
- Field validation
- Enhanced error handling
- Better user feedback
- Stores in MongoDB via POST /api/profile

### 3. **public/farmer-profile.html** ✅ (Just Updated)
- Field validation (Name, Contact required)
- Enhanced error handling
- Console logging for debugging
- Better success/error messages
- Stores in MongoDB via POST /api/profile

## How to Test

### Step 1: Start Server
```bash
cd c:\Users\saina\OneDrive\Desktop\agri-x
node server.js
```

Expected Output:
```
🚀 Server running at http://localhost:5000
✅ MongoDB connected
```

### Step 2: Save Consumer Profile

1. Open: `http://localhost:5000/public/consumer-profile.html`
2. Log in with a username (stored in localStorage)
3. Fill form:
   - Name: "John Consumer"
   - Role: "Buyer"
   - Contact: "john@consumer.com"
   - (Other fields optional)
4. Click "Save Profile"
5. ✅ See success message
6. Refresh page → Profile persists from MongoDB!

### Step 3: Save Farmer Profile

1. Open: `http://localhost:5000/public/farmer-profile.html`
2. Log in with a username (stored in localStorage)
3. Fill form:
   - Name: "Raj Farmer"
   - Products: "Wheat, Rice"
   - Contact: "raj@farmer.com"
   - (Other fields optional)
4. Click "Save Profile"
5. ✅ See success message
6. Refresh page → Profile persists from MongoDB!

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│         CONSUMER & FARMER PROFILES SAVE FLOW            │
└─────────────────────────────────────────────────────────┘

USER FILLS FORM
├─ Consumer Form (consumer-profile.html)
│  ├─ Name, Role, Contact, Location, etc.
│  └─ Submit → Validation
│
└─ Farmer Form (farmer-profile.html)
   ├─ Name, Products, Contact, FPO, etc.
   └─ Submit → Validation

VALIDATION
├─ Check required fields (Name, Contact)
├─ Trim whitespace
└─ Build profileData JSON

SEND TO BACKEND
├─ POST /api/profile
├─ Content-Type: application/json
└─ Body: {username, name, role, ...}

BACKEND PROCESSING (routes/profile.js)
├─ Receive JSON data
├─ Check if profile exists by username
├─ If EXISTS → Update (findOneAndUpdate)
├─ If NEW → Create (create)
└─ Return success response

MONGODB STORAGE
├─ profiles collection
├─ Auto timestamps (createdAt, updatedAt)
└─ Data persisted

FRONTEND FEEDBACK
├─ Success message shown
├─ Profile displayed
├─ Data cached in localStorage
└─ Refresh page shows persisted data
```

## Console Logs to Expect

### Browser Console (F12 → Console)

**Consumer Profile:**
```
📤 Sending profile data: {username, name, role, ...}
📥 Server response: {success: true, profile: {...}}
```

**Farmer Profile:**
```
📤 Farmer Profile - Sending data: {username, name, role, ...}
📥 Farmer Profile - Server response: {success: true, profile: {...}}
```

### Server Console

**On First Save:**
```
📝 Saving profile for username: john_doe
📦 Profile data: {...}
✨ Creating new profile
✅ Profile saved successfully: {...}
```

**On Update:**
```
📝 Saving profile for username: john_doe
📦 Profile data: {...}
🔄 Updating existing profile
✅ Profile saved successfully: {...}
```

## Verification in MongoDB

### Connect to MongoDB
```bash
mongosh
use greenfields
```

### View All Profiles
```javascript
db.profiles.find()
```

### View Specific User Profile
```javascript
db.profiles.find({ username: "john_doe" })
```

### View Only Farmers
```javascript
db.profiles.find({ role: "Farmer" })
```

### View Only Consumers/Buyers
```javascript
db.profiles.find({ role: "Buyer" })
```

## Features Implemented

✅ **Consumer Profile Saving**
- Fill form → Save to MongoDB
- Auto-update if profile exists
- Persistent across sessions

✅ **Farmer Profile Saving**
- Fill form → Save to MongoDB
- Auto-update if profile exists
- Persistent across sessions

✅ **Validation**
- Required fields check (Name, Contact)
- Whitespace trimming
- User-friendly error messages

✅ **Error Handling**
- Network errors caught
- Server errors reported
- Validation errors shown
- Console logging for debugging

✅ **User Feedback**
- Success messages with ✅
- Error messages with ❌
- Auto-hide after 3 seconds
- Alert notifications

✅ **Data Persistence**
- Stored in MongoDB
- Fallback to localStorage
- Auto-load on page refresh

## Troubleshooting

### Profile Not Saving

**Check:**
1. Server running: `http://localhost:5000`
2. MongoDB running on localhost:27017
3. Network tab in F12 - POST request to /api/profile
4. Server console for error logs
5. Browser console for error messages

**Common Issues:**
- Port 5000 in use → Kill process: `taskkill /F /IM node.exe`
- MongoDB not running → Start: `mongod`
- Required field empty → Fill Name and Contact
- Network error → Check connection

### Data Not Persisting

**Check:**
1. No error message appeared (success message shown)
2. Verify in MongoDB: `db.profiles.findOne({ username: "yourname" })`
3. Check localStorage: `localStorage.getItem("profile_yourname")`
4. Server logs show "✅ Profile saved successfully"

## Next Steps

1. ✅ Both profiles can save to MongoDB
2. ✅ Both use same backend API
3. ✅ Both have validation and error handling
4. 🔄 Optional: Add profile image upload
5. 🔄 Optional: Add profile search/filtering
6. 🔄 Optional: Add profile deletion
7. 🔄 Optional: Link profile to User ID

## Quick Start

```bash
# Terminal 1: Start server
cd c:\Users\saina\OneDrive\Desktop\agri-x
node server.js

# Terminal 2: Test Consumer Profile
# Open: http://localhost:5000/public/consumer-profile.html

# Terminal 2: Test Farmer Profile
# Open: http://localhost:5000/public/farmer-profile.html
```

## Status: ✅ READY TO USE

Both farmer and consumer profiles are now fully integrated with MongoDB!
Save your profiles and they will persist in the database! 🎉
