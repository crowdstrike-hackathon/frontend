# Riposte (frontend)

The console for Riposte, a provenance-based firewall for AI agent tool calls. You chat with Nova, a support
copilot, as a member of the support team. Every tool call it makes is shown alongside the firewall's
decision and the source of each argument.

## What you can do

- Talk to Nova, and type `@` to hand it a ticket or a customer. Tickets come from the backend's `tickets.json`; some were written by an attacker.
- Switch the defense between **Off**, **Keyword filter** and **Riposte**, and try the same message again to compare.
- See each tool call with its arguments tagged as trusted, from a ticket, ticket sender, or no source.
- Approve or deny calls that Riposte holds for a person.
- See what actually left the sandbox, and reopen past conversations from the history list in the sidebar.

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
  api.js                 fetch client, token storage, EventSource for chat streams
  lib/chat.js            folds a conversation's server-sent events into the chat view
  pages/Console.js       the chat console
  pages/Landing.js       landing page
  components/chat/       history list, thread, tool-call cards, composer, side panel
  components/ui/         shadcn components
  ui/aceternity/         Aceternity components
```
