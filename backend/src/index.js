// Entry point for Express server and WebSocket
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const http = require('http');
const pollRoutes = require('./poll.routes');
const { setupWebSocket } = require('./websocket');

const app = express();
app.use(express.json());
app.use(helmet());

app.use('/poll', pollRoutes);

const server = http.createServer(app);
setupWebSocket(server);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
