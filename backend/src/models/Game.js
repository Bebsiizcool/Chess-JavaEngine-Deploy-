// models/Game.js
const { v4: uuidv4 } = require('uuid');
const Board = require('./Board');
const { PieceColor, GameStatus } = require('./enums');

class Game {
  constructor(mode, whitePlayer, blackPlayer, initialTimeMs) {
    this.id = uuidv4();
    this.board = new Board();
    this.board.initializeStandardBoard();
    this.mode = mode;
    this.whitePlayer = whitePlayer;
    this.blackPlayer = blackPlayer;
    this.status = GameStatus.ACTIVE;
    this.winner = null;
    this.whiteTimeRemainingMs = initialTimeMs;
    this.blackTimeRemainingMs = initialTimeMs;
    this.createdAt = Date.now();
    this.lastMoveTimestamp = this.createdAt;
    this.updatedAt = this.createdAt;
  }

  updateClock() {
    const now = Date.now();
    const elapsed = now - this.lastMoveTimestamp;
    if (this.board.turn === PieceColor.WHITE) {
      this.whiteTimeRemainingMs = Math.max(0, this.whiteTimeRemainingMs - elapsed);
      if (this.whiteTimeRemainingMs === 0 && this.status === GameStatus.ACTIVE) {
        this.status = GameStatus.CHECKMATE;
        this.winner = PieceColor.BLACK;
      }
    } else {
      this.blackTimeRemainingMs = Math.max(0, this.blackTimeRemainingMs - elapsed);
      if (this.blackTimeRemainingMs === 0 && this.status === GameStatus.ACTIVE) {
        this.status = GameStatus.CHECKMATE;
        this.winner = PieceColor.WHITE;
      }
    }
    this.lastMoveTimestamp = now;
    this.updatedAt = now;
  }

  getCurrentPlayer() {
    return this.board.turn === PieceColor.WHITE ? this.whitePlayer : this.blackPlayer;
  }

  isCurrentTurnAI() {
    const current = this.getCurrentPlayer();
    return current && current.ai;
  }
}

module.exports = Game;
