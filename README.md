# Yitian Wonderland

> A calm, local-first personal operating system for deciding what to do, staying focused, and turning scattered thoughts into useful experiments.

Yitian Wonderland is a personal lab and digital garden built around a simple question: **what is the right next step for the person I am today?**

Instead of treating productivity as an endless task list, the project combines daily decision support, focused work sessions, interview preparation, idea exploration, and small creative tools in one cohesive space.

## Why I built it

Most productivity tools assume that every hour and every day are interchangeable. In practice, the right task depends on available time, current energy, and the kind of attention a person can genuinely give.

Yitian Wonderland explores a more human approach: small tools that reduce noise, preserve context, and help turn vague intentions into grounded action.

## Core experiences

### Today Compass

Today Compass recommends a small set of realistic next actions from three inputs:

- available time
- current energy
- desired focus

Recommendations use a deterministic scoring engine, so every result is explainable. Starting an action creates a focus session with pause, resume, early-completion, and abandonment states. Completed sessions become part of a daily history for later reflection.

### Action Cards and daily rhythm

Action Cards turn ongoing life threads into manageable pieces of work. They can be organized by category, completed manually, archived, and restored. Cards with session history cannot be permanently deleted, protecting the integrity of past activity.

The Routine view adds time-block awareness, transition countdowns, and optional browser notifications.

### Interview Prep

A structured readiness map for LeetCode, frontend fundamentals, system design, microfrontends, monorepos, and internationalization. Each knowledge point supports:

- readiness status and priority
- notes and review timestamps
- practice questions and personal answers
- code samples and explanations
- evidence and reference links

### Presentation Studio

A lightweight environment for writing a spoken script, editing HTML-based scenes, previewing them, and presenting them in fullscreen. It includes keyboard navigation, autosave, scene controls, and a teleprompter mode.

### Experiments

The project also contains smaller product explorations:

- **Role Compass** — filters and evaluates senior software and AI roles against personal criteria
- **Idea Vault** — captures business ideas and turns promising ones into concrete validation steps
- **Digital Garden** — collects projects, notes, and evolving areas of interest

## Product and engineering highlights

- Designed a transparent recommendation algorithm around time, energy, and focus constraints.
- Modelled action cards, focus sessions, interview topics, questions, and evidence with Prisma.
- Built full CRUD workflows with Next.js Route Handlers and server-rendered pages.
- Preserved historical consistency through archive and deletion rules.
- Combined static editorial content with database-backed interactive tools.
- Created a responsive visual system with reusable React components and Tailwind CSS.
- Kept the application local-first, with no authentication or third-party API dependency.

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 13 App Router |
| UI | React 18, TypeScript, Tailwind CSS |
| Data | Prisma ORM, SQLite |
| Server | Next.js Route Handlers |
| Content | Local TypeScript and JSON/HTML assets |

## Architecture

```text
app/                         Routes, pages, layouts, and API handlers
components/                  Shared UI and feature components
content/                     Projects, notes, tools, and presentation assets
lib/                         Domain types, recommendation logic, and data access
prisma/                      Schema, seeds, and data migrations
public/                      Static images
```

The application deliberately lives in a single Next.js codebase. Interactive features call Route Handlers, Prisma owns persistence, and domain logic such as recommendations remains separate from UI components.

## Run locally

### Requirements

- Node.js 18.17 or newer
- npm

### Setup

```bash
git clone <your-repository-url>
cd yitian-wonderland
npm install
cp .env.example .env
npm run db:push
npm run db:seed
npm run db:seed:interview
npm run db:seed:monorepo-notes
npm run db:seed:frontend-notes
npm run db:migrate:leetcode
npm run db:migrate:questions
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The seed and migration commands are designed to be safe to rerun. The local SQLite database is excluded from version control.

## Useful commands

```bash
npm run dev          # Start the local development server
npm run build        # Create and validate a production build
npm run start        # Run the production build
npm run lint         # Run Next.js linting
npm run db:studio    # Inspect local data with Prisma Studio
```

## Current status

Yitian Wonderland is an evolving personal product rather than a finished SaaS application. The core local workflows are functional; some experiments use curated sample data and are intended as product prototypes.

Current priorities include:

- adding automated tests for domain logic and API behavior
- improving first-run demo data and onboarding
- adding screenshots and a hosted read-only demo
- moving persistence to a hosted database for deployment
- expanding reflection and weekly-review insights

## Privacy and deployment

The project currently has no authentication and is intended to run locally. Do not deploy it with personal data or writable endpoints exposed publicly without adding authentication and authorization.

SQLite is suitable for local development, but a persistent hosted database such as PostgreSQL or Turso is recommended for a production deployment.

## License

No open-source license has been added yet. The source is public for portfolio and learning purposes; reuse is not granted unless a license is added later.
