require("dotenv").config();

const connectDB = require("../connectDB");
const Quest = require("../models/quest");

const MIN_OPTIONS = 4;
const MIN_QUIZZES_PER_LESSON = 3;

function clampCorrectAnswer(value, optionsLength) {
  const max = Math.max(optionsLength - 1, 0);
  if (Number.isInteger(value) && value >= 0 && value <= max) return value;
  return 0;
}

function ensureOptions(options = []) {
  const normalized = Array.isArray(options)
    ? options.map((option) => String(option || "").trim())
    : [];

  while (normalized.length < MIN_OPTIONS) {
    normalized.push(`Option ${normalized.length + 1}`);
  }

  return normalized.slice(0, MIN_OPTIONS);
}

function buildFallbackQuiz(lesson, lessonIndex) {
  const lessonTitle = String(lesson?.title || `Lesson ${lessonIndex + 1}`);
  return {
    question: `What is the main focus of "${lessonTitle}"?`,
    options: [
      lessonTitle,
      "Unrelated side topic",
      "UI color styling",
      "Skipping the lesson",
    ],
    correctAnswer: 0,
  };
}

function normalizeQuizzes(lesson, lessonIndex) {
  const quizzes = Array.isArray(lesson?.quizzes) ? lesson.quizzes : [];

  const normalized = quizzes.map((quiz, quizIndex) => {
    const options = ensureOptions(quiz?.options);
    const question = String(quiz?.question || "").trim() || `Knowledge check ${quizIndex + 1}`;
    return {
      ...quiz,
      question,
      options,
      correctAnswer: clampCorrectAnswer(quiz?.correctAnswer, options.length),
    };
  });

  while (normalized.length < MIN_QUIZZES_PER_LESSON) {
    normalized.push(buildFallbackQuiz(lesson, lessonIndex));
  }

  return normalized;
}

async function makeLessonsPlayable() {
  await connectDB();

  const quests = await Quest.find();
  let updatedQuestCount = 0;
  let updatedLessonCount = 0;

  for (const quest of quests) {
    let questChanged = false;

    const nextLessons = (Array.isArray(quest.lessons) ? quest.lessons : []).map((lesson, lessonIndex) => {
      const normalizedQuizzes = normalizeQuizzes(lesson, lessonIndex);
      const quizQuestionsToShowRaw = Number(lesson?.quizQuestionsToShow || MIN_QUIZZES_PER_LESSON);
      const quizQuestionsToShow = Math.max(
        MIN_QUIZZES_PER_LESSON,
        Math.min(quizQuestionsToShowRaw, normalizedQuizzes.length)
      );

      const changed =
        !Array.isArray(lesson?.quizzes) ||
        lesson.quizzes.length !== normalizedQuizzes.length ||
        Number(lesson?.quizQuestionsToShow || MIN_QUIZZES_PER_LESSON) !== quizQuestionsToShow ||
        normalizedQuizzes.some((quiz, quizIndex) => {
          const oldQuiz = lesson.quizzes?.[quizIndex];
          if (!oldQuiz) return true;
          if (String(oldQuiz.question || "") !== String(quiz.question || "")) return true;
          if (Number(oldQuiz.correctAnswer) !== Number(quiz.correctAnswer)) return true;
          const oldOptions = Array.isArray(oldQuiz.options) ? oldQuiz.options : [];
          return oldOptions.length !== quiz.options.length;
        });

      if (changed) {
        questChanged = true;
        updatedLessonCount += 1;
      }

      return {
        ...lesson.toObject(),
        quizzes: normalizedQuizzes,
        quizQuestionsToShow,
      };
    });

    if (!questChanged) continue;

    quest.lessons = nextLessons;
    await quest.save();
    updatedQuestCount += 1;
  }

  console.log(
    `Lesson playability normalization complete. Updated quests: ${updatedQuestCount}, updated lessons: ${updatedLessonCount}`
  );
}

makeLessonsPlayable()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed to normalize lessons:", err);
    process.exit(1);
  });
