const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const {
  User,
  Course,
  Content,
  Question,
  QuestionLog,
  Order,
  OrderItem,
  ContentLog,
  QuestionItem,
  CourseLog,
} = require("../models");
const { Op } = require("sequelize");
const { ensureDirectoryExists } = require("../middlewares/multerConfig");
require("dotenv").config();
const stripeSecret = process.env.STRIPE_KEY;
const stripe = require("stripe")(stripeSecret);

exports.checkoutCourse = async (req, res) => {
  const { course, courseId, auth, contentIds } = req.body;

  const product = {
    name: course?.title,
    price: Math.round(course?.price * 100),
    currency: "thb",
  };

  try {
    const isExistOrder = await Order.findOne({
      where: { courseId: courseId, userId: auth?.id },
    });

    if (!isExistOrder) {
      const data = await Order.create({
        userId: auth?.id,
        courseId,
        price: course?.price,
      });

      await Promise.all(
        contentIds?.map(async (item) => {
          await OrderItem.create({
            orderItemId: data?.id,
            userId: auth?.id,
            contentId: item,
          });
        })
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: product.currency,
            product_data: {
              name: product.name,
            },
            unit_amount: product.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/course/${courseId}`,
      cancel_url: `${process.env.FRONTEND_URL}/course/${courseId}`,
      metadata: {
        courseId: courseId,
        userId: auth?.id,
        contentIds: JSON.stringify(contentIds),
        price: course?.price,
      },
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.getImages = async (req, res) => {
  ensureDirectoryExists("uploads/media");

  const directoryPath = path.join(__dirname, "../uploads/media");

  try {
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Unable to scan files", error: err });
      }

      const allowedFileTypes = /jpeg|jpg|png|gif/;
      const imageFiles = files.filter((file) =>
        allowedFileTypes.test(path.extname(file).toLowerCase())
      );

      const page = req.query.page ? parseInt(req.query.page) : 1;
      const perPage = req.query.perPage ? parseInt(req.query.perPage) : 4;
      const totalItems = imageFiles.length;
      const allPages = Math.ceil(totalItems / perPage);
      const offset = (page - 1) * perPage;

      const paginatedImages = imageFiles.slice(offset, offset + perPage);

      res.status(200).json({
        images: paginatedImages,
        page,
        perPage,
        totalItems,
        allPages,
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    res.status(200).end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.deleteImage = async (req, res) => {
  const directoryPath = path.join(
    __dirname,
    "../uploads/media",
    req.params.filename
  );

  try {
    fs.unlink(directoryPath, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "File deletion failed", error: err });
      }
      res.status(200).end();
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const perPage = req.query.perPage ? parseInt(req.query.perPage, 10) : 10;
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const offset = perPage ? (page - 1) * perPage : 0;
    const isNotPagi = req.query.isNotPagi === "true";
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const name = req.query.name;

    const queryOptions = {
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
      where: {},
    };

    if (name) {
      queryOptions.where.name = { [Op.like]: `%${name}%` };
    }

    if (startDate && endDate) {
      queryOptions.where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    if (perPage && !isNotPagi) {
      queryOptions.limit = perPage;
      queryOptions.offset = offset;
    }

    const { count: totalItems, rows: categories } = await User.findAndCountAll(
      queryOptions
    );

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

exports.getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await User.findOne({
      where: { id: id },
      attributes: { exclude: ["password"] },
    });
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.createUser = async (req, res) => {
  delete req.body.id;
  delete req.body.createdAt;
  delete req.body.updatedAt;

  const imagePath = req.file ? req.file.path : null;

  if (imagePath) {
    req.body.imagePath = imagePath;
  }

  try {
    const data = await User.findOne({ where: { email: req.body.email } });

    if (data) {
      await fs.unlink(
        path.join(__dirname, "..", `/uploads/images/${imagePath}`),
        () => {}
      );
      return res.status(400).end();
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(req.body.password, salt);
    req.body.password = passwordHash;

    await User.create({ ...req.body });
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.updateUser = async (req, res) => {
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
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(req.body.password, salt);
      req.body.password = passwordHash;
    } else {
      delete req.body.password;
    }

    await User.update({ ...req.body }, { where: { id: id } });
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await User.findByPk(id);
    if (data.imagePath) {
      await fs.unlink(
        path.join(__dirname, "..", `/uploads/images/${data.imagePath}`),
        () => {}
      );
    }

    await User.destroy({ where: { id: id } });
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.getContentSummary = async (req, res) => {
  const { userId } = req.params;
  const perPage = req.query.perPage ? parseInt(req.query.perPage, 10) : 10;
  const page = req.query.page ? parseInt(req.query.page, 10) : 1;
  const offset = perPage ? (page - 1) * perPage : 0;
  const isNotPagi = req.query.isNotPagi === "true";

  try {
    const queryOptions = {
      where: { userId: userId },
      include: [
        { model: CourseLog, as: "courseLogs", attributes: ["status"] },
        {
          model: Course,
          as: "lessions",
          attributes: ["title", "imagePath"],
        },
        {
          model: Content,
          as: "contents",
          attributes: ["title", "imagePath"],
        },
      ],
      order: [["createdAt", "DESC"]],
    };

    if (perPage && !isNotPagi) {
      queryOptions.limit = perPage;
      queryOptions.offset = offset;
    }

    const { count: totalItems, rows: data } = await ContentLog.findAndCountAll(
      queryOptions
    );

    const newData = await Promise.all(
      data.map(async (item) => {
        try {
          const ansQuestions = await QuestionLog.findAll({
            attributes: ["questionStatus", "isCorrect", "selectChoice"],
            include: [
              {
                model: Question,
                as: "questions",
                attributes: ["scorePerChoice"],
              },
              {
                model: QuestionItem,
                as: "questionItems",
                attributes: ["question", "correctAns"],
              },
            ],
            where: {
              ansByUserId: item.userId,
              contentId: item.contentId,
              courseLogId: item.courseLogId,
            },
          });

          const beforeLearningScore = ansQuestions
            .filter((q) => q.questionStatus === "beforeLearning")
            .reduce((totalScore, q) => {
              const scorePerChoice = q.questions?.scorePerChoice || 0;
              return totalScore + (q.isCorrect ? scorePerChoice : 0);
            }, 0);

          const afterLearningScore = ansQuestions
            .filter((q) => q.questionStatus === "afterLearning")
            .reduce((totalScore, q) => {
              const scorePerChoice = q.questions?.scorePerChoice || 0;
              return totalScore + (q.isCorrect ? scorePerChoice : 0);
            }, 0);

          return {
            ...item.toJSON(),
            questions: ansQuestions,
            beforeLearningScore,
            afterLearningScore,
          };
        } catch (error) {
          console.log("Error in processing scores:", error);
          return null;
        }
      })
    );

    const filteredData = newData.filter((item) => item !== null);
    const allPages = perPage ? Math.ceil(totalItems / perPage) : 1;

    res.json({
      data: filteredData,
      perPage,
      allPages,
      totalItems,
      currentPage: page,
    });
  } catch (error) {
    console.log("Error in fetching content summary:", error);
    res.status(500).json({
      error: "An error occurred while fetching content summary.",
    });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const userTotal = await User.count();
    const notAdminTotal = await User.count({ where: { role: "user" } });
    const adminTotal = await User.count({
      where: { role: "admin", role: "superAdmin" },
    });
    const userActiveTotal = await User.count({ where: { status: "activate" } });
    const userDeactiveTotal = await User.count({
      where: { status: "deactivate" },
    });
    const courseTotal = await Course.count();
    const courseActiveTotal = await Course.count({
      where: { status: "activate" },
    });
    const courseDeactiveTotal = await Course.count({
      where: { status: "deactivate" },
    });
    const contentTotal = await Content.count();

    res.json({
      userTotal,
      notAdminTotal,
      adminTotal,
      userActiveTotal,
      userDeactiveTotal,
      courseTotal,
      userActiveTotal,
      userDeactiveTotal,
      courseActiveTotal,
      courseDeactiveTotal,
      contentTotal,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.getScore = async (req, res) => {
  const { id } = req.params;

  try {
    const ansQuestions = await QuestionLog.findAll({
      attributes: ["questionStatus", "isCorrect"],
      include: {
        model: Question,
        as: "questions",
        attributes: ["scorePerChoice"],
      },
      where: { ansByUserId: id },
    });

    const beforeLearningScore = ansQuestions
      .filter((item) => item.questionStatus === "beforeLearning")
      .reduce((totalScore, item) => {
        return (
          totalScore + (item.isCorrect ? item.questions.scorePerChoice : 0)
        );
      }, 0);

    const afterLearningScore = ansQuestions
      .filter((item) => item.questionStatus === "afterLearning")
      .reduce((totalScore, item) => {
        return (
          totalScore + (item.isCorrect ? item.questions.scorePerChoice : 0)
        );
      }, 0);

    res.json({ beforeLearningScore, afterLearningScore });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};
