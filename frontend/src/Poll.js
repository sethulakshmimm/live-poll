import React, { useState } from 'react';

export default function Poll({ onPollCreated }) {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: 'What is your age?',
          options: ['20-30', '30-40', '40-50', '50+'],
        }),
      });
      const data = await res.json();
      if (data.id) onPollCreated(data.id);
      else setError('Failed to create poll');
    } catch {
      setError('Failed to create poll');
    }
    setCreating(false);
  };

  return (
    <div>
      <button onClick={handleCreate} disabled={creating}>
        Create Age Poll
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}
