// server.js — ChessNova Express Entry Point
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const GameService = require('./src/services/GameService');
const AIService = require('./src/services/AIService');
const GameController = require('./src/controllers/GameController');
const AIController = require('./src/controllers/AIController');
const createGameRoutes = require('./src/routes/gameRoutes');
const errorHandler = require('./src/middleware/errorHandler');
const MultiplayerHandler = require('./src/ws/MultiplayerHandler');

const app = express();
const server = http.createServer(app);

// ─── Socket.io (multiplayer) ───────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  path: '/ws/multiplayer'
});

// ─── Middleware ────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['*']
}));
app.use(express.json());

// ─── Dependency Wiring ────────────────────────────────────────────────────
const gameService      = new GameService();
const aiService        = new AIService(gameService);
const gameController   = new GameController(gameService);
const aiController     = new AIController(aiService);

// Setup WebSocket multiplayer
const multiplayerHandler = new MultiplayerHandler(gameService, io);
multiplayerHandler.setup();

// ─── Routes ───────────────────────────────────────────────────────────────
app.use('/api/games', createGameRoutes(gameController, aiController));

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ─── Global Error Handler ─────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`ChessNova Express backend running on port ${PORT}`);
});

module.exports = app; // for Vercel
