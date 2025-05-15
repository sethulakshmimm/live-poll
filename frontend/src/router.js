import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Poll from './Poll';
import LiveResults from './LiveResults';

export default function AppRouter() {
  return (
    <Router>
      <div style={{ maxWidth: 400, margin: 'auto', padding: 24 }}>
        <h2>Live Age Poll</h2>
        <Poll />
        <LiveResults />
      </div>
    </Router>
  );
}
