// models/Knight.js
const Piece = require('./Piece');
const Position = require('./Position');
const { PieceType } = require('./enums');

const KNIGHT_OFFSETS = [
  [2, 1], [2, -1], [-2, 1], [-2, -1],
  [1, 2], [1, -2], [-1, 2], [-1, -2]
];

class Knight extends Piece {
  constructor(color, hasMoved = false) {
    super(color, PieceType.KNIGHT, hasMoved);
  }

  getCandidateMoves(board, currentPos) {
    const moves = [];
    for (const [dr, dc] of KNIGHT_OFFSETS) {
      const nr = currentPos.row + dr;
      const nc = currentPos.col + dc;
      if (Position.isValid(nr, nc)) {
        const target = new Position(nr, nc);
        const tp = board.getPieceAt(target);
        if (!tp || tp.color !== this.color) {
          moves.push(target);
        }
      }
    }
    return moves;
  }

  copy() {
    return new Knight(this.color, this._hasMoved);
  }
}

module.exports = Knight;
