const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const OrderItem = sequelize.define("OrderItem", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  orderItemId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  contentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = OrderItem;
