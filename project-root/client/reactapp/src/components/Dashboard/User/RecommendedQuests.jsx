import { motion } from "framer-motion";
import { React } from "react";
import { Target, BookOpen, Clock } from "lucide-react";

export default function RecommendedQuests({ quests = [] }) {
    if (!quests.length) return null;
    
    return(
        <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2 bg-[#1a1a1a] border border-[#282828] rounded-lg p-6"
            >
              <h2 className="text-2xl mb-6 flex items-center gap-2">
                Recommended For You
                <Target className="w-6 h-6 text-[#8b5cf6]" />
              </h2>

              <div className="space-y-4">
                {quests.map((quest, index) => (
                  <motion.div
                    key={quest.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="bg-[#121212] border border-[#282828] rounded-lg overflow-hidden hover:border-[#1DB954] hover:-translate-y-1 transition-all group cursor-pointer"
                  >
                    <div 
                      className="h-24 w-full flex items-center justify-center"
                      style={{ background: quest.thumbnail }}
                    >
                      <BookOpen className="w-8 h-8 text-white opacity-80" />
                    </div>
                    <div className="p-4">
                      <h3 className="text-white mb-2 group-hover:text-[#1DB954] transition-colors">
                        {quest.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(quest.difficulty)}`}>
                          {quest.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-[#b3b3b3] mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {quest.duration} min
                        </span>
                        <span className="text-[#1DB954]">{quest.xpReward} XP</span>
                      </div>
                      <button className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black py-2 rounded-full text-sm transition-all">
                        Start Quest
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
    )
}