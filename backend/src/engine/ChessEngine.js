// engine/ChessEngine.js
const MoveValidator = require('./MoveValidator');
const { PieceColor, PieceType, GameStatus } = require('../models/enums');

class ChessEngine {
  constructor(moveValidator) {
    this.moveValidator = moveValidator || new MoveValidator();
  }

  generateLegalMoves(board, from) {
    if (from) {
      return this.moveValidator.getLegalMoves(board, from);
    }
    return this.moveValidator.getAllLegalMoves(board, board.turn);
  }

  makeMove(board, from, to, promotionType) {
    const legalMoves = this.moveValidator.getLegalMoves(board, from);

    let matchedMove = null;
    for (const move of legalMoves) {
      if (move.to.equals(to)) {
        if (move.promotionType) {
          const expectedPromo = promotionType || PieceType.QUEEN;
          if (move.promotionType === expectedPromo) {
            matchedMove = move;
            break;
          }
        } else {
          matchedMove = move;
          break;
        }
      }
    }

    if (!matchedMove) {
      const err = new Error(`Illegal move from ${from.toAlgebraic()} to ${to.toAlgebraic()}`);
      err.statusCode = 400;
      err.type = 'IllegalMove';
      throw err;
    }

    // Compute SAN before mutating the board
    const san = this.moveValidator.computeSan(board, matchedMove);
    matchedMove.san = san;

    board.executeMove(matchedMove);
    return matchedMove;
  }

  undoMove(board) {
    const undone = board.undoMove();
    return undone !== null;
  }

  evaluateGameStatus(board) {
    const activeTurn = board.turn;
    const legalMoves = this.generateLegalMoves(board);
    const inCheck = this.isCheck(board, activeTurn);

    if (legalMoves.length === 0) {
      return inCheck ? GameStatus.CHECKMATE : GameStatus.STALEMATE;
    }

    if (board.isInsufficientMaterial()) return GameStatus.DRAW_INSUFFICIENT_MATERIAL;
    if (board.isThreefoldRepetition()) return GameStatus.DRAW_THREEFOLD_REPETITION;
    if (board.isFiftyMoveRule()) return GameStatus.DRAW_FIFTY_MOVE_RULE;

    return inCheck ? GameStatus.CHECK : GameStatus.ACTIVE;
  }

  isCheck(board, color) {
    return board.isInCheck(color);
  }

  isCheckmate(board, color) {
    return board.isInCheck(color) && this.moveValidator.getAllLegalMoves(board, color).length === 0;
  }

  isStalemate(board, color) {
    return !board.isInCheck(color) && this.moveValidator.getAllLegalMoves(board, color).length === 0;
  }

  isDraw(board) {
    const status = this.evaluateGameStatus(board);
    return GameStatus.isDraw(status);
  }

  getMoveValidator() {
    return this.moveValidator;
  }
}

module.exports = ChessEngine;
