const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  verifyCode: {
    type: DataTypes.STRING(35),
    allowNull: true,
  },
  personalId: {
    type: DataTypes.STRING(13),
    allowNull: true,
  },
  shortDescription: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING(65),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(65),
    allowNull: true,
  },
  imagePath: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  role: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: "user",
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: "activate",
  },
});

module.exports = User;
