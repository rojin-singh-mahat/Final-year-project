import QuestList from "./QuestList";
import QuestForm from "./QuestForm";
import AdminQuestOverview from "./AdminQuestOverview";
import Notifications from "./Notifications";
import Leaderboard from "./Leaderboard";
import LearnerProfileView from "../User/LearnerProfileView";
import AdminSettings from "./AdminSettings";
import AdminDashboardHome from "./AdminDashboardHome";
import { React, useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminSidebar from "./AdminSidebar";
import AnimatedOrbs from "../../AnimatedOrbs";

const MIN_QUIZZES_PER_LESSON = 1;

function createEmptyQuiz() {
  return {
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
  };
}

function normalizeQuiz(quiz = {}) {
  const options = Array.isArray(quiz.options) ? [...quiz.options] : [];
  while (options.length < 4) options.push("");
  return {
    question: quiz.question || "",
    options: options.slice(0, 4),
    correctAnswer:
      typeof quiz.correctAnswer === "number" && quiz.correctAnswer >= 0 && quiz.correctAnswer < 4
        ? quiz.correctAnswer
        : 0,
  };
}

function ensureMinimumQuizzes(quizzes = []) {
  const normalized = Array.isArray(quizzes) ? quizzes.map((quiz) => normalizeQuiz(quiz)) : [];
  while (normalized.length < MIN_QUIZZES_PER_LESSON) {
    normalized.push(createEmptyQuiz());
  }
  return normalized;
}

function createEmptyLesson() {
  return {
    id: `lesson-${Date.now()}-${Math.random()}`,
    title: "",
    content: "",
    xpReward: "",
    quizQuestionsToShow: MIN_QUIZZES_PER_LESSON,
    quizzes: ensureMinimumQuizzes([]),
  };
}

export default function AdminView({ activeNav, setActiveNav, userData, setUserData }) {
  const [activeView, setActiveView] = useState("list");
  const [quests, setQuests] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [selectedQuestForReview, setSelectedQuestForReview] = useState(null);
  const [loadingQuests, setLoadingQuests] = useState(true);

  // Fetch quests from backend on mount
  useEffect(() => {
    async function fetchQuests() {
      setLoadingQuests(true);
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/quests`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setQuests(data);
        } else {
          setQuests([]);
        }
      } catch (err) {
        console.error("Error fetching quests:", err);
      } finally {
        setLoadingQuests(false);
      }
    }
    fetchQuests();
  }, []);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/admin/users`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (res.ok) {
          setUsers(Array.isArray(data.users) ? data.users : []);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    }

    fetchUsers();
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All Difficulties");
  const [editingQuest, setEditingQuest] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questToDelete, setQuestToDelete] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "Beginner",
    hashtags: "",
    rewardBadge: "",
    price: 0,
  });

  const [lessons, setLessons] = useState([
    createEmptyLesson(),
  ]);

  const [errors, setErrors] = useState({});

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      case "Intermediate":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "Advanced":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-stone-500/20 text-stone-400 border-stone-500/30";
    }
  };

  const handleCreateQuest = () => {
    setEditingQuest(null);
    setActiveView("create");
    setFormData({
      title: "",
      description: "",
      difficulty: "Beginner",
      hashtags: "",
      rewardBadge: "",
      price: 0,
    });
    setLessons([
      createEmptyLesson(),
    ]);
    setErrors({});
  };

  const handleEditQuest = (quest) => {
    setEditingQuest(quest);
    setFormData({
      title: quest.title,
      description: quest.description,
      difficulty: quest.difficulty,
      hashtags: Array.isArray(quest.hashtags) ? quest.hashtags.map((tag) => `#${tag}`).join(" ") : "",
      rewardBadge: quest.rewardBadge,
      price: quest.price || 0,
    });
    const mappedLessons = (quest.lessons || []).map((lesson, index) => {
      const rawQuizzes = Array.isArray(lesson.quizzes) ? lesson.quizzes : [];
      const normalizedQuizzes = rawQuizzes.map((q) => normalizeQuiz(q));
      return {
        id: lesson._id || lesson.id || `lesson-${Date.now()}-${index}`,
        title: lesson.title || "",
        content: lesson.content || "",
        xpReward: lesson.xp ?? lesson.xpReward ?? "",
        quizQuestionsToShow: Math.max(
          1,
          Number(lesson.quizQuestionsToShow || 1)
        ),
        quizzes: normalizedQuizzes,
      };
    });

    setLessons(
      mappedLessons.length > 0
        ? mappedLessons
        : [
            createEmptyLesson(),
          ]
    );
    setActiveView("edit");
    setErrors({});
  };

  const handleDeleteQuest = (questId) => {
    setQuestToDelete(questId);
    setShowDeleteModal(true);
  };

  // Modal for delete confirmation
  const DeleteModal = () => (
    showDeleteModal && (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-[#1b222a]/95 border border-stone-700 rounded-xl p-8 shadow-xl max-w-sm w-full text-center">
          <h2 className="text-xl font-['Cinzel'] font-bold mb-4 text-red-400">Delete Quest?</h2>
          <p className="mb-6 text-stone-400">Are you sure you want to delete this quest? This action cannot be undone.</p>
          <div className="flex gap-4 justify-center">
            <button
              className="px-6 py-2 rounded border border-stone-700 text-stone-400 hover:text-stone-200 hover:bg-stone-700/50"
              onClick={() => { setShowDeleteModal(false); setQuestToDelete(null); }}
            >Cancel</button>
            <button
              className="px-6 py-2 rounded bg-red-500 text-white hover:bg-red-600"
              onClick={confirmDelete}
            >Delete</button>
          </div>
        </div>
      </div>
    )
  );

  const confirmDelete = async () => {
    if (questToDelete) {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const url = `http://localhost:5001/api/quests/${questToDelete}`;
        const res = await fetch(url, {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to delete quest");
        setQuests(quests.filter((q) => (q._id || q.id) !== questToDelete));
      } catch (err) {
        console.error("Error deleting quest:", err);
      }
      setShowDeleteModal(false);
      setQuestToDelete(null);
    }
  };

  const addLesson = () => {
    const newLesson = createEmptyLesson();
    setLessons([...lessons, newLesson]);
  };

  const removeLesson = (lessonId) => {
    if (lessons.length > 1) {
      setLessons(lessons.filter((l) => l.id !== lessonId));
    }
  };

  const updateLesson = (lessonId, field, value) => {
    setLessons(
      lessons.map((lesson) => {
        if (lesson.id === lessonId) {
          if (field.startsWith("quizzes.")) {
            const match = field.match(/^quizzes\.(\d+)\.(question|correctAnswer)$/);
            if (!match) return lesson;
            const quizIndex = Number(match[1]);
            const quizField = match[2];
            const quizzes = ensureMinimumQuizzes(lesson.quizzes || []);
            if (!quizzes[quizIndex]) return lesson;

            const updatedQuiz = { ...quizzes[quizIndex], [quizField]: value };
            const updatedQuizzes = [...quizzes];
            updatedQuizzes[quizIndex] = updatedQuiz;
            return { ...lesson, quizzes: updatedQuizzes };
          }
          return { ...lesson, [field]: value };
        }
        return lesson;
      })
    );
  };

  const updateQuizOption = (lessonId, quizIndex, optionIndex, value) => {
    setLessons(
      lessons.map((lesson) => {
        if (lesson.id === lessonId) {
          const quizzes = ensureMinimumQuizzes(lesson.quizzes || []);
          if (!quizzes[quizIndex]) return lesson;

          const quiz = quizzes[quizIndex];
          const newOptions = [...quiz.options];
          newOptions[optionIndex] = value;

          const updatedQuizzes = [...quizzes];
          updatedQuizzes[quizIndex] = {
            ...quiz,
            options: newOptions,
          };

          return {
            ...lesson,
            quizzes: updatedQuizzes,
          };
        }
        return lesson;
      })
    );
  };

  const validateForm = () => {
    const newErrors = {};

    if (!(formData.title || '').trim()) {
      newErrors.title = "Quest title is required";
    }
    const price = formData.price;
    if (price !== 0 && price < 10) {
      newErrors.price = "Minimum price is 10 or set it to 0 for free.";
    }

    lessons.forEach((lesson, index) => {
      if (!(lesson.title || '').trim()) {
        newErrors[`lesson_${index}_title`] = "Lesson title is required";
      }
      if (!(lesson.content || '').trim()) {
        newErrors[`lesson_${index}_content`] = "Lesson content is required";
      }
      const quizzes = Array.isArray(lesson.quizzes) ? lesson.quizzes : [];
      if (quizzes.length < 1) {
        newErrors[`lesson_${index}_quiz_count`] = `At least 1 quiz question is required.`;
      }

      const questionsToShow = Number(lesson.quizQuestionsToShow || 0);
      if (!Number.isFinite(questionsToShow) || questionsToShow < 1) {
        newErrors[`lesson_${index}_quiz_show_count`] = `Show count must be at least 1.`;
      } else if (questionsToShow > quizzes.length) {
        newErrors[`lesson_${index}_quiz_show_count`] = "Show count cannot be more than the number of quiz questions.";
      }

      quizzes.forEach((quiz, quizIndex) => {
        if (!((quiz && quiz.question) || '').trim()) {
          newErrors[`lesson_${index}_quiz_${quizIndex}_question`] = "Quiz question is required";
        }
        const options = Array.isArray(quiz?.options) ? quiz.options : [];
        for (let optIndex = 0; optIndex < 4; optIndex += 1) {
          if (!(options[optIndex] || '').trim()) {
            newErrors[`lesson_${index}_quiz_${quizIndex}_option_${optIndex}`] = "This option is required";
          }
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveQuest = async () => {
    if (!validateForm()) {
      return;
    }

    // Map lessons to backend schema
    const mappedLessons = lessons.map((lesson, idx) => {
      // Defensive: quizzes is always array
      const quizzes = Array.isArray(lesson.quizzes)
        ? lesson.quizzes.map(q => ({
            question: (q.question || "").trim(),
            options: Array.isArray(q.options)
              ? q.options.slice(0, 4).map(opt => (opt || "").trim())
              : ["", "", "", ""],
            correctAnswer:
              typeof q.correctAnswer === "number" && q.correctAnswer >= 0 && q.correctAnswer < 4
                ? q.correctAnswer
                : 0,
          }))
        : [];
      return {
        title: lesson.title || "",
        content: lesson.content || "",
        quizQuestionsToShow: Math.max(
          1,
          Math.min(
            Number(lesson.quizQuestionsToShow || 1),
            quizzes.length || 1
          )
        ),
        quizzes,
        order: idx,
        xp: typeof lesson.xpReward === "number" ? lesson.xpReward : 10,
      };
    });

    const totalXP = mappedLessons.reduce((sum, lesson) => sum + lesson.xp, 0);
    const normalizedHashtags = (formData.hashtags || "")
      .split(/[\s,]+/)
      .map((tag) => tag.trim().toLowerCase().replace(/^#+/, ""))
      .filter(Boolean);

    const questData = {
      ...formData,
      difficulty: (formData.difficulty || "Beginner").toLowerCase(),
      hashtags: [...new Set(normalizedHashtags)],
      lessons: mappedLessons,
      totalXP,
      rewardBadge: formData.rewardBadge || "",
      price: formData.price || 0,
      isPaid: (formData.price || 0) > 0,
      createdAt: editingQuest?.createdAt || new Date().toISOString().split("T")[0],
    };

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const url = editingQuest ? `http://localhost:5001/api/quests/${editingQuest._id || editingQuest.id}` : `http://localhost:5001/api/quests`;
      const res = await fetch(url, {
        method: editingQuest ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(questData),
      });

      if (!res.ok) throw new Error("Failed to save quest");

      const savedQuest = await res.json();

      if (editingQuest) {
        setQuests(quests.map(q => (q._id === editingQuest._id ? savedQuest : q)));
      } else {
        setQuests([...quests, savedQuest]);
      }

      setActiveView("list");
      setEditingQuest(null);
    } catch (err) {
      console.error("Error saving quest:", err);
    }
  };

  const filteredQuests = quests.filter((quest) => {
    const normalizedSearch = searchQuery.toLowerCase().trim();
    const hashtagTokens = normalizedSearch
      .split(/\s+/)
      .filter((token) => token.startsWith("#"))
      .map((token) => token.replace(/^#+/, ""));
    const textQuery = normalizedSearch
      .split(/\s+/)
      .filter((token) => !token.startsWith("#"))
      .join(" ");

    const questHashtags = Array.isArray(quest.hashtags)
      ? quest.hashtags.map((tag) => String(tag).toLowerCase())
      : [];

    const haystack = `${quest.title || ""} ${quest.description || ""}`.toLowerCase();
    const matchesSearch = !textQuery || haystack.includes(textQuery);
    const matchesHashtags = hashtagTokens.length === 0 || hashtagTokens.every((tag) => questHashtags.includes(tag));
    const matchesDifficulty =
      difficultyFilter === "All Difficulties" ||
      quest.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
    return matchesSearch && matchesHashtags && matchesDifficulty;
  });

  const handleQuestUpdated = (updatedQuest) => {
    if (!updatedQuest) return;
    setQuests((prev) =>
      prev.map((quest) =>
        String(quest._id || quest.id) === String(updatedQuest._id || updatedQuest.id)
          ? updatedQuest
          : quest
      )
    );
  };
  switch (activeNav) {
    case "dashboard":
      return (
        <>
          <AnimatedOrbs/>
          <AdminSidebar
            activeView={activeView}
            setActiveView={setActiveView}
            activeNav={activeNav}
            setActiveNav={setActiveNav}
          />
          <AdminDashboardHome
            quests={quests}
            users={users}
            onGoToQuests={() => {
              setActiveNav("quests");
              setActiveView("list");
            }}
          />
        </>
      );

    case "quests":
      return (
        <>
          <AnimatedOrbs/>
          <DeleteModal />
          <AdminSidebar
            activeView={activeView}
            setActiveView={setActiveView}
            activeNav={activeNav}
            setActiveNav={setActiveNav}
          />

          {activeView === "list" && (
            <QuestList
              quests={quests}
              setActiveView={setActiveView}
              handleCreateQuest={handleCreateQuest}
              handleEditQuest={handleEditQuest}
              handleDeleteQuest={handleDeleteQuest}
              setDifficultyFilter={setDifficultyFilter}
              difficultyFilter={difficultyFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              loadingQuests={loadingQuests}
              filteredQuests={filteredQuests}
              getDifficultyColor={getDifficultyColor}
              onQuestUpdated={handleQuestUpdated}
               onReviewQuest={setSelectedQuestForReview}
            />
          )}

          {(activeView === "create" || activeView === "edit") && (
            <QuestForm
              setActiveView={setActiveView}
              setQuests={setQuests}
                formData={formData}
                setFormData={setFormData}
                lessons={lessons}
                setLessons={setLessons}
                errors={errors}
                setErrors={setErrors}
                addLesson={addLesson}
                removeLesson={removeLesson}
                updateLesson={updateLesson}
                updateQuizOption={updateQuizOption}
                handleSaveQuest={handleSaveQuest}
                editingQuest={editingQuest}
            />
          )}

           {/* Quest Review Modal */}
           {selectedQuestForReview && (
             <AdminQuestOverview
               quest={selectedQuestForReview}
               onClose={() => setSelectedQuestForReview(null)}
               onBack={() => setSelectedQuestForReview(null)}
             />
           )}
        </>
      );

    case "purchases":
      return (
        <>
          <AnimatedOrbs/>
          <AdminSidebar
            activeView={activeView}
            setActiveView={setActiveView}
            activeNav={activeNav}
            setActiveNav={setActiveNav}
          />
          <main className="m-auto flex-1 pr-8 py-8 pl-0 relative z-10">
            <Notifications />
          </main>
        </>
      );

    case "leaderboard":
      return (
        <>
          <AnimatedOrbs/>
          <AdminSidebar
            activeView={activeView}
            setActiveView={setActiveView}
            activeNav={activeNav}
            setActiveNav={setActiveNav}
          />
          {selectedLearner ? (
            <LearnerProfileView
              learnerData={selectedLearner}
              onBack={() => setSelectedLearner(null)}
              isCurrentUser={false}
            />
          ) : (
            <Leaderboard onLearnerClick={setSelectedLearner} />
          )}
        </>
      );

    case "settings":
      return (
        <>
          <AnimatedOrbs/>
          <AdminSidebar
            activeView={activeView}
            setActiveView={setActiveView}
            activeNav={activeNav}
            setActiveNav={setActiveNav}
          />
          <main className="m-auto flex-1 pr-8 py-8 pl-0 relative z-10">
            <AdminSettings
              userData={userData}
              onAvatarUpdated={(picture) => {
                if (typeof setUserData === "function") {
                  setUserData((prev) => ({
                    ...prev,
                    picture,
                    avatar: picture,
                  }));
                }
              }}
            />
          </main>
        </>
      );

    default:
      return (
        <>
          <AnimatedOrbs/>
          <AdminSidebar
            activeView={activeView}
            setActiveView={setActiveView}
            activeNav={activeNav}
            setActiveNav={setActiveNav}
          />
          <div>Feature coming soon...</div>
        </>
      );
  }
}
