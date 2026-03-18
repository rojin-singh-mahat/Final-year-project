const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  quizzes: [
    {
      question: { type: String, required: true },
      options: [{ type: String, required: true }],
      correctAnswer: { type: Number, required: true },
    },
  ],
  order: { type: Number },
  xp: { type: Number, default: 10 },
});

const FeedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    adminReply: {
      admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      message: {
        type: String,
        trim: true,
        maxlength: 500,
      },
      repliedAt: {
        type: Date,
      },
    },
  },
  { timestamps: true }
);

const QuestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    lessons: [LessonSchema],
    totalXP: { type: Number },
    rewardBadge: { type: String },
    price: { type: Number, default: 0 }, // 0 means free
    currency: { type: String, default: "USD" },
    isPaid: { type: Boolean, default: false }, // Derived from price > 0
    feedback: { type: [FeedbackSchema], default: [] },
    avgRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quest", QuestSchema);
