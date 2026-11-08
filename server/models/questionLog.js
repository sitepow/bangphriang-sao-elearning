const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const QuestionLog = sequelize.define("QuestionLog", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  questionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  contentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  ansByUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  questionContentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  selectChoice: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isCorrect: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  courseLogId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  questionStatus: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: "beforeLearning",
  },
});

module.exports = QuestionLog;
