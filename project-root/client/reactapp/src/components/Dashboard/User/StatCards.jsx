import { motion } from "framer-motion";
import { React } from "react";
import { Zap, Target, TrendingUp, Award, Trophy } from "lucide-react";

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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#1a1a1a] border border-[#282828] rounded-lg p-6 hover:border-[#1DB954] hover:-translate-y-1 transition-all cursor-pointer group"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-[#1DB954]/20 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-[#1DB954]" />
          </div>
        </div>
        <div className="text-4xl text-white mb-2 group-hover:text-[#1DB954] transition-colors">
          {(userData?.totalXP ?? 0).toLocaleString()}
        </div>
        <div className="text-[#b3b3b3] text-sm mb-2">Total XP</div>
        <div className="text-[#1DB954] text-xs">+50 this week</div>
      </motion.div>

      {/* Quests Completed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#1a1a1a] border border-[#282828] rounded-lg p-6 hover:border-[#1DB954] hover:-translate-y-1 transition-all cursor-pointer"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-[#8b5cf6]/20 rounded-lg flex items-center justify-center">
            <Target className="w-6 h-6 text-[#8b5cf6]" />
          </div>
        </div>
        <div className="text-4xl text-white mb-2">
          {userData.questsCompleted}{" "}
          <span className="text-xl text-[#b3b3b3]">
            / {userData.totalQuests}
          </span>
        </div>
        <div className="text-[#b3b3b3] text-sm mb-3">Quests Completed</div>
        <div className="w-full bg-[#282828] rounded-full h-2">
          <div
            className="bg-[#1DB954] h-2 rounded-full transition-all duration-500"
            style={{ width: `${questsPercent}%` }}
          />
        </div>
      </motion.div>

      {/* Current Level */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#1a1a1a] border border-[#282828] rounded-lg p-6 hover:border-[#1DB954] hover:-translate-y-1 transition-all cursor-pointer"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-[#1DB954]/20 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-[#1DB954]" />
          </div>
        </div>
        <div className="text-4xl text-white mb-2">Level {userData.level}</div>
        <div className="text-[#b3b3b3] text-sm mb-3">Current Level</div>
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
      </motion.div>

      {/* Badges Earned */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#1a1a1a] border border-[#282828] rounded-lg p-6 hover:border-[#1DB954] hover:-translate-y-1 transition-all cursor-pointer"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-[#8b5cf6]/20 rounded-lg flex items-center justify-center">
            <Award className="w-6 h-6 text-[#8b5cf6]" />
          </div>
        </div>
        <div className="text-4xl text-white mb-2">{userData.badgesEarned}</div>
        <div className="text-[#b3b3b3] text-sm mb-3">Badges Earned</div>
        <div className="flex gap-1">
          {[...Array(userData.badgesEarned)].slice(0, 5).map((_, i) => (
            <div
              key={i}
              className="w-6 h-6 bg-gradient-to-br from-[#1DB954] to-[#8b5cf6] rounded-full flex items-center justify-center"
            >
              <Trophy className="w-3 h-3 text-black" />
            </div>
          ))}
          {userData.badgesEarned > 5 && (
            <div className="w-6 h-6 bg-[#282828] rounded-full flex items-center justify-center text-xs">
              +{userData.badgesEarned - 5}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
