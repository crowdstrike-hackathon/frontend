# Sentinel — dashboard (frontend)

React dashboard for the agentic red/blue SOC simulation. Auth, a live "War Room" where the
adversary AI streams telemetry and the defender AI posts verdicts, human-in-the-loop action
approval, and a persisted engagement history with charts.

## Stack

React 19 · Tailwind CSS · Framer Motion · Aceternity-style UI (aurora, spotlight, glass,
moving-border, animated beam) · Recharts · react-router · react-hot-toast · lucide icons.

## Run

```bash
cd frontend/crowdstrike
npm install
npm start           # http://localhost:3000
```

Set `REACT_APP_API_BASE` (defaults to `http://localhost:8000`, in `.env`). Start the
backend first (see `app/app/README.md`), register an account, pick a scenario in the War
Room, and hit **Launch → Auto-run**.

## Structure

```
src/
  api.js              fetch + token auth + SSE EventSource client
  context/AuthContext JWT auth state (register / login / me / logout)
  ui/                 reusable primitives: AuroraBackground, Spotlight, GlassCard,
                      GlowButton/MovingBorderButton, TextGenerate, DuelBeam
  components/         Sidebar, ScenarioPicker, EventTimeline, InvestigationFeed,
                      ApprovalQueue, Scoreboard
  pages/              Login, Dashboard (War Room), History
  App.js              router + protected routes + app shell
```
