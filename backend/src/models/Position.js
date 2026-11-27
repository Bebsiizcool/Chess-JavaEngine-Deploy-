// models/Position.js
class Position {
  constructor(row, col) {
    if (!Position.isValid(row, col)) {
      throw new Error(`Invalid chessboard coordinates: row=${row}, col=${col}`);
    }
    this.row = row;
    this.col = col;
  }

  static isValid(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }

  static fromAlgebraic(square) {
    if (!square || square.length !== 2) {
      throw new Error('Invalid algebraic square: ' + square);
    }
    const file = square.charAt(0).toLowerCase();
    const rank = square.charAt(1);
    const col = file.charCodeAt(0) - 'a'.charCodeAt(0);
    const row = parseInt(rank) - 1;
    return new Position(row, col);
  }

  toAlgebraic() {
    const file = String.fromCharCode('a'.charCodeAt(0) + this.col);
    const rank = String.fromCharCode('1'.charCodeAt(0) + this.row);
    return file + rank;
  }

  equals(other) {
    if (!other) return false;
    return this.row === other.row && this.col === other.col;
  }

  toString() {
    return this.toAlgebraic();
  }
}

module.exports = Position;
