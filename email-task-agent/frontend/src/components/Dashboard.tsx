'use client';

import { useState } from 'react';
import { runAgent } from '@/api/client';
import { AgentResult } from '@/types';
import TaskList from './TaskList';
import Summary from './Summary';

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await runAgent();
      if (data.status === 'error') {
        setError(data.error ?? 'Agent encountered an error');
      } else {
        setResult(data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Request failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 760, margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ fontSize: 26, marginBottom: 4 }}>Email Task Manager Agent</h1>
      <p style={{ color: '#666', marginBottom: 28 }}>
        Reads your emails, extracts tasks, creates calendar events, and generates a summary.
      </p>

      <button
        onClick={handleRun}
        disabled={loading}
        style={{
          background: loading ? '#999' : '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '10px 24px',
          fontSize: 15,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 600,
        }}
      >
        {loading ? 'Running agent...' : 'Run Agent'}
      </button>

      {loading && (
        <p style={{ color: '#555', marginTop: 16 }}>
          Fetching emails → Analyzing tasks → Creating events → Generating summary...
        </p>
      )}

      {error && (
        <div
          style={{
            marginTop: 20,
            background: '#fff5f5',
            border: '1px solid #fc8181',
            borderRadius: 6,
            padding: '12px 16px',
            color: '#c53030',
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <>
          <div style={{ marginTop: 20, color: '#276749', fontWeight: 600 }}>
            Completed — {result.emails.length} email{result.emails.length !== 1 ? 's' : ''} processed
          </div>
          <TaskList tasks={result.tasks} />
          <Summary summary={result.summary} events={result.events} />
        </>
      )}
    </main>
  );
}
