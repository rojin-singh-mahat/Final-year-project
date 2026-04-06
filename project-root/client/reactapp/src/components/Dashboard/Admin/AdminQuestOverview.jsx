import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Award, Star, MessageSquare, Send, Loader } from "lucide-react";

export default function AdminQuestOverview({ quest, onClose, onBack }) {
  const [feedback, setFeedback] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [submittingReply, setSubmittingReply] = useState({});
  const [loadingFeedback, setLoadingFeedback] = useState(true);

  useEffect(() => {
    if (quest._id) {
      setLoadingFeedback(true);
      setFeedback(Array.isArray(quest.feedback) ? quest.feedback : []);
      setLoadingFeedback(false);
    }
  }, [quest._id]);

  const handleSubmitReply = async (feedbackId) => {
    const reply = replyText[feedbackId]?.trim();
    if (!reply) return;

    setSubmittingReply((prev) => ({ ...prev, [feedbackId]: true }));

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/quest/${quest._id}/feedback/${feedbackId}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: reply }),
        }
      );

      if (res.ok) {
        const updatedFeedback = feedback.map((f) =>
          f._id === feedbackId
            ? {
                ...f,
                adminReply: {
                  message: reply,
                  admin: { name: "You" },
                  createdAt: new Date().toISOString(),
                },
              }
            : f
        );
        setFeedback(updatedFeedback);
        setReplyText((prev) => ({ ...prev, [feedbackId]: "" }));
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
    } finally {
      setSubmittingReply((prev) => ({ ...prev, [feedbackId]: false }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-[#1b222a]/95 to-[#131820]/95 border border-stone-700 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button
          className="absolute top-6 right-6 text-stone-400 hover:text-cyan-300 transition-colors z-10"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-b from-cyan-500/20 to-transparent pt-12 pb-8 px-8 text-center border-b border-stone-700">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500/30 to-amber-500/30 border-2 border-cyan-400/50 flex items-center justify-center">
            <span className="text-4xl">📊</span>
          </div>
          <h1 className="font-['Cinzel'] text-3xl font-bold text-stone-100 mb-2">
            {quest.title}
          </h1>
          <p className="text-stone-400 text-sm">Feedback & Community Reviews</p>
          <div className="flex justify-center gap-6 text-sm mt-4">
            <div className="text-stone-300">
              <span className="text-cyan-300 font-semibold">{feedback.length}</span> Reviews
            </div>
            <div className="text-stone-300">
              <span className="text-amber-300 font-semibold">{quest.avgRating || 0}</span> Avg Rating
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {loadingFeedback ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 text-cyan-300 animate-spin" />
            </div>
          ) : feedback.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-stone-600 mx-auto mb-3" />
              <p className="text-stone-400">No feedback yet. Check back when users complete this quest.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="font-['Cinzel'] text-xl text-stone-100 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-300" />
                Community Feedback ({feedback.length})
              </h3>

              {feedback
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((entry) => (
                  <motion.div
                    key={entry._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#1a1a1a] border border-stone-700 rounded-2xl p-6 space-y-4"
                  >
                    {/* User Rating and Name */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-stone-100 font-semibold">{entry.user?.name || "Anonymous User"}</p>
                        <p className="text-xs text-stone-500">
                          {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-semibold text-amber-300">{entry.rating}</span>
                      </div>
                    </div>

                    {/* User Comment */}
                    <div className="bg-[#171717] rounded-xl p-4 border border-stone-600/50">
                      <p className="text-stone-300 text-sm leading-relaxed">{entry.comment}</p>
                    </div>

                    {/* Admin Reply Section */}
                    {entry.adminReply?.message ? (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="ml-4 border-l-2 border-cyan-500/30 pl-4 py-2"
                      >
                        <p className="text-xs text-cyan-300 mb-2 font-semibold">
                          📌 Your Reply
                        </p>
                        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
                          <p className="text-stone-300 text-sm">{entry.adminReply.message}</p>
                          <p className="text-xs text-stone-500 mt-2">
                            {entry.adminReply.createdAt
                              ? new Date(entry.adminReply.createdAt).toLocaleDateString()
                              : ""}
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3 ml-4 border-l-2 border-amber-500/30 pl-4 py-2"
                      >
                        <label className="text-xs text-amber-300 font-semibold block">
                          💬 Add Your Reply
                        </label>
                        <div className="flex gap-2">
                          <textarea
                            value={replyText[entry._id] || ""}
                            onChange={(e) =>
                              setReplyText((prev) => ({
                                ...prev,
                                [entry._id]: e.target.value,
                              }))
                            }
                            placeholder="Thank the user, address concerns, or provide insights about the quest..."
                            maxLength={300}
                            className="flex-1 bg-[#0f0f0f] border border-stone-600 rounded-lg px-3 py-2 text-xs text-stone-300 placeholder-stone-600 focus:border-cyan-400 focus:outline-none resize-none"
                            rows="3"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-stone-500">
                            {(replyText[entry._id] || "").length}/300
                          </span>
                          <button
                            onClick={() => handleSubmitReply(entry._id)}
                            disabled={
                              !replyText[entry._id]?.trim() ||
                              submittingReply[entry._id]
                            }
                            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-lg hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs font-semibold"
                          >
                            {submittingReply[entry._id] ? (
                              <Loader className="w-3 h-3 animate-spin" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                            Reply
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
