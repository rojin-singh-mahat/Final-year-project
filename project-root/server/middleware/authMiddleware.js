const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  console.log("Headers:", req.headers); 
  if (!authHeader) return res.status(401).json({ msg: "No token, auth denied" });

  const parts = authHeader.trim().split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer")
    return res.status(401).json({ msg: "Invalid token format" });

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token invalid" });
  }
}

module.exports = authMiddleware;
