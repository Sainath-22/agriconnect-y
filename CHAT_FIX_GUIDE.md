# Chat System Fix Guide

## Changes Made

### 1. **Fixed `/api/me` endpoint** (server.js:269-277)
- Added default `role: "buyer"` if role is not set
- This ensures Socket.IO receives the correct role during registration

### 2. **Enhanced Socket.IO connection** (chat.html:111-125)
- Added reconnection settings for more reliable connections
- Added connection/disconnect/error event listeners
- Better logging for debugging

### 3. **Fixed Socket.IO message handler** (server.js:59-78)
- Added try-catch error handling
- Added logging to track message delivery
- Indicates when recipient is offline (message saved to DB)

### 4. **Improved chat partners endpoint** (server.js:324-368)
- Added fallback to `buyerEmail` and `sellerEmail` if names are missing
- Better error handling and logging
- Returns proper error response instead of empty array

### 5. **Fixed chat.html registration** (chat.html:145-152)
- Properly destructures username and role from `/api/me` response
- Sends both in the `register` event to Socket.IO

---

## How to Test

### Prerequisites
1. Ensure MongoDB is running: `mongod`
2. Start the server: `npm start`
3. Open browser console (F12) to see debug messages

### Test Steps

#### Step 1: Create Orders Between Farmer & Buyer
1. Login as **Buyer**
2. Purchase a product from a **Farmer**
3. This creates an Order with `buyerName`, `sellerName` fields

#### Step 2: Test Chat Partners
1. Login as **Buyer** (same account from Step 1)
2. Go to chat.html
3. Check **Browser Console** (F12) for logs
4. Should see chat partners list populated

#### Step 3: Send & Receive Messages
1. Select a farmer from the list
2. Type a message and click "Send"
3. **Browser Console** should show:
   - ✅ Message sent event
   - 💾 Message saved to database
   - ✅ Message delivered to recipient (if online)

#### Step 4: Test Message History
1. Open chat with a farmer
2. Should see previous messages from this conversation
3. Messages should appear in chronological order

---

## Debugging Checklist

### Issue: No chat partners showing
- **Check**: Do you have orders between this buyer and farmer?
  - Go to `/orders` to verify
  - If no orders, create one first

- **Check**: Are the orders missing `buyerName` or `sellerName`?
  - Open MongoDB: `mongo greenfields`
  - Run: `db.orders.find({}).pretty()`
  - If names are missing, update orders with these fields

- **Check**: Server logs
  - Should show: `🔥 CHAT PARTNER API: { userId, username, role }`
  - Should show: `📦 Found X orders for buyer`

### Issue: Messages not delivering
- **Check**: Is recipient online?
  - Server console should show: `🟢 User connected: username role`
  - If not online, message is saved to DB for later

- **Check**: Server logs for message send
  - Should show: `💾 Message saved: from → to`
  - Should show: ✅ `Message delivered to <username>`

- **Check**: Network tab in browser
  - Look for `/api/chat/partners` response
  - Look for `socket.emit("sendMessage", ...)` events

### Issue: Chat history not loading
- **Check**: Network tab (F12)
  - Look for `/api/chat/:user` GET request
  - Should return array of messages

- **Check**: MongoDB
  - `db.chatmessages.find({}).pretty()`
  - Verify messages are saved with correct `from` and `to` fields

---

## Common Causes & Fixes

| Problem | Cause | Fix |
|---------|-------|-----|
| Empty chat partners | No orders created | Create an order between buyer & farmer |
| Messages not sent | Socket not connected | Check browser console for connection errors |
| Messages sent but not received | Recipient username mismatch | Ensure usernames match in order and chat |
| Messages appearing duplicated | Socket reconnection | Check socket reconnection settings |
| Chat history empty | Messages not in MongoDB | Verify ChatMessage schema matches |

---

## Key Files Modified

1. **[server.js](server.js)** - Chat routes and Socket.IO handlers
2. **[public/chat.html](public/chat.html)** - Frontend chat UI and Socket.IO client
3. **[models/ChatMessage.js](models/ChatMessage.js)** - (No changes needed)

---

## API Endpoints

```
GET /api/me
  Returns: { username, role }
  Purpose: Get current logged-in user info

GET /api/chat/partners
  Returns: { users: [farmer_names] } for buyers
           { users: [buyer_names] } for farmers
  Purpose: Get list of people you can chat with

GET /api/chat/:user
  Returns: Array of messages between current user and :user
  Purpose: Load chat history

POST /api/chat/read/:user
  Purpose: Mark messages as read
```

---

## Socket.IO Events

```
Client → Server:
  register: { username, role }
  sendMessage: { from, to, message }
  typing: { from, to }

Server → Client:
  receiveMessage: { from, message }
  showTyping: { from }
  userList: [{ username, role }, ...]
```
