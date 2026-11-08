const { Order, Course, User } = require("../models");

exports.getOrders = async (req, res) => {
  const { userId } = req.params;

  try {
    const perPage = req.query.perPage ? parseInt(req.query.perPage, 10) : 6;
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const offset = perPage ? (page - 1) * perPage : 0;

    const queryOptions = {
      include: [
        {
          model: Course,
          as: "lessions",
          attributes: ["id", "title", "imagePath", "price", "countView"],
          include: [
            {
              model: User,
              as: "users",
              attributes: ["name", "imagePath"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      attributes: ["status"],
      where: { userId: userId, status: "complete" },
    };

    if (perPage) {
      queryOptions.limit = perPage;
      queryOptions.offset = offset;
    }

    const { count: totalItems, rows: categories } = await Order.findAndCountAll(
      queryOptions
    );

    const allPages = perPage ? Math.ceil(totalItems / perPage) : 1;

    res.json({
      data: categories,
      perPage: perPage || totalItems,
      allPages,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getOrder = async (req, res) => {
  const { userId, courseId } = req.params;

  try {
    const data = await Order.findOne({
      where: { courseId: courseId, userId: userId },
    });
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};
