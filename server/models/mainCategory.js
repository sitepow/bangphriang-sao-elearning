const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const MainCategory = sequelize.define("MainCategory", {
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
});

module.exports = MainCategory;
