// server.js
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const User = require("./models/User.js");
const Product = require("./models/Product.js");
const http = require("http");
const { Server } = require("socket.io");
const Profile = require("./models/Profile");
const dotenv = require("dotenv");
dotenv.config();
const Order = require("./models/Order");
const ChatMessage = require("./models/ChatMessage");
const Rating = require("./models/Rating");
const axios = require("axios");

const { GoogleGenerativeAI } = require("@google/generative-ai");

const geminiKey = process.env.GEMINI_API_KEY?.trim();
const groqKey = process.env.GROQ_API_KEY?.trim();
const aiProvider = process.env.AI_PROVIDER?.trim()?.toLowerCase();

function isValidGeminiKey(key) {
  return typeof key === "string" && /^AIza[0-9A-Za-z_-]{35}$/.test(key);
}

function isValidGroqKey(key) {
  return typeof key === "string" && /^gsk_[0-9A-Za-z]+$/.test(key);
}

const hasValidGeminiKey = isValidGeminiKey(geminiKey);
const hasValidGroqKey = isValidGroqKey(groqKey);

function getPreferredAIProvider() {
  if (aiProvider === "gemini") {
    return hasValidGeminiKey ? "gemini" : hasValidGroqKey ? "groq" : "none";
  }
  if (aiProvider === "groq") {
    return hasValidGroqKey ? "groq" : hasValidGeminiKey ? "gemini" : "none";
  }
  if (hasValidGeminiKey) return "gemini";
  if (hasValidGroqKey) return "groq";
  return "none";
}

const selectedAIProvider = getPreferredAIProvider();

if (selectedAIProvider === "gemini") {
  console.log("✅ AI provider selected: Gemini");
} else if (selectedAIProvider === "groq") {
  console.log("✅ AI provider selected: Groq");
} else {
  console.warn("⚠️ No valid AI provider key found. AI assistant will use local fallback responses.");
}



// Initialize app
const app = express();
const PORT = 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow all origins for now
    methods: ["GET", "POST"]
  }
});

const cropRoutes = require("./routes/cropRoutes");
const profileRoutes = require("./routes/profile");
const paymentRoutes = require("./routes/payment");

// Store online users
// Store online users with role
let users = {}; // socketId -> { username, role }

io.on("connection", (socket) => {

  socket.on("register", ({ username, role }) => {
    // Normalize username to lowercase
    const usernameLower = username.toLowerCase();
    users[socket.id] = { username: usernameLower, role };

    console.log(`🟢 User connected (${socket.id}): ${usernameLower} (${role})`);
    console.log(`👥 Total online users: ${Object.keys(users).length}`);
    console.log(`   Users list: ${Object.values(users).map(u => `${u.username}(${u.role})`).join(", ")}`);
    
    io.emit("userList", Object.values(users));
  });

  socket.on("sendMessage", async ({ from, to, message }) => {
  if (!from || !to || !message) {
    console.error("❌ Invalid chat message:", { from, to, message });
    return;
  }

  try {
    // Normalize usernames to lowercase for consistent storage
    const fromLower = from.toLowerCase();
    const toLower = to.toLowerCase();
    
    const msg = new ChatMessage({ from: fromLower, to: toLower, message });
    await msg.save();
    console.log(`💾 Message saved to DB: ${fromLower} → ${toLower}: "${message}"`);

    // Send to recipient - look for all connections of that user
    let deliveredCount = 0;
    for (let id in users) {
      if (users[id].username.toLowerCase() === toLower) {
        io.to(id).emit("receiveMessage", { from: fromLower, message });
        console.log(`✅ Message delivered to socket ${id} (${users[id].username}): "${message}"`);
        deliveredCount++;
      }
    }
    
    if (deliveredCount === 0) {
      console.log(`⚠️ Recipient ${toLower} not online. Message saved to DB for later delivery.`);
    } else {
      console.log(`✅ Delivered to ${deliveredCount} connection(s) of ${toLower}`);
    }
  } catch (err) {
    console.error("❌ Error sending message:", err);
  }
});


  socket.on("typing", ({ from, to }) => {
    for (let id in users) {
      if (users[id].username === to) {
        io.to(id).emit("showTyping", { from });
      }
    }
  });

  socket.on("disconnect", () => {
    const user = users[socket.id];
    delete users[socket.id];
    console.log(`🔴 User disconnected (${socket.id}): ${user?.username}`);
    console.log(`👥 Remaining online users: ${Object.keys(users).length}`);
    io.emit("userList", Object.values(users));
  });
});





// --------- Ensure uploads folder exists ----------
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("📂 Created uploads folder");
}

// --------- Multer Setup (Image Upload) ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

const cors = require("cors");
app.use(cors({
  origin: "*", // or 3000 if your frontend runs there
  credentials: true,
}));


// --------- Middleware ----------
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(uploadDir));
app.use(express.json());

// --------- Session Setup ----------
app.use(
  session({
    secret: "mySecretKey123",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
}),
    cookie: { maxAge: 1000 * 60 * 60 },
  })
);

// --------- MongoDB Connection ----------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ Mongo error:", err));

// --------- Register Routes (AFTER Middleware) ----------
app.use("/api", cropRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/payment", paymentRoutes);

app.post("/signup", async (req, res) => {
  try {
    const { username, password, role, securityQuestion, securityAnswer, email, phone } = req.body;

    if (!username || !password || !role || !securityQuestion || !securityAnswer || !email || !phone) {
      return res.json({ success: false, message: "⚠️ All fields are required" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.json({ success: false, message: "⚠️ Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      role,
      securityQuestion,
      securityAnswer,
      email,        // ✅ Now stored
      phone         // ✅ Now stored
    });

    await newUser.save();
    console.log("✅ User registered:", username);

    res.json({ success: true, message: "Signup successful!" });
  } catch (error) {
    console.error("❌ Signup error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



// Save Order
app.post("/orders", isAuthenticated, async (req, res) => {
  try {
    const { productName, sellerName, sellerEmail, sellerPhone, action } = req.body;

    const order = new Order({
      buyer: req.session.userId,   // ✅ store logged-in buyer’s ID
      productName,
      sellerName,
      sellerEmail,
      sellerPhone,
      action
    });

    await order.save();
    res.status(201).json({ success: true, message: "Order saved!", order });
  } catch (err) {
    console.error("❌ Error saving order:", err);
    res.status(500).json({ success: false, error: "Failed to save order" });
  }
});

//const Order = require("./models/Order");

//const Order = mongoose.model("Order", orderSchema);

// ---------- LOGIN ----------
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.json({ success: false, message: "❌ User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "❌ Invalid password" });

    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.role = user.role ? user.role.toLowerCase() : "";  // ✅ Normalize
    await req.session.save();

    console.log("✅ Logged in:", user.username, "| Role:", req.session.role);
    res.json({ success: true, role: req.session.role });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ success: false, message: "Login error" });
  }
});


// ---------- AUTH MIDDLEWARE ----------
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
}



// ---------- GET SESSION USER ----------
app.get("/session-user", (req, res) => {
  if (req.session.userId) {
    res.json({ loggedIn: true, name: req.session.username, role: req.session.role });
  } else {
    res.json({ loggedIn: false });
  }
});

app.get("/api/me", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not logged in" });
  }
  res.json({
    username: req.session.username,
    role: req.session.role || "buyer"
  });
});


app.get("/api/chat/:user", isAuthenticated, async (req, res) => {
  try {
    const me = req.session.username.toLowerCase();
    const other = req.params.user.toLowerCase();

    if (!me || !other) {
      console.error("❌ Invalid sender or receiver:", { me, other });
      return res.status(400).json({ error: "Invalid sender or receiver" });
    }

    console.log(`📨 CHAT FETCH REQUEST: ${me} ↔ ${other}`);

    const messages = await ChatMessage.find({
      $or: [
        { from: me, to: other },
        { from: other, to: me }
      ]
    }).sort({ createdAt: 1 });

    console.log(`✅ Found ${messages.length} messages between ${me} and ${other}`);
    if (messages.length > 0) {
      console.log(`   Last message: "${messages[messages.length - 1].message}"`);
    }
    
    res.json(messages);
  } catch (err) {
    console.error("❌ Chat fetch error:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

app.get("/api/unread-count", isAuthenticated, async (req, res) => {
  const username = req.session.username;

  const unread = await ChatMessage.aggregate([
    { $match: { to: username, read: false } },
    { $group: { _id: "$from", count: { $sum: 1 } } }
  ]);

  res.json(unread);
});


// ✅ Get farmers that this buyer has ordered from
// 🔥 Get chat partners (order-based)
app.get("/api/chat/partners", isAuthenticated, async (req, res) => {
  try {
    const role = (req.session.role || "").toLowerCase(); // normalize role
    const userId = req.session.userId;
    const username = req.session.username;

    console.log("🔥 CHAT PARTNER API:", {
      userId,
      username,
      role
    });

    // BUYER → SELLERS/FARMERS
    if (role === "buyer") {
      const orders = await Order.find({ buyer: userId });
      console.log(`📦 Found ${orders.length} orders for buyer`);

      const sellers = [
        ...new Set(
          orders
            .map(o => (o.sellerName || o.sellerEmail || "").toLowerCase())
            .filter(Boolean)
        )
      ];

      console.log(`👨‍🌾 Chat partners (sellers): ${sellers.length > 0 ? sellers.join(", ") : "None"}`);
      return res.json({ users: sellers });
    }

    // SELLER/FARMER → BUYERS
    if (role === "seller" || role === "farmer") {
      const orders = await Order.find({ sellerId: userId });
      console.log(`📦 Found ${orders.length} orders for seller`);

      const buyers = [
        ...new Set(
          orders
            .map(o => (o.buyerName || o.buyerEmail || "").toLowerCase())
            .filter(Boolean)
        )
      ];

      console.log(`🛍️ Chat partners (buyers): ${buyers.length > 0 ? buyers.join(", ") : "None"}`);
      return res.json({ users: buyers });
    }

    console.warn(`⚠️ Unknown role: ${role}`);
    res.json({ users: [] });

  } catch (err) {
    console.error("❌ Chat partners error:", err);
    res.status(500).json({ error: "Failed to fetch chat partners", users: [] });
  }
});





// Get all orders
app.get("/orders", isAuthenticated, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.session.userId })
      .populate("productId", "name price")
      .populate("sellerId", "username email phone")
      .sort({ createdAt: -1 });

    const formatted = orders.map(o => ({
      _id: o._id,
      productName: o.productId?.name || o.productName || "Unnamed Product",
      productPrice: o.productId?.price || o.productPrice || "N/A",
      quantity: o.quantity || 0,
      totalAmount: o.totalAmount || 0,
      paymentStatus: o.paymentStatus || "Pending",
      paymentMode: o.paymentMode || "N/A",
      sellerName: o.sellerId?.username || o.sellerName || "Unknown",
      sellerEmail: o.sellerEmail || "Not Provided",
      sellerPhone: o.sellerPhone || "Not Provided",
      status: o.status || "Confirmed",
      createdAt: o.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});



app.post("/products", isAuthenticated, upload.single("image"), async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      sellerId: req.session.userId ,
      farmer: req.session.userId   // ✅ logged-in farmer
    });

    await product.save();
    res.status(201).json({ message: "Product added successfully", product });
  } catch (err) {
    console.error("❌ Error saving product:", err);
    res.status(500).json({ error: "Failed to save product" });
  }
});

// Example: backend/server.js
// ✅ FIXED: Return actual logged-in user info
app.get("/api/user", (req, res) => {
  if (req.session.userId) {
    res.json({
      success: true,
      username: req.session.username,
      role: req.session.role,
    });
  } else {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
});
app.post("/recover-password", async (req, res) => {
  try {
    const { username, securityAnswer, newPassword } = req.body;
    const user = await User.findOne({ username });

    if (!user) return res.json({ success: false, message: "User not found" });
    if (user.securityAnswer !== securityAnswer) {
      return res.json({ success: false, message: "Incorrect security answer" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: "✅ Password reset successful!" });
  } catch (err) {
    console.error("❌ Password recovery error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/api/chat/read/:user", isAuthenticated, async (req, res) => {
  await ChatMessage.updateMany(
    { from: req.params.user, to: req.session.username },
    { $set: { read: true } }
  );
  res.json({ success: true });
});


app.get("/recover-question", async (req, res) => {
  const { username } = req.query;
  const user = await User.findOne({ username });

  if (!user) return res.json({ success: false, message: "User not found" });

  res.json({ success: true, question: getQuestionText(user.securityQuestion) });
});

function getQuestionText(key) {
  const questions = {
    pet: "What is your pet's name?",
    school: "What was your first school name?",
    mother: "What is your mother's maiden name?",
  };
  return questions[key] || "Security question";
}


// ---------- LOGOUT ----------
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login.html");
  });
});



// Get all farmers (role: "Farmer" or "Both")
app.get("/api/farmers", async (req, res) => {
  try {
    const farmers = await Profile.find({ role: { $in: ["Farmer", "Both"] } });
    const users = await User.find({}, "username email phone");
    const merged = farmers.map(f => {
      const user = users.find(u => u.username === f.username);
      return {
        ...f.toObject(),
        email: user?.email,
        phone: user?.phone
      };
    });
    res.json(merged);
  } catch (err) {
    console.error("Error fetching farmers:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// Get single farmer by ID
app.get("/api/farmers/:id", async (req, res) => {
  try {
    const farmer = await Profile.findById(req.params.id);
    if (!farmer) return res.status(404).json({ error: "Farmer not found" });
    res.json(farmer);
  } catch (err) {
    console.error("Error fetching farmer:", err);
    res.status(500).json({ error: "Server error while fetching farmer" });
  }
});




app.get("/my-products", isAuthenticated, async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.session.userId })
      .sort({ createdAt: -1 });
    
    console.log(`📦 Fetched ${products.length} products for farmer ${req.session.username}`);
    console.log("Products with details:", products.map(p => ({ 
      name: p.name, 
      category: p.category, 
      price: p.price, 
      quantity: p.quantity 
    })));
    
    res.json(products);
  } catch (err) {
    console.error("❌ Error fetching farmer products:", err);
    res.status(500).json({ error: "Failed to fetch farmer products" });
  }
});

// DEBUG endpoint - check all products in database
app.get("/debug/all-products", async (req, res) => {
  try {
    const allProducts = await Product.find().limit(10);
    console.log("📊 All products in database:", allProducts);
    res.json(allProducts);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// DEBUG endpoint - add test products for logged-in farmer
app.post("/debug/add-test-products", isAuthenticated, async (req, res) => {
  try {
    const testProducts = [
      {
        name: "Tomato",
        category: "Vegetables",
        price: 50,
        quantity: 100,
        description: "Fresh red tomatoes",
        farmer: req.session.userId
      },
      {
        name: "Rice",
        category: "Grains",
        price: 150,
        quantity: 500,
        description: "White basmati rice",
        farmer: req.session.userId
      },
      {
        name: "Carrot",
        category: "Vegetables",
        price: 40,
        quantity: 200,
        description: "Fresh orange carrots",
        farmer: req.session.userId
      },
      {
        name: "Wheat",
        category: "Grains",
        price: 100,
        quantity: 300,
        description: "Organic wheat",
        farmer: req.session.userId
      },
      {
        name: "Spinach",
        category: "Vegetables",
        price: 30,
        quantity: 150,
        description: "Fresh spinach leaves",
        farmer: req.session.userId
      }
    ];

    const created = await Product.insertMany(testProducts);
    console.log("✅ Created test products:", created.length);
    res.json({ success: true, message: `Created ${created.length} test products`, products: created });
  } catch (err) {
    console.error("❌ Error creating test products:", err);
    res.status(500).json({ error: err.message });
  }
});

// Save or update a profile
app.post("/api/profile", async (req, res) => {
  try {
    const {
      username,
      role,
      name,
      location,
      summary,
      products,
      fpo,
      cert,
      payment,
      languages,
      contact,
      image,
    } = req.body;

    if (!username || !role) {
      return res.status(400).json({ error: "Username and role are required" });
    }

    let profile = await Profile.findOne({ username });

    if (profile) {
      Object.assign(profile, {
        role,
        name,
        location,
        summary,
        products,
        fpo,
        cert,
        payment,
        languages,
        contact,
        image,
      });
      await profile.save();
    } else {
      profile = new Profile({
        username,
        role,
        name,
        location,
        summary,
        products,
        fpo,
        cert,
        payment,
        languages,
        contact,
        image,
      });
      await profile.save();
    }

    console.log("✅ Profile saved:", profile.username);
    res.json({ message: "Profile saved successfully", profile });
  } catch (err) {
    console.error("❌ Error saving profile:", err.message);
    console.error(err.stack);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/place-order", isAuthenticated, async (req, res) => {
  try {
    const { productId, quantity, address, buyerName, buyerEmail, buyerPhone, paymentMode, totalAmount } = req.body;

    // Find product and its seller (farmer)
    const product = await Product.findById(productId).populate("farmer", "username email phone");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Calculate total amount
    const calculatedAmount = totalAmount || (product.price * quantity);

    // Create a new order
    const order = new Order({
      productId: product._id,
      productName: product.name,
      productPrice: product.price,
      sellerId: product.farmer?._id,
      sellerName: product.farmer?.username ,
      sellerEmail: product.farmer?.email ,
      sellerPhone: product.farmer?.phone ,
      buyer: req.session.userId,
      buyerName,
      buyerEmail,
      buyerPhone,
      buyerAddress: address,
      quantity,
      totalAmount: calculatedAmount,
      paymentMode,
      status: "Pending",
      createdAt: new Date(),
    });

    await order.save();

    console.log("✅ Order placed successfully:", order);
    res.json({ success: true, message: "Order placed successfully!", order });
  } catch (error) {
    console.error("❌ Error placing order:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ================== FETCH FARMER’S RECEIVED ORDERS ==================
// ✅ Fetch all orders belonging to the logged-in farmer
// ✅ Fetch orders for logged-in farmer
app.get("/api/farmer/orders", async (req, res) => {
  try {
    // Check session first
    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: Please log in" });
    }

    // Make role comparison case-insensitive
    const role = (req.session.role || "").toLowerCase();
    console.log("SESSION DEBUG:", req.session);

    if (!["farmer","seller", "both"].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: Only farmers can view orders",
        role: req.session.role,
      });
    }

    // Now fetch orders
    const farmerId = req.session.userId;
    const orders = await Order.find({ sellerId: farmerId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders: orders.map(o => ({
        id: o._id,
        productName: o.productName,
        productPrice: o.productPrice,
        buyerName: o.buyerName,
        buyerEmail: o.buyerEmail,
        buyerPhone: o.buyerPhone,
        buyerAddress: o.buyerAddress,
        quantity: o.quantity,
        paymentMode: o.paymentMode,
        status: o.status,
        createdAt: o.createdAt,
      })),
    });
  } catch (err) {
    console.error("❌ Error fetching farmer orders:", err);
    res.status(500).json({ success: false, message: "Failed to fetch farmer orders" });
  }
});


// Get profile for a specific user
app.get("/api/profile/:username", async (req, res) => {
  try {
    const profile = await Profile.findOne({ username: req.params.username });
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/order", isAuthenticated, async (req, res) => {
  try {
    const { productId, buyerName, buyerEmail, buyerPhone, buyerAddress } = req.body;

    const product = await Product.findById(productId)
      .populate("farmer", "username email phone");

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const order = new Order({
      productId: product._id,
      productName: product.name,
      productPrice: product.price,

      sellerId: product.farmer?._id,
      sellerName: product.farmer?.username,
      sellerEmail: product.farmer?.email,
      sellerPhone: product.farmer?.phone,

      buyer: req.session.userId,
      buyerName,
      buyerEmail,
      buyerPhone,
      buyerAddress,

      status: "Pending",
      createdAt: new Date(),
    });

    await order.save();
    res.json({ success: true, message: "Order saved successfully!", order });

  } catch (err) {
    console.error("❌ Error creating order:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});


// ---------- ADD PRODUCT ----------
app.post("/add-product", isAuthenticated, upload.single("image"), async (req, res) => {
  try {
    const { name, price, quantity, description, phone, contactEmail } = req.body;

    if (!name || !price || !quantity || !phone || !contactEmail) {
      return res.status(400).json({ success: false, message: "⚠️ All required fields must be filled" });
    }

    const newProduct = new Product({
      name,
      price,
      quantity,
      description,
      phone,
      contactEmail,
      image: req.file ? "/uploads/" + req.file.filename : null,
      farmer: req.session.userId,
    });

    await newProduct.save();
    console.log("✅ New product added:", newProduct);
    res.json({ success: true, message: "✅ Product added successfully!" });
  } catch (err) {
    console.error("❌ Error saving product:", err);
    res.status(500).json({ success: false, message: "Error saving product" });
  }
});
app.get("/test", (req, res) => {
  res.json({ message: "Server is working ✅" });
});

// ---------- GET PRODUCTS ----------
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find().populate("farmer", "username role").lean();
    
    if (!products || products.length === 0) {
      console.log("ℹ️ No products found in database");
      return res.json([]);
    }
    
    const formatted = products.map(p => ({
      _id: p._id,
      id: p._id.toString(),
      name: p.name || "Unnamed Product",
      price: p.price || 0,
      quantity: p.quantity || 0,
      description: p.description || "",
      category: p.category || "Other",
      image: p.image || "https://via.placeholder.com/150",
      sellerName: p.farmer?.username || "Unknown Seller",
      sellerEmail: p.contactEmail || "Not Provided",
      sellerPhone: p.phone || "Not Provided",
      createdAt: p.createdAt
    }));
    
    console.log(`✅ Fetched ${formatted.length} products`);
    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// ---------- UPDATE PRODUCT (with price history tracking) ----------
app.put("/products/:id", isAuthenticated, upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, quantity, description, phone, contactEmail, category } = req.body;

    // Get current product
    const currentProduct = await Product.findById(id);
    if (!currentProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Check if price changed
    const oldPrice = currentProduct.price;
    const newPrice = parseFloat(price);
    const priceChanged = oldPrice !== newPrice;

    // Update product
    const updateData = {
      name: name || currentProduct.name,
      price: newPrice,
      quantity: quantity !== undefined ? quantity : currentProduct.quantity,
      description: description !== undefined ? description : currentProduct.description,
      phone: phone || currentProduct.phone,
      contactEmail: contactEmail || currentProduct.contactEmail,
      category: category || currentProduct.category
    };

    if (req.file) {
      updateData.image = "/uploads/" + req.file.filename;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

    // Track price change in history
    if (priceChanged) {
      const PriceHistory = require("./models/PriceHistory");
      const priceHistory = new PriceHistory({
        productId: id,
        productName: updatedProduct.name,
        farmerId: updatedProduct.farmer,
        oldPrice: oldPrice,
        newPrice: newPrice,
        category: updatedProduct.category,
        reason: "Manual update"
      });
      await priceHistory.save();
      console.log("📊 Price change tracked:", { oldPrice, newPrice, productId: id });
    }

    res.json({ success: true, message: "✅ Product updated successfully!", product: updatedProduct });
  } catch (err) {
    console.error("❌ Error updating product:", err);
    res.status(500).json({ success: false, message: "Error updating product" });
  }
});

// ---------- PRICE PREDICTION API ----------
app.post("/api/predict-price", async (req, res) => {
  try {
    const {
      product_name,
      category,
      current_price,
      market_demand = "medium",
      weather_impact = "none",
      days_ahead = 30
    } = req.body;

    // Validate required fields
    if (!product_name || !category || !current_price) {
      return res.status(400).json({
        success: false,
        message: "Product name, category, and current price are required"
      });
    }

    // Call Python ML API
    const pythonResponse = await axios.post('http://localhost:5002/predict', {
      product_name,
      category,
      current_price: parseFloat(current_price),
      market_demand,
      weather_impact,
      days_ahead: parseInt(days_ahead)
    }, {
      timeout: 10000 // 10 second timeout
    });

    res.json({
      success: true,
      prediction: pythonResponse.data
    });

  } catch (error) {
    console.error("❌ Price prediction error:", error.message);

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: "Price prediction service is currently unavailable. Please try again later."
      });
    }

    res.status(500).json({
      success: false,
      message: "Error predicting price",
      error: error.response?.data?.error || error.message
    });
  }
});

// ---------- GET PRICE HISTORY FOR A PRODUCT ----------
app.get("/api/price-history/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const PriceHistory = require("./models/PriceHistory");

    const history = await PriceHistory.find({ productId })
      .sort({ date: -1 })
      .limit(50); // Last 50 price changes

    res.json({
      success: true,
      history: history
    });

  } catch (error) {
    console.error("❌ Error fetching price history:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching price history"
    });
  }
});

// ---------- GET USER INFO (for role detection) ----------
app.get("/api/user", async (req, res) => {
  try {
    // If using sessions
    if (req.session && req.session.userId) {
      const user = await User.findById(req.session.userId).select("-password");
      if (user) return res.json(user);
    }
    
    // If not logged in
    res.status(401).json({ error: "Not authenticated" });
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------- GET FARMER PROFILE WITH PRODUCTS ----------
app.get("/api/farmer-profile/:username", async (req, res) => {
  try {
    const { username } = req.params;
    
    // Get farmer profile
    const profile = await Profile.findOne({ username });
    if (!profile) {
      return res.status(404).json({ error: "Farmer profile not found" });
    }
    
    // Get all products by this farmer
    const farmer = await User.findOne({ username });
    const products = farmer ? await Product.find({ farmer: farmer._id }).lean() : [];
    
    // Format products
    const formattedProducts = products.map(p => ({
      _id: p._id,
      id: p._id.toString(),
      name: p.name || "Unnamed Product",
      price: p.price || 0,
      quantity: p.quantity || 0,
      description: p.description || "",
      category: p.category || "Other",
      image: p.image || "https://via.placeholder.com/150",
      createdAt: p.createdAt
    }));
    
    res.json({
      profile: {
        _id: farmer._id,  // Add farmer's User ID for ratings
        username: profile.username,
        name: profile.name,
        role: profile.role,
        location: profile.location,
        summary: profile.summary,
        contact: profile.contact,
        languages: profile.languages,
        fpo: profile.fpo,
        cert: profile.cert,
        image: profile.image,
        productsCount: formattedProducts.length
      },
      products: formattedProducts,
      totalProducts: formattedProducts.length
    });
  } catch (err) {
    console.error("❌ Error fetching farmer profile:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/recommend-crops", async (req, res) => {
  const { soilType, season, region } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Recommend the best 3 crops for a farmer based on:
      - Soil type: ${soilType}
      - Season: ${season}
      - Region: ${region}
      Give short explanations for each crop.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ recommendations: text });
  } catch (error) {
    console.error("Gemini recommendation error:", error);
    res.status(500).json({ error: "Failed to fetch crop recommendations" });
  }
});


// ✅ Fetch single order by ID
app.get("/api/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Notify PhonePe user (seller) with payment message - placeholder implementation
app.post('/api/notify-phonepe', async (req, res) => {
  try {
    const { phone, upiId, amount, orderId } = req.body;

    if (!phone) return res.status(400).json({ success: false, message: 'Phone number required' });
    // If Twilio credentials are provided, send SMS via Twilio
    if (process.env.TWILIO_SID && process.env.TWILIO_TOKEN && process.env.TWILIO_FROM) {
      try {
        const twilio = require('twilio');
        const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
        const msg = `Payment request: ₹${amount}. Pay via UPI: ${upiId} (Order ${orderId})`;
        await client.messages.create({ body: msg, from: process.env.TWILIO_FROM, to: phone });
        console.log(`Twilio SMS sent to ${phone}`);
        return res.json({ success: true, message: 'Notification sent via SMS.' });
      } catch (twErr) {
        console.error('Twilio send error:', twErr);
        // fallback to simulated response
      }
    }

    // Fallback: log the notification and return success (simulated)
    console.log(`Notify PhonePe (simulated) -> phone: ${phone}, upi: ${upiId}, amount: ${amount}, orderId: ${orderId}`);
    res.json({ success: true, message: 'Notification queued (simulated).' });
  } catch (err) {
    console.error('Error notifying PhonePe user:', err);
    res.status(500).json({ success: false, message: 'Failed to notify PhonePe user' });
  }
});

// ✅ Update order status to "Confirmed"
app.put("/api/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { status: status || "Confirmed" },
      { new: true }
    );

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, order });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


function getLocalAIFallback(message) {
  const text = (message || "").toLowerCase();

  if (text.includes("crop") || text.includes("plant")) {
    return "For crop planning, choose varieties suited to your season and soil. In India, rice and wheat are good for wet soil, while millets and pulses suit dry areas. Rotate crops to protect soil health.";
  }
  if (text.includes("soil") || text.includes("fertilizer") || text.includes("manure")) {
    return "Test your soil if possible. For acidic soil, add lime; for alkaline soil, add organic matter. Use compost or well-rotted manure to improve texture and fertility.";
  }
  if (text.includes("weather") || text.includes("rain") || text.includes("monsoon")) {
    return "Watch local weather reports and prepare for rain with good drainage. In dry weather, water crops early morning or late evening to reduce evaporation.";
  }
  if (text.includes("pest") || text.includes("disease") || text.includes("insect")) {
    return "Inspect plants regularly and remove damaged leaves. Use neem oil or homemade soap spray for many pests, and practice crop rotation to reduce disease pressure.";
  }
  if (text.includes("irrig") || text.includes("water")) {
    return "Irrigate deeply and less frequently rather than light daily watering. This encourages deep roots and improves drought resistance.";
  }
  if (text.includes("market") || text.includes("price") || text.includes("sell")) {
    return "Check local market prices before harvest and compare buyers. Direct sales to consumers or cooperatives can improve profit margins.";
  }

  return "I'm AgriConnect AI. I can help with farming advice on crops, soil, weather, pests, irrigation, and market planning. Please ask a specific farming question.";
}

// ---------- AI CHATBOT ENDPOINT ----------
app.post("/api/chatbot", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Message is required" });
    }

    const runGemini = async () => {
      const model = new GoogleGenerativeAI(geminiKey).getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `You are AgriConnect AI, a helpful farming assistant. Provide practical farming advice about crops, soil, weather, pests, irrigation, and farming best practices. Keep responses concise and actionable.\n\nUser: ${message}`;
      const result = await model.generateContent(prompt);
      return result.response?.text?.() || getLocalAIFallback(message);
    };

    const runGroq = async () => {
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content:
                "You are AgriConnect AI, a helpful farming assistant. Provide practical farming advice about crops, soil, weather, pests, irrigation, and farming best practices. Keep responses concise and actionable.",
            },
            {
              role: "user",
              content: message,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        },
        {
          headers: {
            Authorization: `Bearer ${groqKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data?.choices?.[0]?.message?.content || getLocalAIFallback(message);
    };

    if (selectedAIProvider === "gemini") {
      if (!hasValidGeminiKey) {
        console.warn("⚠️ GEMINI_API_KEY is set but invalid. Falling back to Groq or local responses.");
      } else {
        try {
          const reply = await runGemini();
          return res.json({ reply });
        } catch (geminiError) {
          console.error("❌ Gemini API error:", geminiError?.message || geminiError, geminiError?.response?.data || "no response data");
          if (hasValidGroqKey) {
            console.warn("⚠️ Falling back from Gemini to Groq due to Gemini error.");
            try {
              const reply = await runGroq();
              return res.json({ reply });
            } catch (groqError) {
              console.error("❌ Groq fallback error:", groqError?.response?.data || groqError?.message || groqError);
            }
          }
          return res.json({ reply: getLocalAIFallback(message) });
        }
      }
    }

    if (selectedAIProvider === "groq") {
      if (!hasValidGroqKey) {
        console.warn("⚠️ GROQ_API_KEY is set but invalid. Falling back to Gemini or local responses.");
      } else {
        try {
          const reply = await runGroq();
          return res.json({ reply });
        } catch (groqError) {
          console.error("❌ Groq API error:", groqError?.response?.status, groqError?.response?.data || groqError?.message || groqError);
          if (hasValidGeminiKey) {
            console.warn("⚠️ Falling back from Groq to Gemini due to Groq error.");
            try {
              const reply = await runGemini();
              return res.json({ reply });
            } catch (geminiFallbackError) {
              console.error("❌ Gemini fallback error:", geminiFallbackError?.response?.data || geminiFallbackError?.message || geminiFallbackError);
            }
          }
          return res.json({ reply: getLocalAIFallback(message) });
        }
      }
    }

    if (selectedAIProvider === "none") {
      if (hasValidGeminiKey) {
        try {
          const reply = await runGemini();
          return res.json({ reply });
        } catch (e) {
          console.error("❌ Gemini API error (no provider selected):", e?.message || e, e?.response?.data || "no response data");
          if (hasValidGroqKey) {
            try {
              const reply = await runGroq();
              return res.json({ reply });
            } catch (groqErr) {
              console.error("❌ Groq API error (fallback):", groqErr?.response?.data || groqErr?.message || groqErr);
            }
          }
          return res.json({ reply: getLocalAIFallback(message) });
        }
      }
      if (hasValidGroqKey) {
        try {
          const reply = await runGroq();
          return res.json({ reply });
        } catch (groqError) {
          console.error("❌ Groq API error (no provider selected):", groqError?.response?.data || groqError?.message || groqError);
          return res.json({ reply: getLocalAIFallback(message) });
        }
      }
    }

    console.error("❌ Chatbot configuration error: no valid AI provider key found.");
    return res.json({ reply: getLocalAIFallback(message) });
  } catch (error) {
    console.error("❌ Chatbot error:", error?.message || error, error?.response?.data || "no response data");
    res.json({ reply: getLocalAIFallback(req.body?.message || "") });
  }
});

// Get user by username (for rating form)
app.get("/api/user/by-username/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select("_id username role");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("❌ Error fetching user by username:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// ---------- FARMER RATINGS ----------

// Submit a rating for a farmer
app.post("/api/ratings", isAuthenticated, async (req, res) => {
  try {
    const { farmerId, rating, review, productName, categories } = req.body;

    if (!farmerId || !rating) {
      return res.status(400).json({ error: "Farmer ID and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Check if consumer already rated this farmer (optional: allow multiple ratings)
    const existingRating = await Rating.findOne({
      farmer: farmerId,
      consumer: req.session.userId
    });

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.review = review;
      existingRating.productName = productName;
      existingRating.categories = categories || [];
      existingRating.updatedAt = Date.now();
      await existingRating.save();
      return res.json({ success: true, message: "Rating updated", rating: existingRating });
    }

    // Create new rating
    const newRating = new Rating({
      farmer: farmerId,
      consumer: req.session.userId,
      rating,
      review,
      productName,
      categories: categories || [],
      isVerifiedPurchase: true
    });

    await newRating.save();
    console.log(`⭐ New rating submitted: ${rating} stars for farmer ${farmerId}`);

    res.json({ success: true, message: "Rating submitted successfully", rating: newRating });
  } catch (err) {
    console.error("❌ Error submitting rating:", err);
    res.status(500).json({ error: "Failed to submit rating" });
  }
});

// Get ratings for a specific farmer
app.get("/api/ratings/farmer/:farmerId", async (req, res) => {
  try {
    const { farmerId } = req.params;

    const ratings = await Rating.find({ farmer: farmerId })
      .populate("consumer", "username")
      .sort({ createdAt: -1 });

    if (!ratings.length) {
      return res.json({ success: true, ratings: [], average: 0, count: 0 });
    }

    // Calculate average rating
    const average = (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1);

    // Break down by rating
    const breakdown = {
      5: ratings.filter(r => r.rating === 5).length,
      4: ratings.filter(r => r.rating === 4).length,
      3: ratings.filter(r => r.rating === 3).length,
      2: ratings.filter(r => r.rating === 2).length,
      1: ratings.filter(r => r.rating === 1).length
    };

    console.log(`⭐ Fetched ${ratings.length} ratings for farmer ${farmerId}, Average: ${average}`);

    res.json({
      success: true,
      ratings,
      average: parseFloat(average),
      count: ratings.length,
      breakdown
    });
  } catch (err) {
    console.error("❌ Error fetching ratings:", err);
    res.status(500).json({ error: "Failed to fetch ratings" });
  }
});

// Get all ratings submitted by consumer
app.get("/api/my-ratings", isAuthenticated, async (req, res) => {
  try {
    const ratings = await Rating.find({ consumer: req.session.userId })
      .populate("farmer", "username")
      .sort({ createdAt: -1 });

    res.json({ success: true, ratings });
  } catch (err) {
    console.error("❌ Error fetching my ratings:", err);
    res.status(500).json({ error: "Failed to fetch your ratings" });
  }
});

// Delete a rating (only by the person who submitted it)
app.delete("/api/ratings/:ratingId", isAuthenticated, async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.ratingId);

    if (!rating) {
      return res.status(404).json({ error: "Rating not found" });
    }

    // Check if user is the one who submitted the rating
    if (rating.consumer.toString() !== req.session.userId) {
      return res.status(403).json({ error: "You can only delete your own ratings" });
    }

    await Rating.findByIdAndDelete(req.params.ratingId);
    console.log(`🗑️ Rating deleted by ${req.session.username}`);

    res.json({ success: true, message: "Rating deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting rating:", err);
    res.status(500).json({ error: "Failed to delete rating" });
  }
});

// ---------- START SERVER ----------
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});  