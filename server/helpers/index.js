const jwt = require("jsonwebtoken");
const blacklist = new Set();

const addToBlacklist = (token) => {
  blacklist.add(token);
};

const isTokenBlacklisted = (token) => {
  return blacklist.has(token);
};

const generateToken = (name, id, email, role, status) => {
  return jwt.sign({ name, id, email, role, status }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

const generateRefreshToken = (name, id, email, role, status) => {
  return jwt.sign(
    { name, id, email, role, status },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

module.exports = {
  addToBlacklist,
  isTokenBlacklisted,
  generateToken,
  generateRefreshToken,
};
