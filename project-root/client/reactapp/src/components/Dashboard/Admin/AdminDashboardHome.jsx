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
      color: "text-cyan-300",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/30",
    },
    {
      label: "Total Quests",
      value: quests.length,
      icon: BookOpen,
      color: "text-amber-300",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
    },
    {
      label: "Total Lessons",
      value: totalLessons,
      icon: Layers,
      color: "text-orange-300",
      bg: "bg-orange-500/10",
      border: "border-orange-500/30",
    },
  ];

  return (
    <main className="m-auto flex-1 pr-8 py-8 pl-0 relative z-10">
      <div className="mb-8">
        <h1 className="text-4xl mb-2 font-['Cinzel'] bg-gradient-to-r from-amber-200 via-amber-300 to-orange-500 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-stone-400">Overview and quick actions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {cards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="bg-gradient-to-br from-[#1b222a]/95 to-[#131820]/70 border border-stone-700 rounded-2xl p-6 hover:border-cyan-300/50 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${card.bg} ${card.border}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
            <div className="text-3xl font-['Cinzel'] font-bold text-stone-100 mb-2">{card.value}</div>
            <div className="text-sm text-stone-400">{card.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-[#1b222a]/90 to-[#131820]/70 border border-stone-700 rounded-2xl p-6">
        <h2 className="text-2xl font-['Cinzel'] font-bold text-stone-100 mb-2">Quest Management</h2>
        <p className="text-stone-400 mb-6">
          Create quests, edit existing quests, add lessons, and remove lessons.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGoToQuests}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 hover:from-amber-600 hover:via-orange-500 hover:to-amber-600 text-[#20140a] font-['Cinzel'] font-bold transition-all"
        >
          Go to Quest Management
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </main>
  )
}
