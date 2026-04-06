import { motion } from "framer-motion";
import { Trophy, Award, Zap, Flame, BookOpen, Target, Star, Crown, Lock } from "lucide-react";

export default function AchievementsPage({ userData = {} }) {
  // Define all possible achievements
  const achievements = [
    {
      id: 1,
      name: "First Quest",
      description: "Complete your first quest",
      icon: "🚀",
      color: "from-blue-500 to-cyan-500",
      unlock: {
        condition: userData?.questsCompleted >= 1,
        progress: userData?.questsCompleted ?? 0,
        target: 1,
      },
      rarity: "common",
    },
    {
      id: 2,
      name: "Quick Learner",
      description: "Complete 5 quests",
      icon: "⚡",
      color: "from-yellow-500 to-amber-500",
      unlock: {
        condition: userData?.questsCompleted >= 5,
        progress: userData?.questsCompleted ?? 0,
        target: 5,
      },
      rarity: "uncommon",
    },
    {
      id: 3,
      name: "Quest Master",
      description: "Complete 10 quests",
      icon: "🧠",
      color: "from-purple-500 to-pink-500",
      unlock: {
        condition: userData?.questsCompleted >= 10,
        progress: userData?.questsCompleted ?? 0,
        target: 10,
      },
      rarity: "rare",
    },
    {
      id: 4,
      name: "Streak Champion",
      description: "Maintain a 7-day streak",
      icon: "🔥",
      color: "from-red-500 to-orange-500",
      unlock: {
        condition: userData?.streak >= 7,
        progress: userData?.streak ?? 0,
        target: 7,
      },
      rarity: "epic",
    },
    {
      id: 5,
      name: "Level 5",
      description: "Reach Level 5",
      icon: "⭐",
      color: "from-cyan-400 to-blue-500",
      unlock: {
        condition: userData?.level >= 5,
        progress: userData?.level ?? 1,
        target: 5,
      },
      rarity: "epic",
    },
    {
      id: 6,
      name: "Legendary Learner",
      description: "Reach Level 10",
      icon: "👑",
      color: "from-yellow-400 to-orange-500",
      unlock: {
        condition: userData?.level >= 10,
        progress: userData?.level ?? 1,
        target: 10,
      },
      rarity: "legendary",
    },
    {
      id: 7,
      name: "XP Hunter",
      description: "Earn 10,000 XP",
      icon: "💎",
      color: "from-green-500 to-emerald-500",
      unlock: {
        condition: (userData?.currentXP ?? 0) + (userData?.points ?? 0) >= 10000,
        progress: (userData?.currentXP ?? 0) + (userData?.points ?? 0),
        target: 10000,
      },
      rarity: "rare",
    },
    {
      id: 8,
      name: "Badge Collector",
      description: "Earn 5 badges",
      icon: "🏆",
      color: "from-yellow-400 to-yellow-600",
      unlock: {
        condition: (userData?.badges?.length ?? 0) >= 5,
        progress: userData?.badges?.length ?? 0,
        target: 5,
      },
      rarity: "uncommon",
    },
    {
      id: 9,
      name: "Marathon Runner",
      description: "Complete 25 quests",
      icon: "🏃",
      color: "from-pink-500 to-rose-500",
      unlock: {
        condition: userData?.questsCompleted >= 25,
        progress: userData?.questsCompleted ?? 0,
        target: 25,
      },
      rarity: "rare",
    },
    {
      id: 10,
      name: "Elite Scholar",
      description: "Reach Level 15",
      icon: "📖",
      color: "from-indigo-500 to-purple-500",
      unlock: {
        condition: userData?.level >= 15,
        progress: userData?.level ?? 1,
        target: 15,
      },
      rarity: "epic",
    },
    {
      id: 11,
      name: "Knowledge Demigod",
      description: "Earn 50,000 XP",
      icon: "🎓",
      color: "from-teal-500 to-cyan-500",
      unlock: {
        condition: (userData?.currentXP ?? 0) + (userData?.points ?? 0) >= 50000,
        progress: (userData?.currentXP ?? 0) + (userData?.points ?? 0),
        target: 50000,
      },
      rarity: "legendary",
    },
    {
      id: 12,
      name: "Daily Warrior",
      description: "Maintain a 30-day streak",
      icon: "⚔️",
      color: "from-orange-500 to-red-500",
      unlock: {
        condition: userData?.streak >= 30,
        progress: userData?.streak ?? 0,
        target: 30,
      },
      rarity: "epic",
    },
    {
      id: 13,
      name: "Speed Learner",
      description: "Complete 5 quests in one day (Coming Soon)",
      icon: "⚡",
      color: "from-lime-400 to-green-500",
      unlock: {
        condition: false,
        progress: 0,
        target: 5,
      },
      rarity: "rare",
    },
    {
      id: 14,
      name: "Perfect Score",
      description: "Get 100% on 10 quizzes (Coming Soon)",
      icon: "💯",
      color: "from-yellow-300 to-amber-400",
      unlock: {
        condition: false,
        progress: 0,
        target: 10,
      },
      rarity: "uncommon",
    },
    {
      id: 15,
      name: "Feedback Contributor",
      description: "Share 5 pieces of feedback (Coming Soon)",
      icon: "💬",
      color: "from-violet-500 to-purple-500",
      unlock: {
        condition: false,
        progress: 0,
        target: 5,
      },
      rarity: "uncommon",
    },
    {
      id: 16,
      name: "Unstoppable",
      description: "Complete 50 quests",
      icon: "🚀",
      color: "from-red-600 to-orange-600",
      unlock: {
        condition: userData?.questsCompleted >= 50,
        progress: userData?.questsCompleted ?? 0,
        target: 50,
      },
      rarity: "legendary",
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlock.condition).length;
  const totalAchievements = achievements.length;
  const completionPercent = Math.round((unlockedCount / totalAchievements) * 100);

  const rarityColors = {
    common: "border-stone-500 bg-stone-500/10",
    uncommon: "border-green-500 bg-green-500/10",
    rare: "border-blue-500 bg-blue-500/10",
    epic: "border-purple-500 bg-purple-500/10",
    legendary: "border-yellow-500 bg-yellow-500/10",
  };

  return (
    <main className="ml-auto flex-1 pr-8 py-8 pl-0 relative z-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-['Cinzel'] text-4xl text-stone-100 mb-2">
          <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-orange-500 bg-clip-text text-transparent">
            Achievements
          </span>
        </h1>
        <p className="text-stone-400">Unlock badges and earn prestigious titles</p>
      </motion.div>

      {/* Completion Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-[#1b222a]/90 to-[#131820]/70 border border-stone-700 rounded-2xl p-8 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-['Cinzel'] text-2xl text-stone-100 mb-2">Achievement Progress</h2>
            <p className="text-stone-400">
              {unlockedCount} of {totalAchievements} achievements unlocked
            </p>
          </div>
          <div className="text-right">
            <div className="font-['Cinzel'] text-4xl text-amber-300">{completionPercent}%</div>
            <div className="text-sm text-stone-400">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#0f141a] rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-3 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercent}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </motion.div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + index * 0.05 }}
            className={`rounded-2xl p-6 border backdrop-blur-sm transition-all ${
              achievement.unlock.condition
                ? `${rarityColors[achievement.rarity]} shadow-lg shadow-${achievement.color.split(' ')[0]}`
                : "border-stone-700/50 bg-stone-900/20 opacity-60"
            }`}
          >
            {/* Unlock Badge */}
            <div className="relative mb-4">
              <div
                className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl mx-auto transition-all ${
                  achievement.unlock.condition
                    ? `bg-gradient-to-br ${achievement.color} shadow-lg`
                    : "bg-stone-800/50"
                }`}
              >
                {achievement.icon}
              </div>
              {!achievement.unlock.condition && (
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

            {/* Progress Indicator */}
            {!achievement.unlock.condition && (
              <>
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-stone-500 mb-1">
                    <span>Progress</span>
                    <span>
                      {achievement.unlock.progress} / {achievement.unlock.target}
                    </span>
                  </div>
                  <div className="w-full bg-stone-800/50 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (achievement.unlock.progress / achievement.unlock.target) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Rarity Badge */}
            <div className="flex justify-center">
              <span
                className={`text-xs uppercase tracking-wider font-bold py-1 px-3 rounded-full border ${
                  achievement.unlock.condition
                    ? `border-${achievement.color.split(' ')[1]} text-${achievement.color.split(' ')[1]}`
                    : "border-stone-600 text-stone-600"
                }`}
              >
                {achievement.rarity}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Special Note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-12 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-6 text-center"
      >
        <Trophy className="w-8 h-8 text-amber-300 mx-auto mb-3" />
        <h3 className="font-['Cinzel'] text-lg text-amber-200 mb-2">Hidden Achievements</h3>
        <p className="text-sm text-stone-400">
          Complete special challenges and quests to unlock secret achievements. Keep grinding!
        </p>
      </motion.div>
    </main>
  );
}
