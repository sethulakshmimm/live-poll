const { WebSocketServer } = require('ws');
const { redisClient, CHANNEL_PREFIX } = require('./redis');

function setupWebSocket(server) {
  const wss = new WebSocketServer({ server });
  wss.on('connection', (ws, req) => {
    let subscribedChannel = null;
    ws.on('message', (msg) => {
      try {
        const { type, pollId } = JSON.parse(msg);
        if (type === 'subscribe' && pollId) {
          subscribedChannel = CHANNEL_PREFIX + pollId;
          redisClient.subscribe(subscribedChannel);
        }
      } catch (_) {}
    });
    const handleMessage = (channel, message) => {
      if (channel === subscribedChannel) {
        ws.send(message);
      }
    };
    redisClient.on('message', handleMessage);
    ws.on('close', () => {
      if (subscribedChannel) redisClient.unsubscribe(subscribedChannel);
      redisClient.off('message', handleMessage);
    });
  });
}

module.exports = { setupWebSocket };
