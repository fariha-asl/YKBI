// backend/middleware/auth.js
const jwt = require("jsonwebtoken");
const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/authController");
const protect    = require("../middleware/auth");

// ✅ Public routes — NO protect middleware
router.post("/register",        controller.register);
router.post("/login",           controller.login);
router.post("/forgot-password", controller.forgotPassword);

// 🔒 Protected — requires JWT token
router.get("/me", protect, controller.getMe);

module.exports = router;
module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not authenticated." });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

