const { MainCategory, SubCategory } = require("../models");

exports.getSubcategories = async (req, res) => {
  try {
    const data = await SubCategory.findAll({
      attributes: ["id", "title", "mainCategoryId"],
    });
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.getSubcategoryByMaincategoryId = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await SubCategory.findAll({
      where: { mainCategoryId: id },
      attributes: ["id", "title"],
    });
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.getSubcategory = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await SubCategory.findOne({
      where: { id: id },
      attributes: ["id", "title"],
    });
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.createSubcategory = async (req, res) => {
  delete req.body.id;
  delete req.body.createdAt;
  delete req.body.updatedAt;

  try {
    await SubCategory.create({
      ...req.body,
    });
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.updateSubcategory = async (req, res) => {
  const { id } = req.params;
  try {
    await SubCategory.update(
      {
        ...req.body,
      },
      { where: { id: id } }
    );
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.deleteSubcategory = async (req, res) => {
  const { id } = req.params;

  try {
    await SubCategory.destroy({ where: { id: id } });
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.getMaincategories = async (req, res) => {
  try {
    const perPage = req.query.perPage ? parseInt(req.query.perPage, 10) : 10;
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const offset = perPage ? (page - 1) * perPage : 0;

    const queryOptions = {
      include: [
        {
          model: SubCategory,
          as: "subCategories",
          attributes: ["id", "title"],
        },
      ],
      order: [["createdAt", "DESC"]],
    };

    if (perPage) {
      queryOptions.limit = perPage;
      queryOptions.offset = offset;
    }

    const { count: totalItems, rows: categories } =
      await MainCategory.findAndCountAll(queryOptions);

    const allPages = perPage ? Math.ceil(totalItems / perPage) : 1;

    res.json({
      data: categories,
      perPage: perPage || totalItems,
      allPages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getMaincategoriesNoPagi = async (req, res) => {
  try {
    const data = await MainCategory.findAll({
      attributes: ["id", "title"],
      include: [
        {
          model: SubCategory,
          as: "subCategories",
          attributes: ["id", "title"],
        },
      ],
    });
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.getMaincategory = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await MainCategory.findOne({
      where: { id: id },
      attributes: ["id", "title"],
    });
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.createMaincategory = async (req, res) => {
  delete req.body.id;
  delete req.body.createdAt;
  delete req.body.updatedAt;

  try {
    await MainCategory.create({
      ...req.body,
    });
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.updateMaincategory = async (req, res) => {
  const { id } = req.params;
  try {
    await MainCategory.update(
      {
        ...req.body,
      },
      { where: { id: id } }
    );
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.deleteMaincategory = async (req, res) => {
  const { id } = req.params;

  try {
    await MainCategory.destroy({ where: { id: id } });
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};
