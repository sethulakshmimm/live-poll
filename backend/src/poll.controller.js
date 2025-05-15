const { v4: uuidv4 } = require('uuid');
const { publishTallyUpdate } = require('./redis');
const db = require('./db');

exports.createPoll = async (req, res) => {
  const { question, options, expiresAt } = req.body;
  if (!question || !options || options.length < 2) {
    return res.status(400).json({ error: 'Invalid poll data' });
  }
  const id = uuidv4();
  try {
    await db.query(
      'INSERT INTO polls (id, question, options, expires_at) VALUES ($1, $2, $3, $4)',
      [id, question, options, expiresAt || null]
    );
    res.json({ id });
  } catch (err) {
    console.error('createPoll error:', err);
    res.status(500).json({ error: 'Failed to create poll' });
  }
};

// Ensure a global 'age' poll exists on startup
(async () => {
  try {
    const pollRes = await db.query('SELECT * FROM polls WHERE id=$1', ['age']);
    if (pollRes.rows.length === 0) {
      await db.query(
        'INSERT INTO polls (id, question, options) VALUES ($1, $2, $3)',
        ['age', 'What is your age?', ['20-30', '30-40', '40-50', '50+']]
      );
      console.log("Created global 'age' poll");
    }
  } catch (err) {
    console.error('Failed to ensure global age poll:', err);
  }
})();

exports.votePoll = async (req, res) => {
  const pollId = 'age';
  const { userId, optionIdx } = req.body;
  if (typeof optionIdx !== 'number' || !userId) {
    return res.status(400).json({ error: 'Invalid vote' });
  }
  try {
    // Check poll exists and not expired
    const pollRes = await db.query('SELECT options, expires_at FROM polls WHERE id=$1', [pollId]);
    if (pollRes.rows.length === 0) return res.status(404).json({ error: 'Poll not found' });
    const poll = pollRes.rows[0];
    if (poll.expires_at && new Date(poll.expires_at) < new Date()) {
      return res.status(403).json({ error: 'Poll closed' });
    }
    // Check if already voted
    const voteRes = await db.query('SELECT 1 FROM votes WHERE poll_id=$1 AND user_id=$2', [pollId, userId]);
    if (voteRes.rows.length > 0) {
      return res.json({ status: 'already voted' });
    }
    // Insert vote
    await db.query('INSERT INTO votes (poll_id, user_id, option_idx) VALUES ($1, $2, $3)', [pollId, userId, optionIdx]);
    // Tally
    const tallyRes = await db.query('SELECT option_idx, COUNT(*) AS count FROM votes WHERE poll_id=$1 GROUP BY option_idx ORDER BY option_idx', [pollId]);
    const tally = Array(poll.options.length).fill(0);
    tallyRes.rows.forEach(row => { tally[row.option_idx] = parseInt(row.count, 10); });
    await publishTallyUpdate(pollId, tally);
    res.json({ status: 'voted' });
  } catch (err) {
    console.error('votePoll error:', err);
    res.status(500).json({ error: 'Failed to vote' });
  }
};

// Ensure a global 'age' poll exists on startup
(async () => {
  try {
    const pollRes = await db.query('SELECT * FROM polls WHERE id=$1', ['age']);
    if (pollRes.rows.length === 0) {
      await db.query(
        'INSERT INTO polls (id, question, options) VALUES ($1, $2, $3)',
        ['age', 'What is your age?', ['20-30', '30-40', '40-50', '50+']]
      );
      console.log("Created global 'age' poll");
    }
  } catch (err) {
    console.error('Failed to ensure global age poll:', err);
  }
})();

exports.getPoll = async (req, res) => {
  const pollId = 'age';
  try {
    const pollRes = await db.query('SELECT * FROM polls WHERE id=$1', [pollId]);
    if (pollRes.rows.length === 0) return res.status(404).json({ error: 'Poll not found' });
    const poll = pollRes.rows[0];
    const tallyRes = await db.query('SELECT option_idx, COUNT(*) AS count FROM votes WHERE poll_id=$1 GROUP BY option_idx ORDER BY option_idx', [pollId]);
    const tally = Array(poll.options.length).fill(0);
    tallyRes.rows.forEach(row => { tally[row.option_idx] = parseInt(row.count, 10); });
    const totalVotes = tally.reduce((a, b) => a + b, 0);
    const percentages = tally.map(count => totalVotes ? Math.round((count / totalVotes) * 100) : 0);
    res.json({
      id: poll.id,
      question: poll.question,
      options: poll.options,
      expiresAt: poll.expires_at,
      tally,
      percentages,
      totalVotes,
    });
  } catch (err) {
    console.error('getPoll error:', err);
    res.status(500).json({ error: 'Failed to get poll' });
  }
};

// Ensure a global 'age' poll exists on startup
(async () => {
  try {
    const pollRes = await db.query('SELECT * FROM polls WHERE id=$1', ['age']);
    if (pollRes.rows.length === 0) {
      await db.query(
        'INSERT INTO polls (id, question, options) VALUES ($1, $2, $3)',
        ['age', 'What is your age?', ['20-30', '30-40', '40-50', '50+']]
      );
      console.log("Created global 'age' poll");
    }
  } catch (err) {
    console.error('Failed to ensure global age poll:', err);
  }
})();
