import { Annotation } from '@langchain/langgraph';
import { Email, Task, CalendarEvent, AgentStatus } from '../types';

export const AgentStateAnnotation = Annotation.Root({
  status: Annotation<AgentStatus>({ reducer: (_, y) => y, default: () => 'idle' }),
  emails: Annotation<Email[]>({ reducer: (_, y) => y, default: () => [] }),
  tasks: Annotation<Task[]>({ reducer: (_, y) => y, default: () => [] }),
  events: Annotation<CalendarEvent[]>({ reducer: (_, y) => y, default: () => [] }),
  summary: Annotation<string>({ reducer: (_, y) => y, default: () => '' }),
  error: Annotation<string | undefined>({ reducer: (_, y) => y, default: () => undefined }),
});

export type AgentState = typeof AgentStateAnnotation.State;

export const initialState: AgentState = {
  status: 'idle',
  emails: [],
  tasks: [],
  events: [],
  summary: '',
  error: undefined,
};

export function mergeState(prev: AgentState, patch: Partial<AgentState>): AgentState {
  return { ...prev, ...patch };
}
