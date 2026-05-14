import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import pino from 'pino';
import agentRouter from './routes/agent';

const logger = pino({
  name: 'server',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
});

const app = express();
const PORT = parseInt(process.env.PORT ?? '5000', 10);

app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000' }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/agent', agentRouter);

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err: err.message }, 'Unhandled error');
  res.status(500).json({ error: err.message ?? 'Internal server error' });
});

app.listen(PORT, () => {
  logger.info({ port: PORT, llmProvider: process.env.LLM_PROVIDER ?? 'claude' }, 'Server started');
});

export default app;
