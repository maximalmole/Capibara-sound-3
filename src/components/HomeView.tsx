import React from 'react';
import { Play, Pause, Zap, FolderDown, Download, Heart, Sparkles, Battery, Radio, PlusCircle } from 'lucide-react';
import { Playlist, Track } from '../types';
import { TrackOptionsMenu } from './TrackOptionsMenu';
import { PlaylistOptionsMenu } from './PlaylistOptionsMenu';
import { getPlaylistCover } from '../utils/playlistHelper';

interface HomeViewProps {
  playlists: Playlist[];
  tracks: Track[];
  onSelectPlaylist: (playlistId: string) => void;
  onPlayTrack: (track: Track, contextTracks: Track[]) => void;
  currentTrackId?: string;
  isPlaying: boolean;
  onRenamePlaylist?: (playlistId: string, newTitle: string) => void;
  onDeletePlaylist?: (playlistId: string) => void;
  onUpdatePlaylistCover?: (playlistId: string, newCoverUrl: string) => void;
  onOpenSpotifyImport?: () => void;
  onOpenDataSaverModal: () => void;
  onOpenAddTrack: () => void;
  onDeleteTrack?: (trackId: string) => void;
  onDownloadTrack?: (track: Track) => void;
  onAddToPlaylist?: (playlistId: string, trackId: string) => void;
  onCreatePlaylist?: (title: string) => Promise<Playlist | null>;
}

export const HomeView: React.FC<HomeViewProps> = ({
  playlists,
  tracks,
  onSelectPlaylist,
  onPlayTrack,
  currentTrackId,
  isPlaying,
  onRenamePlaylist,
  onDeletePlaylist,
  onUpdatePlaylistCover,
  onOpenSpotifyImport,
  onOpenDataSaverModal,
  onOpenAddTrack,
  onDeleteTrack,
  onDownloadTrack,
  onAddToPlaylist,
  onCreatePlaylist
}) => {
  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';

  const quickPicks = playlists.slice(0, 6);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-48 md:pb-36 overscroll-contain space-y-8">
      {/* Top Greeting */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {greeting}
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Reproductor de solo audio en segundo plano · Ahorro de batería y datos
        </p>
      </div>

      {/* Quick Picks 6-Grid (Spotify Home Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {quickPicks.map((pl) => {
          const plTracks = tracks.filter((t) => (pl.trackIds || []).includes(t.id));
          const coverUrl = getPlaylistCover(pl, plTracks);

          return (
            <div
              key={pl.id}
              onClick={() => onSelectPlaylist(pl.id)}
              className="flex items-center rounded-lg bg-neutral-900/80 hover:bg-neutral-800 transition-all cursor-pointer group shadow relative"
            >
              <img
                src={coverUrl}
                alt={pl.title}
                referrerPolicy="no-referrer"
                className="w-16 h-16 sm:w-20 sm:h-20 object-cover shrink-0 bg-neutral-800 rounded-l-lg overflow-hidden"
              />
              <div className="px-3 py-2 flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-bold text-white truncate leading-snug">
                  {pl.title}
                </p>
                <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                  {(pl.trackIds || []).length} canciones
                </p>
              </div>
              {/* Hover Play Button & 3 dots */}
              <div className="pr-3 flex items-center gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <PlaylistOptionsMenu
                  playlist={pl}
                  playlistTracks={plTracks}
                  onRenamePlaylist={onRenamePlaylist}
                  onDeletePlaylist={onDeletePlaylist}
                  onUpdatePlaylistCover={onUpdatePlaylistCover}
                  buttonClassName="w-8 h-8 rounded-full bg-neutral-800/90 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition-all shadow"
                />
                <div className="w-8 h-8 rounded-full bg-[#c8824b] text-black flex items-center justify-center shadow-lg shadow-[#c8824b]/40 hover:scale-105 active:scale-95 transition-transform">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Spotlights Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Banner 1: Pegar Enlaces Directos */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-950/40 via-neutral-900 to-neutral-900 border border-orange-500/25 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#c8824b] mb-2">
              <PlusCircle className="w-4 h-4" />
              <span>Agrega tus Canciones</span>
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Pega cualquier enlace de video o canción
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              CAPIBARA SOUND extrae la pista de audio para reproducirla en segundo plano con pantalla apagada y consumo mínimo de datos.
            </p>
          </div>
          <button
            onClick={onOpenAddTrack}
            className="self-start px-4 py-2 rounded-full bg-[#c8824b] hover:bg-[#b5733f] text-black text-xs font-bold transition-transform active:scale-95 shadow"
          >
            + Pegar Nuevo Link
          </button>
        </div>

        {/* Banner 2: Video to Audio-Only Mode */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-neutral-900 to-neutral-900 border border-indigo-500/25 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 mb-2">
              <Radio className="w-4 h-4" />
              <span>Audio en Segundo Plano</span>
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Reproduce links de video sin gastar batería
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              Pega cualquier link de YouTube o video web. Desconectamos la carga de imágenes para gastar un 90% menos de datos móviles.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onOpenAddTrack}
              className="px-4 py-2 rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-bold transition-transform active:scale-95 shadow"
            >
              Pegar Enlace de Video
            </button>
            <button
              onClick={onOpenDataSaverModal}
              className="px-3.5 py-2 rounded-full bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold"
            >
              Ver Estadísticas
            </button>
          </div>
        </div>
      </div>

      {/* Featured Tracks Row */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Pistas destacadas en Modo Solo Audio
            </h2>
            <p className="text-xs text-neutral-400">
              Listas para reproducir en segundo plano con pantalla apagada
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {tracks
            .filter((track) => playlists.some((pl) => (pl.trackIds || []).includes(track.id)))
            .slice(0, 6)
            .map((track) => {
              const isCurrent = track.id === currentTrackId;

            return (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track, tracks)}
                className="p-3 rounded-xl bg-neutral-900/60 hover:bg-neutral-800/80 transition-all cursor-pointer group flex flex-col justify-between relative border border-transparent hover:border-neutral-700/60"
              >
                <div className="relative mb-3 aspect-square rounded-lg overflow-hidden bg-neutral-800 shadow-md">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute right-2 bottom-2 w-10 h-10 rounded-full bg-[#c8824b] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-xl shadow-black/50 transition-all translate-y-2 group-hover:translate-y-0">
                    {isCurrent && isPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </div>
                  {track.isDownloaded && (
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-emerald-600/90 text-white text-[9px] font-black">
                      LOCAL
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-1 mt-1">
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold truncate leading-tight ${isCurrent ? 'text-[#c8824b]' : 'text-white'}`}>
                      {track.title}
                    </p>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                      {track.artist}
                    </p>
                  </div>
                  <TrackOptionsMenu
                    track={track}
                    playlists={playlists}
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
      </div>

      {/* Generous bottom clearance spacer for mobile player and navigation bars */}
      <div className="h-16 md:h-8 w-full pointer-events-none" aria-hidden="true" />
    </div>
  );
};
