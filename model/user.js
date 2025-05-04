const { DataTypes } = require("sequelize");
const sequelize = require("../config/index");

const User = sequelize.define("User", {
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  password: DataTypes.STRING,
  role: DataTypes.ENUM("customer", "admin"),
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  otp: DataTypes.STRING,
});

module.exports = User;
