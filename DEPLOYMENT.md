# Deploying to DigitalOcean App Platform

The backend is already live at `https://monkfish-app-6ss4k.ondigitalocean.app`.
This document covers the frontend.

## What was going wrong

The frontend component was created as a **Web Service**. A Web Service is a
long-running process that App Platform expects to listen on `$PORT` (8080), and
it is health-checked there. This project is a Vite SPA — `npm run build` just
writes static files into `dist/` and exits — so the buildpack had nothing to
launch:

```
ERROR: failed to launch: determine start command: when there is no default process a command is required
ERROR failed health checks after 1 attempts with error Readiness probe failed:
      dial tcp 100.127.19.105:8080: connect: connection refused
ERROR component terminated with non-zero exit code: 190
```

The build itself was fine. Nothing ever bound port 8080, so the readiness probe
was refused and the component was killed.

Either option below fixes it. **Option A is the right one for this app.**

## Option A — Static Site (recommended)

Static Sites are what App Platform offers for built frontends: no process, no
port, no health check, served from its CDN, and free on the starter tier.

Recreate the frontend component with **Resource Type: Static Site** and these
settings:

| Setting | Value |
|---|---|
| Build Command | `npm ci && npm run build` |
| Output Directory | `dist` |
| Index Document | `index.html` |
| **Catchall Document** | `index.html` |
| HTTP Port | *(none — Static Sites have no port)* |

**Catchall Document is not optional here.** React Router owns `/request`,
`/admin`, `/admin/etfs` and so on. Those paths do not exist as files in `dist/`,
so without a catchall every direct link and every browser refresh on them
returns 404. Pointing the catchall at `index.html` hands those URLs to the SPA.

Build-time environment variables:

| Key | Scope | Value |
|---|---|---|
| `VITE_API_BASE_URL` | **Build Time** | `https://monkfish-app-6ss4k.ondigitalocean.app` |
| `NPM_CONFIG_PRODUCTION` | Build Time | `false` |
| `NPM_CONFIG_INCLUDE` | Build Time | `dev` |

`.do/app.yaml` in this repo is that same configuration as a spec file:

```bash
doctl apps update <APP_ID> --spec .do/app.yaml   # existing app
doctl apps create --spec .do/app.yaml            # or a fresh one
```

## Option B — keep it a Web Service

If you would rather not recreate the component, `npm start` now exists and works.
`server.js` serves `dist/` on `$PORT`, falls back to `index.html` for client-side
routes, gzips text assets, and pins immutable caching on the fingerprinted files
under `assets/`. It has no dependencies — nothing extra gets installed.

| Setting | Value |
|---|---|
| Build Command | `npm ci && npm run build` |
| Run Command | `npm start` |
| HTTP Port | `8080` |
| Health Check (HTTP path) | `/healthz` |

Same environment variables as Option A. This costs a paid instance and gives up
the CDN, which is the only reason Option A is preferred.

## `VITE_API_BASE_URL` must be a *build-time* variable

Vite inlines `import.meta.env.*` into the bundle when it builds. A **Run Time**
variable never reaches the browser — the bundle would keep whatever value was
compiled in. If the deployed site is calling `http://localhost:8000`, this is
why.

As a safety net, `.env.production` in this repo already points at the deployed
backend, so a build with no environment variable set still targets the right
API. A `VITE_API_BASE_URL` set in App Platform overrides it, which is what you
want when the backend URL changes — change it there and redeploy, no code edit.

## Backend CORS — required, and a backend-side change

The browser calls the backend directly from the frontend's origin, so the
backend must allow it. In the backend's App Platform settings, `CORS_ORIGINS`
has to contain the frontend's URL, e.g.:

```
CORS_ORIGINS=https://easy-money-frontend-xxxxx.ondigitalocean.app
```

Scheme included, no trailing slash. Until that is set, the site loads but every
request fails and the dashboard shows its connection-lost banner. This is a
change in the backend app, not in this repository.

## After deploying

1. `/` renders the dashboard with live prices (not the offline banner).
2. Open `/request` **directly** in a new tab — proves the catchall works.
3. Log in at `/admin`, then refresh the page — proves it again on an
   authenticated route.
4. DevTools → Network: requests go to `monkfish-app-6ss4k.ondigitalocean.app`,
   not `localhost`, and none are CORS-blocked.
