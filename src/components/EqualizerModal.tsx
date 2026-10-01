import React, { useState, useRef } from 'react';
import { 
  Sliders, 
  X, 
  RotateCcw, 
  Sparkles, 
  Layers, 
  Plus, 
  Minus, 
  SlidersHorizontal, 
  ArrowUpDown,
  Check
} from 'lucide-react';
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

// Interactive Vertical Studio Fader with direct Touch and Mouse Pointer support
const StudioFader: React.FC<{
  band: typeof EQ_BANDS[0];
  idx: number;
  gain: number;
  onChange: (val: number) => void;
}> = ({ band, gain, onChange }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const calculateGainFromPointer = (clientY: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clampedY = Math.max(rect.top, Math.min(rect.bottom, clientY));
    const ratio = 1 - (clampedY - rect.top) / rect.height; // 0 at bottom, 1 at top
    const rawVal = -30 + ratio * 60;
    const stepped = Math.round(rawVal);
    onChange(Math.max(-30, Math.min(30, stepped)));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    setIsDragging(true);
    calculateGainFromPointer(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    calculateGainFromPointer(e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // 0% at -30 dB, 50% at 0 dB, 100% at +30 dB
  const percent = Math.max(0, Math.min(100, ((gain + 30) / 60) * 100));

  return (
    <div className="flex flex-col items-center">
      {/* Quick +2 dB button */}
      <button
        type="button"
        onClick={() => onChange(Math.min(30, gain + 2))}
        className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:bg-[#c8824b] active:text-black text-neutral-300 hover:text-white flex items-center justify-center transition-all mb-1.5 border border-neutral-700/50 shadow-sm"
        title="Aumentar +2 dB"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>

      {/* Numerical dB Badge (Click to reset to 0 dB) */}
      <button
        type="button"
        onClick={() => onChange(0)}
        className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold tabular-nums transition-colors cursor-pointer border ${
          gain > 0 
            ? 'text-[#c8824b] bg-[#c8824b]/15 border-[#c8824b]/30' 
            : gain < 0 
            ? 'text-sky-400 bg-sky-950/40 border-sky-500/30' 
            : 'text-neutral-400 bg-neutral-800/80 border-neutral-700/50'
        }`}
        title="Toca para restablecer a 0 dB"
      >
        {gain > 0 ? `+${gain}` : gain} dB
      </button>

      {/* Responsive Fader Track with Pointer Events */}
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: 'none' }}
        className="relative w-9 h-36 my-2 flex items-center justify-center cursor-pointer select-none py-2 group"
      >
        {/* Background Rail */}
        <div className="w-2.5 h-full bg-neutral-950 rounded-full relative overflow-hidden border border-neutral-800 shadow-inner">
          {/* Center 0 dB guide line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-neutral-600 -translate-y-1/2 z-10 pointer-events-none" />

          {/* Active Fill from center 0 dB */}
          {gain > 0 ? (
            <div
              className="absolute left-0 right-0 bg-[#c8824b] bottom-1/2"
              style={{ height: `${(gain / 30) * 50}%` }}
            />
          ) : gain < 0 ? (
            <div
              className="absolute left-0 right-0 bg-sky-500 top-1/2"
              style={{ height: `${(-gain / 30) * 50}%` }}
            />
          ) : null}
        </div>

        {/* Tactile Slider Knob Handle */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 w-8 h-5 rounded-md border shadow-xl flex items-center justify-center transition-transform pointer-events-none ${
            isDragging
              ? 'scale-125 bg-[#c8824b] border-white shadow-[#c8824b]/60'
              : 'bg-neutral-200 border-neutral-400 group-hover:scale-110'
          }`}
          style={{
            bottom: `calc(${percent}% - 10px)`
          }}
        >
          {/* Fader center grip notch */}
          <div className="w-4 h-0.5 bg-neutral-800 rounded-full" />
        </div>
      </div>

      {/* Quick -2 dB button */}
      <button
        type="button"
        onClick={() => onChange(Math.max(-30, gain - 2))}
        className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:bg-sky-500 active:text-black text-neutral-300 hover:text-white flex items-center justify-center transition-all mt-1.5 border border-neutral-700/50 shadow-sm"
        title="Disminuir -2 dB"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      {/* Frequency Label */}
      <div className="text-center mt-2.5">
        <p className="text-xs font-bold text-white leading-tight">{band.label}</p>
        <p className="text-[10px] text-neutral-400 truncate max-w-[62px]">{band.description}</p>
      </div>
    </div>
  );
};

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
  const [faderViewMode, setFaderViewMode] = useState<'vertical' | 'horizontal'>('vertical');

  if (!isOpen) return null;

  const handleFlattenAll = () => {
    eqGains.forEach((_, idx) => onChangeGain(idx, 0));
    onSelectPreset('Plano');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#181818] border border-neutral-800 rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800/80 sticky top-0 bg-[#181818]/95 backdrop-blur z-20">
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
                Ajusta las frecuencias de sonido manualmente o con presets
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
          {/* Animated EQ Frequency Visualizer & Status */}
          <div className="bg-neutral-900/90 rounded-xl p-4 border border-neutral-800/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#c8824b] animate-pulse" />
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  Estado: 
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                    eqPreset === 'Personalizado'
                      ? 'bg-[#c8824b] text-black'
                      : 'bg-neutral-800 text-[#c8824b]'
                  }`}>
                    {eqPreset === 'Personalizado' ? '🎛️ Modo Manual Activo' : eqPreset}
                  </span>
                </span>
                <span className="text-[11px] text-neutral-400 block mt-0.5">
                  {isPlaying ? 'Procesando señal de audio en tiempo real' : 'Ajustes listos para reproducir'}
                </span>
              </div>
            </div>

            {/* 5-Bar Live Spectrum Animation */}
            <div className="flex items-end gap-1.5 h-8 px-2 shrink-0">
              {eqGains.map((gain, idx) => {
                const baseHeightPercent = Math.max(20, Math.min(100, 50 + gain * 3.5));
                return (
                  <div key={idx} className="w-2.5 bg-neutral-800 rounded-t-sm flex flex-col justify-end h-full">
                    <div
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        gain > 0 
                          ? 'bg-[#c8824b]' 
                          : gain < 0 
                          ? 'bg-sky-400' 
                          : 'bg-neutral-400'
                      } ${isPlaying ? 'animate-pulse' : ''}`}
                      style={{ height: `${baseHeightPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preset Buttons Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Presets de Sonido
              </label>
              <button
                type="button"
                onClick={handleFlattenAll}
                className="text-[11px] text-neutral-400 hover:text-white hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Aplanar todo (0 dB)</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                    {isActive && <Check className="w-3.5 h-3.5 shrink-0 ml-1 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5-Band Manual Frequency Adjustment Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#c8824b]" />
                  <span>Ajuste Manual de Niveles (5 Bandas)</span>
                </label>
                <p className="text-[11px] text-neutral-400">
                  Mueve las barras, pulsa los botones <strong>+ / -</strong> o haz clic en los números dB.
                </p>
              </div>

              {/* View Switcher: Vertical vs Horizontal */}
              <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setFaderViewMode('vertical')}
                  className={`p-1.5 rounded-md transition-colors ${
                    faderViewMode === 'vertical'
                      ? 'bg-[#c8824b] text-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Faders verticales estilo consola"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setFaderViewMode('horizontal')}
                  className={`p-1.5 rounded-md transition-colors ${
                    faderViewMode === 'horizontal'
                      ? 'bg-[#c8824b] text-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Sliders horizontales amplios"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* View 1: Studio Vertical Faders */}
            {faderViewMode === 'vertical' ? (
              <div className="grid grid-cols-5 gap-1.5 sm:gap-4 bg-neutral-900/60 p-4 sm:p-5 rounded-2xl border border-neutral-800">
                {EQ_BANDS.map((band, idx) => (
                  <StudioFader
                    key={band.freq}
                    band={band}
                    idx={idx}
                    gain={eqGains[idx] ?? 0}
                    onChange={(val) => onChangeGain(idx, val)}
                  />
                ))}
              </div>
            ) : (
              /* View 2: Horizontal sliders with large touch handles */
              <div className="bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800 space-y-3">
                {EQ_BANDS.map((band, idx) => {
                  const currentGain = eqGains[idx] ?? 0;
                  return (
                    <div key={band.freq} className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white">{band.label}</span>
                          <span className="text-[11px] text-neutral-400 ml-2">({band.description})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onChangeGain(idx, 0)}
                            className="text-[10px] text-neutral-500 hover:text-neutral-300 px-1 py-0.5"
                            title="Reset a 0 dB"
                          >
                            0 dB
                          </button>
                          <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                            currentGain > 0 
                              ? 'text-[#c8824b] bg-[#c8824b]/15' 
                              : currentGain < 0 
                              ? 'text-sky-400 bg-sky-950/40' 
                              : 'text-neutral-400 bg-neutral-800'
                          }`}>
                            {currentGain > 0 ? `+${currentGain}` : currentGain} dB
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => onChangeGain(idx, Math.max(-30, currentGain - 2))}
                          className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white flex items-center justify-center font-bold shrink-0 border border-neutral-700/60"
                        >
                          -
                        </button>
                        <input
                          type="range"
                          min="-30"
                          max="30"
                          step="1"
                          value={currentGain}
                          onChange={(e) => onChangeGain(idx, parseFloat(e.target.value))}
                          className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#c8824b]"
                        />
                        <button
                          type="button"
                          onClick={() => onChangeGain(idx, Math.min(30, currentGain + 2))}
                          className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white flex items-center justify-center font-bold shrink-0 border border-neutral-700/60"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Crossfade (Transición Suave) Section */}
          <div className="bg-neutral-900/80 rounded-xl p-4 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">Transición Suave entre Canciones (Crossfade)</h4>
                  <p className="text-[11px] text-neutral-400">
                    Mezcla el final de una pista con la siguiente sin silencios molestos.
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
        <div className="p-4 border-t border-neutral-800 bg-[#181818] sticky bottom-0 rounded-b-2xl flex justify-between items-center z-20">
          <button
            type="button"
            onClick={handleFlattenAll}
            className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 text-xs font-bold transition-colors"
          >
            Aplanar Todo (0 dB)
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#c8824b] hover:bg-[#b5733f] text-black font-bold text-xs hover:scale-105 active:scale-95 transition-transform shadow-md"
          >
            Aplicar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
