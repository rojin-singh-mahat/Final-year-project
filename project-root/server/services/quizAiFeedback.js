const DEFAULT_MODEL = process.env.PHI3_MODEL || process.env.AI_FEEDBACK_MODEL || "phi3:mini";

const sanitizeText = (value) => {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim();
};

const shortenFeedback = (text) => {
  return sanitizeText(text)
    .replace(/^AI Feedback:\s*/i, "")
    .replace(/\s+Keep up the practice.*$/i, "")
    .replace(/\s+Press Next.*$/i, "");
};

const buildPrompt = ({ questTitle, lessonTitle, question, selectedAnswer, correctAnswer, isCorrect, score, totalQuestions, xpEarned, streak }) => {
  const outcome = isCorrect ? "correct" : "incorrect";
  return [
    "You are a concise learning coach.",
    "Write 1 or 2 short sentences for a quiz result.",
    "If correct: explain why the answer is correct and add one small extra fact or reinforcement.",
    "If incorrect: explain why the chosen answer is wrong and how the learner could have identified the right concept.",
    "Be constructive, specific, and encouraging. give actionable insight. Avoid generic praise.",
    "Do not lecture, do not insult the learner, and do not mention that you are an AI.",
    "Do not mention that you are an AI.",
    "Do not use bullet points.",
    `Quest: ${sanitizeText(questTitle) || "Unknown quest"}`,
    `Lesson: ${sanitizeText(lessonTitle) || "Unknown lesson"}`,
    `Question: ${sanitizeText(question) || "Unknown question"}`,
    `Selected answer: ${sanitizeText(selectedAnswer) || "No answer"}`,
    `Correct answer: ${sanitizeText(correctAnswer) || "Unknown"}`,
    `Result: ${outcome}`,
    `Score: ${Number(score) || 0}%`,
    `Questions answered: ${Number(totalQuestions) || 0}`,
    `XP earned: ${Number(xpEarned) || 0}`,
    `Current streak: ${Number(streak) || 0}`,
    "Output only the feedback text, keep it consice and educational and around 2-3 sentences or less.",
  ].join("\n");
};

const extractOllamaText = (payload) => {
  if (!payload || typeof payload !== "object") return "";
  return sanitizeText(payload.response || payload.message || payload.text || "");
};

async function generateQuizAiFeedback(payload) {
  const prompt = buildPrompt(payload || {});
  const provider = String(process.env.AI_FEEDBACK_PROVIDER || "ollama").toLowerCase();
  const endpoint = process.env.AI_FEEDBACK_ENDPOINT || process.env.PHI3_ENDPOINT || "http://127.0.0.1:11434/api/generate";

  try {
    if (provider === "ollama") {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Phi-3 request failed with status ${response.status}`);
      }

      const data = await response.json();
      const text = shortenFeedback(extractOllamaText(data));
      if (text) {
        return text;
      }
      throw new Error("Phi-3 response was empty");
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.AI_FEEDBACK_API_KEY ? { Authorization: `Bearer ${process.env.AI_FEEDBACK_API_KEY}` } : {}),
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: "You are a concise learning coach." },
          { role: "user", content: prompt },
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI feedback request failed with status ${response.status}`);
    }

    const data = await response.json();
    const text = shortenFeedback(data?.choices?.[0]?.message?.content || data?.output || data?.response || "");
    if (text) {
      return text;
    }

    throw new Error("AI feedback response was empty");
  } catch (error) {
    const correctOrIncorrect = payload?.isCorrect ? "correct" : "incorrect";
    const fallback = payload?.isCorrect
      ? `Correct. ${sanitizeText(payload?.correctAnswer) || "That answer matches the concept"}, so the reasoning checks out.`
      : `Not quite. ${sanitizeText(payload?.correctAnswer) || "The correct answer"} fits better because it matches the concept more directly.`;

    return shortenFeedback(fallback || `Your answer was ${correctOrIncorrect}. Keep going.`);
  }
}

module.exports = { generateQuizAiFeedback };