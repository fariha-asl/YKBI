const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Package = sequelize.define("Package", {
  name: { type: DataTypes.STRING, allowNull: false },
  type: {
    type: DataTypes.ENUM("Classes", "Appointments", "Packages", "Memberships"),
    defaultValue: "Classes",
  },
  category: { type: DataTypes.STRING, defaultValue: "" },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  sessions: { type: DataTypes.INTEGER, defaultValue: 0 },
  active: { type: DataTypes.BOOLEAN, defaultValue: true },
  sellOnline: { type: DataTypes.BOOLEAN, defaultValue: false },

  duration: { type: DataTypes.STRING, defaultValue: "12" },
  durationUnit: { type: DataTypes.STRING, defaultValue: "Months" },
  trigger: { type: DataTypes.STRING, defaultValue: "From date of sale" },
  sessionFreq: { type: DataTypes.STRING, defaultValue: "Single Session" },
  introOffer: { type: DataTypes.STRING, defaultValue: "No" },
  contractRequired: { type: DataTypes.STRING, defaultValue: "No" },
  revenueCategory: { type: DataTypes.STRING, defaultValue: "Sales: Services" },
  frequencyOfUse: { type: DataTypes.STRING, defaultValue: "Unrestricted" },
  membershipLink: { type: DataTypes.STRING, defaultValue: "None" },
  advancedSettings: { type: DataTypes.STRING, defaultValue: "Standard" },
});

module.exports = Package;
