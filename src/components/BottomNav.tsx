import React from 'react';
import { Home, Search, Library, HardDrive } from 'lucide-react';
import { ViewTab } from '../types';

interface BottomNavProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onClearSelectedPlaylist: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onClearSelectedPlaylist
}) => {
  const tabs = [
    { id: 'home' as ViewTab, label: 'Inicio', icon: Home },
    { id: 'search' as ViewTab, label: 'Buscar', icon: Search },
    { id: 'library' as ViewTab, label: 'Biblioteca', icon: Library },
    { id: 'offline' as ViewTab, label: 'Dispositivo', icon: HardDrive }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121212]/95 backdrop-blur-md border-t border-neutral-800/80 px-2 py-1 flex items-center justify-around h-14">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => {
              onClearSelectedPlaylist();
              onSelectTab(tab.id);
            }}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
              isActive ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-[#c8824b]' : ''}`} />
            <span className={`text-[10px] tracking-tight mt-0.5 font-medium ${isActive ? 'text-[#c8824b]' : ''}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
