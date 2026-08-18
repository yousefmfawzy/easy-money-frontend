# Tasks: Easy Money Camp Market Frontend

Status legend: [x] done · [ ] outstanding

## Phase 1 — Foundation
- [x] T001 Vite + React 19 + TypeScript scaffold, eslint, vitest/jsdom config
- [x] T002 `.env.example` with `VITE_API_BASE_URL`; `.env` gitignored
- [x] T003 `src/types/api.ts` — ETF, ETFValueHistory, TradeRequest, auth, error envelope
- [x] T004 `src/styles/tokens.css` — colours, trend colours, spacing, radii, type scale
- [x] T005 `src/styles/global.css` — reset, Arabic-capable font stack, direction handling

## Phase 2 — API layer (blocks everything below)
- [x] T006 `api/client.ts` — base URL, bearer injection, JSON + multipart, `ApiError`
- [x] T007 Error-envelope parsing + global 401 handler
- [x] T008 `api/errorMessages.ts` — code → participant-safe copy
- [x] T009 `lib/media.ts` — image URL absolutization
- [x] T010 `lib/money.ts` / `lib/decimal.ts` — string-safe money rendering and comparison
- [x] T011 `lib/trend.ts`, `lib/datetime.ts` — trend mapping, UTC → local
- [x] T012 `api/etfs.ts`, `api/requests.ts`, `api/auth.ts`, `api/admin.ts`

## Phase 3 — Shared components
- [x] T013 `MoneyValue`, `TrendBadge`, `EtfLogo` (no-logo fallback)
- [x] T014 `EtfCard`
- [x] T015 `RequestCard` + status badge
- [x] T016 `Spinner`, `EmptyState`, `ErrorBanner`, `ConnectionStatus`
- [x] T017 `ValueHistoryChart`

## Phase 4 — Public experience (US-1, US-2)
- [x] T018 `hooks/usePolling` — visibility-aware, last-good-data-preserving
- [x] T019 `DashboardPage` — 7-up projector grid, all four states, reconnecting indicator
- [x] T020 Zero-value / no-logo pre-camp state verified on the projector
- [x] T021 `RequestPage` form — name, ETF, type, units, image
- [x] T022 Client-side image type/size validation before upload
- [x] T023 Submission receipt success state (single-shot, no lookup view)

## Phase 5 — Admin (US-3, US-4, US-5)
- [x] T024 `AuthContext` + storage hydration + `/api/auth/me` validation
- [x] T025 `RequireAuth` guard and 401 redirect wiring
- [x] T026 `LoginPage`
- [x] T027 `AdminLayout` — mobile-first nav
- [x] T028 `AdminEtfsPage` — list of exactly 7, no create/delete
- [x] T029 `AdminEtfDetailPage` — rename, logo upload, absolute value, percentage adjust
- [x] T030 Percentage control disabled with hint when value is `0.00`
- [x] T031 Value history on the ETF detail page
- [x] T032 `AdminRequestsPage` — filters, offset paging, approve/reject
- [x] T033 Confirmation before changing an already-made decision
- [x] T034 `NotFoundPage`

## Phase 6 — Quality
- [x] T035 Tests: money, decimal, trend, error messages, request-form validation,
      auth guard, zero-value percentage handling (26 tests)
- [x] T036 `npm run lint`, `npx tsc -b`, `npm run test -- --run` all green
- [x] T037 README: env, routes, run-against-backend, deploy notes

## Phase 7 — Spec-driven artifacts
- [x] T038 Spec Kit initialized (`.specify/`, `.claude/skills/speckit-*`)
- [x] T039 Constitution ratified
- [x] T040 `spec.md`, `plan.md`, `tasks.md` committed

## Phase 8 — Design reconciliation
- [x] T041 Imported the finished artboard (delivered as a published Artifact bundle,
      decoded to `design/Stock Market Projector.dc.html` + `design/support.js`, both
      committed as the visual source of truth).
- [x] T042 Re-derived `styles/tokens.css` from the artboard's literal values:
      black `#000000`, green `#3ADF00`, orange `#F26522`, red `#FF1E1E`, Rubik
      500/700/800/900, and the artboard's five keyframes.
- [x] T043 Rebuilt the public dashboard as the projector: 16:9 cqw size-container,
      logo + wordmark + live clock, bar chart with derived axis, per-ETF legend,
      RTL news ticker.
- [x] T044 Reimplemented `support.js` behaviour idiomatically in React
      (`useClock`, `useChangePulse`, CSS transitions) without shipping the script.
