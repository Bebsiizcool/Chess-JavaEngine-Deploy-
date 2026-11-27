// models/Move.js
const Position = require('./Position');

class Move {
  constructor(from, to, movedPiece, capturedPiece, promotionType, isCastling, isEnPassant, prevEnPassantTarget, prevHalfmoveClock) {
    this.from = from;
    this.to = to;
    this.movedPiece = movedPiece;
    this.capturedPiece = capturedPiece || null;
    this.promotionType = promotionType || null;
    this.isCastling = !!isCastling;
    this.isEnPassant = !!isEnPassant;
    this.prevEnPassantTarget = prevEnPassantTarget || null;
    this.prevHalfmoveClock = prevHalfmoveClock || 0;
    this.movedPiecePrevHasMoved = movedPiece.hasMoved();

    // Rook info for castling undo
    this.rookFrom = null;
    this.rookTo = null;
    this.rookMoved = null;

    // SAN notation
    this.san = null;

    // Build UCI
    let baseUci = from.toAlgebraic() + to.toAlgebraic();
    if (this.promotionType) {
      baseUci += this.promotionType.symbol.toLowerCase();
    }
    this.uci = baseUci;
  }

  equals(other) {
    if (!other) return false;
    return this.from.equals(other.from) &&
           this.to.equals(other.to) &&
           this.promotionType === other.promotionType;
  }

  toString() {
    return this.san || this.uci;
  }
}

module.exports = Move;
