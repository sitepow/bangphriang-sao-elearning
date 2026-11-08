const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: "pending",
  },
});

module.exports = Order;
