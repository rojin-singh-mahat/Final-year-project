import { motion } from "framer-motion";
import { Lock, Swords, Star, Flag, ChevronRight } from "lucide-react";

const difficultyWeight = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

function groupRoadmap(quests) {
  const categories = new Map();

  for (const quest of quests || []) {
    const category = quest?.category || "General";
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category).push(quest);
  }

  for (const [category, items] of categories.entries()) {
    items.sort((a, b) => {
      const aw = difficultyWeight[String(a?.difficulty || "").toLowerCase()] || 99;
      const bw = difficultyWeight[String(b?.difficulty || "").toLowerCase()] || 99;
      if (aw !== bw) return aw - bw;
      return String(a?.title || "").localeCompare(String(b?.title || ""));
    });
    categories.set(category, items.slice(0, 7));
  }

  return [...categories.entries()];
}

export default function QuestRoadmap({ quests = [], completedQuestIds = [], onOpenQuest }) {
  const completedSet = new Set((completedQuestIds || []).map((id) => String(id)));
  const grouped = groupRoadmap(quests);

  const totalVisible = grouped.reduce((sum, [, list]) => sum + list.length, 0);
  const masteredVisible = grouped.reduce(
    (sum, [, list]) =>
      sum +
      list.filter((quest) => completedSet.has(String(quest?._id || quest?.id))).length,
    0
  );
  const masteryPercent = totalVisible > 0 ? Math.round((masteredVisible / totalVisible) * 100) : 0;

  return (
    <section className="mb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-['Cinzel'] text-3xl text-amber-200">Quest Roadmap</h2>
          <p className="text-stone-300 mt-1">Progress through each path from foundational to advanced missions.</p>
        </div>
        <div className="min-w-[220px] bg-[#1b222a]/90 border border-stone-700 rounded-xl px-4 py-3">
          <div className="flex items-center justify-between text-xs text-stone-300 mb-2">
            <span>Mastery Progress</span>
            <span>{masteredVisible}/{totalVisible}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#0f141a] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-amber-400"
              style={{ width: `${masteryPercent}%` }}
            />
          </div>
        </div>
      </div>

      {grouped.length === 0 ? (
        <div className="text-center py-10 bg-[#1b222a]/85 border border-stone-700 rounded-xl text-stone-400">
          No quests available yet.
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([category, list], categoryIndex) => {
            let previousMastered = true;

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.08 }}
                className="bg-[#1b222a]/88 border border-stone-700 rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Flag className="w-5 h-5 text-cyan-300" />
                  <h3 className="text-xl text-stone-100 font-['Cinzel']">{category}</h3>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {list.map((quest, index) => {
                    const questId = String(quest?._id || quest?.id);
                    const mastered = completedSet.has(questId);
                    const unlocked = mastered || previousMastered || String(quest?.difficulty || "").toLowerCase() === "beginner";
                    previousMastered = mastered;

                    const stateTone = mastered
                      ? "border-amber-400/50 bg-amber-500/15 text-amber-100"
                      : unlocked
                      ? "border-cyan-400/50 bg-cyan-500/10 text-cyan-100"
                      : "border-stone-600 bg-stone-700/20 text-stone-400";

                    const Icon = mastered ? Star : unlocked ? Swords : Lock;
                    const stateLabel = mastered ? "Mastered" : unlocked ? "Unlocked" : "Locked";

                    return (
                      <div key={questId} className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={!unlocked}
                          onClick={() => unlocked && onOpenQuest?.(quest)}
                          className={`min-w-[220px] max-w-[260px] text-left rounded-xl border px-4 py-3 transition-all ${stateTone} ${
                            unlocked ? "hover:-translate-y-1 hover:shadow-lg" : "cursor-not-allowed"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="font-semibold line-clamp-1">{quest?.title || "Untitled Quest"}</p>
                            <Icon className="w-4 h-4" />
                          </div>
                          <p className="text-xs uppercase tracking-wider opacity-90 mb-1">{stateLabel}</p>
                          <p className="text-xs opacity-85 line-clamp-1">
                            {quest?.difficulty || "Unknown"} • {quest?.lessons?.length || 0} lessons • {quest?.totalXP || 0} XP
                          </p>
                        </button>

                        {index < list.length - 1 && (
                          <div className="hidden md:flex items-center text-stone-500">
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
