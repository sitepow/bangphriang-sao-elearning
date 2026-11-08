const {
  Content,
  MainCategory,
  SubCategory,
  User,
  Question,
  ContentLog,
  ContentVideo,
} = require("../models");

const fs = require("fs");
const path = require("path");
const { ensureDirectoryExists } = require("../middlewares/multerConfig");
const { where } = require("sequelize");
const { Sequelize } = require("sequelize");

const { Op } = require("sequelize");

exports.getRelatedContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { contentId } = req.query;

    const data = await Content.findAll({
      include: [
        {
          model: User,
          as: "users",
          attributes: ["name", "imagePath"],
        },
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
        "countView",
        "timeSpend",
        "postByUserId",
        "createdAt",
      ],
      where: {
        mainCategoryId: id,
        id: { [Op.ne]: contentId },
      },
      limit: 4,
      order: Sequelize.literal("RAND()"),
    });

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.getContentsByMaincategory = async (req, res) => {
  try {
    const { id } = req.params;
    const perPage = req.query.perPage ? parseInt(req.query.perPage, 10) : 8;
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const offset = perPage ? (page - 1) * perPage : 0;

    const queryOptions = {
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
        "countView",
        "mainCategoryId",
        "subCategoryId",
        "timeSpend",
        "postByUserId",
        "createdAt",
      ],
      where: { mainCategoryId: id },
      order: [["createdAt", "DESC"]],
    };

    if (perPage) {
      queryOptions.limit = perPage;
      queryOptions.offset = offset;
    }

    const { count: totalItems, rows: categories } =
      await Content.findAndCountAll(queryOptions);

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

exports.getContentsAll = async (req, res) => {
  try {
    const perPage = req.query.perPage ? parseInt(req.query.perPage, 10) : 8;
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const offset = perPage ? (page - 1) * perPage : 0;

    const queryOptions = {
      include: [
        {
          model: User,
          as: "users",
          attributes: ["name", "imagePath"],
        },
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
        "countView",
        "timeSpend",
        "postByUserId",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
      where: { isCourse: false },
    };

    if (perPage) {
      queryOptions.limit = perPage;
      queryOptions.offset = offset;
    }

    const { count: totalItems, rows: categories } =
      await Content.findAndCountAll(queryOptions);

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

exports.getContentsBySubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const perPage = req.query.perPage ? parseInt(req.query.perPage, 10) : 8;
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const offset = perPage ? (page - 1) * perPage : 0;

    const queryOptions = {
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
        "countView",
        "timeSpend",
        "postByUserId",
        "createdAt",
      ],
      where: { subCategoryId: id },
      order: [["createdAt", "DESC"]],
    };

    if (perPage) {
      queryOptions.limit = perPage;
      queryOptions.offset = offset;
    }

    const { count: totalItems, rows: categories } =
      await Content.findAndCountAll(queryOptions);

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

exports.getContents = async (req, res) => {
  try {
    const perPage = req.query.perPage ? parseInt(req.query.perPage, 10) : 10;
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const offset = perPage ? (page - 1) * perPage : 0;
    const isMostViewer = req.query.isMostViewer === "true";

    const queryOptions = {
      include: [
        { model: Question, as: "questions", attributes: ["description"] },
        {
          model: MainCategory,
          as: "mainCategories",
          attributes: ["id", "title"],
        },
        {
          model: SubCategory,
          as: "subCategories",
          attributes: ["id", "title"],
        },
        { model: User, as: "users", attributes: ["name", "imagePath"] },
      ],
      order: [["createdAt", "DESC"]],
    };

    if (isMostViewer) {
      queryOptions.order = [["countView", "DESC"]];
      (queryOptions.where = { isCourse: 0 }), (queryOptions.limit = 8);
    } else {
      if (perPage) {
        queryOptions.limit = perPage;
        queryOptions.offset = offset;
      }
    }

    const { count: totalItems, rows: categories } =
      await Content.findAndCountAll(queryOptions);

    const allPages = perPage ? Math.ceil(totalItems / perPage) : 1;

    res.json({
      data: categories,
      perPage: isMostViewer ? 8 : perPage || totalItems,
      allPages,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.getContentsDropdown = async (req, res) => {
  try {
    const data = await Content.findAll({
      attributes: ["id", "title", "imagePath", "questionId"],
    });
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.getContent = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Content.findOne({
      where: { id: id },
      include: [
        {
          model: User,
          as: "users",
          attributes: ["name", "email", "imagePath", "shortDescription"],
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
    });
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.createContent = async (req, res) => {
  delete req.body.id;
  delete req.body.createdAt;
  delete req.body.updatedAt;

  const imagePath = req.files.imagePathFile
    ? req.files.imagePathFile[0].filename
    : null;
  const videoPath = req.files.videoPathFile
    ? req.files.videoPathFile[0].filename
    : null;

  if (imagePath) {
    req.body.imagePath = imagePath;
  }

  if (videoPath) {
    req.body.videoPath = videoPath;
  }

  try {
    await Content.create({
      ...req.body,
      questionId: req.body.questionId ? req.body.questionId : null,
      mainCategoryId: req.body.mainCategoryId ? req.body.mainCategoryId : null,
      subCategoryId: req.body.subCategoryId ? req.body.subCategoryId : null,
    });
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.updateContent = async (req, res) => {
  const { id } = req.params;
  const { imagePath, videoPath } = req.body;

  const imagePathFile = req.files.imagePathFile
    ? req.files.imagePathFile[0].filename
    : null;
  const videoPathFile = req.files.videoPathFile
    ? req.files.videoPathFile[0].filename
    : null;

  try {
    if (imagePathFile) {
      if (imagePath) {
        await fs.unlink(
          path.join(__dirname, "..", `/uploads/images/${imagePath}`),
          () => {}
        );
      }

      req.body.imagePath = imagePathFile;
    }

    if (videoPathFile) {
      if (videoPath) {
        await fs.unlink(
          path.join(__dirname, "..", `/uploads/videos/${videoPath}`),
          () => {}
        );
      }

      req.body.videoPath = videoPathFile;
    }

    await Content.update(
      {
        ...req.body,
        questionId: req.body.questionId ? req.body.questionId : null,
        mainCategoryId: req.body.mainCategoryId
          ? req.body.mainCategoryId
          : null,
        subCategoryId: req.body.subCategoryId ? req.body.subCategoryId : null,
      },
      { where: { id: id } }
    );
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.deleteContent = async (req, res) => {
  const { id } = req.params;
  ensureDirectoryExists("uploads/images");
  ensureDirectoryExists("uploads/videos");

  try {
    const data = await Content.findByPk(id);
    const videos = await ContentVideo.findAll({ where: { contentId: id } });

    if (data.imagePath) {
      await fs.unlink(
        path.join(__dirname, "..", `/uploads/images/${data.imagePath}`),
        () => {}
      );
    }

    if (data.videoPath) {
      await fs.unlink(
        path.join(__dirname, "..", `/uploads/videos/${data.videoPath}`),
        () => {}
      );
    }

    if (videos?.length > 0) {
      videos?.map(async (item) => {
        await fs.unlink(
          path.join(__dirname, "..", `/uploads/videos/${item.videoPath}`),
          () => {}
        );
      });
    }

    await Content.destroy({ where: { id: id } });
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.getContentsByUserIdAndContentId = async (req, res) => {
  const { userId, contentId, courseId, courseLogId } = req.params;

  try {
    const query = {
      contentId: contentId,
      userId: userId,
      courseLogId: courseLogId,
    };

    if (courseId !== "-") {
      query.lessionId = courseId;
    }

    const data = await ContentLog.findOne({ where: query });

    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: "No data found." });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the data." });
  }
};

exports.getContentLogsByCourseId = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await ContentLog.findAll({
      attributes: ["questionStatus", "userId", "status", "contentId"],
      where: { courseLogId: id },
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the data." });
  }
};

exports.getContentLogsByContentId = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await ContentLog.findAll({
      include: {
        model: User,
        as: "users",
        attributes: ["name", "imagePath"],
      },
      where: { contentId: id },
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the data." });
  }
};

exports.getContentLogsByStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.query;

  try {
    const data = await ContentLog.findAll({
      include: {
        model: Content,
        as: "contents",
      },
      where: { userId: id, status: status },
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the data." });
  }
};

exports.getContentLogs = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await ContentLog.findAll({ where: { lessionId: id } });
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.createContentLog = async (req, res) => {
  try {
    await ContentLog.create({ ...req.body });
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.createContentLogAutoSubscribe = async (req, res) => {
  const { userId, contentIds, isRetry, lessionId, courseLogId } = req.body;

  try {
    const contentLogs = await ContentLog.findAll({
      where: { lessionId: lessionId, userId: userId },
      order: [["createdAt", "DESC"]],
    });

    if (userId && contentIds?.length > 0 && lessionId) {
      await Promise.all(
        contentIds?.map(async (item) => {
          const videoStatus = contentLogs?.find(
            (logItem) => logItem?.contentId == item
          )?.videoStatus;

          await ContentLog.create({
            courseLogId,
            userId,
            videoStatus: isRetry ? JSON.parse(videoStatus) : [],
            questionStatus: isRetry ? "afterLearning" : "beforeLearning",
            lessionId,
            contentId: item,
          });
        })
      );
    }

    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.updateContentLog = async (req, res) => {
  const { id } = req.params;

  try {
    await ContentLog.update({ ...req.body }, { where: { id: id } });
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.getContentVideos = async (req, res) => {
  try {
    const data = await ContentVideo.findAll();
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.getOrderContentVideo = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await ContentVideo.findOne({
      where: { id: id },
    });
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.getContentVideo = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await ContentVideo.findAll({
      where: { contentId: id },
      order: [["index", "ASC"]],
    });
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.increaseViewCount = async (req, res) => {
  const { id } = req.params;

  try {
    await Content.increment("countView", { by: 1, where: { id } });
    res.status(200).end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.createContentVideo = async (req, res) => {
  const videoPath = req.file ? req.file.filename : null;

  if (videoPath) {
    req.body.videoPath = videoPath;
  }

  try {
    await ContentVideo.create({ ...req.body });
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.updateOrderContentVideo = async (req, res) => {
  const { id } = req.params;

  try {
    await ContentVideo.update({ ...req.body }, { where: { id: id } });
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.deleteContentVideo = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await ContentVideo.findByPk(id);
    if (data.videoPath) {
      await fs.unlink(
        path.join(__dirname, "..", `/uploads/videos/${data.videoPath}`),
        () => {}
      );
    }

    await ContentVideo.destroy({ where: { id: id } });
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};
