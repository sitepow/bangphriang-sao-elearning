const jwt = require("jsonwebtoken");
const { isTokenBlacklisted } = require("../helpers");

const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  if (isTokenBlacklisted(token)) {
    return res.status(401).json({ message: "Token has been revoked" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    req.token = token;
    next();
  } catch (err) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

module.exports = { protect };
