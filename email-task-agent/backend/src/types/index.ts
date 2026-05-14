export interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  timestamp: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  startTime?: string;
  priority: 'high' | 'medium' | 'low';
  source: string; // email id
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  taskId: string;
}

export type AgentStatus = 'idle' | 'running' | 'completed' | 'error';

export interface AgentResult {
  status: AgentStatus;
  emails: Email[];
  tasks: Task[];
  events: CalendarEvent[];
  summary: string;
  error?: string;
  completedAt?: Date;
}
