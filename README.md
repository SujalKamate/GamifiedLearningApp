Gamified Adaptive Learning App

An adaptive learning platform where AI adjusts subject difficulty (coding, vocab, finance), supports offline play, analytics, and anti‑cheating tools. Includes Google Sign‑In, XP/streaks/badges, leaderboards, and batch offline sync.

## Monorepo layout

```
GamifiedLearningApp/
  backend/
    app/
      _init_.py
      crud.py
      database.py
      main.py
      models.py
      routers/
        _init_.py
        adaptive.py
        analytics.py
        anti_cheating.py
        auth.py
        badges.py
        dashboard.py
        leaderboard.py
        leveling.py
        offline.py
        quiz_history.py
        quiz.py
        session.py
      schemas.py
      utils/
        gamification.py
    create_tables.py
    gamified_learning.db
    requirements.txt
    seed_data.py
    venv/
  frontend/
    bun.lock
    components.json
    drizzle/
    drizzle.config.ts
    eslint.config.mjs
    middleware.ts
    next-env.d.ts
    next.config.ts
    package-lock.json
    package.json
    postcss.config.mjs
    public/
    src/
      app/
        api/
          auth/[...all]/route.ts
          auth/google/route.ts
          quiz/submit/route.ts            # proxy → backend /quiz/submit
          quiz/submit-offline/route.ts    # proxy → backend /quiz/submit-offline
          offline/sync/[userId]/route.ts  # proxy → backend /offline/sync/{userId}
          ... (quizzes, progress, analytics, achievements)
        ... (pages)
      db/
        index.ts
        schema.ts
      lib/
        backend.ts                        # proxy helper
        auth-utils.ts                     # minimal JWT decode
      components/, hooks/, visual-edits/
    tsconfig.json
  README.md
```

## Features

- Adaptive quiz difficulty per subject
- Online + offline quiz attempts and batch sync
- Gamification: XP, streaks, badges, leaderboards
- Anti‑cheating signals (response time, patterns)
- Google Sign‑In (id_token verification on backend)
- Analytics and dashboard endpoints

## Architecture

- Backend: FastAPI + SQLAlchemy + SQLite (env‑driven `DATABASE_URL`)
  - Routers: `quiz`, `offline`, `analytics`, `badges`, `streak`, `leveling`, `adaptive`, `leaderboard`, `dashboard`, `anti_cheating`, `session`, `auth`
  - CORS allowed from env `CORS_ORIGINS`
  - Health endpoint: `GET /healthz`
- Frontend: Next.js (App Router) + Drizzle (Turso/libSQL) for some local APIs
  - Frontend API proxies forward to backend using `NEXT_PUBLIC_BACKEND_URL`

## Environment variables

Backend (`backend/.env`):

```
APP_ENV=development
HOST=0.0.0.0
PORT=8000
DATABASE_URL=sqlite:///./gamified_learning.db
CORS_ORIGINS=http://localhost:3000

# Auth
GOOGLE_CLIENT_ID=893771405567-82tbn6vt2jpqi257rttjt2j2l1ek4rbq.apps.googleusercontent.com
JWT_SECRET=please_change_me
JWT_ALGORITHM=HS256
JWT_EXPIRES_MIN=120
```

Frontend (`frontend/.env.local`):

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=893771405567-82tbn6vt2jpqi257rttjt2j2l1ek4rbq.apps.googleusercontent.com

# Required if using Drizzle/libSQL routes
TURSO_CONNECTION_URL=
TURSO_AUTH_TOKEN=
```

## Getting started (local)

1) Backend

```
cd backend
.\n+venv\Scripts\pip.exe install -r requirements.txt
.
venv\Scripts\python.exe .\create_tables.py
.
venv\Scripts\python.exe .\seed_data.py   # safe to ignore UNIQUE email if re-run
.
venv\Scripts\uvicorn.exe app.main:app --host 0.0.0.0 --port 8000
```

Verify: `http://localhost:8000/healthz`

2) Frontend

```
cd frontend
npm install
npm run dev
```

Open: `http://localhost:3000`

## Google Sign‑In flow

1) Frontend obtains a Google `id_token` (One Tap or button) using `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
2) Frontend calls `POST /api/auth/google` with `{ id_token }`.
3) Frontend proxy forwards to backend `POST /auth/google`.
4) Backend verifies token (Google), creates user if needed, returns `{ token, user }` (JWT).
5) Use `Authorization: Bearer <token>` on subsequent calls.

## API surface (selected)

- Auth
  - `POST /auth/google` → verify Google id_token, returns JWT & user
- Quiz
  - `POST /quiz/submit`
  - `POST /quiz/submit-offline`
  - `POST /quiz/offline/submit` (batch alternative)
- Offline
  - `POST /offline/sync/{user_id}`
- Gamification & analytics
  - `GET /badges`, `GET /streak`, `GET /leveling`, `GET /analytics`
- Health
  - `GET /healthz`

Frontend proxy routes (Next.js):

- `POST /api/auth/google` → backend `/auth/google`
- `POST /api/quiz/submit` → backend `/quiz/submit`
- `POST /api/quiz/submit-offline` → backend `/quiz/submit-offline`
- `POST /api/offline/sync/[userId]` → backend `/offline/sync/{userId}`

## Offline support

- Client stores attempts locally while offline.
- When online, send batch via `/quiz/submit-offline`.
- Un-synced per‑question logs can be synced via `/offline/sync/{user_id}`.

## Anti‑cheating (starter)

- Track response time and suspicious patterns in `quiz_logs`.
- Admin/analytics routes can be extended to review flags.

## Deployment

- Backend
  - Use `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  - Set all backend env vars on the host (Render/Railway/Fly/VM)
  - Ensure `CORS_ORIGINS` includes your frontend origin
- Frontend
  - Vercel recommended; set `NEXT_PUBLIC_BACKEND_URL` (and Turso vars if used)

## Troubleshooting

- 401 from proxies → ensure you send `Authorization: Bearer <JWT>` from Google login.
- CORS issues → confirm backend `CORS_ORIGINS` includes your frontend URL.
- `UNIQUE constraint failed: users.email` during seeding → benign if re-seeding.
- Turso/Drizzle routes error → set `TURSO_CONNECTION_URL` and `TURSO_AUTH_TOKEN`, or avoid those routes.

## Scripts (quick reference)

Backend

```
cd backend
.
venv\Scripts\uvicorn.exe app.main:app --host 0.0.0.0 --port 8000
```

Frontend

```
cd frontend
npm run dev
```

---

Built with FastAPI, Next.js, Drizzle, and love for gamified learning.
