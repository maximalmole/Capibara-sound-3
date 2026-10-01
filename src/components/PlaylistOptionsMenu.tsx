import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit2, Trash2, FileJson, Check, X, Image, ChevronLeft } from 'lucide-react';
import { Playlist, Track } from '../types';
import { exportSinglePlaylist } from '../services/storage';

interface PlaylistOptionsMenuProps {
  playlist: Playlist;
  playlistTracks?: Track[];
  onRenamePlaylist?: (playlistId: string, newTitle: string) => void;
  onDeletePlaylist?: (playlistId: string) => void;
  onUpdatePlaylistCover?: (playlistId: string, newCoverUrl: string) => void;
  buttonClassName?: string;
}

export const PlaylistOptionsMenu: React.FC<PlaylistOptionsMenuProps> = ({
  playlist,
  playlistTracks = [],
  onRenamePlaylist,
  onDeletePlaylist,
  onUpdatePlaylistCover,
  buttonClassName = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(playlist.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCoverSelector, setShowCoverSelector] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsEditing(false);
        setShowDeleteConfirm(false);
        setShowCoverSelector(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleOpenMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(!isOpen);
    setIsEditing(false);
    setShowDeleteConfirm(false);
    setShowCoverSelector(false);
    setEditTitle(playlist.title);
  };

  const handleStartRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsEditing(true);
    setEditTitle(playlist.title);
  };

  const handleSaveRename = (e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editTitle.trim() && onRenamePlaylist) {
      onRenamePlaylist(playlist.id, editTitle.trim());
    }
    setIsEditing(false);
    setIsOpen(false);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsEditing(false);
    setEditTitle(playlist.title);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onDeletePlaylist) {
      onDeletePlaylist(playlist.id);
    }
    setIsOpen(false);
    setShowDeleteConfirm(false);
  };

  const handleSelectCover = (e: React.MouseEvent, coverUrl: string) => {
    e.stopPropagation();
    if (onUpdatePlaylistCover) {
      onUpdatePlaylistCover(playlist.id, coverUrl);
    }
    setShowCoverSelector(false);
    setIsOpen(false);
  };

  const handleSharePlaylist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
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
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
      setIsOpen(false);
    } catch (err: any) {
      alert('Error al exportar la lista: ' + err.message);
    }
  };

  // Render the inner content (reusable for both Desktop dropdown and Mobile bottom sheet)
  const renderMenuContent = () => {
    if (isEditing) {
      return (
        <form onSubmit={handleSaveRename} className="p-4 space-y-3">
          <div className="flex items-center gap-1.5 text-neutral-300 font-bold text-xs">
            <Edit2 className="w-4 h-4 text-[#c8824b]" />
            <span>Editar nombre de la lista</span>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={editTitle || ''}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full bg-[#121212] border border-neutral-700 focus:border-[#c8824b] rounded-xl px-3 py-2 text-xs text-white outline-none"
            placeholder="Nombre de la lista"
          />
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleCancelRename}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!editTitle.trim()}
              className="px-4 py-1.5 rounded-xl bg-[#c8824b] hover:bg-[#b5733f] disabled:opacity-50 text-black text-xs font-extrabold flex items-center gap-1 shadow"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Guardar</span>
            </button>
          </div>
        </form>
      );
    }

    if (showDeleteConfirm) {
      return (
        <div className="p-4 space-y-3">
          <p className="text-xs text-red-400 font-bold">¿Borrar esta lista?</p>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Se eliminará la lista "{playlist.title}". Las canciones seguirán disponibles en tu biblioteca.
          </p>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1 shadow"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Sí, Borrar</span>
            </button>
          </div>
        </div>
      );
    }

    if (showCoverSelector) {
      return (
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCoverSelector(false);
              }}
              className="p-1 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-white text-xs">Elegir carátula</span>
          </div>

          {playlistTracks.length === 0 ? (
            <p className="p-3 text-[11px] text-neutral-400 text-center">
              Agrega canciones a la lista para poder elegir una carátula.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
              {playlistTracks.map((track) => (
                <button
                  key={track.id}
                  onClick={(e) => handleSelectCover(e, track.coverUrl)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all active:scale-95 group/btn ${
                    playlist.coverUrl === track.coverUrl
                      ? 'border-[#c8824b]'
                      : 'border-transparent hover:border-neutral-500'
                  }`}
                  title={track.title}
                >
                  <img src={track.coverUrl} alt="" className="w-full h-full object-cover" />
                  {playlist.coverUrl === track.coverUrl && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Check className="w-5 h-5 text-[#c8824b]" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1 text-[9px] text-white truncate text-center">
                    {track.title}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="p-1.5 space-y-0.5">
        <div className="px-3 py-2 border-b border-neutral-800 mb-1">
          <p className="font-bold text-white truncate text-xs">{playlist.title}</p>
          <p className="text-[10px] text-neutral-400">{playlist.trackIds.length} canciones</p>
        </div>

        {/* Rename */}
        {onRenamePlaylist && (
          <button
            onClick={handleStartRename}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#c8824b]/20 text-neutral-200 hover:text-[#c8824b] font-medium transition-colors text-left"
          >
            <Edit2 className="w-3.5 h-3.5 text-[#c8824b] shrink-0" />
            <span>Editar Nombre</span>
          </button>
        )}

        {/* Choose Cover option */}
        {onUpdatePlaylistCover && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowCoverSelector(true);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-neutral-800 text-neutral-200 font-medium transition-colors text-left"
          >
            <Image className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Elegir Carátula</span>
          </button>
        )}

        {/* Share */}
        <button
          onClick={handleSharePlaylist}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-neutral-800 text-neutral-200 transition-colors text-left"
        >
          {copiedShare ? (
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <FileJson className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          )}
          <span>{copiedShare ? '¡Lista Exportada!' : 'Compartir Lista'}</span>
        </button>

        <div className="my-1 border-t border-neutral-800" />

        {/* Delete */}
        {onDeletePlaylist && (
          <button
            onClick={handleDeleteClick}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-600/20 text-red-400 font-semibold transition-colors text-left"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>Borrar Lista</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="relative inline-block" ref={menuRef} onClick={(e) => e.stopPropagation()}>
      <button
        onClick={handleOpenMenu}
        aria-label="Opciones de la lista"
        className={
          buttonClassName ||
          "w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-90 hover:opacity-100 hover:scale-110 shadow-lg"
        }
        title="Opciones de la lista"
      >
        <MoreVertical className="w-4 h-4 text-white" />
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
            className="hidden sm:block absolute right-0 top-full mt-2 min-w-[220px] w-56 rounded-2xl bg-[#1c1c1c] border-2 border-neutral-700 shadow-[0_12px_40px_rgba(0,0,0,0.95)] z-[99] text-xs text-white animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {renderMenuContent()}
          </div>
        </>
      )}
    </div>
  );
};
