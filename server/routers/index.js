const express = require("express");
const router = express.Router();
const sequelize = require("../db");

require("../models/user");
require("../models/content");
require("../models/contentVideo");
require("../models/contentLog");
require("../models/mainCategory");
require("../models/subCategory");
require("../models/question");
require("../models/questionItem");
require("../models/questionLog");
require("../models/course");
require("../models/courseItem");
require("../models/courseLog");
require("../models/comment");
require("../models/order");
require("../models/orderItem");

const authRoutes = require("./auth");
const userRoutes = require("./user");
const categoryRoutes = require("./category");
const contentRoutes = require("./content");
const courseRoutes = require("./course");
const questionRoutes = require("./question");
const commentRoutes = require("./comment");
const orderRoutes = require("./order");

router.get("/v1/sync", (req, res) => {
  sequelize
    .sync({ alter: true })
    .then(() => {
      res.end();
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: error });
    });
});

router.use("/v1/auth", authRoutes);
router.use("/v1/user", userRoutes);
router.use("/v1/category", categoryRoutes);
router.use("/v1/content", contentRoutes);
router.use("/v1/course", courseRoutes);
router.use("/v1/question", questionRoutes);
router.use("/v1/comment", commentRoutes);
router.use("/v1/order", orderRoutes);

module.exports = router;
