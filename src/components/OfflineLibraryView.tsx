import React, { useState, useRef } from 'react';
import { 
  Download, 
  WifiOff, 
  Wifi, 
  Play, 
  HardDrive, 
  Sparkles, 
  FolderSync, 
  FileAudio, 
  Plus, 
  RefreshCw, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { Track, Playlist } from '../types';
import { TrackOptionsMenu } from './TrackOptionsMenu';
import { importLocalMusicFile } from '../services/storage';
import { audioEngine } from '../services/audioEngine';

interface OfflineLibraryViewProps {
  tracks: Track[];
  playlists?: Playlist[];
  onPlayTrack: (track: Track, tracks: Track[]) => void;
  onRemoveDownload: (track: Track) => void;
  totalMbUsed: number;
  onDeleteTrack?: (trackId: string) => void;
  onAddToPlaylist?: (playlistId: string, trackId: string) => void;
  onCreatePlaylist?: (title: string) => Promise<Playlist | null>;
  onLocalFilesImported?: (newTracks: Track[]) => void;
}

export const OfflineLibraryView: React.FC<OfflineLibraryViewProps> = ({
  tracks,
  playlists = [],
  onPlayTrack,
  onRemoveDownload,
  totalMbUsed,
  onDeleteTrack,
  onAddToPlaylist,
  onCreatePlaylist,
  onLocalFilesImported
}) => {
  const downloadedTracks = tracks.filter((t) => t.isDownloaded);
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  const [importing, setImporting] = useState(false);
  const [importCount, setImportCount] = useState<number | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const folderInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs <= 0) return '--:--';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleImportFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    setImporting(true);
    setImportError(null);
    setImportCount(null);

    const audioExtensions = /\.(mp3|wav|m4a|ogg|flac|aac|wma|webm)$/i;
    const files = Array.from(fileList).filter(file => 
      file.type.startsWith('audio/') || audioExtensions.test(file.name)
    );

    if (files.length === 0) {
      setImportError('No se encontraron archivos de audio válidos en la selección.');
      setImporting(false);
      return;
    }

    try {
      const importedList: Track[] = [];
      for (const file of files) {
        // Import single local file into IndexedDB
        const newTrack = await importLocalMusicFile(file);
        
        // Save direct reference in memory map to allow playback without taking any double space!
        audioEngine.localFilesCache.set(newTrack.id, file);
        
        importedList.push(newTrack);
      }

      setImportCount(files.length);
      
      // Notify parent to refresh list
      if (onLocalFilesImported) {
        onLocalFilesImported(importedList);
      }
    } catch (err: any) {
      console.error('Error importing local folder files:', err);
      setImportError('Ocurrió un error al guardar los archivos en el almacenamiento seguro de tu navegador.');
    } finally {
      setImporting(false);
      if (folderInputRef.current) folderInputRef.current.value = '';
      if (filesInputRef.current) filesInputRef.current.value = '';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-48 md:pb-36 overscroll-contain">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-950/50 via-neutral-900 to-neutral-900 border border-orange-500/20 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/20 text-[#c8824b] flex items-center justify-center shrink-0">
              <Download className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Contenido Descargado (Modo Offline)
                </h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  isOnline 
                    ? 'bg-neutral-800 text-neutral-300' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {isOnline ? <Wifi className="w-3 h-3 text-[#c8824b]" /> : <WifiOff className="w-3 h-3 text-amber-400" />}
                  <span>{isOnline ? 'Online' : 'Modo Avión / Sin Internet'}</span>
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Audio almacenado de forma nativa en tu dispositivo. Se reproduce al instante con consumo cero de red móvil.
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-neutral-900/80 px-4 py-2.5 rounded-xl border border-neutral-800 shrink-0">
            <HardDrive className="w-4 h-4 text-orange-400" />
            <div className="text-right">
              <p className="text-xs font-bold text-white font-mono">{totalMbUsed} MB</p>
              <p className="text-[10px] text-neutral-400">{downloadedTracks.length} canciones</p>
            </div>
          </div>
        </div>
      </div>

      {/* Screen Off Info Tip Box */}
      <div className="mb-6 p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex gap-3.5 items-start">
        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-black text-indigo-300 uppercase tracking-wider">💡 Tip de Reproducción en Segundo Plano</h4>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Las canciones que descargas en tu teléfono se guardan como archivos de audio locales directos. 
            <strong> Esto permite que se reproduzcan continuamente con la pantalla de tu celular apagada y sin interrupciones</strong>. 
            ¡Perfecto para guardar batería y llevar tu música al bolsillo en viajes o caminatas!
          </p>
        </div>
      </div>

      {/* Local Folder Synchronizer Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#161616] border border-neutral-800/80 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#c8824b]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <FolderSync className="w-5 h-5 text-[#c8824b]" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Sincronizador de Música Local sin Duplicados</h3>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              ¿Tienes canciones descargadas, audios de WhatsApp o MP3s guardados en tu teléfono y no quieres duplicar archivos para no perder espacio? 
              <strong className="text-white"> ¡Hecho! Sincroniza tus archivos con un solo toque sin duplicar bytes.</strong> Capibara Sound lee tus archivos de forma nativa en la memoria RAM y reproduce directamente tus audios locales consumiendo <span className="text-[#c8824b] font-bold">0 MB de almacenamiento extra en tu celular</span>.
            </p>
          </div>

          <div className="shrink-0">
            {/* Standard multiple files picker */}
            <input 
              type="file"
              id="files-sync-input"
              ref={filesInputRef}
              onChange={handleImportFiles}
              multiple
              accept="audio/*"
              className="hidden"
            />
            <button
              onClick={() => filesInputRef.current?.click()}
              disabled={importing}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#c8824b] hover:bg-[#b5733f] text-black text-xs font-black uppercase tracking-wider transition-transform active:scale-95 disabled:opacity-50 shadow-lg shadow-[#c8824b]/15"
            >
              <Plus className="w-4 h-4 fill-current" />
              <span>Sincronizar Canciones</span>
            </button>
          </div>
        </div>

        {/* Mobile Step-by-Step Selection Help Tip */}
        <div className="mt-4 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/60 space-y-2 text-xs">
          <p className="font-bold text-[#c8824b] flex items-center gap-1.5">
            💡 ¿Cómo sincronizar todas tus canciones en 1 segundo sin duplicar espacio?
          </p>
          <ol className="list-decimal list-inside space-y-1 text-neutral-400 text-[11px] leading-relaxed">
            <li>Presiona el botón de arriba <strong className="text-white">"Sincronizar Canciones"</strong>.</li>
            <li>En tu celular, ve a tu carpeta de música habitual (Ej: <i>Descargas, Audio de WhatsApp, o Tarjeta SD</i>).</li>
            <li><strong>Mantén presionado</strong> el primer archivo por un segundo para activar las casillas en tu celular.</li>
            <li>Toca los tres puntos arriba a la derecha y elige <strong>"Seleccionar Todo"</strong> (o marca las que quieras) y dale a <strong>"Seleccionar" / "Abrir"</strong>.</li>
            <li>¡Listo! Tus canciones se añadirán de inmediato a tu lista Offline con <strong className="text-emerald-400">0% de espacio duplicado</strong>.</li>
          </ol>
        </div>

        {/* Sync Feedbacks */}
        {importing && (
          <div className="mt-4 p-3 bg-neutral-900 border border-neutral-800/80 rounded-xl flex items-center gap-3 text-xs text-neutral-300">
            <RefreshCw className="w-4 h-4 text-[#c8824b] animate-spin" />
            <span>Leyendo canciones, convirtiendo formatos y sincronizando en IndexedDB seguro de tu navegador...</span>
          </div>
        )}

        {importCount !== null && (
          <div className="mt-4 p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-xs text-emerald-300 animate-fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span><strong>Sincronización exitosa:</strong> Se agregaron <strong>{importCount} canciones</strong> de tu dispositivo a la biblioteca offline de Capibara Sound. ¡Listas para reproducir!</span>
          </div>
        )}

        {importError && (
          <div className="mt-4 p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl flex items-center gap-3 text-xs text-rose-300">
            <HelpCircle className="w-4 h-4 text-rose-400" />
            <span>{importError}</span>
          </div>
        )}
      </div>

      {/* Main Track List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Canciones disponibles sin conexión ({downloadedTracks.length})
          </h2>
          {downloadedTracks.length > 0 && (
            <button
              onClick={() => onPlayTrack(downloadedTracks[0], downloadedTracks)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#c8824b] hover:bg-[#b5733f] text-black text-xs font-bold transition-transform active:scale-95 shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Reproducir Todas Offline</span>
            </button>
          )}
        </div>

        {downloadedTracks.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800">
            <Download className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">Aún no tienes canciones</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4">
              Usa los botones de arriba para vincular una carpeta de música local, o descarga canciones desde el buscador de YouTube presionando <Download className="w-3.5 h-3.5 inline text-orange-400" />.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {downloadedTracks.map((track, idx) => (
              <div
                key={track.id}
                className="group flex items-center justify-between p-2 rounded-xl bg-[#161616]/40 hover:bg-[#161616] border border-neutral-800/10 hover:border-neutral-800/60 transition-all"
              >
                <div 
                  onClick={() => onPlayTrack(track, downloadedTracks)}
                  className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer"
                >
                  <div className="relative shrink-0">
                    <img 
                      src={track.coverUrl} 
                      alt="" 
                      className="w-11 h-11 rounded-lg object-cover bg-neutral-800"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <Play className="w-4 h-4 text-white fill-current" />
                    </div>
                  </div>

                  <div className="min-w-0 pr-4">
                    <h3 className="text-xs font-bold text-white truncate leading-snug group-hover:text-[#c8824b] transition-colors">
                      {track.title}
                    </h3>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                      {track.artist}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {track.fileSizeMb && (
                    <span className="text-[10px] bg-neutral-900 text-neutral-500 font-mono px-2 py-0.5 rounded border border-neutral-800/60 hidden sm:inline">
                      {track.fileSizeMb} MB
                    </span>
                  )}

                  {/* Actions Dropdown */}
                  <TrackOptionsMenu
                    track={track}
                    playlists={playlists}
                    onAddToPlaylist={onAddToPlaylist}
                    onDeleteTrack={onDeleteTrack}
                    onDownloadTrack={onRemoveDownload}
                    onCreatePlaylist={onCreatePlaylist}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generous bottom clearance spacer for mobile player and navigation bars */}
      <div className="h-16 md:h-8 w-full pointer-events-none" aria-hidden="true" />
    </div>
  );
};
