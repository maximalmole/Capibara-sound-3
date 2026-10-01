import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Heart, 
  Moon, 
  Download, 
  Headphones, 
  BatteryLow,
  Radio,
  RotateCcw,
  RotateCw,
  Sliders
} from 'lucide-react';
import { PlaybackState, Track, Playlist } from '../types';
import { TrackOptionsMenu } from './TrackOptionsMenu';

interface PlayerBarProps {
  playback: PlaybackState;
  playlists?: Playlist[];
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onToggleFavorite: (trackId: string) => void;
  isFavorite: boolean;
  onOpenFullPlayer: () => void;
  onOpenAmoledPocket: () => void;
  onOpenEqualizer?: () => void;
  onDeleteTrack?: (trackId: string) => void;
  onDownloadTrack?: (track: Track) => void;
  onAddToPlaylist?: (playlistId: string, trackId: string) => void;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  playback,
  playlists = [],
  onTogglePlay,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onCycleRepeat,
  onToggleFavorite,
  isFavorite,
  onOpenFullPlayer,
  onOpenAmoledPocket,
  onOpenEqualizer,
  onDeleteTrack,
  onDownloadTrack,
  onAddToPlaylist
}) => {
  const track = playback.currentTrack;

  if (!track) {
    return (
      <footer className="fixed bottom-14 md:bottom-0 left-0 right-0 z-30 h-16 bg-[#181818]/95 backdrop-blur-md border-t border-neutral-800 flex items-center justify-between px-4 text-xs text-neutral-400">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-neutral-800 flex items-center justify-center text-neutral-500">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-neutral-300">Ninguna pista seleccionada</p>
            <p className="text-[11px] text-neutral-500">Selecciona una canción o pega un enlace de video para reproducir solo el audio</p>
          </div>
        </div>
      </footer>
    );
  }

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const safeDuration = (!playback.duration || isNaN(playback.duration) || playback.duration <= 0) ? 1 : playback.duration;
  const safeTime = (!playback.currentTime || isNaN(playback.currentTime) || playback.currentTime < 0) ? 0 : playback.currentTime;
  const progressPercent = safeDuration > 0 
    ? Math.min(100, Math.max(0, (safeTime / safeDuration) * 100)) 
    : 0;

  // Floating timeline tooltip state for precise seeking
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPercent, setHoverPercent] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState<number | null>(null);

  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setHoverPercent(percent);
    setHoverTime((percent / 100) * safeDuration);
  };

  const handleTimelineMouseLeave = () => {
    if (!isDragging) {
      setHoverTime(null);
    }
  };

  const handleTimelineTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
      const percent = (x / rect.width) * 100;
      setHoverPercent(percent);
      const targetTime = (percent / 100) * safeDuration;
      setHoverTime(targetTime);
      setDragTime(targetTime);
    }
  };

  return (
    <footer className="fixed bottom-14 md:bottom-0 left-0 right-0 z-30 bg-[#181818]/95 backdrop-blur-lg border-t border-neutral-800/90 shadow-2xl transition-all">
      {/* Mobile time display bar & YouTube timeline right on top */}
      <div className="md:hidden w-full bg-neutral-950/80 border-b border-neutral-800/60 px-3 pt-1.5 pb-1">
        <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-neutral-400 mb-1 select-none">
          <div className="flex items-center gap-1.5">
            <span className="text-[#c8824b] font-bold text-xs">
              {formatTime(isDragging && dragTime !== null ? dragTime : safeTime)}
            </span>
            <span className="text-neutral-600">/</span>
            <span className="text-neutral-300 font-semibold">{formatTime(playback.duration)}</span>
          </div>

          {/* Quick -10s / +10s mini buttons for mobile */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSeek(Math.max(0, safeTime - 10))}
              className="px-2 py-0.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[10px] font-bold flex items-center gap-0.5 active:scale-90 transition-transform border border-neutral-700/50"
              title="Atrasar 10s"
            >
              <RotateCcw className="w-3 h-3 text-[#c8824b]" />
              <span>-10s</span>
            </button>
            <button
              onClick={() => onSeek(Math.min(safeDuration, safeTime + 10))}
              className="px-2 py-0.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[10px] font-bold flex items-center gap-0.5 active:scale-90 transition-transform border border-neutral-700/50"
              title="Adelantar 10s"
            >
              <span>+10s</span>
              <RotateCw className="w-3 h-3 text-[#c8824b]" />
            </button>
          </div>
        </div>

        <div 
          className="relative flex items-center h-4 group"
          onMouseMove={handleTimelineMouseMove}
          onMouseLeave={handleTimelineMouseLeave}
          onTouchMove={handleTimelineTouchMove}
          onTouchEnd={() => {
            setIsDragging(false);
            setDragTime(null);
            setHoverTime(null);
          }}
        >
          {/* YouTube Floating Tooltip Badge */}
          {(hoverTime !== null || isDragging) && (
            <div
              className="absolute -top-6 -translate-x-1/2 bg-black/95 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow-xl border border-[#c8824b]/60 pointer-events-none z-50 whitespace-nowrap flex items-center gap-1"
              style={{ left: `${isDragging && dragTime !== null ? (dragTime / safeDuration) * 100 : hoverPercent}%` }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#c8824b] animate-ping" />
              <span>{formatTime(isDragging && dragTime !== null ? dragTime : (hoverTime ?? safeTime))}</span>
            </div>
          )}

          <input
            type="range"
            min="0"
            max={safeDuration}
            step="0.5"
            value={isDragging && dragTime !== null ? dragTime : safeTime}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => {
              setIsDragging(false);
              setDragTime(null);
            }}
            onTouchStart={() => setIsDragging(true)}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              setDragTime(val);
              onSeek(val);
            }}
            style={{
              background: `linear-gradient(to right, #c8824b 0%, #c8824b ${progressPercent}%, #2e2e2e ${progressPercent}%, #2e2e2e 100%)`
            }}
            className="w-full h-1.5 appearance-none outline-none cursor-pointer transition-all duration-100
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-[#c8824b]
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:duration-100
              hover:[&::-webkit-slider-thumb]:scale-125
              active:[&::-webkit-slider-thumb]:scale-150
              [&::-moz-range-thumb]:border-none
              [&::-moz-range-thumb]:w-4
              [&::-moz-range-thumb]:h-4
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-[#c8824b]
              [&::-moz-range-thumb]:transition-transform
              [&::-moz-range-thumb]:duration-100
              hover:[&::-moz-range-thumb]:scale-125
              active:[&::-moz-range-thumb]:scale-150"
          />
        </div>
      </div>

      <div className="h-16 md:h-20 px-3 md:px-6 flex items-center justify-between gap-2 md:gap-6">
        {/* Left Zone: Track Info */}
        <div className="flex items-center gap-3 min-w-0 max-w-[45%] md:w-1/4">
          <button
            onClick={onOpenFullPlayer}
            className="relative group shrink-0"
            title="Expandir reproductor completo"
          >
            <img
              src={track.coverUrl}
              alt={track.title}
              referrerPolicy="no-referrer"
              className="w-11 h-11 md:w-14 md:h-14 rounded-md object-cover bg-neutral-800 shadow"
            />
            <div className="absolute inset-0 bg-black/40 rounded-md opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
            {track.isDownloaded && (
              <span 
                className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] text-black font-bold"
                title="Audio local de tu dispositivo"
              >
                ✓
              </span>
            )}
          </button>

          <div className="min-w-0 flex-1 cursor-pointer" onClick={onOpenFullPlayer}>
            <div className="flex items-center gap-1.5">
              <p className="text-xs md:text-sm font-bold text-white truncate hover:underline">
                {track.title}
              </p>
              {track.sourceType === 'youtube' && (
                <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-red-600/30 text-red-300 border border-red-500/30 hidden sm:inline">
                  YT Audio
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-400 truncate hover:text-white transition-colors">
              {track.artist}
            </p>
          </div>

          <button
            onClick={() => onToggleFavorite(track.id)}
            className="p-1 text-neutral-400 hover:text-white transition-colors shrink-0"
            title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          >
            <Heart 
              className={`w-4 h-4 ${isFavorite ? 'fill-[#c8824b] text-[#c8824b]' : ''}`} 
            />
          </button>

          <TrackOptionsMenu
            track={track}
            playlists={playlists}
            onDeleteTrack={onDeleteTrack}
            onDownloadTrack={onDownloadTrack}
            onAddToPlaylist={onAddToPlaylist}
          />
        </div>

        {/* Center Zone: Controls & Scrubber */}
        <div className="flex flex-col items-center justify-center flex-1 max-w-xl">
          {/* Action buttons */}
          <div className="flex items-center gap-3 md:gap-5">
            <button
              onClick={onPrevious}
              className="p-1.5 text-neutral-300 hover:text-white transition-transform active:scale-90"
              title="Anterior"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={onTogglePlay}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-transform flex items-center justify-center shadow-md"
              title={playback.isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {playback.isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              className="p-1.5 text-neutral-300 hover:text-white transition-transform active:scale-90"
              title="Siguiente"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={onCycleRepeat}
              className={`p-1.5 transition-colors hidden md:block ${
                playback.repeatMode !== 'off' ? 'text-[#c8824b]' : 'text-neutral-400 hover:text-white'
              }`}
              title={`Repetir: ${playback.repeatMode}`}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Time Scrubber (Desktop) */}
          <div className="hidden md:flex items-center gap-2.5 w-full mt-1.5 text-[11px] text-neutral-400 tabular-nums select-none">
            <span className="w-10 text-right font-mono font-medium text-neutral-300">
              {formatTime(isDragging && dragTime !== null ? dragTime : safeTime)}
            </span>
            <div 
              className="relative flex-1 group flex items-center h-4 cursor-pointer"
              onMouseMove={handleTimelineMouseMove}
              onMouseLeave={handleTimelineMouseLeave}
            >
              {/* YouTube Floating Tooltip Badge for Desktop */}
              {(hoverTime !== null || isDragging) && (
                <div
                  className="absolute -top-7 -translate-x-1/2 bg-black/95 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow-xl border border-[#c8824b]/60 pointer-events-none z-50 whitespace-nowrap flex items-center gap-1"
                  style={{ left: `${isDragging && dragTime !== null ? (dragTime / safeDuration) * 100 : hoverPercent}%` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c8824b] animate-ping" />
                  <span>{formatTime(isDragging && dragTime !== null ? dragTime : (hoverTime ?? safeTime))}</span>
                </div>
              )}

              <input
                type="range"
                min="0"
                max={safeDuration}
                step="0.5"
                value={isDragging && dragTime !== null ? dragTime : safeTime}
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => {
                  setIsDragging(false);
                  setDragTime(null);
                }}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setDragTime(val);
                  onSeek(val);
                }}
                style={{
                  background: `linear-gradient(to right, #c8824b 0%, #c8824b ${progressPercent}%, #2e2e2e ${progressPercent}%, #2e2e2e 100%)`
                }}
                className="w-full h-1 appearance-none outline-none cursor-pointer transition-all duration-100 rounded-full
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-3.5
                  [&::-webkit-slider-thumb]:h-3.5
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-[#c8824b]
                  [&::-webkit-slider-thumb]:transition-transform
                  [&::-webkit-slider-thumb]:duration-100
                  hover:[&::-webkit-slider-thumb]:scale-150
                  active:[&::-webkit-slider-thumb]:scale-175
                  [&::-moz-range-thumb]:border-none
                  [&::-moz-range-thumb]:w-3.5
                  [&::-moz-range-thumb]:h-3.5
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-[#c8824b]
                  [&::-moz-range-thumb]:transition-transform
                  [&::-moz-range-thumb]:duration-100
                  hover:[&::-moz-range-thumb]:scale-150
                  active:[&::-moz-range-thumb]:scale-175"
              />
            </div>
            <span className="w-10 font-mono text-neutral-400">{formatTime(playback.duration)}</span>
          </div>
        </div>

        {/* Right Zone: Solo Audio badge, Volume, AMOLED & Expand */}
        <div className="flex items-center justify-end gap-2 md:gap-3 min-w-0 md:w-1/4">
          {/* Solo Audio Badge */}
          <div 
            className="hidden lg:flex items-center gap-1 px-2 py-1 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-orange-400 font-semibold shrink-0"
            title="Reproducción de sólo audio activa (sin decodificar video para mínimo consumo)"
          >
            <Radio className="w-3 h-3 text-[#c8824b] animate-pulse" />
            <span>Solo Audio</span>
          </div>



          {/* AMOLED Pocket Mode Button */}
          <button
            onClick={onOpenAmoledPocket}
            className="p-1.5 text-neutral-400 hover:text-indigo-400 transition-colors"
            title="Pantalla Negra AMOLED (Bolsillo)"
          >
            <Moon className="w-4 h-4" />
          </button>

          {/* Volume Slider (Desktop) */}
          <div className="hidden lg:flex items-center gap-1.5 w-28">
            <button
              onClick={onToggleMute}
              className="p-1 text-neutral-400 hover:text-white transition-colors"
            >
              {playback.isMuted || playback.volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={playback.isMuted ? 0 : playback.volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-20 h-1 bg-neutral-700 hover:bg-neutral-600 rounded-full appearance-none outline-none accent-white"
            />
          </div>

          {/* Expand Full Player Button */}
          <button
            onClick={onOpenFullPlayer}
            className="p-1.5 text-neutral-400 hover:text-white transition-colors"
            title="Pantalla completa"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
