const jwt = require("jsonwebtoken");

const adminMiddleware = (req,res)=>{
    if (req.user.role !== "admin") return res.status(403).json({ msg: "Access denied: Admins only "});

    next();
};

module.exports = adminMiddleware;