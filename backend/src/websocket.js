const { WebSocketServer } = require('ws');
const { redisClient, subscriberClient, CHANNEL_PREFIX } = require('./redis');

function setupWebSocket(server) {
  const wss = new WebSocketServer({ server });
  wss.on('connection', (ws, req) => {
    let subscribedChannel = null;
    ws.on('message', (msg) => {
      try {
        const { type, pollId } = JSON.parse(msg);
        if (type === 'subscribe' && pollId) {
          subscribedChannel = CHANNEL_PREFIX + pollId;
          subscriberClient.subscribe(subscribedChannel);
        }
      } catch (_) {}
    });
    const handleMessage = (channel, message) => {
      if (channel === subscribedChannel) {
        ws.send(message);
      }
    };
    subscriberClient.on('message', handleMessage);
    ws.on('close', () => {
      if (subscribedChannel) subscriberClient.unsubscribe(subscribedChannel);
      subscriberClient.off('message', handleMessage);
    });
  });
}

module.exports = { setupWebSocket };
