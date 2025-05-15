const { WebSocketServer } = require('ws');
const { Redis } = require('ioredis');
const { CHANNEL_PREFIX } = require('./redis');

function setupWebSocket(server) {
  const wss = new WebSocketServer({ server });
  wss.on('connection', (ws, req) => {
    let subscribedChannel = null;
    let clientSubscriber = null;
    ws.on('message', (msg) => {
      try {
        const { type, pollId } = JSON.parse(msg);
        if (type === 'subscribe' && pollId) {
          subscribedChannel = CHANNEL_PREFIX + pollId;
          clientSubscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
          clientSubscriber.subscribe(subscribedChannel);
          clientSubscriber.on('message', (channel, message) => {
            if (channel === subscribedChannel) {
              ws.send(message);
            }
          });
        }
      } catch (_) {}
    });
    ws.on('close', () => {
      if (clientSubscriber && subscribedChannel) {
        clientSubscriber.unsubscribe(subscribedChannel);
        clientSubscriber.quit();
      }
    });
  });
}

module.exports = { setupWebSocket };
