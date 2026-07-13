// models/Member.js
const mongoose = require("mongoose");

const FamilyMemberSchema = new mongoose.Schema(
  {
    clientId:  { type: String, trim: true },
    firstName: { type: String, trim: true },
    lastName:  { type: String, trim: true },
  },
  { _id: false }
);

const MemberSchema = new mongoose.Schema(
  {
    // Identity
    isCompany:   { type: Boolean, default: false },
    clientId:    { type: String, required: true, unique: true, trim: true },
    firstName:   { type: String, required: true, trim: true },
    lastName:    { type: String, required: true, trim: true },
    middleName:  { type: String, trim: true },
    email:       { type: String, trim: true, lowercase: true },
    emailOptOut: { type: Boolean, default: false },
    phoneType:   { type: String, enum: ["mobile", "home"], default: "mobile" },
    phoneNumber: { type: String, trim: true },

    // Address & Location
    address: {
      street:     { type: String, trim: true },
      city:       { type: String, trim: true },
      state:      { type: String, trim: true },
      country:    { type: String, trim: true, default: "United States" },
      postalCode: { type: String, trim: true },
    },

    // Personal Info
    gender:       { type: String, enum: ["Male", "Female", "Other", "Prefer not to say"], default: "Male" },
    birthday:     { type: Date },
    referralType: { type: String, enum: ["Internal", "External", "Online", "Walk-in", "Referral"], default: "Internal" },
    isProspect:   { type: Boolean, default: false },

    // Subscriptions
    subscriptions: {
      pilotGroupClass:       { type: Boolean, default: false },
      semiPrivateGroupClass: { type: Boolean, default: false },
      newsAndPromos:         { type: Boolean, default: false },
      welcomeEmail:          { type: Boolean, default: false },
      whatsappNotification:  { type: Boolean, default: false },
    },

    // Emergency Contact
    emergencyContact: {
      name:         { type: String, trim: true },
      relationship: { type: String, trim: true },
      phone:        { type: String, trim: true },
      email:        { type: String, trim: true },
    },

    // Relationships
    relatedClientIds: [{ type: String, trim: true }],
    familyMembers: [FamilyMemberSchema],

    // Package / membership summary shown on the Members Overview table
    package:         { type: String, trim: true, default: "" },
    sessionType:      { type: String, trim: true, default: "" },
    totalClasses:     { type: Number, default: 0 },
    serviceName:      { type: String, trim: true, default: "" },
    remainingClasses: { type: Number, default: 0 },
    packageExpiry:    { type: String, trim: true, default: "Unlimited" },

    status: { type: String, enum: ["active", "inactive"], default: "active" },

    // Who created/last touched this record (from req.userId via the auth middleware)
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

MemberSchema.index({ firstName: "text", lastName: "text", email: "text", clientId: "text" });

module.exports = mongoose.model("Member", MemberSchema);
