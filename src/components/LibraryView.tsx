import React, { useState } from 'react';
import { Plus, Upload, Check } from 'lucide-react';
import { Playlist, Track } from '../types';
import { importBackupData } from '../services/storage';
import { PlaylistOptionsMenu } from './PlaylistOptionsMenu';
import { getPlaylistCover } from '../utils/playlistHelper';

interface LibraryViewProps {
  playlists: Playlist[];
  tracks: Track[];
  onSelectPlaylist: (playlistId: string) => void;
  onCreatePlaylist: () => void;
  onRenamePlaylist?: (playlistId: string, newTitle: string) => void;
  onDeletePlaylist?: (playlistId: string) => void;
  onUpdatePlaylistCover?: (playlistId: string, newCoverUrl: string) => void;
  onOpenStorageInfo: () => void;
  onSelectTab: (tab: any) => void;
  onDataRestored?: (data: { tracks: Track[]; playlists: Playlist[] }) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  playlists,
  tracks,
  onSelectPlaylist,
  onCreatePlaylist,
  onRenamePlaylist,
  onDeletePlaylist,
  onUpdatePlaylistCover,
  onOpenStorageInfo,
  onDataRestored
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleImportSharedFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus('Cargando lista compartida...');
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const result = await importBackupData(text);
        if (onDataRestored) {
          onDataRestored(result);
        }
        setImportStatus('¡Lista agregada con éxito!');
        setTimeout(() => setImportStatus(null), 3000);
      } catch (err: any) {
        alert(err.message || 'Error al importar lista compartida.');
        setImportStatus(null);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-48 md:pb-36 overscroll-contain space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Tu Biblioteca</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Tus listas de reproducción personalizadas guardadas localmente
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenStorageInfo}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-neutral-900 border border-neutral-700 hover:border-indigo-500/50 text-neutral-300 hover:text-white text-xs font-semibold transition-colors"
            title="Ver cómo se guardan tus listas y exportar copia de seguridad"
          >
            <span>💾 Respaldo y Guardado</span>
          </button>

          <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-all border border-neutral-700 hover:border-[#c8824b]/50 cursor-pointer shadow">
            <Upload className="w-4 h-4 text-[#c8824b]" />
            <span>Agregar Lista Compartida</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportSharedFile}
              className="hidden"
            />
          </label>

          <button
            onClick={onCreatePlaylist}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#c8824b] hover:bg-[#b5733f] text-black text-xs font-bold transition-transform active:scale-95 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Lista</span>
          </button>
        </div>
      </div>

      {importStatus && (
        <div className="p-3 rounded-xl bg-[#c8824b]/15 border border-[#c8824b]/40 text-xs text-[#c8824b] font-bold flex items-center gap-2 animate-pulse">
          <Check className="w-4 h-4" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* Playlists Header Subtitle */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Mis Listas ({playlists.length})
        </span>
      </div>

      {/* Playlists Grid */}
      {playlists.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800/80 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-[#c8824b]/10 text-[#c8824b] flex items-center justify-center mb-3">
            <Plus className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Aún no tienes listas creadas</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4">
            Crea tu primera lista para organizar tus canciones favoritas con ahorro de datos y batería.
          </p>
          <button
            type="button"
            onClick={onCreatePlaylist}
            className="px-5 py-2.5 rounded-full bg-[#c8824b] hover:bg-[#b5733f] text-black text-xs font-black uppercase tracking-wider transition-transform active:scale-95 shadow"
          >
            Crear mi primera lista
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {playlists.map((pl) => {
            const plTracks = tracks.filter((t) => (pl.trackIds || []).includes(t.id));
            const coverUrl = getPlaylistCover(pl, plTracks);

            return (
              <div
                key={pl.id}
                onClick={() => onSelectPlaylist(pl.id)}
                className="p-3 rounded-2xl bg-neutral-900/60 hover:bg-neutral-800 transition-all cursor-pointer group flex flex-col justify-between border border-transparent hover:border-neutral-700/60 shadow"
              >
                <div className="aspect-square rounded-xl bg-neutral-800 mb-3 shadow relative group/cover">
                  <img
                    src={coverUrl}
                    alt={pl.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 overflow-hidden"
                  />
                  {/* 3 Dots Menu Button */}
                  <div 
                    className="absolute top-2 right-2 z-30"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <PlaylistOptionsMenu
                      playlist={pl}
                      playlistTracks={plTracks}
                      onRenamePlaylist={onRenamePlaylist}
                      onDeletePlaylist={onDeletePlaylist}
                      onUpdatePlaylistCover={onUpdatePlaylistCover}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-white truncate">{pl.title}</h3>
                  <p className="text-xs text-neutral-400 truncate mt-0.5">
                    {(pl.trackIds || []).length} canciones
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Generous bottom clearance spacer for mobile player and navigation bars */}
      <div className="h-16 md:h-8 w-full pointer-events-none" aria-hidden="true" />
    </div>
  );
};
