# CareerOS

AI-powered job application platform — fit analysis, resume rewrite, cover letters, interview prep, salary negotiation, ATS scoring, and application tracking. Includes voice mock interviews and calendar integration.

**Live App:** <paste deployed frontend URL here>
**API:** <paste deployed backend URL here>

## Core Features & Open-Ended Stretch
- **Fit Analysis & ATS Scoring**: Evaluates resume fit against the job description.
- **Resume Rewrite**: Suggests optimized bullet points.
- **Cover Letter Generation**: Drafts a custom cover letter with an engaging hook.
- **Mock Interview Pack**: Generates personalized behavioral and technical questions.
- **Voice Mock Interview (Stretch)**: Practice your interview answers using browser speech recognition.
- **Salary Negotiation Coach (Stretch)**: Estimates market value and generates negotiation scripts based on the role and your resume.
- **Calendar Integration (Stretch)**: Export a 1-week follow-up reminder as an `.ics` file.

## Stack

- **Frontend**: React 19, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: FastAPI, MongoDB (Motor), Gzip, Security Headers
- **AI**: OpenAI API (6 parallel agents via `asyncio.gather`)

## Quick start (Docker)

1. Copy environment files and add your OpenAI key:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit backend/.env and set MONGO_URL, DB_NAME, JWT_SECRET, OPENAI_API_KEY, FRONTEND_URL, ADMIN_PASSWORD
# Edit frontend/.env and set REACT_APP_BACKEND_URL
```

2. Start the full stack:

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Default admin email: `admin@careeros.ai`
- If `ADMIN_PASSWORD` is omitted, the backend generates a startup password and logs it once to stdout.

## Local development (without Docker)

### Prerequisites

- Node.js 20+, Yarn
- Python 3.11+
- MongoDB running locally

### Backend

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # configure MONGO_URL, JWT_SECRET, OPENAI_API_KEY
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
yarn install
cp .env.example .env
yarn start
```

## Environment variables

| Variable | Location | Description |
|----------|----------|-------------|
| `MONGO_URL` | backend | MongoDB connection string |
| `DB_NAME` | backend | Database name |
| `JWT_SECRET` | backend | Secret for JWT signing |
| `OPENAI_API_KEY` | backend | OpenAI API key |
| `OPENAI_MODEL` | backend | Model name (default `gpt-4o`) |
| `FRONTEND_URL` | backend | Comma-separated CORS origins |
| `COOKIE_SECURE` | backend | `true` in production HTTPS |
| `ADMIN_EMAIL` | backend | Initial admin email |
| `ADMIN_PASSWORD` | backend | Initial admin password or generated fallback |
| `DAILY_AI_RUN_LIMIT` | backend | Max AI runs per user per day |
| `REACT_APP_BACKEND_URL` | frontend | Backend base URL |

## Deployment

1. Create a free MongoDB Atlas cluster and copy the connection string.
2. Deploy the backend to Render using `render.yaml`, then set these env vars in the dashboard: `MONGO_URL` to the Atlas URI, `DB_NAME`, `JWT_SECRET` to a strong random string, `OPENAI_API_KEY`, `OPENAI_MODEL`, `FRONTEND_URL` to the eventual Vercel URL, `COOKIE_SECURE=true`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `DAILY_AI_RUN_LIMIT`.
3. Deploy the frontend to Vercel from the `frontend` folder. Set `REACT_APP_BACKEND_URL` as a Vercel build-time environment variable before each build, because Create React App inlines it at build time instead of runtime.
4. Update `frontend/vercel.json` rewrites are already configured so SPA routes fall back to `index.html`.
5. After the frontend URL is known, update `FRONTEND_URL` on Render so it includes the Vercel origin, redeploy the backend, and confirm cookies are sent with `SameSite=None; Secure` over HTTPS.

## Testing

```bash
# Unit tests (requires MongoDB)
make test-unit

# All backend tests
make test
```

## Documentation

- [BUILD_SPEC.md](BUILD_SPEC.md) — application specification
- [RESEARCH_REPORT.md](RESEARCH_REPORT.md) — market research and architecture notes

## Pre-Flight Submission Checklist
Before submitting the capstone video and repo, ensure:
1. **Incognito Test:** All live links open in an incognito window without forcing a login (unless it's an intended demo login).
2. **Public Repo:** The GitHub repository is set to Public.
3. **Folders:** The repo contains both `/frontend` and `/backend` folders and this `README.md`.
4. **Video:** Your demo video is under 5 minutes long.
5. **Presentation:** Presentation slide links are set to "anyone with the link can view".

## API overview

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Current user |
| PATCH | `/api/auth/profile` | Update name/password |
| POST | `/api/applications` | Create application |
| GET | `/api/applications` | List applications (paginated) |
| POST | `/api/applications/{id}/run` | Run 5-agent AI pipeline |
| GET | `/api/health` | Health check |
| GET | `/api/admin/stats` | Admin system stats |
