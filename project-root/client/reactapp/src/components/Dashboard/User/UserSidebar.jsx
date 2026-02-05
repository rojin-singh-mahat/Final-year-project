import { motion } from "framer-motion";
import { React } from "react";
import { User, Settings, LogOut, Zap } from "lucide-react";

export default function UserSidebar({
  userData,
  navItems,
  activeNav,
  setActiveNav,
  sidebarOpen,
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
        className="bg-black border-r border-[#282828] fixed left-0 top-0 h-screen z-40 overflow-hidden transition-all duration-300"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 flex items-center gap-3 border-b border-[#282828]">
            <div className="w-10 h-10 bg-gradient-to-br from-[#1DB954] to-[#8b5cf6] rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-black" />
            </div>
            {sidebarOpen && (
              <span className="text-xl whitespace-nowrap">SkillQuest</span>
            )}
          </div>

          {/* User Section */}
          <div className="p-6 border-b border-[#282828]">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username)}&background=282828&color=1DB954&size=128`}
                alt={userData.username}
                className="w-12 h-12 rounded-full border-2 border-[#1DB954] flex-shrink-0"
              />
              {sidebarOpen && (
                <div className="overflow-hidden">
                  <div className="text-white truncate">{userData.username}</div>
                  <div className="text-xs text-[#1DB954]">
                    Level {userData.level}
                  </div>
                </div>
              )}
            </div>

            {sidebarOpen && (
              <>
                <div className="text-xs text-[#808080] uppercase tracking-wider mb-2">
                  XP Progress
                </div>
                <div className="w-full bg-[#282828] rounded-full h-2 mb-2">
                  <div
                    className="bg-[#1DB954] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
                <div className="text-xs text-[#b3b3b3]">
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
                    ? "text-[#1DB954] bg-[#1DB954]/10 border-l-4 border-[#1DB954]"
                    : "text-[#b3b3b3] hover:text-white hover:bg-white/5"
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
          <div className="border-t border-[#282828] p-4">
            <button className="w-full flex items-center gap-3 px-2 py-3 text-[#b3b3b3] hover:text-white transition-colors">
              <Settings className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>Settings</span>}
            </button>
            <button
              onClick={() => setActiveNav("profile")}
              className="w-full flex items-center gap-3 px-2 py-3 text-[#b3b3b3] hover:text-white transition-colors"
            >
              <User className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>Profile</span>}
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                sessionStorage.removeItem("token");
                window.location.href = "./login";
              }}
              className="w-full flex items-center gap-3 px-2 py-3 text-[#b3b3b3] hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </motion.aside>
  );
}
