// engine/MoveValidator.js
const Position = require('../models/Position');
const Move = require('../models/Move');
const Pawn = require('../models/Pawn');
const King = require('../models/King');
const { PieceColor, PieceType } = require('../models/enums');

class MoveValidator {
  isValidMove(board, move) {
    if (!board || !move) return false;
    const piece = board.getPieceAt(move.from);
    if (!piece || piece.color !== board.turn) return false;
    const legalMoves = this.getLegalMoves(board, move.from);
    return legalMoves.some(m => m.equals(move));
  }

  getLegalMoves(board, from) {
    const legalMoves = [];
    if (!board || !from) return legalMoves;

    const piece = board.getPieceAt(from);
    if (!piece || piece.color !== board.turn) return legalMoves;

    const candidates = piece.getCandidateMoves(board, from);

    for (const to of candidates) {
      let capturedPiece = board.getPieceAt(to);
      const isCastling = (piece instanceof King) && Math.abs(to.col - from.col) === 2;
      const isEnPassant = (piece instanceof Pawn) &&
        board.enPassantTarget && to.equals(board.enPassantTarget) &&
        from.col !== to.col && !capturedPiece;

      if (isEnPassant) {
        capturedPiece = board.getPieceAt(from.row, to.col);
      }

      const isPromotion = (piece instanceof Pawn) &&
        ((piece.color === PieceColor.WHITE && to.row === 7) ||
         (piece.color === PieceColor.BLACK && to.row === 0));

      if (isPromotion) {
        for (const promoType of [PieceType.QUEEN, PieceType.ROOK, PieceType.BISHOP, PieceType.KNIGHT]) {
          const candidateMove = new Move(
            from, to, piece, capturedPiece, promoType,
            isCastling, isEnPassant,
            board.enPassantTarget, board.halfmoveClock
          );
          if (!this.leavesKingInCheck(board, candidateMove)) {
            legalMoves.push(candidateMove);
          }
        }
      } else {
        const candidateMove = new Move(
          from, to, piece, capturedPiece, null,
          isCastling, isEnPassant,
          board.enPassantTarget, board.halfmoveClock
        );
        if (!this.leavesKingInCheck(board, candidateMove)) {
          legalMoves.push(candidateMove);
        }
      }
    }

    return legalMoves;
  }

  getAllLegalMoves(board, color) {
    const allMoves = [];
    if (!board || !color) return allMoves;

    const originalTurn = board.turn;
    board.turn = color;

    try {
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const pos = new Position(r, c);
          const piece = board.getPieceAt(pos);
          if (piece && piece.color === color) {
            allMoves.push(...this.getLegalMoves(board, pos));
          }
        }
      }
    } finally {
      board.turn = originalTurn;
    }

    return allMoves;
  }

  leavesKingInCheck(board, move) {
    const simBoard = board.copy();
    const simPiece = simBoard.getPieceAt(move.from);
    if (!simPiece) return true;

    let simCaptured = null;
    if (move.capturedPiece) {
      if (move.isEnPassant) {
        simCaptured = simBoard.getPieceAt(move.from.row, move.to.col);
      } else {
        simCaptured = simBoard.getPieceAt(move.to);
      }
    }

    const simMove = new Move(
      move.from, move.to, simPiece, simCaptured,
      move.promotionType, move.isCastling, move.isEnPassant,
      simBoard.enPassantTarget, simBoard.halfmoveClock
    );

    simBoard.executeMove(simMove);
    return simBoard.isInCheck(simPiece.color);
  }

  computeSan(boardBeforeMove, move) {
    if (move.isCastling) {
      return move.to.col === 6 ? 'O-O' : 'O-O-O';
    }

    const piece = move.movedPiece;
    let san = '';

    if (piece instanceof Pawn) {
      if (move.capturedPiece || move.isEnPassant) {
        san += String.fromCharCode('a'.charCodeAt(0) + move.from.col);
        san += 'x';
      }
      san += move.to.toAlgebraic();
      if (move.promotionType) {
        san += '=' + move.promotionType.symbol;
      }
    } else {
      san += piece.type.symbol;

      // Ambiguity check
      const allMoves = this.getAllLegalMoves(boardBeforeMove, piece.color);
      const ambiguous = allMoves.filter(m =>
        m.movedPiece.type === piece.type &&
        !m.from.equals(move.from) &&
        m.to.equals(move.to)
      );

      if (ambiguous.length > 0) {
        const sameCol = ambiguous.some(m => m.from.col === move.from.col);
        const sameRow = ambiguous.some(m => m.from.row === move.from.row);
        if (!sameCol) {
          san += String.fromCharCode('a'.charCodeAt(0) + move.from.col);
        } else if (!sameRow) {
          san += (move.from.row + 1);
        } else {
          san += move.from.toAlgebraic();
        }
      }

      if (move.capturedPiece) {
        san += 'x';
      }
      san += move.to.toAlgebraic();
    }

    // Check/checkmate annotation
    const simBoard = boardBeforeMove.copy();
    const simPiece = simBoard.getPieceAt(move.from);
    let simCaptured = null;
    if (move.capturedPiece) {
      simCaptured = move.isEnPassant
        ? simBoard.getPieceAt(move.from.row, move.to.col)
        : simBoard.getPieceAt(move.to);
    }

    const simMove = new Move(
      move.from, move.to, simPiece || piece, simCaptured,
      move.promotionType, move.isCastling, move.isEnPassant,
      simBoard.enPassantTarget, simBoard.halfmoveClock
    );
    simBoard.executeMove(simMove);

    const opponent = PieceColor.opposite(piece.color);
    const inCheck = simBoard.isInCheck(opponent);
    if (inCheck) {
      const hasLegalMoves = this.getAllLegalMoves(simBoard, opponent).length > 0;
      san += hasLegalMoves ? '+' : '#';
    }

    return san;
  }
}

module.exports = MoveValidator;
