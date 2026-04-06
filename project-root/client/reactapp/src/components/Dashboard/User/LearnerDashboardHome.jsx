import { useMemo, useState } from "react";
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
} from "lucide-react";
import QuestRoadmap from "./QuestRoadmap";

export default function LearnerDashboardHome({
  userData,
  allQuests,
  loadingQuests,
  skills,
  recentActivity,
  onOpenQuest,
  onOpenBrowse,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

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

  const getDifficultyStyle = (difficulty = "") => {
    const value = difficulty.toLowerCase();
    if (value === "beginner") return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    if (value === "intermediate") return "bg-amber-500/20 text-amber-300 border-amber-500/40";
    if (value === "advanced") return "bg-red-500/20 text-red-300 border-red-500/40";
    return "bg-stone-500/20 text-stone-300 border-stone-500/40";
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total XP", value: stats.totalXP, icon: Zap, tone: "text-cyan-300 border-cyan-500/40 bg-cyan-500/15" },
          { label: "Quests Completed", value: stats.questsCompleted, icon: Trophy, tone: "text-amber-300 border-amber-500/40 bg-amber-500/15" },
          { label: "Day Streak", value: stats.currentStreak, icon: TrendingUp, tone: "text-emerald-300 border-emerald-500/40 bg-emerald-500/15" },
          { label: "Badges", value: stats.achievements, icon: Award, tone: "text-purple-300 border-purple-500/40 bg-purple-500/15" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#1b222a]/85 border border-stone-700 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${stat.tone}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-['Cinzel'] text-2xl text-stone-100">{stat.value}</p>
                <p className="text-xs text-stone-300">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

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

      <section className="mt-10 grid lg:grid-cols-2 gap-6">
        <div className="bg-[#1b222a]/90 border border-stone-700 rounded-xl p-6">
          <h3 className="text-xl text-amber-200 mb-4 font-['Cinzel']">Recent Activity</h3>
          <div className="space-y-3">
            {(recentActivity || []).slice(0, 4).map((activity, idx) => (
              <div key={idx} className="p-3 bg-[#111315] border border-stone-700 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-100">{activity.questTitle}</p>
                  <p className="text-xs text-stone-500">{activity.completedAt}</p>
                </div>
                <p className="text-sm text-cyan-300">+{activity.xpEarned} XP</p>
              </div>
            ))}
            {(!recentActivity || recentActivity.length === 0) && (
              <p className="text-sm text-stone-500">No recent activity yet.</p>
            )}
          </div>
        </div>

        <div className="bg-[#1b222a]/90 border border-stone-700 rounded-xl p-6">
          <h3 className="text-xl text-amber-200 mb-4 font-['Cinzel']">Skill Progress</h3>
          <div className="space-y-4">
            {Object.entries(skills || {}).slice(0, 5).map(([skill, progress]) => (
              <div key={skill}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-stone-100">{skill}</span>
                  <span className="text-cyan-300">{progress}%</span>
                </div>
                <div className="w-full bg-[#0f141a] rounded-full h-2.5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-amber-400" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ))}
            {Object.keys(skills || {}).length === 0 && (
              <p className="text-sm text-stone-500">Complete lessons to start building your skill graph.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
