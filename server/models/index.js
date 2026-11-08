const sequelize = require("../db");
const User = require("./user");
const MainCategory = require("./mainCategory");
const SubCategory = require("./subCategory");
const Content = require("./content");
const ContentVideo = require("./contentVideo");
const ContentLog = require("./contentLog");
const Question = require("./question");
const QuestionItem = require("./questionItem");
const QuestionLog = require("./questionLog");
const Course = require("./course");
const CourseItem = require("./courseItem");
const CourseLog = require("./courseLog");
const Comment = require("./comment");
const Order = require("./order");
const OrderItem = require("./orderItem");

ContentLog.belongsTo(Course, {
  foreignKey: "lessionId",
  as: "lessions",
});

QuestionLog.belongsTo(QuestionItem, {
  foreignKey: "questionContentId",
  as: "questionItems",
});

OrderItem.belongsTo(Order, {
  foreignKey: "orderItemId",
  as: "orders",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Order.belongsTo(Course, {
  foreignKey: "courseId",
  as: "lessions",
  onDelete: "SET NULL",
  onUpdate: "SET NULL",
});

Comment.belongsTo(User, {
  foreignKey: "postByUserId",
  as: "postedBy",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Comment.belongsTo(User, {
  foreignKey: "replyByAdminId",
  as: "repliedBy",
  onDelete: "SET NULL",
  onUpdate: "SET NULL",
});

Content.belongsTo(Question, {
  foreignKey: "questionId",
  as: "questions",
  onDelete: "SET NULL",
  onUpdate: "SET NULL",
});

Content.belongsTo(User, {
  foreignKey: "postByUserId",
  as: "users",
  onDelete: "SET NULL",
  onUpdate: "SET NULL",
});

ContentVideo.belongsTo(Content, {
  foreignKey: "contentId",
  as: "contents",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Content.belongsTo(MainCategory, {
  foreignKey: "mainCategoryId",
  as: "mainCategories",
  onDelete: "SET NULL",
  onUpdate: "SET NULL",
});

Content.belongsTo(SubCategory, {
  foreignKey: "subCategoryId",
  as: "subCategories",
  onDelete: "SET NULL",
  onUpdate: "SET NULL",
});

Question.belongsTo(User, {
  foreignKey: "postByUserId",
  as: "users",
  onDelete: "SET NULL",
  onUpdate: "SET NULL",
});

ContentLog.belongsTo(User, {
  foreignKey: "userId",
  as: "users",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

ContentLog.belongsTo(Content, {
  foreignKey: "contentId",
  as: "contents",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Course.belongsTo(User, {
  foreignKey: "postByUserId",
  as: "users",
  onDelete: "SET NULL",
  onUpdate: "SET NULL",
});

CourseLog.belongsTo(Course, {
  foreignKey: "lessionId",
  as: "lessions",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

CourseLog.belongsTo(User, {
  foreignKey: "userId",
  as: "users",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

CourseItem.belongsTo(Content, {
  foreignKey: "contentId",
  as: "contents",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

MainCategory.hasMany(SubCategory, {
  foreignKey: "mainCategoryId",
  as: "subCategories",
});

SubCategory.belongsTo(MainCategory, {
  foreignKey: "mainCategoryId",
  as: "mainCategories",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

QuestionItem.belongsTo(Question, {
  foreignKey: "questionId",
  as: "questions",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

QuestionLog.belongsTo(Question, {
  foreignKey: "questionId",
  as: "questions",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

QuestionLog.belongsTo(CourseLog, {
  foreignKey: "courseLogId",
  as: "courseLogs",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

ContentLog.belongsTo(CourseLog, {
  foreignKey: "courseLogId",
  as: "courseLogs",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

const db = {
  sequelize,
  Sequelize: sequelize,
  User,
  Content,
  ContentVideo,
  ContentLog,
  MainCategory,
  SubCategory,
  Question,
  QuestionItem,
  QuestionLog,
  Course,
  CourseItem,
  CourseLog,
  Comment,
  Order,
  OrderItem,
};

module.exports = db;
