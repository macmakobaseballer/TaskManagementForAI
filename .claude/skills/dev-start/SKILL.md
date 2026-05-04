---
name: dev-start
description: Start the local development environment for TaskManagementForAI — spins up PostgreSQL (Docker), Spring Boot backend, and Vite frontend dev server in the correct order. Use this skill whenever the user says things like "サーバーを起動して", "開発環境を起動", "dev環境立ち上げて", "start servers", "start dev", "環境起動", "バックエンド起動", or any variation of wanting to run the app locally. Also trigger when the user wants to verify API behaviour in the browser.
---

# dev-start

Start all three layers of the TaskManagementForAI development environment in the correct order and confirm each one is healthy before moving on.

## Environment facts

- **Repo root**: detect with `git rev-parse --show-toplevel` if needed; typically `/home/makoj/dev/TaskManagementForAI`
- **Node.js**: WSL-native via nvm — always source nvm before running npm commands:
  ```bash
  export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
  ```
- **Backend profile**: `--spring.profiles.active=local`
- **Ports**: PostgreSQL 5432 · Backend 8080 · Frontend 5173

## Startup sequence

Work through these steps in order. Each step has a readiness check — don't proceed until it passes.

### 1. PostgreSQL (Docker)

```bash
# from repo root
docker compose up -d
```

Readiness check — wait until healthy:
```bash
docker compose ps postgres   # STATUS should contain "(healthy)"
```

If Docker isn't running at all, tell the user and stop — there's no way to continue without it.

### 2. Spring Boot backend (port 8080)

First, free the port if something is already using it — this avoids a cryptic startup failure:
```bash
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
```

Start in the background and stream logs to a file so you can tail them:
```bash
cd <repo-root>/backend
./gradlew bootRun --args='--spring.profiles.active=local' > /tmp/backend.log 2>&1 &
```

Readiness check — poll until "Started TaskManagementApplication" appears (typically 10–20 s):
```bash
grep -q "Started TaskManagementApplication" /tmp/backend.log
```

If "APPLICATION FAILED TO START" appears instead, show the user the relevant error lines from `/tmp/backend.log` and stop.

A successful Flyway run logs lines like `"Migrating schema to version N"` — mention this if it appears (useful for onboarding newcomers who see it for the first time).

### 3. Vite frontend (port 5173)

Free the port first:
```bash
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
```

Start with nvm loaded:
```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
cd <repo-root>/frontend
npm run dev > /tmp/frontend.log 2>&1 &
```

Readiness check — wait for "VITE ... ready":
```bash
grep -q "ready in" /tmp/frontend.log
```

## Final status report

Once all three are up, print a concise summary:

```
✓ PostgreSQL   localhost:5432  (healthy)
✓ Backend      http://localhost:8080
✓ Frontend     http://localhost:5173
```

Remind the user they can open http://localhost:5173 in their browser.

## Handling partial starts

If only some services need starting (e.g., PostgreSQL and backend are already running), skip those steps and say so — don't restart what's already healthy. Check each port/container before touching it.

## Common issues

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Port 8080 already in use | Previous backend process | `lsof -ti:8080 \| xargs kill -9` |
| "Flyway migration failed" | Applied migration was edited | Show error, don't auto-fix — migrations are append-only |
| `npm: command not found` | nvm not sourced | Source nvm first (see above) |
| Docker not running | Docker Desktop not started | Tell the user to start Docker |
