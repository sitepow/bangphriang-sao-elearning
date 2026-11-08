const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const QuestionItem = sequelize.define("QuestionItem", {
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
  question: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  correctAns: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  choices: {
    type: DataTypes.JSON,
    allowNull: true,
  },
});

module.exports = QuestionItem;
