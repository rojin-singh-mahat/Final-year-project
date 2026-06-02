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
  Skull,
} from "lucide-react";

const MAX_LIVES = 3;
const LIFE_REFILL_MS = 15 * 60 * 1000;
const PLAYER_MAX_HEALTH = 100;
const PLAYER_DAMAGE_ON_WRONG = 18;
const COMPUTER_DAMAGE_ON_HIT = 12;
const BOSS_DAMAGE_PER_CORRECT_SCALE = 90;
const MIN_QUESTIONS_PER_LESSON = 1;
const QUESTION_TIME_LIMIT_SECONDS = 30;
const COMBAT_SCENE_VIDEOS = {
  start: "/videos/combat/start.mkv",
  neutral: "/videos/combat/hit'n'miss.mkv",
  playerHitComputerHit: "/videos/combat/hit'n'hit.mkv",
  playerHitComputerMiss: "/videos/combat/hit'n'miss.mkv",
  playerMissComputerHit: "/videos/combat/miss'n'hit.mkv",
  playerMissComputerMiss: "/videos/combat/miss'n'miss.mkv",
  finalVictory: "/videos/combat/hit'n'miss.mkv",
  finalDefeat: "/videos/combat/miss'n'hit.mkv",
};
const FINAL_OUTCOME_PAUSE_SECONDS = {
  finalVictory: 3,
  finalDefeat: 8,
};

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

const clampHealthPercent = (value) => Math.max(0, Math.min(100, Number(value) || 0));
const getVideoMimeType = (src = "") => (src.endsWith(".mkv") ? "video/x-matroska" : "video/mp4");

export default function LessonPlayer({ quest, onClose, onComplete, embedded = false }) {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quizScreen, setQuizScreen] = useState(false);
  const [quizOrder, setQuizOrder] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(QUESTION_TIME_LIMIT_SECONDS);
  const [bossHealth, setBossHealth] = useState(100);
  const [bossHitTick, setBossHitTick] = useState(0);
  const [playerHealth, setPlayerHealth] = useState(PLAYER_MAX_HEALTH);
  const [combatScene, setCombatScene] = useState("neutral");
  const [questFailed, setQuestFailed] = useState(false);
  const [nowMs, setNowMs] = useState(Date.now());
  const livesStorageKey = useMemo(
    () => `questLives:${String(quest?._id || quest?.id || "default")}`,
    [quest?._id, quest?.id]
  );
  const [livesState, setLivesState] = useState({ lives: MAX_LIVES, nextRefillAt: null });
  const audioContextRef = useRef(null);
  const speechUtteranceRef = useRef(null);
  const lastQuizOrderRef = useRef("");
  const startVideoRef = useRef(null);
  const combatVideoRef = useRef(null);
  const frozenImpactVideoRef = useRef(null);
  const transitionVideoRef = useRef(null);
  const finalOutcomeTimerRef = useRef(null);
  const timeoutHandledQuestionRef = useRef("");
  const [isReadingLesson, setIsReadingLesson] = useState(false);
  const [frozenImpactScene, setFrozenImpactScene] = useState(null);
  const [transitionScene, setTransitionScene] = useState(null);
  const [pendingAdvance, setPendingAdvance] = useState(null);
  const [answerFeedback, setAnswerFeedback] = useState(null);
  const [finalOutcomeBanner, setFinalOutcomeBanner] = useState(null);
  const [aiFeedbackText, setAiFeedbackText] = useState("");
  const [roundEventText, setRoundEventText] = useState("");
  const [pendingCombatEffects, setPendingCombatEffects] = useState({ bossDamage: 0, playerDamage: 0 });
  const [shotFxTick, setShotFxTick] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isStartCinematicPlaying, setIsStartCinematicPlaying] = useState(true);

  const currentLesson = quest.lessons[currentLessonIndex];
  const isTutorialQuest = useMemo(() => {
    const title = String(quest?.title || "").toLowerCase();
    const tags = Array.isArray(quest?.hashtags)
      ? quest.hashtags.map((tag) => String(tag || "").toLowerCase())
      : [];
    return title.includes("tutorial") || tags.includes("tutorial");
  }, [quest?.title, quest?.hashtags]);
  const isLastLesson = currentLessonIndex === quest.lessons.length - 1;
  const lessonsLeft = Math.max(quest.lessons.length - currentLessonIndex, 0);
  const allLessonQuizzes = Array.isArray(currentLesson?.quizzes) ? currentLesson.quizzes : [];
  const configuredQuestionsToShow = Math.max(
    MIN_QUESTIONS_PER_LESSON,
    Number(currentLesson?.quizQuestionsToShow || MIN_QUESTIONS_PER_LESSON)
  );
  const questionsToShow = Math.min(configuredQuestionsToShow, allLessonQuizzes.length);
  const totalQuestQuestionTarget = useMemo(() => {
    const lessons = Array.isArray(quest?.lessons) ? quest.lessons : [];
    const total = lessons.reduce((sum, lesson) => {
      const lessonQuizzes = Array.isArray(lesson?.quizzes) ? lesson.quizzes : [];
      const configured = Math.max(
        MIN_QUESTIONS_PER_LESSON,
        Number(lesson?.quizQuestionsToShow || MIN_QUESTIONS_PER_LESSON)
      );
      return sum + Math.min(configured, lessonQuizzes.length);
    }, 0);
    return Math.max(total, 1);
  }, [quest?.lessons]);
  const activeQuizIndex = quizOrder[quizQuestionIndex];
  const quiz = Number.isInteger(activeQuizIndex) ? allLessonQuizzes[activeQuizIndex] : null;
  const totalQuizQuestions = quizOrder.length;
  const isLastQuizQuestion = quizQuestionIndex >= Math.max(totalQuizQuestions - 1, 0);
  const knightHealthPercent = clampHealthPercent(playerHealth);
  const enemyHealthPercent = clampHealthPercent(bossHealth);
  const timerProgressPercent = clampHealthPercent(
    (questionTimeLeft / QUESTION_TIME_LIMIT_SECONDS) * 100
  );
  const activeCombatVideoSrc = COMBAT_SCENE_VIDEOS[combatScene] || COMBAT_SCENE_VIDEOS.neutral;
  const isCinematicPlaying = Boolean(transitionScene);
  const showOpeningCinematic = isStartCinematicPlaying;
  const showQuizPopupOnFrozenVideo =
    Boolean(frozenImpactScene) &&
    !isCinematicPlaying &&
    quizScreen &&
    !showResults &&
    !questFailed &&
    livesState.lives > 0 &&
    Boolean(quiz);
  const hideMainPanels = showOpeningCinematic || isCinematicPlaying || showQuizPopupOnFrozenVideo;

  const canShowLeaveWarning = !finalOutcomeBanner;

  const clearCombatSceneResetTimer = () => {
    return undefined;
  };

  const handleAttemptClose = () => {
    if (!canShowLeaveWarning) {
      onClose();
      return;
    }
    setShowExitConfirm(true);
  };

  const handleConfirmClose = () => {
    setShowExitConfirm(false);
    onClose();
  };

  const handleSkipVideo = () => {
    stopAllScheduledAudio();
    if (showOpeningCinematic) {
      setIsStartCinematicPlaying(false);
      return;
    }

    if (transitionScene) {
      finishOutcomeTransition();
    }
  };

  const resolveOutcomeScene = (playerHits, computerHits) => {
    if (playerHits && computerHits) return "playerHitComputerHit";
    if (playerHits && !computerHits) return "playerHitComputerMiss";
    if (!playerHits && computerHits) return "playerMissComputerHit";
    return "playerMissComputerMiss";
  };

  const queueCombatEffects = ({ bossDamage = 0, playerDamage = 0 }) => {
    setPendingCombatEffects({
      bossDamage: Math.max(0, Number(bossDamage) || 0),
      playerDamage: Math.max(0, Number(playerDamage) || 0),
    });
  };

  const applyPendingCombatEffects = () => {
    const { bossDamage, playerDamage } = pendingCombatEffects;

    if (bossDamage > 0) {
      setBossHealth((prev) => Math.max(0, prev - bossDamage));
      setBossHitTick((prev) => prev + 1);
    }

    if (playerDamage > 0) {
      setPlayerHealth((prev) => {
        const minimumHealth = isTutorialQuest ? 1 : 0;
        const nextHealth = Math.max(minimumHealth, prev - playerDamage);
        if (nextHealth <= 0 && !isTutorialQuest) {
          setCombatScene("finalDefeat");
          setQuestFailed(true);
          consumeLife();
        }
        return nextHealth;
      });
    }

    setPendingCombatEffects({ bossDamage: 0, playerDamage: 0 });
  };

  const buildAiFeedback = ({ questionText, selectedOption, correctOption, isCorrectAnswer }) => {
    const q = stripMarkdown(questionText || "this question");
    const selected = stripMarkdown(selectedOption || "your selected option");
    const correct = stripMarkdown(correctOption || "the correct answer");

    if (isCorrectAnswer) {
      return `Great! "${selected}" fits this question.`;
    }

    return `Not quite. The correct answer is "${correct}".`;
  };

  const resolveNextStep = () => {
    if (!quizScreen || !quizOrder.length) return null;

    if (!isLastQuizQuestion) {
      return { kind: "question", nextQuestionIndex: quizQuestionIndex + 1 };
    }

    if (!isLastLesson) {
      return { kind: "lesson", nextLessonIndex: currentLessonIndex + 1 };
    }

    return { kind: "finish" };
  };

  const startOutcomeTransition = () => {
    if (!pendingAdvance || !answerFeedback?.scene) return;

    const transitionSceneForStep =
      pendingAdvance.kind === "finish"
        ? answerFeedback.finalScene || answerFeedback.scene
        : answerFeedback.scene;

    setTransitionScene(transitionSceneForStep);
    setFrozenImpactScene(null);
  };

  const clearFinalOutcomeTimer = () => {
    if (finalOutcomeTimerRef.current) {
      clearTimeout(finalOutcomeTimerRef.current);
      finalOutcomeTimerRef.current = null;
    }
  };

  const finishOutcomeTransition = () => {
    const nextStep = pendingAdvance;
    const scene = transitionScene || answerFeedback?.scene;

    setTransitionScene(null);
    setCombatScene(scene || "neutral");
    setFrozenImpactScene(scene || null);

    if (!nextStep) {
      return;
    }

    if (nextStep.kind === "question") {
      applyPendingCombatEffects();
      setQuizQuestionIndex(nextStep.nextQuestionIndex);
      setQuestionTimeLeft(QUESTION_TIME_LIMIT_SECONDS);
      setSelectedAnswer(null);
      setShowResults(false);
      setQuizResults(null);
      setAnswerFeedback(null);
      setAiFeedbackText("");
      setRoundEventText("");
      setPendingAdvance(null);
      return;
    }

    if (nextStep.kind === "lesson") {
      applyPendingCombatEffects();
      setCurrentLessonIndex(nextStep.nextLessonIndex);
      setQuizOrder([]);
      setQuizAnswers([]);
      setQuizQuestionIndex(0);
      setQuestionTimeLeft(QUESTION_TIME_LIMIT_SECONDS);
      setSelectedAnswer(null);
      setShowResults(false);
      setQuizResults(null);
      setQuizScreen(false);
      setAnswerFeedback(null);
      setAiFeedbackText("");
      setRoundEventText("");
      setPendingAdvance(null);
      return;
    }

    if (nextStep.kind === "finish") {
      setShowResults(false);
      setPendingAdvance(null);
      const isVictory = scene === "finalVictory";
      setFinalOutcomeBanner(isVictory ? "victory" : "defeated");
      clearFinalOutcomeTimer();
      finalOutcomeTimerRef.current = setTimeout(() => {
        setFinalOutcomeBanner(null);
        setAnswerFeedback(null);
        setBossHealth(0);
        playSfx("complete");
        if (onComplete) onComplete(quizResults);
        onClose();
        finalOutcomeTimerRef.current = null;
      }, 5000);
    }
  };

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

  const unlockAudioContext = async () => {
    const ctx = getAudioContext();
    if (!ctx) return null;
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch (err) {
        console.error("Failed to resume audio context:", err);
      }
    }
    return ctx;
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

  // ===== Audio Buffer Scheduling =====
  const audioBuffersRef = useRef({});
  const audioSourcesRef = useRef([]);
  const FRAME_RATE = 24;

  const stopAllScheduledAudio = () => {
    try {
      const list = audioSourcesRef.current || [];
      list.forEach((src) => {
        try {
          if (src && typeof src.stop === "function") src.stop(0);
        } catch (e) {
          console.error("Error stopping audio source:", e);
        }
      });
      audioSourcesRef.current = [];
    } catch (err) {
      console.error("Error stopping all audio:", err);
    }
  };

  const loadAudioBuffer = async (filename) => {
    const ctx = getAudioContext();
    if (!ctx) return null;

    try {
      const response = await fetch(`/audio/${filename}`);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = await ctx.decodeAudioData(arrayBuffer);
      return buffer;
    } catch (err) {
      console.error(`Failed to load audio: ${filename}`, err);
      return null;
    }
  };

  const ensureAudioBuffersLoaded = async () => {
    const ctx = getAudioContext();
    if (!ctx) {
      console.warn("[Audio] No audio context available");
      return;
    }

    const fileMap = {
      roar: "freesound_community-monster-roar-02-102957.mp3",
      underload: "wfoly_sh_romeo870_empty_start_fast_underload_01.mp3",
      cock: "freesound_community-realistic-shotgun-cocking-sound-38640.mp3",
      firing: "freesound_community-shotgun-firing-4-6746.mp3",
    };

    const buffers = {};
    for (const [key, filename] of Object.entries(fileMap)) {
      try {
        const response = await fetch(`/audio/${filename}`);
        if (!response.ok) {
          console.error(`Failed to fetch audio: ${filename} (${response.status})`);
          continue;
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = await ctx.decodeAudioData(arrayBuffer);
        buffers[key] = buffer;
        console.log(`[Audio] Loaded ${key}: ${filename} (${buffer.duration.toFixed(2)}s)`);
      } catch (err) {
        console.error(`Failed to load audio buffer: ${filename}`, err);
      }
    }
    audioBuffersRef.current = buffers;
    console.log("[Audio] All buffers loaded:", Object.keys(buffers));
  };

  const scheduleBufferForVideo = async (buffer, videoEl, startOffset = 0, stopAfterSec = null) => {
    if (!buffer) {
      console.warn("[Audio] Cannot play buffer: buffer is null");
      return;
    }
    const ctx = await unlockAudioContext();
    if (!ctx) {
      console.warn("[Audio] Cannot play buffer: no audio context");
      return;
    }

    try {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.value = 0.8; // 80% volume to ensure audibility
      src.connect(gain);
      gain.connect(ctx.destination);
      src.start(ctx.currentTime + Math.max(0, Number(startOffset) || 0));
      if (typeof stopAfterSec === "number") {
        src.stop(ctx.currentTime + Math.max(0, Number(startOffset) || 0) + stopAfterSec);
      }
      audioSourcesRef.current = audioSourcesRef.current.concat(src);
      console.log(`[Audio] Playing buffer (${buffer.duration.toFixed(2)}s, ${stopAfterSec ? `stops after ${stopAfterSec}s` : "full length"})`);
      return src;
    } catch (err) {
      console.error("Failed to play buffer", err);
      return null;
    }
  };

  const createVideoSoundScheduler = (videoEl, sceneName, isStartVideo = false) => {
    if (!videoEl) return null;

    const playedSounds = {};
    const buffers = audioBuffersRef.current || {};

    const onTimeUpdate = () => {
      const currentTime = Number(videoEl.currentTime || 0);

      if (isStartVideo) {
        // Start video precise timings (24fps frame-based)
        const roarTime = 6 + 4 / FRAME_RATE;        // 6.1666667s
        const underloadTime = 7 + 2 / FRAME_RATE;   // 7.0833333s
        const cockTime = 9;                          // 9s

        // Roar: play once when we cross the threshold
        if (currentTime >= roarTime && !playedSounds.roar && buffers.roar) {
          console.log(`[SFX] Start video: ROAR at ${currentTime.toFixed(3)}s (target: ${roarTime.toFixed(3)}s)`);
          scheduleBufferForVideo(buffers.roar, videoEl, 0, 6);
          playedSounds.roar = true;
        }

        // Underload: play once when we cross the threshold
        if (currentTime >= underloadTime && !playedSounds.underAt7 && buffers.underload) {
          console.log(`[SFX] Start video: UNDERLOAD at ${currentTime.toFixed(3)}s (target: ${underloadTime.toFixed(3)}s)`);
          scheduleBufferForVideo(buffers.underload, videoEl, 0);
          playedSounds.underAt7 = true;
        }

        // Cocking: play once when we cross the threshold
        if (currentTime >= cockTime && !playedSounds.cockStart && buffers.cock) {
          console.log(`[SFX] Start video: COCKING at ${currentTime.toFixed(3)}s (target: ${cockTime.toFixed(3)}s)`);
          scheduleBufferForVideo(buffers.cock, videoEl, 0);
          playedSounds.cockStart = true;
        }
      } else {
        // Outcome videos
        const FRAME_26_TIME = 26 / FRAME_RATE;      // 1.0833s
        const FRAME_51_TIME = 51 / FRAME_RATE;      // 2.125s

        // Frame 26: Underload
        if (currentTime >= FRAME_26_TIME && !playedSounds.underload && buffers.underload) {
          console.log(`[SFX] Outcome video (${sceneName}): UNDERLOAD at ${currentTime.toFixed(3)}s (frame 26: ${FRAME_26_TIME.toFixed(3)}s)`);
          scheduleBufferForVideo(buffers.underload, videoEl, 0);
          playedSounds.underload = true;
        }

        // Cocking after underload: use a small delay after underload duration
        const underDur = buffers.underload ? buffers.underload.duration : 0.12;
        const cockTimeAfterUnderload = FRAME_26_TIME + underDur;
        if (currentTime >= cockTimeAfterUnderload && !playedSounds.cock && buffers.cock) {
          console.log(`[SFX] Outcome video (${sceneName}): COCKING at ${currentTime.toFixed(3)}s (after underload duration)`);
          scheduleBufferForVideo(buffers.cock, videoEl, 0);
          playedSounds.cock = true;
        }

        // Frame 51: Firing for player hits, Underload for misses
        if (currentTime >= FRAME_51_TIME && !playedSounds.frame51) {
          const isPlayerHit = String(sceneName || "").startsWith("playerHit");
          if (isPlayerHit && buffers.firing) {
            console.log(`[SFX] Outcome video (${sceneName}): FIRING at ${currentTime.toFixed(3)}s (frame 51: ${FRAME_51_TIME.toFixed(3)}s)`);
            scheduleBufferForVideo(buffers.firing, videoEl, 0);
          } else if (!isPlayerHit && buffers.underload) {
            console.log(`[SFX] Outcome video (${sceneName}): UNDERLOAD at ${currentTime.toFixed(3)}s (frame 51, miss outcome)`);
            scheduleBufferForVideo(buffers.underload, videoEl, 0);
          }
          playedSounds.frame51 = true;
        }

        // Scene-specific second cocking times (24fps frame-based)
        const sceneSecondCockTimes = {
          playerHitComputerHit: 9 + 4 / FRAME_RATE,     // 9.1666667s
          playerHitComputerMiss: 8 + 4 / FRAME_RATE,    // 8.1666667s
          playerMissComputerHit: 3 + 3 / FRAME_RATE,    // 3.125s
          playerMissComputerMiss: 3 + 3 / FRAME_RATE,   // 3.125s
        };
        const sceneKey = String(sceneName || "");
        const sceneSecondTime = sceneSecondCockTimes[sceneKey];
        if (sceneSecondTime && currentTime >= sceneSecondTime && !playedSounds.secondCock && buffers.cock) {
          console.log(`[SFX] Outcome video (${sceneName}): SECOND COCKING at ${currentTime.toFixed(3)}s (target: ${sceneSecondTime.toFixed(3)}s)`);
          scheduleBufferForVideo(buffers.cock, videoEl, 0);
          playedSounds.secondCock = true;
        }
      }
    };

    return { onTimeUpdate, playedSounds };
  };

  const handleStartVideoTimeUpdate = () => {
    const videoEl = startVideoRef.current;
    if (!videoEl) return;

    if (!audioBuffersRef.current?.roar || !audioBuffersRef.current?.underload || !audioBuffersRef.current?.cock) {
      return;
    }

    const currentTime = Number(videoEl.currentTime || 0);
    const played = videoEl._startAudioPlayed || (videoEl._startAudioPlayed = {});

    const roarTime = 6 + 4 / FRAME_RATE;
    const underloadTime = 7 + 2 / FRAME_RATE;
    const cockTime = 9;

    if (currentTime >= roarTime && !played.roar) {
      console.log(`[SFX] Start video: ROAR at ${currentTime.toFixed(3)}s (target: ${roarTime.toFixed(3)}s)`);
      scheduleBufferForVideo(audioBuffersRef.current.roar, videoEl, 0, 6);
      played.roar = true;
    }

    if (currentTime >= underloadTime && !played.underload) {
      console.log(`[SFX] Start video: UNDERLOAD at ${currentTime.toFixed(3)}s (target: ${underloadTime.toFixed(3)}s)`);
      scheduleBufferForVideo(audioBuffersRef.current.underload, videoEl, 0);
      played.underload = true;
    }

    if (currentTime >= cockTime && !played.cock) {
      console.log(`[SFX] Start video: COCKING at ${currentTime.toFixed(3)}s (target: ${cockTime.toFixed(3)}s)`);
      scheduleBufferForVideo(audioBuffersRef.current.cock, videoEl, 0);
      played.cock = true;
    }
  };

  const scheduleSfxForVideo = (videoEl, sceneName, isStartVideo = false) => {
    if (!videoEl) return;

    const scheduler = createVideoSoundScheduler(videoEl, sceneName, isStartVideo);
    if (!scheduler) return;

    if (!videoEl._soundScheduler) {
      videoEl._soundScheduler = scheduler;
      videoEl.addEventListener("timeupdate", scheduler.onTimeUpdate);
    }
  };

  const clearVideoSoundScheduler = (videoEl) => {
    if (!videoEl || !videoEl._soundScheduler) return;
    try {
      videoEl.removeEventListener("timeupdate", videoEl._soundScheduler.onTimeUpdate);
    } catch {}
    delete videoEl._soundScheduler;
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
    if (!showResults && !questFailed && livesState.lives > 0 && quizScreen) {
      setSelectedAnswer(answerIndex);
    }
  };

  const buildQuizOrder = () => {
    const poolSize = allLessonQuizzes.length;
    if (poolSize === 0) return [];

    const allIndexes = Array.from({ length: poolSize }, (_, idx) => idx);
    const makeSignature = (order) => order.join(",");

    let order = allIndexes;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const nextOrder = [...allIndexes].sort(() => Math.random() - 0.5);
      const trimmed = poolSize < MIN_QUESTIONS_PER_LESSON ? nextOrder : nextOrder.slice(0, questionsToShow);
      if (makeSignature(trimmed) !== lastQuizOrderRef.current || poolSize === 1) {
        order = trimmed;
        break;
      }
      order = trimmed;
    }

    return order;
  };

  const startQuizForLesson = () => {
    const order = buildQuizOrder();
    if (order.length === 0) {
      alert("This lesson has no quiz questions yet.");
      return;
    }

  lastQuizOrderRef.current = order.join(",");
    setQuizOrder(order);
    setQuizAnswers(Array(order.length).fill(null));
    setQuizQuestionIndex(0);
    setQuestionTimeLeft(QUESTION_TIME_LIMIT_SECONDS);
    setSelectedAnswer(null);
    setShowResults(false);
    setQuizResults(null);
    setQuizScreen(true);
  };

  const handleSubmitQuiz = async (options = {}) => {
    const { forcedAnswer = null, forcedComputerHits = null } = options;
    const answerToUse = forcedAnswer === null ? selectedAnswer : forcedAnswer;
    if (answerToUse === null || questFailed || livesState.lives <= 0 || !quizScreen || !quiz) return;
    const isCorrectAnswer = answerToUse === quiz.correctAnswer;
    const playerHits = isCorrectAnswer;
    const computerHits =
      forcedComputerHits === null
        ? isCorrectAnswer
          ? Math.random() < 0.2
          : Math.random() < 0.8
        : Boolean(forcedComputerHits);
    const nextStep = resolveNextStep();
    const outcomeScene = resolveOutcomeScene(playerHits, computerHits);

    const updatedAnswers = [...quizAnswers];
    updatedAnswers[quizQuestionIndex] = answerToUse;
    setQuizAnswers(updatedAnswers);
    const selectedOption = quiz?.options?.[answerToUse] || "No answer (time expired)";
    const correctOption = quiz?.options?.[quiz.correctAnswer] || "";
    setShotFxTick((prev) => prev + 1);
    const queuedBossDamage = playerHits ? BOSS_DAMAGE_PER_CORRECT_SCALE / totalQuestQuestionTarget : 0;
    const queuedPlayerDamage =
      (playerHits ? 0 : PLAYER_DAMAGE_ON_WRONG) + (computerHits ? COMPUTER_DAMAGE_ON_HIT : 0);
    queueCombatEffects({
      bossDamage: queuedBossDamage,
      playerDamage: queuedPlayerDamage,
    });

    if (!playerHits) {
      playSfx("wrong");
    } else {
      playSfx("bossDamage");
      playSfx("correct");
    }

    const playerAction = playerHits ? "hit" : "miss";
    const computerAction = computerHits ? "hit" : "miss";
    setRoundEventText(`Round Event: You ${playerAction}. Computer ${computerAction}.`);

    setAiFeedbackText("");

    setAnswerFeedback({
      correct: isCorrectAnswer,
      scene: outcomeScene,
      finalScene: null,
    });
    setPendingAdvance(nextStep);

    setLoading(true);
    try {
      const hasServerProgressIds = Boolean(currentLesson?._id && quest?._id) && !isTutorialQuest;
      let data;

      if (hasServerProgressIds) {
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
            answers: updatedAnswers,
            questionIndexes: quizOrder,
              currentQuestionIndex: quizQuestionIndex,
            timeTaken: 0,
          }),
        });

        if (!res.ok) throw new Error("Failed to submit quiz");
        data = await res.json();

        if (typeof data?.aiFeedback === "string" && data.aiFeedback.trim()) {
          setAiFeedbackText(data.aiFeedback.trim());
        } else {
          setAiFeedbackText(
            buildAiFeedback({
              questionText: quiz?.question || "",
              selectedOption,
              correctOption,
              isCorrectAnswer,
            })
          );
        }
      } else {
        const answered = updatedAnswers.filter((answer) => Number.isInteger(answer) && answer >= 0);
        const totalQuestions = Math.max(quizOrder.length, 1);
        const correctAnswers = Math.max(
          0,
          quizOrder.reduce((sum, quizIndex, answerIdx) => {
            const question = allLessonQuizzes[quizIndex];
            if (!question) return sum;
            return sum + (updatedAnswers[answerIdx] === question.correctAnswer ? 1 : 0);
          }, 0)
        );
        const score = Math.round((correctAnswers / totalQuestions) * 100);

        data = {
          score,
          correctAnswers,
          totalQuestions,
          xpEarned: answered.length * 10,
        };

        setAiFeedbackText(
          buildAiFeedback({
            questionText: quiz?.question || "",
            selectedOption,
            correctOption,
            isCorrectAnswer,
          })
        );
      }

      const hasMajorityCorrect = Number(data?.correctAnswers || 0) > Number(data?.totalQuestions || 0) / 2;
      const performanceFinalScene = hasMajorityCorrect ? "finalVictory" : "finalDefeat";
      setQuizResults(data);
      setShowResults(true);
      setCombatScene("neutral");
      setAnswerFeedback((prev) =>
        prev
          ? {
              ...prev,
              finalScene: performanceFinalScene,
            }
          : prev
      );

      if (!nextStep) {
        setPendingAdvance(null);
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

    startOutcomeTransition();
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
    clearFinalOutcomeTimer();
    setFinalOutcomeBanner(null);
    setFrozenImpactScene(null);
    setTransitionScene(null);
    setPendingAdvance(null);
    setAnswerFeedback(null);
    setAiFeedbackText("");
    setRoundEventText("");
    setPendingCombatEffects({ bossDamage: 0, playerDamage: 0 });
    setQuestFailed(false);
    setPlayerHealth(PLAYER_MAX_HEALTH);
    setBossHealth(100);
    setBossHitTick((prev) => prev + 1);
    setCurrentLessonIndex(0);
    setQuizScreen(false);
    setQuizOrder([]);
    setQuizAnswers([]);
    setQuizQuestionIndex(0);
    setQuestionTimeLeft(QUESTION_TIME_LIMIT_SECONDS);
    setSelectedAnswer(null);
    setShowResults(false);
    setQuizResults(null);
    setCombatScene("neutral");
  };

  const handleTransitionVideoTimeUpdate = () => {
    if (pendingAdvance?.kind !== "finish") return;

    const freezeAtSeconds = FINAL_OUTCOME_PAUSE_SECONDS[transitionScene];
    if (!freezeAtSeconds) return;

    const videoEl = transitionVideoRef.current;
    if (!videoEl) return;

    if (videoEl.currentTime >= freezeAtSeconds) {
      videoEl.pause();
      finishOutcomeTransition();
    }
  };

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
    setQuizScreen(false);
    clearFinalOutcomeTimer();
    setFinalOutcomeBanner(null);
    setFrozenImpactScene(null);
    setQuizOrder([]);
    setQuizAnswers([]);
    setQuizQuestionIndex(0);
    setQuestionTimeLeft(QUESTION_TIME_LIMIT_SECONDS);
    setCurrentLessonIndex(0);
    setSelectedAnswer(null);
    setShowResults(false);
    setQuizResults(null);
    setAiFeedbackText("");
    setRoundEventText("");
    setCombatScene("neutral");
    setIsStartCinematicPlaying(true);
  }, [livesStorageKey]);

  useEffect(() => {
    if (!quizScreen) {
      setFrozenImpactScene(null);
    }
  }, [quizScreen]);

  useEffect(() => {
    const frozenVideo = frozenImpactVideoRef.current;
    if (!frozenVideo || !frozenImpactScene) return;

    const freezeAtEndFrame = () => {
      const duration = Number(frozenVideo.duration || 0);
      const endFrameTime = duration > 0.08 ? duration - 0.05 : 0;
      try {
        frozenVideo.currentTime = endFrameTime;
      } catch {
        // Ignore seek timing issues on some browsers.
      }
      frozenVideo.pause();
    };

    if (frozenVideo.readyState >= 1) {
      freezeAtEndFrame();
      return undefined;
    }

    frozenVideo.addEventListener("loadedmetadata", freezeAtEndFrame, { once: true });
    return () => frozenVideo.removeEventListener("loadedmetadata", freezeAtEndFrame);
  }, [frozenImpactScene]);

  useEffect(() => {
    const videoEl = combatVideoRef.current;
    if (!videoEl) return;

    const syncFrame = async () => {
      try {
        if (frozenImpactScene) {
          const duration = Number(videoEl.duration || 0);
          const endFrameTime = duration > 0.08 ? duration - 0.05 : 0;
          videoEl.pause();
          videoEl.currentTime = endFrameTime;
          return;
        }

        videoEl.pause();
        videoEl.currentTime = 0;
      } catch {
        // Ignore timing issues while the video metadata settles.
      }
    };

    syncFrame();
  }, [activeCombatVideoSrc, frozenImpactScene]);

  useEffect(() => {
    if (!quizScreen || showResults || questFailed || livesState.lives <= 0) return;
    const timer = setInterval(() => {
      setQuestionTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [quizScreen, showResults, questFailed, livesState.lives]);

  useEffect(() => {
    if (!quizScreen || showResults || questFailed || livesState.lives <= 0) return;
    if (questionTimeLeft > 0 || selectedAnswer !== null || loading || !quiz) return;

    const questionKey = `${currentLessonIndex}:${quizQuestionIndex}`;
    if (timeoutHandledQuestionRef.current === questionKey) return;
    timeoutHandledQuestionRef.current = questionKey;

    // Time expiry is treated as a forced miss by the player and guaranteed enemy hit.
    handleSubmitQuiz({ forcedAnswer: -1, forcedComputerHits: true });
  }, [
    quizScreen,
    showResults,
    questFailed,
    livesState.lives,
    questionTimeLeft,
    selectedAnswer,
    loading,
    quiz,
    currentLessonIndex,
    quizQuestionIndex,
  ]);

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

    if (currentLesson?._id && !isTutorialQuest) startLesson();
  }, [currentLesson?._id, isTutorialQuest]);

  useEffect(() => {
    stopLessonNarration();
    // Stop any active narration when changing lessons.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLessonIndex]);

  useEffect(() => () => stopLessonNarration(), []);

  useEffect(() => {
    const unlock = () => {
      unlockAudioContext();
    };

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  // Load audio buffers on mount
  useEffect(() => {
    ensureAudioBuffersLoaded();
  }, []);

  // Attach scheduler to transition video
  useEffect(() => {
    if (!transitionScene || !transitionVideoRef.current) return;
    unlockAudioContext();
    scheduleSfxForVideo(transitionVideoRef.current, transitionScene, false);
    return () => clearVideoSoundScheduler(transitionVideoRef.current);
  }, [transitionScene]);

  useEffect(() => {
    if (!showOpeningCinematic) return undefined;

    const videoEl = startVideoRef.current;
    if (!videoEl) return undefined;

    const playPromise = videoEl.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {
        setIsStartCinematicPlaying(false);
      });
    }

    return undefined;
  }, [showOpeningCinematic]);

  useEffect(() => {
    if (!transitionScene) return undefined;

    const videoEl = transitionVideoRef.current;
    if (!videoEl) return undefined;

    const playPromise = videoEl.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {});
    }

    return undefined;
  }, [transitionScene]);

  useEffect(() => () => clearFinalOutcomeTimer(), []);

  return (
    <>
    <div
      className={embedded
        ? "w-full"
        : "fixed inset-0 bg-[#06080d] z-50"
      }
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={embedded
          ? "relative border border-stone-700 rounded-2xl shadow-2xl w-full h-[calc(100vh-2rem)] overflow-hidden flex flex-col"
          : "relative w-screen h-screen overflow-hidden flex flex-col"
        }
      >
        <div className="absolute inset-0">
          <video
            ref={combatVideoRef}
            className="w-full h-full object-cover opacity-45"
            muted
            playsInline
            preload="auto"
            src={activeCombatVideoSrc}
          >
            <source src={activeCombatVideoSrc} type={getVideoMimeType(activeCombatVideoSrc)} />
          </video>
          {showOpeningCinematic && (
            <video
              ref={startVideoRef}
              key="quest-start-cinematic"
              className="absolute inset-0 w-full h-full object-cover opacity-95 z-20"
              autoPlay
              muted
              playsInline
              preload="auto"
              src={COMBAT_SCENE_VIDEOS.start}
              onPlay={unlockAudioContext}
              onLoadedData={unlockAudioContext}
              onTimeUpdate={handleStartVideoTimeUpdate}
              onEnded={() => setIsStartCinematicPlaying(false)}
              onError={() => setIsStartCinematicPlaying(false)}
            >
              <source src={COMBAT_SCENE_VIDEOS.start} type={getVideoMimeType(COMBAT_SCENE_VIDEOS.start)} />
            </video>
          )}
          {frozenImpactScene && !transitionScene && (
            <video
              ref={frozenImpactVideoRef}
              className="absolute inset-0 w-full h-full object-cover opacity-75"
              muted
              playsInline
              preload="auto"
              src={COMBAT_SCENE_VIDEOS[frozenImpactScene] || COMBAT_SCENE_VIDEOS.neutral}
            >
              <source
                src={COMBAT_SCENE_VIDEOS[frozenImpactScene] || COMBAT_SCENE_VIDEOS.neutral}
                type={getVideoMimeType(
                  COMBAT_SCENE_VIDEOS[frozenImpactScene] || COMBAT_SCENE_VIDEOS.neutral
                )}
              />
            </video>
          )}
          {transitionScene && (
            <video
              ref={transitionVideoRef}
              key={transitionScene}
              className="absolute inset-0 w-full h-full object-cover opacity-90"
              autoPlay
              muted
              playsInline
              preload="auto"
              src={COMBAT_SCENE_VIDEOS[transitionScene] || COMBAT_SCENE_VIDEOS.neutral}
              onTimeUpdate={handleTransitionVideoTimeUpdate}
              onEnded={finishOutcomeTransition}
            >
              <source
                src={COMBAT_SCENE_VIDEOS[transitionScene] || COMBAT_SCENE_VIDEOS.neutral}
                type={getVideoMimeType(
                  COMBAT_SCENE_VIDEOS[transitionScene] || COMBAT_SCENE_VIDEOS.neutral
                )}
              />
            </video>
          )}
          {(showOpeningCinematic || transitionScene) && (
            <button
              type="button"
              onClick={handleSkipVideo}
              className="absolute top-4 right-4 z-40 px-3 py-1.5 rounded-lg border border-white/35 bg-black/45 text-white text-xs font-semibold hover:bg-black/65"
            >
              Skip
            </button>
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-[#060a11]/72 via-[#0d1118]/68 to-[#111722]/76" />
        </div>

        {showQuizPopupOnFrozenVideo && (
          <div className="absolute inset-0 z-30 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-2xl border border-cyan-300/35 bg-[#0d1118]/92 backdrop-blur-md p-4 shadow-[0_0_60px_rgba(34,211,238,0.2)]">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h4 className="text-lg font-bold text-white">
                  Question {quizQuestionIndex + 1} / {totalQuizQuestions}
                </h4>
                <div className="w-44">
                  <div className="h-2 rounded-full bg-white/20 border border-white/30 overflow-hidden">
                    <motion.div
                      className="h-full bg-white"
                      animate={{ width: `${timerProgressPercent}%` }}
                      transition={{ duration: 0.25, ease: "linear" }}
                    />
                  </div>
                  <p className="text-[10px] text-white/80 mt-1 text-right">{questionTimeLeft}s</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="rounded-lg border border-cyan-300/30 bg-[#0c1219]/80 p-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-cyan-200">Knight</span>
                    <span className="text-[10px] text-cyan-100 font-semibold">{Math.round(knightHealthPercent)}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#1b2430] border border-cyan-300/20 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-300"
                      animate={{ width: `${knightHealthPercent}%` }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-red-400/25 bg-[#170f12]/75 p-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-red-200">Enemy</span>
                    <span className="text-[10px] text-red-100 font-semibold">{Math.round(enemyHealthPercent)}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#2a1d22] border border-red-300/20 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-red-500 via-orange-400 to-amber-300"
                      animate={{ width: `${enemyHealthPercent}%` }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0f0f13]/70 border border-[#2d2d37] mb-3">
                <p className="text-[10px] text-[#908f99] mb-1 uppercase tracking-widest">Question</p>
                <p className="text-sm text-white leading-relaxed">{quiz.question}</p>
              </div>

              <div className="grid grid-cols-1 gap-2 mb-3">
                {quiz.options?.map((option, idx) => {
                  const isSelected = selectedAnswer === idx;
                  return (
                    <motion.button
                      key={idx}
                      onClick={() => handleAnswerSelect(idx)}
                      disabled={loading || showResults}
                      whileHover={!loading && !showResults ? { scale: 1.01, x: 3 } : {}}
                      whileTap={!loading && !showResults ? { scale: 0.99 } : {}}
                      className={`w-full px-2.5 py-2 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? "border-[#8b5cf6] bg-[#8b5cf6]/15"
                          : "border-[#343441] bg-[#12141a] hover:border-[#8b5cf6]/60"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center border ${
                          isSelected
                            ? "bg-red-500/25 border-amber-300 text-amber-100"
                            : "bg-[#2b1515] border-amber-400/80 text-amber-100"
                        }`}>
                          <div className="relative w-4 h-4">
                            <span className="absolute left-0.5 top-0.5 w-1.5 h-3 rounded-sm bg-red-500 border border-amber-300" />
                            <span className="absolute right-0.5 top-0.5 w-1.5 h-3 rounded-sm bg-red-500 border border-amber-300" />
                          </div>
                        </div>

                        <div className="flex-1">
                          <p className="text-xs text-white leading-snug">
                            <span className="text-amber-200 mr-1">{quizOptionLabels[idx] || idx + 1}.</span>
                            {option}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <motion.button
                onClick={handleSubmitQuiz}
                disabled={selectedAnswer === null || loading}
                whileHover={selectedAnswer !== null ? { scale: 1.02 } : {}}
                whileTap={selectedAnswer !== null ? { scale: 0.98 } : {}}
                className={`w-full py-2 rounded-xl font-semibold text-xs transition-all ${
                  selectedAnswer !== null
                    ? "bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300 text-[#0d1118] shadow-lg shadow-cyan-500/20"
                    : "bg-[#2a2d36] text-[#7f8390] cursor-not-allowed"
                }`}
              >
                {loading ? "Evaluating Quiz..." : isLastQuizQuestion ? "Finish Quiz" : "Next Question"}
              </motion.button>
            </div>
          </div>
        )}

        {finalOutcomeBanner && (
          <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
            <div
              className={`px-10 py-6 rounded-2xl border-2 shadow-2xl text-4xl md:text-5xl font-bold font-['Cinzel'] tracking-wide ${
                finalOutcomeBanner === "victory"
                  ? "text-[#f7d774] border-[#d3b35c] bg-[#1a1510]/65"
                  : "text-red-300 border-[#c6a684] bg-[#1a1110]/70"
              }`}
            >
              {finalOutcomeBanner === "victory" ? "Victory" : "Defeated"}
            </div>
          </div>
        )}

        {showExitConfirm && (
          <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-[2px] flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-amber-300/40 bg-[#121820] p-5">
              <h4 className="text-lg font-bold text-amber-200 mb-2">Leave Lesson?</h4>
              <p className="text-sm text-stone-300 mb-4">
                Your current run will end now. Progress in the middle of this lesson may not be saved.
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(false)}
                  className="px-3 py-2 rounded-lg border border-stone-600 text-stone-200 hover:bg-white/5"
                >
                  Stay
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClose}
                  className="px-3 py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-400 text-white font-semibold"
                >
                  Leave Quest
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className={`relative z-10 bg-gradient-to-r from-cyan-500/20 via-sky-400/15 to-amber-400/20 border-b border-stone-700 px-4 py-3 transition-opacity ${hideMainPanels ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
          <button
            className="absolute top-2.5 right-2.5 text-stone-300 hover:text-cyan-300 transition-colors p-1.5 hover:bg-white/10 rounded-lg"
            onClick={handleAttemptClose}
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

          <div className="mt-2 text-[11px] text-stone-300 border border-stone-700 rounded-lg px-2 py-1.5 bg-[#10151d]/80 inline-flex items-center gap-3">
            <span className="uppercase tracking-[0.16em]">Lives</span>
            <span className="font-semibold">{livesState.lives}/{MAX_LIVES}</span>
            {livesState.lives < MAX_LIVES && livesState.nextRefillAt && (
              <span className="text-amber-300">+1 in {formatCountdown(nextLifeInMs)}</span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className={`relative z-10 flex-1 overflow-y-auto px-4 py-3 transition-opacity ${hideMainPanels ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
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

              {!quizScreen ? (
                <>
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

                  <div className="mb-3 flex items-start gap-3">
                    <div className="shrink-0 w-11 h-11 rounded-full bg-cyan-400/15 border border-cyan-300/40 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-cyan-300" />
                    </div>
                    <div className="flex-1 bg-gradient-to-br from-[#172231] via-[#182635] to-[#111b27] border border-cyan-300/20 rounded-2xl p-4 min-h-[15rem] max-h-[62vh] overflow-y-auto shadow-[0_0_0_1px_rgba(34,211,238,0.1)]">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-cyan-300/90 mb-2">NPC Dialogue</p>
                      <div className="max-w-none text-[15px] md:text-[17px] leading-relaxed text-stone-100 [&_*]:text-stone-100 [&_h1]:text-cyan-100 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3 [&_h2]:text-cyan-100 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-2 [&_h3]:text-cyan-100 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_p]:my-2 [&_strong]:text-amber-200 [&_strong]:font-semibold [&_em]:text-cyan-200 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_a]:text-sky-300 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-cyan-300/50 [&_blockquote]:pl-3 [&_blockquote]:text-stone-300 [&_pre]:bg-[#0f141b] [&_pre]:border [&_pre]:border-[#2a3442] [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:overflow-x-auto [&_code]:text-cyan-300">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {currentLesson.content || ""}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-cyan-300/25 bg-[#111722] p-4 flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
                    <p className="text-sm text-stone-300">
                      Ready for the challenge? Showing <span className="text-cyan-300 font-semibold">{questionsToShow}</span> questions from a pool of <span className="text-cyan-300 font-semibold">{allLessonQuizzes.length}</span>.
                    </p>
                    <motion.button
                      type="button"
                      onClick={startQuizForLesson}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-amber-300 text-[#0d1118] font-semibold"
                    >
                      Start Quiz
                    </motion.button>
                  </div>
                </>
              ) : (
                <div className="relative min-h-[58vh] flex items-end">
                  <motion.div
                    key={shotFxTick}
                    initial={{ opacity: 0.92, y: 12, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="relative overflow-hidden bg-gradient-to-b from-[#161217] via-[#15181f] to-[#0f1117] border border-[#333643] rounded-2xl p-3 w-full shadow-[0_10px_40px_rgba(0,0,0,0.35)]"
                  >
                  <div className="relative flex flex-col gap-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 rounded-lg flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-[#b794ff]" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.16em] text-[#9f95c8]">Quiz Arena</p>
                          <h4 className="text-lg font-bold text-white leading-tight">
                            Question {quizQuestionIndex + 1} / {totalQuizQuestions}
                          </h4>
                        </div>
                      </div>

                      <div className="w-48">
                        <div className="h-2 rounded-full bg-white/20 border border-white/30 overflow-hidden">
                          <motion.div
                            className="h-full bg-white"
                            animate={{ width: `${timerProgressPercent}%` }}
                            transition={{ duration: 0.25, ease: "linear" }}
                          />
                        </div>
                        <p className="text-[10px] text-white/80 mt-1 text-right">{questionTimeLeft}s</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="rounded-lg border border-cyan-300/30 bg-[#0c1219]/80 p-2.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] uppercase tracking-[0.14em] text-cyan-200">Knight</span>
                          <span className="text-[10px] text-cyan-100 font-semibold">{Math.round(knightHealthPercent)}%</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-[#1b2430] border border-cyan-300/20 overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-300"
                            animate={{ width: `${knightHealthPercent}%` }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                          />
                        </div>
                      </div>

                      <div className="rounded-lg border border-red-400/25 bg-[#170f12]/75 p-2.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] uppercase tracking-[0.14em] text-red-200">Enemy</span>
                          <span className="text-[10px] text-red-100 font-semibold">{Math.round(enemyHealthPercent)}%</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-[#2a1d22] border border-red-300/20 overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-red-500 via-orange-400 to-amber-300"
                            animate={{ width: `${enemyHealthPercent}%` }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    </div>

                    {quiz && (
                      <>
                        <div className="rounded-lg border border-amber-300/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200">
                          Buckshot Mode: right answers usually favor you, but the enemy can still counterattack.
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#0f0f13]/70 border border-[#2d2d37]">
                          <p className="text-[10px] text-[#908f99] mb-1 uppercase tracking-widest">Question</p>
                          <p className="text-sm text-white leading-relaxed">{quiz.question}</p>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                          {quiz.options?.map((option, idx) => {
                            const isSelected = selectedAnswer === idx;
                            const isCorrectOption = quiz.correctAnswer === idx;
                            const revealCorrectness = showResults && quizResults;
                            const isIncorrectSelected = revealCorrectness && isSelected && !isCorrectOption;
                            const optionClass = revealCorrectness
                              ? isCorrectOption
                                ? "border-emerald-400/70 bg-emerald-500/15"
                                : isSelected
                                  ? "border-red-400/70 bg-red-500/15"
                                  : "border-[#343441] bg-[#12141a] opacity-80"
                              : isSelected
                                ? "border-[#8b5cf6] bg-[#8b5cf6]/15"
                                : "border-[#343441] bg-[#12141a] hover:border-[#8b5cf6]/60";
                            return (
                              <motion.button
                                key={idx}
                                onClick={() => handleAnswerSelect(idx)}
                                disabled={loading || showResults}
                                whileHover={!loading && !showResults ? { scale: 1.01, x: 3 } : {}}
                                whileTap={!loading && !showResults ? { scale: 0.99 } : {}}
                                className={`w-full px-2.5 py-2 rounded-lg border-2 text-left transition-all ${optionClass}`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-9 h-9 rounded-full flex items-center justify-center border ${
                                    revealCorrectness
                                      ? isCorrectOption
                                        ? "bg-emerald-500/20 border-emerald-300 text-emerald-100"
                                        : isSelected
                                          ? "bg-red-500/20 border-red-300 text-red-100"
                                          : "bg-[#1d232d] border-stone-600 text-stone-300"
                                      : isSelected
                                        ? "bg-red-500/25 border-amber-300 text-amber-100"
                                        : "bg-[#2b1515] border-amber-400/80 text-amber-100"
                                  }`}>
                                    <div className="relative w-4 h-4">
                                      <span className="absolute left-0.5 top-0.5 w-1.5 h-3 rounded-sm bg-red-500 border border-amber-300" />
                                      <span className="absolute right-0.5 top-0.5 w-1.5 h-3 rounded-sm bg-red-500 border border-amber-300" />
                                    </div>
                                  </div>

                                  <div className="flex-1">
                                    <p className="text-xs text-white leading-snug">
                                      <span className={`mr-1 ${revealCorrectness && isCorrectOption ? "text-emerald-200" : isSelected ? "text-red-200" : "text-amber-200"}`}>
                                        {quizOptionLabels[idx] || idx + 1}.
                                      </span>
                                      {option}
                                    </p>
                                  </div>

                                  {revealCorrectness && isCorrectOption && (
                                    <span className="text-[10px] uppercase tracking-[0.14em] text-emerald-200 font-semibold">Correct</span>
                                  )}
                                  {revealCorrectness && isIncorrectSelected && (
                                    <span className="text-[10px] uppercase tracking-[0.14em] text-red-200 font-semibold">Wrong</span>
                                  )}
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>

                        {showResults && quizResults && (
                          <div className="mt-3 rounded-xl border border-cyan-300/25 bg-[#0e131b]/90 p-3">
                            <div className="rounded-lg border border-cyan-300/25 bg-cyan-500/10 p-3">
                              <p className="text-[10px] uppercase tracking-[0.16em] text-cyan-200 mb-2 font-semibold">
                                AI Feedback
                              </p>
                              <p className="text-sm text-cyan-50 leading-relaxed whitespace-pre-wrap break-words max-h-32 overflow-y-auto pr-1">
                                {aiFeedbackText || "No feedback returned."}
                              </p>
                            </div>
                          </div>
                        )}
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
                              {loading ? "Evaluating Quiz..." : isLastQuizQuestion ? "Finish Quiz" : "Next Question"}
                            </motion.button>

                            <p className="text-[10px] text-[#8d91a0] text-center sm:text-right sm:w-44">
                              Admin controls the number of random questions shown.
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  </motion.div>
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
                You were defeated this run. Retry to continue.
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
        <div className={`relative z-10 border-t border-[#282828] px-5 py-3 bg-[#121212]/90 backdrop-blur-sm flex justify-between items-center transition-opacity ${hideMainPanels ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
          {/* <motion.button
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
          </motion.button> */}

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
              Watch Outcome
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
