# Easy Money Frontend

The Easy Money camp market client. This frontend provides a public projector dashboard, a participant BUY/SELL request form, and a login-protected organizer admin area. Camp currency is لحوح; it is **not** real money and there is no trading, settlement, or payment of any kind.

## Requirements

- Node 20.19+ or 22.13+
- npm
- Easy Money backend running (see [backend/README.md](../backend/README.md))

## Install

```bash
cd frontend && npm install
```

## Environment configuration

Configure the frontend using the `.env` file (copy `.env.example` to `.env`).

- `VITE_API_BASE_URL`: The URL of the backend. Defaults to `http://localhost:8000` when unset.
- `.env.example` is committed and `.env` is gitignored and **must never be committed**.
- The backend's `CORS_ORIGINS` must contain the frontend's origin. The frontend's default is `http://localhost:5173`, which already matches Vite's default.

## Dev server

Start the local development server:

```bash
npm run dev
```

It will be served at `http://localhost:5173`.

## The three screens

| Path | Description |
|---|---|
| `/` | **Public market dashboard** — Designed for the projector screen |
| `/request` | **Participant BUY/SELL form** — For participants to open on their phones |
| `/admin` | **Admin area** — Login-protected organizer area |

*Note: admin credentials come from `ADMIN_USERNAME`/`ADMIN_PASSWORD` in `backend/.env`.*

## Build & preview

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

The output in the `dist/` folder is purely static files. You can serve them from any static host. Point `VITE_API_BASE_URL` at the deployed backend **at build time** (Vite inlines it).

## Tests & checks

Run tests:

```bash
npm run test -- --run
```

Run linter:

```bash
npm run lint
```

Type check:

```bash
npx tsc -b
```

Tests cover money formatting, trend mapping, request-form validation, error mapping, and auth guard.

## Running it against the backend

Two-terminal sequence. Backend first.

**Terminal 1 (Backend):**
```bash
cd backend
cp .env.example .env
python -m alembic upgrade head
python -m uvicorn app.main:app --reload
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Notes for camp

- Put the projector browser in fullscreen on `/`.
- The dashboard refreshes itself every 5 seconds and pauses while the tab is hidden, so leave it as the foreground tab.
- If the backend goes down, the last known prices stay on screen with a warning banner and it recovers on its own.
- Participants reach `/request` on their phones (a QR code to that URL is the easy way).

## Project structure

- `src/api/` - Backend communication and types
- `src/components/` - Reusable UI elements
- `src/lib/` - Formatting and logic helpers
- `src/pages/` - Top-level route components
- `src/styles/` - CSS tokens and global styles

## Conventions

- Money arrives as decimal **strings** and is never put through `Number`/`parseFloat`/`toFixed`.
- Styling is done via **CSS Modules + `styles/tokens.css` only**. No global arbitrary styles unless defined as tokens.
