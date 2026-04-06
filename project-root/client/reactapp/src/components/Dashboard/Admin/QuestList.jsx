import { Plus, Pencil, Trash2, Search, ChevronDown, BookOpen, Zap, Trophy, Star, Award, CheckCircle2, TrendingUp, Sparkles, Clock, MessageSquare } from "lucide-react";
import { React, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuestList({ quests, handleCreateQuest, handleEditQuest, handleDeleteQuest, setActiveView, searchQuery, setSearchQuery, difficultyFilter, setDifficultyFilter, getDifficultyColor, loadingQuests, filteredQuests, onQuestUpdated, onReviewQuest, }) {
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replySubmitting, setReplySubmitting] = useState({});
  const [replyErrors, setReplyErrors] = useState({});
  const [expandedFeedback, setExpandedFeedback] = useState({});
    
    // Calculate stats
    const totalQuests = quests.length;
    const resolveQuestXP = (quest) => {
      if (typeof quest.totalXP === "number" && quest.totalXP > 0) return quest.totalXP;
      return Array.isArray(quest.lessons)
        ? quest.lessons.reduce((sum, lesson) => sum + Number(lesson.xp || lesson.xpReward || 0), 0)
        : 0;
    };

    const resolveQuestCompletions = (quest) => Number(quest.completions || 0);
    const resolveQuestAvgRating = (quest) => {
      if (typeof quest.avgRating === "number" && quest.avgRating > 0) return quest.avgRating;
      if (Array.isArray(quest.feedback) && quest.feedback.length > 0) {
        const sum = quest.feedback.reduce((acc, entry) => acc + Number(entry.rating || 0), 0);
        return Number((sum / quest.feedback.length).toFixed(1));
      }
      return 0;
    };

    const totalXP = quests.reduce((sum, q) => sum + resolveQuestXP(q), 0);
    const totalCompletions = quests.reduce((sum, q) => sum + resolveQuestCompletions(q), 0);
    const ratedQuests = quests.filter((q) => {
      const ratingCount = Number(q.ratingCount || (Array.isArray(q.feedback) ? q.feedback.length : 0));
      return ratingCount > 0;
    });
    const avgRating = ratedQuests.length > 0
      ? (ratedQuests.reduce((sum, q) => sum + resolveQuestAvgRating(q), 0) / ratedQuests.length).toFixed(1)
      : '0.0';

    const getDifficultyGradient = (difficulty) => {
      switch (difficulty) {
        case 'Beginner': case 'beginner': return 'from-cyan-500 to-cyan-400';
        case 'Intermediate': case 'intermediate': return 'from-amber-500 to-amber-400';
        case 'Advanced': case 'advanced': return 'from-orange-500 to-orange-400';
        default: return 'from-stone-500 to-stone-400';
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
                <h1 className="text-4xl mb-2 font-['Cinzel'] font-bold bg-gradient-to-r from-amber-200 via-amber-300 to-orange-400 bg-clip-text text-transparent">
                  Quest Management
                </h1>
                <p className="text-stone-400">Create and manage learning experiences</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Quests */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-gradient-to-br from-[#1b222a]/95 to-[#131820]/70 border border-stone-700 rounded-2xl p-6 hover:border-cyan-300/50 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BookOpen className="w-6 h-6 text-cyan-300" />
                      </div>
                      <Sparkles className="w-5 h-5 text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-3xl mb-2 text-stone-100 group-hover:text-cyan-300 transition-colors">{totalQuests}</div>
                    <div className="text-sm text-stone-400">Total Quests</div>
                  </div>
                </motion.div>

                {/* Total XP */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-gradient-to-br from-[#1b222a]/95 to-[#131820]/70 border border-stone-700 rounded-2xl p-6 hover:border-amber-300/50 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Zap className="w-6 h-6 text-amber-300" />
                      </div>
                      <Sparkles className="w-5 h-5 text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-3xl mb-2 text-stone-100 group-hover:text-amber-300 transition-colors">{totalXP.toLocaleString()}</div>
                    <div className="text-sm text-stone-400">Total XP Available</div>
                  </div>
                </motion.div>

                {/* Total Completions */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-gradient-to-br from-[#1b222a]/95 to-[#131820]/70 border border-stone-700 rounded-2xl p-6 hover:border-orange-300/50 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-6 h-6 text-orange-300" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-orange-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-3xl mb-2 text-stone-100 group-hover:text-orange-300 transition-colors">{totalCompletions.toLocaleString()}</div>
                    <div className="text-sm text-stone-400">Quest Completions</div>
                  </div>
                </motion.div>

                {/* Average Rating */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-gradient-to-br from-[#1b222a]/95 to-[#131820]/70 border border-stone-700 rounded-2xl p-6 hover:border-amber-300/50 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Star className="w-6 h-6 text-amber-300" />
                      </div>
                      <Award className="w-5 h-5 text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-3xl mb-2 text-stone-100 group-hover:text-amber-300 transition-colors">{avgRating}</div>
                    <div className="text-sm text-stone-400">Average Rating</div>
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
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 group-hover:text-cyan-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Search quests or use #hashtags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0f141a] border border-stone-700 rounded-xl pl-12 pr-4 py-3 text-stone-100 placeholder-stone-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all"
                />
              </div>

              {/* Difficulty Filter */}
              <div className="relative">
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="bg-[#0f141a] border border-stone-700 rounded-xl px-6 py-3 pr-12 text-stone-100 appearance-none cursor-pointer focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all min-w-[180px]"
                >
                  <option>All Difficulties</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500" />
              </div>

              {/* Create Button */}
              <motion.button
                onClick={handleCreateQuest}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 hover:from-amber-600 hover:via-orange-500 hover:to-amber-600 text-[#20140a] font-['Cinzel'] font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40"
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
                <div className="col-span-2 text-center py-20 text-stone-400">Loading quests...</div>
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
                      className="bg-gradient-to-br from-[#1b222a]/95 to-[#131820]/70 border border-stone-700 rounded-2xl overflow-hidden hover:border-cyan-300/50 transition-all group"
                    >
                      {/* Card Header with Gradient */}
                      <div className={`h-2 bg-gradient-to-r ${getDifficultyGradient(quest.difficulty)}`}></div>
                      
                      <div className="p-6">
                        {/* Quest Title & Description */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl mb-2 text-stone-100 group-hover:text-cyan-300 transition-colors">{quest.title}</h3>
                            <p className="text-sm text-stone-500 line-clamp-2">{quest.description}</p>
                          </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-stone-700">
                          <div className="text-center">
                            <div className="text-xs text-stone-500 mb-1">Difficulty</div>
                            <span className={`inline-block text-xs px-3 py-1 rounded-full border ${getDifficultyColor(quest.difficulty)}`}>
                              {quest.difficulty}
                            </span>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-stone-500 mb-1">XP Reward</div>
                            <div className="text-amber-300 flex items-center justify-center gap-1">
                              <Zap className="w-4 h-4" />
                              {resolveQuestXP(quest)}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-stone-500 mb-1">Lessons</div>
                            <div className="text-stone-100">{quest.lessons?.length || 0}</div>
                          </div>
                        </div>

                        {/* Engagement Stats */}
                        <div className="flex items-center justify-between mb-4 text-sm">
                          <div className="flex items-center gap-2 text-stone-400">
                            <Trophy className="w-4 h-4 text-amber-300" />
                            <span>{quest.completions || 0} completions</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                              <span className="text-stone-300">{quest.avgRating || '0.0'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-stone-400">
                              <MessageSquare className="w-4 h-4 text-cyan-400" />
                              <span>{quest.ratingCount || 0}</span>
                            </div>
                          </div>
                        </div>

                        {Array.isArray(quest.hashtags) && quest.hashtags.length > 0 && (
                          <div className="mb-4 flex flex-wrap gap-1.5">
                            {quest.hashtags.slice(0, 5).map((tag) => (
                              <span
                                key={`${quest._id || quest.id}-${tag}`}
                                className="text-[10px] px-2 py-0.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-200"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Reviews (on-demand) */}
                        {Array.isArray(quest.feedback) && quest.feedback.length > 0 && (
                          <div className="mb-4">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedFeedback((prev) => ({
                                  ...prev,
                                  [quest._id || quest.id]: !prev[quest._id || quest.id],
                                }))
                              }
                              className="w-full mb-2 px-3 py-2 bg-[#0f141a] border border-stone-700 rounded-lg text-sm text-stone-300 hover:text-cyan-200 flex items-center justify-between"
                            >
                              <span>Reviews ({quest.feedback.length})</span>
                              <ChevronDown
                                className={`w-4 h-4 transition-transform ${expandedFeedback[quest._id || quest.id] ? "rotate-180" : ""}`}
                              />
                            </button>

                            {expandedFeedback[quest._id || quest.id] && (
                              <div className="p-3 bg-[#0f141a] border border-stone-700 rounded-lg space-y-2">
                            {[...quest.feedback]
                              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                              .map((entry) => (
                                <div key={entry._id} className="text-xs border-b border-stone-700 pb-2 last:border-b-0 last:pb-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-stone-100">{entry.user?.name || 'User'}</span>
                                    <span className="flex items-center gap-1 text-amber-400">
                                      <Star className="w-3 h-3 fill-amber-400" />
                                      {entry.rating}
                                    </span>
                                  </div>
                                  <div className="text-stone-400 line-clamp-2">{entry.comment}</div>

                                  {entry.adminReply?.message && (
                                    <div className="mt-2 p-2 rounded-md border border-cyan-400/30 bg-cyan-400/5">
                                      <div className="text-[11px] text-cyan-300 mb-1">
                                        Admin reply • {entry.adminReply?.admin?.name || 'Admin'}
                                      </div>
                                      <div className="text-stone-400">{entry.adminReply.message}</div>
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
                                      className="w-full min-h-[64px] bg-[#0f141a] border border-stone-700 rounded-md px-2 py-1.5 text-stone-100 placeholder-stone-500 focus:border-cyan-400 focus:outline-none"
                                      placeholder="Write a reply to this learner..."
                                      maxLength={500}
                                    />
                                    <div className="flex items-center justify-between gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleReplySubmit(quest._id || quest.id, entry._id)}
                                        disabled={!!replySubmitting[getReplyKey(quest._id || quest.id, entry._id)]}
                                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-[#20140a] font-['Cinzel'] font-bold rounded-md transition-all"
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
                          </div>
                        )}

                        {/* Badge Reward */}
                        {quest.rewardBadge && (
                          <div className="flex items-center gap-2 mb-4 p-3 bg-cyan-500/10 border border-cyan-400/20 rounded-lg">
                            <Award className="w-5 h-5 text-cyan-300" />
                            <div>
                              <div className="text-xs text-stone-500">Badge Reward</div>
                              <div className="text-sm text-cyan-200">{quest.rewardBadge}</div>
                            </div>
                          </div>
                        )}

                        {/* Price Tag */}
                        {quest.price > 0 && (
                          <div className="flex items-center gap-2 mb-4 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="text-yellow-500 font-bold text-lg">NPR {quest.price}</div>
                              <div className="text-xs text-stone-500">Nepali Rupees</div>
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
                             onClick={() => onReviewQuest && onReviewQuest(quest)}
                             whileHover={{ scale: 1.02 }}
                             whileTap={{ scale: 0.95 }}
                             className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 rounded-lg transition-all border border-blue-500/20 hover:border-blue-500/40"
                           >
                             <MessageSquare className="w-4 h-4" />
                             <span>Reviews</span>
                           </motion.button>
                          <motion.button
                            onClick={() => handleEditQuest(quest)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 rounded-lg transition-all border border-cyan-500/20 hover:border-cyan-500/40"
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
                        <div className="mt-4 pt-4 border-t border-stone-700 flex items-center justify-between text-xs text-stone-500">
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
                      <div className="w-20 h-20 bg-[#1b222a] border border-stone-700 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="w-10 h-10 text-stone-500" />
                      </div>
                      <h3 className="text-xl mb-2 text-stone-100">No quests found</h3>
                      <p className="text-stone-500 mb-6">
                        {searchQuery || difficultyFilter !== 'All Difficulties'
                          ? 'Try adjusting your search or filters'
                          : 'Create your first quest to get started!'}
                      </p>
                      {!searchQuery && difficultyFilter === 'All Difficulties' && (
                        <button
                          onClick={handleCreateQuest}
                          className="bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 text-[#20140a] font-['Cinzel'] font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20"
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