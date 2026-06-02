# Gamified Micro-Learning Platform for Technical Micro-Skills

## Overview

This project is a gamified web-based learning platform designed to improve learner engagement while developing technical micro-skills. The platform delivers structured learning content through quests, lessons, quizzes, progress tracking, rewards, and achievement systems.

Unlike traditional learning platforms that focus primarily on content delivery, this system incorporates game-inspired mechanics such as experience points (XP), levels, streaks, badges, and quest progression to encourage consistent learning and knowledge retention.

## Features

### Learner Features

* User registration and authentication
* Browse available learning quests
* Complete lessons and quizzes
* Earn XP and level up
* Unlock badges and achievements
* Track learning progress and streaks
* View analytics and performance metrics
* AI-generated quiz feedback using a local language model

### Administrator Features

* Create and manage quests
* Create lessons and quizzes
* Manage users and content
* Monitor learner progress
* Configure rewards and badges

### Authentication Features

- Email and password login
- Google OAuth authentication
- JWT-based session management
- Protected routes and role-based access

### Gamification Features

* Experience Points (XP)
* Leveling System
* Achievement Badges
* Learning Streaks
* Quest Completion Rewards
* Progress Tracking Dashboard

### AI Features

- AI-generated quiz feedback
- Personalized learning explanations
- Local LLM integration using Ollama and Phi-3 Mini
- Privacy-friendly on-device inference

## Technology Stack

### Frontend

* React.js
* Tailwind CSS
* Framer Motion
* Lucide React

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### AI Integration

* Ollama
* Phi-3 Mini

### Development Tools

* Visual Studio Code
* Git
* GitHub
* Postman

## Repository

GitHub Repository:

https://github.com/rojinmahat/Final-year-project

## Installation

### Clone Repository

```bash
git clone https://github.com/rojinmahat/Final-year-project
cd Final-year-project
```

### Install Dependencies

Frontend:

```bash
cd client/reactapp
npm install
npm run dev
```

Backend:

```bash
cd server
npm install
npm run dev
```

### Environment Variables

Create a `.env` file for both frontend and backend and configure:

```env
# Frontend
VITE_API_URL=http://localhost:5001
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID

# Backend
PORT=5001
MONGO_URI=YOUR_MONGODB_CONNECTION_STRING

GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT=http://localhost:5001/api/auth/google/callback

JWT_SECRET=YOUR_JWT_SECRET

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=YOUR_EMAIL
MAIL_PASS=YOUR_APP_PASSWORD
MAIL_FROM=no-reply@skillquest.app
MAIL_TLS_REJECT=false
```

### Run Application

Backend:

```bash
npm run dev
```

Frontend:

```bash
npm run dev
```
**Note:** the user must be in the client/reactapp and server directory to run frontend and backend respectively

## Academic Context

This project was developed as a Final Year Project (FYP) for the BSc (Hons) Computing program. The research investigates the impact of gamification techniques on learner engagement, motivation, and progress in technical micro-skill acquisition.

## Author

Rojin Singh Mahat

Final Year Project – BSc (Hons) Computing

## License

This repository is provided for academic reference only.