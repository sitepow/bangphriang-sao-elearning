const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const CourseLog = sequelize.define("CourseLog", {
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
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: "inProgress",
  },
  isSendCertification: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: 0,
  },
});

module.exports = CourseLog;
