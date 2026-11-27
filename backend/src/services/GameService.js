// services/GameService.js
const ChessEngine = require('../engine/ChessEngine');
const MoveValidator = require('../engine/MoveValidator');
const Game = require('../models/Game');
const Player = require('../models/Player');
const Position = require('../models/Position');
const { PieceColor, PieceType, Difficulty, GameMode, GameStatus } = require('../models/enums');

class GameService {
  constructor() {
    this.activeGames = new Map();
    this.chessEngine = new ChessEngine(new MoveValidator());
  }

  createGame(request = {}) {
    const mode = request.mode || GameMode.TWO_PLAYER_LOCAL;
    const timeLimit = request.initialTimeMs != null ? request.initialTimeMs : 600000;

    let whitePlayer, blackPlayer;

    if (mode === GameMode.VS_COMPUTER) {
      const difficulty = Difficulty.fromName(request.difficulty || 'MEDIUM');
      const preferredColor = (request.playerColor || 'WHITE').toUpperCase();

      let humanIsWhite;
      if (preferredColor === 'RANDOM') {
        humanIsWhite = Math.random() < 0.5;
      } else {
        humanIsWhite = preferredColor === 'WHITE';
      }

      if (humanIsWhite) {
        whitePlayer = Player.human('guest-white', 'Guest (White)', PieceColor.WHITE);
        blackPlayer = Player.aiPlayer(PieceColor.BLACK, difficulty);
      } else {
        whitePlayer = Player.aiPlayer(PieceColor.WHITE, difficulty);
        blackPlayer = Player.human('guest-black', 'Guest (Black)', PieceColor.BLACK);
      }
    } else {
      whitePlayer = Player.human('guest-white', 'Player 1 (White)', PieceColor.WHITE);
      blackPlayer = Player.human('guest-black', 'Player 2 (Black)', PieceColor.BLACK);
    }

    const game = new Game(mode, whitePlayer, blackPlayer, timeLimit);
    this.activeGames.set(game.id, game);
    return this.toGameResponse(game);
  }

  getGameOrThrow(gameId) {
    const game = this.activeGames.get(gameId);
    if (!game) {
      const err = new Error('Game session not found with ID: ' + gameId);
      err.statusCode = 404;
      err.type = 'GameNotFound';
      throw err;
    }
    return game;
  }

  getGameResponse(gameId) {
    const game = this.getGameOrThrow(gameId);
    return this.toGameResponse(game);
  }

  submitMove(gameId, request) {
    const game = this.getGameOrThrow(gameId);

    if (GameStatus.isGameOver(game.status)) {
      const err = new Error('Cannot submit moves to a finished game. Status: ' + game.status);
      err.statusCode = 400;
      err.type = 'InvalidGameState';
      throw err;
    }

    if (!request.from || !request.to) {
      const err = new Error("Both 'from' and 'to' squares must be provided.");
      err.statusCode = 400;
      err.type = 'IllegalMove';
      throw err;
    }

    const from = Position.fromAlgebraic(request.from);
    const to = Position.fromAlgebraic(request.to);

    // Resolve promotion type
    let promotionType = null;
    if (request.promotionType) {
      promotionType = PieceType.fromName(request.promotionType);
    }

    game.updateClock();

    const executedMove = this.chessEngine.makeMove(game.board, from, to, promotionType);

    const updatedStatus = this.chessEngine.evaluateGameStatus(game.board);
    game.status = updatedStatus;

    if (updatedStatus === GameStatus.CHECKMATE) {
      game.winner = executedMove.movedPiece.color;
    }

    return this.toGameResponse(game);
  }

  undoMove(gameId) {
    const game = this.getGameOrThrow(gameId);

    if (game.board.getMoveHistory().length === 0) {
      const err = new Error('No moves available to undo.');
      err.statusCode = 400;
      err.type = 'InvalidGameState';
      throw err;
    }

    if (game.mode === GameMode.VS_COMPUTER) {
      this.chessEngine.undoMove(game.board);
      if (game.board.getMoveHistory().length > 0) {
        this.chessEngine.undoMove(game.board);
      }
    } else {
      this.chessEngine.undoMove(game.board);
    }

    game.status = this.chessEngine.evaluateGameStatus(game.board);
    game.winner = null;

    return this.toGameResponse(game);
  }

  restartGame(gameId) {
    const game = this.getGameOrThrow(gameId);
    game.board.initializeStandardBoard();
    game.status = GameStatus.ACTIVE;
    game.winner = null;
    game.whiteTimeRemainingMs = 600000;
    game.blackTimeRemainingMs = 600000;
    return this.toGameResponse(game);
  }

  getLegalMoves(gameId, square) {
    const game = this.getGameOrThrow(gameId);
    const pos = Position.fromAlgebraic(square);
    const legalMoves = this.chessEngine.generateLegalMoves(game.board, pos);

    const destinations = [...new Set(legalMoves.map(m => m.to.toAlgebraic()))];
    return { square, legalDestinations: destinations };
  }

  getMoveHistory(gameId) {
    const game = this.getGameOrThrow(gameId);
    const moves = game.board.getMoveHistory();

    const history = moves.map((m, i) => {
      const number = Math.floor(i / 2) + 1;
      const isCheck = m.san && (m.san.endsWith('+') || m.san.endsWith('#'));
      const isCapture = !!m.capturedPiece || m.isEnPassant;
      return {
        moveNumber: number,
        color: m.movedPiece.color,
        from: m.from.toAlgebraic(),
        to: m.to.toAlgebraic(),
        san: m.san,
        uci: m.uci,
        isCapture,
        isCheck: !!isCheck
      };
    });

    return { gameId, history };
  }

  toGameResponse(game) {
    const history = game.board.getMoveHistory();
    const lastMove = history.length > 0 ? history[history.length - 1] : null;

    const resp = {
      gameId: game.id,
      mode: game.mode,
      status: game.status,
      fen: game.board.toFen(),
      turn: game.board.turn,
      winner: game.winner || null,
      inCheck: game.status === GameStatus.CHECK,
      checkmate: game.status === GameStatus.CHECKMATE,
      draw: GameStatus.isDraw(game.status),
      lastMoveSan: lastMove ? lastMove.san : null,
      lastMoveUci: lastMove ? lastMove.uci : null,
      whitePlayer: game.whitePlayer,
      blackPlayer: game.blackPlayer,
      whiteTimeRemainingMs: game.whiteTimeRemainingMs,
      blackTimeRemainingMs: game.blackTimeRemainingMs,
      fullmoveNumber: game.board.fullmoveNumber,
      halfmoveClock: game.board.halfmoveClock,
      capturedByWhite: [],
      capturedByBlack: []
    };

    this._computeCapturedPieces(game.board, resp);
    return resp;
  }

  _computeCapturedPieces(board, resp) {
    const startingWhite = { P: 8, R: 2, N: 2, B: 2, Q: 1 };
    const startingBlack = { p: 8, r: 2, n: 2, b: 2, q: 1 };

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board.getPieceAt(r, c);
        if (p) {
          const fen = p.getFenChar();
          if (fen === fen.toUpperCase() && startingWhite[fen] !== undefined) {
            startingWhite[fen]--;
          } else if (startingBlack[fen] !== undefined) {
            startingBlack[fen]--;
          }
        }
      }
    }

    const capturedByBlack = [];
    for (const [ch, remaining] of Object.entries(startingWhite)) {
      for (let i = 0; i < remaining; i++) capturedByBlack.push(ch);
    }

    const capturedByWhite = [];
    for (const [ch, remaining] of Object.entries(startingBlack)) {
      for (let i = 0; i < remaining; i++) capturedByWhite.push(ch.toUpperCase());
    }

    resp.capturedByWhite = capturedByWhite;
    resp.capturedByBlack = capturedByBlack;
  }

  getChessEngine() {
    return this.chessEngine;
  }
}

module.exports = GameService;
