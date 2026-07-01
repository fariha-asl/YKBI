const express  = require("express");
const router   = express.Router();

router.post("/register", async (req, res) => {
  try {
    console.log("=== REGISTER ATTEMPT ===");
    console.log("Body:", req.body);

    // Step 1: test mongoose
    const mongoose = require("mongoose");
    console.log("Mongoose state:", mongoose.connection.readyState);

    // Step 2: load User model
    const User = require("../models/User");
    console.log("User model loaded OK");

    const { fullName, username, password, confirmPassword, whatsapp } = req.body;

    // Step 3: basic checks
    if (!fullName || !username || !password || !confirmPassword || !whatsapp) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match." });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Min 6 characters." });
    }

    const waDigits = whatsapp.replace(/\D/g, "");
    if (waDigits.length < 7) {
      return res.status(400).json({ success: false, message: "Invalid WhatsApp number." });
    }

    // Step 4: check duplicate
    console.log("Checking duplicate username...");
    const existing = await User.findOne({ username: username.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: "Username already taken." });
    }

    // Step 5: create user
    console.log("Creating user...");
    const user = await User.create({
      fullName: fullName.trim(),
      username: username.toLowerCase().trim(),
      password,
      whatsapp: waDigits,
    });
    console.log("User created:", user._id);

    // Step 6: sign token
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.status(201).json({
      success: true, token,
      user: {
        _id: user._id, fullName: user.fullName,
        username: user.username, role: user.role,
      },
    });

  } catch (err) {
    // Show REAL error everywhere
    console.error("=== REGISTER ERROR ===");
    console.error("Message:", err.message);
    console.error("Stack:", err.stack);
    res.status(500).json({
      success: false,
      message: "ERROR: " + err.message,  // shows on screen
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const User = require("../models/User");
    const jwt  = require("jsonwebtoken");
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ success: false, message: "All fields required." });

    const user = await User.findOne({
      username: username.toLowerCase().trim()
    }).select("+password");

    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: "Invalid username or password." });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.json({ success: true, token, user: {
      _id: user._id, fullName: user.fullName,
      username: user.username, role: user.role,
    }});
  } catch (err) {
    console.error("LOGIN ERROR:", err.message);
    res.status(500).json({ success: false, message: "ERROR: " + err.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const User = require("../models/User");
    const { username, whatsapp, newPassword, confirmPassword } = req.body;

    if (!username || !whatsapp || !newPassword || !confirmPassword)
      return res.status(400).json({ success: false, message: "All fields required." });

    if (newPassword !== confirmPassword)
      return res.status(400).json({ success: false, message: "Passwords don't match." });

    const waDigits = whatsapp.replace(/\D/g, "");
    const user = await User.findOne({
      username: username.toLowerCase().trim()
    }).select("+password");

    if (!user)
      return res.status(404).json({ success: false, message: "Username not found." });

    if (user.whatsapp !== waDigits)
      return res.status(400).json({ success: false, message: "WhatsApp number does not match." });

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password reset successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: "ERROR: " + err.message });
  }
});

router.get("/me", require("../middleware/auth"), async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "ERROR: " + err.message });
  }
});

module.exports = router;
