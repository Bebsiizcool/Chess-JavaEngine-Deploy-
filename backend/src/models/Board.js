// models/Board.js
const Position = require('./Position');
const { PieceColor, PieceType } = require('./enums');
const Pawn = require('./Pawn');
const Knight = require('./Knight');
const Bishop = require('./Bishop');
const Rook = require('./Rook');
const Queen = require('./Queen');
const King = require('./King');

class Board {
  constructor() {
    this.grid = Array.from({ length: 8 }, () => Array(8).fill(null));
    this.turn = PieceColor.WHITE;
    this.enPassantTarget = null;
    this.halfmoveClock = 0;
    this.fullmoveNumber = 1;
    this.moveHistory = [];
    this.positionHistory = {};
  }

  initializeStandardBoard() {
    this.clear();

    // White pieces (row 0 = rank 1)
    this.grid[0][0] = new Rook(PieceColor.WHITE);
    this.grid[0][1] = new Knight(PieceColor.WHITE);
    this.grid[0][2] = new Bishop(PieceColor.WHITE);
    this.grid[0][3] = new Queen(PieceColor.WHITE);
    this.grid[0][4] = new King(PieceColor.WHITE);
    this.grid[0][5] = new Bishop(PieceColor.WHITE);
    this.grid[0][6] = new Knight(PieceColor.WHITE);
    this.grid[0][7] = new Rook(PieceColor.WHITE);
    for (let c = 0; c < 8; c++) this.grid[1][c] = new Pawn(PieceColor.WHITE);

    // Black pieces (row 7 = rank 8)
    this.grid[7][0] = new Rook(PieceColor.BLACK);
    this.grid[7][1] = new Knight(PieceColor.BLACK);
    this.grid[7][2] = new Bishop(PieceColor.BLACK);
    this.grid[7][3] = new Queen(PieceColor.BLACK);
    this.grid[7][4] = new King(PieceColor.BLACK);
    this.grid[7][5] = new Bishop(PieceColor.BLACK);
    this.grid[7][6] = new Knight(PieceColor.BLACK);
    this.grid[7][7] = new Rook(PieceColor.BLACK);
    for (let c = 0; c < 8; c++) this.grid[6][c] = new Pawn(PieceColor.BLACK);

    this.turn = PieceColor.WHITE;
    this.enPassantTarget = null;
    this.halfmoveClock = 0;
    this.fullmoveNumber = 1;
    this.moveHistory = [];
    this.positionHistory = {};
    this._recordCurrentPosition();
  }

  clear() {
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        this.grid[r][c] = null;
    this.enPassantTarget = null;
    this.halfmoveClock = 0;
    this.fullmoveNumber = 1;
    this.turn = PieceColor.WHITE;
    this.moveHistory = [];
    this.positionHistory = {};
  }

  getPieceAt(posOrRow, col) {
    if (typeof posOrRow === 'number') {
      if (!Position.isValid(posOrRow, col)) return null;
      return this.grid[posOrRow][col];
    }
    if (!posOrRow || !Position.isValid(posOrRow.row, posOrRow.col)) return null;
    return this.grid[posOrRow.row][posOrRow.col];
  }

  setPieceAt(pos, piece) {
    if (pos && Position.isValid(pos.row, pos.col)) {
      this.grid[pos.row][pos.col] = piece;
    }
  }

  isSquareEmpty(pos) {
    return this.getPieceAt(pos) === null;
  }

  isOccupiedBy(pos, color) {
    const p = this.getPieceAt(pos);
    return p !== null && p.color === color;
  }

  findKing(color) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.grid[r][c];
        if (p instanceof King && p.color === color) {
          return new Position(r, c);
        }
      }
    }
    return null;
  }

  isSquareUnderAttack(targetSquare, attackingColor) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const attacker = this.grid[r][c];
        if (attacker && attacker.color === attackingColor) {
          const attackerPos = new Position(r, c);

          if (attacker instanceof Pawn) {
            const pawnDir = attackingColor === PieceColor.WHITE ? 1 : -1;
            if (targetSquare.row === r + pawnDir &&
                (targetSquare.col === c - 1 || targetSquare.col === c + 1)) {
              return true;
            }
          } else if (attacker instanceof King) {
            const dRow = Math.abs(targetSquare.row - r);
            const dCol = Math.abs(targetSquare.col - c);
            if (dRow <= 1 && dCol <= 1) {
              return true;
            }
          } else {
            const moves = attacker.getCandidateMoves(this, attackerPos);
            if (moves.some(m => m.equals(targetSquare))) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  isInCheck(color) {
    const kingPos = this.findKing(color);
    if (!kingPos) return false;
    return this.isSquareUnderAttack(kingPos, PieceColor.opposite(color));
  }

  executeMove(move) {
    const from = move.from;
    const to = move.to;
    const movingPiece = move.movedPiece;

    // 1. Halfmove clock
    if (movingPiece instanceof Pawn || move.capturedPiece) {
      this.halfmoveClock = 0;
    } else {
      this.halfmoveClock++;
    }

    // 2. Remove from source
    this.grid[from.row][from.col] = null;

    // 3. En passant capture
    if (move.isEnPassant) {
      this.grid[from.row][to.col] = null;
    }

    // 4. Castling
    if (move.isCastling) {
      const row = from.row;
      if (to.col === 6) {
        // Kingside
        const rookFrom = new Position(row, 7);
        const rookTo = new Position(row, 5);
        const rook = this.grid[row][7];
        this.grid[row][5] = rook;
        this.grid[row][7] = null;
        if (rook) rook.setHasMoved(true);
        move.rookFrom = rookFrom;
        move.rookTo = rookTo;
        move.rookMoved = rook;
      } else if (to.col === 2) {
        // Queenside
        const rookFrom = new Position(row, 0);
        const rookTo = new Position(row, 3);
        const rook = this.grid[row][0];
        this.grid[row][3] = rook;
        this.grid[row][0] = null;
        if (rook) rook.setHasMoved(true);
        move.rookFrom = rookFrom;
        move.rookTo = rookTo;
        move.rookMoved = rook;
      }
    }

    // 5. Promotion
    let finalPiece = movingPiece;
    if (move.promotionType && movingPiece instanceof Pawn) {
      switch (move.promotionType.name) {
        case 'QUEEN':  finalPiece = new Queen(movingPiece.color, true); break;
        case 'ROOK':   finalPiece = new Rook(movingPiece.color, true); break;
        case 'BISHOP': finalPiece = new Bishop(movingPiece.color, true); break;
        case 'KNIGHT': finalPiece = new Knight(movingPiece.color, true); break;
        default:       finalPiece = new Queen(movingPiece.color, true); break;
      }
    }

    // 6. Place on destination
    this.grid[to.row][to.col] = finalPiece;
    movingPiece.setHasMoved(true);

    // 7. En passant target
    if (movingPiece instanceof Pawn && Math.abs(to.row - from.row) === 2) {
      const epRow = (from.row + to.row) / 2;
      this.enPassantTarget = new Position(epRow, from.col);
    } else {
      this.enPassantTarget = null;
    }

    // 8. Turn & fullmove
    if (this.turn === PieceColor.BLACK) {
      this.fullmoveNumber++;
    }
    this.turn = PieceColor.opposite(this.turn);

    // 9. History
    this.moveHistory.push(move);
    this._recordCurrentPosition();
  }

  undoMove() {
    if (this.moveHistory.length === 0) return null;

    this._unrecordCurrentPosition();
    const lastMove = this.moveHistory.pop();
    const from = lastMove.from;
    const to = lastMove.to;
    const movedPiece = lastMove.movedPiece;

    // 1. Revert piece
    movedPiece.setHasMoved(lastMove.movedPiecePrevHasMoved);
    this.grid[from.row][from.col] = movedPiece;

    // 2. Restore destination
    this.grid[to.row][to.col] = null;

    if (lastMove.isEnPassant) {
      this.grid[from.row][to.col] = lastMove.capturedPiece;
    } else if (lastMove.capturedPiece) {
      this.grid[to.row][to.col] = lastMove.capturedPiece;
    }

    // 3. Revert castling rook
    if (lastMove.isCastling && lastMove.rookFrom && lastMove.rookTo && lastMove.rookMoved) {
      this.grid[lastMove.rookTo.row][lastMove.rookTo.col] = null;
      this.grid[lastMove.rookFrom.row][lastMove.rookFrom.col] = lastMove.rookMoved;
      lastMove.rookMoved.setHasMoved(false);
    }

    // 4. Restore metadata
    this.enPassantTarget = lastMove.prevEnPassantTarget;
    this.halfmoveClock = lastMove.prevHalfmoveClock;
    this.turn = PieceColor.opposite(this.turn);
    if (this.turn === PieceColor.BLACK) {
      this.fullmoveNumber--;
    }

    return lastMove;
  }

  _recordCurrentPosition() {
    const key = this.getRepetitionKey();
    this.positionHistory[key] = (this.positionHistory[key] || 0) + 1;
  }

  _unrecordCurrentPosition() {
    const key = this.getRepetitionKey();
    if (this.positionHistory[key]) {
      this.positionHistory[key]--;
      if (this.positionHistory[key] <= 0) delete this.positionHistory[key];
    }
  }

  getRepetitionKey() {
    let sb = '';
    for (let r = 7; r >= 0; r--) {
      let empty = 0;
      for (let c = 0; c < 8; c++) {
        const p = this.grid[r][c];
        if (!p) {
          empty++;
        } else {
          if (empty > 0) { sb += empty; empty = 0; }
          sb += p.getFenChar();
        }
      }
      if (empty > 0) sb += empty;
      if (r > 0) sb += '/';
    }
    sb += ' ' + (this.turn === PieceColor.WHITE ? 'w' : 'b');
    sb += ' ' + this.getCastlingRightsString();
    sb += ' ' + (this.enPassantTarget ? this.enPassantTarget.toAlgebraic() : '-');
    return sb;
  }

  isThreefoldRepetition() {
    const key = this.getRepetitionKey();
    return (this.positionHistory[key] || 0) >= 3;
  }

  isFiftyMoveRule() {
    return this.halfmoveClock >= 100;
  }

  isInsufficientMaterial() {
    const whitePieces = [];
    const blackPieces = [];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.grid[r][c];
        if (p) {
          if (p instanceof Queen || p instanceof Rook || p instanceof Pawn) return false;
          if (p.color === PieceColor.WHITE) whitePieces.push({ piece: p, row: r, col: c });
          else blackPieces.push({ piece: p, row: r, col: c });
        }
      }
    }

    // K vs K
    if (whitePieces.length === 1 && blackPieces.length === 1) return true;

    // K+B vs K or K+N vs K
    if ((whitePieces.length === 2 && blackPieces.length === 1) ||
        (whitePieces.length === 1 && blackPieces.length === 2)) return true;

    // K+B vs K+B same color bishops
    if (whitePieces.length === 2 && blackPieces.length === 2) {
      const wMinor = whitePieces.find(e => !(e.piece instanceof King));
      const bMinor = blackPieces.find(e => !(e.piece instanceof King));
      if (wMinor && bMinor && wMinor.piece instanceof Bishop && bMinor.piece instanceof Bishop) {
        const wLight = (wMinor.row + wMinor.col) % 2 === 1;
        const bLight = (bMinor.row + bMinor.col) % 2 === 1;
        if (wLight === bLight) return true;
      }
    }

    return false;
  }

  getCastlingRightsString() {
    let sb = '';
    const wKing = this.getPieceAt(new Position(0, 4));
    if (wKing instanceof King && !wKing.hasMoved()) {
      const h1 = this.getPieceAt(new Position(0, 7));
      if (h1 instanceof Rook && !h1.hasMoved()) sb += 'K';
      const a1 = this.getPieceAt(new Position(0, 0));
      if (a1 instanceof Rook && !a1.hasMoved()) sb += 'Q';
    }
    const bKing = this.getPieceAt(new Position(7, 4));
    if (bKing instanceof King && !bKing.hasMoved()) {
      const h8 = this.getPieceAt(new Position(7, 7));
      if (h8 instanceof Rook && !h8.hasMoved()) sb += 'k';
      const a8 = this.getPieceAt(new Position(7, 0));
      if (a8 instanceof Rook && !a8.hasMoved()) sb += 'q';
    }
    return sb || '-';
  }

  toFen() {
    let fen = '';
    for (let r = 7; r >= 0; r--) {
      let empty = 0;
      for (let c = 0; c < 8; c++) {
        const p = this.grid[r][c];
        if (!p) {
          empty++;
        } else {
          if (empty > 0) { fen += empty; empty = 0; }
          fen += p.getFenChar();
        }
      }
      if (empty > 0) fen += empty;
      if (r > 0) fen += '/';
    }
    fen += ' ' + (this.turn === PieceColor.WHITE ? 'w' : 'b');
    fen += ' ' + this.getCastlingRightsString();
    fen += ' ' + (this.enPassantTarget ? this.enPassantTarget.toAlgebraic() : '-');
    fen += ' ' + this.halfmoveClock;
    fen += ' ' + this.fullmoveNumber;
    return fen;
  }

  loadFen(fen) {
    this.clear();
    const parts = fen.trim().split(/\s+/);
    if (parts.length < 1) return;

    const ranks = parts[0].split('/');
    for (let i = 0; i < 8 && i < ranks.length; i++) {
      const r = 7 - i;
      let col = 0;
      for (const ch of ranks[i]) {
        if (ch >= '1' && ch <= '8') {
          col += parseInt(ch);
        } else {
          const color = ch === ch.toUpperCase() ? PieceColor.WHITE : PieceColor.BLACK;
          const lower = ch.toLowerCase();
          let piece = null;
          switch (lower) {
            case 'p': piece = new Pawn(color); break;
            case 'n': piece = new Knight(color); break;
            case 'b': piece = new Bishop(color); break;
            case 'r': piece = new Rook(color); break;
            case 'q': piece = new Queen(color); break;
            case 'k': piece = new King(color); break;
          }
          if (piece && col < 8) {
            this.grid[r][col] = piece;
          }
          col++;
        }
      }
    }

    if (parts.length > 1) {
      this.turn = parts[1].toLowerCase() === 'b' ? PieceColor.BLACK : PieceColor.WHITE;
    }
    if (parts.length > 2) {
      const castling = parts[2];
      const wKing = this.getPieceAt(new Position(0, 4));
      if (wKing && !castling.includes('K') && !castling.includes('Q')) {
        wKing.setHasMoved(true);
      }
      const bKing = this.getPieceAt(new Position(7, 4));
      if (bKing && !castling.includes('k') && !castling.includes('q')) {
        bKing.setHasMoved(true);
      }
    }
    if (parts.length > 3 && parts[3] !== '-') {
      this.enPassantTarget = Position.fromAlgebraic(parts[3]);
    }
    if (parts.length > 4) {
      this.halfmoveClock = parseInt(parts[4]) || 0;
    }
    if (parts.length > 5) {
      this.fullmoveNumber = parseInt(parts[5]) || 1;
    }

    this._recordCurrentPosition();
  }

  copy() {
    const clone = new Board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (this.grid[r][c]) {
          clone.grid[r][c] = this.grid[r][c].copy();
        }
      }
    }
    clone.turn = this.turn;
    clone.enPassantTarget = this.enPassantTarget;
    clone.halfmoveClock = this.halfmoveClock;
    clone.fullmoveNumber = this.fullmoveNumber;
    clone.moveHistory = [...this.moveHistory];
    clone.positionHistory = { ...this.positionHistory };
    return clone;
  }

  getMoveHistory() {
    return this.moveHistory;
  }
}

module.exports = Board;
