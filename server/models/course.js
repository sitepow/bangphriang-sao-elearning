const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Course = sequelize.define("Course", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(355),
    allowNull: true,
  },
  countView: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  description: {
    type: DataTypes.STRING(655),
    allowNull: true,
  },
  avgPass: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  isFree: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  imagePath: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: "activate",
  },
  postByUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = Course;
