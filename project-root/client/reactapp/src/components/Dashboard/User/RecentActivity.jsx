import { Calendar, BookOpen, Trophy, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { React } from "react";

export default function RecentActivity({ recentActivity = [] }) {
    return(
        <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-3 bg-[#1a1a1a] border border-[#282828] rounded-lg p-6"
            >
              <h2 className="text-2xl mb-6 flex items-center gap-2">
                Recent Activity
                <Calendar className="w-6 h-6 text-[#1DB954]" />
              </h2>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-4 p-4 bg-[#121212] border border-[#282828] rounded-lg hover:border-[#1DB954]/50 transition-all group"
                  >
                    <div className="w-10 h-10 bg-[#1DB954]/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#1DB954]/30 transition-colors">
                      <BookOpen className="w-5 h-5 text-[#1DB954]" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white mb-1">{activity.questTitle}</div>
                      <div className="text-xs text-[#808080]">{activity.completedAt}</div>
                    </div>
                    <div className="text-[#1DB954] font-medium">+{activity.xpEarned} XP</div>
                    {activity.badgeEarned && (
                      <div className="w-6 h-6 bg-gradient-to-br from-[#1DB954] to-[#8b5cf6] rounded-full flex items-center justify-center">
                        <Trophy className="w-3 h-3 text-black" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              <button className="w-full mt-6 text-[#1DB954] hover:text-[#1ed760] flex items-center justify-center gap-2 py-3 border border-[#282828] rounded-lg hover:border-[#1DB954] transition-all">
                View All Progress
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
    )
}