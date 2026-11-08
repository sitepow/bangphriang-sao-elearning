const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const SubCategory = sequelize.define("SubCategory", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  mainCategoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = SubCategory;
