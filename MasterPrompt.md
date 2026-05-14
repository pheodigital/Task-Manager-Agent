Complete Master Prompt for Email Task Manager Agent
Save this and use it with Claude locally. This incorporates everything we've discussed.

# Email Task Manager Agent - Complete Development Guide

## PROJECT OVERVIEW

You are helping build a production-ready Email Task Manager Agent with the following specifications:

**Purpose**: An AI agent that reads emails, extracts action items, creates calendar events, and sends summaries.

**Tech Stack**:

- Frontend: React + TypeScript
- Backend: Node.js + Express + TypeScript
- Agent Framework: LangChain + LangGraph (TypeScript)
- LLM Support: Ollama (local) AND Claude API (swappable)
- Integrations: MCP servers for Gmail and Google Calendar
- Deployment: Local development first, cloud-ready architecture

**Key Principle**: LLM provider agnostic - code must work with any LLM (Ollama, Claude, others) without changing application logic.

---

## WORKFLOW DESCRIPTION

The agent executes in 4 sequential steps:

1. **Fetch Emails** - Retrieve unread/recent emails from Gmail
2. **Analyze Tasks** - LLM extracts action items from email content
3. **Create Calendar Events** - Create calendar entries for identified tasks
4. **Send Summary** - Email user a summary of what was processed

Data flows:
User Email → Extract Tasks → Create Events → Send Summary → Done

---

## PROJECT STRUCTURE

email-task-agent/
│
├── backend/
│ ├── src/
│ │ ├── agent/
│ │ │ ├── graph.ts # LangGraph workflow definition
│ │ │ ├── state.ts # Type-safe state definitions
│ │ │ ├── nodes.ts # Individual node implementations
│ │ │ └── tools.ts # LangChain tool definitions
│ │ │
│ │ ├── llm/
│ │ │ └── config.ts # LLM initialization (Ollama/Claude)
│ │ │
│ │ ├── mcp/
│ │ │ └── client.ts # MCP client wrapper
│ │ │
│ │ ├── routes/
│ │ │ └── agent.ts # Express API endpoints
│ │ │
│ │ ├── types/
│ │ │ └── index.ts # Shared TypeScript types
│ │ │
│ │ └── index.ts # Server entry point
│ │
│ ├── package.json # Dependencies
│ ├── tsconfig.json # TypeScript config
│ └── .env.example # Environment variables
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ │ ├── Dashboard.tsx # Main agent control panel
│ │ │ ├── TaskList.tsx # Display extracted tasks
│ │ │ └── Summary.tsx # Display agent results
│ │ │
│ │ ├── types/
│ │ │ └── index.ts # Frontend types
│ │ │
│ │ ├── App.tsx # Root component
│ │ └── index.tsx # Entry point
│ │
│ ├── package.json
│ └── tsconfig.json
│
├── .gitignore
├── README.md
└── docker-compose.yml # For local Ollama + services

---

## TECHNICAL REQUIREMENTS

### Backend Requirements

1. **LLM Abstraction Layer**
   - Support Ollama (ChatOllama from @langchain/community)
   - Support Claude API (ChatAnthropic from @langchain/anthropic)
   - Swap via environment variable (LLM_PROVIDER=ollama or claude)
   - Graceful fallback if service unavailable

2. **LangGraph Workflow**
   - Define 4 nodes (fetch_emails, analyze_tasks, create_events, send_summary)
   - Implement state machine with proper transitions
   - Include error handling at each node
   - Support streaming responses (optional but nice)

3. **LangChain Tools**
   - Tool definitions for: read_emails, create_event, send_email
   - Proper input/output schemas
   - Initially mock external services
   - Ready for MCP integration

4. **State Management**
   - Type-safe state using TypeScript interfaces
   - State reducer functions for immutable updates
   - Proper state typing throughout graph

5. **Express Server**
   - POST /api/agent/run endpoint to trigger workflow
   - GET /api/agent/status endpoint for current state
   - Error handling middleware
   - CORS configured for frontend
   - Environment variable configuration

6. **Error Handling**
   - Graceful failures when services unavailable
   - Detailed error messages in responses
   - Logging strategy
   - Retry logic for transient failures

### Frontend Requirements

1. Dashboard component with:
   - "Run Agent" button
   - Loading state during execution
   - Display extracted tasks
   - Show created calendar events
   - Display summary email
   - Error display

2. Types and interfaces matching backend

3. API client wrapper for agent endpoints

---

## DEVELOPMENT PHASES

### Phase 1: Project Setup & Configuration

- Initialize Node.js backend with Express + TypeScript
- Initialize React frontend with TypeScript
- Configure package.json with all dependencies
- Setup TypeScript configs
- Create environment variable templates
- Document setup instructions

### Phase 2: LLM Configuration

- Create flexible LLM config supporting Ollama and Claude
- Implement provider switching logic
- Add error handling for unavailable services
- Create examples for both providers
- Document configuration options

### Phase 3: State & Types

- Define AgentState interface
- Define individual task/event types
- Create state reducer functions
- Ensure type safety throughout
- Document state transitions

### Phase 4: LangGraph Graph

- Implement state graph with 4 nodes
- Define node functions with proper implementations
- Setup state transitions and edges
- Add error handling per node
- Test graph locally with mock data

### Phase 5: LangChain Tools

- Create tool definitions
- Implement input/output schemas
- Add mock implementations
- Document where MCP integration happens
- Create tool testing strategies

### Phase 6: Express Server

- Setup Express app with middleware
- Create /api/agent/run endpoint
- Create /api/agent/status endpoint
- Add error handling middleware
- Configure CORS
- Add logging

### Phase 7: React Dashboard

- Create Dashboard component
- Implement API client
- Add loading states
- Display results
- Handle errors
- Style component

### Phase 8: Integration & Testing

- Test full workflow end-to-end
- Test with both Ollama and Claude
- Handle edge cases
- Document testing approach
- Create deployment guide

---

## IMPLEMENTATION GUIDELINES

### Code Style

- Use TypeScript with strict mode
- Avoid `any` types
- Use interfaces for all data structures
- Add JSDoc comments for complex functions
- Document LangGraph concepts in code

### Error Handling Strategy

Each node should:

Validate inputs
Try to execute
Catch errors gracefully
Log errors with context
Return meaningful error state

### LLM Provider Abstraction

```typescript
// Should work like this:
const llm = getLLMInstance(); // Returns ChatOllama or ChatAnthropic
// Rest of code doesn't care which one
const response = await llm.invoke(prompt);
```

### State Management Pattern

```typescript
// State should be immutable
const newState = {
  ...previousState,
  emails: [...previousState.emails, newEmail],
  tasks: [...previousState.tasks, ...extractedTasks],
};
```

### Tool Definition Pattern

```typescript
// Tools should have clear schemas
const tool = new Tool({
  name: "read_emails",
  description: "Read emails from Gmail inbox",
  schema: z.object({
    maxResults: z.number().default(10),
    unreadOnly: z.boolean().default(true),
  }),
  func: async (input) => {
    /* implementation */
  },
});
```

---

## DEPENDENCIES OVERVIEW

### Backend Key Packages

Core:

express ^4.18.0
typescript ^5.0.0
dotenv ^16.0.0

LangChain & LangGraph:

langchain ^0.1.0
@langchain/core ^0.1.0
@langchain/langgraph ^0.0.x
@langchain/community ^0.0.x

LLM Support:

@langchain/anthropic ^0.0.x (for Claude)

Utilities:

zod ^3.22.0 (for schemas)
pino ^8.0.0 (for logging)
axios ^1.6.0 (for HTTP calls)

Dev:

ts-node ^10.0.0
nodemon ^3.0.0
@types/node ^20.0.0
@types/express ^4.17.0

### Frontend Key Packages

react ^18.0.0
typescript ^5.0.0
axios ^1.6.0 (for API calls)
react-hooks (built-in)

---

## ENVIRONMENT VARIABLES

```env
# LLM Configuration
LLM_PROVIDER=ollama              # or 'claude'
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral             # or llama2, neural-chat, etc.

CLAUDE_API_KEY=your_api_key_here
CLAUDE_MODEL=claude-opus-4-20250514

# Server Configuration
PORT=5000
NODE_ENV=development

# MCP Configuration (future)
MCP_GMAIL_ENDPOINT=http://localhost:3000
MCP_CALENDAR_ENDPOINT=http://localhost:3001

# Frontend Configuration
REACT_APP_API_BASE_URL=http://localhost:5000
```

---

## MOCK DATA FOR DEVELOPMENT

For initial testing without MCP servers:

```typescript
// Mock email data
const mockEmails = [
  {
    id: "1",
    from: "john@example.com",
    subject: "Project update needed",
    body: "Can you send me the Q3 report by Friday?",
    timestamp: new Date(),
  },
  {
    id: "2",
    from: "manager@example.com",
    subject: "Team meeting",
    body: "Let's meet tomorrow at 2 PM to discuss the roadmap",
    timestamp: new Date(),
  },
];

// Mock extracted tasks
const mockTasks = [
  {
    id: "task-1",
    title: "Send Q3 report",
    dueDate: "2026-05-10",
    priority: "high",
    source: "email-1",
  },
  {
    id: "task-2",
    title: "Team meeting - roadmap discussion",
    dueDate: "2026-05-09",
    startTime: "14:00",
    priority: "medium",
    source: "email-2",
  },
];
```

---

## TESTING STRATEGY

1. **Unit Tests**
   - Test individual nodes with mock state
   - Test tool schemas and validation
   - Test LLM configuration switching

2. **Integration Tests**
   - Test full graph with mock data
   - Test state transitions
   - Test error scenarios

3. **E2E Tests**
   - Test full flow from UI button to results
   - Test with both Ollama and Claude
   - Test error handling

4. **Manual Testing Checklist**

Frontend button triggers agent
Agent with Ollama completes successfully
Agent with Claude completes successfully
Mock emails are processed
Tasks are extracted correctly
Calendar events appear in response
Summary is generated
Errors are displayed gracefully

---

## DEPLOYMENT READINESS

Before production:

- [ ] Environment variables properly configured
- [ ] Error handling comprehensive
- [ ] Logging in place
- [ ] Both LLM providers tested
- [ ] MCP integration documented
- [ ] Docker configuration ready
- [ ] Database (if needed) configured
- [ ] API rate limiting implemented
- [ ] CORS properly secured
- [ ] Input validation on all endpoints

---

## FUTURE ENHANCEMENTS

1. Real MCP server integration (Gmail, Calendar)
2. Scheduled execution (cron jobs)
3. Database for task history
4. User authentication
5. Multiple email accounts
6. Task prioritization
7. Email template customization
8. Webhook support
9. Analytics dashboard
10. Mobile app

---

## HELPFUL RESOURCES

**LangChain JS Documentation:**

- https://js.langchain.com/

**LangGraph Documentation:**

- https://langchain-ai.github.io/langgraphjs/

**TypeScript Guide:**

- https://www.typescriptlang.org/docs/

**Express TypeScript:**

- https://expressjs.com/

**Ollama:**

- https://ollama.ai/

---

## CURRENT DECISION LOG

✅ **Decided**: TypeScript (not Python)

- Reason: Single stack with React + Node.js

✅ **Decided**: LangChain + LangGraph in TypeScript

- Reason: Native support, type safety, easier deployment

❓ **TBD**: Ollama vs Claude API

- Will support both with environment variable switching
- Start with whichever you prefer

❓ **TBD**: Scheduled vs On-demand execution

- Will start with on-demand (button click)
- Can add scheduled execution later

❓ **TBD**: Real MCP servers

- Will mock initially
- Ready for integration later

---

## HOW TO USE THIS PROMPT

This is your master reference. For specific implementations, ask:

**Example questions to ask Claude locally:**

1. "Give me the complete backend package.json and tsconfig.json setup"
2. "Create src/llm/config.ts that supports both Ollama and Claude with provider switching"
3. "Define src/agent/state.ts with all TypeScript interfaces for the email agent"
4. "Implement src/agent/graph.ts - the complete LangGraph workflow with 4 nodes"
5. "Create src/agent/tools.ts with LangChain tool definitions for email/calendar"
6. "Build src/routes/agent.ts Express endpoints for /api/agent/run and /api/agent/status"
7. "Create the React Dashboard.tsx component with agent controls and results display"
8. "Give me the server entry point src/index.ts with Express setup"
9. "Create .env.example with all required environment variables"
10. "Give me integration testing strategy and test examples"

Then for each response, ask follow-up questions to refine the code.

---

## QUICK START CHECKLIST

- [ ] Understand project structure
- [ ] Understand workflow (4 nodes)
- [ ] Understand LLM abstraction requirement
- [ ] Understand TypeScript throughout
- [ ] Understand state management approach
- [ ] Ready to build Phase 1 (Setup)

**Next Step**: Tell me which phase you want to tackle first!

How to Use This

Save it as MASTER_PROMPT.md or copy it
Reference sections when asking Claude locally
Ask specific questions based on each phase
Keep iterating through all 8 phases

Example usage:
Me: "I'm building the Email Task Manager Agent.
Let's start with Phase 1: Project Setup.

[Insert MASTER_PROMPT Phase 1 section here]

Give me complete package.json, tsconfig.json, and setup instructions."
