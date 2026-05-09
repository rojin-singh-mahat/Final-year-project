import Leaderboard from "./Leaderboard";
import ProfilePage from "./ProfilePage";
import ProgressPage from "./ProgressPage";
import AchievementsPage from "./AchievementsPage";
import LearnerProfileView from "./LearnerProfileView";
import UserSidebar from "./UserSidebar";
import LessonPlayer from "./LessonPlayer";
import LearnerDashboardHome from "./LearnerDashboardHome";
import QuestFeedbackPage from "./QuestFeedbackPage";
import UserSettingsPage from "./UserSettingsPage";
import { Home, BookOpen, TrendingUp, Trophy, Users, User, X, Search, Play, Zap, Award, Star, MessageSquare, Filter, ChevronDown, Lock, BadgeDollarSign, Medal } from "lucide-react";
import { React, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getUserData } from "../../../utils/auth";
import { FALLBACK_TUTORIAL_QUEST } from "../../../utils/tutorialQuest";
import { motion, AnimatePresence } from "framer-motion";

export default function UserView({ activeNav, setActiveNav, userData, setUserData }) {
  const location = useLocation();
  const navigate = useNavigate();
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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [paymentNotification, setPaymentNotification] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(userData.id || "");
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: "" });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState("");
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackQuest, setFeedbackQuest] = useState(null);
  const [rewardClaim, setRewardClaim] = useState({
    open: false,
    quest: null,
    results: null,
  });
  const [purchasedQuestDetails, setPurchasedQuestDetails] = useState([]);
  const dashboardBackdrop = (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className="absolute -top-28 -left-24 w-[34rem] h-[34rem] rounded-full bg-cyan-500/18 blur-3xl" />
      <div className="absolute -bottom-28 -right-24 w-[30rem] h-[30rem] rounded-full bg-amber-500/16 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(120,130,150,0.3) 1px, transparent 0)",
          backgroundSize: "30px 30px",
        }}
      />
    </div>
  );
   
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
            address: user.address ?? "",
            phoneNumber: user.phoneNumber ?? "",
            showEmail: user.showEmail !== false,
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
            completedQuestIds: Array.isArray(user.completedQuests) ? user.completedQuests.map((q) => q._id || q) : [],
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
              completedQuestIds: Array.isArray(user.completedQuests)
                ? user.completedQuests.map((q) => q._id || q)
                : prev.completedQuestIds || [],
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

  useEffect(() => {
    async function fetchPurchasedQuests() {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/purchased`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          const purchased = Array.isArray(data?.purchasedQuests) ? data.purchasedQuests : [];
          setPurchasedQuestDetails(purchased);
          setUserData((prev) => ({
            ...prev,
            purchasedQuests: purchased.map((q) => q._id || q.id || q),
          }));
        }
      } catch (err) {
        console.error("Error fetching purchased quests:", err);
      }
    }

    fetchPurchasedQuests();
  }, [setUserData]);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "quests", label: "Browse Quests", icon: BookOpen },
    { id: "purchases", label: "My Purchases", icon: BadgeDollarSign },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    // { id: "progress", label: "My Progress", icon: TrendingUp },
    { id: "achievements", label: "Achievements", icon: Medal },
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

  const formatPurchaseDate = (dateValue) => {
    if (!dateValue) return "Unlocked (free quest)";
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return "Purchased date unavailable";
    return `Purchased on ${parsed.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })}`;
  };

  const isPurchasedQuest = (quest) => {
    const questId = quest?._id || quest?.id;
    return Array.isArray(userData.purchasedQuests)
      ? userData.purchasedQuests.some((id) => String(id) === String(questId))
      : false;
  };

  const isQuestUnlockedBySkillTree = (quest) => {
    const difficulty = String(quest?.difficulty || "").toLowerCase();
    const level = Number(userData?.level || 1);
    const completed = Number(userData?.questsCompleted || 0);

    if (difficulty === "beginner") return true;
    if (difficulty === "intermediate") return level >= 3 || completed >= 2;
    if (difficulty === "advanced") return level >= 6 || completed >= 5;
    return true;
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

  // Filter quests based on search, category, and difficulty
  const filteredQuests = allQuests.filter((quest) => {
    const normalizedSearch = searchQuery.toLowerCase().trim();
    const hashtagTokens = normalizedSearch
      .split(/\s+/)
      .filter((token) => token.startsWith("#"))
      .map((token) => token.replace(/^#+/, ""));
    const textQuery = normalizedSearch
      .split(/\s+/)
      .filter((token) => !token.startsWith("#"))
      .join(" ");

    const questHashtags = Array.isArray(quest.hashtags)
      ? quest.hashtags.map((tag) => String(tag).toLowerCase())
      : [];
    const haystack = `${quest.title || ""} ${quest.description || ""}`.toLowerCase();

    const matchesSearch = !textQuery || haystack.includes(textQuery);
    const matchesHashtags = hashtagTokens.length === 0 || hashtagTokens.every((tag) => questHashtags.includes(tag));
    const matchesCategory = selectedCategory === "all" || quest.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === "all" ||
      String(quest.difficulty || "").toLowerCase() === String(selectedDifficulty || "").toLowerCase();
    return matchesSearch && matchesHashtags && matchesCategory && matchesDifficulty;
  });

  // Get unique categories from all quests
  const categories = ["all", ...new Set(allQuests.map((q) => q.category).filter(Boolean))];
  const difficulties = ["all", "Beginner", "Intermediate", "Advanced"];

  const openQuestFromDashboard = async (quest) => {
    setActiveNav("quests");
    await openQuestDetails(quest);
  };

  const getTutorialQuestCandidate = () => {
    const tutorialFromServer = allQuests.find((quest) => {
      const title = String(quest?.title || "").toLowerCase();
      const tags = Array.isArray(quest?.hashtags)
        ? quest.hashtags.map((tag) => String(tag || "").toLowerCase())
        : [];
      return title.includes("tutorial") || tags.includes("tutorial");
    });

    if (tutorialFromServer) {
      return tutorialFromServer;
    }

    return FALLBACK_TUTORIAL_QUEST;
  };

  const startTutorialQuest = () => {
    const tutorialQuest = getTutorialQuestCandidate();
    setSelectedQuest(null);
    setActiveNav("quests");
    setPlayingQuest(tutorialQuest);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const autoPlayTarget = String(params.get("autoplay") || "").toLowerCase();
    if (autoPlayTarget !== "tutorial") return;
    if (playingQuest) return;

    startTutorialQuest();
    navigate("/dashboard", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, allQuests.length, playingQuest]);

  const handleQuestComplete = async (results, finishedQuest) => {
    const user = await getUserData();
    if (user) {
      setUserData({
        username: user.name ?? "",
        email: user.email ?? "",
        address: user.address ?? "",
        phoneNumber: user.phoneNumber ?? "",
        showEmail: user.showEmail !== false,
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
        completedQuestIds: Array.isArray(user.completedQuests)
          ? user.completedQuests.map((q) => q._id || q)
          : [],
        avatar: user.picture ?? "",
      });
      setRecentActivity(Array.isArray(user.recentActivity) ? user.recentActivity : []);
    }
    setPlayingQuest(null);
    setRewardClaim({
      open: true,
      quest: finishedQuest,
      results: results || null,
    });
  };

  // Main render switch
  switch (activeNav) {
    case "dashboard":
      return (
        <>
          {dashboardBackdrop}
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
            purchasedQuestDetails={purchasedQuestDetails}
          />

          <LearnerDashboardHome
            userData={userData}
            allQuests={allQuests}
            loadingQuests={loadingQuests}
            skills={skills}
            recentActivity={recentActivity}
                purchasedQuests={purchasedQuestDetails}
            onOpenQuest={openQuestFromDashboard}
            onOpenBrowse={() => setActiveNav("quests")}
          />
        </>
      );
    
    case "leaderboard":
          return (
            <>
              {dashboardBackdrop}
              <UserSidebar
                userData={userData}
                navItems={navItems}
                activeNav={activeNav}
                setActiveNav={setActiveNav}
                sidebarOpen={sidebarOpen}
                purchasedQuestDetails={purchasedQuestDetails}
              />
              <Leaderboard
                onLearnerClick={(learner) => {
                  setSelectedLearner(learner);
                  setActiveNav("learner-profile");
                }}
              />
            </>
          );

    case "learner-profile":
      return (
        <>
          {dashboardBackdrop}
          <UserSidebar
            userData={userData}
            navItems={navItems}
            activeNav={"leaderboard"}
            setActiveNav={setActiveNav}
            sidebarOpen={sidebarOpen}
            purchasedQuestDetails={purchasedQuestDetails}
          />
          <LearnerProfileView
            learnerData={selectedLearner}
            isCurrentUser={String(selectedLearner?.id) === String(userData?.id)}
            onBack={() => setActiveNav("leaderboard")}
          />
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
            purchasedQuestDetails={purchasedQuestDetails}
          />

          <main className={`ml-auto flex-1 pl-0 relative z-10 ${playingQuest ? "pr-3 py-3" : "pr-8 py-8"}`}>
            {playingQuest ? (
              <LessonPlayer
                quest={playingQuest}
                embedded
                onClose={() => setPlayingQuest(null)}
                onComplete={(results) => handleQuestComplete(results, playingQuest)}
              />
            ) : (
            <div className="mb-8">
              <h1 className="font-['Cinzel'] text-4xl mb-6 bg-gradient-to-r from-amber-100 via-amber-300 to-orange-500 bg-clip-text text-transparent">
                Browse Quests
              </h1>
            
            {/* Search Bar and Filter Toggle */}
            <div className="mb-6 flex gap-3">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  placeholder="Search quests or use #hashtags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1b222a]/90 border border-stone-700 rounded-lg pl-12 pr-4 py-3 text-stone-100 placeholder-stone-500 focus:border-cyan-300/70 focus:outline-none"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-lg border transition-all flex items-center gap-2 ${
                  showFilters
                    ? "border-cyan-300/70 bg-cyan-500/10 text-cyan-300"
                    : "border-stone-700 bg-[#1b222a]/90 text-stone-400 hover:text-stone-200"
                }`}
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </motion.button>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 bg-[#1b222a]/70 border border-stone-700 rounded-xl p-4 overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-['Cinzel'] text-stone-300 mb-2">Category</label>
                      <div className="relative">
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none" />
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full bg-[#0f141a] border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:border-cyan-300/70 focus:outline-none appearance-none cursor-pointer"
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Difficulty Filter */}
                    <div>
                      <label className="block text-sm font-['Cinzel'] text-stone-300 mb-2">Difficulty</label>
                      <div className="relative">
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none" />
                        <select
                          value={selectedDifficulty}
                          onChange={(e) => setSelectedDifficulty(e.target.value)}
                          className="w-full bg-[#0f141a] border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:border-cyan-300/70 focus:outline-none appearance-none cursor-pointer"
                        >
                          {difficulties.map((diff) => (
                            <option key={diff} value={diff}>
                              {diff.charAt(0).toUpperCase() + diff.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  {(selectedCategory !== "all" || selectedDifficulty !== "all" || searchQuery) && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedCategory("all");
                        setSelectedDifficulty("all");
                        setSearchQuery("");
                      }}
                      className="mt-4 w-full px-3 py-2 text-sm bg-stone-800/30 border border-stone-700 rounded-lg text-stone-400 hover:text-stone-200 transition-colors"
                    >
                      Clear All Filters
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quest Cards */}
            {loadingQuests ? (
              <div className="text-center py-16 text-stone-300">Loading quests...</div>
            ) : filteredQuests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredQuests.map((quest, index) => (
                    (() => {
                      const unlockedBySkillTree = isQuestUnlockedBySkillTree(quest);
                      return (
                    <motion.div
                      key={quest._id || quest.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="bg-gradient-to-br from-[#1b222a]/95 to-[#131820]/95 border border-stone-700 rounded-2xl overflow-hidden hover:border-cyan-300/50 transition-all group cursor-pointer relative"
                      onClick={() => unlockedBySkillTree && openQuestDetails(quest)}
                    >
                      <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
                      {!unlockedBySkillTree && (
                        <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center text-center p-4">
                          <Lock className="w-7 h-7 text-amber-300 mb-2" />
                          <p className="text-sm text-amber-200 font-semibold">Locked by Skill Tree</p>
                          <p className="text-xs text-stone-300 mt-1">Complete easier quests to unlock this difficulty.</p>
                        </div>
                      )}
                      {/* Card Header with Gradient */}
                      <div className={`h-2 bg-gradient-to-r ${getDifficultyGradient(quest.difficulty)}`}></div>
                      
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="px-2.5 py-1 rounded-full text-[11px] tracking-wide uppercase border border-stone-600 text-stone-300 bg-[#0f141a]/60">
                            {quest.category || "General"}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${quest.price > 0 ? "text-amber-300 border-amber-400/30 bg-amber-500/10" : "text-emerald-300 border-emerald-400/30 bg-emerald-500/10"}`}>
                            {quest.price > 0 ? `Paid · NPR ${quest.price}` : "Free"}
                          </span>
                        </div>

                        {/* Quest Title & Description */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl mb-2 font-['Cinzel'] text-stone-100 group-hover:text-amber-200 transition-colors line-clamp-1">{quest.title}</h3>
                            <p className="text-sm text-stone-400 line-clamp-3">{quest.description}</p>
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

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-stone-700">
                          <div className="text-center rounded-xl border border-stone-700 bg-[#0f141a]/50 py-2">
                            <div className="text-xs text-stone-500 mb-1">Difficulty</div>
                            <span className={`inline-block text-xs px-3 py-1 rounded-full border ${getDifficultyColor(quest.difficulty)}`}>
                              {quest.difficulty}
                            </span>
                          </div>
                          <div className="text-center rounded-xl border border-stone-700 bg-[#0f141a]/50 py-2">
                            <div className="text-xs text-stone-500 mb-1">XP Reward</div>
                            <div className="text-cyan-300 flex items-center justify-center gap-1">
                              <Zap className="w-4 h-4" />
                              {quest.totalXP || 0}
                            </div>
                          </div>
                          <div className="text-center rounded-xl border border-stone-700 bg-[#0f141a]/50 py-2">
                            <div className="text-xs text-stone-500 mb-1">Lessons</div>
                            <div className="text-stone-100">{quest.lessons?.length || 0}</div>
                          </div>
                        </div>

                        {/* Badge Reward */}
                        {quest.rewardBadge && (
                          <div className="flex items-center gap-2 mb-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                            <Award className="w-5 h-5 text-cyan-300" />
                            <div>
                              <div className="text-xs text-stone-500">Badge Reward</div>
                              <div className="text-sm text-cyan-200">{quest.rewardBadge}</div>
                            </div>
                          </div>
                        )}

                        {/* Community Rating */}
                        <div className="flex items-center justify-between mb-4 text-sm text-stone-300">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span>{quest.avgRating || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4 text-amber-300" />
                            <span>{quest.ratingCount || 0} reviews</span>
                          </div>
                        </div>

                        {/* Purchase Status */}
                        {isPurchasedQuest(quest) && (
                          <div className="mb-4 p-2.5 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg font-semibold text-center">
                            Purchased and ready to play
                          </div>
                        )}

                        {/* View Quest Button */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 text-[#20140a] rounded-lg transition-all font-['Cinzel'] font-bold shadow-lg shadow-amber-500/20"
                        >
                          <Play className="w-4 h-4" />
                          <span>{quest.price > 0 && !isPurchasedQuest(quest) ? "View & Purchase" : "Start Quest"}</span>
                        </motion.button>
                      </div>
                    </motion.div>
                      );
                    })()
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-stone-500 mx-auto mb-4" />
                <p className="text-stone-300">No quests found. Try a different search.</p>
              </div>
            )}
            </div>
            )}
          </main>

          {/* Quest Details Modal */}
          {selectedQuest && !playingQuest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-br from-[#1b222a]/95 to-[#131820]/95 border border-stone-700 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative"
              >
                <button
                  className="absolute top-6 right-6 text-stone-400 hover:text-cyan-300 transition-colors z-10"
                  onClick={() => setSelectedQuest(null)}
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Hero Section */}
                <div className="bg-gradient-to-b from-cyan-500/20 to-transparent pt-12 pb-8 px-8 text-center border-b border-stone-700">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500/30 to-amber-500/30 border-2 border-cyan-400/50 flex items-center justify-center">
                    <span className="text-5xl">⚔️</span>
                  </div>
                  <h1 className="font-['Cinzel'] text-4xl font-bold text-stone-100 mb-2">
                    {selectedQuest.title}
                  </h1>
                  {selectedQuest.description && (
                    <p className="text-stone-400 text-sm mb-4">{selectedQuest.description.substring(0, 100)}...</p>
                  )}
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {Array.isArray(selectedQuest.hashtags) && selectedQuest.hashtags.slice(0, 4).map((tag) => (
                      <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-200 border border-cyan-400/30">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-center gap-6 text-sm">
                    <div className="text-stone-300">
                      <span className="text-cyan-300 font-semibold">{selectedQuest.lessons?.length || 0}</span> Lessons
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${
                        String(selectedQuest.difficulty || "").toLowerCase() === "beginner"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : String(selectedQuest.difficulty || "").toLowerCase() === "intermediate"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-red-500/20 text-red-300 border-red-500/40"
                      }`}>
                        {selectedQuest.difficulty}
                      </span>
                    </div>
                    <div className="text-stone-300">
                      <span className="text-amber-300 font-semibold">~{Math.ceil((selectedQuest.lessons?.length || 1) * 5)}</span> min
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">
                  {/* XP Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6"
                  >
                    <div className="flex items-start gap-4">
                      <Zap className="w-6 h-6 text-amber-300 flex-shrink-0 mt-1" />
                      <div>
                        <div className="text-2xl font-['Cinzel'] font-bold text-stone-100">
                          Earn up to +{selectedQuest.totalXP || 0} XP
                        </div>
                        <p className="text-sm text-stone-400 mt-1">Wrong answers cost -10 XP each</p>
                      </div>
                    </div>
                  </motion.div>

                  

                  {/* Learning Objectives */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <h3 className="font-['Cinzel'] text-xl text-stone-100 mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-cyan-300" />
                      What you'll practise
                    </h3>
                    <ul className="space-y-3 pl-8">
                      {selectedQuest.lessons?.map((lesson, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-stone-300">
                          <div className="w-5 h-5 rounded-full bg-cyan-500/30 border border-cyan-400/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="w-2 h-2 rounded-full bg-cyan-300" />
                          </div>
                          <span className="pt-0.5">{lesson.title}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* Progress Steps */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center"
                  >
                    <p className="text-xs text-stone-400 uppercase tracking-wider mb-4">{selectedQuest.lessons?.length || 0} steps</p>
                    <div className="flex justify-center gap-3 flex-wrap">
                      {selectedQuest.lessons?.map((lesson, idx) => {
                        const isQuiz = idx >= (selectedQuest.lessons?.length || 1) - 1;
                        return (
                          <div key={idx} className="flex flex-col items-center gap-2">
                            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                              isQuiz
                                ? "bg-amber-500/20 border-amber-400/50 text-amber-300"
                                : "bg-blue-500/20 border-blue-400/50 text-blue-300"
                            }`}>
                              {isQuiz ? "Q" : "R"}
                            </div>
                            <span className="text-xs text-stone-400">{isQuiz ? "Quiz" : "Read"}</span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* Price and Purchase Status */}
                  {selectedQuest.price > 0 && !isPurchasedQuest(selectedQuest) && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                      <p className="text-sm text-stone-300">
                        <span className="text-yellow-400 font-bold text-lg">NPR {selectedQuest.price}</span> to purchase
                      </p>
                    </div>
                  )}
                  {selectedQuest.price > 0 && isPurchasedQuest(selectedQuest) && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                      <p className="text-sm text-emerald-300">✓ You have purchased this quest</p>
                    </div>
                  )}

                  {/* Start Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                      if (!isQuestUnlockedBySkillTree(selectedQuest)) {
                        return;
                      }
                      if (selectedQuest.price > 0 && !isPurchasedQuest(selectedQuest)) {
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

                          const data = await res.json();
                          if (data.isFree || data.alreadyPurchased) {
                            setPlayingQuest(selectedQuest);
                            setSelectedQuest(null);
                            return;
                          }

                          const form = document.createElement("form");
                          form.method = "POST";
                          form.action = data.paymentUrl;
                          Object.keys(data.paymentParams).forEach((key) => {
                            const input = document.createElement("input");
                            input.type = "hidden";
                            input.name = key;
                            input.value = data.paymentParams[key];
                            form.appendChild(input);
                          });
                          document.body.appendChild(form);
                          form.submit();
                        } catch (error) {
                          console.error("Payment error:", error);
                          alert("Payment initiation failed. Please try again.");
                        }
                      } else {
                        setPlayingQuest(selectedQuest);
                        setSelectedQuest(null);
                      }
                    }}
                    className="w-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 text-[#20140a] px-6 py-4 rounded-xl font-['Cinzel'] font-bold text-lg transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 hover:shadow-xl"
                  >
                    <Play className="w-5 h-5" />
                    {!isQuestUnlockedBySkillTree(selectedQuest)
                      ? "Locked by Skill Tree"
                      : selectedQuest.price > 0 && !isPurchasedQuest(selectedQuest)
                      ? `Start Skill → NPR ${selectedQuest.price}`
                      : "Start Skill →"}
                  </motion.button>

                  {/* What Learners Think */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22 }}
                    className="bg-[#151b24] border border-stone-700 rounded-2xl p-6"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquare className="w-5 h-5 text-cyan-300" />
                      <h3 className="font-['Cinzel'] text-xl text-stone-100">What learners thought</h3>
                      <span className="ml-auto text-xs text-stone-400">
                        {Array.isArray(selectedQuest.feedback) ? selectedQuest.feedback.length : 0} reviews
                      </span>
                    </div>

                    {Array.isArray(selectedQuest.feedback) && selectedQuest.feedback.length > 0 ? (
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                        {[...selectedQuest.feedback]
                          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                          .slice(0, 5)
                          .map((entry) => (
                            <div key={entry._id} className="p-3 bg-[#0f141d] border border-stone-700 rounded-xl">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <div className="text-sm text-white font-medium">{entry.user?.name || "Learner"}</div>
                                  <div className="text-xs text-stone-500">
                                    {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : ""}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 text-amber-300">
                                  <Star className="w-4 h-4 fill-amber-300" />
                                  <span className="text-sm">{entry.rating}</span>
                                </div>
                              </div>
                              <p className="text-sm text-stone-300">{entry.comment}</p>
                              {entry.adminReply?.message && (
                                <div className="mt-2 p-2 bg-cyan-500/10 border border-cyan-400/30 rounded-lg">
                                  <p className="text-xs text-cyan-300 mb-1">
                                    Admin reply from {entry.adminReply?.admin?.name || "Admin"}
                                  </p>
                                  <p className="text-sm text-stone-300">{entry.adminReply.message}</p>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-stone-400">No reviews yet. Complete this quest and be the first to share feedback.</p>
                    )}
                  </motion.div>
                  
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Feedback Page */}
          {showFeedback && feedbackQuest && (
            <QuestFeedbackPage
              quest={feedbackQuest}
              onClose={() => {
                setShowFeedback(false);
                setFeedbackQuest(null);
              }}
            />
          )}

          {/* Reward Claim Popup */}
          {rewardClaim.open && rewardClaim.quest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-lg bg-gradient-to-br from-[#1b222a] to-[#111722] border border-cyan-400/30 rounded-2xl p-6"
              >
                <div className="text-center mb-5">
                  <div className="w-16 h-16 rounded-full mx-auto mb-3 bg-gradient-to-br from-cyan-400/25 to-amber-300/25 border border-cyan-300/40 flex items-center justify-center text-3xl">
                    🏆
                  </div>
                  <h3 className="font-['Cinzel'] text-2xl text-white mb-1">Quest Completed</h3>
                  <p className="text-stone-300">{rewardClaim.quest.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-[#0f141d] border border-stone-700 text-center">
                    <div className="text-xs text-stone-400 mb-1">XP Earned</div>
                    <div className="text-xl text-cyan-300 font-bold">+{rewardClaim.results?.xpEarned ?? 0}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0f141d] border border-stone-700 text-center">
                    <div className="text-xs text-stone-400 mb-1">Level</div>
                    <div className="text-xl text-amber-300 font-bold">{rewardClaim.results?.newLevel ?? userData.level}</div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const nextQuest = rewardClaim.quest;
                    setRewardClaim({ open: false, quest: null, results: null });
                    setFeedbackQuest(nextQuest);
                    setShowFeedback(true);
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300 text-[#0d1118] font-bold"
                >
                  Claim Rewards
                </motion.button>
              </motion.div>
            </motion.div>
          )}


        </>
      );

    case "purchases":
      return (
        <>
          {dashboardBackdrop}
          <UserSidebar
            userData={userData}
            navItems={navItems}
            activeNav={activeNav}
            setActiveNav={setActiveNav}
            sidebarOpen={sidebarOpen}
            purchasedQuestDetails={purchasedQuestDetails}
          />
          <main className="ml-auto flex-1 pr-8 py-8 pl-0 relative z-10">
            <h1 className="font-['Cinzel'] text-4xl mb-6 bg-gradient-to-r from-amber-100 via-amber-300 to-orange-500 bg-clip-text text-transparent">
              My Purchases
            </h1>

            {purchasedQuestDetails.length === 0 ? (
              <div className="bg-[#1b222a]/90 border border-stone-700 rounded-2xl p-8 text-stone-300">
                You have not purchased any quests yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {purchasedQuestDetails.map((quest) => (
                  <button
                    type="button"
                    key={quest._id || quest.id}
                    onClick={() => {
                      openQuestDetails(quest);
                      setActiveNav("quests");
                    }}
                    className="text-left bg-gradient-to-br from-[#1b222a]/95 to-[#131820]/90 border border-stone-700 rounded-2xl p-5 hover:border-cyan-300/50 transition-all"
                  >
                    <h3 className="text-xl font-['Cinzel'] text-stone-100 mb-2">{quest.title}</h3>
                    <p className="text-sm text-stone-400 mb-3 line-clamp-2">{quest.description || "No description"}</p>
                    <div className="flex items-center justify-between text-xs text-stone-300 mb-3">
                      <span>{quest.lessons?.length || 0} lessons</span>
                      <span className="text-amber-300">NPR {Number(quest.price || 0).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-stone-400 mb-3">{formatPurchaseDate(quest.purchasedAt)}</p>
                    <div className="text-xs text-cyan-300 font-semibold">Open Quest</div>
                  </button>
                ))}
              </div>
            )}
          </main>
        </>
      );
    case "progress":
      return (
        <>
          {dashboardBackdrop}
          <UserSidebar
            userData={userData}
            navItems={navItems}
            activeNav={activeNav}
            setActiveNav={setActiveNav}
            sidebarOpen={sidebarOpen}
            purchasedQuestDetails={purchasedQuestDetails}
          />
          <ProgressPage userData={userData} skills={skills} />
        </>
      );

    case "achievements":
      return (
        <>
          {dashboardBackdrop}
          <UserSidebar
            userData={userData}
            navItems={navItems}
            activeNav={activeNav}
            setActiveNav={setActiveNav}
            sidebarOpen={sidebarOpen}
            purchasedQuestDetails={purchasedQuestDetails}
          />
          <AchievementsPage userData={userData} />
        </>
      );

    case "settings":
      return (
        <>
          {dashboardBackdrop}
          <UserSidebar
            userData={userData}
            navItems={navItems}
            activeNav={activeNav}
            setActiveNav={setActiveNav}
            sidebarOpen={sidebarOpen}
            purchasedQuestDetails={purchasedQuestDetails}
          />
          <UserSettingsPage
            userData={userData}
            onAvatarUpdated={(picture) => {
              setUserData((prev) => ({
                ...prev,
                picture,
                avatar: picture,
              }));
            }}
            onProfileUpdated={(profile) => {
              if (!profile) return;
              setUserData((prev) => ({
                ...prev,
                ...profile,
                username: profile.name || prev?.username || "",
                email: profile.email || prev?.email || "",
                picture: profile.picture || prev?.picture || "",
                avatar: profile.picture || prev?.avatar || "",
              }));
            }}
          />
        </>
      );
    
    default:
      return (
        <>
          {dashboardBackdrop}
          <UserSidebar
            userData={userData}
            navItems={navItems}
            activeNav={activeNav}
            setActiveNav={setActiveNav}
            sidebarOpen={sidebarOpen}
          />
          <main className="ml-auto flex-1 pr-8 py-8 pl-0 relative z-10">
            {activeNav === "profile" ? (
              <ProfilePage
                userData={userData}
                onAvatarUpdated={(picture) => {
                  setUserData((prev) => ({
                    ...prev,
                    picture,
                    avatar: picture,
                  }));
                }}
              />
            ) : (
              <div className="text-center py-16 text-[#b3b3b3]">Feature coming soon...</div>
            )}
          </main>
        </>
      );
  }
}
