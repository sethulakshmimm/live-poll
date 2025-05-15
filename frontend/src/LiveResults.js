import React, { useEffect, useState } from 'react';

function getWsUrl() {
  // Always connect to backend WebSocket on port 4000
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return protocol + '://' + window.location.hostname + ':4000';
}

export default function LiveResults() {
  const pollId = 'age';
  const [poll, setPoll] = useState(null);
  const [selected, setSelected] = useState(null);
  const [voted, setVoted] = useState(false);
  useEffect(() => {
    let ws;
    // Fetch initial poll data
    const fetchPoll = () => {
      fetch(`/poll/${pollId}`)
        .then(r => r.json())
        .then(setPoll)
        .catch(err => {
          setPoll(null);
          window.pollFetchError = err;
          console.error('Failed to fetch poll:', err);
        });
    };
    fetchPoll();
    // Subscribe to WebSocket for live updates
    ws = new window.WebSocket(getWsUrl());
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', pollId }));
    };
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg && Array.isArray(msg.tally)) {
          setPoll(prev => prev ? { ...prev, tally: msg.tally } : prev);
        } else {
          fetchPoll(); // fallback if unexpected message
        }
      } catch {
        fetchPoll();
      }
    };
    // Listen for custom event from Poll.js
    window.addEventListener('poll-voted', fetchPoll);
    return () => {
      ws && ws.close();
      window.removeEventListener('poll-voted', fetchPoll);
    };
  }, [pollId]);

  const handleVote = async () => {
    if (selected === null) return;
    await fetch(`/poll/${pollId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user-' + Math.random(), optionIdx: selected }),
    });
    setVoted(true);
    // Refetch poll data after voting to ensure tally is up-to-date
    fetch(`/poll/${pollId}`)
      .then(r => r.json())
      .then(setPoll);
  };

  // Always show debug output, even if poll is null
  const debugPanel = (
    <pre style={{background:'#f8f8f8',color:'#333',padding:8,borderRadius:4,overflowX:'auto'}}>{JSON.stringify(poll, null, 2)}</pre>
  );
  if (!poll) return <div>Loading poll...{debugPanel}</div>;
  const total = poll && poll.tally ? poll.tally.reduce((a, b) => a + b, 0) : 0;

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
      {/* Live Results always visible */}
      <div style={{ marginTop: 24, borderTop: '1px solid #eee', paddingTop: 16 }}>
        <h4>Live Results</h4>
       {total === 0 ? (
          <div style={{ color: '#888' }}>No votes yet.</div>
        ) : (
          <>
            {poll.options.map((opt, i) => (
              <div key={i}>
                {opt}: {Math.round((poll.tally[i] / total) * 100)}% ({poll.tally[i]} votes)
              </div>
            ))}
            <div style={{ marginTop: 8, fontWeight: 'bold' }}>Total votes: {total}</div>
          </>
        )}
      </div>
    </div>
  );
}
