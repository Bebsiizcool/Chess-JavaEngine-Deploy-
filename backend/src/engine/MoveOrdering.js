// engine/MoveOrdering.js
const { PieceType } = require('../models/enums');

function scoreMove(move) {
  let score = 0;

  // MVV-LVA
  if (move.capturedPiece) {
    const victimValue = move.capturedPiece.type.baseValue;
    const attackerValue = move.movedPiece.type.baseValue;
    score += 10 * victimValue - attackerValue + 1000;
  }

  // En passant
  if (move.isEnPassant) {
    score += 10 * PieceType.PAWN.baseValue - PieceType.PAWN.baseValue + 1000;
  }

  // Promotion
  if (move.promotionType) {
    score += move.promotionType.baseValue + 800;
  }

  // Castling
  if (move.isCastling) {
    score += 100;
  }

  return score;
}

function orderMoves(moves) {
  moves.sort((a, b) => scoreMove(b) - scoreMove(a));
}

module.exports = { orderMoves };
