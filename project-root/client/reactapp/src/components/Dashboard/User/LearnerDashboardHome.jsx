import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  TrendingUp,
  Zap,
  Star,
  BookOpen,
  ChevronRight,
  Clock,
  Trophy,
  Flame,
  Award,
  PieChart,
} from "lucide-react";
import QuestRoadmap from "./QuestRoadmap";
import LineTrendChart from "./LineTrendChart";

export default function LearnerDashboardHome({
  userData,
  allQuests,
  loadingQuests,
  skills,
  recentActivity,
  purchasedQuests = [],
  onOpenQuest,
  onOpenBrowse,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [topicBreakdownOpen, setTopicBreakdownOpen] = useState(false);

  const categories = useMemo(() => {
    const values = new Set((allQuests || []).map((q) => q.category).filter(Boolean));
    return ["All", ...values];
  }, [allQuests]);

  const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

  const filteredQuests = useMemo(() => {
    return (allQuests || []).filter((quest) => {
      const title = (quest.title || "").toLowerCase();
      const description = (quest.description || "").toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const hashtagTokens = q
        .split(/\s+/)
        .filter((token) => token.startsWith("#"))
        .map((token) => token.replace(/^#+/, ""));
      const textQuery = q
        .split(/\s+/)
        .filter((token) => !token.startsWith("#"))
        .join(" ");
      const questHashtags = Array.isArray(quest.hashtags)
        ? quest.hashtags.map((tag) => String(tag).toLowerCase())
        : [];
      const difficulty = (quest.difficulty || "").toLowerCase();

      const matchesSearch = !textQuery || title.includes(textQuery) || description.includes(textQuery);
      const matchesHashtags = hashtagTokens.length === 0 || hashtagTokens.every((tag) => questHashtags.includes(tag));
      const matchesCategory = selectedCategory === "All" || quest.category === selectedCategory;
      const matchesDifficulty =
        selectedDifficulty === "All" || difficulty === selectedDifficulty.toLowerCase();

      return matchesSearch && matchesHashtags && matchesCategory && matchesDifficulty;
    });
  }, [allQuests, searchQuery, selectedCategory, selectedDifficulty]);

  const continueQuests = useMemo(() => {
    const started = (allQuests || []).filter((q) => (q.completedLessons || 0) > 0 && !q.isCompleted);
    if (started.length > 0) return started.slice(0, 3);
    return (allQuests || []).slice(0, 3);
  }, [allQuests]);

  const stats = {
    totalXP: userData.totalXP || 0,
    questsCompleted: userData.questsCompleted || 0,
    currentStreak: userData.streak || 0,
    achievements: userData.badgesEarned || 0,
  };

  const [historyCharts, setHistoryCharts] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadHistory() {
      if (!userData?.id) return;
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/${userData.id}/progress-summary`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (!mounted) return;
        if (res.ok && data?.charts) {
          setHistoryCharts(data.charts);
        }
      } catch (err) {
        // ignore — fallback uses recentActivity
      }
    }

    loadHistory();
    return () => { mounted = false; };
  }, [userData?.id]);

  const xpTrend = useMemo(() => {
    // Prefer full account history when available (from server `charts.history`)
    const entries = Array.isArray(historyCharts?.xpDaily) && historyCharts.xpDaily.length > 0
      ? [...historyCharts.xpDaily]
      : Array.isArray(recentActivity) ? [...recentActivity].slice(0, 6).reverse() : [];
    if (entries.length === 0) {
      return [
        { label: "Start", value: 0 },
        { label: "Now", value: stats.totalXP || 0 },
      ];
    }

    // If historyPoints are provided they are cumulative already
    if (Array.isArray(historyCharts?.xpDaily) && historyCharts.xpDaily.length > 0) {
      return entries.map((p) => ({
        label: new Date(p.label).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        value: Number(p.value) || 0,
      }));
    }

    let cumulative = 0;
    return entries.map((entry, index) => {
      cumulative += Number(entry?.xpEarned) || 0;
      const label = entry?.completedAt
        ? new Date(entry.completedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
        : `#${index + 1}`;
      return { label, value: cumulative };
    });
  }, [recentActivity, stats.totalXP]);

  const questTrend = useMemo(() => {
    // Prefer daily series from server
    if (Array.isArray(historyCharts?.questsDaily) && historyCharts.questsDaily.length > 0) {
      return historyCharts.questsDaily.map((p) => ({
        label: new Date(p.label).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        value: Number(p.value) || 0,
      }));
    }

    const entries = Array.isArray(recentActivity) ? [...recentActivity].slice(0, 6).reverse() : [];
    if (entries.length === 0) {
      return [
        { label: "Start", value: 0 },
        { label: "Now", value: stats.questsCompleted || 0 },
      ];
    }

    const countsByDay = new Map();
    entries.forEach((entry, index) => {
      const label = entry?.completedAt
        ? new Date(entry.completedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
        : `#${index + 1}`;
      countsByDay.set(label, (countsByDay.get(label) || 0) + 1);
    });

    return Array.from(countsByDay.entries()).map(([label, value]) => ({ label, value }));
  }, [recentActivity, stats.questsCompleted]);

  const activityTrend = useMemo(() => {
    if (Array.isArray(historyCharts?.momentumDaily) && historyCharts.momentumDaily.length > 0) {
      return historyCharts.momentumDaily.map((p) => ({
        label: new Date(p.label).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        value: Number(p.value) || 0,
      }));
    }

    const entries = Array.isArray(recentActivity) ? [...recentActivity].slice(0, 8).reverse() : [];
    if (entries.length === 0) {
      return [
        { label: "Start", value: 0 },
        { label: "Now", value: stats.currentStreak || 0 },
      ];
    }

    const seenDays = new Set();
    let activeDays = 0;
    return entries.map((entry, index) => {
      const dateKey = entry?.completedAt ? new Date(entry.completedAt).toDateString() : `#${index + 1}`;
      if (!seenDays.has(dateKey)) {
        seenDays.add(dateKey);
        activeDays += 1;
      }
      const label = entry?.completedAt
        ? new Date(entry.completedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
        : `#${index + 1}`;
      return { label, value: activeDays };
    });
  }, [recentActivity, stats.currentStreak]);

  const topicColorSets = [
    { from: "#22d3ee", to: "#60a5fa" },
    { from: "#f59e0b", to: "#f97316" },
    { from: "#34d399", to: "#10b981" },
    { from: "#a78bfa", to: "#8b5cf6" },
    { from: "#f472b6", to: "#ec4899" },
    { from: "#fca5a5", to: "#fb7185" },
  ];

  const topicDistribution = useMemo(() => {
    const normalizeTag = (value) => String(value || "").trim().toLowerCase().replace(/^#+/, "");

    const completedIds = new Set(
      Array.isArray(userData?.completedQuestIds)
        ? userData.completedQuestIds.map((id) => String(id))
        : []
    );

    const questById = new Map(
      (allQuests || [])
        .map((quest) => [String(quest._id || quest.id || ""), quest])
        .filter(([id]) => Boolean(id))
    );

    const questByTitle = new Map(
      (allQuests || [])
        .map((quest) => [String(quest.title || "").trim().toLowerCase(), quest])
        .filter(([title]) => Boolean(title))
    );

    const completedQuests = [];
    const seen = new Set();

    const addQuest = (quest, fallbackKey) => {
      if (!quest) return;
      const key = String(quest._id || quest.id || fallbackKey || quest.title || "").trim().toLowerCase();
      if (!key || seen.has(key)) return;
      seen.add(key);
      completedQuests.push(quest);
    };

    completedIds.forEach((id) => {
      const quest = questById.get(id);
      addQuest(quest, id);
    });

    if (Array.isArray(recentActivity)) {
      recentActivity.forEach((activity) => {
        const title = String(activity?.questTitle || "").trim().toLowerCase();
        const quest = title ? questByTitle.get(title) : null;

        if (quest) {
          addQuest(quest, title);
          return;
        }

        if (title) {
          addQuest({ title: activity.questTitle, hashtags: [], category: "" }, title);
        }
      });
    }

    const counts = new Map();
    completedQuests.forEach((quest) => {
      const tags = Array.isArray(quest.hashtags)
        ? [...new Set(quest.hashtags.map(normalizeTag).filter(Boolean))]
        : [];
      const topic = tags.length > 0
        ? tags.join(" / ")
        : String(quest.category || "").trim().toLowerCase()
          || String(quest.title || "other").trim().toLowerCase()
          || "other";
      counts.set(topic, (counts.get(topic) || 0) + 1);
    });

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({ label, value }));
  }, [allQuests, recentActivity, userData?.completedQuestIds]);

  const topicPieData = useMemo(() => {
    const total = topicDistribution.reduce((sum, item) => sum + item.value, 0) || 1;
    const visibleTopicLimit = 7;
    const topTopics = topicDistribution.slice(0, visibleTopicLimit);
    const hiddenTopics = topicDistribution.slice(visibleTopicLimit);
    const hiddenTotal = hiddenTopics.reduce((sum, item) => sum + item.value, 0);

    const displayTopics = hiddenTotal > 0
      ? [...topTopics, { label: "Other", value: hiddenTotal, isOther: true }]
      : topTopics;

    return {
      total,
      displayTopics,
      hiddenTopics,
      hiddenTotal,
    };
  }, [topicDistribution]);

  const topicGradient = useMemo(() => {
    const total = topicPieData.total || 1;
    let currentAngle = 0;
    const stops = topicPieData.displayTopics.map((item, index) => {
      const start = currentAngle;
      const span = (item.value / total) * 360;
      currentAngle += span;
      const colors = item.isOther
        ? { from: "#64748b", to: "#475569" }
        : topicColorSets[index % topicColorSets.length];
      return `${colors.from} ${start}deg ${currentAngle}deg, ${colors.to} ${start}deg ${currentAngle}deg`;
    });

    return `conic-gradient(${stops.join(", ")})`;
  }, [topicPieData.displayTopics, topicPieData.total]);

  const topicLegend = useMemo(() => {
    const total = topicPieData.total || 1;
    return topicPieData.displayTopics.map((item, index) => ({
      ...item,
      percent: Math.round((item.value / total) * 100),
      color: item.isOther ? "#94a3b8" : topicColorSets[index % topicColorSets.length].from,
    }));
  }, [topicPieData, topicColorSets]);


  const getDifficultyStyle = (difficulty = "") => {
    const value = difficulty.toLowerCase();
    const shared = "inline-flex items-center justify-center whitespace-nowrap min-w-[92px] px-2.5 py-1 leading-none";
    if (value === "beginner") return `${shared} bg-emerald-500/20 text-emerald-300 border-emerald-500/40`;
    if (value === "intermediate") return `${shared} bg-amber-500/20 text-amber-300 border-amber-500/40`;
    if (value === "advanced") return `${shared} bg-red-500/20 text-red-300 border-red-500/40`;
    return `${shared} bg-stone-500/20 text-stone-300 border-stone-500/40`;
  };

  return (
    <main className="ml-auto flex-1 pr-8 py-8 pl-0 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1b222a]/90 border border-stone-700 rounded-2xl p-8 mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-['Cinzel'] text-3xl text-stone-100 mb-2">
              Welcome back, <span className="text-amber-200">{userData.username || "Learner"}</span>
            </h1>
            <p className="text-cyan-300 flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 animate-pulse" />
              You are on a {stats.currentStreak} day streak.
            </p>
            <p className="text-stone-300">Keep pushing your legend forward.</p>
          </div>
          <button
            onClick={onOpenBrowse}
            className="bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 text-[#20140a] px-8 py-3 rounded-full transition-all hover:scale-105 flex items-center gap-2 font-['Cinzel'] font-bold"
          >
            Continue Learning
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
        <LineTrendChart
          title="XP Growth"
          subtitle="Daily XP gained across the recorded account history."
          points={xpTrend}
          lineClassName="stroke-cyan-300"
          fillClassName="fill-cyan-500/10"
          emptyMessage="No XP trend available yet."
        />
        <LineTrendChart
          title="Quest Completion"
          subtitle="Daily quest completions across the recorded account history."
          points={questTrend}
          showAllPoints={true}
          lineClassName="stroke-amber-300"
          fillClassName="fill-amber-500/10"
          emptyMessage="No completion trend available yet."
        />
        <LineTrendChart
          title="Learning Momentum"
          subtitle="Daily learning activity across the recorded account history."
          points={activityTrend}
          lineClassName="stroke-emerald-300"
          fillClassName="fill-emerald-500/10"
          emptyMessage="No momentum trend available yet."
        />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-10 bg-[#131820] border border-stone-700 rounded-2xl p-6"
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <PieChart className="w-6 h-6 text-cyan-300" />
              <h2 className="font-['Cinzel'] text-2xl text-stone-100">Topic Distribution</h2>
            </div>
            <p className="text-sm text-stone-500 mt-2">
              Shows which quest topics you have completed most often, based on quest hashtags.
            </p>
          </div>
        </div>

        {topicLegend.length === 0 ? (
          <div className="text-center py-10 text-stone-400 border border-dashed border-stone-700 rounded-xl bg-[#0f141a]">
            No topic data available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6 items-center">
            <div className="flex items-center justify-center">
              <div className="relative w-56 h-56 rounded-full p-4 bg-[#0f141a] border border-stone-700 shadow-inner">
                <div
                  className="w-full h-full rounded-full"
                  style={{
                    background: topicGradient,
                    WebkitMask: "radial-gradient(circle at center, transparent 0 42%, black 43% 100%)",
                    mask: "radial-gradient(circle at center, transparent 0 42%, black 43% 100%)",
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-center px-6 pointer-events-none">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-stone-500">Completed</div>
                    <div className="text-3xl font-['Cinzel'] text-stone-100">{stats.questsCompleted || 0}</div>
                    <div className="text-xs text-stone-500 mt-1">quests</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {topicLegend.map((item) => (
                item.isOther ? (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setTopicBreakdownOpen(true)}
                    className="bg-[#0f141a] border border-stone-700 rounded-xl p-4 flex items-start gap-3 text-left hover:border-cyan-300/50 transition-colors"
                  >
                    <span className="mt-1 w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <div className="min-w-0">
                      <div className="text-stone-100 font-semibold truncate">Other</div>
                      <div className="text-xs text-stone-500 mt-1">
                        {item.value} quest{item.value === 1 ? "" : "s"} · {item.percent}%
                      </div>
                      <div className="text-[10px] text-cyan-300 mt-2 uppercase tracking-[0.18em]">Tap to expand</div>
                    </div>
                  </button>
                ) : (
                  <div key={item.label} className="bg-[#0f141a] border border-stone-700 rounded-xl p-4 flex items-start gap-3">
                    <span className="mt-1 w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <div className="min-w-0">
                      <div className="text-stone-100 font-semibold truncate">{item.label}</div>
                      <div className="text-xs text-stone-500 mt-1">
                        {item.value} quest{item.value === 1 ? "" : "s"} · {item.percent}%
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}
      </motion.section>

      {topicBreakdownOpen && topicPieData.hiddenTopics.length > 0 && (
        <div className="fixed inset-0 z-[10020] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-stone-700 bg-[#0b1016] shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between gap-4 p-5 border-b border-stone-800">
              <div>
                <h3 className="text-xl font-['Cinzel'] text-stone-100">Other Topics</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Hidden slices grouped into Other: {topicPieData.hiddenTotal} quest{topicPieData.hiddenTotal === 1 ? "" : "s"}, {Math.round((topicPieData.hiddenTotal / topicPieData.total) * 100)}% of the pie.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTopicBreakdownOpen(false)}
                className="p-2 rounded-lg border border-stone-700 text-stone-300 hover:text-stone-100 hover:bg-white/5"
              >
                ×
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[60vh] overflow-auto">
              {topicPieData.hiddenTopics.map((item, index) => {
                const percent = Math.round((item.value / topicPieData.total) * 100);
                return (
                  <div key={`${item.label}-${index}`} className="bg-[#0f141a] border border-stone-700 rounded-xl p-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-stone-100 font-semibold truncate">{item.label}</div>
                      <div className="text-xs text-stone-500 mt-1">
                        {item.value} quest{item.value === 1 ? "" : "s"} · {percent}% of total
                      </div>
                    </div>
                    <div className="text-xs text-stone-400 whitespace-nowrap">
                      {Math.round((item.value / topicPieData.hiddenTotal) * 100)}% of Other
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-['Cinzel'] text-3xl text-amber-200">Continue Your Quest</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {continueQuests.map((quest) => (
            <button
              key={quest._id || quest.id}
              onClick={() => onOpenQuest(quest)}
              className="text-left bg-[#1b222a]/85 border border-stone-700 rounded-xl p-5 hover:border-cyan-300/60 hover:-translate-y-1 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg text-stone-100 font-['Cinzel']">{quest.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full border ${getDifficultyStyle(quest.difficulty)}`}>
                  {quest.difficulty}
                </span>
              </div>
              <p className="text-sm text-stone-300 mt-2 line-clamp-2">{quest.description}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-stone-300">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{quest.lessons?.length || 0} lessons</span>
                <span className="text-cyan-300">{quest.totalXP || 0} XP</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <QuestRoadmap
        quests={allQuests || []}
        completedQuestIds={userData?.completedQuestIds || []}
        onOpenQuest={onOpenQuest}
      />

      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="font-['Cinzel'] text-3xl text-amber-200">Discover Quests</h2>
          <div className="flex gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search quests or use #hashtags..."
                className="w-full bg-[#1b222a]/90 border border-stone-700 rounded-lg py-3 pl-10 pr-3 text-stone-100 placeholder-stone-500 focus:border-cyan-300/70 focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`px-4 py-3 border rounded-lg transition-all ${
                showFilters
                  ? "bg-amber-500/15 border-amber-400/40 text-amber-200"
                  : "bg-[#1b222a]/90 border-stone-700 text-stone-300 hover:text-cyan-200"
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mb-6 p-5 bg-[#1b222a]/90 border border-stone-700 rounded-xl grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs text-stone-300 mb-2 uppercase tracking-wider">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-2 rounded-lg text-xs border transition-all ${
                      selectedCategory === cat
                        ? "bg-amber-500/20 text-amber-200 border-amber-500/40"
                        : "bg-[#111315] text-stone-300 border-stone-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-stone-300 mb-2 uppercase tracking-wider">Difficulty</label>
              <div className="flex flex-wrap gap-2">
                {difficulties.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-3 py-2 rounded-lg text-xs border transition-all ${
                      selectedDifficulty === diff
                        ? "bg-cyan-500/20 text-cyan-200 border-cyan-500/40"
                        : "bg-[#111315] text-stone-300 border-stone-700"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {loadingQuests ? (
          <div className="text-center py-16 bg-[#1b222a]/90 border border-stone-700 rounded-xl text-stone-300">Loading quests...</div>
        ) : filteredQuests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuests.slice(0, 9).map((quest) => (
              <button
                key={quest._id || quest.id}
                onClick={() => onOpenQuest(quest)}
                className="text-left bg-[#1b222a]/85 border border-stone-700 rounded-xl p-5 hover:border-cyan-300/60 hover:-translate-y-1 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg text-stone-100 font-['Cinzel'] line-clamp-1">{quest.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full border ${getDifficultyStyle(quest.difficulty)}`}>
                    {quest.difficulty}
                  </span>
                </div>
                <p className="text-sm text-stone-300 mt-2 line-clamp-2">{quest.description}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-stone-300">
                  <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{quest.lessons?.length || 0} lessons</span>
                  <span className="text-yellow-400">{quest.avgRating || 0} <Star className="w-3 h-3 inline fill-yellow-400" /></span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#1b222a]/90 border border-stone-700 rounded-xl">
            <BookOpen className="w-16 h-16 text-stone-500 mx-auto mb-4" />
            <p className="font-['Cinzel'] text-xl text-stone-200">No quests found</p>
            <p className="text-stone-400 mt-2">Try adjusting your filters</p>
          </div>
        )}
      </section>

      <section className="mt-10 grid lg:grid-cols-2 gap-6 items-start">
        <div className="bg-[#1b222a]/90 border border-stone-700 rounded-xl p-5">
          <h3 className="text-xl text-amber-200 mb-4 font-['Cinzel']">Recent Activity</h3>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {(recentActivity || []).slice(0, 8).map((activity, idx) => (
              <div key={idx} className="p-3 bg-[#111315] border border-stone-700 rounded-lg flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-stone-100 truncate">{activity.questTitle}</p>
                  <p className="text-xs text-stone-500 truncate">{activity.completedAt}</p>
                </div>
                <p className="text-sm text-cyan-300 shrink-0">+{activity.xpEarned} XP</p>
              </div>
            ))}
            {(!recentActivity || recentActivity.length === 0) && (
              <p className="text-sm text-stone-500">No recent activity yet.</p>
            )}
          </div>
        </div>

        <LineTrendChart
          title="Learning Trend"
          subtitle="Daily XP gains. Click to open the full scrollable history."
          points={xpTrend}
          lineClassName="stroke-cyan-300"
          fillClassName="fill-cyan-500/10"
          emptyMessage="No recent activity yet."
          compactWindow={30}
        />

        <div className="bg-[#1b222a]/90 border border-stone-700 rounded-xl p-5 lg:col-span-2">
          <h3 className="text-xl text-cyan-200 mb-4 font-['Cinzel']">Purchased Quests</h3>
          {Array.isArray(purchasedQuests) && purchasedQuests.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
              {purchasedQuests.slice(0, 9).map((quest) => (
                <button
                  key={quest._id || quest.id}
                  onClick={() => onOpenQuest?.(quest)}
                  className="w-full text-left p-3 bg-[#111315] border border-stone-700 rounded-lg hover:border-cyan-400/40 transition-colors"
                >
                  <p className="text-sm text-stone-100 truncate">{quest.title}</p>
                  <p className="text-xs text-stone-400 mt-1">{quest.lessons?.length || 0} lessons</p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-400">You have not purchased any quests yet.</p>
          )}
        </div>
      </section>
    </main>
  );
}
