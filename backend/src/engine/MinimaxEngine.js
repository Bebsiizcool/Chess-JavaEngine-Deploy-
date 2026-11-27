// engine/MinimaxEngine.js
const MoveValidator = require('./MoveValidator');
const PositionEvaluator = require('./PositionEvaluator');
const MoveOrdering = require('./MoveOrdering');
const { PieceColor, Difficulty } = require('../models/enums');

const CHECKMATE_SCORE = 100000;
const POSITIVE_INFINITY = 1000000;
const NEGATIVE_INFINITY = -1000000;

class MinimaxEngine {
  constructor(difficulty) {
    this.difficulty = difficulty || Difficulty.MEDIUM;
    this.evaluator = new PositionEvaluator();
    this.moveValidator = new MoveValidator();
  }

  calculateBestMove(board, chosenDifficulty) {
    if (chosenDifficulty) this.difficulty = chosenDifficulty;

    const aiColor = board.turn;
    const legalMoves = this.moveValidator.getAllLegalMoves(board, aiColor);

    if (legalMoves.length === 0) return null;

    // Easy mode random
    if (this.difficulty === Difficulty.EASY &&
        Math.random() < this.difficulty.randomness &&
        legalMoves.length > 1) {
      return legalMoves[Math.floor(Math.random() * legalMoves.length)];
    }

    const searchDepth = this.difficulty.searchDepth;
    const isMaximizing = aiColor === PieceColor.WHITE;

    MoveOrdering.orderMoves(legalMoves);

    let bestMove = legalMoves[0];
    let bestValue = isMaximizing ? NEGATIVE_INFINITY : POSITIVE_INFINITY;
    let alpha = NEGATIVE_INFINITY;
    let beta = POSITIVE_INFINITY;
    const equallyGoodMoves = [];

    for (const move of legalMoves) {
      board.executeMove(move);
      const score = this._minimax(board, searchDepth - 1, alpha, beta, !isMaximizing);
      board.undoMove();

      if (isMaximizing) {
        if (score > bestValue) {
          bestValue = score;
          bestMove = move;
          equallyGoodMoves.length = 0;
          equallyGoodMoves.push(move);
        } else if (score === bestValue) {
          equallyGoodMoves.push(move);
        }
        alpha = Math.max(alpha, bestValue);
      } else {
        if (score < bestValue) {
          bestValue = score;
          bestMove = move;
          equallyGoodMoves.length = 0;
          equallyGoodMoves.push(move);
        } else if (score === bestValue) {
          equallyGoodMoves.push(move);
        }
        beta = Math.min(beta, bestValue);
      }

      if (beta <= alpha) break;
    }

    if (equallyGoodMoves.length > 0) {
      return equallyGoodMoves[Math.floor(Math.random() * equallyGoodMoves.length)];
    }

    return bestMove;
  }

  _minimax(board, depth, alpha, beta, isMaximizing) {
    const activeTurn = board.turn;
    const legalMoves = this.moveValidator.getAllLegalMoves(board, activeTurn);

    // Terminal states
    if (legalMoves.length === 0) {
      if (board.isInCheck(activeTurn)) {
        return isMaximizing
          ? (-CHECKMATE_SCORE + (10 - depth))
          : (CHECKMATE_SCORE - (10 - depth));
      }
      return 0; // Stalemate
    }

    if (board.isInsufficientMaterial() || board.isThreefoldRepetition() || board.isFiftyMoveRule()) {
      return 0;
    }

    // Leaf node
    if (depth <= 0) {
      return this.evaluator.evaluate(board);
    }

    MoveOrdering.orderMoves(legalMoves);

    if (isMaximizing) {
      let maxEval = NEGATIVE_INFINITY;
      for (const move of legalMoves) {
        board.executeMove(move);
        const evalScore = this._minimax(board, depth - 1, alpha, beta, false);
        board.undoMove();
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = POSITIVE_INFINITY;
      for (const move of legalMoves) {
        board.executeMove(move);
        const evalScore = this._minimax(board, depth - 1, alpha, beta, true);
        board.undoMove();
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }
}

module.exports = MinimaxEngine;
