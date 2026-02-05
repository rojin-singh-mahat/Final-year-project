import { motion } from "framer-motion";
import { User, Trophy, Zap, TrendingUp, Calendar, Award, Flame, BookOpen } from "lucide-react";

export default function ProfilePage({ userData }) {
  const badgeIcons = {
    "Quick Learner": "⚡",
    "Quiz Master": "🧠",
    "Streak Champion": "🔥",
    "Level 5": "⭐",
    "First Quest": "🚀",
    "10 Quests": "🏆",
    "Knowledge Seeker": "📚",
    "Perfect Score": "💯",
  };

  // Get badges array from userData (it's stored as array of strings)
  const userBadges = Array.isArray(userData?.badges) ? userData.badges : [];

  const statCards = [
    {
      label: "Total XP",
      value: (userData?.totalXP ?? 0).toLocaleString(),
      icon: Zap,
      color: "from-[#1DB954] to-[#1ed760]",
      delay: 0.1,
    },
    {
      label: "Current Level",
      value: userData?.level ?? 1,
      icon: TrendingUp,
      color: "from-[#8b5cf6] to-[#a78bfa]",
      delay: 0.2,
    },
    {
      label: "Quests Completed",
      value: userData?.questsCompleted ?? 0,
      icon: Trophy,
      color: "from-yellow-500 to-orange-500",
      delay: 0.3,
    },
    {
      label: "Day Streak",
      value: userData?.streak ?? 0,
      icon: Flame,
      color: "from-red-500 to-orange-500",
      delay: 0.4,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-6 pb-20">
      {/* Header Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#181818] to-[#121212] border border-[#282828] rounded-3xl p-8 mb-8 max-w-4xl mx-auto"
      >
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-[#1DB954] to-[#8b5cf6] rounded-full p-1">
              <img
                src={
                  userData?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    userData?.username || "User"
                  )}&background=1DB954&color=fff&size=128`
                }
                alt={userData?.username}
                className="w-full h-full rounded-full border-4 border-[#0f0f0f]"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-xl shadow-lg">
              ⭐
            </div>
          </motion.div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold text-white mb-2"
            >
              {userData?.username || "User"}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-[#b3b3b3] mb-4"
            >
              {userData?.email || "No email"}
            </motion.p>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-[#1a1a1a] rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-[#1DB954]">
                  Level {userData?.level ?? 1}
                </div>
                <div className="text-xs text-[#808080]">Current Level</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-[#8b5cf6]">
                  {userData?.badgesEarned ?? 0}
                </div>
                <div className="text-xs text-[#808080]">Badges</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-yellow-500">
                  🔥 {userData?.streak ?? 0}
                </div>
                <div className="text-xs text-[#808080]">Streak</div>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[#808080]">
                  XP to Level {(userData?.level ?? 1) + 1}
                </span>
                <span className="text-sm text-[#1DB954] font-bold">
                  {userData?.currentXP ?? 0} / {userData?.xpToNextLevel ?? 500}
                </span>
              </div>
              <div className="w-full bg-[#282828] rounded-full h-3 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-[#1DB954] to-[#1ed760] h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(100, ((userData?.currentXP ?? 0) / (userData?.xpToNextLevel ?? 500)) * 100)}%`,
                  }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 max-w-6xl mx-auto">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay }}
              className="group"
            >
              <div className="bg-gradient-to-br from-[#181818] to-[#121212] border border-[#282828] rounded-2xl p-6 hover:border-[#1DB954]/50 transition-all hover:-translate-y-1 cursor-pointer h-full">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6 text-black" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-white mb-2 group-hover:text-[#1DB954] transition-colors">
                  {stat.value}
                </div>
                <div className="text-[#b3b3b3] text-sm">{stat.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Badges Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-8 h-8 text-[#8b5cf6]" />
          <h2 className="text-3xl font-bold text-white">Achievements</h2>
          <span className="ml-auto text-[#b3b3b3]">
            {userBadges.length} / {Object.keys(badgeIcons).length}
          </span>
        </div>

        {userBadges.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {userBadges.map((badge, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + idx * 0.05 }}
                className="group"
              >
                <div className="relative bg-gradient-to-br from-[#1a1a1a] to-[#121212] border-2 border-[#8b5cf6]/50 rounded-2xl p-6 flex flex-col items-center justify-center aspect-square hover:border-[#8b5cf6] transition-all hover:scale-105 hover:-translate-y-1 cursor-pointer">
                  <div className="text-5xl mb-2 group-hover:scale-125 transition-transform">
                    {badgeIcons[badge] || "🏅"}
                  </div>
                  <div className="text-xs font-bold text-center text-[#8b5cf6] group-hover:text-[#c4b5fd] transition-colors">
                    {badge}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}

            {/* Empty Badge Slots */}
            {Object.keys(badgeIcons).map((badge, idx) => {
              if (!userBadges.includes(badge)) {
                return (
                  <motion.div
                    key={`empty-${idx}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + (userBadges.length + idx) * 0.05 }}
                  >
                    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#121212] border-2 border-[#282828]/50 rounded-2xl p-6 flex flex-col items-center justify-center aspect-square opacity-50">
                      <div className="text-5xl mb-2">🔒</div>
                      <div className="text-xs font-bold text-center text-[#808080]">
                        Locked
                      </div>
                    </div>
                  </motion.div>
                );
              }
              return null;
            })}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-[#181818] to-[#121212] border border-[#282828] rounded-2xl p-12 text-center">
            <Award className="w-16 h-16 text-[#808080] mx-auto mb-4 opacity-50" />
            <p className="text-[#b3b3b3] text-lg">
              Complete quests to earn badges and achievements!
            </p>
          </div>
        )}
      </motion.div>

      {/* Recent Activity Section */}
      {userData?.recentActivity && userData.recentActivity.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-6xl mx-auto mt-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-8 h-8 text-[#1DB954]" />
            <h2 className="text-3xl font-bold text-white">Recent Activity</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userData.recentActivity.slice(0, 6).map((activity, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + idx * 0.05 }}
                className="bg-gradient-to-br from-[#181818] to-[#121212] border border-[#282828] rounded-xl p-4 hover:border-[#1DB954]/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#1DB954]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-[#1DB954]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold mb-1">
                      {activity.questTitle}
                    </div>
                    <div className="text-xs text-[#808080]">
                      {new Date(activity.completedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#1DB954] font-bold">
                      +{activity.xpEarned} XP
                    </div>
                    {activity.badgeEarned && (
                      <div className="text-xs text-[#8b5cf6]">🏅 Badge</div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Stats Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="max-w-6xl mx-auto mt-8 bg-gradient-to-br from-[#181818] to-[#121212] border border-[#282828] rounded-2xl p-8"
      >
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-[#1DB954]" />
          Journey Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-[#1a1a1a] rounded-xl border border-[#282828]">
            <div className="text-[#1DB954] text-sm font-bold mb-2">TOTAL XP EARNED</div>
            <div className="text-3xl font-bold text-white">
              {(userData?.totalXP ?? 0).toLocaleString()}
            </div>
            <div className="text-xs text-[#808080] mt-2">
              +{userData?.points ?? 0} points this session
            </div>
          </div>

          <div className="p-4 bg-[#1a1a1a] rounded-xl border border-[#282828]">
            <div className="text-[#8b5cf6] text-sm font-bold mb-2">QUESTS COMPLETED</div>
            <div className="text-3xl font-bold text-white">
              {userData?.questsCompleted ?? 0} / {userData?.totalQuests ?? 0}
            </div>
            <div className="text-xs text-[#808080] mt-2">
              {Math.round(((userData?.questsCompleted ?? 0) / (userData?.totalQuests ?? 10)) * 100)}%
              complete
            </div>
          </div>

          <div className="p-4 bg-[#1a1a1a] rounded-xl border border-[#282828]">
            <div className="text-yellow-500 text-sm font-bold mb-2">CURRENT STREAK</div>
            <div className="text-3xl font-bold text-white">🔥 {userData?.streak ?? 0}</div>
            <div className="text-xs text-[#808080] mt-2">
              Keep learning to maintain your streak!
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
