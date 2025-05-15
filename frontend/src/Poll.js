import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Poll() {
  const pollId = 'age';
  const [poll, setPoll] = useState(null);
  const [selected, setSelected] = useState(null);
  const [voted, setVoted] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/poll/${pollId}`)
      .then(r => r.json())
      .then(setPoll)
      .catch(() => setError('Failed to load poll'));
  }, []);

  const handleVote = async () => {
    if (selected === null) return;
    await fetch(`/poll/${pollId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user-' + Math.random(), optionIdx: selected }),
    });
    setVoted(true);
    // Notify LiveResults to refresh
    window.dispatchEvent(new Event('poll-voted'));

  };

  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!poll) return <div>Loading...</div>;

  return (
    <div>
      <h3>{poll.question}</h3>
 {!voted ? (
        <div>
          {poll && Array.isArray(poll.options) && poll.options.map((opt, i) => (
            <div key={i}>
              <label>
                <input type="radio" name="opt" value={i} onChange={() => setSelected(i)} />
                {opt}
              </label>
            </div>
          ))}
          <button onClick={handleVote} disabled={selected === null}>Vote</button>
        </div>
      ) : (
        <div>Thank you for voting!</div>
      )}
    </div>
  );
}
