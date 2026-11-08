const fs = require("fs");
const path = require("path");
const {
  CourseLog,
  CourseItem,
  Content,
  Course,
  User,
  ContentLog,
  QuestionLog,
  Question,
  MainCategory,
  SubCategory,
} = require("../models");
const { Op, where } = require("sequelize");
const { ensureDirectoryExists } = require("../middlewares/multerConfig");

exports.getCourses = async (req, res) => {
  try {
    const perPage = req.query.perPage ? parseInt(req.query.perPage, 10) : 10;
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const offset = perPage ? (page - 1) * perPage : 0;
    const isMostViewer = req.query.isMostViewer === "true";
    const isActive = req.query.isActive === "true";
    const isNotPagi = req.query.isNotPagi === "true";
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    const queryOptions = {
      include: {
        model: User,
        as: "users",
        attributes: ["name", "imagePath"],
      },
      order: [["createdAt", "DESC"]],
    };

    if (isActive) {
      queryOptions.where = {
        status: "activate",
      };
    }

    if (req.query.isActive == "disactivate") {
      queryOptions.where = {
        status: "disactivate",
      };
    }

    if (startDate && endDate) {
      queryOptions.where = {
        ...queryOptions.where,
        createdAt: {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        },
      };
    }

    if (isMostViewer) {
      queryOptions.order = [["countView", "DESC"]];
      queryOptions.limit = 8;
    } else {
      if (perPage && !isNotPagi) {
        queryOptions.limit = perPage;
        queryOptions.offset = offset;
      }
    }

    const { count: totalItems, rows: categories } =
      await Course.findAndCountAll(queryOptions);

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

exports.countCourse = async (req, res) => {
  try {
    const data = await Course.count();
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.getCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Course.findOne({
      where: { id: id },
      include: {
        model: User,
        as: "users",
        attributes: ["name", "email", "imagePath", "shortDescription"],
      },
      order: [["createdAt", "DESC"]],
    });
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.createCourse = async (req, res) => {
  delete req.body.id;
  delete req.body.createdAt;
  delete req.body.updatedAt;

  const imagePath = req.file ? req.file.path : null;

  if (imagePath) {
    req.body.imagePath = imagePath;
  }

  try {
    await Course.create({ ...req.body });
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.updateCourse = async (req, res) => {
  delete req.body.id;
  delete req.body.createdAt;
  delete req.body.updatedAt;

  const { id } = req.params;
  const { imagePath } = req.body;
  const imagePathFile = req.file ? req.file.path : null;

  if (imagePathFile) {
    if (imagePath) {
      await fs.unlink(
        path.join(__dirname, "..", `/uploads/images/${imagePath}`),
        () => {}
      );
    }

    req.body.imagePath = imagePathFile;
  }

  try {
    await Course.update({ ...req.body }, { where: { id: id } });
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.deleteCourse = async (req, res) => {
  const { id } = req.params;
  ensureDirectoryExists("uploads/images");

  try {
    const data = await Course.findByPk(id);
    if (data.imagePath) {
      await fs.unlink(
        path.join(__dirname, "..", `/uploads/images/${data.imagePath}`),
        () => {}
      );
    }

    await Course.destroy({ where: { id: id } });
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.getCourseItemsByCourseId = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await CourseLog.findAll({
      include: {
        model: User,
        as: "users",
        attributes: ["name", "imagePath"],
      },
      where: { lessionId: id },
      order: [["createdAt", "DESC"]],
    });
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.getCourseLogsByStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;
    const perPage = req.query.perPage ? parseInt(req.query.perPage, 10) : 6;
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const offset = perPage ? (page - 1) * perPage : 0;

    const queryOptions = {
      include: {
        model: Course,
        as: "lessions",
        include: {
          model: User,
          as: "users",
          attributes: ["name", "imagePath"],
        },
      },
      where: { userId: id, status: status },
    };

    if (perPage) {
      queryOptions.limit = perPage;
      queryOptions.offset = offset;
    }

    const { count: totalItems, rows: categories } =
      await CourseLog.findAndCountAll(queryOptions);

    const allPages = perPage ? Math.ceil(totalItems / perPage) : 1;

    res.json({
      data: categories,
      perPage,
      allPages,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.getCourseDropdown = async (req, res) => {
  try {
    const data = await Course.findAll({
      attributes: ["title", "id"],
    });
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.getCourseLogsReport = async (req, res) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const courseId = req.query.courseId;
    const status = req.query.status;

    const queryOptions = {
      attributes: ["status", "isSendCertification", "createdAt", "id"],
      include: [
        { model: User, as: "users", attributes: ["name", "email", "id"] },
        { model: Course, as: "lessions", attributes: ["title"] },
      ],
      order: [
        ["status", "ASC"],
        ["createdAt", "DESC"],
      ],
      where: { lessionId: courseId },
    };

    if (
      status &&
      status !== "all" &&
      (status == "pass" || status == "notpass")
    ) {
      queryOptions.where = {
        ...queryOptions.where,
        status: status == "pass" ? "complete" : "unComplete",
      };
    }

    if (startDate && endDate) {
      queryOptions.where = {
        ...queryOptions.where,
        createdAt: {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        },
      };
    }

    const data = await CourseLog.findAll(queryOptions);

    const newData = await Promise.all(
      data.map(async (item) => {
        const questionLog = await QuestionLog.findAll({
          where: {
            courseLogId: item.id,
          },
        });

        if (!questionLog && questionLog?.length == 0) return;

        const questionHead = await Question.findByPk(
          questionLog[0].questionId,
          {
            attributes: ["scorePerChoice"],
          }
        );

        const beforeLearningScore = questionLog
          .filter((item) => item.questionStatus === "beforeLearning")
          .reduce((totalScore, item) => {
            return (
              totalScore + (item.isCorrect ? questionHead.scorePerChoice : 0)
            );
          }, 0);

        const afterLearningScore = questionLog
          .filter((item) => item.questionStatus === "afterLearning")
          .reduce((totalScore, item) => {
            return (
              totalScore + (item.isCorrect ? questionHead.scorePerChoice : 0)
            );
          }, 0);

        return {
          ...item.toJSON(),
          beforeLearningScore,
          afterLearningScore,
        };
      })
    );

    res.json(newData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.getCourseLogsCertification = async (req, res) => {
  try {
    const perPage = req.query.perPage ? parseInt(req.query.perPage, 10) : 10;
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const offset = perPage ? (page - 1) * perPage : 0;

    const queryOptions = {
      attributes: ["status", "isSendCertification", "createdAt", "id"],
      include: [
        {
          model: User,
          as: "users",
          attributes: ["name", "email", "imagePath"],
        },
        { model: Course, as: "lessions", attributes: ["title", "imagePath"] },
      ],
      order: [
        ["status", "ASC"],
        ["createdAt", "DESC"],
      ],
    };

    if (perPage) {
      queryOptions.limit = perPage;
      queryOptions.offset = offset;
    }

    const { count: totalItems, rows: categories } =
      await CourseLog.findAndCountAll(queryOptions);

    const allPages = perPage ? Math.ceil(totalItems / perPage) : 1;

    res.json({
      data: categories,
      perPage,
      allPages,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.getCourseLogs = async (req, res) => {
  try {
    const data = await CourseLog.findAll();
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.createCourseLog = async (req, res) => {
  try {
    const data = await CourseLog.create({ ...req.body });

    res.json({ id: data.id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.increaseViewCount = async (req, res) => {
  const { id } = req.params;

  try {
    await Course.increment("countView", { by: 1, where: { id } });
    res.status(200).end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.updateCourseLogByUserId = async (req, res) => {
  const { courseId, userId } = req.params;

  try {
    await CourseLog.update(
      { ...req.body },
      { where: { lessionId: courseId, userId: userId } }
    );
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.updateCourseLog = async (req, res) => {
  const { id } = req.params;

  try {
    await CourseLog.update({ ...req.body }, { where: { id: id } });
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.checkContentComplete = async (req, res) => {
  const { userId, courseId, courseLogId } = req.body;

  try {
    if (!userId || !courseId || !courseLogId) return res.status(500).end();

    const courseLog = await CourseLog.findOne({
      where: { lessionId: courseId, userId: userId, status: "inProgress" },
    });

    const course = await Course.findOne({
      attributes: ["avgPass"],
      where: { id: courseId },
    });

    if (courseLog && courseLog?.status === "inProgress") {
      const contentCompletes = await ContentLog.findAll({
        where: { lessionId: courseId, courseLogId: courseLogId },
      });

      if (!contentCompletes || contentCompletes?.length == 0)
        return res.status(500).end();

      const checkAllNotProgress = contentCompletes?.find(
        (item) => item.status === "inProgress"
      );

      if (!!checkAllNotProgress) return res.status(500).end();

      const passPercentage = course?.avgPass ?? 80;
      const contentTotal = contentCompletes?.length ?? 0;
      const userCompleteTotal = contentCompletes?.filter(
        (item) => item.status == "complete"
      ).length;

      const userScorePercentage = (userCompleteTotal / contentTotal) * 100;
      const isPass = userScorePercentage >= passPercentage;

      if (!isPass) return res.status(200).json({ status: "notpass" });

      await CourseLog.update(
        { status: "complete" },
        {
          where: {
            lessionId: courseId,
            userId: userId,
            status: "inProgress",
          },
        }
      );

      res.status(200).json({ status: "pass" });
    } else {
      return res.status(500).end();
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.getCourseLogsByCourseId = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await CourseLog.findAll({
      where: { lessionId: id },
      attributes: ["id"],
      include: {
        model: User,
        as: "users",
        attributes: ["id", "name", "imagePath"],
      },
    });
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.getCourseItems = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await CourseItem.findAll({
      where: { lessionId: id },
      include: {
        model: Content,
        as: "contents",
        include: [
          {
            model: User,
            as: "users",
            attributes: ["name", "imagePath"],
          },
          {
            model: MainCategory,
            as: "mainCategories",
            attributes: ["title"],
          },
          {
            model: SubCategory,
            as: "subCategories",
            attributes: ["title"],
          },
        ],
        attributes: [
          "id",
          "title",
          "imagePath",
          "videoPath",
          "timeSpend",
          "countView",
          "description",
          "createdAt",
          "questionId",
        ],
      },
    });
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.createCourseItem = async (req, res) => {
  try {
    await CourseItem.create({ ...req.body });
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.deleteCourseItem = async (req, res) => {
  const { lessionId, contentId } = req.body;

  try {
    await CourseItem.destroy({
      where: { lessionId: lessionId, contentId: contentId },
    });
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};
