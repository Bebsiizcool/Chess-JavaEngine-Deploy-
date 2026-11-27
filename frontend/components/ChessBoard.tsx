"use client";

import React from "react";
import { ChessPiece } from "./ChessPieces";
import { PieceColor, MoveRequest, GameMode } from "../types/chess";
import { sounds } from "../lib/sound";

interface ChessBoardProps {
  fen: string;
  turn: PieceColor;
  playerColor?: PieceColor;
  humanColor?: PieceColor;
  gameMode?: GameMode;
  inCheck: boolean;
  lastMoveUci?: string;
  legalDestinations: string[];
  onSquareClick: (square: string) => void;
  onMoveSubmit: (move: MoveRequest) => void;
  onPromotionNeeded: (from: string, to: string) => void;
  selectedSquare: string | null;
  disabled?: boolean;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  fen,
  turn,
  playerColor = "WHITE",
  humanColor,
  gameMode,
  inCheck,
  lastMoveUci,
  legalDestinations,
  onSquareClick,
  onMoveSubmit,
  onPromotionNeeded,
  selectedSquare,
  disabled = false,
}) => {
  // Parse FEN into 8x8 matrix (row 0 = rank 8, row 7 = rank 1)
  const boardMatrix: (string | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  const fenParts = fen.split(" ");
  const ranks = fenParts[0].split("/");

  for (let r = 0; r < 8; r++) {
    let col = 0;
    const rankStr = ranks[r] || "";
    for (let i = 0; i < rankStr.length; i++) {
      const char = rankStr[i];
      if (char >= "1" && char <= "8") {
        col += parseInt(char, 10);
      } else {
        boardMatrix[r][col] = char;
        col++;
      }
    }
  }

  const isFlipped = playerColor === "BLACK";

  const getSquareName = (displayRow: number, displayCol: number): string => {
    const actualRow = isFlipped ? displayRow : 7 - displayRow;
    const actualCol = isFlipped ? 7 - displayCol : displayCol;
    const file = String.fromCharCode(97 + actualCol);
    const rank = actualRow + 1;
    return `${file}${rank}`;
  };

  const getPieceAtSquare = (square: string): string | null => {
    const col = square.charCodeAt(0) - 97;
    const row = parseInt(square[1], 10) - 1;
    const matrixRow = 7 - row;
    return boardMatrix[matrixRow]?.[col] || null;
  };

  // Find King square currently in check
  let inCheckSquare: string | null = null;
  if (inCheck) {
    const kingChar = turn === "WHITE" ? "K" : "k";
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (boardMatrix[r][c] === kingChar) {
          const file = String.fromCharCode(97 + c);
          const rank = 8 - r;
          inCheckSquare = `${file}${rank}`;
        }
      }
    }
  }

  // Parse previous move squares
  const prevFrom = lastMoveUci ? lastMoveUci.substring(0, 2) : null;
  const prevTo = lastMoveUci ? lastMoveUci.substring(2, 4) : null;

  // Click-only interaction — no drag and drop
  const handleSquareClick = (square: string) => {
    if (disabled) return;

    // If a piece is already selected...
    if (selectedSquare) {
      // Click same square = deselect
      if (selectedSquare === square) {
        onSquareClick("");
        return;
      }

      // Click a legal destination = make the move
      if (legalDestinations.includes(square)) {
        handleMoveAttempt(selectedSquare, square);
        return;
      }

      // Click a different square = select that square instead
      // (falls through to onSquareClick below)
    }

    // Select the clicked square (parent will fetch legal moves)
    onSquareClick(square);
  };

  const handleMoveAttempt = (from: string, to: string) => {
    const movingPiece = getPieceAtSquare(from);
    const isPawn = movingPiece?.toLowerCase() === "p";
    const toRank = to[1];

    if (isPawn && (toRank === "8" || toRank === "1")) {
      onPromotionNeeded(from, to);
    } else {
      onMoveSubmit({ from, to });
      const destPiece = getPieceAtSquare(to);
      if (destPiece) {
        sounds.playCapture();
      } else {
        sounds.playMove();
      }
    }
  };

  return (
    <div className="relative select-none aspect-square w-full max-w-[620px] rounded-2xl border-4 border-[#2c2217] bg-[#1a140f] p-2 shadow-2xl">
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded-xl overflow-hidden shadow-inner">
        {Array.from({ length: 64 }).map((_, idx) => {
          const displayRow = Math.floor(idx / 8);
          const displayCol = idx % 8;

          const square = getSquareName(displayRow, displayCol);
          const piece = getPieceAtSquare(square);

          const actualCol = square.charCodeAt(0) - 97;
          const actualRow = parseInt(square[1], 10) - 1;
          const isLightSquare = (actualCol + actualRow) % 2 === 1;

          const isSelected = selectedSquare === square;
          const isLegalDestination = legalDestinations.includes(square);
          const isPrevMove = prevFrom === square || prevTo === square;
          const isInCheckSquare = inCheckSquare === square;

          const showRankLabel = isFlipped ? displayCol === 7 : displayCol === 0;
          const showFileLabel = isFlipped ? displayRow === 0 : displayRow === 7;

          return (
            <div
              key={square}
              onClick={() => handleSquareClick(square)}
              className={`relative flex items-center justify-center cursor-pointer transition-colors duration-100 ${
                isLightSquare ? "bg-board-light" : "bg-board-dark"
              }`}
            >
              {/* Previous Move */}
              {isPrevMove && (
                <div className="absolute inset-0 bg-yellow-500/25 pointer-events-none" />
              )}

              {/* Selected Square */}
              {isSelected && (
                <div className="absolute inset-0 bg-amber-400/50 ring-2 ring-amber-300 ring-inset pointer-events-none" />
              )}

              {/* King in Check */}
              {isInCheckSquare && (
                <div className="absolute inset-0 bg-red-600/60 animate-pulse pointer-events-none" />
              )}

              {/* Chess Piece */}
              {piece && (
                <div
                  className={`relative z-10 w-[82%] h-[82%] flex items-center justify-center transition-transform ${
                    disabled ? "cursor-default" : "hover:scale-105"
                  }`}
                >
                  <ChessPiece type={piece} />
                </div>
              )}

              {/* Legal Move Indicators */}
              {isLegalDestination && (
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                  {piece ? (
                    <div className="h-full w-full border-4 border-amber-500/70 rounded-full scale-90 animate-pulse" />
                  ) : (
                    <div className="h-3.5 w-3.5 rounded-full bg-amber-500/60 shadow" />
                  )}
                </div>
              )}

              {/* Rank Label */}
              {showRankLabel && (
                <span
                  className={`absolute top-0.5 left-1 text-[10px] font-bold pointer-events-none ${
                    isLightSquare ? "text-board-dark" : "text-board-light"
                  }`}
                >
                  {square[1]}
                </span>
              )}

              {/* File Label */}
              {showFileLabel && (
                <span
                  className={`absolute bottom-0.5 right-1 text-[10px] font-bold pointer-events-none ${
                    isLightSquare ? "text-board-dark" : "text-board-light"
                  }`}
                >
                  {square[0]}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
