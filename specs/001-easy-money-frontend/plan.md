# Implementation Plan: Easy Money Camp Market Frontend

**Spec**: [spec.md](./spec.md) · **Constitution**: [.specify/memory/constitution.md](../../.specify/memory/constitution.md)

## Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | React 19 + Vite 6 | Required; Vite gives `import.meta.env` and a static `dist/` for App Platform |
| Language | TypeScript 5.7 | Types hand-written to mirror the fixed contract in the backend spec |
| Routing | React Router 7 | Nested admin layout + route guard |
| Data | Hand-rolled `usePolling` / `useAsync` hooks over the API client | Only one polling view; a data library would be more surface than the app needs |
| Styling | CSS Modules over `src/styles/tokens.css` | Design tokens extracted once from the projector artboard; no global arbitrary styles |
| Charts | Recharts | ETF value history |
| Tests | Vitest + Testing Library + jsdom | Unit + component coverage of the risky logic |

## Folder structure

```
src/
  api/      client.ts (base URL, auth header, multipart, error parsing), etfs.ts,
            requests.ts, auth.ts, admin.ts, errorMessages.ts
  auth/     AuthContext.tsx, RequireAuth.tsx, authState.ts
  components/ EtfCard, TrendBadge, MoneyValue, EtfLogo, RequestCard,
            ValueHistoryChart, ConnectionStatus, ErrorBanner, EmptyState, Spinner
  hooks/    usePolling.ts, useAsync.ts
  lib/      money.ts, decimal.ts, trend.ts, datetime.ts, media.ts
  pages/    DashboardPage, RequestPage, NotFoundPage, admin/*
  styles/   tokens.css, global.css
  types/    api.ts
  test/     unit + component tests
```

## API client layer

- `client.ts` owns `API_BASE_URL`, the bearer header, JSON and multipart requests,
  the `{ error: { code, message, details } }` envelope parser (`ApiError`), and a
  global 401 hook that clears the token and redirects to `/admin/login`.
- Network/parse failures surface as `ApiError(0, 'NETWORK_ERROR')` so callers have
  one error type to branch on.
- `errorMessages.ts` maps codes to participant-safe copy; `details` is never rendered.
- `media.ts` absolutizes `/uploads/...` paths against the API origin.
- No component calls `fetch`.

## Data & state

- Projector: `usePolling(getEtfs, 5000)` — keeps last-good data on error, exposes
  `lastUpdated`, pauses while `document.hidden`, refreshes immediately on re-show.
- Admin lists/details: `useAsync` with explicit refresh after mutations.
- Auth: `AuthContext` holds the token, hydrates from storage, validates via
  `GET /api/auth/me` before rendering the shell, and clears on 401.

## Routing

`/` projector · `/request` participant form · `/admin/login` ·
`/admin` (guarded) → index ETFs, `etfs/:id`, `requests` · `*` not found.

## Env contract

`VITE_API_BASE_URL` (default `http://localhost:8000`), documented in `.env.example`.
Vite inlines it at build time, so production builds must be built with the deployed
backend URL, and that origin must be added to the backend's `CORS_ORIGINS`.

## Design mapping

Tokens (surface palette, text colours, `--trend-up/down/flat`, spacing scale, radii,
type scale, shadows) are lifted from the projector artboard into `styles/tokens.css`.
Every component — public and admin — consumes those tokens, so the mobile admin
screens the artboard does not cover still read as the same product. The artboard's
value-change animation is reimplemented as React state transitions rather than
shipping the design file's script.

## Risks

- The design source could not be re-imported in this environment (see spec notes and
  the PR description); the token layer already extracted from it is the working
  reference and must be reconciled against the artboard when it is reachable.
- Vite inlines env vars at build time — a wrong `VITE_API_BASE_URL` cannot be fixed
  at runtime, only rebuilt.
