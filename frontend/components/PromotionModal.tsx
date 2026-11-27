"use client";

import React from "react";
import { PieceType, PieceColor } from "../types/chess";
import { ChessPiece } from "./ChessPieces";

interface PromotionModalProps {
  color: PieceColor;
  onSelect: (type: PieceType) => void;
  onCancel: () => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({ color, onSelect, onCancel }) => {
  const options: { type: PieceType; label: string; symbol: string }[] = [
    { type: "QUEEN", label: "Queen", symbol: color === "WHITE" ? "Q" : "q" },
    { type: "KNIGHT", label: "Knight", symbol: color === "WHITE" ? "N" : "n" },
    { type: "ROOK", label: "Rook", symbol: color === "WHITE" ? "R" : "r" },
    { type: "BISHOP", label: "Bishop", symbol: color === "WHITE" ? "B" : "b" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-2xl border border-surface-border bg-surface-card p-6 shadow-2xl text-center">
        <h3 className="font-serif text-lg font-bold text-neutral-100">
          Pawn Promotion
        </h3>
        <p className="mt-1 text-xs text-neutral-400">
          Choose a piece to promote your pawn to:
        </p>

        <div className="mt-6 grid grid-cols-4 gap-3">
          {options.map((opt) => (
            <button
              key={opt.type}
              type="button"
              onClick={() => onSelect(opt.type)}
              className="flex flex-col items-center justify-center rounded-xl border border-surface-border bg-surface p-3 transition hover:border-gold-500 hover:bg-surface-hover hover:scale-105"
            >
              <div className="h-12 w-12 flex items-center justify-center">
                <ChessPiece type={opt.symbol} />
              </div>
              <span className="mt-2 text-[11px] font-semibold text-neutral-300">
                {opt.label}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="mt-6 text-xs text-neutral-500 hover:text-neutral-300 transition"
        >
          Cancel move
        </button>
      </div>
    </div>
  );
};
