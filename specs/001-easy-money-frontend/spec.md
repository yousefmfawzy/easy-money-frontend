# Feature Specification: Easy Money Camp Market Frontend

**Feature Branch**: `claude/easy-money-react-frontend-u9n62n`
**Status**: Implemented
**Input**: Build the React client for the finished Easy Money FastAPI backend, following the finished Claude Design projector artboard.

## Summary

Easy Money is a simulated stock-market game for Avamina Scouting Group (ASG), played
during a camp. Participants "trade" seven ETFs in the camp currency لحوح. A large
screen shows live prices; participants submit BUY/SELL requests from their phones;
a single organizer account reviews those requests and moves ETF values.

Nothing here is real money. Approving a request does not move units, balances, or
funds anywhere — it is a review workflow only, and the UI must never imply otherwise.

## User Scenarios

### US-1 — Projector dashboard (Priority: P1)
As a camp organizer projecting the market on a large screen, I see all seven ETFs
at once with their current value, change amount, change percentage, and a clear
green/red/neutral trend, so participants across the hall can read the market at a
glance.

**Acceptance**
1. All seven ETFs are visible simultaneously on a 1080p/4K display without scrolling.
2. Values refresh automatically without interaction.
3. Trend colour follows the API's `trend` field (`UP`/`DOWN`/`FLAT`).
4. When the backend is unreachable, the last-good values stay on screen with a
   subtle reconnecting indicator; the screen never blanks or shows a raw error page.
5. Refreshing pauses while the tab is hidden and resumes when it is visible again.
6. In the pre-camp seeded state (value `0.00`, no logo, generic names) the board
   still looks correct — this is a real supported state, not an edge case.
7. Money is rendered with the `currency` value returned by the API.

### US-2 — Submit a trade request (Priority: P1)
As a participant, I fill in my name, pick an ETF, choose BUY or SELL, enter units,
attach a photo of myself, and submit — then see exactly what was locked in.

**Acceptance**
1. The form requires: requester name (non-empty trimmed, ≤120 chars), ETF, request
   type (`BUY`/`SELL`), units (strictly positive, 2dp), and an image.
2. Image type (JPEG/PNG/WEBP) and size (≤ `MAX_UPLOAD_MB`, default 5) are validated
   client-side before upload, with a friendly message.
3. The client never sends a timestamp or a price; the backend stamps both.
4. On success the participant sees a receipt showing the ETF, type, units, the
   value snapshot, the total, the status, and the submission time — once. There is
   no "my requests" list and no lookup screen, because the API exposes none.
5. Validation failures (422) are shown as plain language; the raw validator output
   is never displayed.

### US-3 — Admin login (Priority: P1)
As the single organizer, I log in with the credentials configured in backend env
and stay logged in for the token's lifetime.

**Acceptance**
1. Wrong credentials produce a plain-language error, not a raw envelope.
2. A stored token is validated on app load before the admin shell is shown.
3. Any 401 from an admin call clears the token and redirects to login.
4. There is no signup, no password reset, and no user management UI.

### US-4 — Manage ETFs (Priority: P1)
As the organizer, on my phone, I rename an ETF, upload a new logo, set an absolute
value, or adjust the value by a percentage.

**Acceptance**
1. Exactly seven ETFs are listed; there is no create or delete affordance.
2. Absolute value must be ≥ 0; percentage may be positive or negative.
3. When an ETF's current value is `0.00`, the percentage control is disabled with
   an explanatory hint rather than letting the admin hit `ZERO_VALUE_PERCENTAGE`.
4. After any change the updated ETF is reflected immediately in the admin view.
5. Recent value history is viewable, oldest-first, as returned by the API.
6. Controls are thumb-reachable, and no view scrolls horizontally on a phone.

### US-5 — Review trade requests (Priority: P1)
As the organizer, I review incoming requests newest-first and approve or reject them.

**Acceptance**
1. Requests can be filtered by status, type, and ETF.
2. Each request shows requester name and photo, ETF, type, units, value snapshot,
   total, status, and submission time in local time.
3. Approve/reject updates the status and shows the processed time.
4. Changing a decision that has already been made requires an explicit confirmation,
   because the backend does not guard against re-deciding.
5. Paging is offset-based; "has more" is inferred from a full page, since the API
   returns no total count.
6. Requester photos are previewed at a size that does not blow up the mobile layout.

## Requirements

- **FR-001** All API access goes through one client module owning base URL, auth
  header, multipart handling, error-envelope parsing, and image-URL absolutization.
- **FR-002** Money/percentage strings are rendered verbatim; never reformatted through
  floating point.
- **FR-003** Currency is read from each response's `currency` field.
- **FR-004** Every data view implements loading, empty, success, and error states.
- **FR-005** Trend styling is driven by the `trend` field.
- **FR-006** Timestamps are converted from UTC to local time for display.
- **FR-007** Image URLs are prefixed with the API base origin before use.
- **FR-008** Known error codes map to plain-language messages:
  `UNAUTHORIZED`, `ETF_NOT_FOUND`, `REQUEST_NOT_FOUND`, `UNSUPPORTED_IMAGE_TYPE`,
  `ZERO_VALUE_PERCENTAGE`, `FILE_TOO_LARGE`, `VALIDATION_ERROR`, `INTERNAL_ERROR`,
  plus a network-failure fallback.
- **FR-009** The projector view polls on an interval that survives tab-visibility
  changes and preserves last-good data across failures.
- **FR-010** `VITE_API_BASE_URL` is the only environment input; a committed
  `.env.example` documents it.

## Out of Scope (backend does not support it)

- WebSockets/SSE live push — the dashboard polls.
- Portfolios, holdings, balances, or settlement of any kind.
- Creating or deleting ETFs.
- Public listing or lookup of submitted requests.
- Refresh tokens or multi-user accounts.

## Assumptions Recorded

- Poll interval: 5s on the projector (within a camp-screen-sane range; the API is
  local and cheap to poll).
- Client-side max upload size mirrors the backend default of 5 MB.
- The token is held in-memory plus browser storage and re-validated via
  `GET /api/auth/me` on load.
- Admin routes: `/admin` (ETFs), `/admin/etfs/:id`, `/admin/requests`,
  `/admin/login`. Public routes: `/` (projector) and `/request`.
