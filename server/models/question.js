const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Question = sequelize.define("Question", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  scoreAvgPass: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  scorePerChoice: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  postByUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = Question;
