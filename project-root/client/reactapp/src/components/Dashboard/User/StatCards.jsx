import { motion } from "framer-motion";
import { React } from "react";
import { Zap, Target, TrendingUp, Award, Trophy, Sparkles } from "lucide-react";

export default function StatsCards({ userData }) {
  const stats = [
    { label: "Level", value: userData.level },
    { label: "Total XP", value: userData.totalXP },
    { label: "Quests Completed", value: userData.completedQuests },
    { label: "Badges", value: userData?.badges?.length ?? 0},
  ];

  // Derived safe values to avoid division by zero
  const xpToNextSafe =
    userData &&
    typeof userData.xpToNextLevel === "number" &&
    userData.xpToNextLevel > 0
      ? userData.xpToNextLevel
      : 1;
  const xpPercent = Math.round(
    (((userData && userData.currentXP) || 0) / xpToNextSafe) * 100
  );
  const totalQuestsSafe =
    userData &&
    typeof userData.totalQuests === "number" &&
    userData.totalQuests > 0
      ? userData.totalQuests
      : 1;
  const questsPercent = Math.round(
    (((userData && userData.questsCompleted) || 0) / totalQuestsSafe) * 100
  );
  // For circular progress bars
  const circleR = 16;
  const circumference = 2 * Math.PI * circleR;
  const strokeDashoffset =
    circumference * (1 - userData.currentXP / xpToNextSafe);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total XP */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className="bg-gradient-to-br from-[#1a1a1a] to-[#121212] border border-[#282828] rounded-2xl p-6 hover:border-[#1DB954]/50 transition-all cursor-pointer group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#1DB954]/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#1DB954]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-[#1DB954]" />
            </div>
            <Sparkles className="w-5 h-5 text-[#1DB954] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-3xl mb-2 group-hover:text-[#1DB954] transition-colors">
            {(userData?.totalXP ?? 0).toLocaleString()}
          </div>
          <div className="text-sm text-[#b3b3b3]">Total XP</div>
        </div>
      </motion.div>

      {/* Quests Completed */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className="bg-gradient-to-br from-[#1a1a1a] to-[#121212] border border-[#282828] rounded-2xl p-6 hover:border-[#8b5cf6]/50 transition-all cursor-pointer group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b5cf6]/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#8b5cf6]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6 text-[#8b5cf6]" />
            </div>
            <TrendingUp className="w-5 h-5 text-[#8b5cf6] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-3xl mb-2 group-hover:text-[#8b5cf6] transition-colors">
            {userData.questsCompleted}{" "}
            <span className="text-xl text-[#b3b3b3]">
              / {userData.totalQuests}
            </span>
          </div>
          <div className="text-sm text-[#b3b3b3] mb-3">Quests Completed</div>
          <div className="w-full bg-[#282828] rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] h-2 rounded-full transition-all duration-500"
              style={{ width: `${questsPercent}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* Current Level */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className="bg-gradient-to-br from-[#1a1a1a] to-[#121212] border border-[#282828] rounded-2xl p-6 hover:border-[#1DB954]/50 transition-all cursor-pointer group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#1DB954]/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#1DB954]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-[#1DB954]" />
            </div>
            <Sparkles className="w-5 h-5 text-[#1DB954] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-3xl mb-2 group-hover:text-[#1DB954] transition-colors">Level {userData.level}</div>
          <div className="text-sm text-[#b3b3b3] mb-3">Current Level</div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 relative">
              <svg className="transform -rotate-90" width="40" height="40">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="#282828"
                  strokeWidth="3"
                  fill="none"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="#1DB954"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${circumference}`}
                  strokeDashoffset={`${strokeDashoffset}`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="text-xs text-[#b3b3b3]">
              {xpPercent}% to Level {userData.level + 1}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Badges Earned */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className="bg-gradient-to-br from-[#1a1a1a] to-[#121212] border border-[#282828] rounded-2xl p-6 hover:border-yellow-500/50 transition-all cursor-pointer group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6 text-yellow-500" />
            </div>
            <Trophy className="w-5 h-5 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-3xl mb-2 group-hover:text-yellow-500 transition-colors">{userData?.badgesEarned ?? 0}</div>
          <div className="text-sm text-[#b3b3b3] mb-3">Badges Earned</div>
          <div className="flex gap-1">
            {[...Array(Math.min(Math.max(0, userData?.badgesEarned ?? 0), 5))].map((_, i) => (
              <div
                key={i}
                className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center"
              >
                <Trophy className="w-3 h-3 text-black" />
              </div>
            ))}
            {(userData?.badgesEarned ?? 0) > 5 && (
              <div className="w-6 h-6 bg-[#282828] rounded-full flex items-center justify-center text-xs">
                +{(userData?.badgesEarned ?? 0) - 5}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
