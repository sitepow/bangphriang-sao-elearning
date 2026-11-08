const { QuestionItem, QuestionLog, Question, User } = require("../models");

exports.getQuestions = async (req, res) => {
  try {
    const perPage = req.query.perPage ? parseInt(req.query.perPage, 10) : 10;
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const offset = perPage ? (page - 1) * perPage : 0;

    const queryOptions = {
      include: {
        model: User,
        as: "users",
        attributes: ["name"],
      },
      order: [["createdAt", "DESC"]],
    };

    if (perPage) {
      queryOptions.limit = perPage;
      queryOptions.offset = offset;
    }

    const { count: totalItems, rows: categories } =
      await Question.findAndCountAll(queryOptions);

    const allPages = perPage ? Math.ceil(totalItems / perPage) : 1;

    res.json({
      data: categories,
      perPage: perPage || totalItems,
      allPages,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.getQuestion = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await Question.findOne({ where: { id: id } });
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.createQuestion = async (req, res) => {
  delete req.body.id;
  delete req.body.createdAt;
  delete req.body.updatedAt;

  try {
    await Question.create({ ...req.body });
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.updateQuestion = async (req, res) => {
  const { id } = req.params;

  try {
    await Question.update({ ...req.body }, { where: { id: id } });
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.deleteQuestion = async (req, res) => {
  const { id } = req.params;

  try {
    await Question.destroy({ where: { id: id } });
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.getQuestionItems = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await QuestionItem.findAll({
      where: { questionId: id },
      attributes: { exclude: ["correctAns"] },
    });
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.getQuestionItem = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await QuestionItem.findOne({ where: { id: id } });
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.createQuestionItem = async (req, res) => {
  try {
    await QuestionItem.create({ ...req.body });
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.updateQuestionItem = async (req, res) => {
  const { id } = req.params;

  try {
    await QuestionItem.update({ ...req.body }, { where: { id: id } });
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.deleteQuestionItem = async (req, res) => {
  const { id } = req.params;

  try {
    await QuestionItem.destroy({ where: { id: id } });
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.checkAnswer = async (req, res) => {
  try {
    const {
      questionStatus,
      questionId,
      userId,
      answer,
      courseLogId,
      contentId,
    } = req.body;
    let passPercentage;

    const resultCheckAnswers = [];
    let correctAnswersCount = 0;

    const questionHead = await Question.findOne({
      where: { id: questionId },
    });

    passPercentage = questionHead.scoreAvgPass;

    if (Array.isArray(answer) && answer.length > 0) {
      for (const item of answer) {
        const questionContent = await QuestionItem.findOne({
          where: { id: item.questionContentId },
          attributes: ["correctAns", "questionId"],
        });

        if (questionContent) {
          const newData = {
            courseLogId,
            contentId,
            questionId: questionContent.questionId,
            ansByUserId: userId,
            questionContentId: item.questionContentId,
            selectChoice: item.answer,
            questionStatus: item.questionStatus,
          };

          if (questionContent.correctAns == item.answer) {
            newData.isCorrect = true;
            correctAnswersCount++;
          } else {
            newData.isCorrect = false;
            newData.correctAns = questionContent.correctAns;
          }

          if (questionStatus !== "afterLearning") {
            await QuestionLog.create(newData);
          }

          resultCheckAnswers.push(newData);
        }
      }
    }

    const totalQuestions = answer.length;
    const userScorePercentage = (correctAnswersCount / totalQuestions) * 100;
    const isPass = userScorePercentage >= passPercentage;

    const response = {
      resultCheckAnswers,
      correctAnswersCount,
      totalQuestions,
      userScorePercentage,
      isPass,
    };

    if (questionStatus !== "afterLearning") {
      res.status(200).json(resultCheckAnswers);
    } else {
      if (response.resultCheckAnswers) {
        response.resultCheckAnswers.forEach(async (item) => {
          await QuestionLog.create(item);
        });
      }

      res.status(200).json(response);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.getScoreByQuestionId = async (req, res) => {
  try {
    const { questionId, userId } = req.params;

    const questionHead = await Question.findByPk(questionId, {
      attributes: ["scorePerChoice"],
    });

    const questionLog = await QuestionLog.findAll({
      attributes: ["isCorrect", "questionStatus"],
      where: {
        questionId: questionId,
        ansByUserId: userId,
      },
    });

    const beforeLearningScore = questionLog
      .filter((item) => item.questionStatus === "beforeLearning")
      .reduce((totalScore, item) => {
        return totalScore + (item.isCorrect ? questionHead.scorePerChoice : 0);
      }, 0);

    const afterLearningScore = questionLog
      .filter((item) => item.questionStatus === "afterLearning")
      .reduce((totalScore, item) => {
        return totalScore + (item.isCorrect ? questionHead.scorePerChoice : 0);
      }, 0);

    res.json({ beforeLearningScore, afterLearningScore });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};
