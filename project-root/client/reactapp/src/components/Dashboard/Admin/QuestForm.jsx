import { React, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, GripVertical, X } from "lucide-react";

// Helper: update a lesson field by lesson id
function updateLessonField(lessons, lessonId, field, value) {
  return lessons.map((lesson) => {
    // Don't modify lessons that don't match
    const currentId = lesson.id ?? lesson._id;
    if (currentId !== lessonId) return lesson;
    
    // Quiz field update
    if (field.startsWith("quizzes.")) {
      const quizField = field.split(".")[1];
      const quizzes = lesson.quizzes || [
        { question: "", options: ["", "", "", ""], correctAnswer: 0 },
      ];
      const updatedQuiz = { ...quizzes[0] };
      if (quizField === "question") updatedQuiz.question = value;
      if (quizField === "correctAnswer") updatedQuiz.correctAnswer = value;
      return { ...lesson, quizzes: [updatedQuiz] };
    }
    
    // Normal lesson field - return new lesson object with updated field
    return { ...lesson, [field]: value };
  });
}

// Helper: update a quiz option by lesson id and option index
function updateQuizOptionField(lessons, lessonId, optIdx, value) {
  return lessons.map((lesson) => {
    // Don't modify lessons that don't match
    const currentId = lesson.id ?? lesson._id;
    if (currentId !== lessonId) return lesson;
    
    const quizzes = lesson.quizzes || [
      { question: "", options: ["", "", "", ""], correctAnswer: 0 },
    ];
    const updatedQuiz = { ...quizzes[0] };
    const updatedOptions = [...(updatedQuiz.options || ["", "", "", ""])];
    updatedOptions[optIdx] = value;
    updatedQuiz.options = updatedOptions;
    return { ...lesson, quizzes: [updatedQuiz] };
  });
}

export default function QuestForm({
  activeView,
  setActiveView,
  formData,
  setFormData,
  lessons,
  setLessons,
  handleSaveQuest,
  errors,
  addLesson,
  removeLesson,
  updateLesson,
  updateQuizOption,
  editingQuest,
}) {
  // Replace updateLesson and updateQuizOption with new helpers
  const handleUpdateLesson = (lessonId, field, value) => {
    setLessons((prev) => updateLessonField(prev, lessonId, field, value));
  };
  const handleUpdateQuizOption = (lessonId, optIdx, value) => {
    setLessons((prev) => updateQuizOptionField(prev, lessonId, optIdx, value));
  };
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Top Bar */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveView("list")}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-4xl">
            {activeView === "edit" ? "Edit Quest" : "Create New Quest"}
          </h1>
        </div>
      </div>

      {/* Quest Details Section */}
      <div className="bg-[#1a1a1a] border border-[#282828] rounded-lg p-6 mb-6">
        <h2 className="text-2xl mb-6">Quest Information</h2>

        <div className="space-y-6">
          {/* Quest Title */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#808080] mb-2">
              Quest Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Git Fundamentals"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className={`w-full bg-[#121212] border ${
                errors.title ? "border-red-500" : "border-[#282828]"
              } rounded-lg px-4 py-3 text-white placeholder-[#808080] focus:border-[#1DB954] focus:outline-none`}
            />
            {errors.title && (
              <p className="text-red-400 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#808080] mb-2">
              Description
            </label>
            <textarea
              rows={4}
              placeholder="What will learners achieve..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full bg-[#121212] border border-[#282828] rounded-lg px-4 py-3 text-white placeholder-[#808080] focus:border-[#1DB954] focus:outline-none resize-none"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#808080] mb-3">
              Difficulty <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-4">
              {["Beginner", "Intermediate", "Advanced"].map((level) => (
                <label
                  key={level}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="difficulty"
                    value={level}
                    checked={formData.difficulty === level}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value })
                    }
                    className="w-4 h-4 text-[#1DB954] bg-[#121212] border-[#282828] focus:ring-[#1DB954] focus:ring-2"
                  />
                  <span className="flex items-center gap-2 text-white group-hover:text-[#1DB954] transition-colors">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        level === "Beginner"
                          ? "bg-green-500"
                          : level === "Intermediate"
                          ? "bg-yellow-500"
                          : "bg-purple-500"
                      }`}
                    ></span>
                    {level}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Reward Badge */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#808080] mb-2">
              Reward Badge
            </label>
            <input
              type="text"
              placeholder="e.g., Git Master"
              value={formData.rewardBadge}
              onChange={(e) =>
                setFormData({ ...formData, rewardBadge: e.target.value })
              }
              className="w-full bg-[#121212] border border-[#282828] rounded-lg px-4 py-3 text-white placeholder-[#808080] focus:border-[#1DB954] focus:outline-none"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#808080] mb-2">
              Price (NPR - Nepali Rupees)
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="0 (Free) or 10+"
              value={formData.price ?? 0}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                if (value === "") {
                  setFormData({ ...formData, price: 0 });
                  return;
                }
                const numeric = parseInt(value);
                const normalized = numeric > 0 && numeric < 10 ? 10 : numeric;
                setFormData({ ...formData, price: normalized });
              }}
              className="w-full bg-[#121212] border border-[#282828] rounded-lg px-4 py-3 text-white placeholder-[#808080] focus:border-[#1DB954] focus:outline-none"
            />
            {errors.price && (
              <p className="text-red-400 text-sm mt-1">{errors.price}</p>
            )}
            <p className="text-xs text-[#808080] mt-1">Enter 0 for free quests. Minimum paid price is 10. Payment via eSewa.</p>
          </div>
        </div>
      </div>

      {/* Lessons Section */}
      <div className="bg-[#1a1a1a] border border-[#282828] rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl">Quest Lessons</h2>
          <button
            onClick={addLesson}
            className="bg-[#1DB954] hover:bg-[#1ed760] text-black px-4 py-2 rounded-full flex items-center gap-2 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Lesson
          </button>
        </div>

        <div className="space-y-6">
          {lessons.map((lesson, lessonIndex) => {
            const lessonKey = lesson.id ?? lesson._id ?? lessonIndex;
            return (
            <div
              key={lessonKey}
              className="bg-[#121212] border border-[#282828] rounded-lg p-6"
            >
              {/* Lesson Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-5 h-5 text-[#808080]" />
                  <h3 className="text-xl">Lesson {lessonIndex + 1}</h3>
                </div>
                {lessons.length > 1 && (
                  <button
                    onClick={() => removeLesson(lesson.id ?? lesson._id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg text-[#b3b3b3] hover:text-red-400 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Lesson Title */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#808080] mb-2">
                    Lesson Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Understanding Git Init"
                    value={lesson.title ?? ""}
                    onChange={(e) =>
                      handleUpdateLesson(lesson.id ?? lesson._id, "title", e.target.value)
                    }
                    className={`w-full bg-[#1a1a1a] border ${
                      errors[`lesson_${lessonIndex}_title`]
                        ? "border-red-500"
                        : "border-[#282828]"
                    } rounded-lg px-4 py-3 text-white placeholder-[#808080] focus:border-[#1DB954] focus:outline-none`}
                  />
                  {errors[`lesson_${lessonIndex}_title`] && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors[`lesson_${lessonIndex}_title`]}
                    </p>
                  )}
                </div>

                {/* Lesson Content */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#808080] mb-2">
                    Lesson Content <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={8}
                    placeholder="Write your lesson content here... (supports markdown)"
                    value={lesson.content ?? ""}
                    onChange={(e) =>
                      handleUpdateLesson(lesson.id ?? lesson._id, "content", e.target.value)
                    }
                    className={`w-full bg-[#1a1a1a] border ${
                      errors[`lesson_${lessonIndex}_content`]
                        ? "border-red-500"
                        : "border-[#282828]"
                    } rounded-lg px-4 py-3 text-white placeholder-[#808080] focus:border-[#1DB954] focus:outline-none resize-none`}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors[`lesson_${lessonIndex}_content`] && (
                      <p className="text-red-400 text-sm">
                        {errors[`lesson_${lessonIndex}_content`]}
                      </p>
                    )}
                    <p className="text-xs text-[#808080] ml-auto">
                      {lesson.content.length} / 5000
                    </p>
                  </div>
                </div>

                {/* XP Reward */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#808080] mb-2">
                    XP Reward <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={lesson.xpReward ?? ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      handleUpdateLesson(
                        lesson.id ?? lesson._id,
                        "xpReward",
                        value === "" ? "" : parseInt(value)
                      );
                    }}
                    onBlur={(e) => {
                      // If empty on blur, set to 1 as minimum
                      if (e.target.value === "") {
                        handleUpdateLesson(lesson.id ?? lesson._id, "xpReward", 1);
                      }
                    }}
                    placeholder="Enter XP amount"
                    className="w-32 bg-[#1a1a1a] border border-[#282828] rounded-lg px-4 py-3 text-white placeholder-[#808080] focus:border-[#1DB954] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                {/* Quiz Section */}
                <div className="border-t border-[#282828] pt-6">
                  <h4 className="text-lg mb-4">Quiz</h4>
                    {lesson.quizzes.map((quiz, quizIndex) => (
                    <div key={quizIndex} className="mb-8">
                      {/* Quiz Question */}
                      <div className="mb-4">
                        <label className="block text-xs uppercase tracking-wider text-[#808080] mb-2">
                          Quiz Question <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="What command initializes a Git repository?"
                          value={quiz.question ?? ""}
                          onChange={(e) =>
                            handleUpdateLesson(
                              lesson.id,
                              "quizzes.question",
                              e.target.value
                            )
                          }
                          className={`w-full bg-[#1a1a1a] border ${
                            errors[`lesson_${lessonIndex}_quiz_question`]
                              ? "border-red-500"
                              : "border-[#282828]"
                          } rounded-lg px-4 py-3 text-white placeholder-[#808080] focus:border-[#1DB954] focus:outline-none`}
                        />
                        {errors[`lesson_${lessonIndex}_quiz_question`] && (
                          <p className="text-red-400 text-sm mt-1">
                            {errors[`lesson_${lessonIndex}_quiz_question`]}
                          </p>
                        )}
                      </div>

                      {/* Answer Options */}
                      <div className="mb-4">
                        <label className="block text-xs uppercase tracking-wider text-[#808080] mb-3">
                          Answer Options <span className="text-red-400">*</span>
                        </label>
                        <div className="space-y-3">
                          {quiz.options?.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-3">
                              <input
                                type="radio"
                                name={`correct-${lessonKey}`}
                                checked={quiz.correctAnswer === optIndex}
                                onChange={() =>
                                  handleUpdateLesson(
                                    lesson.id ?? lesson._id,
                                    "quizzes.correctAnswer",
                                    optIndex
                                  )
                                }
                                className="w-4 h-4 text-[#1DB954] bg-[#1a1a1a] border-[#282828] focus:ring-[#1DB954] focus:ring-2"
                              />
                              <input
                                type="text"
                                placeholder={`Option ${optIndex + 1}`}
                                value={option ?? ""}
                                onChange={(e) =>
                                  handleUpdateQuizOption(
                                    lesson.id ?? lesson._id,
                                    optIndex,
                                    e.target.value
                                  )
                                }
                                className={`flex-1 bg-[#1a1a1a] border ${
                                  errors[
                                    `lesson_${lessonIndex}_quiz_option_${optIndex}`
                                  ]
                                    ? "border-red-500"
                                    : "border-[#282828]"
                                } rounded-lg px-4 py-2 text-white placeholder-[#808080] focus:border-[#1DB954] focus:outline-none`}
                              />
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-[#808080] mt-2">
                          Select the radio button to mark the correct answer
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
          })}
        </div>

        {/* Add Another Lesson */}
        <button
          onClick={addLesson}
          className="w-full mt-6 border-2 border-dashed border-[#282828] hover:border-[#1DB954] text-[#b3b3b3] hover:text-[#1DB954] py-4 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Another Lesson
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => setActiveView("list")}
          className="px-8 py-3 border border-[#282828] hover:border-[#808080] text-[#b3b3b3] hover:text-white rounded-lg transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveQuest}
          className="px-8 py-3 bg-[#1DB954] hover:bg-[#1ed760] text-black rounded-full transition-all hover:scale-105"
        >
          Save Quest
        </button>
      </div>
    </motion.div>
  );
}
