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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quest", QuestSchema);
