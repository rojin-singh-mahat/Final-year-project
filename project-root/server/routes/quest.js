const express = require("express");
const Quest = require("../models/quest");
const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware.js");

const router = express.Router();

const questFeedbackPopulate = [
  { path: "feedback.user", select: "name picture" },
  { path: "feedback.adminReply.admin", select: "name picture role" },
];

const normalizeHashtags = (rawHashtags) => {
  if (!Array.isArray(rawHashtags)) return [];
  return [...new Set(
    rawHashtags
      .map((tag) => String(tag || "").trim().toLowerCase().replace(/^#+/, ""))
      .filter(Boolean)
  )];
};

const enrichQuestStats = (quest, completionMap) => {
  const completionCount = completionMap.get(String(quest._id)) || 0;
  const lessonXP = Array.isArray(quest.lessons)
    ? quest.lessons.reduce((sum, lesson) => sum + Number(lesson.xp || 0), 0)
    : 0;
  const feedback = Array.isArray(quest.feedback) ? quest.feedback : [];
  const ratingCount = Number(quest.ratingCount || feedback.length || 0);
  const feedbackAvg = feedback.length > 0
    ? feedback.reduce((sum, entry) => sum + Number(entry.rating || 0), 0) / feedback.length
    : null;
  const avgRating = ratingCount > 0
    ? Number(((feedbackAvg ?? Number(quest.avgRating || 0))).toFixed(1))
    : 0;

  return {
    ...quest.toObject(),
    totalXP: Number(quest.totalXP || lessonXP || 0),
    completions: completionCount,
    ratingCount,
    avgRating: Number.isFinite(avgRating) ? avgRating : Number(quest.avgRating || 0),
  };
};

// Create quest (admin only for now)
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ msg: "Not authorized" });

    const payload = {
      ...req.body,
      hashtags: normalizeHashtags(req.body.hashtags),
    };

    const quest = new Quest(payload);
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

    const completionAgg = await User.aggregate([
      { $unwind: "$completedQuests" },
      { $group: { _id: "$completedQuests", count: { $sum: 1 } } },
    ]);

    const completionMap = new Map(
      completionAgg.map((item) => [String(item._id), Number(item.count || 0)])
    );

    const enriched = quests.map((quest) => enrichQuestStats(quest, completionMap));
    return res.json(enriched);
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
    const payload = {
      ...req.body,
      hashtags: normalizeHashtags(req.body.hashtags),
    };

    const updatedQuest = await Quest.findByIdAndUpdate(
      req.params.id,
      payload,
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
