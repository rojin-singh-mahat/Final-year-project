import { Swords, Crown, LayoutDashboard, BookOpen, Settings, ArrowLeft, LogOut, DollarSign, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { React } from "react";

export default function AdminSidebar({ activeNav, setActiveNav }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "quests", label: "Manage Quests", icon: BookOpen },
    { id: "purchases", label: "Quest Purchases", icon: DollarSign },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
      <aside className="bg-[#12161c]/95 backdrop-blur-xl border-r border-stone-700 w-64 fixed left-0 top-0 h-screen flex flex-col z-40">
        <div className="p-6 border-b border-stone-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/50 to-amber-500/40 rounded-xl flex items-center justify-center">
              <motion.div
                animate={{ rotate: [0, 4, -4, 0], y: [0, -2, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <Swords className="w-7 h-7 text-cyan-100" />
              </motion.div>
            </div>
            <div>
              <div className="text-lg font-['Cinzel'] text-amber-200">SkillQuest</div>
              <div className="text-xs text-cyan-300 flex items-center gap-1"><Crown className="w-3 h-3" />Admin Portal</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 transition-all group ${
                activeNav === item.id
                  ? "text-amber-200 bg-amber-500/10 border-l-4 border-amber-400"
                  : "text-stone-200 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="border-t border-stone-700 p-4">
          <a
            href="/"
            className="w-full flex items-center gap-3 px-2 py-3 text-stone-400 hover:text-cyan-300 transition-colors group"
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
            className="w-full flex items-center gap-3 px-2 py-3 text-stone-400 hover:text-red-400 transition-colors group">
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
  );
}
