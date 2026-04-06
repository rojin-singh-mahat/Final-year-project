import { motion } from "framer-motion";
import { TrendingUp, Zap, Target, Clock, Award, Flame } from "lucide-react";

export default function ProgressPage({ userData, skills = {} }) {
  // Calculate some progress metrics
  const questCompletion = userData?.totalQuests > 0 
    ? Math.round((userData?.questsCompleted / userData?.totalQuests) * 100)
    : 0;

  const xpProgress = userData?.xpToNextLevel > 0
    ? Math.round((userData?.currentXP / userData?.xpToNextLevel) * 100)
    : 0;
  const estimatedStudyHours = Math.max(
    0,
    Math.round(((userData?.questsCompleted ?? 0) * 35) / 60)
  );

  const progressCards = [
    {
      label: "Quest Completion",
      value: `${questCompletion}%`,
      current: userData?.questsCompleted ?? 0,
      total: userData?.totalQuests ?? 0,
      icon: Target,
      gradient: "from-cyan-500 to-blue-500",
      color: "text-cyan-300",
      delay: 0.1,
    },
    {
      label: "XP to Next Level",
      value: `${xpProgress}%`,
      current: userData?.currentXP ?? 0,
      total: userData?.xpToNextLevel ?? 500,
      icon: Zap,
      gradient: "from-amber-500 to-orange-500",
      color: "text-amber-300",
      delay: 0.2,
    },
    {
      label: "Current Streak",
      value: `${userData?.streak ?? 0} days`,
      subtitle: "Keep the momentum going!",
      icon: Flame,
      gradient: "from-red-500 to-orange-500",
      color: "text-red-300",
      delay: 0.3,
    },
    {
      label: "Badges Earned",
      value: userData?.badgesEarned ?? 0,
      subtitle: `of ${userData?.badges?.length ?? 0} total`,
      icon: Award,
      gradient: "from-purple-500 to-pink-500",
      color: "text-purple-300",
      delay: 0.4,
    },
  ];

  return (
    <main className="ml-auto flex-1 pr-8 py-8 pl-0 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-['Cinzel'] text-4xl text-stone-100 mb-2">
          <span className="bg-gradient-to-r from-amber-200 via-amber-300 to-orange-500 bg-clip-text text-transparent">
            My Progress
          </span>
        </h1>
        <p className="text-stone-400">Track your learning journey and achievements</p>
      </motion.div>

      {/* Progress Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {progressCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: card.delay }}
            className="bg-[#1b222a]/90 border border-stone-700 rounded-2xl p-6 hover:border-cyan-300/50 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-sm text-stone-400 mb-1">{card.label}</div>
                <div className={`text-3xl font-['Cinzel'] font-bold ${card.color}`}>
                  {card.value}
                </div>
                {card.subtitle && (
                  <div className="text-xs text-stone-500 mt-1">{card.subtitle}</div>
                )}
                {card.current !== undefined && card.total !== undefined && (
                  <div className="text-xs text-stone-500 mt-1">
                    {card.current} / {card.total}
                  </div>
                )}
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} bg-opacity-20 flex items-center justify-center`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>

            {/* Progress Bar */}
            {card.current !== undefined && card.total !== undefined && (
              (() => {
                const safeTotal = Number(card.total) > 0 ? Number(card.total) : 1;
                const progress = Math.max(0, Math.min(100, (Number(card.current) / safeTotal) * 100));
                return (
              <div className="w-full bg-[#0f141a] rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`h-2 bg-gradient-to-r ${card.gradient} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, delay: card.delay + 0.2 }}
                />
              </div>
                );
              })()
            )}
          </motion.div>
        ))}
      </div>

      {/* Skills Progress Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-[#1b222a]/90 border border-stone-700 rounded-2xl p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-cyan-300" />
          <h2 className="font-['Cinzel'] text-2xl text-stone-100">Skill Development</h2>
        </div>

        {Object.entries(skills).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(skills).map(([skillName, progress], index) => (
              <motion.div
                key={skillName}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="font-['Cinzel'] text-lg text-stone-100">{skillName}</h3>
                    <p className="text-xs text-stone-500">Proficiency Level</p>
                  </div>
                  <div className="text-right">
                    <div className="font-['Cinzel'] text-2xl text-cyan-300">{progress}%</div>
                    <div className="text-xs text-stone-500">Complete</div>
                  </div>
                </div>

                {/* Skill Progress Bar */}
                <div className="w-full bg-[#0f141a] rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="h-3 bg-gradient-to-r from-cyan-500 to-cyan-300 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.2, delay: 0.7 + index * 0.1 }}
                  />
                </div>

                {/* Skill Level Indicator */}
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        level <= Math.ceil((progress / 20))
                          ? 'bg-gradient-to-r from-cyan-500 to-cyan-300'
                          : 'bg-stone-700'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-stone-500 mx-auto mb-4 opacity-50" />
            <p className="text-stone-400">Complete quests to unlock skill tracking</p>
          </div>
        )}
      </motion.div>

      {/* Weekly Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8 bg-gradient-to-br from-[#1b222a]/90 to-[#131820]/70 border border-stone-700 rounded-2xl p-8"
      >
        <h2 className="font-['Cinzel'] text-2xl text-stone-100 mb-6">Learning Statistics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0f141a]/50 rounded-xl p-4 border border-stone-700/50">
            <div className="text-sm text-stone-400 mb-2">Total Study Time</div>
            <div className="text-3xl font-['Cinzel'] text-cyan-300">{estimatedStudyHours}h</div>
            <div className="text-xs text-stone-500 mt-1">Estimated from completed quests</div>
          </div>

          <div className="bg-[#0f141a]/50 rounded-xl p-4 border border-stone-700/50">
            <div className="text-sm text-stone-400 mb-2">Quests Completed</div>
            <div className="text-3xl font-['Cinzel'] text-amber-300">{userData?.questsCompleted ?? 0}</div>
            <div className="text-xs text-stone-500 mt-1">Keep learning!</div>
          </div>

          <div className="bg-[#0f141a]/50 rounded-xl p-4 border border-stone-700/50">
            <div className="text-sm text-stone-400 mb-2">Current Level</div>
            <div className="text-3xl font-['Cinzel'] text-purple-300">{userData?.level ?? 1}</div>
            <div className="text-xs text-stone-500 mt-1">On your way to mastery</div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
