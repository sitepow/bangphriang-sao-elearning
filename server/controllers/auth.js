const bcrypt = require("bcryptjs");
const {
  addToBlacklist,
  generateToken,
  generateRefreshToken,
} = require("../helpers");
const { User } = require("../models");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

exports.register = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(409).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    req.body.password = passwordHash;

    const user = await User.create({ ...req.body, status: "pending" });

    if (user) {
      const accessToken = generateToken(
        user.name,
        user.id,
        user.email,
        user.role,
        user.status
      );
      const refreshToken = generateRefreshToken(
        user.name,
        user.id,
        user.email,
        user.role,
        user.status
      );

      return res.status(201).json({
        id: user.id,
        email: user.email,
        accessToken,
        refreshToken,
      });
    }
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({
      where: {
        email: email,
        [Op.or]: [{ status: "activate" }, { status: "pending" }],
      },
    });
    const matchPassword = await bcrypt.compare(password, user.password);

    if (!matchPassword) {
      return res.status(409).json({ message: "Password not match" });
    }

    if (user) {
      const accessToken = generateToken(
        user.name,
        user.id,
        user.email,
        user.role,
        user.status
      );
      const refreshToken = generateRefreshToken(
        user.name,
        user.id,
        user.email,
        user.role,
        user.status
      );
      res.json({
        id: user.id,
        email: user.email,
        role: user.role,
        accessToken,
        refreshToken,
      });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error", explain: err });
  }
};

exports.verifyCode = async (req, res) => {
  const { email, verifyCode } = req.body;

  try {
    const user = await User.findOne({ where: { email: email } });

    if (user?.verifyCode !== verifyCode)
      return res.status(200).json({ status: "invalid" });

    await User.update({ status: "activate" }, { where: { email: email } });
    res.status(200).json({ status: "valid" });
  } catch (error) {
    res.status(500).json({ message: "Server error", explain: error });
  }
};

exports.refreshToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = await jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findOne({ where: { email: decoded.email } });
    const accessToken = generateToken(
      user.name,
      user.id,
      user.email,
      user.role,
      user.status
    );
    res.json({ accessToken });
  } catch (err) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

exports.resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    addToBlacklist(req.token);
    user.password = passwordHash;
    await user.save();

    res.status(200).end();
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.addBlacklist = async (req, res) => {
  const { accessToken, refreshToken } = req.body;
  try {
    addToBlacklist(accessToken);
    addToBlacklist(refreshToken);
    res.status(200).end();
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
