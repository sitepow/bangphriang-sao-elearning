const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const ContentVideo = sequelize.define("ContentVideo", {
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
  index: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  videoPath: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
});

module.exports = ContentVideo;
