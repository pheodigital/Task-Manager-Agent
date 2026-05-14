import { Router, Request, Response, NextFunction } from 'express';
import { buildAgentGraph } from '../agent/graph';
import { initialState, AgentState } from '../agent/state';
import { AgentResult, AgentStatus } from '../types';
import pino from 'pino';

const logger = pino({ name: 'routes/agent' });
const router = Router();

let currentState: AgentState = { ...initialState };

router.post('/run', async (req: Request, res: Response, next: NextFunction) => {
  if (currentState.status === 'running') {
    res.status(409).json({ error: 'Agent is already running' });
    return;
  }

  try {
    currentState = { ...initialState, status: 'running' };
    logger.info('Agent run started');

    const graph = buildAgentGraph();
    const finalState = await graph.invoke(currentState) as AgentState;
    currentState = finalState;

    const result: AgentResult = {
      status: finalState.status as AgentStatus,
      emails: finalState.emails,
      tasks: finalState.tasks,
      events: finalState.events,
      summary: finalState.summary,
      error: finalState.error,
      completedAt: new Date(),
    };

    logger.info({ status: result.status, taskCount: result.tasks.length }, 'Agent run completed');
    res.json(result);
  } catch (err) {
    currentState = { ...currentState, status: 'error', error: String(err) };
    next(err);
  }
});

router.get('/status', (req: Request, res: Response) => {
  res.json({
    status: currentState.status,
    emailCount: currentState.emails.length,
    taskCount: currentState.tasks.length,
    eventCount: currentState.events.length,
    error: currentState.error,
  });
});

export default router;
