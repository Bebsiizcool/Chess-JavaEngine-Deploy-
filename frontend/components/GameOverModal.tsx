"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Trophy, RotateCcw, Home, Award } from "lucide-react";
import { GameResponse, PieceColor } from "../types/chess";
import { sounds } from "../lib/sound";

interface GameOverModalProps {
  game: GameResponse;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ game, onRestart, onHome }) => {
  const isWinner = game.winner !== null && game.winner !== undefined;
  const isCheckmate = game.status === "CHECKMATE";
  const isDraw = game.draw;

  useEffect(() => {
    if (isWinner) {
      sounds.playVictory();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#bf922b", "#d9bf73", "#f9f8f4", "#e5c158"],
      });
    }
  }, [isWinner]);

  let title = "Game Finished";
  let subtitle = "Match ended.";

  if (isCheckmate) {
    title = `${game.winner === "WHITE" ? "White" : "Black"} Wins!`;
    subtitle = "Victory by Checkmate.";
  } else if (game.status === "RESIGNED") {
    title = `${game.winner === "WHITE" ? "White" : "Black"} Wins!`;
    subtitle = "Opponent resigned.";
  } else if (game.status === "STALEMATE") {
    title = "Stalemate";
    subtitle = "No legal moves remaining. Draw.";
  } else if (game.status === "DRAW_INSUFFICIENT_MATERIAL") {
    title = "Draw";
    subtitle = "Draw by insufficient material.";
  } else if (game.status === "DRAW_THREEFOLD_REPETITION") {
    title = "Draw";
    subtitle = "Draw by threefold repetition.";
  } else if (game.status === "DRAW_FIFTY_MOVE_RULE") {
    title = "Draw";
    subtitle = "Draw by fifty-move rule.";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl border border-surface-border bg-surface-card p-6 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-500 to-gold-700 text-background shadow-lg shadow-gold-900/40">
          {isWinner ? <Trophy className="h-8 w-8" /> : <Award className="h-8 w-8" />}
        </div>

        <h2 className="mt-4 font-serif text-2xl font-bold text-neutral-100">
          {title}
        </h2>
        <p className="mt-1 text-sm text-neutral-400">
          {subtitle}
        </p>

        <div className="mt-6 rounded-xl border border-surface-border bg-surface p-4 text-xs text-neutral-400 space-y-1">
          <div className="flex justify-between">
            <span>Total Fullmoves:</span>
            <span className="font-semibold text-neutral-200">{game.fullmoveNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Game Mode:</span>
            <span className="font-semibold text-neutral-200">{game.mode.replace(/_/g, " ")}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col space-y-2">
          <button
            type="button"
            onClick={onRestart}
            className="flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 py-3 text-sm font-bold text-background transition hover:opacity-95"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Rematch / Play Again</span>
          </button>
          <button
            type="button"
            onClick={onHome}
            className="flex items-center justify-center space-x-2 rounded-xl border border-surface-border bg-surface py-2.5 text-xs font-semibold text-neutral-300 hover:bg-surface-hover transition"
          >
            <Home className="h-4 w-4" />
            <span>Return to Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
