export type PieceColor = "WHITE" | "BLACK";
export type PieceType = "PAWN" | "KNIGHT" | "BISHOP" | "ROOK" | "QUEEN" | "KING";
export type GameMode = "VS_COMPUTER" | "TWO_PLAYER_LOCAL" | "MULTIPLAYER_ONLINE";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type GameStatus =
  | "ACTIVE"
  | "CHECK"
  | "CHECKMATE"
  | "STALEMATE"
  | "DRAW_INSUFFICIENT_MATERIAL"
  | "DRAW_THREEFOLD_REPETITION"
  | "DRAW_FIFTY_MOVE_RULE"
  | "DRAW_AGREED"
  | "RESIGNED";

export interface Player {
  id: string;
  name: string;
  color: PieceColor;
  ai: boolean;
  difficulty?: Difficulty;
}

export interface GameResponse {
  gameId: string;
  mode: GameMode;
  status: GameStatus;
  fen: string;
  turn: PieceColor;
  winner?: PieceColor | null;
  inCheck: boolean;
  checkmate: boolean;
  draw: boolean;
  lastMoveSan?: string;
  lastMoveUci?: string;
  whitePlayer: Player;
  blackPlayer: Player;
  whiteTimeRemainingMs: number;
  blackTimeRemainingMs: number;
  fullmoveNumber: number;
  halfmoveClock: number;
  capturedByWhite: string[];
  capturedByBlack: string[];
}

export interface MoveRequest {
  from: string;
  to: string;
  promotionType?: PieceType;
}

export interface LegalMovesResponse {
  square: string;
  legalDestinations: string[];
}

export interface MoveHistoryItem {
  moveNumber: number;
  color: PieceColor;
  from: string;
  to: string;
  san: string;
  uci: string;
  isCapture: boolean;
  isCheck: boolean;
}

export interface HistoryResponse {
  gameId: string;
  history: MoveHistoryItem[];
}
