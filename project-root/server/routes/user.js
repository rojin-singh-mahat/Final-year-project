const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Test token capture
router.get("/test-token", authMiddleware, (req, res) => {
  res.json({
    msg: "Token received!",
    userPayload: req.user, // this should show the decoded token
  });
});

module.exports = router;
