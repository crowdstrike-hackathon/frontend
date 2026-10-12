# Riposte (frontend)

The console for Riposte, a provenance-based firewall for AI agent tool calls. It is a chat-style
view of a support agent handling tickets, with every tool call shown alongside the firewall's
decision and the source of each argument.

## What you can do

- Pick an example ticket on the start screen (loaded from the backend's `tickets.json`) or write your own as a customer or an attacker.
- Switch the defense between **Off**, **Keyword filter** and **Riposte**, and rerun the same ticket to compare.
- See each tool call with its arguments tagged as trusted, from the ticket, ticket sender, or no source.
- Approve or deny calls that Riposte holds for a person.
- See what actually left the sandbox, and reopen past runs from the history list in the sidebar.

## Stack

React 19, Tailwind CSS, shadcn/ui components (`src/components/ui`), Aceternity UI for the landing
page and the cloud shader, Framer Motion, lucide icons.

## Run

```bash
cd frontend/crowdstrike
npm install
npm start
```

The app opens on http://localhost:3000 and talks to the backend at `REACT_APP_API_BASE`
(default `http://localhost:8000`, set in `.env`). Start the backend first, then register an account.

## Structure

```
src/
  api.js                 fetch client, token storage, EventSource for run streams
  lib/run.js             folds the run's server-sent events into the chat view
  pages/Console.js       the chat console
  pages/Landing.js       landing page
  components/chat/       history list, thread, tool-call cards, composer, side panel
  components/ui/         shadcn components
  ui/aceternity/         Aceternity components
```
