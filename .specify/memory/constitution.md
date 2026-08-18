# Easy Money Frontend Constitution

## Core Principles

### I. The Backend Contract Is Read-Only (NON-NEGOTIABLE)
The FastAPI backend is finished. Its routes, methods, request/response field names
and types, status codes, and error envelope are fixed. The frontend adapts to the
API — never the reverse. No backend endpoint may be invented to satisfy a mockup.
If the UI needs something the API does not expose, that gap is stated explicitly
and worked around in the client.

### II. The Finished Design Is Authoritative
The Claude Design project (`Stock Market Projector.dc.html` + `support.js`) is the
visual source of truth. Its layout, type scale, spacing, colour tokens, trend
colours, and motion are the specification for the public projector view. The only
permitted deviations are those genuinely required for responsive behaviour —
notably the mobile-first admin screens the projector design does not cover — and
those must extend the design's own language rather than introduce a new one.
Design tokens are extracted once into the styling layer; every component, public
and admin, is built from those tokens.

### III. Every Data View Handles Four States
Loading, empty, success, and error are all designed and implemented for every view
that reads from the API. No spinner-forever, no silent failure, no raw validator
JSON shown to a participant. A failed poll must never blank out last-good data.

### IV. No Hardcoded Environment Values
All environment-specific values come from `VITE_`-prefixed env vars read through
`import.meta.env`. No `localhost` URL reaches production code. `.env.example` is
committed; real `.env` values never are. The currency symbol is never hardcoded in
a component — it is rendered from the `currency` field of the API response.

### V. Reusable Components Over Per-Page Duplication
ETF card, trend indicator, money display, image uploader, status badge, form field,
empty/error/loading states are built once and reused. Components never call `fetch`
directly: a single API client module owns the base URL, auth header injection,
multipart handling, error-envelope parsing, and image-URL absolutization.

## Additional Constraints

- Stack: React 19 + Vite + TypeScript, React Router, CSS Modules over a single
  `styles/tokens.css`. Types mirror the API contract exactly.
- Money and percentages arrive as fixed 2-decimal **strings** and are rendered
  as-is. They are never passed through `Number`/`parseFloat`/`toFixed` for
  display; parsing is permitted only for comparison, never re-serialized back
  into the UI.
- Trend colour is driven off the API's `trend` field, never off a locally
  computed sign.
- Timestamps are ISO-8601 UTC with `Z` and are converted to local time for display.
- Auth is a JWT bearer token only. There are no cookies and no refresh token; a
  401 on any admin call clears the stored token and redirects to admin login.
- Arabic copy (the currency name لحوح) must render with correct font and direction
  inside the existing design.
- Public view targets a 1080p/4K projector: all 7 ETFs visible at once, no
  scrolling, readable from a distance. Admin views target one-handed mobile use:
  thumb-reachable controls, no horizontal scrolling.

## Development Workflow

Work is spec-driven. `spec.md` → `plan.md` → `tasks.md` are written and committed
under `specs/<feature>/` before implementation, and kept alongside the code so the
history is reviewable. Ambiguities are resolved by inspecting the backend contract
and the design, not by asking the user; where a reasonable MVP decision is made,
the assumption is recorded in the spec. Every change ships with `npm run lint`,
`npx tsc -b`, and `npm run test -- --run` passing.

## Governance

This constitution supersedes other practices for this repository. Any PR that
changes backend contract assumptions, introduces a hardcoded environment value or
currency, or adds a view without its four states is non-compliant and must be
revised. Amendments are made by editing this file with a version bump and a note
in the PR description.

**Version**: 1.0.0 | **Ratified**: 2026-08-18 | **Last Amended**: 2026-08-18
