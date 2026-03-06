#!/bin/bash
# MongoDB Profile API Testing Script
# Usage: Run these commands in PowerShell or Terminal to test the API

# ============================================
# 1. SAVE A FARMER PROFILE
# ============================================

echo "1️⃣ Saving a Farmer Profile..."
curl -X POST http://localhost:5000/api/profile ^
  -H "Content-Type: application/json" ^
  -d "{
    \"username\": \"farmer_john\",
    \"name\": \"John Smith\",
    \"role\": \"Farmer\",
    \"location\": \"Punjab, India\",
    \"summary\": \"Organic vegetable farmer with 10 years experience\",
    \"products\": \"Tomatoes, Carrots, Lettuce\",
    \"fpo\": \"Punjab Farmers Association\",
    \"cert\": \"APEDA Organic Certificate\",
    \"payment\": \"Bank Transfer, UPI\",
    \"languages\": \"Hindi, English, Punjabi\",
    \"contact\": \"john@example.com\",
    \"image\": \"data:image/png;base64,iVBORw0KGgo\"
  }"

echo.
echo.

# ============================================
# 2. SAVE A BUYER PROFILE
# ============================================

echo "2️⃣ Saving a Buyer Profile..."
curl -X POST http://localhost:5000/api/profile ^
  -H "Content-Type: application/json" ^
  -d "{
    \"username\": \"buyer_sarah\",
    \"name\": \"Sarah Johnson\",
    \"role\": \"Buyer\",
    \"location\": \"Delhi, India\",
    \"summary\": \"Looking for fresh organic vegetables\",
    \"products\": \"Organic vegetables\",
    \"fpo\": \"\",
    \"cert\": \"\",
    \"payment\": \"Online Payment\",
    \"languages\": \"English, Hindi\",
    \"contact\": \"sarah@example.com\",
    \"image\": \"data:image/png;base64,iVBORw0KGgo\"
  }"

echo.
echo.

# ============================================
# 3. GET A SPECIFIC PROFILE
# ============================================

echo "3️⃣ Getting a Specific Profile..."
curl -X GET http://localhost:5000/api/profile/farmer_john ^
  -H "Content-Type: application/json"

echo.
echo.

# ============================================
# 4. GET ALL FARMER PROFILES
# ============================================

echo "4️⃣ Getting All Farmer Profiles..."
curl -X GET http://localhost:5000/api/profile/role/farmer ^
  -H "Content-Type: application/json"

echo.
echo.

# ============================================
# 5. GET ALL BUYER PROFILES
# ============================================

echo "5️⃣ Getting All Buyer Profiles..."
curl -X GET http://localhost:5000/api/profile/role/buyer ^
  -H "Content-Type: application/json"

echo.
echo.

# ============================================
# 6. UPDATE A PROFILE
# ============================================

echo "6️⃣ Updating a Profile..."
curl -X POST http://localhost:5000/api/profile ^
  -H "Content-Type: application/json" ^
  -d "{
    \"username\": \"farmer_john\",
    \"name\": \"John Smith\",
    \"role\": \"Farmer\",
    \"location\": \"Punjab, India\",
    \"summary\": \"Updated: Organic vegetable farmer with 12 years experience\",
    \"products\": \"Tomatoes, Carrots, Lettuce, Spinach\",
    \"fpo\": \"Punjab Farmers Association\",
    \"cert\": \"APEDA Organic Certificate, ISO 9001\",
    \"payment\": \"Bank Transfer, UPI, Cheque\",
    \"languages\": \"Hindi, English, Punjabi\",
    \"contact\": \"john@example.com\",
    \"image\": \"data:image/png;base64,iVBORw0KGgo\"
  }"

echo.
echo.

# ============================================
# EXPECTED RESPONSES
# ============================================

echo "EXPECTED RESPONSES:"
echo "1. POST /api/profile"
echo "   {\"success\": true, \"profile\": {...}}"
echo ""
echo "2. GET /api/profile/:username"
echo "   {Full profile object}"
echo ""
echo "3. GET /api/profile/role/farmer"
echo "   [{profile1}, {profile2}, ...]"
echo ""
echo "4. GET /api/profile/role/buyer"
echo "   [{profile1}, {profile2}, ...]"

# ============================================
# NOTES
# ============================================

echo.
echo "NOTES:"
echo "- Replace localhost:5000 with your server URL if different"
echo "- Image should be Base64 encoded data URI"
echo "- Username must be unique (cannot create duplicate)"
echo "- All timestamps are automatic"
echo "- Use Postman or other tools if curl is not available"
