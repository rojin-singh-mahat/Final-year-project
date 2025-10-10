const ProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    status: {
      type: String,
      enum: ["not-started", "in-progress", "completed"],
      default: "not-started",
    },
    score: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
    lastAttempt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Progress", ProgressSchema);
