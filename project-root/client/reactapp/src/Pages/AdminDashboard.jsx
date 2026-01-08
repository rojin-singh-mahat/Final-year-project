import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  LogOut,
  ArrowLeft,
  Zap,
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  X,
  GripVertical
} from 'lucide-react';

// Remove TypeScript interfaces (not needed in .jsx)

// Quests will be loaded from backend

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState('list');
  const [activeNav, setActiveNav] = useState('quests');
  const [quests, setQuests] = useState([]);
  const [loadingQuests, setLoadingQuests] = useState(true);
    // Fetch quests from backend on mount
    useEffect(() => {
      async function fetchQuests() {
        setLoadingQuests(true);
        try {
          const token = localStorage.getItem("token") || sessionStorage.getItem("token");
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/quest`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          const data = await res.json();
          if (res.ok && Array.isArray(data)) {
            setQuests(data);
          }
        } catch (err) {
          // Optionally show error
        } finally {
          setLoadingQuests(false);
        }
      }
      fetchQuests();
    }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All Difficulties');
  const [editingQuest, setEditingQuest] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questToDelete, setQuestToDelete] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Beginner',
    rewardBadge: '',
  });

  const [lessons, setLessons] = useState([
    {
      id: '1',
      title: '',
      content: '',
      xpReward: 10,
      quiz: {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }
    }
  ]);

  const [errors, setErrors] = useState({});

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Advanced': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleCreateQuest = () => {
    setActiveView('create');
    setFormData({
      title: '',
      description: '',
      difficulty: 'Beginner',
      rewardBadge: '',
    });
    setLessons([
      {
        id: '1',
        title: '',
        content: '',
        xpReward: 10,
        quiz: {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0
        }
      }
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
    });
    setLessons(quest.lessons.length > 0 ? quest.lessons : [
      {
        id: '1',
        title: '',
        content: '',
        xpReward: 10,
        quiz: {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0
        }
      }
    ]);
    setActiveView('edit');
    setErrors({});
  };

  const handleDeleteQuest = (questId) => {
    setQuestToDelete(questId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (questToDelete) {
      setQuests(quests.filter(q => q.id !== questToDelete));
      setShowDeleteModal(false);
      setQuestToDelete(null);
    }
  };

  const addLesson = () => {
    const newLesson = {
      id: (lessons.length + 1).toString(),
      title: '',
      content: '',
      xpReward: 10,
      quiz: {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }
    };
    setLessons([...lessons, newLesson]);
  };

  const removeLesson = (lessonId) => {
    if (lessons.length > 1) {
      setLessons(lessons.filter(l => l.id !== lessonId));
    }
  };

  const updateLesson = (lessonId, field, value) => {
    setLessons(lessons.map(lesson => {
      if (lesson.id === lessonId) {
        if (field.startsWith('quiz.')) {
          const quizField = field.split('.')[1];
          return {
            ...lesson,
            quiz: {
              ...lesson.quiz,
              [quizField]: value
            }
          };
        }
        return { ...lesson, [field]: value };
      }
      return lesson;
    }));
  };

  const updateQuizOption = (lessonId, optionIndex, value) => {
    setLessons(lessons.map(lesson => {
      if (lesson.id === lessonId) {
        const newOptions = [...lesson.quiz.options];
        newOptions[optionIndex] = value;
        return {
          ...lesson,
          quiz: {
            ...lesson.quiz,
            options: newOptions
          }
        };
      }
      return lesson;
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Quest title is required';
    }

    lessons.forEach((lesson, index) => {
      if (!lesson.title.trim()) {
        newErrors[`lesson_${index}_title`] = 'Lesson title is required';
      }
      if (!lesson.content.trim()) {
        newErrors[`lesson_${index}_content`] = 'Lesson content is required';
      }
      if (!lesson.quiz.question.trim()) {
        newErrors[`lesson_${index}_quiz_question`] = 'Quiz question is required';
      }
      lesson.quiz.options.forEach((option, optIndex) => {
        if (!option.trim()) {
          newErrors[`lesson_${index}_quiz_option_${optIndex}`] = 'This option is required';
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveQuest = () => {
    if (!validateForm()) {
      return;
    }

    const totalXP = lessons.reduce((sum, lesson) => sum + lesson.xpReward, 0);

    const questData = {
      id: editingQuest?.id || Date.now().toString(),
      ...formData,
      lessons,
      totalXP,
      createdAt: editingQuest?.createdAt || new Date().toISOString().split('T')[0]
    };

    if (editingQuest) {
      setQuests(quests.map(q => q.id === editingQuest.id ? questData : q));
    } else {
      setQuests([...quests, questData]);
    }

    setActiveView('list');
    setEditingQuest(null);
  };

  const filteredQuests = quests.filter(quest => {
    const matchesSearch = quest.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'All Difficulties' ||
      quest.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-[#121212] text-white flex">
      {/* Sidebar */}
      <aside className="bg-black border-r border-[#282828] w-60 fixed left-0 top-0 h-screen flex flex-col">
        <div className="p-6 border-b border-[#282828]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#1DB954] to-[#8b5cf6] rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="text-lg">SkillQuest</div>
              <div className="text-xs text-[#808080]">Admin Panel</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4">
          <button
            onClick={() => setActiveNav('dashboard')}
            className={`w-full flex items-center gap-3 px-6 py-3 transition-all ${
              activeNav === 'dashboard'
                ? 'text-[#1DB954] bg-[#1DB954]/10 border-l-4 border-[#1DB954]'
                : 'text-[#b3b3b3] hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveNav('quests')}
            className={`w-full flex items-center gap-3 px-6 py-3 transition-all ${
              activeNav === 'quests'
                ? 'text-[#1DB954] bg-[#1DB954]/10 border-l-4 border-[#1DB954]'
                : 'text-[#b3b3b3] hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>Manage Quests</span>
          </button>

          <button
            onClick={() => setActiveNav('users')}
            className={`w-full flex items-center gap-3 px-6 py-3 transition-all ${
              activeNav === 'users'
                ? 'text-[#1DB954] bg-[#1DB954]/10 border-l-4 border-[#1DB954]'
                : 'text-[#b3b3b3] hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Manage Users</span>
          </button>

          <button
            onClick={() => setActiveNav('settings')}
            className={`w-full flex items-center gap-3 px-6 py-3 transition-all ${
              activeNav === 'settings'
                ? 'text-[#1DB954] bg-[#1DB954]/10 border-l-4 border-[#1DB954]'
                : 'text-[#b3b3b3] hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </nav>

        <div className="border-t border-[#282828] p-4">
          <a href="/" className="w-full flex items-center gap-3 px-2 py-3 text-[#b3b3b3] hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Main Site</span>
          </a>
          <button className="w-full flex items-center gap-3 px-2 py-3 text-[#b3b3b3] hover:text-red-400 transition-colors">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-60 flex-1 p-8">
        {/* Quest List View */}
        {activeView === 'list' && (
          <>
            {/* Top Bar */}
            <div className="mb-8 flex items-center justify-between">
              <h1 className="text-4xl">Manage Quests</h1>
              <button
                onClick={handleCreateQuest}
                className="bg-[#1DB954] hover:bg-[#1ed760] text-black px-6 py-3 rounded-full flex items-center gap-2 transition-all hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Create New Quest
              </button>
            </div>

            {/* Search and Filter */}
            <div className="mb-6 flex gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#808080]" />
                <input
                  type="text"
                  placeholder="Search quests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#282828] rounded-lg pl-12 pr-4 py-3 text-white placeholder-[#808080] focus:border-[#1DB954] focus:outline-none"
                />
              </div>

              <div className="relative">
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="bg-[#1a1a1a] border border-[#282828] rounded-lg px-4 py-3 pr-10 text-white appearance-none cursor-pointer focus:border-[#1DB954] focus:outline-none"
                >
                  <option>All Difficulties</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#808080]" />
              </div>
            </div>

            {/* Quests Table */}
            <div className="bg-[#1a1a1a] border border-[#282828] rounded-lg overflow-hidden">
              {loadingQuests ? (
                <div className="text-center py-16 text-[#b3b3b3]">Loading quests...</div>
              ) : filteredQuests.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#282828]">
                      <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-[#808080]">Title</th>
                      <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-[#808080]">Difficulty</th>
                      <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-[#808080]">Lessons</th>
                      <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-[#808080]">Total XP</th>
                      <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-[#808080]">Created</th>
                      <th className="text-right px-6 py-4 text-xs uppercase tracking-wider text-[#808080]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuests.map((quest) => (
                      <motion.tr
                        key={quest.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-[#282828] hover:bg-[#282828] transition-colors"
                      >
                        <td className="px-6 py-4 text-white">{quest.title}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-3 py-1 rounded-full border ${getDifficultyColor(quest.difficulty)}`}>
                            {quest.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#b3b3b3]">{quest.lessons.length} lessons</td>
                        <td className="px-6 py-4 text-[#1DB954]">{quest.totalXP} XP</td>
                        <td className="px-6 py-4 text-[#808080]">{quest.createdAt}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditQuest(quest)}
                              className="p-2 hover:bg-[#1DB954]/20 rounded-lg text-[#b3b3b3] hover:text-[#1DB954] transition-all"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuest(quest.id)}
                              className="p-2 hover:bg-red-500/20 rounded-lg text-[#b3b3b3] hover:text-red-400 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-16">
                  <BookOpen className="w-16 h-16 text-[#808080] mx-auto mb-4" />
                  <p className="text-[#b3b3b3] mb-4">No quests yet. Create your first one!</p>
                  <button
                    onClick={handleCreateQuest}
                    className="bg-[#1DB954] hover:bg-[#1ed760] text-black px-6 py-3 rounded-full transition-all hover:scale-105"
                  >
                    Create Quest
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Create/Edit Quest Form */}
        {(activeView === 'create' || activeView === 'edit') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Top Bar */}
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveView('list')}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-4xl">{activeView === 'edit' ? 'Edit Quest' : 'Create New Quest'}</h1>
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
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full bg-[#121212] border ${errors.title ? 'border-red-500' : 'border-[#282828]'} rounded-lg px-4 py-3 text-white placeholder-[#808080] focus:border-[#1DB954] focus:outline-none`}
                  />
                  {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
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
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#121212] border border-[#282828] rounded-lg px-4 py-3 text-white placeholder-[#808080] focus:border-[#1DB954] focus:outline-none resize-none"
                  />
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#808080] mb-3">
                    Difficulty <span className="text-red-400">*</span>
                  </label>
                  <div className="flex gap-4">
                    {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                      <label key={level} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="difficulty"
                          value={level}
                          checked={formData.difficulty === level}
                          onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                          className="w-4 h-4 text-[#1DB954] bg-[#121212] border-[#282828] focus:ring-[#1DB954] focus:ring-2"
                        />
                        <span className="flex items-center gap-2 text-white group-hover:text-[#1DB954] transition-colors">
                          <span className={`w-2 h-2 rounded-full ${
                            level === 'Beginner' ? 'bg-green-500' :
                            level === 'Intermediate' ? 'bg-yellow-500' :
                            'bg-purple-500'
                          }`}></span>
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
                    onChange={(e) => setFormData({ ...formData, rewardBadge: e.target.value })}
                    className="w-full bg-[#121212] border border-[#282828] rounded-lg px-4 py-3 text-white placeholder-[#808080] focus:border-[#1DB954] focus:outline-none"
                  />
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
                {lessons.map((lesson, lessonIndex) => (
                  <div key={lesson.id} className="bg-[#121212] border border-[#282828] rounded-lg p-6">
                    {/* Lesson Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-5 h-5 text-[#808080]" />
                        <h3 className="text-xl">Lesson {lessonIndex + 1}</h3>
                      </div>
                      {lessons.length > 1 && (
                        <button
                          onClick={() => removeLesson(lesson.id)}
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
                          value={lesson.title}
                          onChange={(e) => updateLesson(lesson.id, 'title', e.target.value)}
                          className={`w-full bg-[#1a1a1a] border ${errors[`lesson_${lessonIndex}_title`] ? 'border-red-500' : 'border-[#282828]'} rounded-lg px-4 py-3 text-white placeholder-[#808080] focus:border-[#1DB954] focus:outline-none`}
                        />
                        {errors[`lesson_${lessonIndex}_title`] && (
                          <p className="text-red-400 text-sm mt-1">{errors[`lesson_${lessonIndex}_title`]}</p>
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
                          value={lesson.content}
                          onChange={(e) => updateLesson(lesson.id, 'content', e.target.value)}
                          className={`w-full bg-[#1a1a1a] border ${errors[`lesson_${lessonIndex}_content`] ? 'border-red-500' : 'border-[#282828]'} rounded-lg px-4 py-3 text-white placeholder-[#808080] focus:border-[#1DB954] focus:outline-none resize-none`}
                        />
                        <div className="flex justify-between items-center mt-1">
                          {errors[`lesson_${lessonIndex}_content`] && (
                            <p className="text-red-400 text-sm">{errors[`lesson_${lessonIndex}_content`]}</p>
                          )}
                          <p className="text-xs text-[#808080] ml-auto">{lesson.content.length} / 5000</p>
                        </div>
                      </div>

                      {/* XP Reward */}
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-[#808080] mb-2">
                          XP Reward <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={lesson.xpReward}
                          onChange={(e) => updateLesson(lesson.id, 'xpReward', parseInt(e.target.value) || 10)}
                          className="w-32 bg-[#1a1a1a] border border-[#282828] rounded-lg px-4 py-3 text-white focus:border-[#1DB954] focus:outline-none"
                        />
                      </div>

                      {/* Quiz Section */}
                      <div className="border-t border-[#282828] pt-6">
                        <h4 className="text-lg mb-4">Quiz</h4>

                        {/* Quiz Question */}
                        <div className="mb-4">
                          <label className="block text-xs uppercase tracking-wider text-[#808080] mb-2">
                            Quiz Question <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="What command initializes a Git repository?"
                            value={lesson.quiz.question}
                            onChange={(e) => updateLesson(lesson.id, 'quiz.question', e.target.value)}
                            className={`w-full bg-[#1a1a1a] border ${errors[`lesson_${lessonIndex}_quiz_question`] ? 'border-red-500' : 'border-[#282828]'} rounded-lg px-4 py-3 text-white placeholder-[#808080] focus:border-[#1DB954] focus:outline-none`}
                          />
                          {errors[`lesson_${lessonIndex}_quiz_question`] && (
                            <p className="text-red-400 text-sm mt-1">{errors[`lesson_${lessonIndex}_quiz_question`]}</p>
                          )}
                        </div>

                        {/* Answer Options */}
                        <div className="mb-4">
                          <label className="block text-xs uppercase tracking-wider text-[#808080] mb-3">
                            Answer Options <span className="text-red-400">*</span>
                          </label>
                          <div className="space-y-3">
                            {lesson.quiz.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name={`correct-${lesson.id}`}
                                  checked={lesson.quiz.correctAnswer === optIndex}
                                  onChange={() => updateLesson(lesson.id, 'quiz.correctAnswer', optIndex)}
                                  className="w-4 h-4 text-[#1DB954] bg-[#1a1a1a] border-[#282828] focus:ring-[#1DB954] focus:ring-2"
                                />
                                <input
                                  type="text"
                                  placeholder={`Option ${optIndex + 1}`}
                                  value={option}
                                  onChange={(e) => updateQuizOption(lesson.id, optIndex, e.target.value)}
                                  className={`flex-1 bg-[#1a1a1a] border ${errors[`lesson_${lessonIndex}_quiz_option_${optIndex}`] ? 'border-red-500' : 'border-[#282828]'} rounded-lg px-4 py-2 text-white placeholder-[#808080] focus:border-[#1DB954] focus:outline-none`}
                                />
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-[#808080] mt-2">Select the radio button to mark the correct answer</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
                onClick={() => setActiveView('list')}
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
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1a1a] border border-[#282828] rounded-lg p-8 max-w-md w-full"
            >
              <h3 className="text-2xl mb-4">Delete Quest?</h3>
              <p className="text-[#b3b3b3] mb-6">
                Are you sure you want to delete this quest? This action cannot be undone.
              </p>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2 border border-[#282828] hover:border-[#808080] text-[#b3b3b3] hover:text-white rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
