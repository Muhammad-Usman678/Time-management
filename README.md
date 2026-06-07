# 🎓 PhD Productivity

A distraction-free, production-ready productivity system for PhD students — **tasks, focus timers, meetings, a daily dashboard, and analytics** — in one calm, Notion-meets-Todoist-meets-Google-Calendar workspace.

Built with **Next.js 14 (App Router) · TypeScript · Prisma · Tailwind CSS · React Query · Zustand**.

---

## ✨ Features

| Module | What it does |
| --- | --- |
| **To‑Do system** | Create/edit/delete tasks with title, description, priority (low/med/high), deadline, status (todo/in‑progress/done) and tags. Today / This‑Week / All views. Recurring **daily tasks auto‑reset** each morning. |
| **Focus timer** | Pomodoro (25/5, fully customizable) + manual countdown. Start/pause/reset/skip. Link a session to a task. Runs globally so it keeps ticking across pages, and **every completed focus block is logged** automatically. |
| **Meetings** | Add meetings with date/time, duration, Zoom/Meet/custom link (provider auto‑detected) and notes. Agenda **and** week calendar views. One‑click **Join**. |
| **Daily dashboard** | Today's tasks, the active timer, upcoming meetings, and focus stats (today / this week) at a glance. |
| **Analytics** | Total focus time per day/week/month, completed vs pending tasks, **most productive hours**, and focus‑time breakdown by tag. |
| **UX** | Light + dark mode, fully responsive, keyboard/Escape‑friendly modals, optimistic, toasts. |

---

## 🧱 System architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        Browser (React 18)                          │
│                                                                    │
│  App Router pages ─ "use client" ─ React Query (server cache)      │
│  Zustand timer store (global, persisted, drift‑free countdown)     │
│  next-themes (light/dark) · Tailwind design tokens · recharts      │
└───────────────┬────────────────────────────────────────────────────┘
                │  fetch  (typed api-client → /api/*)
                ▼
┌──────────────────────────────────────────────────────────────────┐
│             Next.js Route Handlers  (REST, /src/app/api)           │
│   Zod validation → getCurrentUserId() → Prisma → serializers       │
└───────────────┬────────────────────────────────────────────────────┘
                │  Prisma Client
                ▼
┌──────────────────────────────────────────────────────────────────┐
│   Database — SQLite (dev, zero‑setup)  ⇄  PostgreSQL (prod)        │
│   Portable schema: no native enums/arrays, one‑line provider swap  │
└──────────────────────────────────────────────────────────────────┘
```

**Single codebase, one deploy.** Next.js serves both the UI (React Server/Client Components) and the REST API (Route Handlers), so there's no separate backend to run, CORS to configure, or types to keep in sync — the same TypeScript types and Zod schemas are shared by client and server.

### Why this stack

- **Next.js 14 (App Router)** — frontend + backend in one project; file‑based routing; Route Handlers give a clean REST surface; trivial to deploy (Vercel, Docker, Node). Server Components keep the bundle lean; Client Components handle interactivity.
- **TypeScript end‑to‑end** — one set of domain types (`src/lib/types.ts`) flows from the DB serializers to the React components.
- **Prisma** — type‑safe queries and migrations. The schema is intentionally **portable**: enum‑like fields are strings (validated by Zod) and tags are a real join table, so it runs **identically on SQLite and PostgreSQL** — change one line to go to production.
- **SQLite by default** — the app runs with *zero* external services (`npm run setup && npm run dev`). For a single‑user PhD tool this is genuinely production‑viable; the documented PostgreSQL path is there the moment you want hosted/multi‑user.
- **React Query** — server‑state caching, background refetch, and cache invalidation (the timer engine invalidates dashboard/analytics when a session is logged).
- **Zustand** — a tiny global store for the timer so it survives navigation and shows in the top bar, focus page, and dashboard at once. Drift‑free (derives remaining time from a wall‑clock target) and persisted to `localStorage`.
- **Tailwind + CSS‑variable design tokens** — light/dark theming with no className churn; calm academic palette.
- **Zod** — the single source of truth for validation, reused by API routes and react‑hook‑form.

---

## 🗄️ Database schema

```prisma
User           id, email (unique), name?, createdAt, updatedAt
Task           id, userId→User, title, description?, priority, status,
               deadline?, isDaily, lastResetAt?, completedAt?, sortOrder,
               createdAt, updatedAt          ── tags[], focusSessions[]
Tag            id, userId→User, name, color  ── @@unique([userId, name])
TagsOnTasks    (taskId, tagId)               ── explicit M:N join
Meeting        id, userId→User, title, dateTime, durationMinutes,
               link?, linkType, notes?, createdAt, updatedAt
FocusSession   id, userId→User, taskId?→Task, type, startedAt, endedAt?,
               plannedSeconds, elapsedSeconds, completed, createdAt
```

- Enum‑like fields (`priority`, `status`, `linkType`, `type`) are **strings**, validated by Zod — portable across SQLite/Postgres.
- **Tags are a normalized many‑to‑many** (`TagsOnTasks`) rather than a scalar array, which is both portable and scalable.
- Indices on the hot paths: `Task(userId,status)`, `Task(userId,deadline)`, `Meeting(userId,dateTime)`, `FocusSession(userId,startedAt)`.
- `onDelete` rules: deleting a user cascades; deleting a task sets its focus sessions' `taskId` to null (history is preserved).

Full definition: [`prisma/schema.prisma`](prisma/schema.prisma).

---

## 🔌 REST API

All routes live under `src/app/api`, are scoped to the current user, validate input with Zod, and return the DTO shapes in `src/lib/types.ts`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/tasks?view=today\|week\|all` | List tasks (runs the daily auto‑reset for `today`) |
| `POST` | `/api/tasks` | Create a task (with `tagIds`) |
| `GET·PATCH·DELETE` | `/api/tasks/:id` | Read / update (handles `completedAt` + tag replacement) / delete |
| `GET·POST` | `/api/tags` | List / create tags |
| `DELETE` | `/api/tags/:id` | Delete a tag |
| `GET` | `/api/meetings?from=&to=` | List meetings in a range |
| `POST` | `/api/meetings` | Create (auto‑detects link provider) |
| `GET·PATCH·DELETE` | `/api/meetings/:id` | Read / update / delete |
| `GET` | `/api/focus-sessions?range=day\|week\|month` | List focus sessions |
| `POST` | `/api/focus-sessions` | Log a focus session |
| `PATCH·DELETE` | `/api/focus-sessions/:id` | Update / delete |
| `GET` | `/api/dashboard` | Aggregated: today's tasks, upcoming meetings, focus stats |
| `GET` | `/api/analytics?range=day\|week\|month` | Focus‑by‑day, by‑hour, completion, tag breakdown |

**Errors** use one envelope: `{ "error": string, "details"?: unknown }` (`422` validation, `404` not found, `500` otherwise).

> **GraphQL alternative.** The same domain maps cleanly to GraphQL — `type Task { … tags: [Tag!]! }`, queries `tasks(view:)`, `dashboard`, `analytics(range:)`, and mutations `createTask/updateTask/…`. REST was chosen for zero‑dependency simplicity and HTTP cacheability; the serializers in `src/lib/serialize.ts` would become resolvers with no model changes.

---

## 🗂️ Folder structure

```
phd-productivity/
├── prisma/
│   ├── schema.prisma          # data model (SQLite ⇄ Postgres)
│   └── seed.ts                # demo user, tasks, tags, meetings, 12 days of focus
├── src/
│   ├── app/
│   │   ├── layout.tsx         # root: fonts + <Providers><AppShell/>
│   │   ├── providers.tsx      # React Query + next-themes + Toaster
│   │   ├── globals.css        # Tailwind + light/dark design tokens
│   │   ├── page.tsx           # ▸ Dashboard
│   │   ├── tasks/page.tsx     # ▸ Tasks
│   │   ├── focus/page.tsx     # ▸ Focus / timer
│   │   ├── meetings/page.tsx  # ▸ Meetings
│   │   ├── analytics/page.tsx # ▸ Analytics
│   │   └── api/               # REST route handlers (tasks, tags, meetings,
│   │                          #   focus-sessions, dashboard, analytics)
│   ├── components/
│   │   ├── ui/                # design system (button, card, modal, tabs, …)
│   │   ├── layout/            # Sidebar, Topbar, AppShell, ThemeToggle,
│   │   │                      #   MiniTimer, TimerEngine
│   │   ├── tasks/  timer/  meetings/  dashboard/  analytics/   # feature UI
│   ├── hooks/                 # useTasks, useTags, useMeetings,
│   │                          #   useFocusSessions, useDashboard, useAnalytics
│   ├── store/
│   │   └── timerStore.ts      # global Pomodoro/countdown state machine
│   └── lib/
│       ├── db.ts              # Prisma singleton
│       ├── auth.ts            # getCurrentUserId() — optional-auth seam
│       ├── types.ts           # shared domain types / DTOs
│       ├── validations.ts     # Zod schemas (client + server)
│       ├── serialize.ts       # Prisma row → DTO
│       ├── api-helpers.ts     # jsonOk / parseBody / handleError
│       ├── api-client.ts      # typed fetch wrapper
│       ├── dates.ts           # date-fns display helpers
│       ├── utils.ts           # cn(), formatters, style maps
│       └── query-keys.ts      # centralized React Query keys
├── docker-compose.yml         # optional one-command PostgreSQL
├── .env.example
└── package.json
```

---

## 🚀 Getting started

**Requirements:** Node.js 18.17+ (works on 20/22+). No database server needed for local dev.

```bash
# 1. install dependencies
npm install

# 2. create your env file
cp .env.example .env

# 3. create the database + generate the client + seed demo data
npm run setup

# 4. run
npm run dev
```

Open **http://localhost:3000**. You'll land on a dashboard pre‑populated with demo tasks, meetings, and ~2 weeks of focus history so the analytics are immediately meaningful.

### Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run setup` | `prisma generate` + `db push` + seed (first‑time setup) |
| `npm run db:push` | Apply the schema to the database |
| `npm run db:seed` | (Re)seed demo data |
| `npm run db:reset` | Wipe + recreate + reseed |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | Next.js ESLint |

---

## 🐘 PostgreSQL (production)

No schema editing required — the datasource provider is selected from an env var
by [`scripts/use-db-provider.mjs`](scripts/use-db-provider.mjs) at build time.
Just set two variables:

```
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require"
```

For a local Postgres: `docker compose up -d` (see [`docker-compose.yml`](docker-compose.yml)),
set the two vars in `.env`, then `npm run setup`. SQLite ⇄ Postgres needs no model
or query changes — the schema is portable by design.

---

## 🔐 Authentication (optional, by design)

The app ships **single‑user**: `getCurrentUserId()` resolves to a stable demo user, and **every table already carries `userId`**. To enable real multi‑user auth, install Auth.js (NextAuth v5), add the Prisma adapter + a provider, and swap the body of [`src/lib/auth.ts`](src/lib/auth.ts) to return `session.user.id`. No schema or query changes are needed — the data model is multi‑tenant from day one.

---

## 🎨 Design

A calm, academic aesthetic: indigo primary on slate neutrals, generous whitespace, subtle borders, rounded cards. Theming is done entirely with CSS‑variable design tokens (`src/app/globals.css`) mapped into Tailwind, so light/dark mode requires no per‑component logic. Fully responsive — the sidebar collapses to a slide‑over on mobile and grids reflow to a single column.

---

## 📦 Deploy to a live URL (Vercel + Neon)

The app needs a server + database to run, so it's hosted on Vercel (Next.js)
with a free Neon Postgres. ~5 minutes:

1. **Database** — create a free Postgres at [neon.tech](https://neon.tech) (or use
   Vercel's Storage → Postgres). Copy the connection string (the *pooled* one).
2. **Import** — go to [vercel.com/new](https://vercel.com/new), import
   `Muhammad-Usman678/Time-management`.
3. **Environment variables** (Project → Settings → Environment Variables):
   ```
   DATABASE_PROVIDER = postgresql
   DATABASE_URL      = <your Neon connection string>
   AUTH_ENABLED      = false
   ```
4. **Build command** (Settings → Build & Output) — set to:
   ```
   npm run vercel-build
   ```
   (runs `use-db-provider` → `prisma generate` → `prisma db push` → `next build`,
   so the database tables are created on first deploy).
5. **Deploy.** Vercel gives you a public URL like
   `https://time-management-<hash>.vercel.app`.

> Optional: to load demo data into the live DB once, run locally with the prod
> `DATABASE_URL` + `DATABASE_PROVIDER=postgresql` in your shell: `npm run db:seed`.

**Other hosts** (Railway/Render/Fly/any Node server): set the same two DB env
vars and use build `npm run vercel-build`, start `npm start`.

---

_Generated with care as a complete, scalable reference implementation._
