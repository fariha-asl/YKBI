// backend/models/User.js
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      match: [/^[a-z0-9_]+$/, "Username can only contain letters, numbers, underscores"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,          // never return password in queries by default
    },
    whatsapp: {
      type: String,
      required: [true, "WhatsApp number is required"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "trainer", "member"],
      default: "member",
    },
    rememberToken: { type: String, select: false },
    lastLogin:     { type: Date },
    isActive:      { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ── Hash password before save ────────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare plain-text password with hash ───────────────────
userSchema.methods.matchPassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

// ── Strip sensitive fields from JSON output ──────────────────────────────────
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.rememberToken;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
