const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Comment = sequelize.define("Comment", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  contentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  postByUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  postMessage: {
    type: DataTypes.STRING(355),
    allowNull: true,
  },
  replyByAdminId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  replyMessage: {
    type: DataTypes.STRING(355),
    allowNull: true,
  },
});

module.exports = Comment;
