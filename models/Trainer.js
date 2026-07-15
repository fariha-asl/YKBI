const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Trainer = sequelize.define("Trainer", {
  name: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, defaultValue: "" },
  status: { type: DataTypes.STRING, defaultValue: "ACTIVE" },
  email: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, defaultValue: "" },
  emergency: { type: DataTypes.STRING, defaultValue: "—" },
  bio: { type: DataTypes.TEXT, defaultValue: "" },
  tenure: { type: DataTypes.STRING, defaultValue: "0 Yrs" },
  classes: { type: DataTypes.INTEGER, defaultValue: 0 },
  desk: { type: DataTypes.BOOLEAN, defaultValue: false },
  instructor: { type: DataTypes.BOOLEAN, defaultValue: false },
  teacher: { type: DataTypes.BOOLEAN, defaultValue: false },
  avatar: { type: DataTypes.STRING, defaultValue: "" },
  color: { type: DataTypes.STRING, defaultValue: "#8B5CF6" },
  profileImg: { type: DataTypes.TEXT("long"), allowNull: true },
});

module.exports = Trainer;
