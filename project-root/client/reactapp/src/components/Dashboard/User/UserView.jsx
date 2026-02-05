import StatsCards from "./StatCards";
import RecentActivity from "./RecentActivity";
import RecommendedQuests from "./RecommendedQuests";
import SkillProgress from "./SkillProgress";
import ProfilePage from "./ProfilePage";
import UserSidebar from "./UserSidebar";
import LessonPlayer from "./LessonPlayer";
import { Home, BookOpen, TrendingUp, Trophy, Users, User, X, Search, Play, Zap, Award } from "lucide-react";
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
                      onClick={() => setSelectedQuest(quest)}
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
                      <div className="text-[#b3b3b3] line-clamp-3">{lesson.content}</div>
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
          <main className="ml-64 flex-1 pr-8 py-8 pl-0 relative z-10">
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
