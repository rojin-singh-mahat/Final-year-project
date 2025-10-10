const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true }, // can be text/markdown for now
  order: { type: Number, required: true },
  xp: { type: Number, default: 10 },
});

const QuestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    lessons: [LessonSchema],
    rewardBadge: { type: String }, // optional
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quest", QuestSchema);
