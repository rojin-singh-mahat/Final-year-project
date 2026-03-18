import { Plus, Pencil, Trash2, Search, ChevronDown, BookOpen, Zap, Trophy, Star, Award, CheckCircle2, TrendingUp, Sparkles, Clock, MessageSquare } from "lucide-react";
import { React, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuestList({ quests, handleCreateQuest, handleEditQuest, handleDeleteQuest, setActiveView, searchQuery, setSearchQuery, difficultyFilter, setDifficultyFilter, getDifficultyColor, loadingQuests, filteredQuests, onQuestUpdated, }) {
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replySubmitting, setReplySubmitting] = useState({});
  const [replyErrors, setReplyErrors] = useState({});
    
    // Calculate stats
    const totalQuests = quests.length;
    const totalXP = quests.reduce((sum, q) => sum + (q.totalXP || 0), 0);
    const totalCompletions = quests.reduce((sum, q) => sum + (q.completions || 0), 0);
    const avgRating = quests.length > 0 
      ? (quests.reduce((sum, q) => sum + (q.avgRating || 0), 0) / quests.length).toFixed(1)
      : '0.0';

    const getDifficultyGradient = (difficulty) => {
      switch (difficulty) {
        case 'Beginner': case 'beginner': return 'from-green-500 to-emerald-500';
        case 'Intermediate': case 'intermediate': return 'from-yellow-500 to-orange-500';
        case 'Advanced': case 'advanced': return 'from-purple-500 to-pink-500';
        default: return 'from-gray-500 to-gray-600';
      }
    };

    const getReplyKey = (questId, feedbackId) => `${questId}:${feedbackId}`;

    const handleReplySubmit = async (questId, feedbackId) => {
      const key = getReplyKey(questId, feedbackId);
      const message = (replyDrafts[key] || "").trim();

      if (!message) {
        setReplyErrors((prev) => ({ ...prev, [key]: "Reply cannot be empty." }));
        return;
      }

      setReplySubmitting((prev) => ({ ...prev, [key]: true }));
      setReplyErrors((prev) => ({ ...prev, [key]: "" }));

      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/quests/${questId}/feedback/${feedbackId}/reply`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ message }),
        });

        const data = await res.json();
        if (!res.ok) {
          setReplyErrors((prev) => ({
            ...prev,
            [key]: data?.error || "Unable to save reply.",
          }));
          return;
        }

        onQuestUpdated?.(data);
        setReplyDrafts((prev) => ({ ...prev, [key]: message }));
      } catch (error) {
        console.error("Error saving admin reply:", error);
        setReplyErrors((prev) => ({ ...prev, [key]: "Unable to save reply." }));
      } finally {
        setReplySubmitting((prev) => ({ ...prev, [key]: false }));
      }
    };

            return(
              <main className="m-auto flex-1 pr-8 py-8 pl-0 relative z-10">
                {/* Stats Overview */}
                <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="mb-6">
                <h1 className="text-4xl mb-2 bg-gradient-to-r from-white via-[#1DB954] to-[#8b5cf6] bg-clip-text text-transparent">
                  Quest Management
                </h1>
                <p className="text-[#b3b3b3]">Create and manage learning experiences</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Quests */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-gradient-to-br from-[#1a1a1a] to-[#121212] border border-[#282828] rounded-2xl p-6 hover:border-[#1DB954]/50 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#1DB954]/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-[#1DB954]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BookOpen className="w-6 h-6 text-[#1DB954]" />
                      </div>
                      <Sparkles className="w-5 h-5 text-[#1DB954] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-3xl mb-2 group-hover:text-[#1DB954] transition-colors">{totalQuests}</div>
                    <div className="text-sm text-[#b3b3b3]">Total Quests</div>
                  </div>
                </motion.div>

                {/* Total XP */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-gradient-to-br from-[#1a1a1a] to-[#121212] border border-[#282828] rounded-2xl p-6 hover:border-[#8b5cf6]/50 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b5cf6]/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-[#8b5cf6]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Zap className="w-6 h-6 text-[#8b5cf6]" />
                      </div>
                      <Sparkles className="w-5 h-5 text-[#8b5cf6] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-3xl mb-2 group-hover:text-[#8b5cf6] transition-colors">{totalXP.toLocaleString()}</div>
                    <div className="text-sm text-[#b3b3b3]">Total XP Available</div>
                  </div>
                </motion.div>

                {/* Total Completions */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-gradient-to-br from-[#1a1a1a] to-[#121212] border border-[#282828] rounded-2xl p-6 hover:border-[#1DB954]/50 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#1DB954]/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-[#1DB954]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-6 h-6 text-[#1DB954]" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-[#1DB954] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-3xl mb-2 group-hover:text-[#1DB954] transition-colors">{totalCompletions.toLocaleString()}</div>
                    <div className="text-sm text-[#b3b3b3]">Quest Completions</div>
                  </div>
                </motion.div>

                {/* Average Rating */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-gradient-to-br from-[#1a1a1a] to-[#121212] border border-[#282828] rounded-2xl p-6 hover:border-yellow-500/50 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Star className="w-6 h-6 text-yellow-500" />
                      </div>
                      <Award className="w-5 h-5 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-3xl mb-2 group-hover:text-yellow-500 transition-colors">{avgRating}</div>
                    <div className="text-sm text-[#b3b3b3]">Average Rating</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Action Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-6 flex flex-col md:flex-row gap-4 items-center"
            >
              {/* Search */}
              <div className="flex-1 w-full relative group">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#808080] group-hover:text-[#1DB954] transition-colors" />
                <input
                  type="text"
                  placeholder="Search quests by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#282828] rounded-xl pl-12 pr-4 py-3 text-white placeholder-[#808080] focus:border-[#1DB954] focus:ring-2 focus:ring-[#1DB954]/20 focus:outline-none transition-all"
                />
              </div>

              {/* Difficulty Filter */}
              <div className="relative">
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="bg-[#1a1a1a] border border-[#282828] rounded-xl px-6 py-3 pr-12 text-white appearance-none cursor-pointer focus:border-[#1DB954] focus:ring-2 focus:ring-[#1DB954]/20 focus:outline-none transition-all min-w-[180px]"
                >
                  <option>All Difficulties</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#808080]" />
              </div>

              {/* Create Button */}
              <motion.button
                onClick={handleCreateQuest}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-[#1DB954] to-[#1ed760] hover:from-[#1ed760] hover:to-[#1DB954] text-black px-8 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-[#1DB954]/20 hover:shadow-[#1DB954]/40"
              >
                <Plus className="w-5 h-5" />
                <span>Create Quest</span>
              </motion.button>
            </motion.div>

            {/* Quest Cards Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {loadingQuests ? (
                <div className="col-span-2 text-center py-20 text-[#b3b3b3]">Loading quests...</div>
              ) : (
                <AnimatePresence>
                  {filteredQuests.map((quest, index) => (
                    <motion.div
                      key={quest._id || quest.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="bg-gradient-to-br from-[#1a1a1a] to-[#121212] border border-[#282828] rounded-2xl overflow-hidden hover:border-[#1DB954]/50 transition-all group"
                    >
                      {/* Card Header with Gradient */}
                      <div className={`h-2 bg-gradient-to-r ${getDifficultyGradient(quest.difficulty)}`}></div>
                      
                      <div className="p-6">
                        {/* Quest Title & Description */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl mb-2 group-hover:text-[#1DB954] transition-colors">{quest.title}</h3>
                            <p className="text-sm text-[#808080] line-clamp-2">{quest.description}</p>
                          </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-[#282828]">
                          <div className="text-center">
                            <div className="text-xs text-[#808080] mb-1">Difficulty</div>
                            <span className={`inline-block text-xs px-3 py-1 rounded-full border ${getDifficultyColor(quest.difficulty)}`}>
                              {quest.difficulty}
                            </span>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-[#808080] mb-1">XP Reward</div>
                            <div className="text-[#1DB954] flex items-center justify-center gap-1">
                              <Zap className="w-4 h-4" />
                              {quest.totalXP || 0}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-[#808080] mb-1">Lessons</div>
                            <div className="text-white">{quest.lessons?.length || 0}</div>
                          </div>
                        </div>

                        {/* Engagement Stats */}
                        <div className="flex items-center justify-between mb-4 text-sm">
                          <div className="flex items-center gap-2 text-[#b3b3b3]">
                            <Trophy className="w-4 h-4 text-[#1DB954]" />
                            <span>{quest.completions || 0} completions</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-[#b3b3b3]">{quest.avgRating || '0.0'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[#b3b3b3]">
                              <MessageSquare className="w-4 h-4 text-[#8b5cf6]" />
                              <span>{quest.ratingCount || 0}</span>
                            </div>
                          </div>
                        </div>

                        {/* Recent Feedback */}
                        {Array.isArray(quest.feedback) && quest.feedback.length > 0 && (
                          <div className="mb-4 p-3 bg-[#121212] border border-[#282828] rounded-lg space-y-2">
                            {[...quest.feedback]
                              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                              .map((entry) => (
                                <div key={entry._id} className="text-xs border-b border-[#282828] pb-2 last:border-b-0 last:pb-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-white">{entry.user?.name || 'User'}</span>
                                    <span className="flex items-center gap-1 text-yellow-500">
                                      <Star className="w-3 h-3 fill-yellow-500" />
                                      {entry.rating}
                                    </span>
                                  </div>
                                  <div className="text-[#b3b3b3] line-clamp-2">{entry.comment}</div>

                                  {entry.adminReply?.message && (
                                    <div className="mt-2 p-2 rounded-md border border-[#1DB954]/30 bg-[#1DB954]/5">
                                      <div className="text-[11px] text-[#1DB954] mb-1">
                                        Admin reply • {entry.adminReply?.admin?.name || 'Admin'}
                                      </div>
                                      <div className="text-[#b3b3b3]">{entry.adminReply.message}</div>
                                    </div>
                                  )}

                                  <div className="mt-2 space-y-2">
                                    <textarea
                                      value={replyDrafts[getReplyKey(quest._id || quest.id, entry._id)] ?? (entry.adminReply?.message || "")}
                                      onChange={(e) =>
                                        setReplyDrafts((prev) => ({
                                          ...prev,
                                          [getReplyKey(quest._id || quest.id, entry._id)]: e.target.value,
                                        }))
                                      }
                                      className="w-full min-h-[64px] bg-[#1a1a1a] border border-[#282828] rounded-md px-2 py-1.5 text-[#e5e5e5] placeholder-[#808080] focus:border-[#1DB954] focus:outline-none"
                                      placeholder="Write a reply to this learner..."
                                      maxLength={500}
                                    />
                                    <div className="flex items-center justify-between gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleReplySubmit(quest._id || quest.id, entry._id)}
                                        disabled={!!replySubmitting[getReplyKey(quest._id || quest.id, entry._id)]}
                                        className="px-3 py-1.5 bg-[#1DB954] hover:bg-[#1ed760] disabled:opacity-60 text-black rounded-md transition-all"
                                      >
                                        {replySubmitting[getReplyKey(quest._id || quest.id, entry._id)]
                                          ? 'Saving...'
                                          : entry.adminReply?.message
                                            ? 'Update Reply'
                                            : 'Reply'}
                                      </button>
                                      {replyErrors[getReplyKey(quest._id || quest.id, entry._id)] && (
                                        <span className="text-[11px] text-red-400">
                                          {replyErrors[getReplyKey(quest._id || quest.id, entry._id)]}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}

                        {/* Badge Reward */}
                        {quest.rewardBadge && (
                          <div className="flex items-center gap-2 mb-4 p-3 bg-[#1DB954]/5 border border-[#1DB954]/20 rounded-lg">
                            <Award className="w-5 h-5 text-[#1DB954]" />
                            <div>
                              <div className="text-xs text-[#808080]">Badge Reward</div>
                              <div className="text-sm text-[#1DB954]">{quest.rewardBadge}</div>
                            </div>
                          </div>
                        )}

                        {/* Price Tag */}
                        {quest.price > 0 && (
                          <div className="flex items-center gap-2 mb-4 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="text-yellow-500 font-bold text-lg">NPR {quest.price}</div>
                              <div className="text-xs text-[#808080]">Nepali Rupees</div>
                            </div>
                          </div>
                        )}
                        {quest.price === 0 && (
                          <div className="flex items-center gap-2 mb-4 p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                            <div className="text-green-400 font-semibold text-sm">Free Quest</div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <motion.button
                            onClick={() => handleEditQuest(quest)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#1DB954]/10 hover:bg-[#1DB954]/20 text-[#1DB954] rounded-lg transition-all border border-[#1DB954]/20 hover:border-[#1DB954]/40"
                          >
                            <Pencil className="w-4 h-4" />
                            <span>Edit</span>
                          </motion.button>
                          <motion.button
                            onClick={() => handleDeleteQuest(quest._id || quest.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all border border-red-500/20 hover:border-red-500/40"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>

                        {/* Created Date */}
                        <div className="mt-4 pt-4 border-t border-[#282828] flex items-center justify-between text-xs text-[#808080]">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Created {quest.createdAt}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {filteredQuests.length === 0 && !loadingQuests && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="col-span-2 text-center py-20"
                    >
                      <div className="w-20 h-20 bg-[#282828] rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="w-10 h-10 text-[#808080]" />
                      </div>
                      <h3 className="text-xl mb-2">No quests found</h3>
                      <p className="text-[#808080] mb-6">
                        {searchQuery || difficultyFilter !== 'All Difficulties'
                          ? 'Try adjusting your search or filters'
                          : 'Create your first quest to get started!'}
                      </p>
                      {!searchQuery && difficultyFilter === 'All Difficulties' && (
                        <button
                          onClick={handleCreateQuest}
                          className="bg-[#1DB954] hover:bg-[#1ed760] text-black px-8 py-3 rounded-xl transition-all shadow-lg shadow-[#1DB954]/20"
                        >
                          Create Your First Quest
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </motion.div>
          </main>
    )
}