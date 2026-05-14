// LangChain tool definitions for the agent.
// Currently the graph uses direct node calls (nodes.ts). These tools are
// wired here so the agent can be switched to a ReAct/tool-calling loop by
// passing `agentTools` to `llm.bindTools()` and replacing the graph nodes
// with a single tool-calling agent node.

import { tool } from '@langchain/core/tools';
import { z } from 'zod/v4';
import { getMockEmails, createCalendarEvent, sendEmail } from '../mcp/client';
import { CalendarEvent } from '../types';
import pino from 'pino';

const logger = pino({ name: 'tools' });

export const readEmailsTool = tool(
  async ({ maxResults }) => {
    logger.info({ maxResults }, 'Fetching emails');
    const emails = await getMockEmails(maxResults);
    return JSON.stringify(emails);
  },
  {
    name: 'read_emails',
    description: 'Read recent emails from the inbox',
    schema: z.object({
      maxResults: z.number().default(10).describe('Max number of emails to fetch'),
    }),
  }
);

export const createEventTool = tool(
  async (input) => {
    logger.info({ input }, 'Creating calendar event');
    const { eventId } = await createCalendarEvent({
      title: input.title,
      date: input.date,
      startTime: input.startTime,
    });
    const event: CalendarEvent = {
      id: eventId,
      title: input.title,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      description: input.description,
      taskId: input.taskId,
    };
    // MCP integration point: replace createCalendarEvent stub with real API call
    return JSON.stringify(event);
  },
  {
    name: 'create_event',
    description: 'Create a calendar event for a task',
    schema: z.object({
      title: z.string().describe('Event title'),
      date: z.string().describe('Date in YYYY-MM-DD format'),
      startTime: z.string().optional().describe('Start time in HH:MM format'),
      endTime: z.string().optional().describe('End time in HH:MM format'),
      description: z.string().optional().describe('Event description'),
      taskId: z.string().describe('The task ID this event is for'),
    }),
  }
);

export const sendEmailTool = tool(
  async ({ to, subject, body }) => {
    logger.info({ to, subject }, 'Sending summary email');
    const { messageId } = await sendEmail({ to, subject, body });
    // MCP integration point: replace sendEmail stub with real Gmail send call
    return JSON.stringify({ sent: true, messageId, to, subject });
  },
  {
    name: 'send_email',
    description: 'Send a summary email to the user',
    schema: z.object({
      to: z.string().describe('Recipient email address'),
      subject: z.string().describe('Email subject'),
      body: z.string().describe('Email body'),
    }),
  }
);

export const agentTools = [readEmailsTool, createEventTool, sendEmailTool];
