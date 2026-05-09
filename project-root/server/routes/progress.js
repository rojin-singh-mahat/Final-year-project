const express = require("express");
const router = express.Router();
const Progress = require("../models/progress");
const User = require("../models/user");
const Lesson = require("../models/lesson");
const authMiddleware = require("../middleware/authMiddleware");

// Get user's progress for a specific lesson
router.get("/lesson/:lessonId", authMiddleware, async (req, res) => {
  try {
    const progress = await Progress.findOne({
      userId: req.user.id,
      lessonId: req.params.lessonId,
    });
    res.json(progress || { status: "not-started", score: 0, attempts: 0 });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all progress for the current user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user.id }).populate(
      "lessonId"
    );
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Submit quiz and update progress
router.post("/submit", authMiddleware, async (req, res) => {
  try {
    const { lessonId, questId, answers, questionIndexes, timeTaken } = req.body;

    // For embedded lessons in quests, we need the quest data
    const Quest = require("../models/quest");
    const quest = await Quest.findById(questId);
    
    if (!quest) {
      return res.status(404).json({ message: "Quest not found" });
    }

    // Find the lesson within the quest
    const lesson = quest.lessons.id(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    // Grade the quiz. If questionIndexes are supplied, grade only that subset.
    let correctAnswers = 0;
    const safeAnswers = Array.isArray(answers) ? answers : [];
    const hasSubset = Array.isArray(questionIndexes) && questionIndexes.length > 0;

    let totalQuestions = 0;
    if (hasSubset) {
      questionIndexes.forEach((quizIndex, answerIndex) => {
        if (!Number.isInteger(quizIndex)) return;
        const quiz = lesson.quizzes[quizIndex];
        if (!quiz) return;
        totalQuestions += 1;
        if (safeAnswers[answerIndex] === quiz.correctAnswer) {
          correctAnswers += 1;
        }
      });
    } else {
      totalQuestions = lesson.quizzes.length;
      lesson.quizzes.forEach((quiz, index) => {
        if (safeAnswers[index] === quiz.correctAnswer) {
          correctAnswers++;
        }
      });
    }

    if (totalQuestions === 0) {
      return res.status(400).json({ message: "No valid quiz answers were submitted" });
    }

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    
    // Check if quest has been completed before for diminished XP
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isRepeatCompletion = user.completedQuests?.includes(questId);
    
    // Base XP calculation
    let xpEarned = score >= 70 ? lesson.xp : Math.round(lesson.xp * 0.5); // Full XP if pass, half if fail
    
    // Apply diminished XP for repeat completions (10% of original)
    if (isRepeatCompletion) {
      xpEarned = Math.round(xpEarned * 0.1);
    }

    // Update or create progress
    let progress = await Progress.findOne({
      userId: req.user.id,
      lessonId: lessonId,
    });

    if (progress) {
      progress.score = Math.max(progress.score, score);
      progress.attempts += 1;
      progress.lastAttempt = new Date();
      if (score >= 70) {
        progress.status = "completed";
      }
    } else {
      progress = new Progress({
        userId: req.user.id,
        lessonId: lessonId,
        status: score >= 70 ? "completed" : "in-progress",
        score,
        attempts: 1,
        lastAttempt: new Date(),
      });
    }

    await progress.save();

    // Update user stats (user already fetched above for repeat check)
    user.currentXP = (user.currentXP || 0) + xpEarned;
    user.points = (user.points || 0) + xpEarned;
    if (!Array.isArray(user.completedQuests)) user.completedQuests = [];
    if (!Array.isArray(user.recentActivity)) user.recentActivity = [];
    if (!Array.isArray(user.badges)) user.badges = [];

    // Level up logic
    while (user.currentXP >= user.xpToNextLevel) {
      user.currentXP -= user.xpToNextLevel;
      user.level += 1;
      user.xpToNextLevel = Math.floor(user.xpToNextLevel * 1.5); // 50% more XP for next level
    }

    // Update streak
    const now = new Date();
    const lastActivity = user.recentActivity?.[0]?.completedAt 
      ? new Date(user.recentActivity[0].completedAt) 
      : null;
    
    if (lastActivity) {
      const daysSinceLastActivity = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
      if (daysSinceLastActivity === 1) {
        user.streak = (user.streak || 0) + 1;
      } else if (daysSinceLastActivity > 1) {
        user.streak = 1;
      }
    } else {
      user.streak = 1;
    }

    // Check if quest is completed (all lessons completed)
    const questProgress = await Progress.find({
      userId: req.user.id,
      lessonId: { $in: quest.lessons.map(l => l._id) },
      status: "completed"
    });

    let badgeEarned = false;
    if (questProgress.length === quest.lessons.length) {
      if (quest.rewardBadge && !user.badges.includes(quest.rewardBadge)) {
        user.badges.push(quest.rewardBadge);
        badgeEarned = true;
        user.questsCompleted = (user.questsCompleted || 0) + 1;
      }

      // Mark quest as completed for XP diminishing on future attempts
      if (!user.completedQuests.includes(questId)) {
        user.completedQuests.push(questId);
      }
    }

    // Add to recent activity
    user.recentActivity.unshift({
      questTitle: quest.title,
      lessonTitle: lesson.title,
      completedAt: now.toISOString(),
      xpEarned,
      badgeEarned,
    });
    user.recentActivity = user.recentActivity.slice(0, 10); // Keep last 10

    await user.save();

    res.json({
      score,
      xpEarned,
      correctAnswers,
      totalQuestions,
      passed: score >= 70,
      badgeEarned: badgeEarned ? quest.rewardBadge : null,
      newLevel: user.level,
      currentXP: user.currentXP,
      xpToNextLevel: user.xpToNextLevel,
      streak: user.streak,
    });
  } catch (err) {
    console.error("Error submitting quiz:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Start a lesson (mark as in-progress)
router.post("/start", authMiddleware, async (req, res) => {
  try {
    const { lessonId } = req.body;

    let progress = await Progress.findOne({
      userId: req.user.id,
      lessonId,
    });

    if (!progress) {
      progress = new Progress({
        userId: req.user.id,
        lessonId,
        status: "in-progress",
        score: 0,
        attempts: 0,
      });
      await progress.save();
    }

    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
