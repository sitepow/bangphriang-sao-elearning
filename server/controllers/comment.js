const { Comment, User } = require("../models");

exports.getComments = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await Comment.findAll({
      include: [
        {
          model: User,
          as: "postedBy",
          attributes: ["name", "email", "imagePath"],
        },
        {
          model: User,
          as: "repliedBy",
          attributes: ["name", "email", "imagePath"],
        },
      ],
      where: { contentId: id },
    });
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.createComment = async (req, res) => {
  try {
    await Comment.create(req.body);
    res.status(200).end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.deleteComment = async (req, res) => {
  const { id } = req.params;

  try {
    await Comment.destroy({ where: { id: id } });
    res.status(200).end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.adminReplyComment = async (req, res) => {
  const { id } = req.params;

  try {
    await Comment.update({ ...req.body }, { where: { id: id } });
    res.status(200).end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.adminClearReplyComment = async (req, res) => {
  const { id } = req.params;

  const resetForm = {
    replyByAdminId: null,
    replyMessage: null,
  };

  try {
    await Comment.update({ ...resetForm }, { where: { id: id } });
    res.status(200).end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};
