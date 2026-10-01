import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Share2, MessageCircle, Copy, Trash2, Check, AlertTriangle, FolderPlus, ChevronLeft, Plus } from 'lucide-react';
import { Track, Playlist } from '../types';

interface TrackOptionsMenuProps {
  track: Track;
  playlists?: Playlist[];
  onRemoveFromPlaylist?: (trackId: string) => void;
  onDeleteTrack?: (trackId: string) => void;
  onDownloadTrack?: (track: Track) => void;
  onAddToPlaylist?: (playlistId: string, trackId: string) => void;
  onCreatePlaylist?: (title: string) => Promise<Playlist | null>;
}

export const TrackOptionsMenu: React.FC<TrackOptionsMenuProps> = ({
  track,
  playlists = [],
  onRemoveFromPlaylist,
  onDeleteTrack,
  onDownloadTrack,
  onAddToPlaylist,
  onCreatePlaylist,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);
  const [addedPlaylistId, setAddedPlaylistId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowDeleteConfirm(false);
        setShowPlaylistSelector(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Construct sharing text
  const shareText = `Escucha "${track.title}" de ${track.artist} en CAPIBARA SOUND 🦫\n${track.sourceUrl || window.location.href}`;

  const handleShareWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  const handleShareSocial = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: track.title,
          text: `Escucha "${track.title}" de ${track.artist} en CAPIBARA SOUND`,
          url: track.sourceUrl || window.location.href,
        });
      } catch (err) {
        // Fallback to clipboard if share cancelled or unsupported
      }
    } else {
      handleCopyLink(e);
    }
    setIsOpen(false);
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(track.sourceUrl || window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleConfirmDeleteTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteTrack) {
      onDeleteTrack(track.id);
    }
    setIsOpen(false);
    setShowDeleteConfirm(false);
  };

  const handleRemoveFromPlaylistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemoveFromPlaylist) {
      onRemoveFromPlaylist(track.id);
    }
    setIsOpen(false);
  };

  const handleSelectPlaylistToAddTo = (e: React.MouseEvent, playlistId: string) => {
    e.stopPropagation();
    if (onAddToPlaylist) {
      onAddToPlaylist(playlistId, track.id);
      setAddedPlaylistId(playlistId);
      setTimeout(() => {
        setAddedPlaylistId(null);
        setIsOpen(false);
        setShowPlaylistSelector(false);
      }, 1000);
    }
  };

  const handleCreateNewPlaylist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCreatePlaylist) {
      const name = prompt('Nombre de tu nueva lista:', 'Mi Lista');
      if (!name || !name.trim()) return;
      const newPl = await onCreatePlaylist(name.trim());
      if (newPl && onAddToPlaylist) {
        onAddToPlaylist(newPl.id, track.id);
        setAddedPlaylistId(newPl.id);
        setTimeout(() => {
          setAddedPlaylistId(null);
          setIsOpen(false);
          setShowPlaylistSelector(false);
        }, 1000);
      }
    }
  };

  const renderMenuContent = () => {
    return (
      <>
        {/* Header Track Info */}
        <div className="p-3 bg-neutral-900/90 border-b border-neutral-800 flex items-center gap-2.5">
          <img src={track.coverUrl} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-white truncate text-xs">{track.title}</p>
            <p className="text-[10px] text-neutral-400 truncate">{track.artist}</p>
          </div>
        </div>

        {showPlaylistSelector ? (
          /* Playlist Selector Mode */
          <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
            <div className="flex items-center justify-between pb-1.5 border-b border-neutral-800 px-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPlaylistSelector(false);
                  }}
                  className="p-1 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-white text-xs">Añadir a Lista</span>
              </div>
              {onCreatePlaylist && (
                <button
                  type="button"
                  onClick={handleCreateNewPlaylist}
                  className="text-[11px] font-extrabold text-[#c8824b] hover:text-[#d9935c] hover:underline"
                >
                  + Crear Lista
                </button>
              )}
            </div>

            {playlists.length === 0 ? (
              <p className="p-3 text-[11px] text-neutral-400 text-center">
                No tienes listas creadas todavía. Crea una en tu biblioteca.
              </p>
            ) : (
              playlists.map((pl) => {
                const containsTrack = pl.trackIds.includes(track.id);
                const isJustAdded = addedPlaylistId === pl.id;

                return (
                  <button
                    key={pl.id}
                    onClick={(e) => handleSelectPlaylistToAddTo(e, pl.id)}
                    className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl hover:bg-neutral-800 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <img src={pl.coverUrl} alt="" className="w-7 h-7 rounded object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-neutral-200 truncate text-xs">{pl.title}</p>
                        <p className="text-[10px] text-neutral-400">{pl.trackIds.length} canciones</p>
                      </div>
                    </div>

                    {isJustAdded ? (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <Check className="w-3 h-3" /> ¡Añadida!
                      </span>
                    ) : containsTrack ? (
                      <span className="text-[10px] text-neutral-400 flex items-center gap-0.5 bg-neutral-800 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3 text-[#c8824b]" /> Ya está
                      </span>
                    ) : (
                      <Plus className="w-4 h-4 text-neutral-400 hover:text-white shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        ) : !showDeleteConfirm ? (
          <div className="p-1.5 space-y-0.5">
            {/* Add to playlist option */}
            {onAddToPlaylist && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPlaylistSelector(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#c8824b]/20 text-[#c8824b] hover:text-[#d9935c] font-bold transition-colors text-left"
              >
                <FolderPlus className="w-4 h-4 text-[#c8824b] shrink-0" />
                <span>Añadir a otra Lista...</span>
              </button>
            )}

            {/* WhatsApp Share */}
            <button
              onClick={handleShareWhatsApp}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-green-600/20 text-neutral-200 hover:text-green-400 transition-colors text-left"
            >
              <MessageCircle className="w-4 h-4 text-green-500 shrink-0" />
              <span className="font-medium">Compartir por WhatsApp</span>
            </button>

            {/* Social Media Share */}
            <button
              onClick={handleShareSocial}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-indigo-600/20 text-neutral-200 hover:text-indigo-400 transition-colors text-left"
            >
              <Share2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="font-medium">Compartir en Redes</span>
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-neutral-800 text-neutral-200 transition-colors text-left"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Copy className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span className="font-medium">{copied ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
            </button>

            <div className="my-1 border-t border-neutral-800" />

            {/* Remove from playlist option if provided */}
            {onRemoveFromPlaylist && (
              <button
                onClick={handleRemoveFromPlaylistClick}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-amber-500/20 text-neutral-300 hover:text-amber-400 transition-colors text-left"
              >
                <Trash2 className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-medium">Quitar de esta lista</span>
              </button>
            )}

            {/* Delete Track Completely */}
            {onDeleteTrack && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-600/20 text-red-400 font-semibold transition-colors text-left"
              >
                <Trash2 className="w-4 h-4 text-red-400 shrink-0" />
                <span>Eliminar Canción</span>
              </button>
            )}
          </div>
        ) : (
          /* Delete confirmation view */
          <div className="p-3 space-y-2 bg-red-950/40 text-left">
            <div className="flex items-center gap-2 text-red-400 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>¿Eliminar canción?</span>
            </div>
            <p className="text-[11px] text-neutral-300">
              Se borrará permanentemente de tu biblioteca y listas.
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDeleteTrack}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold"
              >
                Sí, Borrar
              </button>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="relative inline-block text-left animate-none" ref={menuRef} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
          setShowDeleteConfirm(false);
          setShowPlaylistSelector(false);
        }}
        className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800/80 active:scale-95 transition-all"
        title="Opciones de la canción"
      >
        <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {isOpen && (
        <>
          {/* Mobile Bottom Sheet (Screen width < 640px) */}
          <div 
            className="sm:hidden fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          >
            <div 
              className="absolute bottom-0 inset-x-0 bg-[#1c1c1c] border-t border-neutral-800 rounded-t-3xl p-3 pb-8 max-h-[85vh] overflow-y-auto space-y-2 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag Handle indicator */}
              <div className="w-12 h-1.5 bg-neutral-700 rounded-full mx-auto mb-4" />
              {renderMenuContent()}
            </div>
          </div>

          {/* Desktop Dropdown (Screen width >= 640px) */}
          <div 
            className="hidden sm:block absolute right-0 mt-2 w-64 rounded-2xl bg-[#1e1e1e] border border-neutral-700/80 shadow-2xl z-50 overflow-hidden text-xs text-neutral-200 animate-in fade-in duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {renderMenuContent()}
          </div>
        </>
      )}
    </div>
  );
};
