'use client';

import { Task } from '@/types';

const priorityColor: Record<Task['priority'], string> = {
  high: '#c0392b',
  medium: '#e67e22',
  low: '#27ae60',
};

export default function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) return null;

  return (
    <section style={{ marginTop: 24 }}>
      <h2 style={{ fontSize: 18, marginBottom: 12 }}>Extracted Tasks ({tasks.length})</h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {tasks.map((task) => (
          <li
            key={task.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: 6,
              padding: '12px 16px',
              marginBottom: 8,
              background: '#fafafa',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>{task.title}</strong>
              <span
                style={{
                  background: priorityColor[task.priority],
                  color: '#fff',
                  borderRadius: 4,
                  padding: '2px 8px',
                  fontSize: 12,
                  textTransform: 'uppercase',
                }}
              >
                {task.priority}
              </span>
            </div>
            {task.description && (
              <p style={{ margin: '6px 0 0', color: '#555', fontSize: 14 }}>{task.description}</p>
            )}
            {task.dueDate && (
              <p style={{ margin: '4px 0 0', color: '#888', fontSize: 13 }}>
                Due: {task.dueDate}{task.startTime ? ` at ${task.startTime}` : ''}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
