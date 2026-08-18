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

Tokens are lifted verbatim from `design/Stock Market Projector.dc.html` into
`styles/tokens.css`: `#000000` ground, `#3ADF00` green, `#F26522` orange,
`#FF1E1E` down-red, Rubik 500/700/800/900, and the five `em-*` keyframes.
The projector sizes everything in `cqw` inside a 16:9 size container, so the
board scales as one unit; admin screens reuse the same palette on a rem scale.
Every component — public and admin — consumes those tokens, so the mobile admin
screens the artboard does not cover still read as the same product. The artboard's
value-change animation is reimplemented as React state transitions rather than
shipping the design file's script.

## Risks

- RESOLVED: the artboard was delivered as a published Artifact bundle and decoded
  into `design/`. The token layer is now derived from its literal values rather
  than approximated, and the projector view is built directly against it.
- Vite inlines env vars at build time — a wrong `VITE_API_BASE_URL` cannot be fixed
  at runtime, only rebuilt.

## Deviations from the artboard (and why)

| Artboard | Shipped | Reason |
|---|---|---|
| 6 bars | 7 bars | The product has exactly 7 ETFs; bars are `flex: 1` so they fit. |
| Value type 1.95cqw, currency 1.05cqw | 1.5cqw / 0.8cqw | API money is fixed-2-decimal (`94500.00`), wider than the artboard's integer placeholders; 7 slots need the smaller step to avoid collisions. |
| Legend name 2.1cqw | 1.75cqw | Same 7-across constraint (`ENERGY` truncated at 2.1cqw). |
| Axis fixed 1,000–100,000 | Derived from live values | Placeholder scale; real ETFs seed at 0. `buildScale` keeps the six-gridline treatment and falls back to a 0–100 ceiling so the pre-camp board still draws. |
| Hand-written Arabic news ticker | Ticker built from real ETF movements + the artboard's own standing reminder | No news endpoint exists and inventing one is out of bounds; visual treatment kept, content filled from `GET /api/etfs`. |
| `data-ago` readout in support.js | `ConnectionStatus variant="projector"` | Fills the artboard's under-clock slot and doubles as the reconnecting indicator. |
