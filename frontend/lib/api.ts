import {
  GameMode,
  Difficulty,
  PieceColor,
  GameResponse,
  MoveRequest,
  LegalMovesResponse,
  HistoryResponse,
} from "../types/chess";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export async function createGame(
  mode: GameMode,
  playerColor: string = "WHITE",
  difficulty: Difficulty = "MEDIUM",
  initialTimeMs: number = 600000
): Promise<GameResponse> {
  const res = await fetch(`${API_BASE}/games`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode, playerColor, difficulty, initialTimeMs }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Failed to initialize game" }));
    throw new Error(err.message || "Failed to create game");
  }
  return res.json();
}

export async function getGame(gameId: string): Promise<GameResponse> {
  const res = await fetch(`${API_BASE}/games/${gameId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch game state: ${res.statusText}`);
  }
  return res.json();
}

export async function submitMove(gameId: string, req: MoveRequest): Promise<GameResponse> {
  const res = await fetch(`${API_BASE}/games/${gameId}/moves`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Illegal move" }));
    throw new Error(err.message || "Move rejected by engine");
  }
  return res.json();
}

export async function triggerAIMove(gameId: string): Promise<GameResponse> {
  const res = await fetch(`${API_BASE}/games/${gameId}/ai-move`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "AI move failed" }));
    throw new Error(err.message || "AI calculation failed");
  }
  return res.json();
}

export async function undoMove(gameId: string): Promise<GameResponse> {
  const res = await fetch(`${API_BASE}/games/${gameId}/undo`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Cannot undo move" }));
    throw new Error(err.message || "Undo failed");
  }
  return res.json();
}

export async function restartGame(gameId: string): Promise<GameResponse> {
  const res = await fetch(`${API_BASE}/games/${gameId}/restart`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error("Failed to restart match");
  }
  return res.json();
}

export async function getLegalMoves(gameId: string, square: string): Promise<LegalMovesResponse> {
  const res = await fetch(`${API_BASE}/games/${gameId}/legal-moves?square=${encodeURIComponent(square)}`);
  if (!res.ok) {
    throw new Error("Failed to retrieve legal moves");
  }
  return res.json();
}

export async function getHistory(gameId: string): Promise<HistoryResponse> {
  const res = await fetch(`${API_BASE}/games/${gameId}/history`);
  if (!res.ok) {
    throw new Error("Failed to fetch move history");
  }
  return res.json();
}
