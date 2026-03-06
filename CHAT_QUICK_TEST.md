## Quick Chat Test Checklist ✅

### Before Testing
- [ ] MongoDB is running (`mongod`)
- [ ] Server is running (`npm start`)
- [ ] No console errors

### Test Scenario 1: Chat Partners Not Showing
```
1. Login as FARMER (or any seller)
2. Create a product
3. Logout, Login as BUYER
4. Purchase farmer's product (creates order)
5. Go to chat.html
6. Should see farmer in chat list
```
**Expected**: Farmer name appears in left sidebar
**If not**: Check console logs for: `📦 Found X orders`, `👨‍🌾 Chat partners`

---

### Test Scenario 2: Send & Receive Messages
```
1. In ONE browser: Login as FARMER, go to chat.html
2. In ANOTHER browser: Login as BUYER, go to chat.html
3. BUYER selects FARMER from chat list
4. BUYER types message and clicks Send
5. Check FARMER's browser - should see message instantly
```
**Expected**: 
- BUYER sees message on right (gray)
- FARMER sees message on left (blue)

**If not working**:
- Buyer console: Look for `✅ Connected to chat server`
- Farmer console: Look for `receiveMessage` event
- Server console: Look for `💾 Message saved`, `✅ Message delivered`

---

### Test Scenario 3: Message History
```
1. Close browser or refresh
2. Reopen chat.html
3. Select same farmer
4. Previous messages should appear
```
**Expected**: All previous messages visible in order
**If not**: Check Network tab for `/api/chat/` response

---

### Server Console Debug Patterns

✅ **WORKING**:
```
🟢 User connected: john_farmer farmer
📨 Fetching chat: jane_buyer ↔ john_farmer
✅ Found 5 messages
💾 Message saved: jane_buyer → john_farmer
✅ Message delivered to john_farmer
```

❌ **NOT WORKING**:
```
❌ Connection error
❌ Invalid chat message
⚠️ Recipient username is offline, message saved to DB
❌ Chat fetch error
```

---

### Browser Console Debug Patterns

✅ **WORKING**:
```
✅ Connected to chat server
✅ Loaded 5 messages
```

❌ **NOT WORKING**:
```
❌ Failed to get user info
❌ Chat fetch failed: 404
❌ Connection error
```

---

### MongoDB Verification

Check if orders have buyer/seller names:
```bash
mongo greenfields
db.orders.findOne({}, { projection: { buyerName: 1, sellerName: 1 } })
```

Should show:
```
{ buyerName: "john_buyer", sellerName: "jane_farmer" }
```

Check chat messages:
```bash
db.chatmessages.find({}).pretty()
```

Should show structure:
```json
{
  "_id": ObjectId(...),
  "from": "jane_buyer",
  "to": "john_farmer",
  "message": "Hello!",
  "read": false,
  "createdAt": ISODate("2026-01-22T...")
}
```

---

### Common Error Solutions

| Error | Solution |
|-------|----------|
| "No chat partners found" | Create order between buyer & farmer first |
| "Chat fetch failed: 401" | Not logged in - check session |
| "Failed to get user info" | `/api/me` endpoint broken - restart server |
| "Connection error" | Check CORS settings, MongoDB connection |
| Messages appear after refresh | Socket not connected - check connection logs |

---

### One-Liner Test Commands

Test API endpoint:
```powershell
Invoke-WebRequest http://localhost:5000/api/me -Credentials (Get-Credential)
```

Check if MongoDB has orders:
```bash
mongo greenfields -eval "db.orders.count()"
```

Check messages saved:
```bash
mongo greenfields -eval "db.chatmessages.count()"
```

---

### Still Having Issues?

1. Check [CHAT_FIX_GUIDE.md](CHAT_FIX_GUIDE.md) for detailed troubleshooting
2. Run [CHAT_DEBUG.ps1](CHAT_DEBUG.ps1) for automated diagnostics
3. Review console logs (both browser F12 and server terminal)
4. Verify MongoDB is running: `mongo --version`
5. Verify files were modified: Check line numbers match the guides
