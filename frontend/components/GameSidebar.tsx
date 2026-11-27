"use client";

import React, { useState } from "react";
import {
  RotateCcw,
  Flag,
  Handshake,
  PlusCircle,
  Copy,
  Check,
  Code2,
  AlertTriangle,
  History,
} from "lucide-react";
import { GameResponse, HistoryResponse, PieceColor } from "../types/chess";

interface GameSidebarProps {
  game: GameResponse;
  history: HistoryResponse | null;
  onUndo: () => void;
  onRestart: () => void;
  onResign: () => void;
  onNewGame: () => void;
  isAIThinking: boolean;
}

export const GameSidebar: React.FC<GameSidebarProps> = ({
  game,
  history,
  onUndo,
  onRestart,
  onResign,
  onNewGame,
  isAIThinking,
}) => {
  const [copiedFen, setCopiedFen] = useState(false);
  const [showFen, setShowFen] = useState(false);

  const handleCopyFen = () => {
    if (game.fen) {
      navigator.clipboard.writeText(game.fen);
      setCopiedFen(true);
      setTimeout(() => setCopiedFen(false), 2000);
    }
  };

  // Group moves into turns (white move + black move)
  const moveRows: { turn: number; white?: string; black?: string }[] = [];
  if (history?.history) {
    for (let i = 0; i < history.history.length; i += 2) {
      const whiteMove = history.history[i];
      const blackMove = history.history[i + 1];
      moveRows.push({
        turn: whiteMove.moveNumber,
        white: whiteMove.san,
        black: blackMove ? blackMove.san : undefined,
      });
    }
  }

  return (
    <div className="flex flex-col h-full rounded-2xl border border-surface-border bg-surface-card p-4 shadow-xl">
      {/* Status Header */}
      <div className="border-b border-surface-border pb-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Game Status
          </span>
          <span className="text-xs font-mono text-gold-400">
            Move #{game.fullmoveNumber}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                game.status === "ACTIVE"
                  ? "bg-emerald-400"
                  : game.status === "CHECK"
                  ? "bg-amber-400 animate-ping"
                  : "bg-red-400"
              }`}
            />
            <span className="text-sm font-bold text-neutral-100">
              {game.status === "ACTIVE" &&
                `${game.turn === "WHITE" ? "White" : "Black"}'s Turn`}
              {game.status === "CHECK" && "Check!"}
              {game.status === "CHECKMATE" && "Checkmate"}
              {game.status === "STALEMATE" && "Stalemate (Draw)"}
              {game.status.startsWith("DRAW") && "Draw"}
              {game.status === "RESIGNED" && "Resigned"}
            </span>
          </div>

          {isAIThinking && (
            <span className="text-xs font-medium text-gold-400 animate-pulse">
              AI Thinking...
            </span>
          )}
        </div>

        {game.inCheck && (
          <div className="mt-2 flex items-center space-x-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>King is threatened by check!</span>
          </div>
        )}
      </div>

      {/* Move History Table */}
      <div className="flex-1 my-3 overflow-hidden flex flex-col">
        <div className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
          <History className="h-3.5 w-3.5 text-gold-400" />
          <span>Move History</span>
        </div>

        <div className="flex-1 overflow-y-auto rounded-xl border border-surface-border/60 bg-surface/60 p-2 text-xs font-mono scrollbar-thin">
          {moveRows.length === 0 ? (
            <div className="flex h-full items-center justify-center text-neutral-500 italic">
              No moves played yet
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-surface-border/50 text-[11px] text-neutral-500">
                  <th className="py-1 px-2 w-10">#</th>
                  <th className="py-1 px-2">White</th>
                  <th className="py-1 px-2">Black</th>
                </tr>
              </thead>
              <tbody>
                {moveRows.map((row) => (
                  <tr
                    key={row.turn}
                    className="border-b border-surface-border/20 hover:bg-surface-hover/50 transition"
                  >
                    <td className="py-1 px-2 text-neutral-500">{row.turn}.</td>
                    <td className="py-1 px-2 text-neutral-200 font-semibold">
                      {row.white || "—"}
                    </td>
                    <td className="py-1 px-2 text-neutral-300">
                      {row.black || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="space-y-2 border-t border-surface-border pt-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onUndo}
            disabled={!history || history.history.length === 0 || isAIThinking}
            className="flex items-center justify-center space-x-1.5 rounded-xl border border-surface-border bg-surface py-2 text-xs font-medium text-neutral-300 hover:border-gold-500/50 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Undo</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            disabled={isAIThinking}
            className="flex items-center justify-center space-x-1.5 rounded-xl border border-surface-border bg-surface py-2 text-xs font-medium text-neutral-300 hover:border-gold-500/50 hover:text-white transition"
          >
            <span>Restart</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onResign}
            disabled={game.status !== "ACTIVE" && game.status !== "CHECK"}
            className="flex items-center justify-center space-x-1.5 rounded-xl border border-red-500/30 bg-red-500/10 py-2 text-xs font-medium text-red-300 hover:bg-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <Flag className="h-3.5 w-3.5" />
            <span>Resign</span>
          </button>

          <button
            type="button"
            onClick={onNewGame}
            className="flex items-center justify-center space-x-1.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 py-2 text-xs font-bold text-background hover:opacity-90 transition"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>New Match</span>
          </button>
        </div>

        {/* FEN Inspector Toggle */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowFen(!showFen)}
            className="flex w-full items-center justify-between text-[11px] text-neutral-500 hover:text-neutral-300 py-1"
          >
            <span className="flex items-center space-x-1">
              <Code2 className="h-3 w-3" />
              <span>FEN String</span>
            </span>
            <span>{showFen ? "Hide" : "Show"}</span>
          </button>

          {showFen && (
            <div className="mt-1 flex items-center space-x-2 rounded-lg border border-surface-border bg-surface p-2 text-[10px] font-mono text-neutral-400">
              <span className="truncate flex-1">{game.fen}</span>
              <button
                type="button"
                onClick={handleCopyFen}
                title="Copy FEN to clipboard"
                className="text-neutral-400 hover:text-gold-300 transition"
              >
                {copiedFen ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
