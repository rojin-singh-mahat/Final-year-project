import StatsCards from "./StatCards";
import RecentActivity from "./RecentActivity";
import RecommendedQuests from "./RecommendedQuests";
import SkillProgress from "./SkillProgress";
import UserSidebar from "./UserSidebar";
import LessonPlayer from "./LessonPlayer";
import { Home, BookOpen, TrendingUp, Trophy, Users, X, Search, Play } from "lucide-react";
import { React, useState, useEffect } from "react";
import { getUserData } from "../../../utils/auth";
import { motion } from "framer-motion";

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
   
  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      setLoading(true);
      try {
        const user = await getUserData();
        if (mounted && user) {
          // Map backend values directly. Use nullish coalescing so 0 and empty arrays overwrite defaults.
          setUserData({
            username: user.name ?? "",
            level: user.level ?? 1,
            totalXP: user.xp ?? 0,
            xpToNextLevel: user.xpToNextLevel ?? 500,
            currentXP: user.currentXP ?? 0,
            streak: user.streak ?? 0,
            questsCompleted: user.questsCompleted ?? 0,
            totalQuests: user.totalQuests ?? 0,
            badgesEarned: Array.isArray(user.badges) ? user.badges.length : 0,
            avatar: user.picture ?? "",
          });

          // Replace arrays/objects even if empty — backend is authoritative
          setRecentActivity(
            Array.isArray(user.recentActivity) ? user.recentActivity : []
          );
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
    { id: "progress", label: "My Progress", icon: TrendingUp },
    { id: "achievements", label: "Achievements", icon: Trophy },
    { id: "leaderboard", label: "Leaderboard", icon: Users },
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

  // Filter quests based on search
  const filteredQuests = allQuests.filter((quest) =>
    quest.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Main render switch
  switch (activeNav) {
    case "dashboard":
      return (
        <>
          <UserSidebar
            userData={userData}
            navItems={navItems}
            activeNav={activeNav}
            setActiveNav={setActiveNav}
            sidebarOpen={sidebarOpen}
          />

          <StatsCards userData={userData} />

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-5 gap-8 mb-8">
            <RecentActivity recentActivity={userData.recentActivity} />
            <RecommendedQuests quests={userData.recommendedQuests} />
          </div>

          <SkillProgress skills={userData.skills} />
        </>
      );
    
    case "quests":
      return (
        <>
          <UserSidebar
            userData={userData}
            navItems={navItems}
            activeNav={activeNav}
            setActiveNav={setActiveNav}
            sidebarOpen={sidebarOpen}
          />

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-6 text-[#1DB954]">Browse Quests</h1>
            
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuests.map((quest) => (
                  <motion.div
                    key={quest._id || quest.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-[#181818] to-[#232323] border border-[#282828] rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-pointer"
                    onClick={() => setSelectedQuest(quest)}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <BookOpen className="w-6 h-6 text-[#1DB954]" />
                        <span className="text-lg font-semibold text-white">{quest.title}</span>
                      </div>
                      <div className="text-[#b3b3b3] mb-4 line-clamp-2">{quest.description}</div>
                      <div className="flex gap-3 flex-wrap mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs border ${getDifficultyColor(quest.difficulty)}`}>
                          {quest.difficulty?.charAt(0).toUpperCase() + quest.difficulty?.slice(1)}
                        </span>
                        <span className="text-xs text-[#808080]">{quest.lessons?.length || 0} lessons</span>
                        <span className="text-xs text-[#1DB954]">{quest.totalXP || 0} XP</span>
                      </div>
                    </div>
                    <button className="mt-4 bg-[#1DB954] hover:bg-[#1ed760] text-black px-6 py-2 rounded-full font-semibold transition-all">
                      <div className="flex items-center gap-2 justify-center">
                        <Play className="w-4 h-4" />
                        <span>View Quest</span>
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-[#808080] mx-auto mb-4" />
                <p className="text-[#b3b3b3]">No quests found. Try a different search.</p>
              </div>
            )}
          </div>

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
                </div>

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
                      <div className="text-[#b3b3b3] mb-4 whitespace-pre-wrap">{lesson.content}</div>
                      
                      {/* Quiz */}
                      {lesson.quizzes && lesson.quizzes.length > 0 && lesson.quizzes[0].question && (
                        <div className="mt-4 pt-4 border-t border-[#282828]">
                          <div className="font-bold text-[#1DB954] mb-3">Quiz</div>
                          <div className="mb-3 text-white">{lesson.quizzes[0].question}</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {lesson.quizzes[0].options?.map((opt, optIdx) => (
                              <div
                                key={optIdx}
                                className={`px-4 py-2 rounded-lg border transition-colors ${
                                  lesson.quizzes[0].correctAnswer === optIdx
                                    ? "border-[#1DB954] bg-[#1DB954]/10 text-[#1DB954]"
                                    : "border-[#282828] text-white hover:border-[#1DB954]/50"
                                }`}
                              >
                                {opt}
                              </div>
                            ))}
                          </div>
                          <div className="text-xs text-[#808080] mt-2">Correct answer highlighted in green</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  className="mt-6 w-full bg-gradient-to-r from-[#1DB954] to-[#1ed760] hover:from-[#1ed760] hover:to-[#1DB954] text-black px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-[#1DB954]/30 flex items-center justify-center gap-2"
                  onClick={() => {
                    setPlayingQuest(selectedQuest);
                    setSelectedQuest(null);
                  }}
                >
                  <Play className="w-5 h-5" />
                  Start Quest
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
                      level: user.level ?? 1,
                      totalXP: user.xp ?? 0,
                      xpToNextLevel: user.xpToNextLevel ?? 500,
                      currentXP: user.currentXP ?? 0,
                      streak: user.streak ?? 0,
                      questsCompleted: user.questsCompleted ?? 0,
                      totalQuests: user.totalQuests ?? 0,
                      badgesEarned: Array.isArray(user.badges) ? user.badges.length : 0,
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
          <div className="text-center py-16 text-[#b3b3b3]">Feature coming soon...</div>
        </>
      );
  }
}
