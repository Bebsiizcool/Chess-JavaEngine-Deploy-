"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "../components/Navbar";
import { LandingView } from "../components/LandingView";
import { ChessBoard } from "../components/ChessBoard";
import { PlayerBar } from "../components/PlayerBar";
import { GameSidebar } from "../components/GameSidebar";
import { PromotionModal } from "../components/PromotionModal";
import { GameOverModal } from "../components/GameOverModal";
import {
  GameResponse,
  HistoryResponse,
  Difficulty,
  PieceType,
  PieceColor,
  MoveRequest,
} from "../types/chess";
import * as api from "../lib/api";
import { sounds } from "../lib/sound";

export default function Home() {
  const [game, setGame] = useState<GameResponse | null>(null);
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalDestinations, setLegalDestinations] = useState<string[]>([]);
  const [isAIThinking, setIsAIThinking] = useState<boolean>(false);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: string; to: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clock countdown timer
  useEffect(() => {
    if (!game || (game.status !== "ACTIVE" && game.status !== "CHECK")) {
      return;
    }

    const interval = setInterval(() => {
      setGame((prev) => {
        if (!prev || (prev.status !== "ACTIVE" && prev.status !== "CHECK")) {
          return prev;
        }

        const isWhiteTurn = prev.turn === "WHITE";
        const wTime = isWhiteTurn ? Math.max(0, prev.whiteTimeRemainingMs - 1000) : prev.whiteTimeRemainingMs;
        const bTime = !isWhiteTurn ? Math.max(0, prev.blackTimeRemainingMs - 1000) : prev.blackTimeRemainingMs;

        return {
          ...prev,
          whiteTimeRemainingMs: wTime,
          blackTimeRemainingMs: bTime,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [game?.status, game?.turn]);

  // Load history whenever move changes
  const refreshHistory = useCallback(async (gameId: string) => {
    try {
      const hist = await api.getHistory(gameId);
      setHistory(hist);
    } catch (err) {
      console.error("Failed to refresh history", err);
    }
  }, []);

  // Helper to execute AI's turn deterministically
  const executeAITurn = useCallback(
    async (currentGameId: string) => {
      setIsAIThinking(true);
      try {
        // Natural 350ms thinking delay for realism
        await new Promise((resolve) => setTimeout(resolve, 350));
        const aiState = await api.triggerAIMove(currentGameId);
        setGame(aiState);
        await refreshHistory(aiState.gameId);

        if (aiState.inCheck) {
          sounds.playCheck();
        } else if (aiState.lastMoveSan?.includes("x")) {
          sounds.playCapture();
        } else {
          sounds.playMove();
        }
      } catch (err) {
        console.error("AI turn error:", err);
      } finally {
        setIsAIThinking(false);
      }
    },
    [refreshHistory]
  );

  // Start Play vs Computer
  const handleStartVsComputer = async (difficulty: Difficulty, color: string, timeLimitMs: number) => {
    try {
      setErrorMessage(null);
      const newGame = await api.createGame("VS_COMPUTER", color, difficulty, timeLimitMs);
      setGame(newGame);
      setHistory(null);
      setSelectedSquare(null);
      setLegalDestinations([]);

      // If the AI plays White, it must make the first move immediately
      if (newGame.whitePlayer.ai) {
        executeAITurn(newGame.gameId);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to start AI game");
    }
  };

  // Start Two Player Local
  const handleStartTwoPlayer = async (timeLimitMs: number) => {
    try {
      setErrorMessage(null);
      const newGame = await api.createGame("TWO_PLAYER_LOCAL", "WHITE", "MEDIUM", timeLimitMs);
      setGame(newGame);
      setHistory(null);
      setSelectedSquare(null);
      setLegalDestinations([]);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to start 2-player game");
    }
  };

  // Square Click handler (queries legal moves for piece)
  const handleSquareClick = async (square: string) => {
    if (!game || isAIThinking) return;

    if (!square) {
      setSelectedSquare(null);
      setLegalDestinations([]);
      return;
    }

    try {
      setSelectedSquare(square);
      const res = await api.getLegalMoves(game.gameId, square);
      setLegalDestinations(res.legalDestinations || []);
    } catch {
      setSelectedSquare(null);
      setLegalDestinations([]);
    }
  };

  // Move submission: Human moves, and if in VS_COMPUTER mode, triggers AI reply directly!
  const handleMoveSubmit = async (move: MoveRequest) => {
    if (!game || isAIThinking) return;

    try {
      setErrorMessage(null);
      // 1. Submit human move to backend
      const updated = await api.submitMove(game.gameId, move);
      setGame(updated);
      setSelectedSquare(null);
      setLegalDestinations([]);
      await refreshHistory(updated.gameId);

      if (updated.inCheck) {
        sounds.playCheck();
      }

      // 2. If it is VS_COMPUTER mode and game is still active, trigger the AI response!
      if (
        updated.mode === "VS_COMPUTER" &&
        !updated.status.startsWith("DRAW") &&
        updated.status !== "CHECKMATE" &&
        updated.status !== "RESIGNED"
      ) {
        const nextPlayer = updated.turn === "WHITE" ? updated.whitePlayer : updated.blackPlayer;
        if (nextPlayer?.ai) {
          executeAITurn(updated.gameId);
        }
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Illegal Move");
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  // Promotion Handling
  const handlePromotionNeeded = (from: string, to: string) => {
    setPendingPromotion({ from, to });
  };

  const handlePromotionSelect = (promotionType: PieceType) => {
    if (pendingPromotion) {
      handleMoveSubmit({
        from: pendingPromotion.from,
        to: pendingPromotion.to,
        promotionType,
      });
      setPendingPromotion(null);
    }
  };

  // Undo Move
  const handleUndo = async () => {
    if (!game || isAIThinking) return;
    try {
      const updated = await api.undoMove(game.gameId);
      setGame(updated);
      setSelectedSquare(null);
      setLegalDestinations([]);
      await refreshHistory(updated.gameId);
      sounds.playMove();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Cannot undo move");
      setTimeout(() => setErrorMessage(null), 2500);
    }
  };

  // Restart Game
  const handleRestart = async () => {
    if (!game) return;
    try {
      const restarted = await api.restartGame(game.gameId);
      setGame(restarted);
      setSelectedSquare(null);
      setLegalDestinations([]);
      setHistory(null);
      sounds.playMove();

      // If AI is White, it plays first after restart
      if (restarted.mode === "VS_COMPUTER" && restarted.whitePlayer.ai) {
        executeAITurn(restarted.gameId);
      }
    } catch (err: unknown) {
      console.error(err);
    }
  };

  // Resign
  const handleResign = () => {
    if (!game) return;
    setGame({
      ...game,
      status: "RESIGNED",
      winner: game.turn === "WHITE" ? "BLACK" : "WHITE",
    });
  };

  // Return to Lobby
  const handleReturnToLobby = () => {
    setGame(null);
    setHistory(null);
    setSelectedSquare(null);
    setLegalDestinations([]);
  };

  // Calculate material difference
  const getMaterialValue = (pieces: string[]) => {
    const values: Record<string, number> = { P: 1, N: 3, B: 3, R: 5, Q: 9 };
    return pieces.reduce((sum, p) => sum + (values[p] || 0), 0);
  };

  const whiteCapturedVal = game ? getMaterialValue(game.capturedByWhite) : 0;
  const blackCapturedVal = game ? getMaterialValue(game.capturedByBlack) : 0;
  const whiteAdvantage = Math.max(0, whiteCapturedVal - blackCapturedVal);
  const blackAdvantage = Math.max(0, blackCapturedVal - whiteCapturedVal);

  const activeModeTitle = game
    ? game.mode === "VS_COMPUTER"
      ? `VS AI (${game.whitePlayer.ai ? game.whitePlayer.difficulty : game.blackPlayer.difficulty})`
      : "TWO PLAYER"
    : null;

  // Determine board orientation
  // In VS_COMPUTER, if the human is playing Black, flip board so Black is at bottom
  const playerBoardColor: PieceColor =
    game?.mode === "VS_COMPUTER" && game.blackPlayer && !game.blackPlayer.ai
      ? "BLACK"
      : "WHITE";

  const topPlayer = playerBoardColor === "WHITE" ? game?.blackPlayer : game?.whitePlayer;
  const bottomPlayer = playerBoardColor === "WHITE" ? game?.whitePlayer : game?.blackPlayer;
  const topCaptured = playerBoardColor === "WHITE" ? game?.capturedByWhite : game?.capturedByBlack;
  const bottomCaptured = playerBoardColor === "WHITE" ? game?.capturedByBlack : game?.capturedByWhite;
  const topAdvantage = playerBoardColor === "WHITE" ? whiteAdvantage : blackAdvantage;
  const bottomAdvantage = playerBoardColor === "WHITE" ? blackAdvantage : whiteAdvantage;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar
        onHomeClick={handleReturnToLobby}
        activeMode={activeModeTitle}
        onRestartClick={game ? handleRestart : undefined}
      />

      <main className="flex-1 flex flex-col">
        {!game ? (
          <LandingView
            onStartVsComputer={handleStartVsComputer}
            onStartTwoPlayer={handleStartTwoPlayer}
          />
        ) : (
          <div className="mx-auto max-w-7xl w-full p-4 sm:p-6 lg:p-8 flex-1 flex flex-col justify-center">
            {/* Error Notification Toast */}
            {errorMessage && (
              <div className="fixed top-20 right-6 z-50 rounded-xl border border-red-500/50 bg-red-950/90 px-4 py-3 text-xs font-semibold text-red-200 shadow-xl backdrop-blur animate-in fade-in slide-in-from-top-2">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start justify-center max-w-6xl mx-auto w-full">
              {/* Chessboard Column */}
              <div className="lg:col-span-8 flex flex-col items-center space-y-3 w-full">
                {/* Top Opponent Bar */}
                {topPlayer && (
                  <div className="w-full max-w-[620px]">
                    <PlayerBar
                      player={topPlayer}
                      isTurn={game.turn === topPlayer.color}
                      timeRemainingMs={
                        topPlayer.color === "WHITE"
                          ? game.whiteTimeRemainingMs
                          : game.blackTimeRemainingMs
                      }
                      capturedPieces={topCaptured || []}
                      materialAdvantage={topAdvantage}
                    />
                  </div>
                )}

                {/* The 8x8 Board */}
                <ChessBoard
                  fen={game.fen}
                  turn={game.turn}
                  playerColor={playerBoardColor}
                  humanColor={playerBoardColor}
                  gameMode={game.mode}
                  inCheck={game.inCheck}
                  lastMoveUci={game.lastMoveUci}
                  legalDestinations={legalDestinations}
                  onSquareClick={handleSquareClick}
                  onMoveSubmit={handleMoveSubmit}
                  onPromotionNeeded={handlePromotionNeeded}
                  selectedSquare={selectedSquare}
                  disabled={
                    game.status.startsWith("DRAW") ||
                    game.status === "CHECKMATE" ||
                    game.status === "RESIGNED" ||
                    isAIThinking
                  }
                />

                {/* Bottom Player Bar */}
                {bottomPlayer && (
                  <div className="w-full max-w-[620px]">
                    <PlayerBar
                      player={bottomPlayer}
                      isTurn={game.turn === bottomPlayer.color}
                      timeRemainingMs={
                        bottomPlayer.color === "WHITE"
                          ? game.whiteTimeRemainingMs
                          : game.blackTimeRemainingMs
                      }
                      capturedPieces={bottomCaptured || []}
                      materialAdvantage={bottomAdvantage}
                    />
                  </div>
                )}
              </div>

              {/* Sidebar Column */}
              <div className="lg:col-span-4 h-full min-h-[500px]">
                <GameSidebar
                  game={game}
                  history={history}
                  onUndo={handleUndo}
                  onRestart={handleRestart}
                  onResign={handleResign}
                  onNewGame={handleReturnToLobby}
                  isAIThinking={isAIThinking}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Pawn Promotion Modal */}
      {pendingPromotion && game && (
        <PromotionModal
          color={game.turn}
          onSelect={handlePromotionSelect}
          onCancel={() => setPendingPromotion(null)}
        />
      )}

      {/* Game Over Announcement Modal */}
      {game &&
        (game.status.startsWith("DRAW") ||
          game.status === "CHECKMATE" ||
          game.status === "RESIGNED") && (
          <GameOverModal
            game={game}
            onRestart={handleRestart}
            onHome={handleReturnToLobby}
          />
        )}
    </div>
  );
}
