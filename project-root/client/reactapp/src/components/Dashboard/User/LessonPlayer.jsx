import { useState, useEffect, useRef, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Trophy,
  Zap,
  CheckCircle2,
  X,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Heart,
  Skull,
} from "lucide-react";

const MAX_LIVES = 3;
const LIFE_REFILL_MS = 15 * 60 * 1000;
const PLAYER_MAX_HEALTH = 100;
const PLAYER_DAMAGE_ON_WRONG = 34;

const stripMarkdown = (text = "") =>
  String(text)
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/[*_#>-]/g, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

const formatCountdown = (ms) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return `${mm}:${ss}`;
};

export default function LessonPlayer({ quest, onClose, onComplete, embedded = false }) {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bossHealth, setBossHealth] = useState(100);
  const [bossHitTick, setBossHitTick] = useState(0);
  const [playerHealth, setPlayerHealth] = useState(PLAYER_MAX_HEALTH);
  const [questFailed, setQuestFailed] = useState(false);
  const [nowMs, setNowMs] = useState(Date.now());
  const livesStorageKey = useMemo(
    () => `questLives:${String(quest?._id || quest?.id || "default")}`,
    [quest?._id, quest?.id]
  );
  const [livesState, setLivesState] = useState({ lives: MAX_LIVES, nextRefillAt: null });
  const audioContextRef = useRef(null);
  const speechUtteranceRef = useRef(null);
  const [isReadingLesson, setIsReadingLesson] = useState(false);

  const currentLesson = quest.lessons[currentLessonIndex];
  const isLastLesson = currentLessonIndex === quest.lessons.length - 1;
  const lessonsLeft = Math.max(quest.lessons.length - currentLessonIndex, 0);

  const applyLifeRegen = (state, currentTime) => {
    const next = {
      lives: Number(state?.lives ?? MAX_LIVES),
      nextRefillAt: state?.nextRefillAt ? Number(state.nextRefillAt) : null,
    };

    if (next.lives >= MAX_LIVES) {
      return { lives: MAX_LIVES, nextRefillAt: null };
    }

    if (!next.nextRefillAt) {
      return { ...next, nextRefillAt: currentTime + LIFE_REFILL_MS };
    }

    while (next.lives < MAX_LIVES && next.nextRefillAt && currentTime >= next.nextRefillAt) {
      next.lives += 1;
      next.nextRefillAt = next.lives >= MAX_LIVES ? null : next.nextRefillAt + LIFE_REFILL_MS;
    }

    return next;
  };

  const persistLives = (state) => {
    try {
      localStorage.setItem(livesStorageKey, JSON.stringify(state));
    } catch (err) {
      console.error("Failed to save quest lives state:", err);
    }
  };

  const consumeLife = () => {
    setLivesState((prev) => {
      const regenerated = applyLifeRegen(prev, Date.now());
      if (regenerated.lives <= 0) return regenerated;

      const updated = {
        lives: regenerated.lives - 1,
        nextRefillAt:
          regenerated.lives - 1 >= MAX_LIVES
            ? null
            : regenerated.nextRefillAt || Date.now() + LIFE_REFILL_MS,
      };

      persistLives(updated);
      return updated;
    });
  };

  const getAudioContext = () => {
    if (typeof window === "undefined") return null;
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      audioContextRef.current = new AudioCtx();
    }
    return audioContextRef.current;
  };

  const playTone = (ctx, freq, startTime, duration, type = "sine", gainValue = 0.05) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(gainValue, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  };

  const playSfx = (type) => {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    if (type === "correct") {
      playTone(ctx, 783.99, now, 0.14, "triangle", 0.07);
      playTone(ctx, 987.77, now + 0.09, 0.18, "triangle", 0.08);
      playTone(ctx, 1174.66, now + 0.2, 0.34, "sine", 0.065);
    }

    if (type === "wrong") {
      playTone(ctx, 320, now, 0.18, "sawtooth", 0.06);
      playTone(ctx, 220, now + 0.09, 0.2, "sawtooth", 0.05);
    }

    if (type === "complete") {
      playTone(ctx, 523.25, now, 0.14, "sine", 0.06);
      playTone(ctx, 659.25, now + 0.1, 0.14, "sine", 0.06);
      playTone(ctx, 783.99, now + 0.2, 0.16, "sine", 0.06);
      playTone(ctx, 1046.5, now + 0.3, 0.24, "triangle", 0.08);
    }

    if (type === "bossDamage") {
      playTone(ctx, 210, now, 0.08, "square", 0.09);
      playTone(ctx, 155, now + 0.05, 0.13, "triangle", 0.08);
    }
  };

  const stopLessonNarration = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    speechUtteranceRef.current = null;
    setIsReadingLesson(false);
  };

  const handleToggleLessonNarration = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (isReadingLesson) {
      stopLessonNarration();
      return;
    }

    const lessonText = stripMarkdown(currentLesson?.content || "");
    if (!lessonText) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(lessonText);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onend = () => {
      speechUtteranceRef.current = null;
      setIsReadingLesson(false);
    };
    utterance.onerror = () => {
      speechUtteranceRef.current = null;
      setIsReadingLesson(false);
    };

    speechUtteranceRef.current = utterance;
    setIsReadingLesson(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleAnswerSelect = (answerIndex) => {
    if (!showResults && !questFailed && livesState.lives > 0) {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleSubmitQuiz = async () => {
    if (selectedAnswer === null || questFailed || livesState.lives <= 0) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

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

      if (selectedAnswer === quiz?.correctAnswer) {
        const damagePerLesson = 100 / Math.max(quest.lessons.length, 1);
        setBossHealth((prev) => Math.max(0, prev - damagePerLesson));
        setBossHitTick((prev) => prev + 1);
        playSfx("bossDamage");
        playSfx("correct");
      } else {
        playSfx("wrong");
        setPlayerHealth((prev) => {
          const nextHealth = Math.max(0, prev - PLAYER_DAMAGE_ON_WRONG);
          if (nextHealth <= 0) {
            setQuestFailed(true);
            consumeLife();
          }
          return nextHealth;
        });
      }
    } catch (err) {
      console.error("Error submitting quiz:", err);
      alert("Failed to submit quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextLesson = () => {
    if (questFailed || livesState.lives <= 0) return;

    if (isLastLesson) {
      setBossHealth(0);
      playSfx("complete");
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

  const handleRetryQuest = () => {
    if (livesState.lives <= 0) return;
    setQuestFailed(false);
    setPlayerHealth(PLAYER_MAX_HEALTH);
    setBossHealth(100);
    setBossHitTick((prev) => prev + 1);
    setCurrentLessonIndex(0);
    setSelectedAnswer(null);
    setShowResults(false);
    setQuizResults(null);
  };

  const quiz = currentLesson.quizzes?.[0];
  const quizOptionLabels = ["A", "B", "C", "D", "E", "F"];
  const nextLifeInMs = livesState.nextRefillAt ? Math.max(0, livesState.nextRefillAt - nowMs) : 0;

  useEffect(() => {
    const initial = (() => {
      try {
        const raw = localStorage.getItem(livesStorageKey);
        const parsed = raw ? JSON.parse(raw) : { lives: MAX_LIVES, nextRefillAt: null };
        return applyLifeRegen(parsed, Date.now());
      } catch (err) {
        return { lives: MAX_LIVES, nextRefillAt: null };
      }
    })();

    setLivesState(initial);
    persistLives(initial);
    setBossHealth(100);
    setPlayerHealth(PLAYER_MAX_HEALTH);
    setQuestFailed(false);
    setCurrentLessonIndex(0);
    setSelectedAnswer(null);
    setShowResults(false);
    setQuizResults(null);
  }, [livesStorageKey]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setNowMs(now);
      setLivesState((prev) => {
        const regenerated = applyLifeRegen(prev, now);
        if (regenerated.lives !== prev.lives || regenerated.nextRefillAt !== prev.nextRefillAt) {
          persistLives(regenerated);
          return regenerated;
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

  useEffect(() => {
    stopLessonNarration();
    // Stop any active narration when changing lessons.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLessonIndex]);

  useEffect(() => () => stopLessonNarration(), []);

  return (
    <>
    <div
      className={embedded
        ? "w-full"
        : "fixed inset-0 bg-[#06080d]/90 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto"
      }
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={embedded
          ? "bg-gradient-to-br from-[#131a24] via-[#0f151e] to-[#0d1118] border border-stone-700 rounded-2xl shadow-2xl w-full h-[calc(100vh-2rem)] overflow-hidden flex flex-col"
          : "bg-gradient-to-br from-[#131a24] via-[#0f151e] to-[#0d1118] border border-stone-700 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col"
        }
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-cyan-500/20 via-sky-400/15 to-amber-400/20 border-b border-stone-700 px-4 py-3">
          <button
            className="absolute top-2.5 right-2.5 text-stone-300 hover:text-cyan-300 transition-colors p-1.5 hover:bg-white/10 rounded-lg"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-10 h-10 bg-[#121722] border border-stone-700 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-100 leading-tight">{quest.title}</h2>
              <p className="text-xs text-stone-300">
                Lessons Left: {lessonsLeft} / {quest.lessons.length}
              </p>
            </div>
          </div>

          {/* Boss Health Bar */}
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1 text-[10px] uppercase tracking-[0.16em]">
              <span className="text-red-300">Boss Health</span>
              <span className="text-stone-300">{Math.round(bossHealth)}%</span>
            </div>
            <div className="relative rounded-lg p-1 border border-red-500/40 bg-[#0a0d12] shadow-[inset_0_0_0_1px_rgba(239,68,68,0.15)]">
              <div className="relative h-3 rounded-md overflow-hidden bg-[#1a0f14] border border-red-900/50">
                <div
                  className="absolute inset-0 opacity-35"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 18px)",
                  }}
                />
                <motion.div
                  className="h-full bg-gradient-to-r from-red-700 via-red-500 to-orange-400 relative"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${bossHealth}%`,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.25),transparent_45%)]" />
                </motion.div>

                <AnimatePresence>
                  {bossHitTick > 0 && (
                    <motion.div
                      key={`boss-hit-${bossHitTick}`}
                      initial={{ opacity: 0.75, scale: 0.95 }}
                      animate={{ opacity: 0, scale: 1.08 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.45 }}
                      className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(255,240,240,0.65),transparent_42%)] pointer-events-none"
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Player Health and Lives */}
          <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <div>
              <div className="flex items-center justify-between mb-1 text-[10px] uppercase tracking-[0.16em]">
                <span className="text-emerald-300 flex items-center gap-1"><Heart className="w-3 h-3" /> Player Health</span>
                <span className="text-stone-300">{Math.round(playerHealth)}%</span>
              </div>
              <div className="h-2.5 rounded-md overflow-hidden bg-[#102018] border border-emerald-900/60">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-lime-300"
                  initial={{ width: PLAYER_MAX_HEALTH }}
                  animate={{ width: `${playerHealth}%` }}
                  transition={{ duration: 0.35 }}
                />
              </div>
            </div>

            <div className="text-[10px] text-stone-300 border border-stone-700 rounded-lg px-2 py-1.5 bg-[#10151d]/80 flex items-center justify-between">
              <span className="uppercase tracking-[0.16em]">Lives</span>
              <span className="font-semibold">{livesState.lives}/{MAX_LIVES}</span>
              {livesState.lives < MAX_LIVES && livesState.nextRefillAt && (
                <span className="text-amber-300">+1 in {formatCountdown(nextLifeInMs)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLessonIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto w-full"
            >
              {/* Lesson Title */}
              <div className="flex items-center gap-2 mb-2.5">
                <Sparkles className="w-5 h-5 text-cyan-300" />
                <h3 className="text-lg font-bold text-white leading-tight">
                  {currentLesson.title}
                </h3>
                <span className="ml-auto text-amber-300 flex items-center gap-1 text-sm">
                  <Zap className="w-4 h-4" />
                  {currentLesson.xp || 0} XP
                </span>
              </div>

              <div className="mb-2.5 flex justify-end">
                <button
                  type="button"
                  onClick={handleToggleLessonNarration}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    isReadingLesson
                      ? "bg-amber-300/20 text-amber-200 border-amber-300/60"
                      : "bg-cyan-400/15 text-cyan-200 border-cyan-300/50 hover:bg-cyan-400/25"
                  }`}
                >
                  {isReadingLesson ? "Stop Reading" : "Read Lesson Aloud"}
                </button>
              </div>

              <div className="bg-gradient-to-br from-[#172231] via-[#182635] to-[#111b27] border border-cyan-300/20 rounded-2xl p-4 mb-3 min-h-[15rem] max-h-[52vh] overflow-y-auto shadow-[0_0_0_1px_rgba(34,211,238,0.1)]">
                <div className="max-w-none text-[15px] md:text-[17px] leading-relaxed text-stone-100 [&_*]:text-stone-100 [&_h1]:text-cyan-100 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3 [&_h2]:text-cyan-100 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-2 [&_h3]:text-cyan-100 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_p]:my-2 [&_strong]:text-amber-200 [&_strong]:font-semibold [&_em]:text-cyan-200 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_a]:text-sky-300 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-cyan-300/50 [&_blockquote]:pl-3 [&_blockquote]:text-stone-300 [&_pre]:bg-[#0f141b] [&_pre]:border [&_pre]:border-[#2a3442] [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:overflow-x-auto [&_code]:text-cyan-300">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {currentLesson.content || ""}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Quiz Section */}
              {quiz && quiz.question && (
                <div className="relative overflow-hidden bg-gradient-to-br from-[#171324] via-[#141b22] to-[#121212] border border-[#31313b] rounded-2xl p-3">
                  <div className="relative flex flex-col gap-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 rounded-lg flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-[#b794ff]" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.16em] text-[#9f95c8]">Quiz Arena</p>
                          <h4 className="text-lg font-bold text-white leading-tight">Knowledge Check</h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-black/25 border border-white/10">
                        <Zap className="w-3.5 h-3.5 text-cyan-300" />
                        <span className="text-xs text-[#d6d6d6]">Pass to secure XP</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#0f0f13]/70 border border-[#2d2d37]">
                      <p className="text-[10px] text-[#908f99] mb-1 uppercase tracking-widest">Question</p>
                      <p className="text-sm text-white leading-relaxed">{quiz.question}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
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
                            whileHover={!showResults ? { scale: 1.01, x: 3 } : {}}
                            whileTap={!showResults ? { scale: 0.99 } : {}}
                            className={`w-full px-2.5 py-2 rounded-lg border-2 text-left transition-all ${
                              showCorrect
                                ? "border-cyan-400 bg-cyan-400/20"
                                : showIncorrect
                                ? "border-red-500 bg-red-500/20"
                                : isSelected
                                ? "border-[#8b5cf6] bg-[#8b5cf6]/15"
                                : "border-[#343441] bg-[#12141a] hover:border-[#8b5cf6]/60"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border ${
                                  showCorrect
                                    ? "bg-cyan-400/20 border-cyan-400/60 text-cyan-300"
                                    : showIncorrect
                                    ? "bg-red-500/20 border-red-500/60 text-red-300"
                                    : isSelected
                                    ? "bg-[#8b5cf6]/20 border-[#8b5cf6]/60 text-[#c8b7ff]"
                                    : "bg-[#1f2028] border-[#383948] text-[#b8b9c5]"
                                }`}
                              >
                                {quizOptionLabels[idx] || idx + 1}
                              </div>

                              <div className="flex-1">
                                <p className="text-xs text-white leading-snug">{option}</p>
                                {!showResults && isSelected && (
                                  <p className="text-xs text-[#c8b7ff] mt-1">Selected answer</p>
                                )}
                              </div>

                              {showCorrect && <CheckCircle2 className="w-5 h-5 text-cyan-300" />}
                              {showIncorrect && <X className="w-5 h-5 text-red-400" />}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    {!showResults && (
                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <motion.button
                          onClick={handleSubmitQuiz}
                          disabled={selectedAnswer === null || loading}
                          whileHover={selectedAnswer !== null ? { scale: 1.02 } : {}}
                          whileTap={selectedAnswer !== null ? { scale: 0.98 } : {}}
                          className={`w-full sm:flex-1 py-2 rounded-xl font-semibold text-xs transition-all ${
                            selectedAnswer !== null
                              ? "bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300 text-[#0d1118] shadow-lg shadow-cyan-500/20"
                              : "bg-[#2a2d36] text-[#7f8390] cursor-not-allowed"
                          }`}
                        >
                          {loading ? "Evaluating Answer..." : "Lock In Answer"}
                        </motion.button>

                        <p className="text-[10px] text-[#8d91a0] text-center sm:text-right sm:w-44">
                          Choose carefully. You can only submit once per lesson.
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {(questFailed || livesState.lives <= 0) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-4 rounded-xl border border-red-500/40 bg-red-500/10"
            >
              <div className="flex items-center gap-2 mb-2 text-red-300">
                <Skull className="w-4 h-4" />
                <span className="font-semibold">Quest Failed</span>
              </div>
              <p className="text-sm text-stone-300 mb-3">
                Your HP reached zero. You cannot complete this quest run.
              </p>

              {livesState.lives > 0 ? (
                <button
                  type="button"
                  onClick={handleRetryQuest}
                  className="px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-amber-300 text-[#0d1118] font-semibold text-sm"
                >
                  Retry Quest ({livesState.lives} lives left)
                </button>
              ) : (
                <p className="text-sm text-amber-300">
                  No lives left. Next life in {formatCountdown(nextLifeInMs)}.
                </p>
              )}
            </motion.div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="border-t border-[#282828] px-5 py-3 bg-[#121212] flex justify-between items-center">
          <motion.button
            onClick={handlePreviousLesson}
            disabled={currentLessonIndex === 0 || questFailed || livesState.lives <= 0}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
              currentLessonIndex === 0 || questFailed || livesState.lives <= 0
                ? "bg-[#282828] text-[#808080] cursor-not-allowed"
                : "bg-[#1a1a1a] border border-[#282828] text-white hover:border-cyan-400/50"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </motion.button>

          <div className="text-[#808080] text-xs">
            Lesson {currentLessonIndex + 1} / {quest.lessons.length}
          </div>

          {showResults && !questFailed && livesState.lives > 0 ? (
            <motion.button
              onClick={handleNextLesson}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-400 to-amber-300 hover:from-cyan-300 hover:to-amber-200 text-[#0d1118] flex items-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              {isLastLesson ? "Finish Quest" : "Next Lesson"}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          ) : (
            <div className="px-4 py-2 rounded-xl bg-[#282828] text-[#808080] text-xs">
              {questFailed
                ? "Quest failed - retry required"
                : livesState.lives <= 0
                ? `No lives left - +1 in ${formatCountdown(nextLifeInMs)}`
                : "Complete quiz to continue"}
            </div>
          )}
        </div>
      </motion.div>
    </div>
    </>
  );
}
