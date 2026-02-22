import { React, useMemo } from "react";
import { Users, BookOpen, Layers, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboardHome({ quests = [], users = [], onGoToQuests }) {
  const totalLessons = useMemo(
    () => quests.reduce((sum, quest) => sum + (quest.lessons?.length || 0), 0),
    [quests]
  );

  const cards = [
    {
      label: "Total Users",
      value: users.length,
      icon: Users,
      color: "text-[#1DB954]",
      bg: "bg-[#1DB954]/10",
      border: "border-[#1DB954]/30",
    },
    {
      label: "Total Quests",
      value: quests.length,
      icon: BookOpen,
      color: "text-[#8b5cf6]",
      bg: "bg-[#8b5cf6]/10",
      border: "border-[#8b5cf6]/30",
    },
    {
      label: "Total Lessons",
      value: totalLessons,
      icon: Layers,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
    },
  ];

  return (
    <main className="m-auto flex-1 pr-8 py-8 pl-0 relative z-10">
      <div className="mb-8">
        <h1 className="text-4xl mb-2 bg-gradient-to-r from-white via-[#1DB954] to-[#8b5cf6] bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-[#b3b3b3]">Overview and quick actions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {cards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="bg-gradient-to-br from-[#1a1a1a] to-[#121212] border border-[#282828] rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${card.bg} ${card.border}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
            <div className="text-3xl mb-2">{card.value}</div>
            <div className="text-sm text-[#b3b3b3]">{card.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="bg-[#1a1a1a] border border-[#282828] rounded-2xl p-6">
        <h2 className="text-2xl mb-2">Quest Management</h2>
        <p className="text-[#b3b3b3] mb-6">
          Create quests, edit existing quests, add lessons, and remove lessons.
        </p>
        <button
          onClick={onGoToQuests}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black transition-all"
        >
          Go to Quest Management
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </main>
  )
}
