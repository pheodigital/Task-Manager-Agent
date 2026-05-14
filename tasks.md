# Email Task Manager Agent — Task Tracker

Status: `[ ]` not started · `[x]` done · `[~]` in progress

---

## Phase 1 — Project Setup & Configuration

- [x] Create root scaffolding: CLAUDE.md, tasks.md, plan.md
- [x] Create `email-task-agent/` folder structure
- [x] Write `backend/package.json`
- [x] Write `backend/tsconfig.json`
- [x] Write `frontend/package.json` (next 15, react 19)
- [x] Write `frontend/tsconfig.json`
- [x] Write `frontend/next.config.ts`
- [x] Write `email-task-agent/.env.example`
- [x] Write `email-task-agent/.gitignore`
- [x] Write `email-task-agent/docker-compose.yml`
- [x] Write `email-task-agent/README.md`

> **Commit:** `chore: initialise project scaffold and configuration`
>
> **Description:**
> Set up the full monorepo structure for the Email Task Manager Agent.
> Creates backend (Express + TypeScript) and frontend (Next.js 15 + React 19) project configs,
> environment variable templates, .gitignore, docker-compose for local Ollama, and README.
> No application logic yet — foundation only.

---

## Phase 2 — LLM Configuration

- [x] Implement `backend/src/llm/config.ts`
  - `getLLMInstance()` reads `LLM_PROVIDER` env var
  - Returns `ChatAnthropic` or `ChatOllama`
  - Descriptive error if misconfigured

> **Commit:** `feat: add LLM abstraction layer supporting Ollama and Claude`
>
> **Description:**
> Implements `getLLMInstance()` in `backend/src/llm/config.ts`.
> Reads `LLM_PROVIDER` env var and returns either `ChatOllama` (default: `qwen3:4b`)
> or `ChatAnthropic` (Claude). Throws a descriptive error for unknown providers.
> All agent nodes use this function — no LLM is ever instantiated directly.

---

## Phase 3 — State & Types

- [x] Define `backend/src/types/index.ts` — Email, Task, CalendarEvent, AgentResult, AgentStatus
- [x] Implement `backend/src/agent/state.ts` — AgentState interface + reducer

> **Commit:** `feat: define shared types and LangGraph agent state`
>
> **Description:**
> Adds `Email`, `Task`, `CalendarEvent`, `AgentResult`, and `AgentStatus` interfaces
> in `backend/src/types/index.ts`. Implements `AgentStateAnnotation` using LangGraph's
> `Annotation.Root` API in `backend/src/agent/state.ts`, replacing the manual channels
> object. Exports `AgentState` type and `mergeState` helper for immutable state updates.

---

## Phase 4 — LangGraph Workflow

- [x] Implement `backend/src/agent/nodes.ts` — 4 node functions with try/catch
- [x] Implement `backend/src/agent/graph.ts` — StateGraph wiring + compile

> **Commit:** `feat: implement 4-node LangGraph workflow`
>
> **Description:**
> Adds the core agentic pipeline in `backend/src/agent/`:
> - `nodes.ts` — `fetchEmailsNode`, `analyzeTasksNode`, `createEventsNode`, `sendSummaryNode`,
>   each with input validation, try/catch error handling, and immutable state updates.
> - `graph.ts` — `buildAgentGraph()` wires nodes using the fluent `StateGraph` builder
>   (fully chained `addNode` calls required for TypeScript to resolve node name types),
>   with conditional edges that short-circuit to END on any error state.

---

## Phase 5 — LangChain Tools

- [x] Implement `backend/src/agent/tools.ts` — read_emails, create_event, send_email with Zod schemas
- [x] Wire tools into nodes

> **Commit:** `feat: add LangChain tools for email and calendar operations`
>
> **Description:**
> Defines `readEmailsTool`, `createEventTool`, and `sendEmailTool` in
> `backend/src/agent/tools.ts` using LangChain's `tool()` helper with Zod v4 schemas
> (imported from `zod/v4` to avoid TypeScript deep instantiation errors with Zod 3.25+).
> Each tool includes documented MCP integration hook points for future Gmail/Calendar wiring.

---

## Phase 6 — Express Server

- [x] Implement `backend/src/routes/agent.ts` — run + status endpoints
- [x] Implement `backend/src/index.ts` — Express app, CORS, error middleware
- [x] Implement `backend/src/mcp/client.ts` — stub with documented hook points

> **Commit:** `feat: add Express server with agent run and status endpoints`
>
> **Description:**
> Sets up the Express backend in `backend/src/index.ts` with CORS, JSON middleware,
> pino structured logging, and a global error handler. Adds `POST /api/agent/run`
> and `GET /api/agent/status` in `backend/src/routes/agent.ts`. Adds `backend/src/mcp/client.ts`
> with mock data stubs and commented MCP endpoint references for future real integration.

---

## Phase 7 — Next.js 15 Frontend (App Router)

- [x] Write `frontend/package.json` (next 15, react 19, typescript)
- [x] Write `frontend/tsconfig.json` (moduleResolution: bundler, @/* path alias)
- [x] Write `frontend/next.config.ts`
- [x] Implement `frontend/src/app/layout.tsx` — RootLayout + metadata
- [x] Implement `frontend/src/app/page.tsx` — home page → renders Dashboard
- [x] Implement `frontend/src/types/index.ts`
- [x] Implement `frontend/src/api/client.ts` — axios wrapper (NEXT_PUBLIC_API_BASE_URL)
- [x] Implement `frontend/src/components/Dashboard.tsx` — 'use client'
- [x] Implement `frontend/src/components/TaskList.tsx` — 'use client'
- [x] Implement `frontend/src/components/Summary.tsx` — 'use client'

> **Commit:** `feat: build Next.js 15 frontend dashboard with App Router`
>
> **Description:**
> Migrates frontend from Create React App to Next.js 15 with React 19 and the App Router.
> Adds `layout.tsx` (RootLayout + metadata) and `page.tsx` as the entry point.
> Interactive components (`Dashboard`, `TaskList`, `Summary`) are marked `'use client'`
> since they use React hooks. API client uses `NEXT_PUBLIC_API_BASE_URL` env var.
> All imports use the `@/*` path alias configured in `tsconfig.json`.

---

## Phase 8 — Integration & Verification

- [ ] Manual test: backend starts, `POST /api/agent/run` returns valid JSON
- [ ] Manual test: switch `LLM_PROVIDER=ollama` — same response shape
- [ ] Manual test: frontend loads, "Run Agent" button shows results
- [ ] Manual test: invalid `LLM_PROVIDER` shows graceful error

---

## Fixes & Housekeeping

- [x] Fix TypeScript errors in `graph.ts` — chain `addNode` calls, use `START` instead of `setEntryPoint`
- [x] Fix TypeScript deep instantiation error in `tools.ts` — switch to `zod/v4` and `tool()` helper
- [x] Create `backend/.env`, `frontend/.env`, `frontend/.env.local` with Ollama defaults
- [x] Update `.gitignore` — add `.env.local`, `.env.*.local`, `.claude/settings.local.json`
- [x] Update `README.md` — full local dev guide with curl examples and expected responses

> **Commit:** `fix: resolve TypeScript errors and complete local dev setup`
>
> **Description:**
> Fixes two TypeScript compilation errors:
> (1) `graph.ts` — fully chains `StateGraph` builder calls so node names are accumulated
> in the `N` type parameter before edges are added; replaces `setEntryPoint` with `addEdge(START, ...)`.
> (2) `tools.ts` — switches Zod import to `zod/v4` and uses `tool()` helper to avoid
> excessively deep type instantiation with Zod 3.25+ and LangChain 0.3.
> Also creates all required `.env` files pre-filled for local Ollama (`qwen3:4b`),
> hardens `.gitignore`, and rewrites README with step-by-step startup and curl test guide.
