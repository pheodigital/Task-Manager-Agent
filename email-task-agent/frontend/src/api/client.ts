import axios from 'axios';
import { AgentResult } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000';

const api = axios.create({ baseURL: BASE_URL });

export async function runAgent(): Promise<AgentResult> {
  const { data } = await api.post<AgentResult>('/api/agent/run');
  return data;
}

export async function getAgentStatus(): Promise<{
  status: string;
  taskCount: number;
  eventCount: number;
  error?: string;
}> {
  const { data } = await api.get('/api/agent/status');
  return data;
}
