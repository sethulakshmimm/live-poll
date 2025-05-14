import React, { useEffect, useState } from 'react';

function getWsUrl() {
  if (window.location.protocol === 'https:')
    return 'wss://' + window.location.host;
  return 'ws://' + window.location.host;
}

export default function LiveResults({ pollId }) {
  const [poll, setPoll] = useState(null);
  const [selected, setSelected] = useState(null);
  const [voted, setVoted] = useState(false);
  useEffect(() => {
    fetch(`/poll/${pollId}`)
      .then(r => r.json())
      .then(setPoll);
    const ws = new window.WebSocket(getWsUrl());
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', pollId }));
    };
    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      setPoll(prev => prev ? { ...prev, tally: data.tally } : prev);
    };
    return () => ws.close();
  }, [pollId]);

  const handleVote = async () => {
    if (selected === null) return;
    await fetch(`/poll/${pollId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user-' + Math.random(), optionIdx: selected }),
    });
    setVoted(true);
  };

  if (!poll) return <div>Loading...</div>;
  const total = poll.tally.reduce((a, b) => a + b, 0);
  return (
    <div>
      <h3>{poll.question}</h3>
      {!voted ? (
        <div>
          {poll.options.map((opt, i) => (
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
      <div style={{ marginTop: 16 }}>
        <h4>Live Results</h4>
        {poll.options.map((opt, i) => (
          <div key={i}>
            {opt}: {total ? Math.round((poll.tally[i] / total) * 100) : 0}%
          </div>
        ))}
      </div>
    </div>
  );
}
