const express = require("express");
const router = express.Router();
const questionController = require("../controllers/question");

router.get("/", questionController.getQuestions);
router.get("/:id", questionController.getQuestion);
router.post("/", questionController.createQuestion);
router.patch("/:id", questionController.updateQuestion);
router.delete("/:id", questionController.deleteQuestion);

// questionItem
router.get("/item/:id", questionController.getQuestionItems);
router.get("/item/one/:id", questionController.getQuestionItem);
router.post("/item", questionController.createQuestionItem);
router.patch("/item/:id", questionController.updateQuestionItem);
router.delete("/item/:id", questionController.deleteQuestionItem);
router.post("/item/verify", questionController.checkAnswer);
router.get(
  "/item/getScore/byQuestionId/:questionId/byUserId/:userId",
  questionController.getScoreByQuestionId
);

module.exports = router;
