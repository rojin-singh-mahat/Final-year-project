const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const User = require("../models/user");

// Test token capture
router.get("/test-token", authMiddleware, (req, res) => {
  res.json({
    msg: "Token received!",
    userPayload: req.user, // this should show the decoded token
  });
});

// Leaderboard (visible to authenticated users)
router.get("/leaderboard", authMiddleware, async (req, res) => {
  try {
    const sortBy = req.query.sortBy === "streak" ? "streak" : "xp";
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);

    const sort = sortBy === "streak"
      ? { streak: -1, points: -1, name: 1 }
      : { points: -1, streak: -1, name: 1 };

    const users = await User.find({ role: "learner" })
      .select("name email picture points streak level")
      .sort(sort)
      .limit(limit);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture || null,
      xp: user.points || 0,
      streak: user.streak || 0,
      level: user.level || 1,
    }));

    return res.json({ sortBy, leaderboard });
  } catch (err) {
    console.error("Leaderboard fetch error:", err);
    return res.status(500).json({ msg: "Failed to fetch leaderboard" });
  }
});

// Admin: list users (basic management view)
router.get("/admin/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find()
      .select("name role email")
      .sort({ createdAt: -1 });

    const mapped = users.map((user) => ({
      id: user._id,
      name: user.name || "Unnamed",
      role: user.role || "learner",
      email: user.email || "",
    }));

    return res.json({ users: mapped });
  } catch (err) {
    console.error("Admin users fetch error:", err);
    return res.status(500).json({ msg: "Failed to fetch users" });
  }
});

module.exports = router;
