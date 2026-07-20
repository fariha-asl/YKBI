const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// This DB stores JSON columns as longtext (MariaDB), so mysql2 hands them
// back as raw strings instead of parsed objects/arrays. These getters parse
// them defensively so every consumer (routes, frontend) always sees real
// objects/arrays, regardless of how the underlying column was created.
function jsonField(key, defaultValue) {
  return {
    type: DataTypes.JSON,
    defaultValue,
    get() {
      const raw = this.getDataValue(key);
      if (typeof raw === "string") {
        try { return JSON.parse(raw); } catch { return defaultValue; }
      }
      return raw == null ? defaultValue : raw;
    },
  };
}

const Member = sequelize.define("Member", {
  // Identity
  isCompany: { type: DataTypes.BOOLEAN, defaultValue: false },
  clientId: { type: DataTypes.STRING, allowNull: false, unique: true },
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  middleName: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  emailOptOut: { type: DataTypes.BOOLEAN, defaultValue: false },
  phoneType: { type: DataTypes.ENUM("mobile", "home"), defaultValue: "mobile" },
  phoneNumber: { type: DataTypes.STRING },

  // Address (nested object, preserved as JSON so the frontend shape is unchanged)
  address: jsonField("address", {
    street: "", city: "", state: "", country: "United States", postalCode: "",
  }),

  // Personal Info
  gender: {
    type: DataTypes.ENUM("Male", "Female", "Other", "Prefer not to say"),
    defaultValue: "Male",
  },
  birthday: { type: DataTypes.DATEONLY },
  referralType: {
    type: DataTypes.ENUM("Internal", "External", "Online", "Walk-in", "Referral"),
    defaultValue: "Internal",
  },
  isProspect: { type: DataTypes.BOOLEAN, defaultValue: false },

  // Subscriptions (nested object -> JSON)
  subscriptions: jsonField("subscriptions", {
    pilotGroupClass: false,
    semiPrivateGroupClass: false,
    newsAndPromos: false,
    welcomeEmail: false,
    whatsappNotification: false,
  }),

  // Emergency Contact (nested object -> JSON)
  emergencyContact: jsonField("emergencyContact", { name: "", relationship: "", phone: "", email: "" }),

  // Relationships (arrays -> JSON)
  relatedClientIds: jsonField("relatedClientIds", []),
  familyMembers: jsonField("familyMembers", []),

  // Package / membership summary
  package: { type: DataTypes.STRING, defaultValue: "" },
  sessionType: { type: DataTypes.STRING, defaultValue: "" },
  totalClasses: { type: DataTypes.INTEGER, defaultValue: 0 },
  serviceName: { type: DataTypes.STRING, defaultValue: "" },
  remainingClasses: { type: DataTypes.INTEGER, defaultValue: 0 },
  packageExpiry: { type: DataTypes.STRING, defaultValue: "Unlimited" },

  status: { type: DataTypes.ENUM("active", "inactive"), defaultValue: "active" },

  // Who created/last touched this record (from req.userId via the auth middleware)
  createdBy: { type: DataTypes.INTEGER },
});

module.exports = Member;
