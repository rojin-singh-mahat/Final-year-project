import StatsCards from "./StatCards";
import RecentActivity from "./RecentActivity";
import RecommendedQuests from "./RecommendedQuests";
import SkillProgress from "./SkillProgress";
import Leaderboard from "./Leaderboard";
import ProfilePage from "./ProfilePage";
import UserSidebar from "./UserSidebar";
import LessonPlayer from "./LessonPlayer";
import { Home, BookOpen, TrendingUp, Trophy, Users, User, X, Search, Play, Zap, Award, Star, MessageSquare } from "lucide-react";
import { React, useState, useEffect } from "react";
import { getUserData } from "../../../utils/auth";
import { motion, AnimatePresence } from "framer-motion";

export default function UserView({ activeNav, setActiveNav, userData, setUserData }) {
  const [recentActivity, setRecentActivity] = useState(userData.recentActivity);
  const [recommendedQuests, setRecommendedQuests] = useState(
    userData.recommendedQuests
  );
  const [skills, setSkills] = useState(userData.skills);
  const [_loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [allQuests, setAllQuests] = useState([]);
  const [loadingQuests, setLoadingQuests] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState(null);
    const [playingQuest, setPlayingQuest] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentNotification, setPaymentNotification] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(userData.id || "");
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: "" });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState("");
   
  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      setLoading(true);
      try {
        const user = await getUserData();
        if (mounted && user) {
          // Map backend values directly. Use nullish coalescing so 0 and empty arrays overwrite defaults.
          setUserData({
            id: user.id ?? "",
            username: user.name ?? "",
            email: user.email ?? "",
            level: user.level ?? 1,
            totalXP: user.xp ?? 0,
            xpToNextLevel: user.xpToNextLevel ?? 500,
            currentXP: user.currentXP ?? 0,
            streak: user.streak ?? 0,
            questsCompleted: user.questsCompleted ?? 0,
            totalQuests: user.totalQuests ?? 0,
            badgesEarned: Array.isArray(user.badges) ? user.badges.length : 0,
            badges: Array.isArray(user.badges) ? user.badges : [],
            avatar: user.picture ?? "",
            purchasedQuests: Array.isArray(user.purchasedQuests) ? user.purchasedQuests.map(q => q._id || q) : [],
          });

          // Replace arrays/objects even if empty — backend is authoritative
          setRecentActivity(
            Array.isArray(user.recentActivity) ? user.recentActivity : []
          );
          setCurrentUserId(user.id ?? "");
          setRecommendedQuests(
            Array.isArray(user.recommendedQuests) ? user.recommendedQuests : []
          );
          setSkills(user.skills ? user.skills : {});
        }
      } catch (e) {
        console.error("Error loading user for dashboard:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  // Check for payment status from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const transactionId = params.get('transaction');
    const reason = params.get('reason');

    if (paymentStatus) {
      if (paymentStatus === 'success') {
        setPaymentNotification({
          type: 'success',
          message: `Payment successful! Transaction ID: ${transactionId}`,
        });
        // Reload user data to get updated purchasedQuests
        getUserData().then(user => {
          if (user) {
            setUserData(prev => ({
              ...prev,
              purchasedQuests: Array.isArray(user.purchasedQuests)
                ? user.purchasedQuests.map(q => q._id || q)
                : [],
            }));
          }
        });
      } else {
        setPaymentNotification({
          type: 'error',
          message: `Payment failed: ${reason || 'Unknown error'}`,
        });
      }

      // Clear URL params
      window.history.replaceState({}, '', '/dashboard');
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => setPaymentNotification(null), 5000);
    }
  }, []);

  // Fetch all quests for browsing
  useEffect(() => {
    async function fetchQuests() {
      setLoadingQuests(true);
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/quests`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setAllQuests(data);
        }
      } catch (err) {
        console.error("Error fetching quests:", err);
      } finally {
        setLoadingQuests(false);
      }
    }
    fetchQuests();
  }, []);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "quests", label: "Browse Quests", icon: BookOpen },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "progress", label: "My Progress", icon: TrendingUp },
    { id: "achievements", label: "Achievements", icon: Trophy },
    { id: "profile", label: "Profile", icon: User },
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Intermediate":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Advanced":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getDifficultyGradient = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': case 'beginner': return 'from-green-500 to-emerald-500';
      case 'Intermediate': case 'intermediate': return 'from-yellow-500 to-orange-500';
      case 'Advanced': case 'advanced': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const isPurchasedQuest = (quest) => {
    const questId = quest?._id || quest?.id;
    return Array.isArray(userData.purchasedQuests)
      ? userData.purchasedQuests.some((id) => String(id) === String(questId))
      : false;
  };

  const openQuestDetails = async (quest) => {
    setSelectedQuest(quest);
    setFeedbackError("");
    setFeedbackSuccess("");

    const myFeedback = Array.isArray(quest.feedback)
      ? quest.feedback.find((entry) => String(entry.user?._id || entry.user) === String(currentUserId))
      : null;

    setFeedbackForm({
      rating: myFeedback?.rating || 5,
      comment: myFeedback?.comment || "",
    });

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/quests/${quest._id || quest.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok && data) {
        setSelectedQuest(data);
        const latestMyFeedback = Array.isArray(data.feedback)
          ? data.feedback.find((entry) => String(entry.user?._id || entry.user) === String(currentUserId))
          : null;

        setFeedbackForm({
          rating: latestMyFeedback?.rating || 5,
          comment: latestMyFeedback?.comment || "",
        });
      }
    } catch (error) {
      console.error("Error loading quest details:", error);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedQuest) return;

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

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/quests/${selectedQuest._id || selectedQuest.id}/feedback`, {
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

      setSelectedQuest(data);
      setAllQuests((prev) =>
        prev.map((quest) =>
          String(quest._id || quest.id) === String(data._id || data.id) ? data : quest
        )
      );
      setFeedbackSuccess("Feedback saved.");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setFeedbackError("Unable to submit feedback right now.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Filter quests based on search
  const filteredQuests = allQuests.filter((quest) =>
    quest.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Main render switch
  switch (activeNav) {
    case "dashboard":
      return (
        <>
          {/* Payment Notification */}
          {paymentNotification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border ${
                paymentNotification.type === 'success'
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-lg font-semibold">{paymentNotification.message}</div>
                <button
                  onClick={() => setPaymentNotification(null)}
                  className="ml-4 hover:opacity-70"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
          
          <UserSidebar
            userData={userData}
            navItems={navItems}
            activeNav={activeNav}
            setActiveNav={setActiveNav}
            sidebarOpen={sidebarOpen}
          />

          <main className="m-auto flex-1 pr-8 py-8 pl-0 relative z-10">
            <StatsCards userData={userData} />

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-5 gap-8 mb-8">
              <RecentActivity recentActivity={userData.recentActivity} />
              <RecommendedQuests quests={userData.recommendedQuests} />
            </div>

            <SkillProgress skills={userData.skills} />
          </main>
        </>
      );
    
    case "leaderboard":
          return (
            <>
              <UserSidebar
                userData={userData}
                navItems={navItems}
                activeNav={activeNav}
                setActiveNav={setActiveNav}
                sidebarOpen={sidebarOpen}
              />
              <Leaderboard />
            </>
          );
    
    case "quests":
      return (
        <>
          {/* Payment Notification */}
          {paymentNotification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border ${
                paymentNotification.type === 'success'
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-lg font-semibold">{paymentNotification.message}</div>
                <button
                  onClick={() => setPaymentNotification(null)}
                  className="ml-4 hover:opacity-70"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
          
          <UserSidebar
            userData={userData}
            navItems={navItems}
            activeNav={activeNav}
            setActiveNav={setActiveNav}
            sidebarOpen={sidebarOpen}
          />

          <main className="ml-auto flex-1 pr-8 py-8 pl-0 relative z-10">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white via-[#1DB954] to-[#8b5cf6] bg-clip-text text-transparent">
                Browse Quests
              </h1>
            
            {/* Search Bar */}
            <div className="mb-6 relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#808080]" />
              <input
                type="text"
                placeholder="Search quests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#282828] rounded-lg pl-12 pr-4 py-3 text-white placeholder-[#808080] focus:border-[#1DB954] focus:outline-none"
              />
            </div>

            {/* Quest Cards */}
            {loadingQuests ? (
              <div className="text-center py-16 text-[#b3b3b3]">Loading quests...</div>
            ) : filteredQuests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {filteredQuests.map((quest, index) => (
                    <motion.div
                      key={quest._id || quest.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="bg-gradient-to-br from-[#1a1a1a] to-[#121212] border border-[#282828] rounded-2xl overflow-hidden hover:border-[#1DB954]/50 transition-all group cursor-pointer"
                      onClick={() => openQuestDetails(quest)}
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

                        {/* Community Rating */}
                        <div className="flex items-center justify-between mb-4 text-sm text-[#b3b3b3]">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span>{quest.avgRating || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4 text-[#8b5cf6]" />
                            <span>{quest.ratingCount || 0} reviews</span>
                          </div>
                        </div>

                        {/* Price Tag */}
                        {quest.price > 0 && (
                          <div className="flex items-center justify-between mb-4 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="text-yellow-500 font-bold text-lg">NPR {quest.price}</div>
                              <div className="text-xs text-[#808080]">Nepali Rupees</div>
                            </div>
                            {isPurchasedQuest(quest) && (
                              <div className="text-xs text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full font-semibold border border-green-500/30">
                                ✓ Purchased
                              </div>
                            )}
                          </div>
                        )}

                        {/* View Quest Button */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1DB954] hover:bg-[#1ed760] text-black rounded-lg transition-all font-semibold"
                        >
                          <Play className="w-4 h-4" />
                          <span>View Quest</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-[#808080] mx-auto mb-4" />
                <p className="text-[#b3b3b3]">No quests found. Try a different search.</p>
              </div>
            )}
            </div>
          </main>

          {/* Quest Details Modal */}
          {selectedQuest && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-[#181818] border border-[#282828] rounded-2xl shadow-xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
                <button
                  className="absolute top-4 right-4 text-[#b3b3b3] hover:text-[#1DB954] transition-colors"
                  onClick={() => setSelectedQuest(null)}
                >
                  <X className="w-6 h-6" />
                </button>
                
                <h2 className="text-3xl font-bold mb-2 text-[#1DB954]">{selectedQuest.title}</h2>
                <div className="mb-4 text-[#b3b3b3]">{selectedQuest.description}</div>
                
                <div className="flex gap-4 text-xs mb-6 flex-wrap">
                  <span className={`px-3 py-1 rounded-full border ${getDifficultyColor(selectedQuest.difficulty)}`}>
                    {selectedQuest.difficulty?.charAt(0).toUpperCase() + selectedQuest.difficulty?.slice(1)}
                  </span>
                  <span className="text-[#808080]">{selectedQuest.lessons?.length || 0} lessons</span>
                  <span className="text-[#1DB954]">{selectedQuest.totalXP || 0} XP</span>
                  {selectedQuest.rewardBadge && (
                    <span className="text-[#8b5cf6]">🏅 {selectedQuest.rewardBadge}</span>
                  )}
                  {selectedQuest.price > 0 && (
                    <span className="text-yellow-500 font-bold">NPR {selectedQuest.price}</span>
                  )}
                  <span className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-3.5 h-3.5 fill-yellow-500" />
                    {selectedQuest.avgRating || 0}
                  </span>
                  <span className="text-[#808080]">{selectedQuest.ratingCount || 0} reviews</span>
                </div>

                {/* Community Feedback */}
                <div className="mb-6 p-4 bg-[#121212] border border-[#282828] rounded-xl">
                  <h3 className="text-lg font-semibold mb-3 text-white">Community Feedback</h3>

                  <div className="grid sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-[#808080] mb-1">Your Rating</label>
                      <select
                        value={feedbackForm.rating}
                        onChange={(e) => setFeedbackForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                        className="w-full bg-[#1a1a1a] border border-[#282828] rounded-lg px-3 py-2 text-white focus:border-[#1DB954] focus:outline-none"
                      >
                        <option value={5}>5 - Excellent</option>
                        <option value={4}>4 - Good</option>
                        <option value={3}>3 - Average</option>
                        <option value={2}>2 - Poor</option>
                        <option value={1}>1 - Very Poor</option>
                      </select>
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-xs text-[#808080] mb-1">Your Comment</label>
                      <textarea
                        value={feedbackForm.comment}
                        onChange={(e) => setFeedbackForm((prev) => ({ ...prev, comment: e.target.value }))}
                        className="w-full min-h-[90px] bg-[#1a1a1a] border border-[#282828] rounded-lg px-3 py-2 text-white placeholder-[#808080] focus:border-[#1DB954] focus:outline-none"
                        placeholder="Share what you think about this quest..."
                        maxLength={500}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <button
                      type="button"
                      onClick={handleSubmitFeedback}
                      disabled={submittingFeedback}
                      className="px-4 py-2 bg-[#1DB954] hover:bg-[#1ed760] disabled:opacity-60 text-black rounded-lg transition-all"
                    >
                      {submittingFeedback ? "Saving..." : "Submit Feedback"}
                    </button>
                    <span className="text-xs text-[#808080]">Visible to all users</span>
                  </div>

                  {feedbackError && <div className="text-sm text-red-400 mb-3">{feedbackError}</div>}
                  {feedbackSuccess && <div className="text-sm text-green-400 mb-3">{feedbackSuccess}</div>}

                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    {Array.isArray(selectedQuest.feedback) && selectedQuest.feedback.length > 0 ? (
                      [...selectedQuest.feedback]
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .map((entry) => (
                          <div key={entry._id} className="p-3 bg-[#181818] border border-[#282828] rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <div className="text-sm text-white">{entry.user?.name || "User"}</div>
                              <div className="flex items-center gap-1 text-yellow-500 text-xs">
                                <Star className="w-3.5 h-3.5 fill-yellow-500" />
                                {entry.rating}
                              </div>
                            </div>
                            <div className="text-sm text-[#b3b3b3] mb-1">{entry.comment}</div>
                            {entry.adminReply?.message && (
                              <div className="mt-2 p-2 bg-[#1DB954]/5 border border-[#1DB954]/30 rounded-md">
                                <div className="text-xs text-[#1DB954] mb-1">
                                  Reply from {entry.adminReply?.admin?.name || "Admin"}
                                </div>
                                <div className="text-sm text-[#b3b3b3]">{entry.adminReply.message}</div>
                              </div>
                            )}
                            <div className="text-xs text-[#808080]">{entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : ""}</div>
                          </div>
                        ))
                    ) : (
                      <div className="text-sm text-[#808080]">No feedback yet. Be the first to review this quest.</div>
                    )}
                  </div>
                </div>

                {/* Price and Access Info */}
                {selectedQuest.price > 0 && !isPurchasedQuest(selectedQuest) && (
                  <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-yellow-500 font-bold text-2xl">NPR {selectedQuest.price}</div>
                      <div className="text-[#808080]">Nepali Rupees</div>
                    </div>
                    <p className="text-sm text-[#b3b3b3]">Purchase this quest to access all lessons and earn rewards</p>
                  </div>
                )}
                {selectedQuest.price > 0 && isPurchasedQuest(selectedQuest) && (
                  <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <div className="text-green-400 font-semibold">✓ Purchased</div>
                  </div>
                )}

                {/* Lessons */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-white mb-4">Lessons</h3>
                  {selectedQuest.lessons?.map((lesson, idx) => (
                    <div key={idx} className="bg-[#232323] border border-[#282828] rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <BookOpen className="w-5 h-5 text-[#1DB954]" />
                        <span className="text-lg font-semibold text-white">
                          Lesson {idx + 1}: {lesson.title}
                        </span>
                        <span className="ml-auto text-xs text-[#808080]">{lesson.xp || 0} XP</span>
                      </div>
                      <div className="text-[#b3b3b3] line-clamp-3">{lesson.content}</div>
                    </div>
                  ))}
                </div>

                <button
                  className="mt-6 w-full bg-gradient-to-r from-[#1DB954] to-[#1ed760] hover:from-[#1ed760] hover:to-[#1DB954] text-black px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-[#1DB954]/30 flex items-center justify-center gap-2"
                  onClick={async () => {
                    // Check if quest requires payment
                    if (selectedQuest.price > 0 && !isPurchasedQuest(selectedQuest)) {
                      // Initiate eSewa payment
                      try {
                        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
                        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/initiate`, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({ questId: selectedQuest._id || selectedQuest.id }),
                        });

                        if (!res.ok) {
                          alert("Payment initiation failed. Please try again.");
                          return;
                        }

                        const data = await res.json();
                        
                        // Handle free or already purchased quests
                        if (data.isFree || data.alreadyPurchased) {
                          if (data.alreadyPurchased) {
                            alert("Quest already purchased!");
                          }
                          setPlayingQuest(selectedQuest);
                          setSelectedQuest(null);
                          return;
                        }

                        // Create form and submit to eSewa
                        const form = document.createElement('form');
                        form.method = 'POST';
                        form.action = data.paymentUrl;

                        // Add all payment parameters as hidden inputs
                        Object.keys(data.paymentParams).forEach(key => {
                          const input = document.createElement('input');
                          input.type = 'hidden';
                          input.name = key;
                          input.value = data.paymentParams[key];
                          form.appendChild(input);
                        });

                        document.body.appendChild(form);
                        form.submit();
                      } catch (error) {
                        console.error("Payment error:", error);
                        alert("Payment initiation failed. Please try again.");
                        return;
                      }
                    } else {
                      // Free quest or already purchased - start directly
                      setPlayingQuest(selectedQuest);
                      setSelectedQuest(null);
                    }
                  }}
                >
                  <Play className="w-5 h-5" />
                  {selectedQuest.price > 0 && !isPurchasedQuest(selectedQuest)
                    ? `Purchase & Start Quest (NPR ${selectedQuest.price})`
                    : 'Start Quest'}
                </button>
              </div>
            </div>
          )}

            {/* Lesson Player */}
            {playingQuest && (
              <LessonPlayer
                quest={playingQuest}
                onClose={() => setPlayingQuest(null)}
                onComplete={async (results) => {
                  // Reload user data to update stats
                  const user = await getUserData();
                  if (user) {
                    setUserData({
                      username: user.name ?? "",
                      email: user.email ?? "",
                      level: user.level ?? 1,
                      totalXP: user.xp ?? 0,
                      xpToNextLevel: user.xpToNextLevel ?? 500,
                      currentXP: user.currentXP ?? 0,
                      streak: user.streak ?? 0,
                      questsCompleted: user.questsCompleted ?? 0,
                      totalQuests: user.totalQuests ?? 0,
                      badgesEarned: Array.isArray(user.badges) ? user.badges.length : 0,
                      badges: Array.isArray(user.badges) ? user.badges : [],
                      purchasedQuests: Array.isArray(user.purchasedQuests)
                        ? user.purchasedQuests.map((q) => q._id || q)
                        : [],
                      avatar: user.picture ?? "",
                    });
                    setRecentActivity(
                      Array.isArray(user.recentActivity) ? user.recentActivity : []
                    );
                  }
                }}
              />
            )}
        </>
      );
    
    
    default:
      return (
        <>
          <UserSidebar
            userData={userData}
            navItems={navItems}
            activeNav={activeNav}
            setActiveNav={setActiveNav}
            sidebarOpen={sidebarOpen}
          />
          <main className="ml-auto flex-1 pr-8 py-8 pl-0 relative z-10">
            {activeNav === "profile" ? (
              <ProfilePage userData={userData} />
            ) : (
              <div className="text-center py-16 text-[#b3b3b3]">Feature coming soon...</div>
            )}
          </main>
        </>
      );
  }
}
