"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Users,
  ChevronRight,
  X,
  Swords,
  Play,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { Difficulty } from "../types/chess";

interface LandingViewProps {
  onStartVsComputer: (difficulty: Difficulty, color: string, timeLimitMs: number) => void;
  onStartTwoPlayer: (timeLimitMs: number) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onStartVsComputer,
  onStartTwoPlayer,
}) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("MEDIUM");
  const [selectedColor, setSelectedColor] = useState<string>("WHITE");
  const [selectedTimeMin, setSelectedTimeMin] = useState<number>(10);
  const [tilt, setTilt] = useState({ x: 52, y: -28 });

  const handleLaunchComputer = () => {
    setShowConfigModal(false);
    onStartVsComputer(selectedDifficulty, selectedColor, selectedTimeMin * 60 * 1000);
  };

  const handleOpenDifficulty = (diff: Difficulty) => {
    setSelectedDifficulty(diff);
    setShowConfigModal(true);
  };

  const handleBoardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: 52 - yPct * 16,
      y: -28 + xPct * 20,
    });
  };

  const handleBoardMouseLeave = () => {
    setTilt({ x: 52, y: -28 });
  };

  // 8x8 standard opening board matrix for the 3D showcase board
  const boardLayout: (string | null)[][] = [
    ["r", "n", "b", "q", "k", "b", "n", "r"],
    ["p", "p", "p", "p", "p", "p", "p", "p"],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ["P", "P", "P", "P", "P", "P", "P", "P"],
    ["R", "N", "B", "Q", "K", "B", "N", "R"],
  ];

  const pieceSymbols: Record<string, string> = {
    k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
    K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-between overflow-hidden bg-[#070709] text-neutral-100">
      {/* ================= ATMOSPHERIC BACKDROP ================= */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Soft amber / gold radial illumination behind centerpiece */}
        <div className="absolute top-[22%] left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-b from-amber-600/15 via-gold-500/10 to-transparent blur-[140px]" />
        
        {/* Deep checkerboard floor texture */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #d4af37 25%, transparent 25%),
              linear-gradient(-45deg, #d4af37 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #d4af37 75%),
              linear-gradient(-45deg, transparent 75%, #d4af37 75%)
            `,
            backgroundSize: "72px 72px",
            backgroundPosition: "0 0, 0 36px, 36px -36px, -36px 0px",
          }}
        />

        {/* Ambient smoke / ember vignette */}
        <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-[#070709] via-[#070709]/80 to-transparent" />
      </div>

      {/* ================= HERO SECTION ================= */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-8 pt-8 sm:pt-14 pb-8">
        {/* Majestic Grand Title */}
        <div className="text-center max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-decorative text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[0.14em] gold-gradient-text uppercase drop-shadow-[0_4px_30px_rgba(212,175,55,0.25)]"
          >
            MASTER THE GAME OF KINGS
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-2 font-decorative text-2xl sm:text-4xl md:text-5xl font-bold tracking-[0.2em] gold-gradient-text uppercase"
          >
            WITH CONFIDENCE
          </motion.div>
        </div>

        {/* 3-Column Centerpiece Layout matching the reference image */}
        <div className="mt-10 sm:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Strategy Quote & Attractive Quick Match Button */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3 text-center lg:text-left flex flex-col items-center lg:items-start order-2 lg:order-1"
          >
            <p className="max-w-xs text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
              Unlock the secrets of strategy, improve your skills, and enjoy the timeless art of chess.
            </p>

            {/* Attractive 2v2 / Two Player Action Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => onStartTwoPlayer(selectedTimeMin * 60 * 1000)}
              className="mt-6 flex items-center space-x-3 rounded-xl border border-gold-400/70 bg-gradient-to-r from-[#181822] via-gold-500/20 to-[#181822] px-6 py-3.5 text-xs font-serif font-bold tracking-widest uppercase text-gold-200 shadow-[0_4px_25px_rgba(212,175,55,0.25)] transition hover:border-gold-300 hover:shadow-[0_4px_35px_rgba(212,175,55,0.45)] hover:text-white group"
              title="Launch 2-Player Pass & Play Match"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-gold-400/60 bg-gold-500/25 transition-transform group-hover:scale-110 group-hover:bg-gold-400/40 shadow-inner">
                <Users className="h-4 w-4 text-gold-200" />
              </div>
              <span>2 Player Local</span>
              <span className="text-[10px] font-mono font-bold text-gold-400 bg-gold-500/15 px-2 py-0.5 rounded border border-gold-400/40">
                2v2
              </span>
            </motion.button>
            <span className="mt-2 text-[10px] font-serif uppercase tracking-widest text-neutral-400">
              Pass &amp; Play • Dual Clocks
            </span>
          </motion.div>

          {/* Center Column: Scalloped 3D Isometric Chessboard with Autonomous Smooth Floating Animation */}
          <div className="lg:col-span-6 flex justify-center order-1 lg:order-2">
            <div
              className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[440px] md:h-[440px] flex items-center justify-center cursor-pointer perspective-1400 select-none"
              onClick={() => setShowConfigModal(true)}
              title="Click to Configure & Play"
            >
              {/* Cast Shadow under the 3D Board (moves in sync with board floating) */}
              <motion.div
                animate={{
                  scale: [1, 0.88, 1.05, 1],
                  opacity: [0.85, 0.6, 0.9, 0.85],
                  y: [120, 126, 116, 120],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute w-72 sm:w-96 md:w-[420px] h-32 sm:h-44 bg-black/90 blur-2xl rounded-full"
                style={{ transform: "rotateX(70deg)" }}
              />

              {/* Tilted 3D Board Container with Smooth Autonomous 3D Floating & Tilting Loop */}
              <motion.div
                animate={{
                  y: [0, -18, -4, 0],
                  rotateX: [52, 47, 55, 52],
                  rotateZ: [-28, -23, -33, -28],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 preserve-3d transition-shadow duration-300 hover:shadow-[0_30px_70px_rgba(212,175,55,0.35)]"
              >
                {/* Fluted / Scalloped White Marble Perimeter (matches reference image) */}
                <div className="absolute -inset-3.5 sm:-inset-5 rounded-3xl bg-gradient-to-b from-[#f7f5f0] via-[#e5e0d4] to-[#cfc8b6] shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.8),inset_0_-4px_8px_rgba(0,0,0,0.3)] border-2 border-[#fffdec]">
                  {/* Scalloped decorative corner notches */}
                  <div className="absolute inset-0 rounded-3xl border border-black/10" />
                </div>

                {/* 3D Board Edge Depth */}
                <div
                  className="absolute inset-x-0 -bottom-3 sm:-bottom-4 h-4 rounded-b-2xl bg-gradient-to-r from-[#948d7d] via-[#b5ada0] to-[#7f786a] border-b-2 border-black/50"
                  style={{ transform: "rotateX(-90deg)" }}
                />

                {/* 8x8 Checkered Grid */}
                <div className="relative z-10 grid grid-cols-8 grid-rows-8 w-full h-full rounded-xl overflow-hidden shadow-inner border border-black/40">
                  {boardLayout.map((row, rIdx) =>
                    row.map((piece, cIdx) => {
                      const isLight = (rIdx + cIdx) % 2 === 0;
                      const isPieceWhite = piece && piece === piece.toUpperCase();

                      return (
                        <div
                          key={`${rIdx}-${cIdx}`}
                          className={`relative flex items-center justify-center transition-colors ${
                            isLight
                              ? "bg-gradient-to-br from-[#f8f6f0] to-[#e4ded0]"
                              : "bg-gradient-to-br from-[#4d3f35] to-[#342921]"
                          }`}
                        >
                          {piece && (
                            <span
                              className={`text-sm sm:text-xl md:text-2xl font-bold select-none transition-transform hover:scale-125 ${
                                isPieceWhite
                                  ? "text-[#faf8f4] drop-shadow-[0_3px_5px_rgba(0,0,0,0.9)]"
                                  : "text-[#d4af37] drop-shadow-[0_2px_5px_rgba(0,0,0,0.95)]"
                              }`}
                            >
                              {pieceSymbols[piece]}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Column: Tournament Quote & Primary CTA */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3 text-center lg:text-right flex flex-col items-center lg:items-end order-3"
          >
            <p className="max-w-xs text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
              Whether you&apos;re a beginner or a tournament player, we&apos;ll help you level up your game.
            </p>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="mt-6 flex items-center space-x-2 rounded-xl border border-gold-500/50 bg-gradient-to-r from-gold-500/15 via-gold-500/25 to-gold-600/15 px-6 py-3.5 text-xs font-serif font-bold tracking-widest uppercase text-gold-200 shadow-lg shadow-black/60 transition hover:border-gold-400 hover:text-white"
            >
              <Swords className="h-4 w-4 text-gold-400" />
              <span>Play vs AI</span>
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          </motion.div>
        </div>

        {/* ================= BOTTOM BATTLE ARENAS SECTION ================= */}
        {/* Matches "OUR TRAINING PROGRAMS" from reference image */}
        <div className="mt-20 sm:mt-28">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="font-decorative text-xl sm:text-3xl font-bold tracking-[0.2em] gold-gradient-text uppercase">
              OUR TRAINING PROGRAMS
            </h2>
            <div className="mx-auto mt-2 h-0.5 w-24 bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
          </div>

          {/* 4 Thematic Cards matching the reference layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Card 1: Beginner's Course */}
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              onClick={() => handleOpenDifficulty("EASY")}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-surface-border bg-gradient-to-b from-[#13131a] to-[#0a0a0e] p-4 text-center transition-all duration-300 hover:border-gold-500/60 hover:shadow-[0_15px_35px_rgba(212,175,55,0.15)] flex flex-col justify-between"
            >
              <div className="relative h-56 w-full rounded-xl overflow-hidden bg-gradient-to-b from-neutral-900 to-black flex items-center justify-center border border-white/5 group-hover:border-gold-500/20">
                {/* Atmospheric Monochromatic Silhouette (White King in fog) */}
                <div className="absolute inset-0 bg-radial from-neutral-800/40 via-transparent to-black" />
                <div className="relative text-7xl select-none text-neutral-200 transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]">
                  ♔
                </div>
                <div className="absolute bottom-3 inset-x-0 flex justify-center space-x-2 text-2xl text-neutral-400">
                  <span>♙</span>
                  <span>♘</span>
                  <span>♙</span>
                </div>
              </div>
              <div className="mt-4 pb-2">
                <h3 className="font-decorative text-xs sm:text-sm font-bold tracking-[0.16em] text-neutral-200 uppercase group-hover:text-gold-300 transition">
                  BEGINNER&apos;S COURSE
                </h3>
                <span className="block mt-1 text-[11px] text-neutral-400 font-light">
                  Casual AI • Relaxed tactics
                </span>
              </div>
            </motion.div>

            {/* Card 2: Intermediate Course */}
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              onClick={() => handleOpenDifficulty("MEDIUM")}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-surface-border bg-gradient-to-b from-[#13131a] to-[#0a0a0e] p-4 text-center transition-all duration-300 hover:border-gold-500/60 hover:shadow-[0_15px_35px_rgba(212,175,55,0.15)] flex flex-col justify-between"
            >
              <div className="relative h-56 w-full rounded-xl overflow-hidden bg-gradient-to-b from-neutral-900 to-black flex items-center justify-center border border-white/5 group-hover:border-gold-500/20">
                {/* Atmospheric Silhouette (Dark robed tactician) */}
                <div className="absolute inset-0 bg-radial from-neutral-800/40 via-transparent to-black" />
                <div className="relative text-7xl select-none text-neutral-300 transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]">
                  ♚
                </div>
                <div className="absolute bottom-3 inset-x-0 flex justify-center space-x-2 text-2xl text-neutral-400">
                  <span>♜</span>
                  <span>♝</span>
                  <span>♜</span>
                </div>
              </div>
              <div className="mt-4 pb-2">
                <h3 className="font-decorative text-xs sm:text-sm font-bold tracking-[0.16em] text-neutral-200 uppercase group-hover:text-gold-300 transition">
                  INTERMEDIATE COURSE
                </h3>
                <span className="block mt-1 text-[11px] text-neutral-400 font-light">
                  Tactical AI • Depth 3 Minimax
                </span>
              </div>
            </motion.div>

            {/* Card 3: Advanced Course */}
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              onClick={() => handleOpenDifficulty("HARD")}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-surface-border bg-gradient-to-b from-[#13131a] to-[#0a0a0e] p-4 text-center transition-all duration-300 hover:border-gold-500/60 hover:shadow-[0_15px_35px_rgba(212,175,55,0.15)] flex flex-col justify-between"
            >
              <div className="relative h-56 w-full rounded-xl overflow-hidden bg-gradient-to-b from-neutral-900 to-black flex items-center justify-center border border-white/5 group-hover:border-gold-500/20">
                {/* Atmospheric Silhouette (Twin Queens confrontation) */}
                <div className="absolute inset-0 bg-radial from-neutral-800/40 via-transparent to-black" />
                <div className="relative flex items-center space-x-3 text-6xl select-none transition-transform duration-500 group-hover:scale-110">
                  <span className="text-neutral-400">♛</span>
                  <span className="text-neutral-100">♕</span>
                </div>
              </div>
              <div className="mt-4 pb-2">
                <h3 className="font-decorative text-xs sm:text-sm font-bold tracking-[0.16em] text-neutral-200 uppercase group-hover:text-gold-300 transition">
                  ADVANCED COURSE
                </h3>
                <span className="block mt-1 text-[11px] text-neutral-400 font-light">
                  Grandmaster AI • Alpha-Beta engine
                </span>
              </div>
            </motion.div>

            {/* Card 4: Pass & Play / Two Player */}
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              onClick={() => onStartTwoPlayer(selectedTimeMin * 60 * 1000)}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-surface-border bg-gradient-to-b from-[#13131a] to-[#0a0a0e] p-4 text-center transition-all duration-300 hover:border-gold-500/60 hover:shadow-[0_15px_35px_rgba(212,175,55,0.15)] flex flex-col justify-between"
            >
              <div className="relative h-56 w-full rounded-xl overflow-hidden bg-gradient-to-b from-neutral-900 to-black flex items-center justify-center border border-white/5 group-hover:border-gold-500/20">
                {/* Atmospheric Silhouette (Regal White Queen figure) */}
                <div className="absolute inset-0 bg-radial from-neutral-800/40 via-transparent to-black" />
                <div className="relative text-7xl select-none text-neutral-100 transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_10px_25px_rgba(255,255,255,0.25)]">
                  ♕
                </div>
                <div className="absolute bottom-3 inset-x-0 flex justify-center items-center space-x-1.5 text-xs text-gold-400 font-serif font-bold">
                  <span>1 V 1</span>
                </div>
              </div>
              <div className="mt-4 pb-2">
                <h3 className="font-decorative text-xs sm:text-sm font-bold tracking-[0.16em] text-neutral-200 uppercase group-hover:text-gold-300 transition">
                  TWO PLAYER LOCAL
                </h3>
                <span className="block mt-1 text-[11px] text-neutral-400 font-light">
                  Pass &amp; Play • Dual Clocks
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ================= CONFIGURATION MODAL ================= */}
      <AnimatePresence>
        {showConfigModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-gold-500/40 bg-[#101015] p-6 shadow-2xl shadow-black/80"
            >
              <div className="flex items-center justify-between border-b border-surface-border pb-4">
                <h3 className="font-serif text-xl font-bold text-neutral-100 flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-gold-400" />
                  <span>Configure AI Match</span>
                </h3>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-surface hover:text-white transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 space-y-6">
                {/* Difficulty Selection */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                    Select AI Difficulty
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["EASY", "MEDIUM", "HARD"] as Difficulty[]).map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setSelectedDifficulty(diff)}
                        className={`rounded-xl border py-2.5 text-xs font-bold uppercase transition ${
                          selectedDifficulty === diff
                            ? "border-gold-500 bg-gold-500/20 text-gold-200 shadow-md"
                            : "border-surface-border bg-surface text-neutral-400 hover:border-neutral-600 hover:text-neutral-200"
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-neutral-400">
                    {selectedDifficulty === "EASY" && "Shallow depth, casual moves for beginners."}
                    {selectedDifficulty === "MEDIUM" && "Alpha-Beta search at depth 3 with positional evaluation."}
                    {selectedDifficulty === "HARD" && "Deep depth 4 search with tactical move ordering and king safety."}
                  </p>
                </div>

                {/* Player Color Selection */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                    Choose Your Color
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "WHITE", label: "White", icon: "♔" },
                      { id: "BLACK", label: "Black", icon: "♚" },
                      { id: "RANDOM", label: "Random", icon: "🎲" },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedColor(c.id)}
                        className={`flex flex-col items-center justify-center rounded-xl border py-2.5 text-xs font-bold transition ${
                          selectedColor === c.id
                            ? "border-gold-500 bg-gold-500/20 text-gold-200 shadow-md"
                            : "border-surface-border bg-surface text-neutral-400 hover:border-neutral-600 hover:text-neutral-200"
                        }`}
                      >
                        <span className="text-xl">{c.icon}</span>
                        <span className="mt-1">{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clock Timer */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                    Time Control
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 15, 30].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setSelectedTimeMin(mins)}
                        className={`rounded-xl border py-2 text-xs font-medium transition ${
                          selectedTimeMin === mins
                            ? "border-gold-500 bg-gold-500/20 text-gold-200"
                            : "border-surface-border bg-surface text-neutral-400 hover:border-neutral-600 hover:text-neutral-200"
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* Start Button */}
                <button
                  type="button"
                  onClick={handleLaunchComputer}
                  className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-gold-500 via-gold-600 to-amber-600 py-3.5 text-sm font-bold uppercase tracking-wider text-slate-950 shadow-lg shadow-gold-900/40 transition hover:brightness-110"
                >
                  <Swords className="h-4 w-4" />
                  <span>Start Match</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
