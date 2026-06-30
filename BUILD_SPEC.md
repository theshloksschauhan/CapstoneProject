# Build Spec — CareerOS AI Resume & Job-Application Platform

This document specifies the CareerOS application: stack, features, user stories, endpoints, and UX acceptance criteria.

---

## Overview

CareerOS is a production-quality **AI career operating system** — an AI-powered job application platform that analyzes resume fit, rewrites resumes, generates cover letters, prepares interview packs, and scores ATS compatibility.

## Tech Stack

- **Backend**: FastAPI (Python) + MongoDB (Motor). All routes prefixed `/api`.
- **AI**: OpenAI API (`openai` SDK, model configurable via `OPENAI_MODEL`, default `gpt-4o`). Five specialized agents run in parallel with `asyncio.gather`.
- **PDF parsing**: `pypdf`.
- **Frontend**: React + Tailwind + shadcn/ui (JavaScript, no TypeScript), Framer Motion, lucide-react, recharts, sonner.
- **Auth**: email/password, bcrypt, JWT in httpOnly cookies (+ bearer fallback), brute-force lockout, admin seeding.

## Design (premium dark, "Linear × Notion × Vercel × Stripe")

- Default dark mode. Base `#0A0A0A`, surface `#141414`, glassy panels, rounded-2xl, soft shadows, subtle grid + ambient glows.
- Primary action **electric blue `#0066FF`**; **violet `#8B5CF6` exclusively for AI states**; **emerald `#10B981`** success/match; **amber `#F59E0B`** warnings/ATS gaps.
- Display font (Cabinet Grotesk/Satoshi), strong typography, uppercase tracked overlines, lots of whitespace, micro-interactions, staged AI generation progress, score rings, animated bars, status timeline.
- `data-testid` on every interactive/informational element.

## Core Features

1. **Auth** — register/login/logout, protected dashboard, profile settings.
2. **New Application** — job title, company, paste JD, upload resume (PDF/TXT → parsed) or paste text.
3. **5-Agent AI Pipeline** (one click "Run AI analysis"):
   - **Fit Analysis** → match_rate %, verdict, summary, strengths[], gaps[] (severity), matched/missing keywords.
   - **Resume Rewrite** → rewritten resume + side-by-side diff + change log (original→improved + reason).
   - **Cover Letter** → tailored letter + opening hook.
   - **Interview Pack** → questions[] (category, difficulty, STAR answer, tip) + focus areas.
   - **ATS Score** → overall %, category breakdown bars, missing keywords, suggestions.
4. **Regenerate** any single section.
5. **Applications dashboard** — stat cards (total, avg match, avg ATS, generated count), pipeline breakdown, application cards.
6. **Application detail** — tabs for the 5 sections, status dropdown (draft/applied/interviewing/offer/rejected), status timeline, delete, export resume/cover letter.

## User Stories

- As a job seeker, I upload my resume + paste a JD and get a fit score, rewritten resume, cover letter, interview prep, and ATS score in one run.
- As a user, I track every application's status and see match/ATS scores at a glance.
- As a user, I regenerate any section I'm unhappy with.
- As a user, I can update my profile and change my password.
- As an admin, I can view system-wide statistics.

## Endpoints

- `POST /api/auth/register|login|logout|refresh`, `GET /api/auth/me`, `PATCH /api/auth/profile`
- `POST /api/resume/parse` (multipart) → { text, char_count }
- `POST /api/applications` · `GET /api/applications` · `GET /api/applications/{id}`
- `PATCH /api/applications/{id}/status` · `DELETE /api/applications/{id}`
- `POST /api/applications/{id}/run` (full pipeline)
- `POST /api/applications/{id}/regenerate/{agent}`
- `GET /api/stats` · `GET /api/health`
- `GET /api/admin/stats` (admin only)

## Agent Prompt Rules

Each agent returns **strict JSON** only (defined schema), parsed defensively so malformed output never crashes the request. Truncate long inputs. Use distinct session identifiers per agent.

## Acceptance

- Premium dark UI matching the palette; mobile-friendly.
- Full auth flow works; applications persist; pipeline produces all five sections; diff view + ATS bars + score rings render; status changes persist with timeline.
