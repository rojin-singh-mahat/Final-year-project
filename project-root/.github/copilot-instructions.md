# Copilot Instructions for AI Agents

## Project Overview
- **Monorepo** with `client` (React/Vite frontend) and `server` (Node.js/Express/MongoDB backend).
- **Frontend**: `client/reactapp` (React 19, Vite, Tailwind, Framer Motion, Lucide icons, Google OAuth, Axios for API calls).
- **Backend**: `server` (Express, Mongoose, Passport, JWT, Nodemailer, Google OAuth, REST API).

## Architecture & Data Flow
- **Frontend** communicates with backend via REST API (`VITE_API_URL` in `.env`).
- **User roles**: `learner` and `admin` (see `server/models/user.js`).
- **Key entities**: User, Quest, Lesson, Progress, Reward (see `server/models/`).
- **Dashboards**: Separate admin/user dashboards (`src/Pages/AdminDashboard.jsx`, `src/Pages/Dashboard.jsx`).
- **State**: User/session state is loaded from backend and mapped to frontend state objects (see `getUserData` in `src/utils/auth.js`).
- **Quests**: Nested structure with lessons and quizzes (see `QuestForm.jsx`, `lesson.js`).

## Developer Workflows
- **Frontend**:
  - Dev: `cd client/reactapp && npm install && npm run dev`
  - Build: `npm run build`
  - Lint: `npm run lint`
- **Backend**:
  - Dev: `cd server && npm install && npm run dev`
  - Start: `npm start`
- **Environment**:
  - Frontend: `.env` in `client/reactapp` (API URL, Google client ID)
  - Backend: `.env` in `server` (Mongo URI, OAuth, JWT, mail)

## Project-Specific Patterns
- **Frontend**:
  - Use `framer-motion` for UI animations.
  - Use `lucide-react` for icons.
  - State shape for user/quests must match backend schema (see `UserView.jsx`, `QuestForm.jsx`).
  - All API calls via Axios, base URL from `VITE_API_URL`.
  - Use Tailwind for all styling; avoid inline styles.
- **Backend**:
  - All models in `server/models/`.
  - Auth via Passport (Google OAuth, JWT).
  - Use `adminMiddleware.js`/`authMiddleware.js` for route protection.
  - Email via Nodemailer, config in `config/mail.js`.

## Integration Points
- **Google OAuth**: Used in both frontend and backend (see `OAuthGoogle.jsx`, `passport.js`).
- **Email**: Triggered from backend for notifications (see `config/mail.js`).
- **Quests/Lessons**: Created/edited by admin, consumed by users (see `QuestForm.jsx`, `AdminDashboard.jsx`).

## Conventions
- **Component structure**: Grouped by feature (e.g., `Dashboard/Admin`, `Dashboard/User`).
- **No TypeScript**: All code is JS/JSX.
- **No Redux**: State is local or via React context/hooks.
- **Testing**: No formal test suite; manual testing only.

## Key Files/Directories
- `client/reactapp/src/Pages/` — Main page components
- `client/reactapp/src/components/` — Reusable UI/feature components
- `client/reactapp/src/utils/auth.js` — Auth/session helpers
- `server/routes/` — API endpoints
- `server/models/` — Mongoose schemas
- `server/config/` — Auth/email config

---

**When in doubt, mirror the patterns in existing dashboard, quest, and user components.**
