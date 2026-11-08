const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order");

router.get("/byUserId/:userId", orderController.getOrders);
router.get("/byUserId/:userId/byCourseId/:courseId", orderController.getOrder);

module.exports = router;
