import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Brain,
  CheckCircle2,
  Clock3,
  Flame,
  Sparkles,
  Target,
  Trophy,
  TrendingUp,
  Zap,
  Award,
  BookOpen,
  ShieldCheck,
  Star,
  Crown,
  Rocket,
  Medal,
  Diamond,
  BadgeCheck,
} from "lucide-react";
import LineTrendChart from "./LineTrendChart";

const clampPercent = (value) => Math.max(0, Math.min(100, Number(value) || 0));

const Bar = ({ label, value, max = 100, color = "from-cyan-500 to-blue-400" }) => {
  const percent = clampPercent((Number(value) / Math.max(Number(max) || 1, 1)) * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-2 text-sm">
        <span className="text-stone-300">{label}</span>
        <span className="text-stone-500">{Math.round(percent)}%</span>
      </div>
      <div className="h-3 rounded-full bg-[#0b0f14] border border-stone-700 overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </div>
  );
};

const TabButton = ({ active, icon: Icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border transition-all ${
      active
        ? "bg-amber-500 text-[#0f141a] border-amber-300"
        : "bg-[#0f141a] text-stone-300 border-stone-700 hover:border-stone-500"
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

export default function ProgressPage({ userData, skills = {} }) {
  const [tab, setTab] = useState("overview");

  const questCompletion = userData?.totalQuests > 0
    ? Math.round((userData?.questsCompleted / userData?.totalQuests) * 100)
    : 0;

  const xpProgress = userData?.xpToNextLevel > 0
    ? Math.round((userData?.currentXP / userData?.xpToNextLevel) * 100)
    : 0;

  const estimatedStudyHours = Math.max(0, Math.round(((userData?.questsCompleted ?? 0) * 35) / 60));

  const tabs = useMemo(() => ([
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "xp", label: "XP", icon: Zap },
    { id: "quests", label: "Quests", icon: Target },
    { id: "streak", label: "Streak", icon: Flame },
    { id: "stats", label: "Stats", icon: Sparkles },
  ]), []);

  const analyticsTrend = [
    { label: "Quests", value: questCompletion },
    { label: "XP", value: xpProgress },
    { label: "Streak", value: Math.min(100, ((userData?.streak ?? 0) / 30) * 100) },
    { label: "Badges", value: Math.min(100, ((userData?.badgesEarned ?? 0) / 10) * 100) },
  ];

  const achievements = [
    { name: "First Quest", icon: Rocket, unlocked: (userData?.questsCompleted || 0) >= 1 },
    { name: "Quick Learner", icon: Zap, unlocked: (userData?.questsCompleted || 0) >= 5 },
    { name: "Quest Master", icon: Brain, unlocked: (userData?.questsCompleted || 0) >= 10 },
    { name: "Streak Champion", icon: Flame, unlocked: (userData?.streak || 0) >= 7 },
    { name: "Level 5", icon: Star, unlocked: (userData?.level || 0) >= 5 },
    { name: "Legendary Learner", icon: Crown, unlocked: (userData?.level || 0) >= 10 },
    { name: "XP Hunter", icon: Diamond, unlocked: ((userData?.currentXP || 0) + (userData?.points || 0)) >= 10000 },
    { name: "Badge Collector", icon: Medal, unlocked: (userData?.badges?.length || 0) >= 5 },
    { name: "Marathon Runner", icon: Medal, unlocked: (userData?.questsCompleted || 0) >= 25 },
    { name: "Elite Scholar", icon: BookOpen, unlocked: (userData?.level || 0) >= 15 },
    { name: "Knowledge Demigod", icon: ShieldCheck, unlocked: ((userData?.currentXP || 0) + (userData?.points || 0)) >= 50000 },
    { name: "Daily Warrior", icon: Award, unlocked: (userData?.streak || 0) >= 30 },
    { name: "Speed Learner", icon: Clock3, unlocked: false },
    { name: "Perfect Score", icon: BadgeCheck, unlocked: false },
    { name: "Feedback Contributor", icon: CheckCircle2, unlocked: false },
    { name: "Unstoppable", icon: Trophy, unlocked: (userData?.questsCompleted || 0) >= 50 },
  ];

  return (
    <main className="ml-auto flex-1 pr-8 py-8 pl-0 relative z-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-['Cinzel'] text-4xl text-stone-100 mb-2">
          <span className="bg-gradient-to-r from-amber-200 via-amber-300 to-orange-500 bg-clip-text text-transparent">My Progress</span>
        </h1>
        <p className="text-stone-400">Track your learning journey and achievements</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {[
          { label: "Quest Completion", value: `${questCompletion}%`, current: userData?.questsCompleted ?? 0, total: userData?.totalQuests ?? 0, icon: Target, color: "text-cyan-300", gradient: "from-cyan-500 to-blue-500", delay: 0.1 },
          { label: "XP to Next Level", value: `${xpProgress}%`, current: userData?.currentXP ?? 0, total: userData?.xpToNextLevel ?? 500, icon: Zap, color: "text-amber-300", gradient: "from-amber-500 to-orange-500", delay: 0.2 },
          { label: "Current Streak", value: `${userData?.streak ?? 0} days`, current: userData?.streak ?? 0, total: Math.max(userData?.streak ?? 0, 7), icon: Flame, color: "text-red-300", gradient: "from-red-500 to-orange-500", delay: 0.3 },
          { label: "Badges Earned", value: userData?.badgesEarned ?? 0, current: userData?.badgesEarned ?? 0, total: Math.max(userData?.badges?.length ?? 0, 1), icon: Award, color: "text-purple-300", gradient: "from-purple-500 to-pink-500", delay: 0.4 },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: card.delay }}
              className="bg-[#131820] border border-stone-700 rounded-2xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-sm text-stone-400 mb-1">{card.label}</div>
                  <div className={`text-3xl font-['Cinzel'] font-bold ${card.color}`}>{card.value}</div>
                  <div className="text-xs text-stone-500 mt-1">{card.current} / {card.total}</div>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-[#0f141a]" />
                </div>
              </div>
              <Bar label={card.label} value={card.current} max={card.total} color={card.gradient} />
            </motion.div>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-[#131820] border border-stone-700 rounded-2xl p-8">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-cyan-300" />
            <h2 className="font-['Cinzel'] text-2xl text-stone-100">Journey Summary</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {tabs.map((item) => (
              <TabButton key={item.id} active={tab === item.id} icon={item.icon} label={item.label} onClick={() => setTab(item.id)} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {tab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-[#0f141a] rounded-[10px] border border-stone-700">
                <div className="text-cyan-300 text-sm font-bold mb-2">TOTAL XP EARNED</div>
                <div className="text-3xl font-['Cinzel'] font-bold text-stone-100">{(userData?.totalXP ?? 0).toLocaleString()}</div>
                <div className="text-xs text-stone-500 mt-2">+{userData?.points ?? 0} points this session</div>
              </div>
              <div className="p-4 bg-[#0f141a] rounded-[10px] border border-stone-700">
                <div className="text-amber-300 text-sm font-bold mb-2">QUESTS COMPLETED</div>
                <div className="text-3xl font-['Cinzel'] font-bold text-stone-100">{userData?.questsCompleted ?? 0} / {userData?.totalQuests ?? 0}</div>
                <div className="text-xs text-stone-500 mt-2">{questCompletion}% complete</div>
              </div>
              <div className="p-4 bg-[#0f141a] rounded-[10px] border border-stone-700">
                <div className="text-red-300 text-sm font-bold mb-2">CURRENT STREAK</div>
                <div className="text-3xl font-['Cinzel'] font-bold text-stone-100">{userData?.streak ?? 0} days</div>
                <div className="text-xs text-stone-500 mt-2">Keep learning to maintain your streak!</div>
              </div>
            </motion.div>
          )}

          {tab === "xp" && (
            <motion.div key="xp" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
              <Bar label="XP to next level" value={userData?.currentXP ?? 0} max={userData?.xpToNextLevel ?? 500} color="from-cyan-500 to-blue-400" />
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#0f141a] rounded-[10px] border border-stone-700"><div className="text-stone-500 text-xs mb-2">TOTAL XP</div><div className="text-2xl font-['Cinzel'] text-stone-100">{(userData?.totalXP ?? 0).toLocaleString()}</div></div>
                <div className="p-4 bg-[#0f141a] rounded-[10px] border border-stone-700"><div className="text-stone-500 text-xs mb-2">LEVEL</div><div className="text-2xl font-['Cinzel'] text-stone-100">{userData?.level ?? 1}</div></div>
              </div>
            </motion.div>
          )}

          {tab === "quests" && (
            <motion.div key="quests" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
              <Bar label="Quest completion" value={userData?.questsCompleted ?? 0} max={userData?.totalQuests ?? 1} color="from-amber-500 to-orange-400" />
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#0f141a] rounded-[10px] border border-stone-700"><div className="text-stone-500 text-xs mb-2">QUESTS COMPLETED</div><div className="text-2xl font-['Cinzel'] text-stone-100">{userData?.questsCompleted ?? 0}</div></div>
                <div className="p-4 bg-[#0f141a] rounded-[10px] border border-stone-700"><div className="text-stone-500 text-xs mb-2">TOTAL QUESTS</div><div className="text-2xl font-['Cinzel'] text-stone-100">{userData?.totalQuests ?? 0}</div></div>
              </div>
            </motion.div>
          )}

          {tab === "streak" && (
            <motion.div key="streak" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
              <Bar label="Streak momentum" value={userData?.streak ?? 0} max={Math.max(userData?.streak ?? 0, 30)} color="from-red-500 to-orange-500" />
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#0f141a] rounded-[10px] border border-stone-700"><div className="text-stone-500 text-xs mb-2">CURRENT STREAK</div><div className="text-2xl font-['Cinzel'] text-stone-100">{userData?.streak ?? 0}</div></div>
                <div className="p-4 bg-[#0f141a] rounded-[10px] border border-stone-700"><div className="text-stone-500 text-xs mb-2">BEST CONSISTENCY</div><div className="text-2xl font-['Cinzel'] text-stone-100">Stay active daily</div></div>
              </div>
            </motion.div>
          )}

          {tab === "stats" && (
            <motion.div key="stats" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
              <LineTrendChart
                title="Progress Trend"
                subtitle="A line graph of your current learning momentum across core metrics."
                points={analyticsTrend}
                lineClassName="stroke-amber-300"
                fillClassName="fill-amber-500/10"
                emptyMessage="No analytics yet."
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-[#0f141a] rounded-[10px] border border-stone-700">
                  <div className="text-sm text-stone-400 mb-2">Total Study Time</div>
                  <div className="text-3xl font-['Cinzel'] text-cyan-300">{estimatedStudyHours}h</div>
                </div>
                <div className="p-4 bg-[#0f141a] rounded-[10px] border border-stone-700">
                  <div className="text-sm text-stone-400 mb-2">Quests Completed</div>
                  <div className="text-3xl font-['Cinzel'] text-amber-300">{userData?.questsCompleted ?? 0}</div>
                </div>
                <div className="p-4 bg-[#0f141a] rounded-[10px] border border-stone-700">
                  <div className="text-sm text-stone-400 mb-2">Current Level</div>
                  <div className="text-3xl font-['Cinzel'] text-purple-300">{userData?.level ?? 1}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}