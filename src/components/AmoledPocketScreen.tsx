import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Lock, Moon, Battery } from 'lucide-react';
import { Track } from '../types';

interface AmoledPocketScreenProps {
  isActive: boolean;
  onExit: () => void;
  track: Track | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const AmoledPocketScreen: React.FC<AmoledPocketScreenProps> = ({
  isActive,
  onExit,
  track,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrevious
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [unlockAttempts, setUnlockAttempts] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isActive) return null;

  const handleScreenTap = () => {
    if (unlockAttempts >= 1) {
      setUnlockAttempts(0);
      onExit();
    } else {
      setUnlockAttempts(1);
      setTimeout(() => {
        setUnlockAttempts(0);
      }, 1500);
    }
  };

  return (
    <div 
      onClick={handleScreenTap}
      className="fixed inset-0 z-[100] bg-black text-neutral-500 select-none flex flex-col justify-between p-6 cursor-pointer touch-manipulation"
      style={{ backgroundColor: '#000000' }}
    >
      {/* Top minimal status bar */}
      <div className="flex items-center justify-between opacity-30 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <Moon className="w-3.5 h-3.5 text-indigo-400" />
          <span>AMOLED ECO 0.0W</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Battery className="w-3.5 h-3.5 text-emerald-400" />
          <span>AUDIO ONLY</span>
        </div>
      </div>

      {/* Center Clock and Track Info */}
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="text-4xl sm:text-6xl font-light text-neutral-600 font-mono tracking-tight">
          {currentTime}
        </div>

        {track && (
          <div className="text-center max-w-xs px-4">
            <p className="text-sm font-medium text-neutral-400 truncate">
              {track.title}
            </p>
            <p className="text-xs text-neutral-600 truncate mt-0.5">
              {track.artist}
            </p>
          </div>
        )}

        {/* Minimal pocket transport */}
        <div 
          className="flex items-center gap-6 pt-4"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onPrevious}
            className="p-3 text-neutral-600 hover:text-neutral-300 transition-colors"
          >
            <SkipBack className="w-6 h-6 fill-current" />
          </button>

          <button
            onClick={onTogglePlay}
            className="p-4 rounded-full border border-neutral-700 text-neutral-300 hover:text-white transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current translate-x-0.5" />
            )}
          </button>

          <button
            onClick={onNext}
            className="p-3 text-neutral-600 hover:text-neutral-300 transition-colors"
          >
            <SkipForward className="w-6 h-6 fill-current" />
          </button>
        </div>
      </div>

      {/* Bottom unlock hint */}
      <div className="flex flex-col items-center justify-center opacity-40 text-center">
        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
          <Lock className="w-3.5 h-3.5" />
          <span>
            {unlockAttempts === 1 ? '¡Toca una vez más para salir!' : 'Toca 2 veces en cualquier lugar para salir'}
          </span>
        </div>
        <p className="text-[10px] text-neutral-600 mt-1">
          Pantalla negra para evitar toques accidentales y ahorrar 90% de batería
        </p>
      </div>
    </div>
  );
};
