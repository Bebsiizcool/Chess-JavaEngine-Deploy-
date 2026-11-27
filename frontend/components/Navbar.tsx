"use client";

import React from "react";
import { Volume2, VolumeX, RotateCcw, Home, Swords, Crown } from "lucide-react";
import { sounds } from "../lib/sound";

interface NavbarProps {
  onHomeClick?: () => void;
  activeMode?: string | null;
  onRestartClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onHomeClick, activeMode, onRestartClick }) => {
  const [soundOn, setSoundOn] = React.useState(true);

  const handleToggleSound = () => {
    const next = sounds.toggleSound();
    setSoundOn(next);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-surface-border/70 bg-[#08080a]/85 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-8">
        {/* Brand Logo with Majestic King Silhouette */}
        <div
          onClick={onHomeClick}
          className="flex cursor-pointer items-center space-x-3.5 group transition"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold-500/30 bg-gradient-to-b from-[#181820] to-[#0c0c10] shadow-lg shadow-black/60 group-hover:border-gold-500/70 transition">
            {/* Minimalist White Chess King Icon */}
            <svg
              className="h-6 w-6 text-gold-300 transition-transform group-hover:scale-105"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2a1 1 0 0 1 1 1v1h1a1 1 0 1 1 0 2h-1v1.1c2.8.5 5 2.8 5 5.9 0 2.2-1.1 4-2.8 5.1l1.8 2.9H7l1.8-2.9C7.1 15 6 13.2 6 11c0-3.1 2.2-5.4 5-5.9V6H10a1 1 0 1 1 0-2h1V3a1 1 0 0 1 1-1zm0 7c-2 0-3.6 1.6-3.6 3.6 0 1.2.6 2.3 1.6 3l.8.6-.6 1H8.6l-.7 1.2h8.2l-.7-1.2h-1.2l-.6-1 .8-.6c1-.7 1.6-1.8 1.6-3 0-2-1.6-3.6-3.6-3.6z" />
            </svg>
          </div>
          <div>
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-widest text-slate-100 group-hover:text-gold-200 transition">
              PLAY<span className="gold-gradient-text">CHESS</span>
            </span>
            <span className="block text-[9px] uppercase tracking-[0.22em] text-neutral-400 font-medium">
              Grandmaster Arena
            </span>
          </div>
        </div>

        {/* Center Mode Display (Visible when playing) */}
        {activeMode && (
          <div className="flex items-center space-x-2.5 rounded-full border border-gold-500/40 bg-surface px-4 py-1.5 text-xs text-neutral-200 shadow-lg shadow-black/40">
            <span className="h-2 w-2 rounded-full bg-gold-400 animate-pulse" />
            <span className="font-serif font-bold tracking-wider">{activeMode}</span>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {onRestartClick && (
            <button
              onClick={onRestartClick}
              title="Restart match"
              className="flex items-center space-x-1.5 rounded-xl border border-surface-border bg-surface px-3.5 py-2 text-xs font-semibold text-neutral-300 transition hover:border-gold-500/50 hover:text-white shadow-sm"
            >
              <RotateCcw className="h-3.5 w-3.5 text-gold-400" />
              <span className="hidden sm:inline">Restart</span>
            </button>
          )}

          {activeMode && onHomeClick && (
            <button
              onClick={onHomeClick}
              title="Return to Menu"
              className="flex items-center space-x-1.5 rounded-xl border border-surface-border bg-surface px-3.5 py-2 text-xs font-semibold text-neutral-300 transition hover:border-gold-500/50 hover:text-white shadow-sm"
            >
              <Home className="h-3.5 w-3.5 text-gold-400" />
              <span className="hidden sm:inline">Lobby</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            title={soundOn ? "Mute audio" : "Enable audio"}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-surface-border bg-surface text-neutral-300 transition hover:border-gold-500/50 hover:text-gold-300 shadow-sm"
          >
            {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
