import { motion } from "framer-motion";
import { React } from "react";
import { Settings, LogOut, Swords } from "lucide-react";

export default function UserSidebar({
  userData,
  navItems,
  activeNav,
  setActiveNav,
  sidebarOpen,
  purchasedQuestDetails = [],
}) {
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
    
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 240 : 80 }}
        className="bg-[#12161c]/95 backdrop-blur-xl border-r border-stone-700 fixed left-0 top-0 h-screen z-40 overflow-hidden transition-all duration-300"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 flex items-center gap-3 border-b border-stone-700">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/50 to-amber-500/40 rounded-xl border border-cyan-300/40 flex items-center justify-center flex-shrink-0">
              <motion.div
                animate={{ rotate: [0, 4, -4, 0], y: [0, -2, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <Swords className="w-6 h-6 text-cyan-100" />
              </motion.div>
            </div>
            {sidebarOpen && (
              <span className="font-['Cinzel'] text-xl text-amber-200 whitespace-nowrap">SkillQuest</span>
            )}
          </div>

          {/* User Section */}
          <div className="p-6 border-b border-stone-700">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username)}&background=282828&color=1DB954&size=128`}
                alt={userData.username}
                className="w-12 h-12 rounded-full border-2 border-cyan-400/70 flex-shrink-0"
              />
              {sidebarOpen && (
                <div className="overflow-hidden">
                  <div className="text-stone-100 truncate">{userData.username}</div>
                  <div className="text-xs text-cyan-300 font-['Cinzel']">
                    Level {userData.level}
                  </div>
                </div>
              )}
            </div>

            {sidebarOpen && (
              <>
                <div className="text-xs text-stone-400 uppercase tracking-wider mb-2">
                  XP Progress
                </div>
                <div className="w-full bg-[#0f141a] rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-amber-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
                <div className="text-xs text-stone-300">
                  {userData.currentXP} / {userData.xpToNextLevel} XP
                </div>

              </>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-3 transition-all ${
                  activeNav === item.id
                    ? "text-amber-200 bg-amber-500/10 border-l-4 border-amber-400"
                    : "text-stone-300 hover:text-cyan-200 hover:bg-white/5"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}
              </button>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="border-t border-stone-700 p-4">
            <button
              type="button"
              onClick={() => setActiveNav("settings")}
              className="w-full flex items-center gap-3 px-2 py-3 text-stone-300 hover:text-cyan-200 transition-colors"
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>Settings</span>}
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                sessionStorage.removeItem("token");
                window.location.href = "./login";
              }}
              className="w-full flex items-center gap-3 px-2 py-3 text-stone-300 hover:text-red-300 transition-colors"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </motion.aside>
  );
}
