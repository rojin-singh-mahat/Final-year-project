const jwt = require("jsonwebtoken");

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Not authorized" });
  }
  next();
};

module.exports = adminMiddleware;
