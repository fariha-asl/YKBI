const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String, required: true, trim: true,
  },
  username: {
    type: String, required: true, unique: true,
    lowercase: true, trim: true,
  },
  password: {
    type: String, required: true, select: false,
  },
  whatsapp: {
    type: String, required: true, trim: true,
  },
  role: {
    type: String,
    enum: ["admin", "trainer", "member"],
    default: "member",
  },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
}, { timestamps: true });

userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
