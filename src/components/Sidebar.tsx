import React from 'react';
import { Home, Search, Library, HardDrive, Plus } from 'lucide-react';
import { ViewTab, Playlist } from '../types';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  playlists: Playlist[];
  selectedPlaylistId: string | null;
  onSelectPlaylist: (playlistId: string) => void;
  onCreatePlaylist: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  playlists,
  selectedPlaylistId,
  onSelectPlaylist,
  onCreatePlaylist
}) => {
  return (
    <aside className="w-64 bg-[#000000] p-3 flex flex-col gap-2 shrink-0 select-none hidden md:flex h-full">
      {/* Primary Navigation Card */}
      <div className="bg-[#121212] rounded-xl p-3 flex flex-col gap-1">
        <button
          onClick={() => onSelectTab('home')}
          className={`flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${
            currentTab === 'home' && !selectedPlaylistId
              ? 'text-white bg-white/10'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Inicio</span>
        </button>

        <button
          onClick={() => onSelectTab('search')}
          className={`flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${
            currentTab === 'search'
              ? 'text-white bg-white/10'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Search className="w-5 h-5" />
          <span>Buscar y Links</span>
        </button>

        <button
          onClick={() => onSelectTab('offline')}
          className={`flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${
            currentTab === 'offline'
              ? 'text-white bg-white/10'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <HardDrive className="w-5 h-5 text-orange-400" />
          <div className="flex items-center justify-between w-full">
            <span>Tu Dispositivo</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400">Local</span>
          </div>
        </button>
      </div>

      {/* Library & Playlists Card */}
      <div className="bg-[#121212] rounded-xl p-3 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-2 pb-3 border-b border-neutral-800">
          <button
            onClick={() => onSelectTab('library')}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
          >
            <Library className="w-4 h-4" />
            <span>Tu Biblioteca</span>
          </button>
          <button
            onClick={onCreatePlaylist}
            title="Crear nueva lista"
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Playlist list */}
        <div className="flex-1 overflow-y-auto pt-2 space-y-1 pr-1">
          {playlists.map((pl) => {
            const isSelected = selectedPlaylistId === pl.id;
            return (
              <button
                key={pl.id}
                onClick={() => onSelectPlaylist(pl.id)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                  isSelected
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-300 hover:bg-neutral-900/80 hover:text-white'
                }`}
              >
                <img
                  src={pl.coverUrl}
                  alt={pl.title}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded object-cover shrink-0 bg-neutral-800"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate leading-snug">{pl.title}</p>
                  <p className="text-[11px] text-neutral-400 truncate">
                    {(pl.trackIds || []).length} canciones
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
