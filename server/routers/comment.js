const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment");

router.get("/:id", commentController.getComments);
router.post("/", commentController.createComment);
router.delete("/:id", commentController.deleteComment);

// adminReply
router.patch("/:id", commentController.adminReplyComment);
router.patch("/clear/:id", commentController.adminClearReplyComment);

module.exports = router;
