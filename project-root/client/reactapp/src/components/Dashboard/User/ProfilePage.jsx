import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Zap, TrendingUp, Award, Flame, Calendar, BookOpen, Camera, Upload, Trash2, Mail, MapPin, Phone } from "lucide-react";
import { optimizeProfileImage } from "../../../utils/imageUpload";

export default function ProfilePage({ userData, onAvatarUpdated }) {
  const badgeIcons = {
    "Quick Learner": "⚡",
    "Quiz Master": "🧠",
    "Streak Champion": "🔥",
    "Level 5": "⭐",
    "First Quest": "🚀",
    "10 Quests": "🏆",
    "Knowledge Seeker": "📚",
    "Perfect Score": "💯",
  };

  const userBadges = Array.isArray(userData?.badges) ? userData.badges : [];
  const [selectedShowcaseBadges, setSelectedShowcaseBadges] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const fileInputRef = useRef(null);
  const userBadgeKey = userBadges.join("|");

  useEffect(() => {
    const saved = localStorage.getItem("profileBadgeShowcase");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter((badge) => userBadges.includes(badge)).slice(0, 3);
          setSelectedShowcaseBadges(valid);
          return;
        }
      } catch (err) {
        console.error("Failed to parse profile badge showcase:", err);
      }
    }

    setSelectedShowcaseBadges(userBadges.slice(0, 3));
  }, [userBadgeKey]);

  const toggleShowcaseBadge = (badge) => {
    setSelectedShowcaseBadges((prev) => {
      let next;

      if (prev.includes(badge)) {
        next = prev.filter((b) => b !== badge);
      } else if (prev.length < 3) {
        next = [...prev, badge];
      } else {
        next = [...prev.slice(1), badge];
      }

      localStorage.setItem("profileBadgeShowcase", JSON.stringify(next));
      return next;
    });
  };

  const updateProfilePicture = async (picture) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      throw new Error("You are not logged in.");
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile-picture`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ picture }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.msg || "Failed to update profile picture");
    }

    if (typeof onAvatarUpdated === "function") {
      onAvatarUpdated(data?.picture || "");
    }
  };

  const handleAvatarUpload = async (event) => {
    setUploadError("");
    setUploadSuccess("");

    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Image must be 2MB or smaller.");
      event.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const pictureData = await optimizeProfileImage(file, { size: 512, quality: 0.82 });
      await updateProfilePicture(pictureData);
      setUploadSuccess("Profile picture updated.");
    } catch (err) {
      setUploadError(err?.message || "Unable to upload profile picture.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    setUploadError("");
    setUploadSuccess("");
    setUploading(true);
    try {
      await updateProfilePicture("");
      setUploadSuccess("Profile picture removed.");
    } catch (err) {
      setUploadError(err?.message || "Unable to remove profile picture.");
    } finally {
      setUploading(false);
    }
  };

  const statCards = [
    {
      label: "Total XP",
      value: (userData?.totalXP ?? 0).toLocaleString(),
      icon: Zap,
      gradient: "from-cyan-500 to-blue-400",
      color: "text-cyan-300",
      delay: 0.1,
    },
    {
      label: "Current Level",
      value: userData?.level ?? 1,
      icon: TrendingUp,
      gradient: "from-amber-500 to-orange-400",
      color: "text-amber-300",
      delay: 0.2,
    },
    {
      label: "Quests Completed",
      value: userData?.questsCompleted ?? 0,
      icon: Trophy,
      gradient: "from-purple-500 to-pink-400",
      color: "text-purple-300",
      delay: 0.3,
    },
    {
      label: "Day Streak",
      value: userData?.streak ?? 0,
      icon: Flame,
      gradient: "from-red-500 to-orange-500",
      color: "text-red-300",
      delay: 0.4,
    },
  ];

  return (
    <main className="ml-auto flex-1 pr-8 py-8 pl-0 relative z-10">
      {/* Header Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
         className="bg-gradient-to-br from-[#1b222a] to-[#131820] border border-stone-700 rounded-[14px] p-8 mb-8"
      >
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-cyan-500 to-amber-500 rounded-full p-1">
              <img
                src={
                  userData?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    userData?.username || "User"
                  )}&background=06b6d4&color=fff&size=128`
                }
                alt={userData?.username}
                className="w-full h-full rounded-full border-4 border-[#0f141a]"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-xl shadow-lg">
              ⭐
            </div>
            <div className="absolute -top-3 -left-3 w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center">
              <Camera className="w-4 h-4 text-cyan-200" />
            </div>
          </motion.div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-['Cinzel'] font-bold text-stone-100 mb-2"
            >
              {userData?.username || "User"}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-stone-400 mb-4"
            >
              {userData?.showEmail === false ? "Email hidden" : (userData?.email || "No email")}
            </motion.p>

            <div className="flex flex-wrap gap-2 mb-4">
              <div className="px-3 py-1.5 rounded-full border border-stone-700 bg-[#0f141a] text-stone-300 text-xs flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-cyan-300" />
                <span>{userData?.address || "No address set"}</span>
              </div>
              <div className="px-3 py-1.5 rounded-full border border-stone-700 bg-[#0f141a] text-stone-300 text-xs flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-cyan-300" />
                <span>{userData?.phoneNumber || "No phone number set"}</span>
              </div>
              <div className="px-3 py-1.5 rounded-full border border-stone-700 bg-[#0f141a] text-stone-300 text-xs flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-cyan-300" />
                <span>{userData?.showEmail === false ? "Email private" : "Email public"}</span>
              </div>
            </div>

            {selectedShowcaseBadges.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedShowcaseBadges.map((badge) => (
                  <div
                    key={badge}
                    className="px-3 py-1.5 rounded-full border border-cyan-400/40 bg-cyan-500/10 text-cyan-200 text-xs font-semibold flex items-center gap-2"
                  >
                    <span>{badgeIcons[badge] || "🏅"}</span>
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 p-3 rounded-[10px] border border-stone-700 bg-[#0f141a]">
              <p className="text-xs text-stone-400 mb-2">Profile photo (JPG, PNG, GIF, WEBP up to 2MB)</p>
              <div className="flex flex-wrap gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[8px] border border-cyan-400/40 bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30 transition-colors disabled:opacity-60"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? "Uploading..." : "Upload"}
                </button>
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[8px] border border-red-400/30 bg-red-500/20 text-red-200 hover:bg-red-500/30 transition-colors disabled:opacity-60"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
              {uploadError && <p className="text-xs text-red-300 mt-2">{uploadError}</p>}
              {uploadSuccess && <p className="text-xs text-emerald-300 mt-2">{uploadSuccess}</p>}
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-[#0f141a] border border-stone-700 rounded-[10px] p-3 text-center">
                <div className="text-xl font-['Cinzel'] font-bold text-cyan-300">
                  Level {userData?.level ?? 1}
                </div>
                <div className="text-xs text-stone-500">Current Level</div>
              </div>
              <div className="bg-[#0f141a] border border-stone-700 rounded-[10px] p-3 text-center">
                <div className="text-xl font-['Cinzel'] font-bold text-amber-300">
                  {userData?.badgesEarned ?? 0}
                </div>
                <div className="text-xs text-stone-500">Badges</div>
              </div>
              <div className="bg-[#0f141a] border border-stone-700 rounded-[10px] p-3 text-center">
                <div className="text-xl font-['Cinzel'] font-bold text-red-300">
                  🔥 {userData?.streak ?? 0}
                </div>
                <div className="text-xs text-stone-500">Streak</div>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-stone-400">
                  XP to Level {(userData?.level ?? 1) + 1}
                </span>
                <span className="text-sm text-cyan-300 font-bold">
                  {userData?.currentXP ?? 0} / {userData?.xpToNextLevel ?? 500}
                </span>
              </div>
              <div className="w-full bg-[#0f141a] rounded-[3px] h-3 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-cyan-500 to-amber-400 h-3 rounded-[3px]"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(100, ((userData?.currentXP ?? 0) / (userData?.xpToNextLevel ?? 500)) * 100)}%`,
                  }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay }}
              className="group"
            >
              <div className="bg-gradient-to-br from-[#1b222a] to-[#131820] border border-stone-700 rounded-[12px] p-6 hover:border-cyan-300/50 transition-all hover:-translate-y-1 cursor-pointer h-full">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} bg-opacity-40 rounded-[8px] flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <div className={`text-4xl font-['Cinzel'] font-bold text-stone-100 mb-2 group-hover:${stat.color} transition-colors`}>
                  {stat.value}
                </div>
                <div className="text-stone-400 text-sm">{stat.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Badges Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-8 h-8 text-amber-300" />
          <h2 className="text-3xl font-['Cinzel'] font-bold text-stone-100">Badges</h2>
          <span className="ml-auto text-stone-400">
            {userBadges.length} / {Object.keys(badgeIcons).length}
          </span>
        </div>

        {userBadges.length > 0 ? (
          <div className="mb-4 p-4 rounded-[10px] border border-stone-700 bg-[#0f141a]">
            <p className="text-sm text-stone-300">
              Choose up to 3 badges to showcase on your profile header.
            </p>
            <p className="text-xs text-stone-500 mt-1">
              Selected: {selectedShowcaseBadges.length}/3
            </p>
          </div>
        ) : null}

        {userBadges.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {userBadges.map((badge, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + idx * 0.05 }}
                className="group"
              >
                <button
                  type="button"
                  onClick={() => toggleShowcaseBadge(badge)}
                  className={`relative w-full bg-gradient-to-br from-[#1b222a] to-[#131820] border-2 rounded-[12px] p-6 flex flex-col items-center justify-center aspect-square transition-all hover:scale-105 hover:-translate-y-1 cursor-pointer ${
                    selectedShowcaseBadges.includes(badge)
                      ? "border-amber-300 shadow-lg shadow-amber-500/15"
                      : "border-cyan-400/50 hover:border-cyan-300"
                  }`}
                >
                  <span
                    className={`absolute top-2 right-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      selectedShowcaseBadges.includes(badge)
                        ? "bg-amber-500/20 text-amber-300 border-amber-400/40"
                        : "bg-stone-700/30 text-stone-400 border-stone-600"
                    }`}
                  >
                    {selectedShowcaseBadges.includes(badge) ? "Showcased" : "Select"}
                  </span>
                  <div className="text-5xl mb-2 group-hover:scale-125 transition-transform">
                    {badgeIcons[badge] || "🏅"}
                  </div>
                  <div className="text-xs font-bold text-center text-cyan-300 group-hover:text-cyan-200 transition-colors">
                    {badge}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-300/10 to-transparent rounded-[12px] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </motion.div>
            ))}

            {/* Empty Badge Slots */}
            {Object.keys(badgeIcons).map((badge, idx) => {
              if (!userBadges.includes(badge)) {
                return (
                  <motion.div
                    key={`empty-${idx}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + (userBadges.length + idx) * 0.05 }}
                  >
                    <div className="bg-gradient-to-br from-[#1b222a]/70 to-[#131820]/50 border-2 border-stone-700/50 rounded-[12px] p-6 flex flex-col items-center justify-center aspect-square opacity-70">
                      <div className="text-5xl mb-2">🔒</div>
                      <div className="text-xs font-bold text-center text-stone-500">
                        Locked
                      </div>
                    </div>
                  </motion.div>
                );
              }
              return null;
            })}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-[#1b222a] to-[#131820] border border-stone-700 rounded-[12px] p-12 text-center">
            <Award className="w-16 h-16 text-stone-500 mx-auto mb-4 opacity-50" />
            <p className="text-stone-400 text-lg">
              Complete quests to earn badges and achievements!
            </p>
          </div>
        )}
      </motion.div>

      {/* Achievements Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="mt-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-8 h-8 text-amber-300" />
          <h2 className="text-3xl font-['Cinzel'] font-bold text-stone-100">Achievements</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[
            { id: 1, name: "First Quest", icon: "🚀", unlocked: (userData?.questsCompleted || 0) >= 1 },
            { id: 2, name: "Quick Learner", icon: "⚡", unlocked: (userData?.questsCompleted || 0) >= 5 },
            { id: 3, name: "Quest Master", icon: "🧠", unlocked: (userData?.questsCompleted || 0) >= 10 },
            { id: 4, name: "Streak Champion", icon: "🔥", unlocked: (userData?.streak || 0) >= 7 },
            { id: 5, name: "Level 5", icon: "⭐", unlocked: (userData?.level || 0) >= 5 },
            { id: 6, name: "Legendary Learner", icon: "👑", unlocked: (userData?.level || 0) >= 10 },
            { id: 7, name: "XP Hunter", icon: "💎", unlocked: ((userData?.currentXP || 0) + (userData?.points || 0)) >= 10000 },
            { id: 8, name: "Badge Collector", icon: "🏆", unlocked: (userData?.badges?.length || 0) >= 5 },
            { id: 9, name: "Marathon Runner", icon: "🏃", unlocked: (userData?.questsCompleted || 0) >= 25 },
            { id: 10, name: "Elite Scholar", icon: "📖", unlocked: (userData?.level || 0) >= 15 },
            { id: 11, name: "Knowledge Demigod", icon: "🎓", unlocked: ((userData?.currentXP || 0) + (userData?.points || 0)) >= 50000 },
            { id: 12, name: "Daily Warrior", icon: "⚔️", unlocked: (userData?.streak || 0) >= 30 },
            { id: 13, name: "Speed Learner", icon: "⚡", unlocked: false },
            { id: 14, name: "Perfect Score", icon: "💯", unlocked: false },
            { id: 15, name: "Feedback Contributor", icon: "💬", unlocked: false },
            { id: 16, name: "Unstoppable", icon: "🚀", unlocked: (userData?.questsCompleted || 0) >= 50 },
          ].map((achievement) => (
            <motion.div
              key={achievement.id}
              whileHover={achievement.unlocked ? { scale: 1.05 } : {}}
              className={`rounded-[10px] p-3 flex flex-col items-center text-center border transition-all ${
                achievement.unlocked
                  ? "bg-gradient-to-br from-amber-500/40 via-yellow-500/35 to-orange-500/40 border-amber-400/60 shadow-lg shadow-amber-500/30"
                  : "bg-stone-900/60 border-stone-700/60 opacity-70"
              }`}
              title={achievement.name}
            >
              <div className="text-3xl mb-1">{achievement.icon}</div>
              <div className="text-[10px] font-semibold text-stone-200 leading-tight">
                {achievement.name}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity Section */}
      {userData?.recentActivity && userData.recentActivity.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-8 h-8 text-cyan-300" />
            <h2 className="text-3xl font-['Cinzel'] font-bold text-stone-100">Recent Activity</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userData.recentActivity.slice(0, 6).map((activity, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + idx * 0.05 }}
                className="bg-gradient-to-br from-[#1b222a] to-[#131820] border border-stone-700 rounded-[10px] p-4 hover:border-cyan-300/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-cyan-500/40 rounded-[8px] flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-cyan-300" />
                  </div>
                  <div className="flex-1">
                    <div className="text-stone-100 font-semibold mb-1">
                      {activity.questTitle}
                    </div>
                    <div className="text-xs text-stone-500">
                      {new Date(activity.completedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-cyan-300 font-bold">
                      +{activity.xpEarned} XP
                    </div>
                    {activity.badgeEarned && (
                      <div className="text-xs text-amber-300">🏅 Badge</div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Stats Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8 bg-gradient-to-br from-[#1b222a] to-[#131820] border border-stone-700 rounded-[14px] p-8"
      >
        <h3 className="text-2xl font-['Cinzel'] font-bold text-stone-100 mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-cyan-300" />
          Journey Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-[#0f141a] rounded-[10px] border border-stone-700">
            <div className="text-cyan-300 text-sm font-bold mb-2">TOTAL XP EARNED</div>
            <div className="text-3xl font-['Cinzel'] font-bold text-stone-100">
              {(userData?.totalXP ?? 0).toLocaleString()}
            </div>
            <div className="text-xs text-stone-500 mt-2">
              +{userData?.points ?? 0} points this session
            </div>
          </div>

          <div className="p-4 bg-[#0f141a] rounded-[10px] border border-stone-700">
            <div className="text-amber-300 text-sm font-bold mb-2">QUESTS COMPLETED</div>
            <div className="text-3xl font-['Cinzel'] font-bold text-stone-100">
              {userData?.questsCompleted ?? 0} / {userData?.totalQuests ?? 0}
            </div>
            <div className="text-xs text-stone-500 mt-2">
              {Math.round(((userData?.questsCompleted ?? 0) / (userData?.totalQuests ?? 10)) * 100)}%
              complete
            </div>
          </div>

          <div className="p-4 bg-[#0f141a] rounded-[10px] border border-stone-700">
            <div className="text-red-300 text-sm font-bold mb-2">CURRENT STREAK</div>
            <div className="text-3xl font-['Cinzel'] font-bold text-stone-100">🔥 {userData?.streak ?? 0}</div>
            <div className="text-xs text-stone-500 mt-2">
              Keep learning to maintain your streak!
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
