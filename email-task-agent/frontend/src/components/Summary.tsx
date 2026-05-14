'use client';

import { CalendarEvent } from '@/types';

export default function Summary({ summary, events }: { summary: string; events: CalendarEvent[] }) {
  if (!summary && events.length === 0) return null;

  return (
    <section style={{ marginTop: 24 }}>
      {events.length > 0 && (
        <>
          <h2 style={{ fontSize: 18, marginBottom: 12 }}>Calendar Events Created ({events.length})</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px' }}>
            {events.map((event) => (
              <li
                key={event.id}
                style={{
                  border: '1px solid #c3dafe',
                  borderRadius: 6,
                  padding: '10px 14px',
                  marginBottom: 8,
                  background: '#ebf4ff',
                }}
              >
                <strong>{event.title}</strong>
                <span style={{ color: '#555', fontSize: 13, marginLeft: 8 }}>
                  {event.date}{event.startTime ? ` at ${event.startTime}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {summary && (
        <>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>Summary Email</h2>
          <div
            style={{
              background: '#f0fff4',
              border: '1px solid #9ae6b4',
              borderRadius: 6,
              padding: '14px 16px',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
              fontSize: 14,
            }}
          >
            {summary}
          </div>
        </>
      )}
    </section>
  );
}
