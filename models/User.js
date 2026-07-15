const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const sequelize = require("../config/db");

const User = sequelize.define(
  "User",
  {
    fullName: { type: DataTypes.STRING, allowNull: false },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue("username", value.toLowerCase().trim());
      },
    },
    password: { type: DataTypes.STRING, allowNull: false },
    whatsapp: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM("admin", "trainer", "member"),
      defaultValue: "member",
    },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    lastLogin: { type: DataTypes.DATE },
  },
  {
    defaultScope: {
      attributes: { exclude: ["password"] },
    },
    scopes: {
      withPassword: {},
    },
    hooks: {
      beforeSave: async (user) => {
        if (!user.changed("password")) return;
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      },
    },
  }
);

User.prototype.matchPassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

User.prototype.toSafeObject = function () {
  const obj = this.toJSON();
  delete obj.password;
  return obj;
};

module.exports = User;
