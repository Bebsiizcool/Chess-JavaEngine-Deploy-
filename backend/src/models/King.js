// models/King.js
const Piece = require('./Piece');
const Position = require('./Position');
const Rook = require('./Rook');
const { PieceColor, PieceType } = require('./enums');

const KING_OFFSETS = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [1, -1], [-1, 1], [-1, -1]
];

class King extends Piece {
  constructor(color, hasMoved = false) {
    super(color, PieceType.KING, hasMoved);
  }

  getCandidateMoves(board, currentPos) {
    const moves = [];

    // Standard single-step
    for (const [dr, dc] of KING_OFFSETS) {
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

    // Castling
    if (!this.hasMoved() && !board.isSquareUnderAttack(currentPos, PieceColor.opposite(this.color))) {
      this._addCastlingMoves(board, currentPos, moves);
    }

    return moves;
  }

  _addCastlingMoves(board, currentPos, moves) {
    const row = currentPos.row;
    const enemyColor = PieceColor.opposite(this.color);

    // Kingside
    const ksRook = board.getPieceAt(new Position(row, 7));
    if (ksRook instanceof Rook && !ksRook.hasMoved()) {
      const fSq = new Position(row, 5);
      const gSq = new Position(row, 6);
      if (board.isSquareEmpty(fSq) && board.isSquareEmpty(gSq)) {
        if (!board.isSquareUnderAttack(fSq, enemyColor) &&
            !board.isSquareUnderAttack(gSq, enemyColor)) {
          moves.push(gSq);
        }
      }
    }

    // Queenside
    const qsRook = board.getPieceAt(new Position(row, 0));
    if (qsRook instanceof Rook && !qsRook.hasMoved()) {
      const bSq = new Position(row, 1);
      const cSq = new Position(row, 2);
      const dSq = new Position(row, 3);
      if (board.isSquareEmpty(bSq) && board.isSquareEmpty(cSq) && board.isSquareEmpty(dSq)) {
        if (!board.isSquareUnderAttack(dSq, enemyColor) &&
            !board.isSquareUnderAttack(cSq, enemyColor)) {
          moves.push(cSq);
        }
      }
    }
  }

  copy() {
    return new King(this.color, this._hasMoved);
  }
}

module.exports = King;
