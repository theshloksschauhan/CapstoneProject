# CareerOS Frontend

React single-page application for the CareerOS job application platform.

## Setup

```bash
yarn install
cp .env.example .env
yarn start
```

Set `REACT_APP_BACKEND_URL` to your backend URL (default `http://localhost:8000`).

## Scripts

| Command | Description |
|---------|-------------|
| `yarn start` | Development server on port 3000 |
| `yarn build` | Production build |
| `yarn test` | Run tests |

## Structure

- `src/pages/` — route pages (Landing, Login, Dashboard, Application detail, Settings, Admin)
- `src/components/` — shared UI and tab components
- `src/context/AuthContext.jsx` — authentication state
- `src/lib/api.js` — axios client with token refresh
