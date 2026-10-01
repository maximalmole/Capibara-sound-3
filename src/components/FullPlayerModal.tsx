import React, { useState } from 'react';
import { 
  ChevronDown, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Heart, 
  Download, 
  Check, 
  Clock, 
  Gauge, 
  ListMusic, 
  FileText, 
  Moon, 
  Radio, 
  Volume2, 
  Share2, 
  Zap,
  Trash2,
  Sliders,
  Layers
} from 'lucide-react';
import { PlaybackState, Track } from '../types';

interface FullPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  playback: PlaybackState;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onToggleFavorite: (trackId: string) => void;
  isFavorite: boolean;
  onDownloadTrack: (track: Track) => void;
  onOpenAmoledPocket: () => void;
  onOpenEqualizer?: () => void;
  onSetSleepTimer: (mins: number | null) => void;
  onSetPlaybackRate: (rate: number) => void;
  queue: Track[];
  onPlayFromQueue: (track: Track) => void;
}

type TabMode = 'player' | 'lyrics' | 'queue' | 'settings';

export const FullPlayerModal: React.FC<FullPlayerModalProps> = ({
  isOpen,
  onClose,
  playback,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onToggleShuffle,
  onCycleRepeat,
  onToggleFavorite,
  isFavorite,
  onDownloadTrack,
  onOpenAmoledPocket,
  onOpenEqualizer,
  onSetSleepTimer,
  onSetPlaybackRate,
  queue,
  onPlayFromQueue
}) => {
  const [activeTab, setActiveTab] = useState<TabMode>('player');
  const [showShareToast, setShowShareToast] = useState(false);

  // Floating timeline tooltip state for precise seeking
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPercent, setHoverPercent] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState<number | null>(null);

  if (!isOpen || !playback.currentTrack) return null;

  const track = playback.currentTrack;
  const safeDuration = (!playback.duration || isNaN(playback.duration) || playback.duration <= 0) ? 1 : playback.duration;
  const safeTime = (!playback.currentTime || isNaN(playback.currentTime) || playback.currentTime < 0) ? 0 : playback.currentTime;
  const progressPercent = safeDuration > 0 
    ? Math.min(100, Math.max(0, (safeTime / safeDuration) * 100)) 
    : 0;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: track.title,
        text: `Escuchando "${track.title}" de ${track.artist} en Capibara Sound en segundo plano.`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#121212] overflow-y-auto flex flex-col justify-between p-4 md:p-8 animate-in fade-in duration-200">
      {/* Dynamic blurred ambient glow behind album */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none blur-3xl scale-125"
        style={{
          backgroundImage: `url(${track.coverUrl})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      />

      {/* Top Bar Header */}
      <div className="relative z-10 flex items-center justify-between">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Minimizar reproductor"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="text-center">
          <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
            Capibara Sound · Solo Audio
          </p>
          <p className="text-xs font-semibold text-neutral-200 truncate max-w-[200px] md:max-w-xs">
            {track.album || 'Capibara Sound Player'}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenAmoledPocket}
            className="p-2 rounded-full text-indigo-400 hover:text-indigo-300 hover:bg-white/10 transition-colors"
            title="Pantalla Negra AMOLED"
          >
            <Moon className="w-5 h-5" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Compartir canción"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showShareToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#c8824b] text-black text-xs font-bold shadow-lg animate-in fade-in">
          Enlace copiado al portapapeles
        </div>
      )}

      {/* Tab Switcher */}
      <div className="relative z-10 flex items-center justify-center gap-2 my-2">
        <button
          onClick={() => setActiveTab('player')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'player'
              ? 'bg-white text-black'
              : 'text-neutral-400 hover:text-white bg-white/5'
          }`}
        >
          Canción
        </button>
        <button
          onClick={() => setActiveTab('lyrics')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'lyrics'
              ? 'bg-white text-black'
              : 'text-neutral-400 hover:text-white bg-white/5'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Letras & Notas</span>
        </button>
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'queue'
              ? 'bg-white text-black'
              : 'text-neutral-400 hover:text-white bg-white/5'
          }`}
        >
          <ListMusic className="w-3.5 h-3.5" />
          <span>Cola ({queue.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'settings'
              ? 'bg-white text-black'
              : 'text-neutral-400 hover:text-white bg-white/5'
          }`}
        >
          <Gauge className="w-3.5 h-3.5" />
          <span>Velocidad & Timer</span>
        </button>
      </div>

      {/* Middle Content Section */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-4 max-w-lg mx-auto w-full">
        {activeTab === 'player' && (
          <div className="w-full flex flex-col items-center">
            {/* Big Album Art */}
            <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-2xl overflow-hidden shadow-2xl relative group bg-neutral-900 border border-white/5">
              <img
                src={track.coverUrl}
                alt={track.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {/* Audio-only stream indicator watermark */}
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-orange-400 flex items-center gap-1.5 border border-orange-500/30">
                <Radio className="w-3.5 h-3.5 text-[#c8824b]" />
                <span>Audio Stream</span>
              </div>
            </div>

            {/* Audio Visualizer Equalizer (Only active when playing and battery saver not active) */}
            <div className="h-6 flex items-end gap-1.5 mt-5">
              {!playback.batterySaverActive && playback.isPlaying ? (
                <>
                  <div className="w-1 bg-[#c8824b] rounded-full animate-soundwave-1" />
                  <div className="w-1 bg-[#c8824b] rounded-full animate-soundwave-2" />
                  <div className="w-1 bg-[#c8824b] rounded-full animate-soundwave-3" />
                  <div className="w-1 bg-[#c8824b] rounded-full animate-soundwave-4" />
                  <div className="w-1 bg-[#c8824b] rounded-full animate-soundwave-2" />
                  <div className="w-1 bg-[#c8824b] rounded-full animate-soundwave-1" />
                </>
              ) : (
                <div className="text-[11px] text-neutral-500 font-medium">
                  {playback.batterySaverActive ? 'Visualizador desactivado (Modo Ahorro)' : 'Audio pausado'}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'lyrics' && (
          <div className="w-full h-80 overflow-y-auto bg-neutral-900/60 backdrop-blur-md rounded-2xl p-6 border border-neutral-800 text-neutral-200">
            <h4 className="text-sm font-bold text-white mb-3">Letras y Notas de la pista</h4>
            <p className="whitespace-pre-line text-sm leading-relaxed font-medium">
              {track.lyrics || 'No hay letras disponibles para esta pista de audio.'}
            </p>
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="w-full h-80 overflow-y-auto bg-neutral-900/60 backdrop-blur-md rounded-2xl p-4 border border-neutral-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-2">A continuación en la cola</h4>
            {queue.map((qTrack, idx) => (
              <div
                key={`${qTrack.id}-${idx}`}
                onClick={() => onPlayFromQueue(qTrack)}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                  qTrack.id === track.id ? 'bg-neutral-800 text-[#c8824b]' : 'hover:bg-neutral-800/60 text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-bold text-neutral-500 w-4 text-center">{idx + 1}</span>
                  <img src={qTrack.coverUrl} alt="" className="w-8 h-8 rounded object-cover" />
                  <div className="truncate">
                    <p className="text-xs font-semibold truncate">{qTrack.title}</p>
                    <p className="text-[11px] text-neutral-400 truncate">{qTrack.artist}</p>
                  </div>
                </div>
                <span className="text-[11px] text-neutral-400 tabular-nums">{formatTime(qTrack.duration)}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="w-full bg-neutral-900/60 backdrop-blur-md rounded-2xl p-6 border border-neutral-800 space-y-5">
            {/* Sleep Timer */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Temporizador de Apagado (Dormir)
                </span>
                {playback.sleepTimerRemaining && (
                  <span className="text-xs text-amber-400 font-semibold tabular-nums">
                    {Math.ceil(playback.sleepTimerRemaining / 60)} min restantes
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => onSetSleepTimer(mins)}
                    className="py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-white transition-colors"
                  >
                    {mins}m
                  </button>
                ))}
              </div>
              {playback.sleepTimerRemaining && (
                <button
                  onClick={() => onSetSleepTimer(null)}
                  className="mt-2 text-xs text-red-400 hover:underline"
                >
                  Cancelar temporizador
                </button>
              )}
            </div>

            {/* Playback Rate */}
            <div>
              <span className="text-xs font-bold text-white flex items-center gap-1.5 mb-2">
                <Gauge className="w-4 h-4 text-indigo-400" />
                Velocidad de Reproducción
              </span>
              <div className="grid grid-cols-5 gap-2">
                {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => onSetPlaybackRate(rate)}
                    className={`py-2 rounded-lg text-xs font-bold transition-colors ${
                      playback.playbackRate === rate
                        ? 'bg-[#c8824b] text-black'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Area */}
      <div className="relative z-10 max-w-lg mx-auto w-full space-y-4">
        {/* Track Title and Actions */}
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-4">
            <h2 className="text-lg md:text-xl font-bold text-white truncate leading-tight">
              {track.title}
            </h2>
            <p className="text-sm text-neutral-400 truncate mt-0.5">
              {track.artist}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">


            {/* Download for offline */}
            <button
              onClick={() => onDownloadTrack(track)}
              className={`p-2.5 rounded-full border transition-all ${
                track.isDownloaded
                  ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                  : 'border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500'
              }`}
              title={track.isDownloaded ? 'Descargado para modo offline' : 'Descargar para reproducir sin conexión'}
            >
              {track.isDownloaded ? (
                <Check className="w-5 h-5 text-[#c8824b]" />
              ) : (
                <Download className="w-5 h-5" />
              )}
            </button>

            {/* Favorite button */}
            <button
              onClick={() => onToggleFavorite(track.id)}
              className="p-2.5 text-neutral-400 hover:text-white transition-colors"
              title="Añadir a favoritos"
            >
              <Heart 
                className={`w-6 h-6 ${isFavorite ? 'fill-[#c8824b] text-[#c8824b]' : ''}`} 
              />
            </button>
          </div>
        </div>

        {/* Scrubber Slider with YouTube Floating Time Tooltip */}
        <div className="space-y-2 select-none">
          <div 
            className="relative flex items-center h-5 group cursor-pointer"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
              const percent = (x / rect.width) * 100;
              setHoverPercent(percent);
              setHoverTime((percent / 100) * safeDuration);
            }}
            onMouseLeave={() => {
              if (!isDragging) setHoverTime(null);
            }}
            onTouchMove={(e) => {
              if (e.touches.length > 0) {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
                const percent = (x / rect.width) * 100;
                setHoverPercent(percent);
                const targetTime = (percent / 100) * safeDuration;
                setHoverTime(targetTime);
                setDragTime(targetTime);
              }
            }}
            onTouchEnd={() => {
              setIsDragging(false);
              setDragTime(null);
              setHoverTime(null);
            }}
          >
            {/* YouTube Floating Tooltip Badge */}
            {(hoverTime !== null || isDragging) && (
              <div
                className="absolute -top-7 -translate-x-1/2 bg-black/95 text-white font-mono text-[11px] font-bold px-2.5 py-0.5 rounded shadow-2xl border border-[#c8824b]/60 pointer-events-none z-50 whitespace-nowrap flex items-center gap-1.5"
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
              className="w-full h-2 appearance-none outline-none cursor-pointer transition-all duration-100 rounded-full
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4.5
                [&::-webkit-slider-thumb]:h-4.5
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-[#c8824b]
                [&::-webkit-slider-thumb]:transition-transform
                [&::-webkit-slider-thumb]:duration-100
                hover:[&::-webkit-slider-thumb]:scale-125
                active:[&::-webkit-slider-thumb]:scale-150
                [&::-moz-range-thumb]:border-none
                [&::-moz-range-thumb]:w-4.5
                [&::-moz-range-thumb]:h-4.5
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-[#c8824b]
                [&::-moz-range-thumb]:transition-transform
                [&::-moz-range-thumb]:duration-100
                hover:[&::-moz-range-thumb]:scale-125
                active:[&::-moz-range-thumb]:scale-150"
            />
          </div>

          <div className="flex justify-between text-xs font-mono text-neutral-400 tabular-nums px-0.5">
            <span className="text-[#c8824b] font-bold">
              {formatTime(isDragging && dragTime !== null ? dragTime : safeTime)}
            </span>
            <span className="text-neutral-300 font-medium">{formatTime(playback.duration)}</span>
          </div>
        </div>

        {/* Main Transport Buttons */}
        <div className="flex items-center justify-center gap-8 sm:gap-12 px-4 pt-2">
          <button
            onClick={onPrevious}
            className="p-2 text-neutral-300 hover:text-white transition-transform active:scale-90"
            title="Anterior"
          >
            <SkipBack className="w-7 h-7 fill-current" />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-16 h-16 rounded-full bg-[#c8824b] text-black hover:scale-105 active:scale-95 transition-transform flex items-center justify-center shadow-xl shadow-[#c8824b]/25"
            title={playback.isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {playback.isPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current translate-x-0.5" />
            )}
          </button>

          <button
            onClick={onNext}
            className="p-2 text-neutral-300 hover:text-white transition-transform active:scale-90"
            title="Siguiente"
          >
            <SkipForward className="w-7 h-7 fill-current" />
          </button>

          <button
            onClick={onCycleRepeat}
            className={`p-2 transition-colors ${
              playback.repeatMode !== 'off' ? 'text-[#c8824b]' : 'text-neutral-400 hover:text-white'
            }`}
            title={`Repetir: ${playback.repeatMode}`}
          >
            <Repeat className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
