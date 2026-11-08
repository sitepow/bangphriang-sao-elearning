const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Content = sequelize.define("Content", {
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
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  imagePath: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  videoPath: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  countView: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  questionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  mainCategoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  subCategoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  htmlContent: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isNotCourse: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: 1,
  },
  isCourse: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: 0,
  },
  isReadOnly: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: 0,
  },
  timeSpend: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  postByUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = Content;
