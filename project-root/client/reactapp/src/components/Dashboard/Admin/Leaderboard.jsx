import { React, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Flame, Zap } from "lucide-react";
import { jwtDecode } from "jwt-decode";

export default function Leaderboard() {
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

  return (
    <main className="m-auto flex-1 pr-8 py-8 pl-0 relative z-10">
      <div className="mb-8">
        <h1 className="text-4xl mb-2 bg-gradient-to-r from-white via-[#1DB954] to-[#8b5cf6] bg-clip-text text-transparent">
          Leaderboard
        </h1>
        <p className="text-[#b3b3b3]">Top learners ranked by XP and streak</p>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setSortBy("xp")}
          className={`px-4 py-2 rounded-lg border transition-all ${sortBy === "xp" ? "border-[#1DB954] text-[#1DB954] bg-[#1DB954]/10" : "border-[#282828] text-[#b3b3b3]"}`}
        >
          <span className="inline-flex items-center gap-2"><Zap className="w-4 h-4" /> Highest XP</span>
        </button>
        <button
          onClick={() => setSortBy("streak")}
          className={`px-4 py-2 rounded-lg border transition-all ${sortBy === "streak" ? "border-[#8b5cf6] text-[#8b5cf6] bg-[#8b5cf6]/10" : "border-[#282828] text-[#b3b3b3]"}`}
        >
          <span className="inline-flex items-center gap-2"><Flame className="w-4 h-4" /> Highest Streak</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-[#b3b3b3]">Loading leaderboard...</div>
      ) : (
        <div className="space-y-3">
          {items.map((user, index) => {
            const isCurrentUser = String(user.id) === String(currentUserId);
            return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`rounded-xl p-4 flex items-center gap-4 border transition-all ${
                isCurrentUser
                  ? "bg-[#1DB954]/10 border-[#1DB954]/50"
                  : "bg-[#1a1a1a] border-[#282828]"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#282828] flex items-center justify-center text-white">
                {user.rank <= 3 ? <Trophy className="w-5 h-5 text-yellow-400" /> : user.rank}
              </div>
              <img
                src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=282828&color=1DB954&size=64`}
                alt={user.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <div className="text-white flex items-center gap-2">
                  {user.name}
                  {isCurrentUser && (
                    <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/40">
                      You
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#808080]">{user.email}</div>
              </div>
              <div className="text-right">
                <div className="text-[#1DB954] font-semibold">{user.xp} XP</div>
                <div className="text-[#8b5cf6] text-sm">🔥 {user.streak} streak</div>
              </div>
            </motion.div>
            );
          })}
        </div>
      )}
    </main>
  );
}
