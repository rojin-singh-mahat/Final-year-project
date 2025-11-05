import { motion } from "framer-motion";
import { ArrowRight, Flame, Zap, Award, Star } from "lucide-react";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  
  useEffect(()=>{
    const fetchUser = async ()=>{
      try{
        const token = localStorage.getItem("token");

        if(!token){
          window.location.href = "./login";
          return;
        }

        const res = await fetch("http://localhost:5001/api/auth/me",{
          method: "GET",
          headers:{
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await res.json();

        if(!res.ok){
          throw new Error(data.message||"couldn't load user data");
        }

        setUser(data.user)
      }
      catch (err){
        console.error("❌ Dashboard error:", err);
        setError("Unable to load user data. Please re-login.");
        localStorage.removeItem("token");
      }
    };

    fetchUser();
  },[]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-400 text-lg">
        {error}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        Loading your progress...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white px-12 py-10">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#1DB954]/20 to-[#8b5cf6]/20 border border-[#1DB954]/30 rounded-2xl p-8 mb-10 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              🔥 Welcome back, {user.name}!
            </h1>
            <p className="text-[#1DB954] font-semibold text-lg mb-3">
              {user.streak}-Day Streak — Keep it going!
            </p>
            <p className="text-gray-300 italic mb-6">
              “Every line of code gets you closer to mastery.”
            </p>
            <button className="bg-[#1DB954] hover:bg-[#17a84a] text-black px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2">
              Continue Learning <ArrowRight size={18} />
            </button>
          </div>

          <div className="hidden md:block">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 6 }}
              className="text-[#1DB954] text-[80px]"
            >
              <Flame size={80} strokeWidth={1.5} />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* XP */}
        <StatCard
          title="Total XP"
          value={user?.xp?.toLocaleString() || 0}
          sub="+50 this week"
          icon={<Zap size={28} />}
          accent="green"
        />

        {/* Quests */}
        <StatCard
          title="Quests Completed"
          value={`${user.questsCompleted}/${user.totalQuests}`}
          sub={user.questsCompleted<1 ? "Start grinding!" : "Keep grinding!"}
          icon={<Star size={28} />}
          accent="purple"
        />

        {/* Level */}
        <StatCard
          title="Current Level"
          value={`Lvl ${user.level}`}
          sub="75% to next level"
          icon={<Flame size={28} />}
          accent="orange"
        />

        {/* Badges */}
        <StatCard
          title="Badges Earned"
          value={user.badges}
          sub="New badge unlocked soon"
          icon={<Award size={28} />}
          accent="yellow"
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, sub, icon, accent }) {
  const accentColors = {
    green: "#1DB954",
    purple: "#8b5cf6",
    orange: "#f59e0b",
    yellow: "#facc15",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, borderColor: accentColors[accent] }}
      transition={{ type: "spring", stiffness: 1000, damping: 100 }}
      className="bg-[#1a1a1a] border border-[#282828] rounded-2xl p-6 hover:shadow-lg hover:shadow-[#1DB954]/10 transition"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-gray-400 text-sm font-semibold">{title}</div>
        <div style={{ color: accentColors[accent] }}>{icon}</div>
      </div>
      <div className="text-4xl font-bold text-white mb-2">{value}</div>
      <div style={{ color: accentColors[accent] }} className="text-sm font-medium">
        {sub}
      </div>
    </motion.div>
  );
}
