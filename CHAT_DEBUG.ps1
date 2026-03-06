# Chat System Debugging Script
# Run this in PowerShell to test your chat system

Write-Host "🔍 CHAT SYSTEM DIAGNOSTICS" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Check if server is running
Write-Host "`n1️⃣  Checking server status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/me" -ErrorAction Stop
    Write-Host "   ✅ Server is running on port 5000" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Server is NOT running. Start with: npm start" -ForegroundColor Red
    exit
}

# Check MongoDB
Write-Host "`n2️⃣  Checking MongoDB..." -ForegroundColor Yellow
try {
    $mongoCheck = Invoke-WebRequest -Uri "http://localhost:5000/" -ErrorAction Stop
    Write-Host "   ✅ MongoDB connection established" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  MongoDB might not be running. Start with: mongod" -ForegroundColor Yellow
}

# Test API endpoints
Write-Host "`n3️⃣  Testing API endpoints..." -ForegroundColor Yellow

Write-Host "   Testing /api/me..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/me" -ErrorAction Stop
    Write-Host "   ✅ /api/me is accessible" -ForegroundColor Green
} catch {
    Write-Host "   ❌ /api/me returned error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "   Testing /api/chat/partners..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/chat/partners" -ErrorAction Stop
    Write-Host "   ⚠️  /api/chat/partners needs authentication" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "   ✅ /api/chat/partners exists (requires login)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Check ChatMessage collection
Write-Host "`n4️⃣  Checking MongoDB collections..." -ForegroundColor Yellow
Write-Host "   To view chat messages, run in MongoDB shell:" -ForegroundColor Cyan
Write-Host "   mongo" -ForegroundColor DarkCyan
Write-Host "   use greenfields" -ForegroundColor DarkCyan
Write-Host "   db.chatmessages.find({}).pretty()" -ForegroundColor DarkCyan
Write-Host "   db.orders.find({}).pretty()" -ForegroundColor DarkCyan

Write-Host "`n5️⃣  Browser Console Checklist" -ForegroundColor Yellow
Write-Host "   - Open chat.html in browser (F12 for DevTools)" -ForegroundColor Cyan
Write-Host "   - Look for message:" -ForegroundColor Cyan
Write-Host "     ✅ Connected to chat server" -ForegroundColor Green
Write-Host "     ✅ Loaded X messages" -ForegroundColor Green
Write-Host "     ❌ Connection error / Failed to load messages" -ForegroundColor Red

Write-Host "`n6️⃣  Next Steps" -ForegroundColor Yellow
Write-Host "   1. Ensure you have created orders between buyer & farmer" -ForegroundColor Cyan
Write-Host "   2. Login as buyer and go to chat.html" -ForegroundColor Cyan
Write-Host "   3. Select a farmer and send a message" -ForegroundColor Cyan
Write-Host "   4. Check browser console (F12) for errors" -ForegroundColor Cyan
Write-Host "   5. If issues persist, check server logs" -ForegroundColor Cyan

Write-Host "`n✨ Diagnostics complete!" -ForegroundColor Green
