import React, { useState } from 'react';
import Poll from './Poll';
import LiveResults from './LiveResults';

export default function App() {
  const [pollId, setPollId] = useState(null);
  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 24 }}>
      <h2>Live Age Poll</h2>
      {!pollId ? (
        <Poll onPollCreated={setPollId} />
      ) : (
        <LiveResults pollId={pollId} />
      )}
    </div>
  );
}
