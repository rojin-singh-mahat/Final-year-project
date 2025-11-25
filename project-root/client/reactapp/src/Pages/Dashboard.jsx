import { useState, useEffect } from 'react';
import { getUserData } from '../utils/auth';
import { motion } from 'framer-motion';
import { 
  Home,
  BookOpen,
  TrendingUp,
  Trophy,
  Users,
  Settings,
  User,
  LogOut,
  Zap,
  Target,
  Calendar,
  Clock,
  Award,
  ChevronRight,
  Flame,
  Menu,
  X
} from 'lucide-react';

// Start with empty values — frontend will rely on the backend response
const initialUserData = {
  username: '',
  level: 1,
  totalXP: 0,
  xpToNextLevel: 500,
  currentXP: 0,
  streak: 0,
  questsCompleted: 0,
  totalQuests: 0,
  badgesEarned: 0,
  avatar: ''
};

const initialRecentActivity = [];
const initialRecommendedQuests = [];
const initialSkills = {};

export default function Dashboard() {
  const [userData, setUserData] = useState(initialUserData);
  const [recentActivity, setRecentActivity] = useState(initialRecentActivity);
  const [recommendedQuests, setRecommendedQuests] = useState(initialRecommendedQuests);
  const [skills, setSkills] = useState(initialSkills);
  const [_loading, setLoading] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Derived safe values to avoid division by zero
  const xpToNextSafe = (userData && typeof userData.xpToNextLevel === 'number' && userData.xpToNextLevel > 0) ? userData.xpToNextLevel : 1;
  const xpPercent = Math.round(((userData && userData.currentXP) || 0) / xpToNextSafe * 100);
  const totalQuestsSafe = (userData && typeof userData.totalQuests === 'number' && userData.totalQuests > 0) ? userData.totalQuests : 1;
  const questsPercent = Math.round(((userData && userData.questsCompleted) || 0) / totalQuestsSafe * 100);
  const circleR = 16;
  const circumference = 2 * Math.PI * circleR;
  const strokeDashoffset = circumference * (1 - (userData.currentXP / xpToNextSafe));

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      setLoading(true);
      try {
        const user = await getUserData();
        if (mounted && user) {
          // Map backend values directly. Use nullish coalescing so 0 and empty arrays overwrite defaults.
          setUserData({
            username: user.name ?? '',
            level: user.level ?? 1,
            totalXP: user.xp ?? 0,
            xpToNextLevel: user.xpToNextLevel ?? 500,
            currentXP: user.currentXP ?? 0,
            streak: user.streak ?? 0,
            questsCompleted: user.questsCompleted ?? 0,
            totalQuests: user.totalQuests ?? 0,
            badgesEarned: Array.isArray(user.badges) ? user.badges.length : 0,
            avatar: user.picture ?? '',
          });

          // Replace arrays/objects even if empty — backend is authoritative
          setRecentActivity(Array.isArray(user.recentActivity) ? user.recentActivity : []);
          setRecommendedQuests(Array.isArray(user.recommendedQuests) ? user.recommendedQuests : []);
          setSkills(user.skills ? user.skills : {});
        }
      } catch (e) {
        console.error('Error loading user for dashboard:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadUser();

    return () => { mounted = false; };
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'quests', label: 'Browse Quests', icon: BookOpen },
    { id: 'progress', label: 'My Progress', icon: TrendingUp },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'leaderboard', label: 'Leaderboard', icon: Users },
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 240 : 80 }}
        className="bg-black border-r border-[#282828] fixed left-0 top-0 h-screen z-40 overflow-hidden transition-all duration-300"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 flex items-center gap-3 border-b border-[#282828]">
            <div className="w-10 h-10 bg-gradient-to-br from-[#1DB954] to-[#8b5cf6] rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-black" />
            </div>
            {sidebarOpen && (
              <span className="text-xl whitespace-nowrap">SkillQuest</span>
            )}
          </div>

          {/* User Section */}
          <div className="p-6 border-b border-[#282828]">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={userData.avatar} 
                alt={userData.username}
                className="w-12 h-12 rounded-full border-2 border-[#1DB954] flex-shrink-0"
              />
              {sidebarOpen && (
                <div className="overflow-hidden">
                  <div className="text-white truncate">{userData.username}</div>
                  <div className="text-xs text-[#1DB954]">Level {userData.level}</div>
                </div>
              )}
            </div>
            
            {sidebarOpen && (
              <>
                <div className="text-xs text-[#808080] uppercase tracking-wider mb-2">
                  XP Progress
                </div>
                <div className="w-full bg-[#282828] rounded-full h-2 mb-2">
                  <div 
                    className="bg-[#1DB954] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
                <div className="text-xs text-[#b3b3b3]">
                  {userData.currentXP} / {userData.xpToNextLevel} XP
                </div>
              </>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-3 transition-all ${
                  activeNav === item.id
                    ? 'text-[#1DB954] bg-[#1DB954]/10 border-l-4 border-[#1DB954]'
                    : 'text-[#b3b3b3] hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="border-t border-[#282828] p-4">
            <button className="w-full flex items-center gap-3 px-2 py-3 text-[#b3b3b3] hover:text-white transition-colors">
              <Settings className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>Settings</span>}
            </button>
            <button className="w-full flex items-center gap-3 px-2 py-3 text-[#b3b3b3] hover:text-white transition-colors">
              <User className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>Profile</span>}
            </button>
            <button 
            onClick={() => {
                localStorage.removeItem("token");
                sessionStorage.removeItem("token");
                window.location.href = "./login";}}
            className="w-full flex items-center gap-3 px-2 py-3 text-[#b3b3b3] hover:text-red-400 transition-colors">
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>Logout</span>}
              
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main 
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? 240 : 80 }}
      >
        <div className="p-8">
          {/* Mobile Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-[#1a1a1a] border border-[#282828] rounded-lg flex items-center justify-center"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Hero Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1a1a1a] border border-[#282828] rounded-lg p-8 mb-8 shadow-lg"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl mb-2">
                  Welcome back, <span className="text-[#1DB954]">{userData.username}</span>!
                </h1>
                <p className="text-[#1DB954] flex items-center gap-2 mb-2">
                  <Flame className="w-5 h-5 animate-pulse" />
                  You're on a {userData.streak} day streak!
                </p>
                <p className="text-[#b3b3b3]">Keep pushing forward!</p>
              </div>
              <button className="bg-[#1DB954] hover:bg-[#1ed760] text-black px-8 py-3 rounded-full transition-all hover:scale-105 shadow-lg shadow-[#1DB954]/20 flex items-center gap-2">
                Continue Learning
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total XP */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#1a1a1a] border border-[#282828] rounded-lg p-6 hover:border-[#1DB954] hover:-translate-y-1 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-[#1DB954]/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-[#1DB954]" />
                </div>
              </div>
              <div className="text-4xl text-white mb-2 group-hover:text-[#1DB954] transition-colors">
                {userData.totalXP.toLocaleString()}
              </div>
              <div className="text-[#b3b3b3] text-sm mb-2">Total XP</div>
              <div className="text-[#1DB954] text-xs">+50 this week</div>
            </motion.div>

            {/* Quests Completed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#1a1a1a] border border-[#282828] rounded-lg p-6 hover:border-[#1DB954] hover:-translate-y-1 transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-[#8b5cf6]/20 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-[#8b5cf6]" />
                </div>
              </div>
              <div className="text-4xl text-white mb-2">
                {userData.questsCompleted} <span className="text-xl text-[#b3b3b3]">/ {userData.totalQuests}</span>
              </div>
              <div className="text-[#b3b3b3] text-sm mb-3">Quests Completed</div>
                <div className="w-full bg-[#282828] rounded-full h-2">
                <div 
                  className="bg-[#1DB954] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${questsPercent}%` }}
                />
              </div>
            </motion.div>

            {/* Current Level */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#1a1a1a] border border-[#282828] rounded-lg p-6 hover:border-[#1DB954] hover:-translate-y-1 transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-[#1DB954]/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#1DB954]" />
                </div>
              </div>
              <div className="text-4xl text-white mb-2">Level {userData.level}</div>
              <div className="text-[#b3b3b3] text-sm mb-3">Current Level</div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 relative">
                  <svg className="transform -rotate-90" width="40" height="40">
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      stroke="#282828"
                      strokeWidth="3"
                      fill="none"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      stroke="#1DB954"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${circumference}`}
                      strokeDashoffset={`${strokeDashoffset}`}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="text-xs text-[#b3b3b3]">
                  {xpPercent}% to Level {userData.level + 1}
                </div>
              </div>
            </motion.div>

            {/* Badges Earned */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#1a1a1a] border border-[#282828] rounded-lg p-6 hover:border-[#1DB954] hover:-translate-y-1 transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-[#8b5cf6]/20 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-[#8b5cf6]" />
                </div>
              </div>
              <div className="text-4xl text-white mb-2">{userData.badgesEarned}</div>
              <div className="text-[#b3b3b3] text-sm mb-3">Badges Earned</div>
              <div className="flex gap-1">
                {[...Array(userData.badgesEarned)].slice(0, 5).map((_, i) => (
                  <div key={i} className="w-6 h-6 bg-gradient-to-br from-[#1DB954] to-[#8b5cf6] rounded-full flex items-center justify-center">
                    <Trophy className="w-3 h-3 text-black" />
                  </div>
                ))}
                {userData.badgesEarned > 5 && (
                  <div className="w-6 h-6 bg-[#282828] rounded-full flex items-center justify-center text-xs">
                    +{userData.badgesEarned - 5}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-5 gap-8 mb-8">
            {/* Recent Activity - Left Column (60%) */}
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

            {/* Recommended Quests - Right Column (40%) */}
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
                {recommendedQuests.map((quest, index) => (
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
          </div>

          {/* Skills Progress Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-[#1a1a1a] border border-[#282828] rounded-lg p-6"
          >
            <h2 className="text-2xl mb-6 flex items-center gap-2">
              Your Skill Progress
              <TrendingUp className="w-6 h-6 text-[#1DB954]" />
            </h2>

            <div className="space-y-6">
              {Object.entries(skills).map(([skill, progress], index) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white">{skill}</span>
                    <span className="text-[#1DB954]">{progress}%</span>
                  </div>
                  <div className="w-full bg-[#282828] rounded-full h-3 overflow-hidden">
                    <motion.div 
                      className="bg-gradient-to-r from-[#1DB954] to-[#8b5cf6] h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: 0.9 + index * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
