import React, { useState, useEffect } from 'react';
import { X, Music2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Playlist } from '../types';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, description?: string, coverUrl?: string) => Promise<Playlist | null>;
  defaultIndex: number;
}

const PRESET_COVERS = [
  {
    name: 'Lofi Chill',
    url: '/src/assets/images/cover_lofi_chill_1790457683214.jpg'
  },
  {
    name: 'Energía',
    url: '/src/assets/images/cover_electronic_energy_1790457693133.jpg'
  },
  {
    name: 'Acústico',
    url: '/src/assets/images/cover_acoustic_sunset_1790457702331.jpg'
  },
  {
    name: 'Podcast & Talk',
    url: '/src/assets/images/cover_podcast_talk_1790457710287.jpg'
  }
];

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  defaultIndex
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCover, setSelectedCover] = useState(PRESET_COVERS[0].url);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(`Mi Lista #${defaultIndex}`);
      setDescription('Lista personalizada de audio');
      setSelectedCover(PRESET_COVERS[defaultIndex % PRESET_COVERS.length].url);
      setCustomCoverUrl('');
      setIsSubmitting(false);
    }
  }, [isOpen, defaultIndex]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const finalCover = customCoverUrl.trim() || selectedCover;
      await onCreate(title.trim(), description.trim(), finalCover);
      onClose();
    } catch (err) {
      console.error('Error creating playlist:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPreviewCover = customCoverUrl.trim() || selectedCover;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-[#181818] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#c8824b]/20 flex items-center justify-center text-[#c8824b]">
              <Music2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Nueva Lista de Reproducción</h2>
              <p className="text-[11px] text-neutral-400">Organiza tu música y audios favoritos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div className="flex gap-4 items-start">
            {/* Cover Preview */}
            <div className="relative group shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-700 shadow-md">
              <img
                src={currentPreviewCover}
                alt="Portada"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PRESET_COVERS[0].url;
                }}
              />
            </div>

            {/* Inputs */}
            <div className="flex-1 min-w-0 space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Nombre de la lista *
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Favoritas del Momento, Rock, Gym..."
                  className="w-full bg-[#242424] text-xs font-semibold text-white rounded-xl px-3 py-2 border border-neutral-700 focus:border-[#c8824b] focus:outline-none placeholder-neutral-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Descripción (Opcional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción breve..."
                  className="w-full bg-[#242424] text-xs text-white rounded-xl px-3 py-2 border border-neutral-700 focus:border-[#c8824b] focus:outline-none placeholder-neutral-500"
                />
              </div>
            </div>
          </div>

          {/* Preset Covers Picker */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center justify-between">
              <span>Elige una portada</span>
              <span className="text-[10px] text-neutral-500 font-normal">Estilos visuales</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_COVERS.map((preset) => {
                const isSelected = selectedCover === preset.url && !customCoverUrl;
                return (
                  <button
                    type="button"
                    key={preset.name}
                    onClick={() => {
                      setSelectedCover(preset.url);
                      setCustomCoverUrl('');
                    }}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all group ${
                      isSelected
                        ? 'border-[#c8824b] scale-102 shadow-lg shadow-[#c8824b]/20'
                        : 'border-transparent opacity-60 hover:opacity-100 hover:border-neutral-600'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-end p-1">
                      <span className="text-[9px] font-bold text-white truncate w-full">
                        {preset.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              className="px-5 py-2.5 rounded-full bg-[#c8824b] hover:bg-[#b5733f] disabled:opacity-50 text-black text-xs font-extrabold uppercase tracking-wider shadow transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Creando...' : 'Crear Lista'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
