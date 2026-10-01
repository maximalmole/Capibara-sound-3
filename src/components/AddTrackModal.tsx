import React, { useState } from 'react';
import { X, Youtube, Sparkles, AlertCircle } from 'lucide-react';
import { Track, Playlist } from '../types';
import { extractSingleYouTubeVideoId, fetchYouTubeOEmbed } from '../services/youtubeImporter';

interface AddTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTrack: (track: Track, targetPlaylistId?: string) => void;
  playlists: Playlist[];
  onCreatePlaylist?: (title: string) => Promise<Playlist | null>;
}

export const AddTrackModal: React.FC<AddTrackModalProps> = ({
  isOpen,
  onClose,
  onAddTrack,
  playlists,
  onCreatePlaylist
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedVideoId, setDetectedVideoId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUrlChange = async (newUrl: string) => {
    setUrl(newUrl);
    setError(null);

    const trimmed = newUrl.trim();
    if (!trimmed) {
      setDetectedVideoId(null);
      return;
    }

    const videoId = extractSingleYouTubeVideoId(trimmed);
    setDetectedVideoId(videoId);

    if (videoId) {
      setIsDetecting(true);
      try {
        const meta = await fetchYouTubeOEmbed(videoId);
        if (meta.title && !title) {
          setTitle(meta.title);
        }
        if (meta.author && !artist) {
          setArtist(meta.author);
        }
      } catch (e) {
        if (!title) setTitle(`Audio de YouTube (${videoId})`);
        if (!artist) setArtist('YouTube Stream');
      } finally {
        setIsDetecting(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setError('Por favor ingresa un enlace de video o audio.');
      return;
    }

    const videoId = extractSingleYouTubeVideoId(trimmedUrl);
    const isYt = !!videoId;
    const ytId = videoId || undefined;

    const covers = [
      '/src/assets/images/cover_lofi_chill_1790457683214.jpg',
      '/src/assets/images/cover_electronic_energy_1790457693133.jpg',
      '/src/assets/images/cover_acoustic_sunset_1790457702331.jpg',
      '/src/assets/images/cover_podcast_talk_1790457710287.jpg'
    ];

    const finalTitle = title.trim() || (isYt ? 'Audio de Video' : 'Pista de Audio');
    const finalArtist = artist.trim() || 'Audio Stream';

    const newTrack: Track = {
      id: `track-custom-${Date.now()}`,
      title: finalTitle,
      artist: finalArtist,
      album: album.trim() || (isYt ? 'YouTube Audio-Only' : 'Web Stream'),
      duration: 210,
      sourceType: isYt ? 'youtube' : 'direct',
      sourceUrl: trimmedUrl,
      youtubeId: ytId,
      coverUrl: isYt 
        ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` 
        : covers[Math.floor(Math.random() * covers.length)],
      isDownloaded: false,
      addedAt: Date.now(),
      fileSizeMb: 4.8,
      lyrics: `[Pista agregada por enlace: ${trimmedUrl}]\nReproducción de sólo audio en segundo plano.`,
      tags: [isYt ? 'YouTube' : 'Web Stream', 'Personalizada']
    };

    onAddTrack(newTrack, selectedPlaylistId || undefined);
    setUrl('');
    setTitle('');
    setArtist('');
    setAlbum('');
    setSelectedPlaylistId('');
    onClose();
  };

  const handleCreateNewPlaylistInModal = async () => {
    if (onCreatePlaylist) {
      const name = prompt('Nombre de tu nueva lista:', 'Mi Lista');
      if (!name || !name.trim()) return;
      const newPl = await onCreatePlaylist(name.trim());
      if (newPl) {
        setSelectedPlaylistId(newPl.id);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-[#181818] border border-neutral-800 text-white shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
            <Youtube className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Añadir Canción por Enlace</h3>
            <p className="text-xs text-neutral-400">Pega un link individual de YouTube o enlace directo de audio</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Enlace de Video o Audio:
            </label>
            <div className="relative">
              <input
                type="text"
                value={url || ''}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... o mp3/mp4"
                required
                className="w-full bg-[#242424] text-xs text-white placeholder-neutral-500 rounded-xl px-4 py-2.5 border border-neutral-700 focus:border-[#c8824b] focus:outline-none"
              />
            </div>
            {isDetecting && (
              <p className="text-[11px] text-[#c8824b] mt-1 flex items-center gap-1 animate-pulse">
                <Sparkles className="w-3 h-3" />
                Obteniendo información de la canción...
              </p>
            )}

          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Título de la Canción:
            </label>
            <input
              type="text"
              value={title || ''}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Lofi Chill Session o Nombre de la Canción"
              className="w-full bg-[#242424] text-xs text-white placeholder-neutral-500 rounded-xl px-4 py-2.5 border border-neutral-700 focus:border-[#c8824b] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Artista / Canal:
              </label>
              <input
                type="text"
                value={artist || ''}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Ej: Artista o Creador"
                className="w-full bg-[#242424] text-xs text-white placeholder-neutral-500 rounded-xl px-4 py-2.5 border border-neutral-700 focus:border-[#c8824b] focus:outline-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-neutral-300">
                  Añadir a Lista:
                </label>
                {onCreatePlaylist && (
                  <button
                    type="button"
                    onClick={handleCreateNewPlaylistInModal}
                    className="text-[11px] font-extrabold text-[#c8824b] hover:underline"
                  >
                    + Nueva Lista
                  </button>
                )}
              </div>
              <select
                value={selectedPlaylistId || ''}
                onChange={(e) => setSelectedPlaylistId(e.target.value)}
                className="w-full bg-[#242424] text-xs text-white rounded-xl px-3 py-2.5 border border-neutral-700 focus:border-[#c8824b] focus:outline-none"
              >
                <option value="">(Solo Biblioteca)</option>
                {playlists.map((pl) => (
                  <option key={pl.id} value={pl.id}>
                    {pl.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400">
            ✓ <strong>Modo Solo Audio:</strong> Se reproduce en segundo plano en alta fidelidad y sin gastar video.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-[#c8824b] hover:bg-[#b5733f] text-black text-xs font-black uppercase tracking-wider transition-transform active:scale-95"
            >
              Guardar en App
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
