// backend/routes/auth.js
const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/authController");
const protect    = require("../middleware/auth");

router.post("/register",         controller.register);
router.post("/login",            controller.login);
router.post("/forgot-password",  controller.forgotPassword);
router.get( "/me",        protect, controller.getMe);

module.exports = router;
