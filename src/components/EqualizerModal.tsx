import React from 'react';
import { Sliders, X, RotateCcw, Volume2, Sparkles, Layers, Radio } from 'lucide-react';
import { EQPresetName } from '../types';
import { EQ_BANDS, EQ_PRESETS, CROSSFADE_OPTIONS } from '../utils/eqPresets';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  eqPreset: EQPresetName;
  eqGains: number[];
  crossfadeSeconds: number;
  isPlaying: boolean;
  onSelectPreset: (presetName: EQPresetName) => void;
  onChangeGain: (bandIndex: number, gainDb: number) => void;
  onChangeCrossfade: (seconds: number) => void;
  onReset: () => void;
}

export const EqualizerModal: React.FC<EqualizerModalProps> = ({
  isOpen,
  onClose,
  eqPreset,
  eqGains,
  crossfadeSeconds,
  isPlaying,
  onSelectPreset,
  onChangeGain,
  onChangeCrossfade,
  onReset
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#181818] border border-neutral-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800/80 sticky top-0 bg-[#181818]/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c8824b]/20 text-[#c8824b] flex items-center justify-center border border-[#c8824b]/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                Ecualizador de Audio
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#c8824b]/20 text-[#c8824b] border border-[#c8824b]/30 font-mono font-bold">
                  PRO
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Ajusta la acústica y el estilo de sonido
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title="Restablecer valores predeterminados"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* Animated EQ Frequency Visualizer */}
          <div className="bg-neutral-900/90 rounded-xl p-4 border border-neutral-800/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#c8824b] animate-pulse" />
              <div>
                <span className="text-xs font-bold text-white block">
                  Perfil Activo: <span className="text-[#c8824b]">{eqPreset}</span>
                </span>
                <span className="text-[11px] text-neutral-400">
                  {isPlaying ? 'Procesando señal de audio en tiempo real' : 'Ajustes aplicados'}
                </span>
              </div>
            </div>

            {/* 5-Bar Live Spectrum Animation */}
            <div className="flex items-end gap-1.5 h-8 px-2">
              {eqGains.map((gain, idx) => {
                const baseHeightPercent = Math.max(20, Math.min(100, 50 + gain * 3.5));
                return (
                  <div key={idx} className="w-2 bg-neutral-800 rounded-t-sm flex flex-col justify-end h-full">
                    <div
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        isPlaying ? 'bg-[#c8824b] animate-pulse' : 'bg-[#c8824b]/60'
                      }`}
                      style={{ height: `${baseHeightPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preset Buttons Grid */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 block">
              Presets Preestablecidos
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {EQ_PRESETS.map((preset) => {
                const isActive = eqPreset === preset.name;
                return (
                  <button
                    key={preset.name}
                    onClick={() => onSelectPreset(preset.name)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between ${
                      isActive
                        ? 'bg-[#c8824b] text-black shadow-lg shadow-[#c8824b]/20 scale-[1.02]'
                        : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800'
                    }`}
                  >
                    <span className="truncate">{preset.label}</span>
                    {isActive && <span className="text-[10px] font-extrabold ml-1">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5-Band Equalizer Sliders */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Ajuste Manual por Frecuencia (5 Bandas)
              </label>
              <span className="text-[11px] font-mono text-[#c8824b]">
                -30 dB a +30 dB
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 sm:gap-4 bg-neutral-900/60 p-4 rounded-xl border border-neutral-800">
              {EQ_BANDS.map((band, idx) => {
                const currentGain = eqGains[idx] ?? 0;
                return (
                  <div key={band.freq} className="flex flex-col items-center space-y-2">
                    <span className="text-[10px] font-mono font-bold text-[#c8824b] tabular-nums">
                      {currentGain > 0 ? `+${currentGain}` : currentGain} dB
                    </span>

                    <div className="h-32 flex items-center justify-center relative py-1">
                      <input
                        type="range"
                        min="-30"
                        max="30"
                        step="1"
                        value={currentGain}
                        onChange={(e) => onChangeGain(idx, parseFloat(e.target.value))}
                        className="h-28 appearance-none outline-none cursor-pointer bg-neutral-800 rounded-lg w-2
                          [writing-mode:vertical-lr] [direction:rtl]
                          [&::-webkit-slider-thumb]:appearance-none
                          [&::-webkit-slider-thumb]:w-4
                          [&::-webkit-slider-thumb]:h-4
                          [&::-webkit-slider-thumb]:rounded-full
                          [&::-webkit-slider-thumb]:bg-[#c8824b]
                          [&::-webkit-slider-thumb]:shadow-md
                          hover:[&::-webkit-slider-thumb]:scale-125
                          active:[&::-webkit-slider-thumb]:scale-150
                          transition-all"
                      />
                    </div>

                    <div className="text-center">
                      <p className="text-xs font-bold text-white">{band.label}</p>
                      <p className="text-[9px] text-neutral-500 truncate max-w-[65px]">
                        {band.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Crossfade (Transición Suave) Section */}
          <div className="bg-neutral-900/80 rounded-xl p-4 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">Transición Suave (Crossfade)</h4>
                  <p className="text-[11px] text-neutral-400">
                    Mezcla el final de una canción con el inicio de la siguiente sin silencios.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">
                {crossfadeSeconds === 0 ? 'Desactivado' : `${crossfadeSeconds}s`}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {CROSSFADE_OPTIONS.map((opt) => {
                const isSel = crossfadeSeconds === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => onChangeCrossfade(opt.value)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all text-center ${
                      isSel
                        ? 'bg-amber-500 text-black shadow'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-[#181818] sticky bottom-0 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#c8824b] text-black font-bold text-xs hover:scale-105 active:scale-95 transition-transform shadow-md"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
