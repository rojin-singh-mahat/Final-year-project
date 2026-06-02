export const FALLBACK_TUTORIAL_QUEST = {
  _id: null,
  id: "local-git-fundamentals",
  title: "Git Fundamentals: Version Control Basics",
  description:
    "Get comfortable with Git basics: commits, branches, remotes, and resolving simple conflicts—essential for collaborative development.",
  difficulty: "beginner",
  hashtags: ["git", "version-control", "git-basics"],
  totalXP: 90,
  lessons: [
    {
      _id: null,
      id: "git-lesson-1",
      title: "Introduction to Git and Commits",
      content:
        "Learn what Git is, why version control matters, and how to create, view, and amend commits. Understand the basic workflow: modify → stage → commit.",
      order: 0,
      xp: 30,
      quizQuestionsToShow: 3,
      quizzes: [
        {
          question: "What is the purpose of a Git commit?",
          options: [
            "To permanently delete files",
            "To snapshot staged changes",
            "To run tests automatically",
            "To compile code"
          ],
          correctAnswer: 1
        },
        {
          question: "Which command stages changes for commit?",
          options: ["git push", "git add", "git pull", "git checkout"],
          correctAnswer: 1
        },
        {
          question: "How can you view recent commits?",
          options: ["git status", "git log", "git branch", "git merge"],
          correctAnswer: 1
        }
      ]
    },
    {
      _id: null,
      id: "git-lesson-2",
      title: "Branches and Merging",
      content:
        "Use branches to work on features independently. Learn how to create, switch, merge, and delete branches safely.",
      order: 1,
      xp: 30,
      quizQuestionsToShow: 3,
      quizzes: [
        {
          question: "What does `git checkout -b feature` do?",
          options: ["Creates and switches to `feature` branch", "Deletes a branch", "Pushes to remote", "Stages files"],
          correctAnswer: 0
        },
        {
          question: "A merge conflict happens when:",
          options: [
            "Two branches change the same lines",
            "You run tests",
            "You push to origin",
            "You delete a file"
          ],
          correctAnswer: 0
        },
        {
          question: "Which command incorporates changes from `main` into your current branch?",
          options: ["git merge main", "git init", "git clone", "git tag"],
          correctAnswer: 0
        }
      ]
    },
    {
      _id: null,
      id: "git-lesson-3",
      title: "Remotes, Push/Pull, and Conflict Resolution",
      content:
        "Connect to remote repositories, push and pull changes, and resolve simple conflicts using basic strategies (choose ours/theirs, small manual edits).",
      order: 2,
      xp: 30,
      quizQuestionsToShow: 3,
      quizzes: [
        {
          question: "Which command uploads local commits to the remote repository?",
          options: ["git push", "git pull", "git fetch", "git remote"],
          correctAnswer: 0
        },
        {
          question: "`git pull` is equivalent to which sequence?",
          options: ["git fetch && git merge", "git add && git commit", "git clone && git init", "git status && git log"],
          correctAnswer: 0
        },
        {
          question: "Best practice when resolving a merge conflict is to:",
          options: ["Choose randomly", "Understand both changes and test the result", "Always accept remote", "Always accept local"],
          correctAnswer: 1
        }
      ]
    }
  ]
};
