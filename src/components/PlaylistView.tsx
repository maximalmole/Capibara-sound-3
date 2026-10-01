import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Shuffle, 
  Repeat,
  Repeat1,
  Sliders,
  Download, 
  Check, 
  Trash2, 
  Plus, 
  Clock, 
  Share2, 
  Music, 
  FolderDown, 
  ExternalLink,
  Edit2,
  MoreVertical,
  FileJson
} from 'lucide-react';
import { Playlist, Track } from '../types';
import { TrackOptionsMenu } from './TrackOptionsMenu';
import { PlaylistOptionsMenu } from './PlaylistOptionsMenu';
import { exportSinglePlaylist } from '../services/storage';
import { getPlaylistCover } from '../utils/playlistHelper';

interface PlaylistViewProps {
  playlist: Playlist;
  tracks: Track[];
  allPlaylists?: Playlist[];
  currentTrackId?: string;
  isPlaying: boolean;
  isShuffle?: boolean;
  onToggleShuffle?: () => void;
  repeatMode?: 'off' | 'one' | 'all';
  onToggleRepeatMode?: () => void;
  onOpenEqualizer?: () => void;
  eqPreset?: string;
  onPlayTrack: (track: Track, playlistTracks: Track[]) => void;
  onTogglePlay: () => void;
  onPlayAll: (shuffle?: boolean) => void;
  onDownloadTrack: (track: Track) => void;
  onDownloadAll: () => void;
  onRemoveTrackFromPlaylist: (trackId: string) => void;
  onRenamePlaylist?: (playlistId: string, newTitle: string) => void;
  onDeletePlaylist: (playlistId: string) => void;
  onUpdatePlaylistCover?: (playlistId: string, newCoverUrl: string) => void;
  onOpenAddTrack: () => void;
  onDeleteTrack?: (trackId: string) => void;
  onAddToPlaylist?: (playlistId: string, trackId: string) => void;
  onCreatePlaylist?: (title: string) => Promise<Playlist | null>;
}

export const PlaylistView: React.FC<PlaylistViewProps> = ({
  playlist,
  tracks,
  allPlaylists = [],
  currentTrackId,
  isPlaying,
  isShuffle = false,
  onToggleShuffle,
  repeatMode = 'off',
  onToggleRepeatMode,
  onOpenEqualizer,
  eqPreset = 'Plano',
  onPlayTrack,
  onTogglePlay,
  onPlayAll,
  onDownloadTrack,
  onDownloadAll,
  onRemoveTrackFromPlaylist,
  onRenamePlaylist,
  onDeletePlaylist,
  onUpdatePlaylistCover,
  onOpenAddTrack,
  onDeleteTrack,
  onAddToPlaylist,
  onCreatePlaylist
}) => {
  const [downloadingAll, setDownloadingAll] = useState(false);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const totalDurationSecs = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  const totalMins = Math.round(totalDurationSecs / 60);
  const downloadedCount = tracks.filter((t) => t.isDownloaded).length;
  const isPlaylistPlaying = tracks.some((t) => t.id === currentTrackId) && isPlaying;

  const handleDownloadAllClick = async () => {
    setDownloadingAll(true);
    await onDownloadAll();
    setTimeout(() => setDownloadingAll(false), 800);
  };

  const handleExportPlaylistJson = async () => {
    try {
      const json = await exportSinglePlaylist(playlist.id);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeTitle = playlist.title.replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download = `CapibaraSound_Lista_${safeTitle}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Error al exportar la lista: ' + err.message);
    }
  };

  const currentCover = getPlaylistCover(playlist, tracks);

  return (
    <div className="flex-1 overflow-y-auto pb-[calc(14rem+env(safe-area-inset-bottom,0px))] md:pb-40 overscroll-contain">
      {/* Header Banner with Gradient */}
      <div className="relative p-6 md:p-8 bg-gradient-to-b from-neutral-800 to-[#121212] flex flex-col md:flex-row items-start md:items-end gap-6">
        <div className="relative group/cover shrink-0">
          <img
            src={currentCover}
            alt={playlist.title}
            referrerPolicy="no-referrer"
            className="w-44 h-44 sm:w-52 sm:h-52 rounded-xl object-cover shadow-2xl bg-neutral-900"
          />
          <div className="absolute top-2.5 right-2.5 z-10">
            <PlaylistOptionsMenu
              playlist={playlist}
              playlistTracks={tracks}
              onRenamePlaylist={onRenamePlaylist}
              onDeletePlaylist={onDeletePlaylist}
              onUpdatePlaylistCover={onUpdatePlaylistCover}
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-neutral-400">
              Lista de reproducción
            </span>
            {playlist.isSpotifyImport && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#c8824b]/20 text-[#c8824b] border border-[#c8824b]/30 flex items-center gap-1">
                <span>Spotify Import</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {playlist.title}
            </h1>
            <PlaylistOptionsMenu
              playlist={playlist}
              playlistTracks={tracks}
              onRenamePlaylist={onRenamePlaylist}
              onDeletePlaylist={onDeletePlaylist}
              onUpdatePlaylistCover={onUpdatePlaylistCover}
              buttonClassName="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition-all shadow"
            />
          </div>

          <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl mb-4 leading-relaxed">
            {playlist.description}
          </p>

          <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium">
            <span className="text-white font-semibold">{tracks.length} canciones</span>
            <span>·</span>
            <span>{totalMins} min aprox.</span>
            {downloadedCount > 0 && (
              <>
                <span>·</span>
                <span className="text-orange-400 font-semibold">{downloadedCount} disponibles offline</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div className="px-6 md:px-8 py-5 flex items-center justify-between gap-4 border-b border-neutral-800/80">
        <div className="flex items-center gap-4">
          {/* Main Play / Pause Button */}
          <button
            onClick={() => {
              if (isPlaylistPlaying) {
                onTogglePlay();
              } else {
                onPlayAll(false);
              }
            }}
            disabled={tracks.length === 0}
            className="w-14 h-14 rounded-full bg-[#c8824b] hover:bg-[#b5733f] disabled:opacity-50 text-black flex items-center justify-center shadow-lg shadow-[#c8824b]/30 hover:scale-105 active:scale-95 transition-all"
            title="Reproducir lista"
          >
            {isPlaylistPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current translate-x-0.5" />
            )}
          </button>

          {/* Shuffle button */}
          <button
            onClick={() => {
              if (isShuffle) {
                // If currently shuffled, toggle it off
                onToggleShuffle?.();
              } else {
                // Turn shuffle mode ON and play random
                if (onToggleShuffle) onToggleShuffle();
                onPlayAll(true);
              }
            }}
            disabled={tracks.length === 0}
            className={`p-3 rounded-full transition-all flex items-center justify-center relative ${
              isShuffle 
                ? 'bg-[#c8824b]/20 text-[#c8824b] border border-[#c8824b]/40 ring-1 ring-[#c8824b]/50 scale-105 shadow-md shadow-[#c8824b]/20' 
                : 'hover:bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title={isShuffle ? "Modo aleatorio: ACTIVADO (Haz clic para desactivar)" : "Modo aleatorio: DESACTIVADO (Haz clic para activar)"}
          >
            <Shuffle className="w-6 h-6" />
            {isShuffle && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#c8824b]" />
            )}
          </button>

          {/* Repeat button (right next to Shuffle button) */}
          <button
            onClick={onToggleRepeatMode}
            disabled={tracks.length === 0}
            className={`p-3 rounded-full transition-all flex items-center justify-center relative ${
              repeatMode !== 'off'
                ? 'bg-[#c8824b]/20 text-[#c8824b] border border-[#c8824b]/40 ring-1 ring-[#c8824b]/50 scale-105 shadow-md shadow-[#c8824b]/20'
                : 'hover:bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title={
              repeatMode === 'one'
                ? 'Repetición: CANCIÓN ACTUAL (Haz clic para repetir toda la lista)'
                : repeatMode === 'all'
                ? 'Repetición: TODA LA LISTA (Haz clic para desactivar)'
                : 'Repetición: DESACTIVADA (Haz clic para repetir canción actual)'
            }
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-6 h-6 text-[#c8824b]" />
            ) : (
              <Repeat className={`w-6 h-6 ${repeatMode === 'all' ? 'text-[#c8824b]' : ''}`} />
            )}
            {repeatMode !== 'off' && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#c8824b]" />
            )}
          </button>

          {/* Equalizer button (placed right next to shuffle button) */}
          <button
            onClick={onOpenEqualizer}
            className={`p-3 rounded-full transition-all flex items-center justify-center relative ${
              eqPreset && eqPreset !== 'Plano'
                ? 'bg-[#c8824b]/20 text-[#c8824b] border border-[#c8824b]/40 ring-1 ring-[#c8824b]/50 scale-105 shadow-md shadow-[#c8824b]/20'
                : 'hover:bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title={`Ecualizador PRO (${eqPreset})`}
          >
            <Sliders className="w-6 h-6" />
            {eqPreset && eqPreset !== 'Plano' && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#c8824b]" />
            )}
          </button>

          {/* Download all button */}
          <button
            onClick={handleDownloadAllClick}
            disabled={downloadingAll || tracks.length === 0}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-semibold transition-all ${
              downloadedCount === tracks.length && tracks.length > 0
                ? 'border-orange-500/40 text-orange-400 bg-orange-500/10'
                : 'border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500'
            }`}
            title="Descargar todas las pistas para escuchar sin conexión"
          >
            {downloadedCount === tracks.length && tracks.length > 0 ? (
              <Check className="w-4 h-4 text-[#c8824b]" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {downloadedCount === tracks.length && tracks.length > 0
                ? 'Descargada Completa'
                : 'Descargar para Modo Offline'}
            </span>
          </button>

          {/* Add Track Button */}
          <button
            onClick={onOpenAddTrack}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors"
            title="Añadir canción o enlace de video a esta lista"
          >
            <Plus className="w-4 h-4 text-[#c8824b]" />
            <span className="hidden sm:inline">Añadir Canción</span>
          </button>

          {/* Export / Share Single Playlist Button */}
          <button
            onClick={handleExportPlaylistJson}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-all border border-neutral-700 hover:border-[#c8824b]/50 shadow"
            title="Descargar esta lista para compartirla con un amigo"
          >
            <FileJson className="w-4 h-4 text-[#c8824b]" />
            <span>Compartir Lista</span>
          </button>
        </div>

        {/* Delete Playlist option */}
        <button
          onClick={() => {
            if (confirm(`¿Eliminar la lista "${playlist.title}"?`)) {
              onDeletePlaylist(playlist.id);
            }
          }}
          className="p-2 text-neutral-500 hover:text-red-400 transition-colors"
          title="Eliminar lista de reproducción"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Track List Table */}
      <div className="px-4 md:px-8 py-4">
        {tracks.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800/80">
            <Music className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">Tu lista está vacía</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4">
              Pega un enlace de video de YouTube o importa una playlist de Spotify para comenzar.
            </p>
            <button
              onClick={onOpenAddTrack}
              className="px-4 py-2 rounded-full bg-[#c8824b] text-black text-xs font-bold hover:bg-[#b5733f] transition-transform active:scale-95"
            >
              Añadir Canción por Link
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-800/60">
              <span className="col-span-1 text-center">#</span>
              <span className="col-span-6 md:col-span-5">Título</span>
              <span className="col-span-3 hidden md:block">Álbum / Origen</span>
              <span className="col-span-5 md:col-span-3 text-right flex items-center justify-end gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Duración</span>
              </span>
            </div>

            {/* Rows */}
            {tracks.map((track, idx) => {
              const isCurrent = track.id === currentTrackId;

              return (
                <div
                  key={track.id}
                  className={`grid grid-cols-12 gap-2 items-center px-3 py-2.5 rounded-lg group transition-colors cursor-pointer ${
                    isCurrent ? 'bg-neutral-800/90 text-[#c8824b]' : 'hover:bg-neutral-800/50 text-neutral-300'
                  }`}
                  onClick={() => onPlayTrack(track, tracks)}
                >
                  {/* # or Play indicator */}
                  <div className="col-span-1 flex items-center justify-center text-xs font-medium text-neutral-500 group-hover:text-white">
                    {isCurrent && isPlaying ? (
                      <span className="w-3 h-3 text-[#c8824b]">▶</span>
                    ) : (
                      <span className="group-hover:hidden">{idx + 1}</span>
                    )}
                    <Play className="w-4 h-4 fill-current hidden group-hover:inline text-white" />
                  </div>

                  {/* Title & Cover */}
                  <div className="col-span-6 md:col-span-5 flex items-center gap-3 min-w-0">
                    <img
                      src={track.coverUrl}
                      alt=""
                      className="w-10 h-10 rounded object-cover bg-neutral-800 shrink-0"
                    />
                    <div className="truncate">
                      <p className={`text-xs sm:text-sm font-semibold truncate ${isCurrent ? 'text-[#c8824b]' : 'text-white'}`}>
                        {track.title}
                      </p>
                      <p className="text-[11px] text-neutral-400 truncate">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  {/* Album / Source */}
                  <div className="col-span-3 hidden md:block text-xs text-neutral-400 truncate">
                    <span className="truncate">{track.album || 'SoundStream'}</span>
                    {track.sourceType === 'youtube' && (
                      <span className="ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/20">
                        YouTube Audio
                      </span>
                    )}
                  </div>

                  {/* Duration & Actions Menu */}
                  <div 
                    className="col-span-5 md:col-span-3 flex items-center justify-end gap-2 text-xs text-neutral-400 tabular-nums"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>{formatTime(track.duration)}</span>

                    <TrackOptionsMenu 
                      track={track}
                      playlists={allPlaylists}
                      onRemoveFromPlaylist={onRemoveTrackFromPlaylist}
                      onDeleteTrack={onDeleteTrack}
                      onDownloadTrack={onDownloadTrack}
                      onAddToPlaylist={onAddToPlaylist}
                      onCreatePlaylist={onCreatePlaylist}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Generous bottom clearance spacer for mobile player and navigation bars */}
        <div className="h-20 md:h-12 w-full pointer-events-none" aria-hidden="true" />
      </div>
    </div>
  );
};
