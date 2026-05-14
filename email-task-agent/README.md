# Email Task Manager Agent

An agentic AI that reads emails, extracts action items, creates calendar events, and sends summaries.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm v9 or later
- [Ollama](https://ollama.ai/) running locally **or** an Anthropic Claude API key

---

## Project Structure

```
email-task-agent/
├── backend/    Express API + LangGraph agent (port 5000)
├── frontend/   Next.js 15 dashboard (port 3000)
├── .env        Root env reference (not loaded directly by apps)
└── .env.example
```

---

## 1. Environment Setup

All `.env` files are already created and pre-filled for local Ollama development.

| File | Loaded by |
|------|-----------|
| `backend/.env` | Backend (`dotenv`) |
| `frontend/.env` | Next.js (base) |
| `frontend/.env.local` | Next.js (overrides `.env`) |

To switch to Claude instead of Ollama, edit `backend/.env`:
```env
LLM_PROVIDER=claude
CLAUDE_API_KEY=your_api_key_here
```

---

## 2. Start the Backend

```bash
cd email-task-agent/backend

# Install dependencies (first time only)
npm install

# Start in development mode (auto-restarts on file changes)
npm run dev
```

Expected output:
```
{"level":30,"name":"server","port":5000,"llmProvider":"ollama","msg":"Server started"}
```

The backend is ready at **http://localhost:5000**

---

## 3. Start the Frontend

Open a **new terminal tab**, then:

```bash
cd email-task-agent/frontend

# Install dependencies (first time only)
npm install

# Start Next.js dev server
npm run dev
```

Expected output:
```
▲ Next.js 15.x.x
- Local: http://localhost:3000
```

Open **http://localhost:3000** in your browser.

---

## 4. Test Locally

### A. Test via the UI

1. Open **http://localhost:3000**
2. Click **"Run Agent"**
3. Watch the progress message: `Fetching emails → Analyzing tasks → Creating events → Generating summary...`
4. Results appear below the button:
   - **Extracted Tasks** — with priority badges
   - **Calendar Events Created**
   - **Summary Email**

> **Note:** By default the agent uses mock email data. See Section 10 to connect real Gmail.

### B. Test via curl (backend only)

**Trigger the agent workflow:**
```bash
curl -X POST http://localhost:5000/api/agent/run \
  -H "Content-Type: application/json" | python3 -m json.tool
```

Expected response shape:
```json
{
  "status": "completed",
  "emails": [...],
  "tasks": [
    { "id": "task-1", "title": "Send Q3 report", "priority": "high", "dueDate": "2026-05-10" },
    ...
  ],
  "events": [...],
  "summary": "Here is your task summary: ...",
  "completedAt": "2026-05-08T..."
}
```

**Check agent status:**
```bash
curl http://localhost:5000/api/agent/status | python3 -m json.tool
```

Expected response:
```json
{
  "status": "completed",
  "emailCount": 3,
  "taskCount": 3,
  "eventCount": 2,
  "error": null
}
```

**Health check:**
```bash
curl http://localhost:5000/health
# {"ok":true}
```

### C. Test LLM provider switch

1. Edit `backend/.env` → set `LLM_PROVIDER=claude` and fill in `CLAUDE_API_KEY`
2. Restart the backend (`Ctrl+C` then `npm run dev`)
3. Re-run the curl above — response shape should be identical

---

## 5. API Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Server health check |
| POST | `/api/agent/run` | Trigger full workflow (emails → tasks → events → summary) |
| GET | `/api/agent/status` | Current agent status and counts |

---

## 6. LLM Configuration

| `LLM_PROVIDER` | Provider | Required env vars |
|----------------|----------|-------------------|
| `ollama` (default) | Local Ollama | `OLLAMA_BASE_URL`, `OLLAMA_MODEL` |
| `claude` | Anthropic API | `CLAUDE_API_KEY`, `CLAUDE_MODEL` |

Current default: **Ollama with `qwen3:4b`** at `http://localhost:11434`

---

## 7. Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `LLM_PROVIDER` | `ollama` | `claude` or `ollama` |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `qwen3:4b` | Model name |
| `CLAUDE_API_KEY` | — | Anthropic API key (only for claude) |
| `CLAUDE_MODEL` | `claude-sonnet-4-6` | Claude model name |
| `PORT` | `5000` | Backend port |
| `NODE_ENV` | `development` | Node environment |
| `MCP_GMAIL_ENDPOINT` | `http://localhost:3000` | Gmail MCP server URL |
| `MCP_CALENDAR_ENDPOINT` | `http://localhost:3001` | Calendar MCP server URL |
| `GMAIL_CLIENT_ID` | — | Google OAuth client ID (real Gmail only) |
| `GMAIL_CLIENT_SECRET` | — | Google OAuth client secret (real Gmail only) |
| `GMAIL_REFRESH_TOKEN` | — | Gmail OAuth refresh token (real Gmail only) |
| `GMAIL_USER_EMAIL` | — | Gmail address to read from |
| `GOOGLE_CALENDAR_CLIENT_ID` | — | Google OAuth client ID (real Calendar only) |
| `GOOGLE_CALENDAR_CLIENT_SECRET` | — | Google OAuth client secret (real Calendar only) |
| `GOOGLE_CALENDAR_REFRESH_TOKEN` | — | Calendar OAuth refresh token (real Calendar only) |
| `GOOGLE_CALENDAR_ID` | `primary` | Calendar ID to write events to |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:5000` | Backend URL (frontend) |

---

## 8. Agent Workflow

```
fetchEmails → analyzeTasks → createEvents → sendSummary
```

| Node | What it does |
|------|-------------|
| `fetchEmails` | Loads emails via `getMockEmails()` — replace stub with real Gmail call |
| `analyzeTasks` | Sends emails to LLM, extracts action items as a JSON `Task[]` array |
| `createEvents` | Calls `createCalendarEvent()` for every task that has a due date |
| `sendSummary` | Asks LLM to write a summary, calls `sendEmail()` to deliver it, marks workflow complete |

Each node returns early if `state.status === 'error'`, so a failure in any node
short-circuits the rest of the graph without crashing the process.

---

## 9. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript (App Router) |
| Backend | Node.js, Express, TypeScript |
| Agent | LangChain 0.3, LangGraph 0.2 |
| LLM | Ollama (`qwen3:4b`) or Claude API |
| Validation | Zod (v4 API) |
| Logging | pino |

---

## 10. Connecting Real Gmail & Google Calendar (MCP)

By default the agent uses hardcoded mock emails. Follow these steps to connect your real Gmail inbox and Google Calendar.

### Step 1 — Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (e.g. `email-task-agent`)
3. Enable the following APIs:
   - **Gmail API** — [enable here](https://console.cloud.google.com/apis/library/gmail.googleapis.com)
   - **Google Calendar API** — [enable here](https://console.cloud.google.com/apis/library/calendar-json.googleapis.com)

### Step 2 — Create OAuth 2.0 Credentials

1. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**
2. Application type: **Web application**
3. Add authorised redirect URI: `http://localhost:5000/auth/callback`
4. Note down your **Client ID** and **Client Secret**

### Step 3 — Get a Refresh Token

Run this one-time OAuth flow to get a refresh token:

```bash
# Install the Google auth helper
npm install -g @google-cloud/local-auth

# Or use this curl to start the OAuth flow manually:
# 1. Open this URL in your browser (replace YOUR_CLIENT_ID):
https://accounts.google.com/o/oauth2/auth?\
  client_id=YOUR_CLIENT_ID\
  &redirect_uri=http://localhost:5000/auth/callback\
  &response_type=code\
  &scope=https://www.googleapis.com/auth/gmail.readonly%20https://www.googleapis.com/auth/calendar\
  &access_type=offline\
  &prompt=consent

# 2. After approving, Google redirects to:
#    http://localhost:5000/auth/callback?code=AUTH_CODE

# 3. Exchange the code for tokens:
curl -X POST https://oauth2.googleapis.com/token \
  -d client_id=YOUR_CLIENT_ID \
  -d client_secret=YOUR_CLIENT_SECRET \
  -d redirect_uri=http://localhost:5000/auth/callback \
  -d grant_type=authorization_code \
  -d code=AUTH_CODE

# Response includes "refresh_token" — copy it, you only get it once
```

### Step 4 — Update backend/.env

Uncomment and fill in the MCP section in `backend/.env`:

```env
# Comment out the local stub:
# MCP_GMAIL_ENDPOINT=http://localhost:3000

# Uncomment and fill in real values:
MCP_GMAIL_ENDPOINT=https://your-mcp-gmail-server.com
GMAIL_CLIENT_ID=your_google_oauth_client_id
GMAIL_CLIENT_SECRET=your_google_oauth_client_secret
GMAIL_REDIRECT_URI=http://localhost:5000/auth/gmail/callback
GMAIL_REFRESH_TOKEN=your_gmail_refresh_token
GMAIL_USER_EMAIL=your@gmail.com

# Comment out the local stub:
# MCP_CALENDAR_ENDPOINT=http://localhost:3001

# Uncomment and fill in real values:
MCP_CALENDAR_ENDPOINT=https://your-mcp-calendar-server.com
GOOGLE_CALENDAR_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CALENDAR_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:5000/auth/calendar/callback
GOOGLE_CALENDAR_REFRESH_TOKEN=your_calendar_refresh_token
GOOGLE_CALENDAR_ID=primary
```

### Step 5 — Replace MCP stubs in the code

Open `backend/src/mcp/client.ts`. Each function has a comment marking where to add the real API call:

```typescript
// Replace this mock:
export async function getMockEmails(maxResults: number): Promise<Email[]> {
  // TODO: MCP call → process.env.MCP_GMAIL_ENDPOINT/emails?max=maxResults
  return mockEmails;
}

// With a real Gmail API call:
export async function getMockEmails(maxResults: number): Promise<Email[]> {
  const res = await axios.get(`${process.env.MCP_GMAIL_ENDPOINT}/emails`, {
    params: { max: maxResults },
    headers: { Authorization: `Bearer ${await getAccessToken()}` },
  });
  return res.data;
}
```

Similarly for `createCalendarEvent()` and `sendEmail()`.

### Step 6 — Verify

```bash
# Restart the backend
cd backend && npm run dev

# Trigger and check the response includes your real emails
curl -X POST http://localhost:5000/api/agent/run | python3 -m json.tool
```

---

## 11. Gmail OAuth Scopes Reference

| Scope | Purpose |
|-------|---------|
| `https://www.googleapis.com/auth/gmail.readonly` | Read emails |
| `https://www.googleapis.com/auth/gmail.send` | Send summary email |
| `https://www.googleapis.com/auth/calendar` | Create calendar events |
| `https://www.googleapis.com/auth/calendar.readonly` | Read existing events |
