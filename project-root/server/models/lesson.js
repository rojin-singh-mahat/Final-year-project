const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true, // no two lessons with the same title
    },
    description: {
      type: String,
    },
    content: {
      type: String, // markdown or HTML string
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    tags: {
      type: [String], // e.g. ["javascript", "loops"]
    },
    quiz: [
      {
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswer: { type: Number, required: true }, // index of correct option
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lesson", LessonSchema);
