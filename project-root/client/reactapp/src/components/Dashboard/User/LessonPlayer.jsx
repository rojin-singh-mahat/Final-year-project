import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Trophy,
  Zap,
  Award,
  CheckCircle2,
  X,
  ArrowLeft,
  ArrowRight,
  Star,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export default function LessonPlayer({ quest, onClose, onComplete }) {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previousLevel, setPreviousLevel] = useState(null);

  const currentLesson = quest.lessons[currentLessonIndex];
  const isLastLesson = currentLessonIndex === quest.lessons.length - 1;

  const handleAnswerSelect = (answerIndex) => {
    if (!showResults) {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleSubmitQuiz = async () => {
    if (selectedAnswer === null) return;

    setLoading(true);
    try {
      // Get current level before submission
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const userRes = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userRes.json();
      setPreviousLevel(userData.level);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/progress/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lessonId: currentLesson._id,
          questId: quest._id,
          answers: [selectedAnswer],
          timeTaken: 0,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit quiz");

      const data = await res.json();
      setQuizResults(data);
      setShowResults(true);
    } catch (err) {
      console.error("Error submitting quiz:", err);
      alert("Failed to submit quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextLesson = () => {
    if (isLastLesson) {
      if (onComplete) onComplete(quizResults);
      onClose();
    } else {
      setCurrentLessonIndex(currentLessonIndex + 1);
      setSelectedAnswer(null);
      setShowResults(false);
      setQuizResults(null);
    }
  };

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
      setSelectedAnswer(null);
      setShowResults(false);
      setQuizResults(null);
    }
  };

  const quiz = currentLesson.quizzes?.[0];

  useEffect(() => {
    const startLesson = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) return;
        await fetch(`${import.meta.env.VITE_API_URL}/api/progress/start`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ lessonId: currentLesson?._id }),
        });
      } catch (err) {
        console.error("Error starting lesson:", err);
      }
    };

    if (currentLesson?._id) startLesson();
  }, [currentLesson?._id]);

  return (
    <>
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gradient-to-br from-[#181818] to-[#121212] border border-[#282828] rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#1DB954] to-[#1ed760] p-8">
          <button
            className="absolute top-4 right-4 text-black hover:text-white transition-colors p-2 hover:bg-black/20 rounded-lg"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-black/20 rounded-xl flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-black" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-black">{quest.title}</h2>
              <p className="text-black/70">
                Lesson {currentLessonIndex + 1} of {quest.lessons.length}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 bg-black/20 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-black/40"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentLessonIndex + 1) / quest.lessons.length) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLessonIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Lesson Title */}
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-[#1DB954]" />
                <h3 className="text-3xl font-bold text-white">
                  {currentLesson.title}
                </h3>
                <span className="ml-auto text-[#1DB954] flex items-center gap-1">
                  <Zap className="w-5 h-5" />
                  {currentLesson.xp || 0} XP
                </span>
              </div>

              {/* Lesson Content */}
              <div className="bg-[#1a1a1a] border border-[#282828] rounded-2xl p-8 mb-8">
                <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-[#0f0f0f] prose-pre:border prose-pre:border-[#2a2a2a] prose-code:text-[#1DB954]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {currentLesson.content || ""}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Quiz Section */}
              {quiz && quiz.question && (
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#121212] border border-[#282828] rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#8b5cf6]/20 rounded-xl flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-[#8b5cf6]" />
                    </div>
                    <h4 className="text-2xl font-bold text-white">
                      Knowledge Check
                    </h4>
                  </div>

                  <p className="text-xl text-white mb-6">{quiz.question}</p>

                  <div className="grid grid-cols-1 gap-3 mb-6">
                    {quiz.options?.map((option, idx) => {
                      const isSelected = selectedAnswer === idx;
                      const isCorrect = quiz.correctAnswer === idx;
                      const showCorrect = showResults && isCorrect;
                      const showIncorrect = showResults && isSelected && !isCorrect;

                      return (
                        <motion.button
                          key={idx}
                          onClick={() => handleAnswerSelect(idx)}
                          disabled={showResults}
                          whileHover={!showResults ? { scale: 1.02 } : {}}
                          whileTap={!showResults ? { scale: 0.98 } : {}}
                          className={`px-6 py-4 rounded-xl border-2 text-left transition-all ${
                            showCorrect
                              ? "border-[#1DB954] bg-[#1DB954]/20 text-[#1DB954]"
                              : showIncorrect
                              ? "border-red-500 bg-red-500/20 text-red-400"
                              : isSelected
                              ? "border-[#1DB954] bg-[#1DB954]/10 text-white"
                              : "border-[#282828] bg-[#1a1a1a] text-[#b3b3b3] hover:border-[#1DB954]/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-lg">{option}</span>
                            {showCorrect && (
                              <CheckCircle2 className="w-6 h-6 text-[#1DB954]" />
                            )}
                            {showIncorrect && (
                              <X className="w-6 h-6 text-red-400" />
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {!showResults && (
                    <motion.button
                      onClick={handleSubmitQuiz}
                      disabled={selectedAnswer === null || loading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-full py-4 rounded-xl font-semibold transition-all ${
                        selectedAnswer !== null
                          ? "bg-gradient-to-r from-[#1DB954] to-[#1ed760] hover:from-[#1ed760] hover:to-[#1DB954] text-black shadow-lg shadow-[#1DB954]/30"
                          : "bg-[#282828] text-[#808080] cursor-not-allowed"
                      }`}
                    >
                      {loading ? "Submitting..." : "Submit Answer"}
                    </motion.button>
                  )}

                  {/* Results Panel */}
                  {showResults && quizResults && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-6 p-6 rounded-2xl border-2 ${
                        quizResults.passed
                          ? "border-[#1DB954] bg-[#1DB954]/10"
                          : "border-yellow-500 bg-yellow-500/10"
                      }`}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center ${
                            quizResults.passed
                              ? "bg-[#1DB954]/20"
                              : "bg-yellow-500/20"
                          }`}
                        >
                          {quizResults.passed ? (
                            <CheckCircle2 className="w-8 h-8 text-[#1DB954]" />
                          ) : (
                            <Star className="w-8 h-8 text-yellow-500" />
                          )}
                        </div>
                        <div>
                          <h5 className="text-2xl font-bold text-white mb-1">
                            {quizResults.passed ? "Great Job!" : "Keep Going!"}
                          </h5>
                          <p className="text-[#b3b3b3]">
                            You scored {quizResults.score}% • +{quizResults.xpEarned} XP
                          </p>
                        </div>
                      </div>

                      {/* Level Up Notification */}
                      {previousLevel && quizResults.newLevel > previousLevel && (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-xl mb-4"
                        >
                          <div className="relative">
                            <Sparkles className="w-10 h-10 text-yellow-500 animate-pulse" />
                          </div>
                          <div>
                            <div className="text-sm text-yellow-400 font-bold">
                              🎉 LEVEL UP!
                            </div>
                            <div className="text-lg font-bold text-white">
                              Level {previousLevel} → Level {quizResults.newLevel}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {quizResults.badgeEarned && (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex items-center gap-3 p-4 bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-xl mb-4"
                        >
                          <Award className="w-8 h-8 text-[#8b5cf6]" />
                          <div>
                            <div className="text-sm text-[#808080]">
                              Badge Unlocked!
                            </div>
                            <div className="text-lg font-bold text-[#8b5cf6]">
                              {quizResults.badgeEarned}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* XP Progress Bar */}
                      <div className="mb-4 p-4 bg-[#1a1a1a] rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-[#808080]">XP Progress to Level {quizResults.newLevel + 1}</span>
                          <span className="text-sm text-[#1DB954] font-bold">
                            {quizResults.currentXP} / {quizResults.xpToNextLevel}
                          </span>
                        </div>
                        <div className="w-full bg-[#282828] rounded-full h-3 overflow-hidden">
                          <motion.div
                            className="bg-gradient-to-r from-[#1DB954] to-[#1ed760] h-3 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(quizResults.currentXP / quizResults.xpToNextLevel) * 100}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-[#1DB954]">
                            {quizResults.correctAnswers}/{quizResults.totalQuestions}
                          </div>
                          <div className="text-xs text-[#808080]">Correct</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-[#8b5cf6] flex items-center justify-center gap-1">
                            <TrendingUp className="w-5 h-5" />
                            {quizResults.newLevel}
                          </div>
                          <div className="text-xs text-[#808080]">Level</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-yellow-500 flex items-center justify-center gap-1">
                            🔥 {quizResults.streak}
                          </div>
                          <div className="text-xs text-[#808080]">Day Streak</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-[#282828] p-6 bg-[#121212] flex justify-between items-center">
          <motion.button
            onClick={handlePreviousLesson}
            disabled={currentLessonIndex === 0}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              currentLessonIndex === 0
                ? "bg-[#282828] text-[#808080] cursor-not-allowed"
                : "bg-[#1a1a1a] border border-[#282828] text-white hover:border-[#1DB954]/50"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </motion.button>

          <div className="text-[#808080] text-sm">
            Lesson {currentLessonIndex + 1} / {quest.lessons.length}
          </div>

          {showResults ? (
            <motion.button
              onClick={handleNextLesson}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-[#1DB954] to-[#1ed760] hover:from-[#1ed760] hover:to-[#1DB954] text-black flex items-center gap-2 shadow-lg shadow-[#1DB954]/30"
            >
              {isLastLesson ? "Finish Quest" : "Next Lesson"}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          ) : (
            <div className="px-6 py-3 rounded-xl bg-[#282828] text-[#808080] text-sm">
              Complete quiz to continue
            </div>
          )}
        </div>
      </motion.div>
    </div>
    </>
  );
}
