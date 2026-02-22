import QuestList from "./QuestList";
import QuestForm from "./QuestForm";
import Notifications from "./Notifications";
import Leaderboard from "./Leaderboard";
import UsersTable from "./UsersTable";
import AdminDashboardHome from "./AdminDashboardHome";
import { React, useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminSidebar from "./AdminSidebar";
import AnimatedOrbs from "../../AnimatedOrbs";

export default function AdminView({ activeNav, setActiveNav }) {
  const [activeView, setActiveView] = useState("list");
  const [quests, setQuests] = useState([]);
  const [users, setUsers] = useState([]);
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
    rewardBadge: "",
    price: 0,
  });

  const [lessons, setLessons] = useState([
    {
      id: `lesson-${Date.now()}`,
      title: "",
      content: "",
      xpReward: "",
      quizzes: [{
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      },]
    },
  ]);

  const [errors, setErrors] = useState({});

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Intermediate":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Advanced":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const handleCreateQuest = () => {
    setEditingQuest(null);
    setActiveView("create");
    setFormData({
      title: "",
      description: "",
      difficulty: "Beginner",
      rewardBadge: "",
      price: 0,
    });
    setLessons([
      {
        id: `lesson-${Date.now()}`,
        title: "",
        content: "",
        xpReward: "",
        quizzes: [{
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
        }],
      },
    ]);
    setErrors({});
  };

  const handleEditQuest = (quest) => {
    setEditingQuest(quest);
    setFormData({
      title: quest.title,
      description: quest.description,
      difficulty: quest.difficulty,
      rewardBadge: quest.rewardBadge,
      price: quest.price || 0,
    });
    const mappedLessons = (quest.lessons || []).map((lesson, index) => {
      const quiz = lesson.quizzes?.[0] || {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      };
      const options = Array.isArray(quiz.options) ? [...quiz.options] : [];
      while (options.length < 4) options.push("");

      return {
        id: lesson._id || lesson.id || `lesson-${Date.now()}-${index}`,
        title: lesson.title || "",
        content: lesson.content || "",
        xpReward: lesson.xp ?? lesson.xpReward ?? "",
        quizzes: [
          {
            question: quiz.question || "",
            options,
            correctAnswer: typeof quiz.correctAnswer === "number" ? quiz.correctAnswer : 0,
          },
        ],
      };
    });

    setLessons(
      mappedLessons.length > 0
        ? mappedLessons
        : [
            {
              id: `lesson-${Date.now()}`,
              title: "",
              content: "",
              xpReward: 10,
              quizzes: [
                {
                  question: "",
                  options: ["", "", "", ""],
                  correctAnswer: 0,
                },
              ],
            },
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
        <div className="bg-[#181818] border border-[#282828] rounded-xl p-8 shadow-xl max-w-sm w-full text-center">
          <h2 className="text-xl font-bold mb-4 text-red-400">Delete Quest?</h2>
          <p className="mb-6 text-[#b3b3b3]">Are you sure you want to delete this quest? This action cannot be undone.</p>
          <div className="flex gap-4 justify-center">
            <button
              className="px-6 py-2 rounded bg-[#282828] text-white hover:bg-[#232323]"
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
    const newLesson = {
      id: `lesson-${Date.now()}-${Math.random()}`,
      title: "",
      content: "",
      xpReward: "",
      quizzes: [{
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      },]
    };
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
            const quizField = field.split(".")[1];
            return {
              ...lesson,
              quizzes: [{
                ...lesson.quizzes,
                [quizField]: value,
              },]
            };
          }
          return { ...lesson, [field]: value };
        }
        return lesson;
      })
    );
  };

  const updateQuizOption = (lessonId, optionIndex, value) => {
    setLessons(
      lessons.map((lesson) => {
        if (lesson.id === lessonId) {
          const newOptions = [...lesson.quizzes.options];
          newOptions[optionIndex] = value;
          return {
            ...lesson,
            quizzes: [{
              ...lesson.quizzes,
              options: newOptions,
            },]
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
      // Defensive: quizzes array and first quiz
      const quiz = Array.isArray(lesson.quizzes) ? lesson.quizzes[0] : {};
      if (!((quiz && quiz.question) || '').trim()) {
        newErrors[`lesson_${index}_quiz_question`] = "Quiz question is required";
      }
      const options = Array.isArray(quiz.options) ? quiz.options : [];
      options.forEach((option, optIndex) => {
        if (!(option || '').trim()) {
          newErrors[`lesson_${index}_quiz_option_${optIndex}`] = "This option is required";
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
            question: (q.question || ""),
            options: Array.isArray(q.options) ? q.options.map(opt => opt || "") : ["", "", "", ""],
            correctAnswer: typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
          }))
        : [];
      return {
        title: lesson.title || "",
        content: lesson.content || "",
        quizzes,
        order: idx,
        xp: typeof lesson.xpReward === "number" ? lesson.xpReward : 10,
      };
    });

    const totalXP = mappedLessons.reduce((sum, lesson) => sum + lesson.xp, 0);

    const questData = {
      ...formData,
      difficulty: (formData.difficulty || "Beginner").toLowerCase(),
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
    const matchesSearch = quest.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesDifficulty =
      difficultyFilter === "All Difficulties" ||
      quest.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
    return matchesSearch && matchesDifficulty;
  });
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
        </>
      );

    case "users":
      return (
        <>
          <AnimatedOrbs/>
          <AdminSidebar
            activeView={activeView}
            setActiveView={setActiveView}
            activeNav={activeNav}
            setActiveNav={setActiveNav}
          />
          <UsersTable />
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
          <Leaderboard />
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
