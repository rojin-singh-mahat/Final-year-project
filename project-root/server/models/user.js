const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    // For OAuth users we may not have a password; make this optional with a safe default
    passwordHash: { type: String, required: false, default: "" },
    role: { type: String, enum: ["learner", "admin"], default: "learner" },
    points: { type: Number, default: 0 },
    badges: { type: [String], default: [] },
    googleId: { type: String, default: null },
    picture: { type: String, default: null },
    // Progress and profile fields for dashboard
    level: { type: Number, default: 1 },
    xpToNextLevel: { type: Number, default: 500 },
    currentXP: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    questsCompleted: { type: Number, default: 0 },
    totalQuests: { type: Number, default: 10 },
    // Recent activity and suggested content stored on user for personalization
    recentActivity: {
      type: [
        {
          questTitle: String,
          completedAt: String,
          xpEarned: Number,
          badgeEarned: Boolean,
        },
      ],
      default: [],
    },
    recommendedQuests: {
      type: [
        {
          id: String,
          title: String,
          difficulty: String,
          duration: Number,
          xpReward: Number,
          thumbnail: String,
        },
      ],
      default: [],
    },
    skills: { type: Map, of: Number, default: {} },
    // Email verification fields
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, default: null },
    verificationTokenExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
