-- Migration: Initial schema for poll app (PostgreSQL)
DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS polls;

CREATE TABLE IF NOT EXISTS polls (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    options TEXT[] NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS votes (
    poll_id TEXT REFERENCES polls(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    option_idx INTEGER NOT NULL,
    voted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (poll_id, user_id)
);

-- Index for fast tally
CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON votes(poll_id);
