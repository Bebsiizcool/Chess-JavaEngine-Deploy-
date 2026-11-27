// models/Bishop.js
const Piece = require('./Piece');
const { PieceType } = require('./enums');

class Bishop extends Piece {
  constructor(color, hasMoved = false) {
    super(color, PieceType.BISHOP, hasMoved);
  }

  getCandidateMoves(board, currentPos) {
    const moves = [];
    this.addRayMoves(board, currentPos, 1, 1, moves);
    this.addRayMoves(board, currentPos, 1, -1, moves);
    this.addRayMoves(board, currentPos, -1, 1, moves);
    this.addRayMoves(board, currentPos, -1, -1, moves);
    return moves;
  }

  copy() {
    return new Bishop(this.color, this._hasMoved);
  }
}

module.exports = Bishop;
