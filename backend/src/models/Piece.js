// models/Piece.js
const Position = require('./Position');
const { PieceColor } = require('./enums');

class Piece {
  constructor(color, type, hasMoved = false) {
    this.color = color;
    this.type = type;
    this._hasMoved = hasMoved;
  }

  hasMoved() { return this._hasMoved; }
  setHasMoved(val) { this._hasMoved = val; }

  /** Override in subclass */
  getCandidateMoves(board, currentPos) {
    return [];
  }

  /** Override in subclass */
  copy() {
    return new Piece(this.color, this.type, this._hasMoved);
  }

  /** Helper for sliding pieces (Rook, Bishop, Queen) */
  addRayMoves(board, currentPos, dRow, dCol, moves) {
    let r = currentPos.row + dRow;
    let c = currentPos.col + dCol;
    while (Position.isValid(r, c)) {
      const target = new Position(r, c);
      const targetPiece = board.getPieceAt(target);
      if (!targetPiece) {
        moves.push(target);
      } else {
        if (targetPiece.color !== this.color) {
          moves.push(target);
        }
        break;
      }
      r += dRow;
      c += dCol;
    }
  }

  getFenChar() {
    const ch = this.type.symbol;
    return this.color === PieceColor.WHITE ? ch.toUpperCase() : ch.toLowerCase();
  }

  toString() {
    return this.color + '_' + this.type.name;
  }
}

module.exports = Piece;
