export const FALLBACK_TUTORIAL_QUEST = {
  _id: null,
  id: "local-tutorial-quest",
  title: "SkillQuest Tutorial: Knight Academy",
  description:
    "Learn the game loop, answer-based combat, and core reasoning patterns before entering full quests.",
  difficulty: "beginner",
  hashtags: ["tutorial", "onboarding", "learning"],
  totalXP: 60,
  lessons: [
    {
      _id: null,
      id: "tutorial-lesson-1",
      title: "How Battle Learning Works",
      content:
        "In SkillQuest, each question is a combat decision. Correct choices are hits, wrong choices are misses. During this tutorial, focus on understanding why each answer works, not just memorizing it.",
      order: 0,
      xp: 20,
      quizQuestionsToShow: 3,
      quizzes: [
        {
          question: "What does a correct answer represent in this combat system?",
          options: [
            "A pause in combat",
            "A hit",
            "A skipped question",
            "A random bonus"
          ],
          correctAnswer: 1
        },
        {
          question: "What should you focus on to learn effectively during quests?",
          options: [
            "Only speed",
            "Only lucky guesses",
            "Reasoning behind the answer",
            "Ignoring feedback"
          ],
          correctAnswer: 2
        },
        {
          question: "Wrong answers are treated as:",
          options: [
            "Hits",
            "Misses",
            "Level skips",
            "Auto retries"
          ],
          correctAnswer: 1
        }
      ]
    },
    {
      _id: null,
      id: "tutorial-lesson-2",
      title: "Reading Questions Like a Strategist",
      content:
        "Good players identify key terms in a question, eliminate clearly wrong options, then choose the option that directly satisfies the prompt. This is the same mindset used in real problem solving.",
      order: 1,
      xp: 20,
      quizQuestionsToShow: 3,
      quizzes: [
        {
          question: "What is the first useful step when a question is confusing?",
          options: [
            "Pick the longest option",
            "Find key terms in the prompt",
            "Skip all options",
            "Wait for timeout"
          ],
          correctAnswer: 1
        },
        {
          question: "Why eliminate wrong options early?",
          options: [
            "To reduce noise and improve final choice quality",
            "To make the timer shorter",
            "To avoid reading",
            "To disable feedback"
          ],
          correctAnswer: 0
        },
        {
          question: "The strongest final answer is usually the one that:",
          options: [
            "Sounds advanced",
            "Directly matches the requirement",
            "Contains more words",
            "Appears first"
          ],
          correctAnswer: 1
        }
      ]
    },
    {
      _id: null,
      id: "tutorial-lesson-3",
      title: "Feedback and Improvement Loop",
      content:
        "After each answer, read the feedback and use it to adjust your next decision. Progress comes from short loops: attempt, feedback, correction, and retry.",
      order: 2,
      xp: 20,
      quizQuestionsToShow: 3,
      quizzes: [
        {
          question: "What is the main purpose of answer feedback?",
          options: [
            "Decoration only",
            "To help improve next decisions",
            "To end the quest early",
            "To hide the correct answer"
          ],
          correctAnswer: 1
        },
        {
          question: "A practical learning loop is:",
          options: [
            "Attempt, feedback, correction",
            "Skip, guess, ignore",
            "Wait, pause, quit",
            "Read once, never revisit"
          ],
          correctAnswer: 0
        },
        {
          question: "If you miss a question, best next action is to:",
          options: [
            "Stop learning",
            "Blame randomness",
            "Analyze what was incorrect and adapt",
            "Delete the lesson"
          ],
          correctAnswer: 2
        }
      ]
    }
  ]
};
