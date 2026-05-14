import { HumanMessage } from '@langchain/core/messages';
import { getLLMInstance } from '../llm/config';
import { getMockEmails, createCalendarEvent, sendEmail } from '../mcp/client';
import { AgentState, mergeState } from './state';
import { CalendarEvent, Task } from '../types';
import pino from 'pino';

const logger = pino({ name: 'agent-nodes' });

export async function fetchEmailsNode(state: AgentState): Promise<AgentState> {
  logger.info('Node: fetchEmails');
  try {
    const emails = await getMockEmails(10);
    return mergeState(state, { emails, status: 'running' });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logger.error({ error }, 'fetchEmails failed');
    return mergeState(state, { status: 'error', error });
  }
}

export async function analyzeTasksNode(state: AgentState): Promise<AgentState> {
  logger.info('Node: analyzeTasks');
  if (state.status === 'error') return state;

  try {
    const llm = getLLMInstance();
    const emailSummary = state.emails
      .map((e) => `ID:${e.id} FROM:${e.from} SUBJECT:${e.subject}\n${e.body}`)
      .join('\n---\n');

    const prompt = `You are a task extraction assistant. Given these emails, extract all action items.
For each action item return a JSON array with objects containing:
- id (string, e.g. "task-1")
- title (string)
- description (string, optional)
- dueDate (string YYYY-MM-DD, optional)
- startTime (string HH:MM, optional)
- priority ("high" | "medium" | "low")
- source (the email id)

Emails:
${emailSummary}

Return ONLY a valid JSON array, no explanation.`;

    const response = await llm.invoke([new HumanMessage(prompt)]);
    const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

    // Extract JSON array from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('LLM did not return a JSON array');

    const tasks: Task[] = JSON.parse(jsonMatch[0]);
    logger.info({ taskCount: tasks.length }, 'Tasks extracted');
    return mergeState(state, { tasks });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logger.error({ error }, 'analyzeTasks failed');
    return mergeState(state, { status: 'error', error });
  }
}

export async function createEventsNode(state: AgentState): Promise<AgentState> {
  logger.info('Node: createEvents');
  if (state.status === 'error') return state;

  try {
    const tasksWithDates = state.tasks.filter((t) => t.dueDate);

    const events: CalendarEvent[] = await Promise.all(
      tasksWithDates.map(async (task) => {
        const { eventId } = await createCalendarEvent({
          title: task.title,
          date: task.dueDate!,
          startTime: task.startTime,
        });
        return {
          id: eventId,
          title: task.title,
          date: task.dueDate!,
          startTime: task.startTime,
          description: task.description,
          taskId: task.id,
        };
      })
    );

    logger.info({ eventCount: events.length }, 'Events created');
    return mergeState(state, { events });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logger.error({ error }, 'createEvents failed');
    return mergeState(state, { status: 'error', error });
  }
}

export async function sendSummaryNode(state: AgentState): Promise<AgentState> {
  logger.info('Node: sendSummary');
  if (state.status === 'error') return state;

  try {
    const llm = getLLMInstance();

    const taskList = state.tasks.map((t) => `- ${t.title} (${t.priority} priority)`).join('\n');
    const eventList = state.events.map((e) => `- ${e.title} on ${e.date}${e.startTime ? ' at ' + e.startTime : ''}`).join('\n');

    const prompt = `Write a brief, professional email summary for these extracted tasks and calendar events.

Tasks extracted (${state.tasks.length}):
${taskList || 'None'}

Calendar events created (${state.events.length}):
${eventList || 'None'}

Keep it under 150 words. Start with "Here is your task summary:"`;

    const response = await llm.invoke([new HumanMessage(prompt)]);
    const summary = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

    const recipientEmail = process.env.GMAIL_USER_EMAIL ?? 'user@example.com';
    await sendEmail({
      to: recipientEmail,
      subject: `Task Summary — ${new Date().toLocaleDateString()}`,
      body: summary,
    });

    logger.info({ to: recipientEmail }, 'Summary sent');
    return mergeState(state, { summary, status: 'completed' });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logger.error({ error }, 'sendSummary failed');
    return mergeState(state, { status: 'error', error });
  }
}
