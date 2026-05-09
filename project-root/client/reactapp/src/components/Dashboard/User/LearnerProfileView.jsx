import { motion } from "framer-motion";
import { ArrowLeft, Award, Flame, Trophy, TrendingUp, Zap, Lock } from "lucide-react";

const normalizeBadgeLabel = (badge) => {
  if (typeof badge === "string") return badge.trim();
  if (badge && typeof badge === "object") {
    const value = badge.name || badge.title || badge.label || badge.badgeName || "";
    return typeof value === "string" ? value.trim() : "";
  }
  return "";
};

export default function LearnerProfileView({ learnerData, onBack, isCurrentUser }) {
  if (!learnerData) {
    return (
      <main className="ml-auto flex-1 pr-8 py-8 pl-0 relative z-10">
        <div className="text-center py-20 text-stone-400">Learner profile not available.</div>
      </main>
    );
  }

  const badges = Array.isArray(learnerData.badges)
    ? learnerData.badges.map(normalizeBadgeLabel).filter(Boolean)
    : [];
  const selectedBadges = Array.isArray(learnerData.selectedBadges)
    ? learnerData.selectedBadges.map(normalizeBadgeLabel).filter(Boolean)
    : [];
  const showcased = selectedBadges.length > 0 ? selectedBadges : badges.slice(0, 3);

  return (
    <main className="ml-auto flex-1 pr-8 py-8 pl-0 relative z-10">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-28 -left-20 w-[26rem] h-[26rem] rounded-full bg-cyan-500/24 blur-3xl" />
        <div className="absolute -bottom-28 -right-16 w-[24rem] h-[24rem] rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.24]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(120,130,150,0.35) 1px, transparent 0)", backgroundSize: "26px 26px" }} />
      </div>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onBack}
        className="mb-6 px-4 py-2 rounded-lg border border-stone-700 bg-[#1b222a]/80 text-stone-300 hover:text-stone-100 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Leaderboard
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#1b222a]/95 to-[#131820]/90 border border-stone-700 rounded-3xl p-8 mb-8"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <img
            src={learnerData.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(learnerData.name || "Learner")}&background=06b6d4&color=fff&size=128`}
            alt={learnerData.name || "Learner"}
            className="w-28 h-28 rounded-full border-2 border-cyan-400/40"
          />
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2 flex-wrap">
              <h1 className="text-4xl font-['Cinzel'] text-stone-100">{learnerData.name || "Learner"}</h1>
              {isCurrentUser && (
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  You
                </span>
              )}
            </div>
            {learnerData.email ? (
              <p className="text-cyan-300 text-sm mb-1">{learnerData.email}</p>
            ) : null}
            <p className="text-stone-400 mb-4">View learner progress and showcased badges.</p>

            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {showcased.length > 0 ? showcased.map((badge) => (
                <div
                  key={badge}
                  className="px-3 py-1.5 rounded-full border border-cyan-400/40 bg-cyan-500/10 text-cyan-200 text-xs font-semibold"
                >
                  {badge}
                </div>
              )) : (
                <div className="text-sm text-stone-500">No badges showcased yet.</div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-[#1b222a]/90 border border-stone-700 rounded-2xl p-5">
          <div className="text-stone-500 text-xs mb-2">TOTAL XP</div>
          <div className="text-cyan-300 font-['Cinzel'] text-3xl">{(learnerData.xp || 0).toLocaleString()}</div>
          <div className="mt-2 flex items-center gap-2 text-stone-400 text-sm"><Zap className="w-4 h-4 text-cyan-300" />Experience</div>
        </div>

        <div className="bg-[#1b222a]/90 border border-stone-700 rounded-2xl p-5">
          <div className="text-stone-500 text-xs mb-2">CURRENT LEVEL</div>
          <div className="text-amber-300 font-['Cinzel'] text-3xl">{learnerData.level || 1}</div>
          <div className="mt-2 flex items-center gap-2 text-stone-400 text-sm"><TrendingUp className="w-4 h-4 text-amber-300" />Progression</div>
        </div>

        <div className="bg-[#1b222a]/90 border border-stone-700 rounded-2xl p-5">
          <div className="text-stone-500 text-xs mb-2">STREAK</div>
          <div className="text-red-300 font-['Cinzel'] text-3xl">{learnerData.streak || 0}</div>
          <div className="mt-2 flex items-center gap-2 text-stone-400 text-sm"><Flame className="w-4 h-4 text-red-300" />Days</div>
        </div>

        <div className="bg-[#1b222a]/90 border border-stone-700 rounded-2xl p-5">
          <div className="text-stone-500 text-xs mb-2">BADGES</div>
          <div className="text-emerald-300 font-['Cinzel'] text-3xl">{badges.length}</div>
          <div className="mt-2 flex items-center gap-2 text-stone-400 text-sm"><Award className="w-4 h-4 text-emerald-300" />Earned</div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-[#1b222a]/90 to-[#131820]/70 border border-stone-700 rounded-2xl p-8 mb-8"
      >
        <h2 className="text-2xl font-['Cinzel'] text-stone-100 mb-4 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-300" />
          Progress Snapshot
        </h2>
        <p className="text-stone-400 leading-relaxed">
          This learner has reached level {learnerData.level || 1} with {(learnerData.xp || 0).toLocaleString()} XP and a
          current streak of {learnerData.streak || 0} day(s). Keep checking the leaderboard to compare growth over time.
        </p>
      </motion.div>

      {/* Achievements Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-['Cinzel'] text-stone-100 mb-6 flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-300" />
          Achievements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { id: 1, name: "First Quest", description: "Complete your first quest", icon: "🚀", color: "from-blue-500 to-cyan-500", rarity: "common", unlocked: (learnerData?.questsCompleted || 0) >= 1 },
            { id: 2, name: "Quick Learner", description: "Complete 5 quests", icon: "⚡", color: "from-yellow-500 to-amber-500", rarity: "uncommon", unlocked: (learnerData?.questsCompleted || 0) >= 5 },
            { id: 3, name: "Quest Master", description: "Complete 10 quests", icon: "🧠", color: "from-purple-500 to-pink-500", rarity: "rare", unlocked: (learnerData?.questsCompleted || 0) >= 10 },
            { id: 4, name: "Streak Champion", description: "Maintain a 7-day streak", icon: "🔥", color: "from-red-500 to-orange-500", rarity: "epic", unlocked: (learnerData?.streak || 0) >= 7 },
            { id: 5, name: "Level 5", description: "Reach Level 5", icon: "⭐", color: "from-cyan-400 to-blue-500", rarity: "epic", unlocked: (learnerData?.level || 0) >= 5 },
            { id: 6, name: "Legendary Learner", description: "Reach Level 10", icon: "👑", color: "from-yellow-400 to-orange-500", rarity: "legendary", unlocked: (learnerData?.level || 0) >= 10 },
            { id: 7, name: "XP Hunter", description: "Earn 10,000 XP", icon: "💎", color: "from-green-500 to-emerald-500", rarity: "rare", unlocked: ((learnerData?.currentXP || 0) + (learnerData?.points || 0)) >= 10000 },
            { id: 8, name: "Badge Collector", description: "Earn 5 badges", icon: "🏆", color: "from-yellow-400 to-yellow-600", rarity: "uncommon", unlocked: (learnerData?.badges?.length || 0) >= 5 },
            { id: 9, name: "Marathon Runner", description: "Complete 25 quests", icon: "🏃", color: "from-pink-500 to-rose-500", rarity: "rare", unlocked: (learnerData?.questsCompleted || 0) >= 25 },
            { id: 10, name: "Elite Scholar", description: "Reach Level 15", icon: "📖", color: "from-indigo-500 to-purple-500", rarity: "epic", unlocked: (learnerData?.level || 0) >= 15 },
            { id: 11, name: "Knowledge Demigod", description: "Earn 50,000 XP", icon: "🎓", color: "from-teal-500 to-cyan-500", rarity: "legendary", unlocked: ((learnerData?.currentXP || 0) + (learnerData?.points || 0)) >= 50000 },
            { id: 12, name: "Daily Warrior", description: "Maintain a 30-day streak", icon: "⚔️", color: "from-orange-500 to-red-500", rarity: "epic", unlocked: (learnerData?.streak || 0) >= 30 },
            { id: 13, name: "Speed Learner", description: "Complete 5 quests in one day (Coming Soon)", icon: "⚡", color: "from-lime-400 to-green-500", rarity: "rare", unlocked: false },
            { id: 14, name: "Perfect Score", description: "Get 100% on 10 quizzes (Coming Soon)", icon: "💯", color: "from-yellow-300 to-amber-400", rarity: "uncommon", unlocked: false },
            { id: 15, name: "Feedback Contributor", description: "Share 5 pieces of feedback (Coming Soon)", icon: "💬", color: "from-violet-500 to-purple-500", rarity: "uncommon", unlocked: false },
            { id: 16, name: "Unstoppable", description: "Complete 50 quests", icon: "🚀", color: "from-red-600 to-orange-600", rarity: "legendary", unlocked: (learnerData?.questsCompleted || 0) >= 50 },
          ].map((achievement, index) => {
            const rarityColors = {
              common: "border-stone-500 bg-stone-500/10",
              uncommon: "border-green-500 bg-green-500/10",
              rare: "border-blue-500 bg-blue-500/10",
              epic: "border-purple-500 bg-purple-500/10",
              legendary: "border-yellow-500 bg-yellow-500/10",
            };

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + index * 0.03 }}
                className={`rounded-2xl p-6 border backdrop-blur-sm transition-all ${
                  achievement.unlocked
                    ? `${rarityColors[achievement.rarity]} shadow-lg`
                    : "border-stone-700/50 bg-stone-900/20 opacity-60"
                }`}
              >
                {/* Unlock Badge */}
                <div className="relative mb-4">
                  <div
                    className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl mx-auto transition-all ${
                      achievement.unlocked
                        ? `bg-gradient-to-br ${achievement.color} shadow-lg`
                        : "bg-stone-800/50"
                    }`}
                  >
                    {achievement.icon}
                  </div>
                  {!achievement.unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="w-6 h-6 text-stone-600" />
                    </div>
                  )}
                </div>

                {/* Achievement Info */}
                <h3 className="font-['Cinzel'] text-lg text-stone-100 text-center mb-1">
                  {achievement.name}
                </h3>
                <p className="text-sm text-stone-400 text-center mb-4">
                  {achievement.description}
                </p>

                {/* Rarity Badge */}
                <div className="flex justify-center">
                  <span
                    className={`text-xs uppercase tracking-wider font-bold py-1 px-3 rounded-full border ${
                      achievement.unlocked
                        ? `border-current text-current`
                        : "border-stone-600 text-stone-600"
                    }`}
                  >
                    {achievement.rarity}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </main>
  );
}
