require("dotenv").config();

const connectDB = require("../connectDB");
const Quest = require("../models/quest");

const additionalQuests = [
  {
    title: "SkillQuest Tutorial: Knight Academy",
    description:
      "Learn how SkillQuest battles map to learning decisions so first-time players understand both combat and quiz strategy.",
    difficulty: "beginner",
    hashtags: ["tutorial", "onboarding", "learning"],
    rewardBadge: "Academy Recruit",
    price: 0,
    isPaid: false,
    lessons: [
      {
        title: "Combat Decisions and Answers",
        content:
          "Every question is a battle decision. Correct choices become hits. Wrong choices become misses. Use this as your mental model while learning.",
        order: 0,
        xp: 20,
        quizQuestionsToShow: 3,
        quizzes: [
          {
            question: "In SkillQuest battles, a correct answer is treated as:",
            options: ["a miss", "a hit", "a pause", "a reload"],
            correctAnswer: 1,
          },
          {
            question: "Wrong answers are represented as:",
            options: ["hits", "misses", "wins", "checkpoints"],
            correctAnswer: 1,
          },
          {
            question: "Best learning focus during combat quizzes is:",
            options: ["random guessing", "understanding why an answer is right", "speed only", "memorizing UI colors"],
            correctAnswer: 1,
          },
        ],
      },
      {
        title: "Question Reading Strategy",
        content:
          "Identify key terms, remove obviously wrong options, and pick the option that directly satisfies the prompt.",
        order: 1,
        xp: 20,
        quizQuestionsToShow: 3,
        quizzes: [
          {
            question: "When a question is hard, first step should be:",
            options: ["pick fastest", "find key terms", "skip reading", "choose longest option"],
            correctAnswer: 1,
          },
          {
            question: "Eliminating wrong options helps because it:",
            options: ["reduces noise", "increases timer", "hides answers", "removes scoring"],
            correctAnswer: 0,
          },
          {
            question: "Strong final choices usually:",
            options: ["sound advanced", "directly match the requirement", "contain many words", "appear first"],
            correctAnswer: 1,
          },
        ],
      },
      {
        title: "Feedback and Improvement Loop",
        content:
          "After each answer, use feedback to adjust your next attempt. Improvement comes from quick loops of attempt, feedback, and correction.",
        order: 2,
        xp: 20,
        quizQuestionsToShow: 3,
        quizzes: [
          {
            question: "Main purpose of quiz feedback is to:",
            options: ["decorate the screen", "improve next decisions", "end the lesson", "replace reading"],
            correctAnswer: 1,
          },
          {
            question: "A healthy learning loop is:",
            options: ["attempt, feedback, correction", "guess, ignore, repeat", "wait, quit, restart", "read once, never revisit"],
            correctAnswer: 0,
          },
          {
            question: "After a wrong answer, best action is:",
            options: ["stop trying", "analyze and adapt", "close the lesson", "remove the question"],
            correctAnswer: 1,
          },
        ],
      },
    ],
  },
  {
    title: "JavaScript Foundations",
    description:
      "Build a strong base in variables, functions, arrays, and objects through practical coding decisions.",
    difficulty: "beginner",
    hashtags: ["javascript", "fundamentals", "webdev"],
    rewardBadge: "JS Initiate",
    price: 0,
    isPaid: false,
    lessons: [
      {
        title: "Variables and Data Types",
        content:
          "Learn `let`, `const`, primitive data types, and how values are stored in JavaScript.",
        order: 0,
        xp: 20,
        quizzes: [
          {
            question: "Which declaration should you prefer when a variable should not be reassigned?",
            options: ["var", "let", "const", "static"],
            correctAnswer: 2,
          },
        ],
      },
      {
        title: "Functions and Scope",
        content:
          "Write reusable functions, understand parameters and return values, and avoid scope bugs.",
        order: 1,
        xp: 25,
        quizzes: [
          {
            question: "What does a function return if no explicit `return` statement is used?",
            options: ["0", "null", "undefined", "false"],
            correctAnswer: 2,
          },
        ],
      },
      {
        title: "Arrays and Objects",
        content:
          "Work with collections and key-value structures to model app data effectively.",
        order: 2,
        xp: 30,
        quizzes: [
          {
            question: "How do you access a property named `email` on an object called `user`?",
            options: ["user->email", "user.email", "user[email]", "email.user"],
            correctAnswer: 1,
          },
        ],
      },
    ],
  },
  {
    title: "React State Mastery",
    description:
      "Move from static UI to interactive interfaces using state, events, and derived rendering.",
    difficulty: "intermediate",
    hashtags: ["react", "state", "frontend"],
    rewardBadge: "State Tactician",
    price: 0,
    isPaid: false,
    lessons: [
      {
        title: "State with useState",
        content:
          "Understand how component state works and when to split or merge state values.",
        order: 0,
        xp: 25,
        quizzes: [
          {
            question: "Which hook is used for local component state in React functional components?",
            options: ["useReducer", "useState", "useMemo", "useEffect"],
            correctAnswer: 1,
          },
        ],
      },
      {
        title: "Event Handling",
        content:
          "Capture user interaction, pass callbacks, and update state predictably.",
        order: 1,
        xp: 25,
        quizzes: [
          {
            question: "What should you pass to `onClick` if you want to call a function when clicked?",
            options: ["A string", "A function reference", "A boolean", "A style object"],
            correctAnswer: 1,
          },
        ],
      },
      {
        title: "Rendering from Data",
        content:
          "Render lists and conditionals from state while keeping JSX readable and maintainable.",
        order: 2,
        xp: 30,
        quizzes: [
          {
            question: "What key prop helps React track list item identity?",
            options: ["name", "id", "indexOnly", "title"],
            correctAnswer: 1,
          },
        ],
      },
    ],
  },
  {
    title: "Node API Security",
    description:
      "Harden Express APIs with validation, auth checks, and safe defaults before shipping.",
    difficulty: "advanced",
    hashtags: ["node", "express", "security"],
    rewardBadge: "API Guardian",
    price: 0,
    isPaid: false,
    lessons: [
      {
        title: "Input Validation",
        content:
          "Validate and sanitize request payloads to prevent malformed or malicious input.",
        order: 0,
        xp: 30,
        quizzes: [
          {
            question: "What is the main purpose of validating incoming request bodies?",
            options: ["Increase response size", "Improve animations", "Prevent unsafe data handling", "Reduce CSS"],
            correctAnswer: 2,
          },
        ],
      },
      {
        title: "Authentication and Authorization",
        content:
          "Differentiate identity verification from permission checks and apply both in routes.",
        order: 1,
        xp: 35,
        quizzes: [
          {
            question: "Authorization decides: ",
            options: ["Who you are", "What you can access", "How fast network is", "How to style UI"],
            correctAnswer: 1,
          },
        ],
      },
      {
        title: "Rate Limiting and Error Hygiene",
        content:
          "Mitigate abuse with request throttling and avoid leaking sensitive internals in errors.",
        order: 2,
        xp: 35,
        quizzes: [
          {
            question: "Why should production error responses avoid internal stack traces?",
            options: ["They are too colorful", "They can expose sensitive implementation details", "They break JSON", "They slow CSS"],
            correctAnswer: 1,
          },
        ],
      },
    ],
  },
];

const withTotals = additionalQuests.map((quest) => ({
  ...quest,
  totalXP: quest.lessons.reduce((sum, lesson) => sum + Number(lesson.xp || 0), 0),
}));

async function seedAdditionalQuests() {
  try {
    await connectDB();

    let inserted = 0;
    let skipped = 0;

    for (const quest of withTotals) {
      const existing = await Quest.findOne({ title: quest.title });
      if (existing) {
        skipped += 1;
        continue;
      }

      await Quest.create(quest);
      inserted += 1;
    }

    console.log(`Seeding complete. Inserted: ${inserted}, Skipped(existing): ${skipped}`);
    process.exit(0);
  } catch (err) {
    console.error("Failed to seed additional quests:", err);
    process.exit(1);
  }
}

seedAdditionalQuests();
