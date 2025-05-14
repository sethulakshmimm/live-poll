const Redis = require('ioredis');
const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const CHANNEL_PREFIX = 'poll:';

async function publishTallyUpdate(pollId, tally) {
  await redisClient.publish(CHANNEL_PREFIX + pollId, JSON.stringify({ tally }));
}

module.exports = {
  redisClient,
  publishTallyUpdate,
  CHANNEL_PREFIX,
};
