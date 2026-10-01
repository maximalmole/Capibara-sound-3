import React from 'react';
import { X, Zap, Battery, Wifi, ShieldCheck, Moon, Sparkles } from 'lucide-react';
import { DataSaverStats } from '../types';

interface DataSaverModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: DataSaverStats;
  batterySaverActive: boolean;
  onToggleBatterySaver: () => void;
  onOpenAmoledPocket: () => void;
}

export const DataSaverModal: React.FC<DataSaverModalProps> = ({
  isOpen,
  onClose,
  stats,
  batterySaverActive,
  onToggleBatterySaver,
  onOpenAmoledPocket
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-[#181818] border border-neutral-800 text-white shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-[#c8824b] flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Centro de Ahorro de Datos & Batería</h3>
            <p className="text-xs text-neutral-400">Optimización activa de streaming y consumo energético</p>
          </div>
        </div>

        {/* Big Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-center">
            <span className="text-2xl font-black text-[#c8824b] font-mono tabular-nums">
              {stats.dataSavedMb} <span className="text-xs font-sans">MB</span>
            </span>
            <p className="text-[11px] text-neutral-400 mt-1 font-medium">Datos Móviles Ahorrados</p>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-center">
            <span className="text-2xl font-black text-amber-400 font-mono tabular-nums">
              +{stats.batterySavedHours} <span className="text-xs font-sans">h</span>
            </span>
            <p className="text-[11px] text-neutral-400 mt-1 font-medium">Batería Estimada</p>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-center">
            <span className="text-2xl font-black text-indigo-400 font-mono tabular-nums">
              {stats.audioStreamsPlayed}
            </span>
            <p className="text-[11px] text-neutral-400 mt-1 font-medium">Pistas Optimizadas</p>
          </div>
        </div>

        {/* Feature Switches */}
        <div className="space-y-3 mb-6">
          {/* Switch 1: Eco Battery Mode */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <div className="flex items-center gap-3">
              <Battery className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">Modo Batería Extrema</p>
                <p className="text-[11px] text-neutral-400">Desactiva visualizadores de sonido y animaciones para no calentar el procesador</p>
              </div>
            </div>
            <button
              onClick={onToggleBatterySaver}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                batterySaverActive ? 'bg-[#c8824b]' : 'bg-neutral-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  batterySaverActive ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Switch 2: AMOLED Pocket Mode */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">Pantalla Negra (Bolsillo AMOLED)</p>
                <p className="text-[11px] text-neutral-400">Apaga los píxeles de la pantalla OLED mientras caminas con el móvil guardado</p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenAmoledPocket();
              }}
              className="px-3 py-1.5 rounded-lg bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50 text-xs font-bold transition-colors shrink-0"
            >
              Activar
            </button>
          </div>

          {/* Note 3: Audio vs Video comparison */}
          <div className="p-3.5 rounded-xl bg-orange-950/30 border border-orange-500/20 text-xs text-neutral-300 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-orange-400">
              <ShieldCheck className="w-4 h-4" />
              <span>¿Por qué ahorra tanta batería y datos?</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Un video de YouTube en 1080p/720p consume entre <strong>15 y 30 MB por minuto</strong> y exige a la GPU decodificar 60 imágenes por segundo. Al transmitir únicamente la pista de audio (128 kbps), el consumo baja a <strong>menos de 1 MB por minuto</strong> (un 93% menos), y la pantalla puede estar apagada.
            </p>
          </div>

          {/* Background Audio Tip */}
          <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-500/20 text-xs text-neutral-300 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-sky-400">
              <Sparkles className="w-4 h-4" />
              <span>📱 Consejos para Reproducción en Segundo Plano en Celulares</span>
            </div>
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              Hemos integrado un <strong>Puente de Sesión Silenciosa</strong> para mantener la música activa al cambiar de app o bloquear. Si tu celular suspende la música:
            </p>
            <ul className="text-[11px] text-neutral-400 space-y-1 list-disc list-inside pt-0.5">
              <li><strong>Instalar la App (PWA):</strong> Presiona el botón <em>Instalar App</em> arriba para que Android/iOS le otorgue rango de app nativa.</li>
              <li><strong>Usar Modo Pantalla Negra 🌙:</strong> Apaga visualmente el panel para llevarlo en el bolsillo sin suspender la transmisión.</li>
              <li><strong>Ajustes de Batería de Android:</strong> En <em>Ajustes &gt; Aplicaciones &gt; Chrome &gt; Batería</em>, selecciona <em>Sin restricciones</em>.</li>
            </ul>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-full bg-[#c8824b] hover:bg-[#b5733f] text-black text-xs font-bold transition-transform active:scale-95"
        >
          Guardar y Continuar Escuchando
        </button>
      </div>
    </div>
  );
};
