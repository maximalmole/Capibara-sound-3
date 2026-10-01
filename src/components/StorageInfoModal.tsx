import React, { useState } from 'react';
import { X, Database, HardDrive, Download, Upload, Check, AlertCircle, FileJson, Sparkles, ShieldCheck } from 'lucide-react';
import { exportBackupData, importBackupData } from '../services/storage';
import { Track, Playlist } from '../types';

interface StorageInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistsCount: number;
  tracksCount: number;
  storageUsedMb: number;
  onDataRestored: (data: { tracks: Track[]; playlists: Playlist[] }) => void;
}

export const StorageInfoModal: React.FC<StorageInfoModalProps> = ({
  isOpen,
  onClose,
  playlistsCount,
  tracksCount,
  storageUsedMb,
  onDataRestored
}) => {
  const [exportSuccess, setExportSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExportBackup = async () => {
    try {
      const json = await exportBackupData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CapibaraSound_Respaldo_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err: any) {
      alert('Error al exportar respaldo: ' + err.message);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportStatus('Leyendo archivo de respaldo...');

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const result = await importBackupData(text);
        onDataRestored(result);
        setImportStatus('¡Listas y enlaces restaurados correctamente!');
        setTimeout(() => {
          setImportStatus(null);
          onClose();
        }, 1500);
      } catch (err: any) {
        setImportError(err.message || 'Error al importar archivo');
        setImportStatus(null);
      }
    };
    reader.onerror = () => {
      setImportError('No se pudo leer el archivo seleccionado.');
      setImportStatus(null);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-[#181818] border border-neutral-800 text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Almacenamiento y Guardado de Listas</h3>
              <p className="text-xs text-neutral-400">Cómo guarda Capibara Sound tus canciones y enlaces</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Explanation Section */}
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-[#c8824b]" />
                <span>¿Cómo se guardan tus listas y enlaces de video?</span>
              </h4>
              <p className="text-neutral-300 leading-relaxed">
                Capibara Sound utiliza la tecnología <strong>IndexedDB</strong> y <strong>Cache Storage (Service Worker)</strong> de tu navegador/dispositivo:
              </p>
              <ul className="space-y-1.5 list-disc list-inside text-neutral-400 pl-1">
                <li><strong className="text-neutral-200">Persistencia Total:</strong> Cada video que agregas por enlace, playlist creada o importada de Spotify se guarda automáticamente en la base de datos local permanente del dispositivo.</li>
                <li><strong className="text-neutral-200">Sin Servidores Externos que te Cobren:</strong> Tus listas pertenecen a tu dispositivo, no expiran ni dependen de cuentas de pago.</li>
                <li><strong className="text-neutral-200">Archivos Offline:</strong> Al presionar "Descargar", el audio se almacena en memoria caché cifrada para sonar en modo avión sin conexión a internet.</li>
              </ul>
            </div>

            {/* Current Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <p className="text-lg font-bold text-[#c8824b]">{playlistsCount}</p>
                <p className="text-[10px] text-neutral-400">Listas Guardadas</p>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <p className="text-lg font-bold text-indigo-400">{tracksCount}</p>
                <p className="text-[10px] text-neutral-400">Pistas / Links</p>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <p className="text-lg font-bold text-amber-400">{storageUsedMb} MB</p>
                <p className="text-[10px] text-neutral-400">Uso Offline</p>
              </div>
            </div>

            {/* Export & Import Backup / Shared Playlists */}
            <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-white flex items-center gap-1.5 text-sm">
                    <FileJson className="w-4 h-4 text-[#c8824b]" />
                    <span>Listas Compartidas y Respaldo</span>
                  </h5>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Puedes agregar listas de otros usuarios o exportar tus propias listas para compartirlas por WhatsApp o correo.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {/* Add Shared Playlist Button */}
                <label className="py-2.5 px-3.5 rounded-xl bg-[#c8824b] hover:bg-[#b5733f] text-black font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow active:scale-95 text-xs text-center">
                  <Upload className="w-4 h-4 shrink-0" />
                  <span>➕ Agregar Lista Compartida</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>

                {/* Download Full Backup Button */}
                <button
                  onClick={handleExportBackup}
                  className="py-2.5 px-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition-all flex items-center justify-center gap-2 text-xs text-center"
                >
                  {exportSuccess ? <Check className="w-4 h-4 text-[#c8824b]" /> : <Download className="w-4 h-4 text-indigo-400" />}
                  <span>{exportSuccess ? '¡Respaldo Guardado!' : 'Descargar Todo mi Respaldo'}</span>
                </button>
              </div>

              <p className="text-[10px] text-neutral-400 bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/80 leading-tight">
                💡 <strong>¿Cómo compartir con otra persona?</strong> En cualquier lista de reproducción presiona el botón <strong>"Compartir Lista"</strong>. Envíale el archivo por chat a tu amigo/a y él/ella solo dará clic en <strong>"Agregar Lista Compartida"</strong> para guardarla en su app.
              </p>

              {importStatus && (
                <p className="text-xs text-[#c8824b] flex items-center gap-1.5 animate-pulse font-bold bg-[#c8824b]/10 p-2 rounded-lg border border-[#c8824b]/30">
                  <Check className="w-4 h-4" />
                  {importStatus}
                </p>
              )}

              {importError && (
                <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-[#141414] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#c8824b] hover:bg-[#b5733f] text-black text-xs font-bold transition-transform active:scale-95"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
