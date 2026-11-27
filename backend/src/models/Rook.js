// models/Rook.js
const Piece = require('./Piece');
const { PieceType } = require('./enums');

class Rook extends Piece {
  constructor(color, hasMoved = false) {
    super(color, PieceType.ROOK, hasMoved);
  }

  getCandidateMoves(board, currentPos) {
    const moves = [];
    this.addRayMoves(board, currentPos, 1, 0, moves);
    this.addRayMoves(board, currentPos, -1, 0, moves);
    this.addRayMoves(board, currentPos, 0, 1, moves);
    this.addRayMoves(board, currentPos, 0, -1, moves);
    return moves;
  }

  copy() {
    return new Rook(this.color, this._hasMoved);
  }
}

module.exports = Rook;
