import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  BarChart3,
  CheckCircle2,
  Clock3,
  Flame,
  Sparkles,
  Target,
  Trophy,
  TrendingUp,
  Zap,
} from "lucide-react";
import LineTrendChart from "./LineTrendChart";

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const statusMeta = {
  completed: { label: "Completed", className: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30", icon: CheckCircle2 },
  "in-progress": { label: "In progress", className: "bg-cyan-500/15 text-cyan-300 border-cyan-400/30", icon: Clock3 },
  "not-started": { label: "Not started", className: "bg-stone-700/40 text-stone-300 border-stone-600/40", icon: Target },
};

const GraphCard = ({ title, subtitle, children, icon: Icon }) => (
  <div className="bg-[#131820] border border-stone-700 rounded-3xl p-6">
    <div className="flex items-center justify-between gap-3 mb-5">
      <div>
        <h3 className="text-xl font-['Cinzel'] text-stone-100 flex items-center gap-2">
          {Icon ? <Icon className="w-5 h-5 text-amber-300" /> : null}
          {title}
        </h3>
        {subtitle ? <p className="text-xs text-stone-500 mt-1">{subtitle}</p> : null}
      </div>
    </div>
    {children}
  </div>
);

const Bar = ({ value, max = 100, colorClass = "bg-cyan-400", label }) => {
  const percent = Math.max(0, Math.min(100, (toNumber(value, 0) / Math.max(max, 1)) * 100));
  return (
    <div>
      <div className="flex items-center justify-between mb-2 text-sm">
        <span className="text-stone-300">{label}</span>
        <span className="text-stone-500">{Math.round(percent)}%</span>
      </div>
      <div className="h-3 rounded-full bg-[#0f141a] border border-stone-700 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </div>
  );
};

export default function LearnerProfileView({ learnerData, onBack, isCurrentUser }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const learnerId = learnerData?.id || learnerData?._id;
  const badges = useMemo(() => (Array.isArray(learnerData?.badges) ? learnerData.badges : []), [learnerData?.badges]);
  const selectedBadges = useMemo(() => (Array.isArray(learnerData?.selectedBadges) ? learnerData.selectedBadges : []), [learnerData?.selectedBadges]);
  const showcased = selectedBadges.length > 0 ? selectedBadges : badges.slice(0, 3);

  useEffect(() => {
    let mounted = true;

    async function loadSummary() {
      if (!learnerId || learnerData?.isPlaceholder) {
        setSummary(null);
        setError("");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/${learnerId}/progress-summary`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (!mounted) return;
        if (res.ok) {
          setSummary(data);
        } else {
          setSummary(null);
          setError(data?.msg || "Unable to load progress data.");
        }
      } catch (fetchError) {
        if (!mounted) return;
        setSummary(null);
        setError("Unable to load progress data.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadSummary();

    return () => {
      mounted = false;
    };
  }, [learnerId, learnerData?.isPlaceholder]);

  if (!learnerData) {
    return (
      <main className="ml-auto flex-1 pr-8 py-8 pl-0 relative z-10">
        <div className="text-center py-20 text-stone-400">Learner profile not available.</div>
      </main>
    );
  }

  const profile = summary?.user || learnerData;
  const overview = summary?.overview || {
    totalLessons: 0,
    completedLessons: toNumber(profile?.questsCompleted, 0),
    inProgressLessons: 0,
    notStartedLessons: 0,
    completionRate: 0,
    averageScore: 0,
    totalAttempts: 0,
  };
  const charts = summary?.charts || {
    completionBreakdown: [],
    scoreTrend: [],
    xpProgress: { currentXP: toNumber(profile?.currentXP, 0), xpToNextLevel: toNumber(profile?.xpToNextLevel, 500) },
    streakProgress: { streak: toNumber(profile?.streak, 0) },
    skills: [],
  };
  const recentActivity = Array.isArray(summary?.recentActivity) ? summary.recentActivity : [];
  const lessonProgress = Array.isArray(summary?.lessonProgress) ? summary.lessonProgress : [];

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
        className="mb-6 px-4 py-2 rounded-lg border border-stone-700 bg-[#0f141a] text-stone-300 hover:text-stone-100 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Leaderboard
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#131820] border border-stone-700 rounded-3xl p-8 mb-8"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <img
            src={profile.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || "Learner")}&background=06b6d4&color=fff&size=128`}
            alt={profile.name || "Learner"}
            className="w-28 h-28 rounded-full border-2 border-cyan-400/40"
          />
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2 flex-wrap">
              <h1 className="text-4xl font-['Cinzel'] text-stone-100">{profile.name || "Learner"}</h1>
              {isCurrentUser ? (
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">You</span>
              ) : null}
            </div>
            {profile.email ? <p className="text-cyan-300 text-sm mb-1">{profile.email}</p> : null}
            <p className="text-stone-400 mb-4">Progress graphs and learner analytics for this profile.</p>

            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {showcased.length > 0 ? showcased.map((badge) => (
                <div key={badge} className="px-3 py-1.5 rounded-full border border-cyan-400/40 bg-cyan-500/10 text-cyan-200 text-xs font-semibold">
                  {badge}
                </div>
              )) : (
                <div className="text-sm text-stone-500">No badges showcased yet.</div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 mb-8">
        <div className="bg-[#0f141a] border border-stone-700 rounded-2xl p-5">
          <div className="text-stone-500 text-xs mb-2">TOTAL XP</div>
          <div className="text-cyan-300 font-['Cinzel'] text-3xl">{(profile.xp || profile.points || 0).toLocaleString()}</div>
          <div className="mt-2 flex items-center gap-2 text-stone-400 text-sm"><Zap className="w-4 h-4 text-cyan-300" />Experience</div>
        </div>

        <div className="bg-[#0f141a] border border-stone-700 rounded-2xl p-5">
          <div className="text-stone-500 text-xs mb-2">LEVEL</div>
          <div className="text-amber-300 font-['Cinzel'] text-3xl">{profile.level || 1}</div>
          <div className="mt-2 flex items-center gap-2 text-stone-400 text-sm"><TrendingUp className="w-4 h-4 text-amber-300" />Progression</div>
        </div>

        <div className="bg-[#0f141a] border border-stone-700 rounded-2xl p-5">
          <div className="text-stone-500 text-xs mb-2">STREAK</div>
          <div className="text-red-300 font-['Cinzel'] text-3xl">{profile.streak || 0}</div>
          <div className="mt-2 flex items-center gap-2 text-stone-400 text-sm"><Flame className="w-4 h-4 text-red-300" />Days</div>
        </div>

        <div className="bg-[#0f141a] border border-stone-700 rounded-2xl p-5">
          <div className="text-stone-500 text-xs mb-2">BADGES</div>
          <div className="text-emerald-300 font-['Cinzel'] text-3xl">{badges.length}</div>
          <div className="mt-2 flex items-center gap-2 text-stone-400 text-sm"><Award className="w-4 h-4 text-emerald-300" />Earned</div>
        </div>

        <div className="bg-[#0f141a] border border-stone-700 rounded-2xl p-5">
          <div className="text-stone-500 text-xs mb-2">LESSONS</div>
          <div className="text-amber-200 font-['Cinzel'] text-3xl">{overview.totalLessons}</div>
          <div className="mt-2 flex items-center gap-2 text-stone-400 text-sm"><BarChart3 className="w-4 h-4 text-amber-200" />Tracked</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <GraphCard title="Progress Graphs" icon={TrendingUp} subtitle="Snapshot graphs for the main progress features.">
          {loading ? (
            <div className="text-center py-16 text-stone-400">Loading progress data...</div>
          ) : error ? (
            <div className="text-center py-16 text-stone-400">{error}</div>
          ) : (
            <div className="space-y-6">
              <Bar
                label="XP to next level"
                value={charts.xpProgress.currentXP}
                max={Math.max(charts.xpProgress.xpToNextLevel || 1, 1)}
                colorClass="bg-gradient-to-r from-cyan-500 to-blue-400"
              />
              <Bar
                label="Quest completion"
                value={overview.completedLessons}
                max={Math.max(overview.totalLessons || profile.totalQuests || 1, 1)}
                colorClass="bg-gradient-to-r from-amber-500 to-orange-400"
              />
              <Bar
                label="Current streak"
                value={charts.streakProgress.streak}
                max={Math.max(charts.streakProgress.streak >= 7 ? charts.streakProgress.streak : 7, 1)}
                colorClass="bg-gradient-to-r from-red-500 to-orange-500"
              />

              <div className="rounded-2xl border border-stone-700 bg-[#0f141a] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm text-stone-400">Completion breakdown</div>
                    <div className="text-xs text-stone-500">Completed, in progress, and not started</div>
                  </div>
                  <Trophy className="w-5 h-5 text-amber-300" />
                </div>
                <div className="space-y-3">
                  {charts.completionBreakdown.map((segment) => {
                    const meta = statusMeta[segment.label === "Completed" ? "completed" : segment.label === "In progress" ? "in-progress" : "not-started"];
                    const total = Math.max(overview.totalLessons || 1, 1);
                    const width = Math.max(0, (toNumber(segment.value, 0) / total) * 100);
                    const color = segment.label === "Completed"
                      ? "bg-emerald-400"
                      : segment.label === "In progress"
                        ? "bg-cyan-400"
                        : "bg-stone-600";
                    return (
                      <div key={segment.label}>
                        <div className="flex items-center justify-between mb-2 text-sm text-stone-300">
                          <span>{segment.label}</span>
                          <span>{segment.value}</span>
                        </div>
                        <div className="h-3 rounded-full bg-[#131820] border border-stone-700 overflow-hidden">
                          <div className={`${color} h-full`} style={{ width: `${width}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </GraphCard>

        <GraphCard title="Score Trend" icon={TrendingUp} subtitle="A line graph of recent quiz performance.">
          <LineTrendChart
            title="Quiz Score Trend"
            subtitle="Recent score history rendered as a line chart."
            points={charts.scoreTrend.length > 0 ? charts.scoreTrend : [
              { label: "Start", value: 0 },
              { label: "Now", value: overview.averageScore || 0 },
            ]}
            lineClassName="stroke-cyan-300"
            fillClassName="fill-cyan-500/10"
            emptyMessage="No score trend data available yet."
          />
        </GraphCard>

        <GraphCard title="Recent Activity" icon={Clock3} subtitle="Latest progress events and lesson attempts.">
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((entry, index) => (
                <div key={`${entry.questTitle || entry.lessonTitle || index}-${index}`} className="rounded-2xl border border-stone-700 bg-[#0f141a] p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="font-['Cinzel'] text-stone-100">{entry.lessonTitle || entry.questTitle || "Activity"}</div>
                      <div className="text-xs text-stone-500">{entry.questTitle || "Quest progress"}</div>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-200">
                      {entry.badgeEarned ? "Badge" : "XP"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-stone-400">
                    <div>XP: <span className="text-amber-300 font-semibold">{entry.xpEarned || 0}</span></div>
                    <div>Completed: <span className="text-cyan-300 font-semibold">{entry.completedAt ? new Date(entry.completedAt).toLocaleDateString() : "-"}</span></div>
                    <div>Level: <span className="text-stone-300">{profile.level || 1}</span></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-stone-400">No activity yet.</div>
          )}
        </GraphCard>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#131820] border border-stone-700 rounded-2xl p-8"
      >
        <h2 className="text-2xl font-['Cinzel'] text-stone-100 mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-300" />
          Progress Snapshot
        </h2>
        <p className="text-stone-400 leading-relaxed">
          This learner has completed {overview.completedLessons}/{overview.totalLessons || profile.totalQuests || 0} tracked lessons with an average score of {overview.averageScore}%.
          The same view can be reused from both learner and admin leaderboard drill-downs.
        </p>
      </motion.div>


    </main>
  );
}
