# DSS Frontend (React + Vite + Tailwind v4)

Single-page app for the career orientation quiz and admin console.

## Prerequisites
- Node.js 18+
- Backend API running (default `http://localhost:5000/api`).

## Setup & Run
1) `cd frontend`
2) `npm install`
3) Create `.env` in `frontend/` as needed:
```
VITE_API_BASE=http://localhost:5000/api
```
4) Start dev server: `npm run dev` (Vite on port 5173 by default).
5) Build for production: `npm run build`; preview: `npm run preview`.

## Key Pages
- Quiz flow (Level 1 & Level 2), results display.
- Auth (login/register) with JWT stored in localStorage.
- Admin: manage majors, submajors, questions, options, results, users.

## Linting
- `npm run lint` uses ESLint 9 with React hooks and refresh plugins.

## Notes
- API client base URL is configurable via `VITE_API_BASE` (see `src/api.js`).
- On 401 responses, auth state clears and redirects to `/login`.
