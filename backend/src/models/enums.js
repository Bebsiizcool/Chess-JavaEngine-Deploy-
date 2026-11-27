// models/enums.js

const PieceColor = {
  WHITE: 'WHITE',
  BLACK: 'BLACK',
  opposite(color) {
    return color === 'WHITE' ? 'BLACK' : 'WHITE';
  }
};

const PieceType = {
  PAWN:   { name: 'PAWN',   symbol: 'P', baseValue: 100   },
  KNIGHT: { name: 'KNIGHT', symbol: 'N', baseValue: 320   },
  BISHOP: { name: 'BISHOP', symbol: 'B', baseValue: 330   },
  ROOK:   { name: 'ROOK',   symbol: 'R', baseValue: 500   },
  QUEEN:  { name: 'QUEEN',  symbol: 'Q', baseValue: 900   },
  KING:   { name: 'KING',   symbol: 'K', baseValue: 20000 },
  fromName(name) {
    return PieceType[name] || null;
  }
};

const Difficulty = {
  EASY:   { name: 'EASY',   searchDepth: 1, randomness: 0.40 },
  MEDIUM: { name: 'MEDIUM', searchDepth: 3, randomness: 0.05 },
  HARD:   { name: 'HARD',   searchDepth: 4, randomness: 0.0  },
  fromName(name) {
    return Difficulty[name] || Difficulty.MEDIUM;
  }
};

const GameMode = {
  VS_COMPUTER: 'VS_COMPUTER',
  TWO_PLAYER_LOCAL: 'TWO_PLAYER_LOCAL',
  MULTIPLAYER_ONLINE: 'MULTIPLAYER_ONLINE'
};

const GameStatus = {
  ACTIVE: 'ACTIVE',
  CHECK: 'CHECK',
  CHECKMATE: 'CHECKMATE',
  STALEMATE: 'STALEMATE',
  DRAW_INSUFFICIENT_MATERIAL: 'DRAW_INSUFFICIENT_MATERIAL',
  DRAW_THREEFOLD_REPETITION: 'DRAW_THREEFOLD_REPETITION',
  DRAW_FIFTY_MOVE_RULE: 'DRAW_FIFTY_MOVE_RULE',
  DRAW_AGREED: 'DRAW_AGREED',
  RESIGNED: 'RESIGNED',

  isGameOver(status) {
    return status !== 'ACTIVE' && status !== 'CHECK';
  },

  isDraw(status) {
    return status === 'STALEMATE' ||
           status === 'DRAW_INSUFFICIENT_MATERIAL' ||
           status === 'DRAW_THREEFOLD_REPETITION' ||
           status === 'DRAW_FIFTY_MOVE_RULE' ||
           status === 'DRAW_AGREED';
  }
};

module.exports = { PieceColor, PieceType, Difficulty, GameMode, GameStatus };
