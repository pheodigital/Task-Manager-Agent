# Email Task Manager Agent

An agentic AI that reads emails, extracts action items, creates calendar events, and delivers a
written summary — all driven by a LangGraph state machine on the backend.

---

## Quick start

```bash
# Terminal 1 — backend
cd email-task-agent/backend
npm install
npm run dev
# → Server started on port 5000

# Terminal 2 — frontend
cd email-task-agent/frontend
npm install
npm run dev
# → Next.js ready on http://localhost:3000
```

Open **http://localhost:3000**, click **Run Agent**, and the full pipeline executes automatically.

---

## How it works — full call flow

### 1. User clicks "Run Agent" in the browser

`Dashboard.tsx` calls `runAgent()` from `frontend/src/api/client.ts`, which sends:

```
POST http://localhost:5000/api/agent/run
```

---

### 2. Express receives the request

`backend/src/index.ts` mounts the router:

```
app.use('/api/agent', agentRouter)   ← backend/src/routes/agent.ts
```

`routes/agent.ts → POST /run` checks that no agent is already running, then:

```typescript
currentState = { ...initialState, status: 'running' };
const graph = buildAgentGraph();               // ← graph.ts
const finalState = await graph.invoke(currentState);
```

---

### 3. LangGraph executes the pipeline

`backend/src/agent/graph.ts` builds a four-node state machine:

```
START
  │
  ▼
fetch_emails ──(error?)──► END
  │
  ▼
analyze ─────(error?)──► END
  │
  ▼
create_events ──(error?)──► END
  │
  ▼
send_summary
  │
  ▼
 END
```

Each arrow labelled `(error?)` is a conditional edge: if any node sets
`state.status = 'error'` the graph short-circuits to END immediately.

---

### 4. Node-by-node execution

#### Node 1 — `fetch_emails`  →  `fetchEmailsNode()`  (`nodes.ts:10`)

```
fetchEmailsNode()
  └─ getMockEmails(10)           ← mcp/client.ts:7
       returns 3 hardcoded Email objects
  └─ mergeState(state, { emails, status: 'running' })
```

**State after:** `emails = [3 Email objects]`

> In production: replace `getMockEmails` with a real Gmail API call using the
> OAuth credentials in `backend/.env`.

---

#### Node 2 — `analyze`  →  `analyzeTasksNode()`  (`nodes.ts:22`)

```
analyzeTasksNode()
  └─ getLLMInstance()            ← llm/config.ts:6
       reads LLM_PROVIDER env var → returns ChatOllama or ChatAnthropic
  └─ builds a prompt from state.emails
  └─ llm.invoke([HumanMessage(prompt)])
       LLM returns a JSON array of Task objects
  └─ JSON.parse → tasks[]
  └─ mergeState(state, { tasks })
```

**State after:** `tasks = [{ id, title, description, dueDate, startTime, priority, source }]`

The LLM decides what counts as an action item and assigns `priority: "high" | "medium" | "low"`.

---

#### Node 3 — `create_events`  →  `createEventsNode()`  (`nodes.ts:64`)

```
createEventsNode()
  └─ filters tasks where dueDate is set
  └─ for each such task:
       createCalendarEvent({ title, date, startTime })   ← mcp/client.ts:35
         returns { eventId }
       builds CalendarEvent object using the returned eventId
  └─ mergeState(state, { events })
```

**State after:** `events = [CalendarEvent objects with real eventIds]`

> In production: `createCalendarEvent` will POST to the Google Calendar API
> using credentials in `backend/.env` and return the real Google event ID.

---

#### Node 4 — `send_summary`  →  `sendSummaryNode()`  (`nodes.ts:89`)

```
sendSummaryNode()
  └─ getLLMInstance()
  └─ builds a prompt listing all tasks and events
  └─ llm.invoke([HumanMessage(prompt)])
       LLM writes a professional summary email (≤ 150 words)
  └─ sendEmail({ to: GMAIL_USER_EMAIL, subject, body })  ← mcp/client.ts:44
       returns { messageId }
  └─ mergeState(state, { summary, status: 'completed' })
```

**State after:** `status = 'completed'`, `summary = "Here is your task summary: ..."`

> In production: `sendEmail` will call the Gmail API to deliver the summary
> to the address set in `GMAIL_USER_EMAIL`.

---

### 5. Response flows back to the UI

`routes/agent.ts` receives `finalState` from the graph and returns:

```json
{
  "status": "completed",
  "emails": [
    { "id": "1", "from": "john@example.com", "subject": "Project update needed", ... }
  ],
  "tasks": [
    { "id": "task-1", "title": "Send Q3 report", "priority": "high", "dueDate": "2026-05-16", "source": "1" },
    { "id": "task-2", "title": "Team meeting", "priority": "medium", "dueDate": "2026-05-12", "startTime": "14:00", "source": "2" },
    { "id": "task-3", "title": "Review contract", "priority": "medium", "source": "3" }
  ],
  "events": [
    { "id": "mock-event-1715000000001", "title": "Send Q3 report", "date": "2026-05-16", "taskId": "task-1" },
    { "id": "mock-event-1715000000002", "title": "Team meeting", "date": "2026-05-12", "startTime": "14:00", "taskId": "task-2" }
  ],
  "summary": "Here is your task summary:\n\nThree action items were identified...",
  "completedAt": "2026-05-11T10:23:45.000Z"
}
```

`Dashboard.tsx` renders:
- **Extracted Tasks** — priority-coloured badges, due date, description
- **Calendar Events Created** — each event with date/time
- **Summary Email** — the LLM-written text that was (mock-)sent

---

## File map

```
email-task-agent/
├── backend/
│   └── src/
│       ├── index.ts              Express app, CORS, global error handler
│       ├── routes/
│       │   └── agent.ts          POST /run · GET /status
│       ├── agent/
│       │   ├── graph.ts          buildAgentGraph() — 4-node LangGraph pipeline
│       │   ├── nodes.ts          fetchEmailsNode · analyzeTasksNode · createEventsNode · sendSummaryNode
│       │   ├── state.ts          AgentStateAnnotation · initialState · mergeState()
│       │   └── tools.ts          LangChain tool definitions (for future ReAct agent mode)
│       ├── llm/
│       │   └── config.ts         getLLMInstance() — Ollama or Claude depending on LLM_PROVIDER
│       ├── mcp/
│       │   └── client.ts         getMockEmails · createCalendarEvent · sendEmail (stubs → real MCP)
│       └── types/
│           └── index.ts          Email · Task · CalendarEvent · AgentStatus · AgentResult
└── frontend/
    └── src/
        ├── app/
        │   ├── layout.tsx        HTML shell, metadata
        │   └── page.tsx          Renders <Dashboard />
        ├── components/
        │   ├── Dashboard.tsx     Run button, loading state, error display
        │   ├── TaskList.tsx      Renders extracted tasks with priority badges
        │   └── Summary.tsx       Renders calendar events + summary email text
        ├── api/
        │   └── client.ts         runAgent() · getAgentStatus() — axios wrappers
        └── types/
            └── index.ts          Frontend-side type mirrors of backend interfaces
```

---

## Key design decisions

| Decision | Why |
|---|---|
| LangGraph state machine | Each node is independently testable; conditional edges allow clean error short-circuiting without try/catch chains across the pipeline |
| `mergeState()` instead of mutation | LangGraph reducers expect a new object; mutating state directly causes silent reducer conflicts |
| All node chains before all edges in `graph.ts` | TypeScript needs to see all node names before it can validate edge targets — mixing order breaks type inference |
| `zod/v4` not `zod` | Avoids a TypeScript deep-instantiation error triggered by LangChain 0.3+ when using the standard `zod` import |
| `tool()` helper not `new DynamicStructuredTool()` | `tool()` is the current LangChain 0.3 API; `DynamicStructuredTool` is deprecated |
| `tools.ts` kept alongside `nodes.ts` | Nodes implement the current sequential graph; tools implement the same actions as LangChain tools so a future ReAct loop can replace the graph with a single `createReactAgent()` call |

---

## Environment variables

All variables live in `backend/.env` (copy from `.env.example`).

| Variable | Default | Required for |
|---|---|---|
| `LLM_PROVIDER` | `ollama` | Always |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama mode |
| `OLLAMA_MODEL` | `qwen3:4b` | Ollama mode |
| `CLAUDE_API_KEY` | — | Claude mode |
| `CLAUDE_MODEL` | `claude-sonnet-4-6` | Claude mode |
| `PORT` | `5000` | Always |
| `FRONTEND_URL` | `http://localhost:3000` | CORS |
| `GMAIL_USER_EMAIL` | `user@example.com` | Summary email recipient |
| `MCP_GMAIL_ENDPOINT` | `http://localhost:3000` | Real Gmail (future) |
| `MCP_CALENDAR_ENDPOINT` | `http://localhost:3001` | Real Calendar (future) |
| `GMAIL_CLIENT_ID` | — | Real Gmail OAuth |
| `GMAIL_CLIENT_SECRET` | — | Real Gmail OAuth |
| `GMAIL_REFRESH_TOKEN` | — | Real Gmail OAuth |
| `GOOGLE_CALENDAR_CLIENT_ID` | — | Real Calendar OAuth |
| `GOOGLE_CALENDAR_CLIENT_SECRET` | — | Real Calendar OAuth |
| `GOOGLE_CALENDAR_REFRESH_TOKEN` | — | Real Calendar OAuth |
| `GOOGLE_CALENDAR_ID` | `primary` | Real Calendar |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:5000` | Frontend → backend URL |

---

## Connecting real Gmail & Google Calendar

The three MCP functions in `backend/src/mcp/client.ts` are stubs.
Each has a comment marking the exact line to replace with a real API call.

1. Create a Google Cloud project and enable **Gmail API** and **Google Calendar API**
2. Create OAuth 2.0 credentials (Web application, redirect URI `http://localhost:5000/auth/callback`)
3. Complete the OAuth flow to get a refresh token
4. Fill in the `GMAIL_*` and `GOOGLE_CALENDAR_*` variables in `backend/.env`
5. Replace the stub implementations in `mcp/client.ts` with real `axios` calls to the Google APIs

See `email-task-agent/README.md` §10 for the full step-by-step OAuth walkthrough.

---

## API reference

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Liveness check — returns `{ ok: true }` |
| `POST` | `/api/agent/run` | Runs the full pipeline and returns `AgentResult` |
| `GET` | `/api/agent/status` | Returns current status and counts without re-running |

---

## LLM switching

Edit `backend/.env`:

```env
# Use local Ollama (default)
LLM_PROVIDER=ollama
OLLAMA_MODEL=qwen3:4b

# Switch to Claude
LLM_PROVIDER=claude
CLAUDE_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-sonnet-4-6
```

Restart the backend — no code changes required.
