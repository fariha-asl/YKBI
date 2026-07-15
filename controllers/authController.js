const jwt  = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sendToken = (res, user, statusCode = 200) => {
  const token = signToken(user.id);
  res.status(statusCode).json({
    success: true,
    token,
    user: user.toSafeObject(),
  });
};

exports.register = async (req, res) => {
  try {
    const { fullName, username, password, confirmPassword, whatsapp } = req.body;

    if (!fullName || !username || !password || !confirmPassword || !whatsapp) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match." });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    const waDigits = whatsapp.replace(/\D/g, "");
    if (waDigits.length < 7) {
      return res.status(400).json({ success: false, message: "Enter a valid WhatsApp number." });
    }

    const existing = await User.findOne({ where: { username: username.toLowerCase().trim() } });
    if (existing) {
      return res.status(409).json({ success: false, message: "Username already taken." });
    }

    const user = await User.create({
      fullName: fullName.trim(),
      username: username.toLowerCase().trim(),
      password,
      whatsapp: waDigits,
    });

    sendToken(res, user, 201);
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      const msg = err.errors.map((e) => e.message).join(" ");
      return res.status(400).json({ success: false, message: msg });
    }
    console.error("register error:", err);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and password are required." });
    }

    const user = await User.scope("withPassword").findOne({
      where: { username: username.toLowerCase().trim() },
    });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid username or password." });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Account has been deactivated." });
    }

    user.lastLogin = new Date();
    await user.save({ validate: false });

    sendToken(res, user);
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { username, whatsapp, newPassword, confirmPassword } = req.body;

    if (!username || !whatsapp || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    const waDigits = whatsapp.replace(/\D/g, "");
    const user = await User.scope("withPassword").findOne({
      where: { username: username.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "Username not found." });
    }
    if (user.whatsapp !== waDigits) {
      return res.status(400).json({ success: false, message: "WhatsApp number does not match." });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password reset successfully. Please sign in." });
  } catch (err) {
    console.error("forgot-password error:", err);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.json({ success: true, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};
