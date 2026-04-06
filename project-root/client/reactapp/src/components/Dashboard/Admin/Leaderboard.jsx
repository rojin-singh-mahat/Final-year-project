import { React, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Flame, Zap, Medal, Award } from "lucide-react";
import { jwtDecode } from "jwt-decode";

const PLACEHOLDER_LEARNERS = [
  { id: "admin-placeholder-1", name: "Aarav Blaze", level: 9, streak: 18, xp: 12640, badges: ["Streak Champion", "Quick Learner"], selectedBadges: ["Streak Champion", "Quick Learner"] },
  { id: "admin-placeholder-2", name: "Mina Cipher", level: 8, streak: 14, xp: 10950, badges: ["Quiz Master", "Level 5"], selectedBadges: ["Quiz Master", "Level 5"] },
  { id: "admin-placeholder-3", name: "Kiran Nova", level: 7, streak: 11, xp: 9475, badges: ["Knowledge Seeker", "First Quest"], selectedBadges: ["Knowledge Seeker"] },
  { id: "admin-placeholder-4", name: "Rin Atlas", level: 6, streak: 9, xp: 8340, badges: ["First Quest"], selectedBadges: ["First Quest"] },
  { id: "admin-placeholder-5", name: "Sia Ember", level: 6, streak: 7, xp: 7680, badges: ["10 Quests", "Quick Learner"], selectedBadges: ["10 Quests"] },
  { id: "admin-placeholder-6", name: "Dev Orbit", level: 5, streak: 6, xp: 6450, badges: [], selectedBadges: [] },
];

const normalizeBadgeLabel = (badge) => {
  if (typeof badge === "string") return badge.trim();
  if (badge && typeof badge === "object") {
    const value = badge.name || badge.title || badge.label || badge.badgeName || "";
    return typeof value === "string" ? value.trim() : "";
  }
  return "";
};

const normalizeBadgeList = (badges) => {
  if (!Array.isArray(badges)) return [];
  return badges.map(normalizeBadgeLabel).filter(Boolean);
};

export default function Leaderboard({ onLearnerClick }) {
  const [sortBy, setSortBy] = useState("xp");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;
      const decoded = jwtDecode(token);
      setCurrentUserId(decoded?.id || null);
    } catch (err) {
      setCurrentUserId(null);
    }
  }, []);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/leaderboard?sortBy=${sortBy}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (res.ok) {
          setItems(Array.isArray(data.leaderboard) ? data.leaderboard : []);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [sortBy]);

  const getMedalIcon = (rank) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return null;
    }
  };

  const getSortValue = (user) => {
    if (sortBy === "streak") return user.streak || 0;
    if (sortBy === "level") return user.level || 0;
    return user.xp || 0;
  };

  const displayItems = (() => {
    let currentUserSelectedBadges = [];
    try {
      const saved = localStorage.getItem("profileBadgeShowcase");
      const parsed = saved ? JSON.parse(saved) : [];
      if (Array.isArray(parsed)) {
        currentUserSelectedBadges = parsed;
      }
    } catch (err) {
      currentUserSelectedBadges = [];
    }

    const normalizedReal = (Array.isArray(items) ? items : []).map((user, index) => {
      const normalizedBadges = normalizeBadgeList(user.badges);
      const normalizedSelected = normalizeBadgeList(user.selectedBadges);
      const isCurrent = String(user.id || user._id) === String(currentUserId);
      const localSelected = normalizeBadgeList(currentUserSelectedBadges);

      return {
        ...user,
        id: user.id || user._id || `real-${index}`,
        name: user.name || user.username || `Learner ${index + 1}`,
        xp: user.xp || 0,
        level: user.level || 1,
        streak: user.streak || 0,
        badges: normalizedBadges,
        selectedBadges: normalizedSelected.length > 0
          ? normalizedSelected.slice(0, 3)
          : (isCurrent
              ? localSelected.filter((badge) => normalizedBadges.includes(badge)).slice(0, 3)
              : normalizedBadges.slice(0, 3)),
        isPlaceholder: false,
      };
    });

    const existingIds = new Set(normalizedReal.map((u) => String(u.id)));
    const existingNames = new Set(normalizedReal.map((u) => String(u.name).toLowerCase()));

    const placeholderPool = PLACEHOLDER_LEARNERS.filter(
      (u) => !existingIds.has(String(u.id)) && !existingNames.has(String(u.name).toLowerCase())
    ).map((u) => ({ ...u, isPlaceholder: true }));

    const MIN_ROWS = 8;
    const merged = [...normalizedReal, ...placeholderPool.slice(0, Math.max(0, MIN_ROWS - normalizedReal.length))]
      .sort((a, b) => getSortValue(b) - getSortValue(a))
      .map((user, index) => ({ ...user, rank: index + 1 }));

    return merged;
  })();

  return (
    <main className="m-auto flex-1 pr-8 py-8 pl-0 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-['Cinzel'] mb-2 bg-gradient-to-r from-amber-200 via-amber-300 to-orange-500 bg-clip-text text-transparent">
          Leaderboard
        </h1>
        <p className="text-stone-400">Compete with learners worldwide</p>
      </motion.div>

      <div className="flex gap-3 mb-8 flex-wrap">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSortBy("xp")}
          className={`px-4 py-3 rounded-lg border transition-all flex items-center gap-2 font-['Cinzel'] font-bold ${
            sortBy === "xp"
              ? "border-cyan-300/70 bg-cyan-500/10 text-cyan-300"
              : "border-stone-700 text-stone-400 hover:text-stone-200 bg-[#1b222a]/90"
          }`}
        >
          <Zap className="w-4 h-4" />
          Highest XP
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSortBy("streak")}
          className={`px-4 py-3 rounded-lg border transition-all flex items-center gap-2 font-['Cinzel'] font-bold ${
            sortBy === "streak"
              ? "border-red-300/70 bg-red-500/10 text-red-300"
              : "border-stone-700 text-stone-400 hover:text-stone-200 bg-[#1b222a]/90"
          }`}
        >
          <Flame className="w-4 h-4" />
          Highest Streak
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSortBy("level")}
          className={`px-4 py-3 rounded-lg border transition-all flex items-center gap-2 font-['Cinzel'] font-bold ${
            sortBy === "level"
              ? "border-amber-300/70 bg-amber-500/10 text-amber-300"
              : "border-stone-700 text-stone-400 hover:text-stone-200 bg-[#1b222a]/90"
          }`}
        >
          <Trophy className="w-4 h-4" />
          Highest Level
        </motion.button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-stone-300">Loading leaderboard...</div>
      ) : displayItems.length > 0 ? (
        <div className="space-y-3">
          {displayItems.map((user, index) => {
            const isCurrentUser = String(user.id) === String(currentUserId);
            const medal = getMedalIcon(user.rank);

            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => onLearnerClick?.(user)}
                className={`rounded-2xl p-5 flex items-center gap-4 border transition-all backdrop-blur-sm ${
                  isCurrentUser
                    ? "bg-gradient-to-r from-amber-500/15 to-orange-500/10 border-amber-400/50 shadow-lg shadow-amber-500/20"
                    : "bg-[#1b222a]/90 border-stone-700 hover:border-cyan-300/40"
                } ${onLearnerClick ? "cursor-pointer" : ""}`}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#131820] to-[#0f141a] border border-stone-700 flex items-center justify-center text-lg font-bold flex-shrink-0">
                  {medal ? medal : <span className="text-stone-400 text-lg">{user.rank}</span>}
                </div>

                <img
                  src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=06b6d4&color=fff&size=64`}
                  alt={user.name}
                  className="w-12 h-12 rounded-full border-2 border-stone-700 flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-['Cinzel'] font-bold text-stone-100">{user.name}</span>
                    {user.isPlaceholder && (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                        Demo
                      </span>
                    )}
                    {isCurrentUser && (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                        You
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm flex-wrap">
                    <div className="flex items-center gap-1 text-stone-400">
                      <span className="text-xs">Level</span>
                      <span className="font-['Cinzel'] font-bold text-amber-300">{user.level}</span>
                    </div>
                    <div className="flex items-center gap-1 text-stone-400">
                      <Flame className="w-3 h-3 text-red-400" />
                      <span className="font-['Cinzel'] font-bold text-red-300">{user.streak}</span>
                    </div>
                    {Array.isArray(user.badges) && user.badges.length > 0 && (
                      <div className="flex items-center gap-1 text-stone-400">
                        <Award className="w-3 h-3 text-amber-300" />
                        <span className="font-['Cinzel'] font-bold text-amber-300">{user.badges.length}</span>
                      </div>
                    )}
                  </div>

                  {Array.isArray(user.selectedBadges) && user.selectedBadges.length > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      {user.selectedBadges.slice(0, 3).map((badge) => (
                        <span
                          key={`${user.id}-${badge}`}
                          className="text-[10px] px-2 py-0.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-200"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <motion.div
                  className="text-right flex-shrink-0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 + 0.1 }}
                >
                  <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-400/30 rounded-xl px-4 py-2">
                    <div className="text-xs text-stone-500 mb-1">Total XP</div>
                    <div className="font-['Cinzel'] font-bold text-cyan-300 text-lg">
                      {(user.xp || 0).toLocaleString()}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <Trophy className="w-16 h-16 text-stone-500 mx-auto mb-4 opacity-50" />
          <p className="text-stone-400">No leaderboard data available yet.</p>
        </div>
      )}

      {!loading && displayItems.length > 0 && displayItems.some(user => String(user.id) === String(currentUserId)) === false && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-400/30 rounded-2xl p-6 text-center"
        >
          <Medal className="w-8 h-8 text-amber-300 mx-auto mb-3" />
          <p className="text-stone-300 mb-2">Keep motivating learners from the top panel.</p>
          <p className="text-sm text-stone-500">Sort by XP, streak, or level to review progression trends.</p>
        </motion.div>
      )}
    </main>
  );
}
