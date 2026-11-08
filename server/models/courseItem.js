const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const CourseItem = sequelize.define("CourseItem", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  lessionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  contentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = CourseItem;
