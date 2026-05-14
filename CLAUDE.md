# Email Task Manager Agent

Agentic AI — reads emails, extracts tasks, creates calendar events, sends summaries.

## Quick Reference

| Need | Go to |
|------|-------|
| How to run backend / frontend | `email-task-agent/README.md` §2–4 |
| Coding rules & TypeScript conventions | `.claude/rules/coding.md` |
| File layout & naming conventions | `.claude/rules/conventions.md` |
| Environment variables | `.claude/rules/env.md` |
| Agent workflow & nodes | `.claude/agents/email-task-agent.md` |
| LLM provider switching | `.claude/agents/llm-config.md` |
| Gmail MCP integration | `.claude/mcp/gmail.md` |
| Calendar MCP integration | `.claude/mcp/calendar.md` |
| MCP servers overview | `.claude/mcp/servers.md` |
| Pre-commit checks | `.claude/hooks/pre-commit.md` |
| Post-task checklist | `.claude/hooks/post-task.md` |
| Task progress & commit messages | `tasks.md` |
| Implementation plan | `plan.md` |

## Stack at a Glance

```
frontend/   Next.js 15 + React 19 + TypeScript   → port 3000
backend/    Express + LangChain + LangGraph       → port 5000
llm/        Ollama qwen3:4b (default) or Claude
mcp/        Gmail + Calendar (mock stubs today)
```

## Current LLM
`LLM_PROVIDER=ollama` · model `qwen3:4b` · `http://localhost:11434`

## Key Files
```
backend/src/llm/config.ts       getLLMInstance() — only place LLM is instantiated
backend/src/agent/graph.ts      buildAgentGraph() — LangGraph workflow
backend/src/agent/nodes.ts      4 node functions
backend/src/agent/state.ts      AgentStateAnnotation + mergeState
backend/src/mcp/client.ts       mock stubs → replace for real Gmail/Calendar
backend/src/types/index.ts      shared interfaces
```
