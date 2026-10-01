import React from 'react';
import { Battery, Zap, Moon, Search, PlusCircle, Database, Sliders } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { DataSaverStats } from '../types';

interface TopHeaderProps {
  batterySaverActive: boolean;
  onToggleBatterySaver: () => void;
  onOpenAmoledPocket: () => void;
  onOpenAddTrack: () => void;
  onOpenDataSaverModal: () => void;
  onOpenStorageInfoModal: () => void;
  onOpenEqualizer?: () => void;
  stats: DataSaverStats;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  batterySaverActive,
  onToggleBatterySaver,
  onOpenAmoledPocket,
  onOpenAddTrack,
  onOpenDataSaverModal,
  onOpenStorageInfoModal,
  onOpenEqualizer,
  stats,
  searchQuery,
  onSearchChange
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#121212]/95 backdrop-blur-md border-b border-neutral-800/80 select-none">
      {/* Main Top Bar */}
      <div className="h-14 px-3 md:px-6 flex items-center justify-between gap-2">
        {/* Zone 1: Brand title & Capibara Sound Logo */}
        <div
          className="flex items-center gap-2.5 shrink-0 cursor-pointer"
          onClick={onOpenStorageInfoModal}
          title="CAPIBARA SOUND - Info y Respaldo"
        >
          <div className="w-8 h-8 rounded-full bg-[#1c1613] flex items-center justify-center shadow-md shadow-[#c8824b]/25 overflow-hidden border border-[#c8824b] shrink-0">
            <img src="/icon.svg" alt="Capibara Sound" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold text-sm md:text-base text-white tracking-tight leading-none flex items-center gap-1.5">
              <span>CAPIBARA SOUND</span>
              <span className="text-[9px] hidden sm:inline-block px-1.5 py-0.2 rounded bg-amber-500/25 text-amber-300 font-semibold">
                🦫 CHILL AUDIO
              </span>
            </span>
            <span className="text-[10px] text-neutral-400 font-medium tracking-normal hidden sm:inline">
              Solo audio en segundo plano
            </span>
          </div>
        </div>

        {/* Zone 2: Desktop Search Bar */}
        <div className="flex-1 max-w-md mx-2 relative hidden md:block">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar canción, artista o pegar link de YouTube / video..."
            className="w-full bg-[#242424] text-xs text-white placeholder-neutral-400 rounded-full pl-9 pr-4 py-2 border border-transparent focus:border-neutral-600 focus:outline-none focus:bg-[#2a2a2a] transition-colors"
          />
        </div>

        {/* Zone 3: Desktop Action Buttons (md+) */}
        <div className="hidden md:flex items-center gap-2">
          {/* Storage Info */}
          <button
            onClick={onOpenStorageInfoModal}
            title="Ver cómo se guardan tus listas y exportar copia de seguridad"
            className="px-2.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 hover:border-indigo-500/40 text-neutral-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden lg:inline">Tus Listas</span>
          </button>

          {/* Data Saved */}
          <button
            onClick={onOpenDataSaverModal}
            title="Ver estadísticas de ahorro de batería y datos"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 hover:border-orange-500/40 text-neutral-300 hover:text-white transition-all text-xs"
          >
            <Zap className="w-3.5 h-3.5 text-[#c8824b]" />
            <span className="font-semibold text-[#c8824b] tabular-nums">{stats.dataSavedMb} MB</span>
            <span className="hidden lg:inline text-neutral-400">ahorrados</span>
          </button>

          {/* AMOLED Pocket */}
          <button
            onClick={onOpenAmoledPocket}
            title="Modo Pantalla Negra para el bolsillo (Ahorro máximo de batería AMOLED)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 hover:border-purple-500/40 text-neutral-300 hover:text-white transition-all text-xs"
          >
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Pantalla Negra</span>
          </button>

          {/* Eco Mode */}
          <button
            onClick={onToggleBatterySaver}
            title={batterySaverActive ? 'Desactivar Modo Batería Extrema' : 'Activar Modo Batería Extrema'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              batterySaverActive
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <Battery className={`w-3.5 h-3.5 ${batterySaverActive ? 'text-amber-400' : 'text-neutral-400'}`} />
            <span>{batterySaverActive ? 'Eco Activo' : 'Eco'}</span>
          </button>

          {/* Add Track */}
          <button
            onClick={onOpenAddTrack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors shrink-0"
            title="Pegar enlace de video o canción"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#c8824b]" />
            <span>Pegar Link</span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />
        </div>

        {/* Mobile Header Right: Pegar Link Primario + Botón Instalar */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          <button
            onClick={onOpenAddTrack}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#c8824b] hover:bg-[#b5733f] text-black text-xs font-bold transition-transform active:scale-95 shadow shrink-0"
            title="Pegar enlace de video o canción"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Link</span>
          </button>
          <PWAInstallButton isCompactOnMobile={true} />
        </div>
      </div>

      {/* Mobile Quick Actions Strip (Gives full mobile access to Eco, Data Saver stats, AMOLED Pocket, and backup) */}
      <div className="flex md:hidden items-center gap-2 overflow-x-auto px-3 py-2 bg-[#161616]/95 border-t border-neutral-800/40 scrollbar-none no-scrollbar">
        {/* Eco Mode Toggle */}
        <button
          onClick={onToggleBatterySaver}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 transition-all ${
            batterySaverActive
              ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm'
              : 'bg-neutral-900 border border-neutral-800 text-neutral-400'
          }`}
        >
          <Battery className={`w-3.5 h-3.5 ${batterySaverActive ? 'text-amber-400 animate-pulse' : 'text-neutral-400'}`} />
          <span>{batterySaverActive ? 'Eco Activo' : 'Eco'}</span>
        </button>

        {/* Data Saver Stats */}
        <button
          onClick={onOpenDataSaverModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 text-[11px] font-bold shrink-0"
        >
          <Zap className="w-3.5 h-3.5 text-[#c8824b]" />
          <span className="text-[#c8824b]">{stats.dataSavedMb} MB</span>
          <span className="text-neutral-500 font-medium">ahorrado</span>
        </button>

        {/* AMOLED Pocket Mode */}
        <button
          onClick={onOpenAmoledPocket}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 text-[11px] font-bold shrink-0"
        >
          <Moon className="w-3.5 h-3.5 text-indigo-400" />
          <span>Pantalla Negra</span>
        </button>



        {/* Backup / Export */}
        <button
          onClick={onOpenStorageInfoModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 text-[11px] font-bold shrink-0"
        >
          <Database className="w-3.5 h-3.5 text-indigo-400" />
          <span>Copia Seguridad</span>
        </button>
      </div>
    </header>
  );
};
