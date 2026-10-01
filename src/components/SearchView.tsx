import React, { useState, useEffect, useRef } from 'react';
import { Search, Link, Play, Youtube, Download, Check, Plus, Radio, Music, FolderPlus, ChevronLeft, MoreVertical, Sparkles } from 'lucide-react';
import { Track, Playlist } from '../types';
import { TrackOptionsMenu } from './TrackOptionsMenu';
import { searchYouTubeTracks, fetchSearchSuggestions, YouTubeSearchResult } from '../services/youtubeImporter';

interface SearchViewProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  tracks: Track[];
  playlists?: Playlist[];
  onPlayTrack: (track: Track, tracks: Track[]) => void;
  currentTrackId?: string;
  isPlaying: boolean;
  onDownloadTrack: (track: Track) => void;
  onAddTrackQuick: (url: string) => void;
  onDeleteTrack?: (trackId: string) => void;
  onAddToPlaylist?: (playlistId: string, trackId: string) => void;
  onCreatePlaylist?: (title: string) => Promise<Playlist | null>;
  onImportYouTubeSearchTrack?: (searchTrack: any, targetPlaylistId?: string) => Promise<Track>;
}

export const SearchView: React.FC<SearchViewProps> = ({
  searchQuery,
  onSearchChange,
  tracks,
  playlists = [],
  onPlayTrack,
  currentTrackId,
  isPlaying,
  onDownloadTrack,
  onAddTrackQuick,
  onDeleteTrack,
  onAddToPlaylist,
  onCreatePlaylist,
  onImportYouTubeSearchTrack
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [ytResults, setYtResults] = useState<YouTubeSearchResult[]>([]);
  const [loadingYt, setLoadingYt] = useState(false);
  const [justImportedId, setJustImportedId] = useState<string | null>(null);

  const isUrl = /^(https?:\/\/|www\.)[^\s/$.?#].[^\s]*$/i.test(searchQuery.trim());

  // Instant debounced query suggestions from Google / YouTube
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query || isUrl) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const sugs = await fetchSearchSuggestions(query);
        setSuggestions(sugs);
      } catch (err) {
        console.warn('Error fetching search suggestions:', err);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery, isUrl]);

  // Snappy debounced search on YouTube / online catalog
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query || isUrl) {
      setYtResults([]);
      setLoadingYt(false);
      return;
    }

    setLoadingYt(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const results = await searchYouTubeTracks(query);
        setYtResults(results);
      } catch (err) {
        console.error('YouTube search error:', err);
      } finally {
        setLoadingYt(false);
      }
    }, 350);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, isUrl]);

  // Filter local tracks
  const filteredTracks = tracks.filter((track) => {
    const matchesQuery = 
      !searchQuery.trim() ||
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (track.album && track.album.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (track.tags && track.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesTag = 
      selectedTag === 'all' || 
      (track.tags && track.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase()));

    return matchesQuery && matchesTag;
  });

  const allTags = ['all', 'Lofi', 'Synthwave', 'Acústico', 'Podcast', 'YouTube'];

  const categories = [
    { title: 'Lo-Fi & Relax', color: 'from-amber-700 to-amber-950', tag: 'Lofi' },
    { title: 'Electrónica & Synth', color: 'from-purple-700 to-purple-950', tag: 'Synthwave' },
    { title: 'Acústico & Calma', color: 'from-orange-700 to-orange-950', tag: 'Acústico' },
    { title: 'Podcasts & Charlas', color: 'from-blue-700 to-blue-950', tag: 'Podcast' },
    { title: 'YouTube Audio Streams', color: 'from-red-700 to-red-950', tag: 'YouTube' }
  ];

  // Helper to handle playing YouTube Search Result
  const handlePlayYtResult = (item: YouTubeSearchResult) => {
    // Create track instance immediately so onPlayTrack is called synchronously within user click event!
    const trackToPlay: Track = {
      id: `yt-track-${item.youtubeId}`,
      title: item.title,
      artist: item.artist,
      album: 'YouTube Live Search',
      duration: item.duration || 200,
      sourceType: 'youtube',
      sourceUrl: item.sourceUrl,
      youtubeId: item.youtubeId,
      coverUrl: item.coverUrl,
      isDownloaded: false,
      addedAt: Date.now(),
      fileSizeMb: parseFloat(((item.duration || 200) * 0.022).toFixed(1)) || 4.5,
      lyrics: `[Pista de YouTube]\nReproducción de audio en segundo plano sin video.`,
      tags: ['YouTube', item.artist]
    };

    // Play immediately with user activation intact
    onPlayTrack(trackToPlay, [trackToPlay]);

    // Save in background if handler is provided
    if (onImportYouTubeSearchTrack) {
      onImportYouTubeSearchTrack(item).catch((err) => {
        console.warn('Background import note:', err);
      });
    }
  };

  // Helper to add YouTube result directly to local library
  const handleSaveToLibrary = async (item: YouTubeSearchResult) => {
    if (!onImportYouTubeSearchTrack) return;
    try {
      setJustImportedId(item.youtubeId);
      await onImportYouTubeSearchTrack(item);
      setTimeout(() => setJustImportedId(null), 1500);
    } catch (err) {
      console.error('Error importing YouTube result:', err);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-48 md:pb-36 overscroll-contain space-y-6">
      {/* Mobile/Direct Search Bar */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-3">Buscar</h1>
        <div className="relative max-w-xl">
          <Search className="w-5 h-5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="¿Qué quieres escuchar? Canción, artista o pega un link de YouTube..."
            className="w-full bg-[#242424] text-sm text-white placeholder-neutral-400 rounded-full pl-11 pr-10 py-3 border border-neutral-700 focus:border-[#c8824b] focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
              title="Borrar búsqueda"
            >
              ✕
            </button>
          )}
        </div>

        {/* Dynamic Search Suggestions Chips */}
        {suggestions.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none mt-1 animate-in fade-in">
            <span className="text-[11px] text-neutral-400 font-medium shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#c8824b]" />
              Sugerencias:
            </span>
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => onSearchChange(sug)}
                className="px-2.5 py-1 rounded-full bg-neutral-800/90 hover:bg-[#c8824b] text-neutral-300 hover:text-black text-xs font-medium whitespace-nowrap transition-all border border-neutral-700/60 active:scale-95 shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <Search className="w-2.5 h-2.5 opacity-60" />
                <span>{sug}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* If input looks like a video URL, show Quick Play Video banner */}
      {isUrl && (
        <div className="p-4 rounded-2xl bg-neutral-900 border border-[#c8824b]/50 flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#c8824b]/20 text-[#c8824b] flex items-center justify-center shrink-0">
              <Link className="w-5 h-5" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">Detectado enlace de video/audio</p>
              <p className="text-[11px] text-neutral-400 truncate">{searchQuery}</p>
            </div>
          </div>
          <button
            onClick={() => onAddTrackQuick(searchQuery.trim())}
            className="px-4 py-2 rounded-full bg-[#c8824b] hover:bg-[#b5733f] text-black text-xs font-bold transition-transform active:scale-95 shrink-0 flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Reproducir Solo Audio</span>
          </button>
        </div>
      )}

      {/* Tag Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedTag === tag
                ? 'bg-white text-black'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            {tag === 'all' ? 'Todos' : tag}
          </button>
        ))}
      </div>

      {/* Live YouTube Search Results Section - Show first when searching */}
      {searchQuery.trim() && !isUrl && (
        <div className="pt-2 animate-in fade-in">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <Youtube className="w-4 h-4 text-red-500 animate-pulse" />
              <span>Resultados en YouTube y Música ({ytResults.length})</span>
            </h2>
            {loadingYt && (
              <span className="text-xs text-[#c8824b] font-medium flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-[#c8824b] animate-ping" />
                Buscando...
              </span>
            )}
          </div>

          {loadingYt && ytResults.length === 0 ? (
            <div className="p-8 flex flex-col items-center justify-center gap-2 text-neutral-400 bg-neutral-900/40 rounded-2xl border border-neutral-800">
              <div className="w-7 h-7 rounded-full border-2 border-t-transparent border-[#c8824b] animate-spin" />
              <p className="text-xs font-medium">Buscando "{searchQuery}" en YouTube...</p>
            </div>
          ) : ytResults.length === 0 ? (
            <div className="p-6 text-center text-neutral-400 text-xs border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/20">
              <p className="font-semibold text-neutral-300 mb-1">No se encontraron resultados para "{searchQuery}"</p>
              <p className="text-[11px] text-neutral-500">Prueba con el nombre del artista, título de la canción o pega el enlace directo.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {ytResults.map((item) => {
                const isPlayingYt = tracks.some(t => t.youtubeId === item.youtubeId && t.id === currentTrackId) && isPlaying;
                const isSaved = tracks.some(t => t.youtubeId === item.youtubeId);
                const isImporting = justImportedId === item.youtubeId;

                return (
                  <div
                    key={item.youtubeId}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/70 hover:bg-neutral-800/80 text-white transition-all cursor-pointer group border border-neutral-800 hover:border-neutral-700 shadow-sm"
                    onClick={() => handlePlayYtResult(item)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-800 shrink-0 shadow-sm">
                        <img
                          src={item.coverUrl}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {isPlayingYt && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="flex items-center gap-0.5">
                              <span className="w-1 h-3 bg-[#c8824b] animate-bounce" />
                              <span className="w-1 h-4 bg-[#c8824b] animate-bounce delay-75" />
                              <span className="w-1 h-2.5 bg-[#c8824b] animate-bounce delay-150" />
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="truncate">
                        <p className={`text-xs sm:text-sm font-bold truncate group-hover:text-[#c8824b] transition-colors`}>
                          {item.title}
                        </p>
                        <p className="text-[11px] text-neutral-400 truncate flex items-center gap-1.5 mt-0.5">
                          <span>{item.artist}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-red-950/60 text-red-300 font-semibold border border-red-900/40">
                            YouTube
                          </span>
                        </p>
                      </div>
                    </div>

                    <div 
                      className="flex items-center gap-2 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Play Button */}
                      <button
                        onClick={() => handlePlayYtResult(item)}
                        className="w-8 h-8 rounded-full bg-[#c8824b] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md"
                        title="Reproducir de inmediato en segundo plano"
                      >
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </button>

                      {/* YouTube Search Result Option Menu */}
                      <YouTubeResultOptionsMenu
                        item={item}
                        playlists={playlists}
                        isSaved={isSaved}
                        isImporting={isImporting}
                        onSaveToLibrary={handleSaveToLibrary}
                        onImportAndAddToPlaylist={async (playlistId) => {
                          if (onImportYouTubeSearchTrack) {
                            await onImportYouTubeSearchTrack(item, playlistId);
                            setJustImportedId(item.youtubeId);
                            setTimeout(() => setJustImportedId(null), 1000);
                          }
                        }}
                        onCreatePlaylist={onCreatePlaylist}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Local Saved Tracks Section */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>En tu Biblioteca ({filteredTracks.length})</span>
        </h2>

        {filteredTracks.length === 0 && !searchQuery.trim() ? (
          <p className="text-xs text-neutral-500 italic px-1">Tu biblioteca está vacía. Escribe arriba para buscar música en YouTube.</p>
        ) : filteredTracks.length === 0 ? (
          <p className="text-xs text-neutral-500 italic px-1">No hay coincidencias en tu biblioteca guardada.</p>
        ) : (
          <div className="space-y-1.5">
            {filteredTracks.map((track) => {
              const isCurrent = track.id === currentTrackId;

              return (
                <div
                  key={track.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-colors cursor-pointer group ${
                    isCurrent ? 'bg-neutral-800 text-[#c8824b]' : 'hover:bg-neutral-800/60 text-white'
                  }`}
                  onClick={() => onPlayTrack(track, filteredTracks)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={track.coverUrl}
                      alt=""
                      className="w-11 h-11 rounded-lg object-cover bg-neutral-800 shrink-0 shadow-sm"
                    />
                    <div className="truncate">
                      <p className={`text-xs sm:text-sm font-bold truncate ${isCurrent ? 'text-[#c8824b]' : 'text-white'}`}>
                        {track.title}
                      </p>
                      <p className="text-[11px] text-neutral-400 truncate flex items-center gap-1.5">
                        <span>{track.artist}</span>
                        {track.sourceType === 'youtube' && (
                          <span className="text-[9px] px-1 rounded bg-red-600/30 text-red-300">
                            YouTube Audio
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div 
                    className="flex items-center gap-2 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onPlayTrack(track, filteredTracks)}
                      className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow"
                      title="Reproducir"
                    >
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </button>

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
        )}
      </div>

      {/* Genre Exploration Cards */}
      {!searchQuery && (
        <div className="pt-4 animate-in fade-in">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#c8824b]" />
            <span>Explorar géneros</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.title}
                onClick={() => setSelectedTag(cat.tag)}
                className={`h-24 p-3 rounded-xl bg-gradient-to-br ${cat.color} cursor-pointer hover:scale-102 transition-transform shadow flex flex-col justify-between`}
              >
                <span className="text-xs font-extrabold text-white leading-snug">
                  {cat.title}
                </span>
                <span className="text-[10px] text-white/70 font-semibold self-end">
                  Ver pistas →
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generous bottom clearance spacer for mobile player and navigation bars */}
      <div className="h-16 md:h-8 w-full pointer-events-none" aria-hidden="true" />
    </div>
  );
};

// Specialized Option Menu for YouTube Search Results to add them to Library or Playlists on the fly
interface YouTubeResultOptionsMenuProps {
  item: YouTubeSearchResult;
  playlists: Playlist[];
  isSaved: boolean;
  isImporting: boolean;
  onSaveToLibrary: (item: YouTubeSearchResult) => void;
  onImportAndAddToPlaylist: (playlistId: string) => void;
  onCreatePlaylist?: (title: string) => Promise<Playlist | null>;
}

const YouTubeResultOptionsMenu: React.FC<YouTubeResultOptionsMenuProps> = ({
  item,
  playlists,
  isSaved,
  isImporting,
  onSaveToLibrary,
  onImportAndAddToPlaylist,
  onCreatePlaylist
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [addedPlaylistId, setAddedPlaylistId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowPlaylists(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleCreateAndAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCreatePlaylist) {
      const name = prompt('Nombre de tu nueva lista:', 'Mi Lista de YouTube');
      if (!name || !name.trim()) return;
      const newPl = await onCreatePlaylist(name.trim());
      if (newPl) {
        onImportAndAddToPlaylist(newPl.id);
        setAddedPlaylistId(newPl.id);
        setTimeout(() => {
          setAddedPlaylistId(null);
          setIsOpen(false);
          setShowPlaylists(false);
        }, 1000);
      }
    }
  };

  const handleSelectPlaylist = (e: React.MouseEvent, plId: string) => {
    e.stopPropagation();
    onImportAndAddToPlaylist(plId);
    setAddedPlaylistId(plId);
    setTimeout(() => {
      setAddedPlaylistId(null);
      setIsOpen(false);
      setShowPlaylists(false);
    }, 1000);
  };

  const renderMenuContent = () => {
    if (showPlaylists) {
      return (
        <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
          <div className="flex items-center justify-between pb-1.5 border-b border-neutral-800 px-1">
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPlaylists(false);
                }}
                className="p-1 rounded-full hover:bg-neutral-800 text-neutral-400"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-bold text-white text-[11px]">Añadir a Lista</span>
            </div>
            {onCreatePlaylist && (
              <button
                onClick={handleCreateAndAdd}
                className="text-[10px] font-extrabold text-[#c8824b] hover:underline"
              >
                + Crear Lista
              </button>
            )}
          </div>

          {playlists.length === 0 ? (
            <p className="p-3 text-[10px] text-neutral-400 text-center">No tienes listas creadas todavía.</p>
          ) : (
            playlists.map((pl) => {
              const isAdded = addedPlaylistId === pl.id;
              return (
                <button
                  key={pl.id}
                  onClick={(e) => handleSelectPlaylist(e, pl.id)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-800 text-left transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-neutral-200 truncate text-xs">{pl.title}</p>
                    <p className="text-[10px] text-neutral-400">{pl.trackIds.length} canciones</p>
                  </div>
                  {isAdded && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      );
    }

    return (
      <div className="p-1.5 space-y-0.5">
        <div className="px-2.5 py-1.5 border-b border-neutral-800 mb-1 max-w-[210px]">
          <p className="font-bold text-white truncate text-[11px]">{item.title}</p>
          <p className="text-[10px] text-neutral-400 truncate">{item.artist}</p>
        </div>

        {/* Save to library */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSaveToLibrary(item);
            setIsOpen(false);
          }}
          disabled={isSaved || isImporting}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-neutral-800 text-neutral-200 transition-colors text-left text-xs disabled:opacity-50"
        >
          {isSaved ? (
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <Plus className="w-3.5 h-3.5 text-[#c8824b] shrink-0" />
          )}
          <span>{isSaved ? 'Guardada en Biblioteca' : 'Guardar en Biblioteca'}</span>
        </button>

        {/* Add to Playlist */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowPlaylists(true);
          }}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-neutral-800 text-neutral-200 transition-colors text-left text-xs"
        >
          <FolderPlus className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Añadir a una Lista...</span>
        </button>
      </div>
    );
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
          setShowPlaylists(false);
        }}
        className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800/60 active:scale-95 transition-all"
        title="Opciones"
      >
        <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {isOpen && (
        <>
          {/* Mobile bottom sheet */}
          <div 
            className="sm:hidden fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          >
            <div 
              className="absolute bottom-0 inset-x-0 bg-[#1c1c1c] border-t border-neutral-800 rounded-t-3xl p-3 pb-8 max-h-[80vh] overflow-y-auto space-y-2 shadow-2xl animate-in slide-in-from-bottom duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-neutral-700 rounded-full mx-auto mb-4" />
              {renderMenuContent()}
            </div>
          </div>

          {/* Desktop Dropdown */}
          <div 
            className="hidden sm:block absolute right-0 mt-1.5 w-56 rounded-xl bg-[#1c1c1c] border border-neutral-700/80 shadow-2xl z-50 overflow-hidden text-xs text-neutral-200 animate-in fade-in duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            {renderMenuContent()}
          </div>
        </>
      )}
    </div>
  );
};
