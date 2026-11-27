"use client";

import React from "react";
import { Bot, User, Clock } from "lucide-react";
import { Player, PieceColor } from "../types/chess";
import { ChessPiece } from "./ChessPieces";

interface PlayerBarProps {
  player: Player;
  isTurn: boolean;
  timeRemainingMs: number;
  capturedPieces: string[]; // e.g. ['P', 'P', 'N']
  materialAdvantage?: number; // e.g. +3
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  player,
  isTurn,
  timeRemainingMs,
  capturedPieces,
  materialAdvantage = 0,
}) => {
  const isWhite = player.color === "WHITE";

  // Clock format
  const totalSeconds = Math.max(0, Math.floor(timeRemainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const isLowTime = totalSeconds <= 30;

  return (
    <div
      className={`flex items-center justify-between rounded-xl px-4 py-2.5 transition-all duration-200 ${
        isTurn
          ? "border border-gold-500/60 bg-surface-card shadow-lg shadow-gold-900/10"
          : "border border-surface-border/50 bg-surface/50"
      }`}
    >
      {/* Player info & captured pieces */}
      <div className="flex items-center space-x-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
            isWhite
              ? "border-neutral-300 bg-neutral-100 text-neutral-900"
              : "border-neutral-700 bg-neutral-900 text-neutral-100"
          }`}
        >
          {player.ai ? (
            <Bot className="h-5 w-5 text-gold-500" />
          ) : (
            <User className="h-5 w-5" />
          )}
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-neutral-200">
              {player.name}
            </span>
            {isTurn && (
              <span className="flex h-2 w-2 rounded-full bg-gold-400 animate-pulse" />
            )}
          </div>

          {/* Captured Pieces list */}
          <div className="flex items-center space-x-1 mt-0.5 min-h-[18px]">
            {capturedPieces.map((p, idx) => (
              <span
                key={idx}
                className="text-[13px] leading-none text-neutral-400 opacity-80"
                title={`Captured ${p}`}
              >
                {p === "P" && "♟"}
                {p === "N" && "♞"}
                {p === "B" && "♝"}
                {p === "R" && "♜"}
                {p === "Q" && "♛"}
              </span>
            ))}
            {materialAdvantage > 0 && (
              <span className="text-[10px] font-bold text-gold-400 ml-1">
                +{materialAdvantage}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Clock display */}
      <div
        className={`flex items-center space-x-1.5 rounded-lg px-3 py-1 font-mono text-xs font-semibold ${
          isTurn
            ? isLowTime
              ? "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse"
              : "bg-gold-500/15 text-gold-300 border border-gold-500/30"
            : "bg-surface border border-surface-border text-neutral-400"
        }`}
      >
        <Clock className="h-3.5 w-3.5 opacity-70" />
        <span>{formattedTime}</span>
      </div>
    </div>
  );
};
