# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

99Plus is a Next.js 16 (App Router, React 19, Turbopack) web app for CUET aspirants in India. The entire backend is a remote InsForge-hosted PostgreSQL BaaS — no local database or Docker required.

### Prerequisites

- **Node.js v22+** and **npm** (lockfile: `package-lock.json`)
- `.insforge/project.json` must exist with `oss_host` and `api_key` fields (gitignored). See `STATUS.md` § 1 for connection details. Without this file, all API routes crash at runtime.

### Key commands

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (port 3000, Turbopack) |
| Lint | `npx eslint .` |
| Build | `npm run build` |

### Known issues

- `npm run build` fails with a pre-existing TypeScript error in `src/app/api/auth/forgot-password/route.ts` (`headers()` returns a Promise in Next.js 16 and must be awaited). Dev server (`npm run dev`) is unaffected.

### Caveats

- The `.insforge/` directory is gitignored. Each new VM must recreate it. Run: `mkdir -p .insforge && printf '{"oss_host":"https://s23f7sag.ap-southeast.insforge.app","api_key":"%s"}' "$INSFORGE_API_KEY" > .insforge/project.json` (requires the `INSFORGE_API_KEY` secret to be set in the environment).
- The app relies on a remote InsForge instance (`https://s23f7sag.ap-southeast.insforge.app`). If that service is down, API routes will fail.
- Guardian OTP dispatch currently logs to server console (no real SMS/email integration yet).
- `next.config.js` uses CommonJS (`module.exports`). Turbopack dev mode works fine.
