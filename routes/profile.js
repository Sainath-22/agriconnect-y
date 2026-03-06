const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");

// 🟢 Save or update profile
router.post("/", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    console.log("📝 Saving profile for username:", username);
    console.log("📦 Profile data:", req.body);

    // Check if profile exists
    const existingProfile = await Profile.findOne({ username });
    
    let updatedProfile;
    if (existingProfile) {
      // Update existing profile
      console.log("🔄 Updating existing profile");
      updatedProfile = await Profile.findOneAndUpdate(
        { username },
        { $set: req.body },
        { new: true, runValidators: true }
      );
    } else {
      // Create new profile
      console.log("✨ Creating new profile");
      updatedProfile = await Profile.create(req.body);
    }

    console.log("✅ Profile saved successfully:", updatedProfile);
    res.json({ success: true, profile: updatedProfile, message: "Profile saved successfully!" });
  } catch (err) {
    console.error("❌ Error saving profile:", err);
    res.status(500).json({ error: err.message || "Failed to save profile" });
  }
});

// 🟢 Get user profile
router.get("/:username", async (req, res) => {
  try {
    const profile = await Profile.findOne({ username: req.params.username });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 🟢 Get all farmer profiles
router.get("/role/farmer", async (req, res) => {
  try {
    const farmers = await Profile.find({ role: "Farmer" });
    res.json(farmers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 🟢 Get all buyer profiles
router.get("/role/buyer", async (req, res) => {
  try {
    const buyers = await Profile.find({ role: "Buyer" });
    res.json(buyers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
