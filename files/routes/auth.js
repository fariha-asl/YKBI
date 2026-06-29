const express    = require("express");
const router     = express.Router();

// Inline register handler - no external dependencies
router.post("/register", async (req, res) => {
  try {
    const User = require("../models/User");
    const jwt  = require("jsonwebtoken");
    const { fullName, username, password, confirmPassword, whatsapp } = req.body;

    if (!fullName || !username || !password || !confirmPassword || !whatsapp)
      return res.status(400).json({ success: false, message: "All fields are required." });

    if (password !== confirmPassword)
      return res.status(400).json({ success: false, message: "Passwords do not match." });

    if (password.length < 6)
      return res.status(400).json({ success: false, message: "Min 6 characters." });

    const waDigits = whatsapp.replace(/\D/g, "");
    if (waDigits.length < 7)
      return res.status(400).json({ success: false, message: "Invalid WhatsApp number." });

    const existing = await User.findOne({ username: username.toLowerCase().trim() });
    if (existing)
      return res.status(409).json({ success: false, message: "Username already taken." });

    const user = await User.create({
      fullName: fullName.trim(),
      username: username.toLowerCase().trim(),
      password,
      whatsapp: waDigits,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.status(201).json({ success: true, token, user: {
      _id: user._id, fullName: user.fullName,
      username: user.username, role: user.role,
    }});
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ success: false, message: "Server error." });
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
    console.error("login error:", err);
    res.status(500).json({ success: false, message: "Server error." });
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
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
