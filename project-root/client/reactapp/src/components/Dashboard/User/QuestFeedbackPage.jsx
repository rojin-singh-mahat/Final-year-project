import { useState } from "react";
import { motion } from "framer-motion";
import { X, Star, MessageSquare } from "lucide-react";

export default function QuestFeedbackPage({ quest, onClose }) {
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: "" });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState("");

  const handleSubmitFeedback = async () => {
    const comment = (feedbackForm.comment || "").trim();
    if (!comment) {
      setFeedbackError("Please add a comment.");
      return;
    }

    setSubmittingFeedback(true);
    setFeedbackError("");
    setFeedbackSuccess("");

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        setFeedbackError("You need to be logged in to leave feedback.");
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/quests/${quest._id || quest.id}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: Number(feedbackForm.rating),
          comment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedbackError(data?.error || "Unable to submit feedback right now.");
        return;
      }

      setFeedbackSuccess("Feedback saved. Thank you!");
      setFeedbackForm({ rating: 5, comment: "" });
      setTimeout(() => {
        onClose?.();
      }, 2000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setFeedbackError("Unable to submit feedback right now.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div className="bg-gradient-to-br from-[#1b222a]/95 to-[#131820]/95 border border-stone-700 rounded-2xl shadow-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          className="absolute top-4 right-4 text-stone-300 hover:text-cyan-300 transition-colors"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-['Cinzel'] font-bold text-stone-100 mb-2">
            Quest Complete!
          </h1>
          <p className="text-stone-400">
            Great job finishing <span className="text-amber-200">{quest?.title}</span>. Help improve this quest by sharing your experience.
          </p>
        </div>

        {/* Rating and Feedback Form */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0f141a]/50 border border-stone-700 rounded-2xl p-6 mb-6"
        >
          <h2 className="text-2xl font-['Cinzel'] text-stone-100 mb-6">Share Your Feedback</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-stone-300 mb-2">How would you rate this quest?</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFeedbackForm((prev) => ({ ...prev, rating }))}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      feedbackForm.rating === rating
                        ? "bg-amber-500/20 text-amber-200 border-amber-400/50"
                        : "bg-[#1b222a]/50 text-stone-300 border-stone-700 hover:text-cyan-200"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Star className={`w-4 h-4 ${feedbackForm.rating >= rating ? "fill-amber-400" : ""}`} />
                      {rating}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-stone-300 mb-2">What did you think? (Required)</label>
              <textarea
                value={feedbackForm.comment}
                onChange={(e) =>
                  setFeedbackForm((prev) => ({
                    ...prev,
                    comment: e.target.value,
                  }))
                }
                placeholder="Share what you learned, what was helpful, or what could be improved..."
                maxLength={500}
                className="w-full min-h-[120px] bg-[#1b222a]/50 border border-stone-700 rounded-lg px-4 py-3 text-stone-100 placeholder-stone-500 focus:border-cyan-300/70 focus:outline-none"
              />
              <div className="text-xs text-stone-400 mt-1">{feedbackForm.comment.length}/500</div>
            </div>

            {feedbackError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
                {feedbackError}
              </div>
            )}
            {feedbackSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm">
                {feedbackSuccess}
              </div>
            )}

            <button
              onClick={handleSubmitFeedback}
              disabled={submittingFeedback || !feedbackForm.comment.trim()}
              className="w-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 text-[#20140a] px-6 py-3 rounded-xl font-['Cinzel'] font-bold transition-all hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submittingFeedback ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </motion.section>

        {/* Community Feedback Section */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0f141a]/50 border border-stone-700 rounded-2xl p-6"
        >
          <h3 className="text-xl font-['Cinzel'] text-stone-100 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-300" />
            Community Reviews ({quest?.ratingCount || 0})
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {Array.isArray(quest?.feedback) && quest.feedback.length > 0 ? (
              [...quest.feedback]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((entry) => (
                  <div
                    key={entry._id}
                    className="bg-[#1b222a]/60 border border-stone-700 rounded-xl p-4 hover:border-stone-600 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-stone-100">{entry.user?.name || "User"}</p>
                        <p className="text-xs text-stone-500">{entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : ""}</p>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < entry.rating ? "fill-yellow-400" : ""}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-stone-300 mb-2">{entry.comment}</p>
                    {entry.adminReply?.message && (
                      <div className="mt-3 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                        <p className="text-xs font-semibold text-cyan-300 mb-1">
                          Reply from {entry.adminReply?.admin?.name || "Admin"}
                        </p>
                        <p className="text-sm text-stone-300">{entry.adminReply.message}</p>
                      </div>
                    )}
                  </div>
                ))
            ) : (
              <div className="text-center py-8 text-stone-400">
                <p>No feedback yet. Be the first to review this quest!</p>
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
