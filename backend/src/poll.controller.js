const { v4: uuidv4 } = require('uuid');
const { publishTallyUpdate, redisClient } = require('./redis');

// In-memory poll storage (replace with DB/Redis in prod)
const polls = {};
const votes = {}; // { pollId: { userId: optionIdx } }

exports.createPoll = (req, res) => {
  const { question, options, expiresAt } = req.body;
  if (!question || !options || options.length < 2) {
    return res.status(400).json({ error: 'Invalid poll data' });
  }
  const id = uuidv4();
  polls[id] = {
    id,
    question,
    options,
    expiresAt: expiresAt || null,
    tally: Array(options.length).fill(0),
    createdAt: Date.now(),
  };
  votes[id] = {};
  res.json({ id });
};

exports.votePoll = async (req, res) => {
  const poll = polls[req.params.id];
  if (!poll) return res.status(404).json({ error: 'Poll not found' });
  const { userId, optionIdx } = req.body;
  if (typeof optionIdx !== 'number' || !userId) {
    return res.status(400).json({ error: 'Invalid vote' });
  }
  if (votes[req.params.id][userId] !== undefined) {
    return res.json({ status: 'already voted' });
  }
  votes[req.params.id][userId] = optionIdx;
  poll.tally[optionIdx]++;
  await publishTallyUpdate(req.params.id, poll.tally);
  res.json({ status: 'voted' });
};

exports.getPoll = (req, res) => {
  const poll = polls[req.params.id];
  if (!poll) return res.status(404).json({ error: 'Poll not found' });
  const totalVotes = poll.tally.reduce((a, b) => a + b, 0);
  const percentages = poll.tally.map(count => totalVotes ? Math.round((count / totalVotes) * 100) : 0);
  res.json({
    id: poll.id,
    question: poll.question,
    options: poll.options,
    expiresAt: poll.expiresAt,
    tally: poll.tally,
    percentages,
    totalVotes,
  });
};
