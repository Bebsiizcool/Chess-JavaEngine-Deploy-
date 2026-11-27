// models/Pawn.js
const Piece = require('./Piece');
const Position = require('./Position');
const { PieceColor, PieceType } = require('./enums');

class Pawn extends Piece {
  constructor(color, hasMoved = false) {
    super(color, PieceType.PAWN, hasMoved);
  }

  getCandidateMoves(board, currentPos) {
    const moves = [];
    const direction = this.color === PieceColor.WHITE ? 1 : -1;
    const startRow = this.color === PieceColor.WHITE ? 1 : 6;
    const currentRow = currentPos.row;
    const currentCol = currentPos.col;

    // 1. One step forward
    const oneStepRow = currentRow + direction;
    if (Position.isValid(oneStepRow, currentCol)) {
      const oneStepPos = new Position(oneStepRow, currentCol);
      if (board.isSquareEmpty(oneStepPos)) {
        moves.push(oneStepPos);
        // 2. Two steps forward from initial rank
        const twoStepRow = currentRow + 2 * direction;
        if (currentRow === startRow && Position.isValid(twoStepRow, currentCol)) {
          const twoStepPos = new Position(twoStepRow, currentCol);
          if (board.isSquareEmpty(twoStepPos)) {
            moves.push(twoStepPos);
          }
        }
      }
    }

    // 3. Diagonal captures
    for (const c of [currentCol - 1, currentCol + 1]) {
      if (Position.isValid(oneStepRow, c)) {
        const diagPos = new Position(oneStepRow, c);
        const targetPiece = board.getPieceAt(diagPos);
        if (targetPiece && targetPiece.color !== this.color) {
          moves.push(diagPos);
        } else if (board.enPassantTarget && diagPos.equals(board.enPassantTarget)) {
          moves.push(diagPos);
        }
      }
    }

    return moves;
  }

  copy() {
    return new Pawn(this.color, this._hasMoved);
  }
}

module.exports = Pawn;
