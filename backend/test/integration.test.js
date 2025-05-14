const request = require('supertest');
const http = require('http');
const express = require('express');
const helmet = require('helmet');
const pollRoutes = require('../src/poll.routes');
const { setupWebSocket } = require('../src/websocket');
const Redis = require('ioredis');

// Setup Express app for test
const app = express();
app.use(express.json());
app.use(helmet());
app.use('/poll', pollRoutes);
const server = http.createServer(app);
setupWebSocket(server);

let api;
beforeAll((done) => {
  server.listen(0, () => {
    const port = server.address().port;
    api = request(`http://localhost:${port}`);
    done();
  });
});
afterAll((done) => server.close(done));

describe('Poll API integration', () => {
  let pollId;
  it('should create a poll', async () => {
    const res = await api.post('/poll').send({
      question: 'What is your age?',
      options: ['20-30', '30-40'],
    });
    expect(res.body.id).toBeDefined();
    pollId = res.body.id;
  });
  it('should allow voting and tally', async () => {
    const voteRes = await api.post(`/poll/${pollId}/vote`).send({ userId: 'testuser', optionIdx: 0 });
    expect(voteRes.body.status).toBe('voted');
    const tallyRes = await api.get(`/poll/${pollId}`);
    expect(tallyRes.body.tally[0]).toBe(1);
  });
  it('should be idempotent per user', async () => {
    await api.post(`/poll/${pollId}/vote`).send({ userId: 'testuser', optionIdx: 1 });
    const tallyRes = await api.get(`/poll/${pollId}`);
    expect(tallyRes.body.tally[1]).toBe(0);
  });
});
