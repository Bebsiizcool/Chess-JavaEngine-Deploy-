// models/Queen.js
const Piece = require('./Piece');
const { PieceType } = require('./enums');

class Queen extends Piece {
  constructor(color, hasMoved = false) {
    super(color, PieceType.QUEEN, hasMoved);
  }

  getCandidateMoves(board, currentPos) {
    const moves = [];
    // Orthogonal
    this.addRayMoves(board, currentPos, 1, 0, moves);
    this.addRayMoves(board, currentPos, -1, 0, moves);
    this.addRayMoves(board, currentPos, 0, 1, moves);
    this.addRayMoves(board, currentPos, 0, -1, moves);
    // Diagonal
    this.addRayMoves(board, currentPos, 1, 1, moves);
    this.addRayMoves(board, currentPos, 1, -1, moves);
    this.addRayMoves(board, currentPos, -1, 1, moves);
    this.addRayMoves(board, currentPos, -1, -1, moves);
    return moves;
  }

  copy() {
    return new Queen(this.color, this._hasMoved);
  }
}

module.exports = Queen;
