import { Email } from '../types';

// MCP integration stubs.
// Replace these with real MCP server calls when Gmail/Calendar MCP servers are available.
// Each function documents the MCP endpoint it will eventually call.

export async function getMockEmails(maxResults: number = 10): Promise<Email[]> {
  // Future: MCP call → process.env.MCP_GMAIL_ENDPOINT/emails?max=maxResults
  const mockEmails: Email[] = [
    {
      id: '1',
      from: 'john@example.com',
      subject: 'Project update needed',
      body: 'Can you send me the Q3 report by Friday? It is urgent for the board meeting.',
      timestamp: new Date(),
    },
    {
      id: '2',
      from: 'manager@example.com',
      subject: 'Team meeting',
      body: "Let's meet tomorrow at 2 PM to discuss the roadmap and Q4 planning.",
      timestamp: new Date(),
    },
    {
      id: '3',
      from: 'client@example.com',
      subject: 'Contract review',
      body: 'Please review the attached contract and send your feedback by end of next week.',
      timestamp: new Date(),
    },
  ];
  return mockEmails.slice(0, maxResults);
}

export async function createCalendarEvent(payload: {
  title: string;
  date: string;
  startTime?: string;
}): Promise<{ eventId: string }> {
  // Future: MCP call → process.env.MCP_CALENDAR_ENDPOINT/events
  return { eventId: `mock-event-${Date.now()}` };
}

export async function sendEmail(payload: {
  to: string;
  subject: string;
  body: string;
}): Promise<{ messageId: string }> {
  // Future: MCP call → process.env.MCP_GMAIL_ENDPOINT/send
  return { messageId: `mock-msg-${Date.now()}` };
}
