// routes/gameRoutes.js
const express = require('express');

function createGameRoutes(gameController, aiController) {
  const router = express.Router();

  // POST /api/games             — Create a new game
  router.post('/', gameController.createGame);

  // GET  /api/games/:gameId     — Get game state
  router.get('/:gameId', gameController.getGame);

  // POST /api/games/:gameId/moves  — Submit a move
  router.post('/:gameId/moves', gameController.submitMove);

  // POST /api/games/:gameId/ai-move — Trigger AI move
  router.post('/:gameId/ai-move', aiController.requestAIMove);

  // POST /api/games/:gameId/undo   — Undo last move
  router.post('/:gameId/undo', gameController.undoMove);

  // POST /api/games/:gameId/restart — Restart game
  router.post('/:gameId/restart', gameController.restartGame);

  // GET  /api/games/:gameId/history — Move history
  router.get('/:gameId/history', gameController.getHistory);

  // GET  /api/games/:gameId/legal-moves?square=e2
  router.get('/:gameId/legal-moves', gameController.getLegalMoves);

  return router;
}

module.exports = createGameRoutes;
