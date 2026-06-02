const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const User = require("../models/user");
const Progress = require("../models/progress");
const Quest = require("../models/quest");

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeSkillEntries = (skills) => {
  if (!skills) return [];
  const entries = skills instanceof Map ? Array.from(skills.entries()) : Object.entries(skills);
  return entries
    .map(([name, value]) => ({
      name: String(name || "Skill").trim(),
      value: Math.max(0, Math.min(100, toNumber(value, 0))),
    }))
    .filter((entry) => entry.name);
};

const buildProgressSummary = async (userId) => {
  const user = await User.findById(userId).select(
    "name email showEmail picture points currentXP streak level questsCompleted badges selectedBadges xpToNextLevel totalQuests recentActivity skills createdAt"
  ).lean();

  if (!user) return null;

  const progressEntries = await Progress.find({ userId })
    .sort({ lastAttempt: -1, updatedAt: -1, createdAt: -1 })
    .lean();

  const lessonIds = progressEntries
    .map((entry) => String(entry.lessonId || ""))
    .filter(Boolean);

  const lessonLookup = new Map();

  if (lessonIds.length > 0) {
    const [quests, standaloneLessons] = await Promise.all([
      Quest.find({ "lessons._id": { $in: lessonIds } }).select("title lessons").lean(),
      require("../models/lesson").find({ _id: { $in: lessonIds } }).select("title xp").lean(),
    ]);

    quests.forEach((quest) => {
      (quest.lessons || []).forEach((lesson) => {
        const lessonId = String(lesson._id || "");
        if (!lessonId || lessonLookup.has(lessonId)) return;
        lessonLookup.set(lessonId, {
          title: lesson.title || "Untitled lesson",
          questTitle: quest.title || "Quest",
          xp: toNumber(lesson.xp, 0),
        });
      });
    });

    standaloneLessons.forEach((lesson) => {
      const lessonId = String(lesson._id || "");
      if (!lessonId || lessonLookup.has(lessonId)) return;
      lessonLookup.set(lessonId, {
        title: lesson.title || "Untitled lesson",
        questTitle: "Standalone lesson",
        xp: toNumber(lesson.xp, 0),
      });
    });
  }

  const lessonProgress = progressEntries.map((entry) => {
    const resolved = lessonLookup.get(String(entry.lessonId || ""));
    return {
      id: String(entry._id || entry.lessonId || ""),
      lessonId: String(entry.lessonId || ""),
      title: resolved?.title || "Lesson",
      questTitle: resolved?.questTitle || "Quest",
      xp: resolved?.xp || 0,
      status: entry.status || "not-started",
      score: toNumber(entry.score, 0),
      attempts: toNumber(entry.attempts, 0),
      lastAttempt: entry.lastAttempt || entry.updatedAt || entry.createdAt || null,
    };
  });

  const totalLessons = lessonProgress.length;
  const completedLessons = lessonProgress.filter((entry) => entry.status === "completed").length;
  const inProgressLessons = lessonProgress.filter((entry) => entry.status === "in-progress").length;
  const notStartedLessons = lessonProgress.filter((entry) => entry.status === "not-started").length;
  const totalAttempts = lessonProgress.reduce((sum, entry) => sum + toNumber(entry.attempts, 0), 0);
  const averageScore = totalLessons > 0
    ? Math.round(lessonProgress.reduce((sum, entry) => sum + toNumber(entry.score, 0), 0) / totalLessons)
    : 0;
  const completionRate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const strongestLesson = lessonProgress.reduce((best, entry) => (entry.score > (best?.score || -1) ? entry : best), null);
  const weakestLesson = lessonProgress.reduce((worst, entry) => (entry.score < (worst?.score ?? 101) ? entry : worst), null);

  const recentActivity = Array.isArray(user.recentActivity) ? user.recentActivity.slice(0, 10) : [];
  // Build full chronological history (XP over time) by combining Progress entries
  // and the user's recentActivity. This attempts to reconstruct a cumulative XP
  // timeseries from account creation until now.
  const historyEvents = [];

  // From lessonProgress (derived from Progress documents) - use lastAttempt and xp
  lessonProgress.forEach((entry) => {
    if (entry.status === "completed" && entry.lastAttempt) {
      historyEvents.push({
        source: "progress",
        title: entry.title,
        xp: toNumber(entry.xp, 0),
        at: new Date(entry.lastAttempt),
      });
    }
  });

  // From user.recentActivity entries (may contain xpEarned and completedAt)
  if (Array.isArray(user.recentActivity)) {
    user.recentActivity.forEach((act) => {
      const when = act?.completedAt ? new Date(act.completedAt) : null;
      if (when && !Number.isNaN(when.getTime())) {
        historyEvents.push({
          source: "recentActivity",
          title: act.questTitle || "Activity",
          xp: toNumber(act.xpEarned, 0),
          at: when,
        });
      }
    });
  }

  // Sort events chronologically (oldest first)
  historyEvents.sort((a, b) => a.at - b.at);

  // Aggregate events by day (YYYY-MM-DD) to reduce point count and then build cumulative XP
  const dayXpMap = new Map();
  const dayQuestMap = new Map();
  const dayActiveMap = new Map();

  historyEvents.forEach((ev) => {
    const day = ev.at.toISOString().slice(0, 10);
    // XP per day
    const prevXp = dayXpMap.get(day) || 0;
    dayXpMap.set(day, prevXp + toNumber(ev.xp, 0));
    // Quest/completion count per day (treat each event as one completion)
    const prevQ = dayQuestMap.get(day) || 0;
    dayQuestMap.set(day, prevQ + 1);
    // Active items per day (unique titles)
    const setForDay = dayActiveMap.get(day) || new Set();
    if (ev.title) setForDay.add(String(ev.title));
    dayActiveMap.set(day, setForDay);
  });

  const sortedDays = Array.from(new Set([
    ...Array.from(dayXpMap.keys()),
    ...Array.from(dayQuestMap.keys()),
    ...Array.from(dayActiveMap.keys()),
  ])).sort((a, b) => (a < b ? -1 : 1));

  const firstActivityDay = sortedDays[0] || (user.createdAt ? new Date(user.createdAt).toISOString().slice(0, 10) : null);
  const lastActivityDay = sortedDays[sortedDays.length - 1] || firstActivityDay;

  const fillDays = [];
  if (firstActivityDay && lastActivityDay) {
    const start = new Date(`${firstActivityDay}T00:00:00.000Z`);
    const end = new Date(`${lastActivityDay}T00:00:00.000Z`);
    for (let cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
      fillDays.push(cursor.toISOString().slice(0, 10));
    }
  }

  const chartDays = fillDays.length > 0 ? fillDays : sortedDays;

  const xpDaily = chartDays.map((day) => ({ label: day, value: dayXpMap.get(day) || 0 }));
  const questsDaily = chartDays.map((day) => ({ label: day, value: dayQuestMap.get(day) || 0 }));
  const momentumDaily = chartDays.map((day) => ({ label: day, value: (dayActiveMap.get(day) || new Set()).size }));

  // Also provide a cumulative XP series for optional clients
  const xpCumulative = [];
  let cum = 0;
  xpDaily.forEach((p) => { cum += Number(p.value) || 0; xpCumulative.push({ label: p.label, value: cum }); });

  return {
    user: {
      id: user._id,
      name: user.name || "Learner",
      email: user.showEmail !== false ? user.email : "",
      showEmail: user.showEmail !== false,
      picture: user.picture || null,
      points: toNumber(user.points, 0),
      currentXP: toNumber(user.currentXP, 0),
      streak: toNumber(user.streak, 0),
      level: toNumber(user.level, 1),
      questsCompleted: toNumber(user.questsCompleted, 0),
      badges: Array.isArray(user.badges) ? user.badges : [],
      selectedBadges: Array.isArray(user.selectedBadges) ? user.selectedBadges : [],
      xpToNextLevel: toNumber(user.xpToNextLevel, 500),
      totalQuests: toNumber(user.totalQuests, 0),
    },
    overview: {
      totalLessons,
      completedLessons,
      inProgressLessons,
      notStartedLessons,
      completionRate,
      averageScore,
      totalAttempts,
      strongestLesson,
      weakestLesson,
    },
    charts: {
      completionBreakdown: [
        { label: "Completed", value: completedLessons, color: "emerald" },
        { label: "In progress", value: inProgressLessons, color: "cyan" },
        { label: "Not started", value: notStartedLessons, color: "stone" },
      ],
      scoreTrend: lessonProgress
        .filter((entry) => entry.lastAttempt)
        .slice(0, 6)
        .reverse()
        .map((entry) => ({ label: entry.title, value: entry.score, status: entry.status })),
      xpProgress: {
        currentXP: toNumber(user.currentXP, 0),
        xpToNextLevel: toNumber(user.xpToNextLevel, 500),
      },
      streakProgress: {
        streak: toNumber(user.streak, 0),
      },
      skills: normalizeSkillEntries(user.skills),
      history: xpCumulative,
      xpDaily,
      questsDaily,
      momentumDaily: momentumDaily,
    },
    lessonProgress,
    recentActivity,
  };
};

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
    const requestedSort = String(req.query.sortBy || "xp").toLowerCase();
    const sortBy = requestedSort === "streak" || requestedSort === "level" ? requestedSort : "xp";
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);

    const sort = sortBy === "streak"
      ? { streak: -1, points: -1, level: -1, name: 1 }
      : sortBy === "level"
      ? { level: -1, points: -1, streak: -1, name: 1 }
      : { points: -1, streak: -1, level: -1, name: 1 };

    const users = await User.find({ role: "learner" })
      .select("name email showEmail picture points currentXP streak level questsCompleted badges selectedBadges")
      .sort(sort)
      .limit(limit);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      id: user._id,
      name: user.name,
      email: user.showEmail !== false ? user.email : "",
      showEmail: user.showEmail !== false,
      picture: user.picture || null,
      xp: user.points || 0,
      points: user.points || 0,
      currentXP: user.currentXP || 0,
      streak: user.streak || 0,
      level: user.level || 1,
      questsCompleted: user.questsCompleted || 0,
      badges: Array.isArray(user.badges) ? user.badges : [],
      selectedBadges: Array.isArray(user.selectedBadges) ? user.selectedBadges : [],
    }));

    return res.json({ sortBy, leaderboard });
  } catch (err) {
    console.error("Leaderboard fetch error:", err);
    return res.status(500).json({ msg: "Failed to fetch leaderboard" });
  }
});

router.get("/:userId/progress-summary", authMiddleware, async (req, res) => {
  try {
    const summary = await buildProgressSummary(req.params.userId);
    if (!summary) {
      return res.status(404).json({ msg: "User not found" });
    }

    return res.json(summary);
  } catch (err) {
    console.error("Progress summary fetch error:", err);
    return res.status(500).json({ msg: "Failed to fetch progress summary" });
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
