import { Zap, Crown, LayoutDashboard, BookOpen, Users, Settings, ArrowLeft, LogOut } from "lucide-react";
import { React } from "react";

export default function AdminSidebar({ activeNav, setActiveNav }) {
  return (
      <aside className="bg-black/40 backdrop-blur-xl border-r border-[#282828] w-64 fixed left-0 top-0 h-screen flex flex-col z-40">
        <div className="p-6 border-b border-[#282828]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#1DB954] to-[#8b5cf6] rounded-xl flex items-center justify-center">
              <Zap className="w-7 h-7 text-black" />
            </div>
            <div>
              <div className="text-lg">SkillQuest</div>
              <div className="text-xs text-[#1DB954] flex items-center gap-1"><Crown className="w-3 h-3" />Admin Portal</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4">
          <button
            onClick={() => setActiveNav("dashboard")}
            className={`w-full flex items-center gap-3 px-6 py-3 transition-all group${
              activeNav === "dashboard"
                ? "text-[#1DB954] bg-[#1DB954]/10 border-l-4 border-[#1DB954]"
                : "text-[#b3b3b3] hover:text-white hover:bg-white/5"
            }`}
          >
            <LayoutDashboard className="w-5 h-5 group-hover:scale-110 transition-transforms" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveNav("quests")}
            className={`w-full flex items-center gap-3 px-6 py-3 transition-all group${
              activeNav === "quests"
                ? "text-[#1DB954] bg-[#1DB954]/10 border-l-4 border-[#1DB954]"
                : "text-[#b3b3b3] hover:text-white hover:bg-white/5"
            }`}
          >
            <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Manage Quests</span>
          </button>

          <button
            onClick={() => setActiveNav("users")}
            className={`w-full flex items-center gap-3 px-6 py-3 transition-all group ${
              activeNav === "users"
                ? "text-[#1DB954] bg-[#1DB954]/10 border-l-4 border-[#1DB954]"
                : "text-[#b3b3b3] hover:text-white hover:bg-white/5"
            }`}
          >
            <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Manage Users</span>
          </button>

          <button
            onClick={() => setActiveNav("settings")}
            className={`w-full flex items-center gap-3 px-6 py-3 transition-all group${
              activeNav === "settings"
                ? "text-[#1DB954] bg-[#1DB954]/10 border-l-4 border-[#1DB954]"
                : "text-[#b3b3b3] hover:text-white hover:bg-white/5"
            }`}
          >
            <Settings className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Settings</span>
          </button>
        </nav>

        <div className="border-t border-[#282828] p-4">
          <a
            href="/"
            className="w-full flex items-center gap-3 px-2 py-3 text-[#b3b3b3] hover:text-[#1DB954] transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Main Site</span>
          </a>
          <button 
           onClick={() => {
                localStorage.removeItem("token");
                sessionStorage.removeItem("token");
                window.location.href = "./login";
              }}
            className="w-full flex items-center gap-3 px-2 py-3 text-[#b3b3b3] hover:text-red-400 transition-colors group">
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
  );
}
