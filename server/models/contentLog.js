const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const ContentLog = sequelize.define("ContentLog", {
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
  questionStatus: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: "beforeLearning",
  },
  videoStatus: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  contentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  courseLogId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: "inProgress",
  },
});

module.exports = ContentLog;
