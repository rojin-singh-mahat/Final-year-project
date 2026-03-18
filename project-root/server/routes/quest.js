const express = require("express");
const Quest = require("../models/quest");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware.js");

const router = express.Router();

const questFeedbackPopulate = [
  { path: "feedback.user", select: "name picture" },
  { path: "feedback.adminReply.admin", select: "name picture role" },
];

// Create quest (admin only for now)
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ msg: "Not authorized" });

    const quest = new Quest(req.body);
    await quest.save();
    return res.json(quest);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
});

// Public: get all quests
router.get("/", async (req, res) => {
  try {
    const quests = await Quest.find().populate(questFeedbackPopulate);
    return res.json(quests);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

//get one quest
router.get("/:id", async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id).populate(questFeedbackPopulate);
    if (!quest) return res.status(404).json({ error: "Quest not found" });
    return res.json(quest);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

// Get quest feedback (public)
router.get("/:id/feedback", async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id).populate(questFeedbackPopulate);
    if (!quest) return res.status(404).json({ error: "Quest not found" });

    const feedback = [...(quest.feedback || [])].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return res.json({
      avgRating: quest.avgRating || 0,
      ratingCount: quest.ratingCount || 0,
      feedback,
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

// Add or update quest feedback (learner/admin)
router.post("/:id/feedback", authMiddleware, async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);
    if (!quest) return res.status(404).json({ error: "Quest not found" });

    const rating = Number(req.body?.rating);
    const comment = (req.body?.comment || "").trim();

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    if (!comment) {
      return res.status(400).json({ error: "Comment is required" });
    }

    const existingIndex = quest.feedback.findIndex(
      (entry) => String(entry.user) === String(req.user.id)
    );

    if (existingIndex >= 0) {
      quest.feedback[existingIndex].rating = rating;
      quest.feedback[existingIndex].comment = comment;
    } else {
      quest.feedback.push({
        user: req.user.id,
        rating,
        comment,
      });
    }

    const ratingCount = quest.feedback.length;
    const totalRating = quest.feedback.reduce(
      (sum, entry) => sum + (entry.rating || 0),
      0
    );
    quest.ratingCount = ratingCount;
    quest.avgRating = ratingCount > 0 ? Number((totalRating / ratingCount).toFixed(1)) : 0;

    await quest.save();

    const updatedQuest = await Quest.findById(req.params.id).populate(questFeedbackPopulate);

    return res.json(updatedQuest);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

// Add or update admin reply on feedback (admin only)
router.post(
  "/:id/feedback/:feedbackId/reply",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const quest = await Quest.findById(req.params.id);
      if (!quest) return res.status(404).json({ error: "Quest not found" });

      const feedbackEntry = quest.feedback.id(req.params.feedbackId);
      if (!feedbackEntry) {
        return res.status(404).json({ error: "Feedback not found" });
      }

      const message = (req.body?.message || "").trim();
      if (!message) {
        return res.status(400).json({ error: "Reply message is required" });
      }

      feedbackEntry.adminReply = {
        admin: req.user.id,
        message,
        repliedAt: new Date(),
      };

      await quest.save();

      const updatedQuest = await Quest.findById(req.params.id).populate(questFeedbackPopulate);

    return res.json(updatedQuest);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
  }
);

//Update quests
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updatedQuest = await Quest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedQuest) return res.status(404).json({ error: "Quest not found" });
    return res.json(updatedQuest);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//delete a quest
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const quest = await Quest.findByIdAndDelete(req.params.id);
    if (!quest) return res.status(404).json({ error: "Quest not found" });
    return res.json({ msg: "Quest Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
