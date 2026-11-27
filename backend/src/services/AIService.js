// services/AIService.js
const MinimaxEngine = require('../engine/MinimaxEngine');
const { Difficulty, GameStatus } = require('../models/enums');

class AIService {
  constructor(gameService) {
    this.gameService = gameService;
    this.minimaxEngine = new MinimaxEngine();
  }

  triggerAIMove(gameId) {
    const game = this.gameService.getGameOrThrow(gameId);

    if (GameStatus.isGameOver(game.status)) {
      const err = new Error('Game is already finished. Status: ' + game.status);
      err.statusCode = 400;
      err.type = 'InvalidGameState';
      throw err;
    }

    const currentPlayer = game.getCurrentPlayer();
    if (!currentPlayer || !currentPlayer.ai) {
      const err = new Error("It is not an AI player's turn.");
      err.statusCode = 400;
      err.type = 'InvalidGameState';
      throw err;
    }

    const difficulty = currentPlayer.difficulty || Difficulty.MEDIUM;
    const chosenMove = this.minimaxEngine.calculateBestMove(game.board, difficulty);

    if (!chosenMove) {
      const terminalStatus = this.gameService.getChessEngine().evaluateGameStatus(game.board);
      game.status = terminalStatus;
      return this.gameService.toGameResponse(game);
    }

    game.updateClock();

    const san = this.gameService.getChessEngine().getMoveValidator().computeSan(game.board, chosenMove);
    chosenMove.san = san;

    game.board.executeMove(chosenMove);

    const postMoveStatus = this.gameService.getChessEngine().evaluateGameStatus(game.board);
    game.status = postMoveStatus;

    if (postMoveStatus === GameStatus.CHECKMATE) {
      game.winner = chosenMove.movedPiece.color;
    }

    return this.gameService.toGameResponse(game);
  }
}

module.exports = AIService;
