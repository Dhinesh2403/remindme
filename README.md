# RemindMe Buddy 🔔

Smart Reminder & Accountability App — Angular Ionic Frontend + Node.js/Express Backend + MongoDB Atlas

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 17 + Ionic 7 + Capacitor |
| State | Angular Signals + NgRx |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT + Google OAuth 2.0 |
| Realtime | Socket.IO |
| Notifications | Web Push + Twilio (SMS/WhatsApp) |
| Cron | node-cron |
| Frontend Deploy | Vercel |
| Backend Deploy | Railway |

---

## Monorepo Structure

```
remindme-buddy/
├── frontend/               # Angular Ionic app
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/           # Guards, interceptors, singleton services
│   │   │   ├── shared/         # Reusable components, pipes, directives
│   │   │   ├── auth/           # Login, Register, Forgot Password
│   │   │   ├── dashboard/      # Home screen
│   │   │   ├── reminders/      # CRUD reminders
│   │   │   ├── friends/        # Accountability buddies
│   │   │   ├── notifications/  # Notification center
│   │   │   ├── premium/        # Upgrade screen
│   │   │   ├── calendar/       # Calendar views
│   │   │   ├── insights/       # Analytics & achievements
│   │   │   ├── settings/       # Settings page
│   │   │   └── layouts/        # Shell layouts
│   │   ├── environments/       # dev / staging / prod configs
│   │   └── theme/              # Global SCSS variables
│   ├── capacitor.config.ts
│   └── package.json
│
├── backend/                # Node.js Express API
│   ├── src/
│   │   ├── config/         # DB, env, socket config
│   │   ├── controllers/    # Route handlers
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routers
│   │   ├── middlewares/    # Auth, validation, rate limiting
│   │   ├── services/       # Business logic
│   │   ├── jobs/           # Cron jobs
│   │   ├── sockets/        # Socket.IO handlers
│   │   └── utils/          # Helpers, logger
│   ├── .env.development
│   ├── .env.staging
│   ├── .env.production
│   └── package.json
│
└── docs/                   # API docs, deployment guides
```

---

## Prerequisites

- Node.js 20.x LTS
- npm 10.x
- Angular CLI 17.x: `npm install -g @angular/cli@17`
- Ionic CLI: `npm install -g @ionic/cli`
- Git
- MongoDB Compass (optional GUI)
- VS Code with extensions: Angular Language Service, ESLint, Prettier, GitLens

---

## Quick Start (Development)

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/remindme-buddy.git
cd remindme-buddy

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### 2. Environment Setup

```bash
# Backend
cp backend/.env.example backend/.env.development

# Frontend
# Edit frontend/src/environments/environment.ts
```

### 3. Run Both Servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 8100)
cd frontend && ionic serve
```

### 4. Open App
- Frontend: http://localhost:8100
- API: http://localhost:5000/api
- API Health: http://localhost:5000/api/health
