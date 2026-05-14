# Email Task Manager Agent — Implementation Plan

## Context

Building a production-ready agentic AI that monitors emails, extracts action items, creates calendar events, and emails a summary. Defined by `MasterPrompt.md`. Both Claude API and Ollama are supported from day one via `LLM_PROVIDER` env var. All code lives under `email-task-agent/` subfolder. Frontend uses Next.js 15 with the App Router.

---

## Project Layout

```
Task-Manager-Agent/
  email-task-agent/        ← all code
  MasterPrompt.md          ← requirements reference
  CLAUDE.md                ← Claude Code project guidance
  tasks.md                 ← step-by-step task tracker (checkboxes)
  plan.md                  ← this file
```

### email-task-agent/ full structure

```
email-task-agent/
├── backend/
│   ├── src/
│   │   ├── agent/
│   │   │   ├── graph.ts        # LangGraph 4-node workflow
│   │   │   ├── state.ts        # AgentState interface + reducer
│   │   │   ├── nodes.ts        # fetchEmails, analyzeTasks, createEvents, sendSummary
│   │   │   └── tools.ts        # LangChain tool definitions
│   │   ├── llm/
│   │   │   └── config.ts       # getLLMInstance() → ChatOllama | ChatAnthropic
│   │   ├── mcp/
│   │   │   └── client.ts       # MCP client stub
│   │   ├── routes/
│   │   │   └── agent.ts        # POST /api/agent/run, GET /api/agent/status
│   │   ├── types/
│   │   │   └── index.ts        # Shared TypeScript types
│   │   └── index.ts            # Express entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/                   # Next.js 15 (App Router)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx      # RootLayout + metadata
│   │   │   └── page.tsx        # Home → renders Dashboard
│   │   ├── components/
│   │   │   ├── Dashboard.tsx   # 'use client' — Run Agent + results
│   │   │   ├── TaskList.tsx    # 'use client' — extracted tasks
│   │   │   └── Summary.tsx     # 'use client' — events + summary
│   │   ├── types/index.ts      # mirrors backend types
│   │   └── api/client.ts       # axios wrapper
│   ├── next.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── .env.example
├── .gitignore
├── README.md
└── docker-compose.yml
```

---

## 8 Development Phases

| Phase | Focus | Key Files |
|-------|-------|-----------|
| 1 | Project Setup | package.json, tsconfig.json, next.config.ts, .env.example, .gitignore, docker-compose.yml |
| 2 | LLM Config | `backend/src/llm/config.ts` |
| 3 | State & Types | `backend/src/types/index.ts`, `backend/src/agent/state.ts` |
| 4 | LangGraph | `backend/src/agent/nodes.ts`, `backend/src/agent/graph.ts` |
| 5 | LangChain Tools | `backend/src/agent/tools.ts` |
| 6 | Express Server | `backend/src/routes/agent.ts`, `backend/src/index.ts`, `backend/src/mcp/client.ts` |
| 7 | Next.js Frontend | All `frontend/src/` files |
| 8 | Integration | End-to-end testing |

---

## Key Design Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| LLM providers | Both Claude + Ollama | Swapped via `LLM_PROVIDER` — no app logic changes |
| Agent framework | LangChain + LangGraph (TS) | Type-safe, native TS support |
| Frontend | Next.js 15, App Router | Latest Next.js, server components by default, `'use client'` where hooks needed |
| Schema validation | Zod | Works natively with LangChain tool definitions |
| Logging | pino | Structured JSON, performant |
| Initial data | Mock | Build and test graph before real APIs |
| MCP | Stub client | Documented hook points for Gmail/Calendar |

---

## Core LLM Pattern

```typescript
// backend/src/llm/config.ts
export function getLLMInstance() {
  const provider = process.env.LLM_PROVIDER ?? 'claude';
  if (provider === 'claude') {
    return new ChatAnthropic({ model: process.env.CLAUDE_MODEL ?? 'claude-sonnet-4-6' });
  }
  if (provider === 'ollama') {
    return new ChatOllama({ baseUrl: process.env.OLLAMA_BASE_URL, model: process.env.OLLAMA_MODEL ?? 'mistral' });
  }
  throw new Error(`Unknown LLM_PROVIDER: ${provider}. Use 'claude' or 'ollama'.`);
}
```

---

## Agent Workflow (4 nodes)

```
fetchEmails → analyzeTasks → createEvents → sendSummary
```

Each node:
1. Validates input state
2. Executes (with mock data initially)
3. Catches errors gracefully
4. Returns updated state

---

## Verification Checklist

1. `cd email-task-agent/backend && npm run dev` — server starts on port 5000
2. `curl -X POST http://localhost:5000/api/agent/run` — returns JSON with tasks + events
3. Change `LLM_PROVIDER=ollama`, rerun — same response shape
4. `cd email-task-agent/frontend && npm run dev` — Next.js starts on port 3000
5. Open browser → Dashboard loads, click "Run Agent" → results display
6. Set `LLM_PROVIDER=bad` — verify graceful error response
