
import React, { useMemo } from 'react';
import { CULTURES, CATEGORY_COLORS } from '../constants';
import { Culture, GardenConfig, CultureCategory } from '../types';

interface SidebarProps {
  selectedCulture: Culture | null;
  onSelectCulture: (culture: Culture) => void;
  onOpenSettings: () => void;
  onOpenCalendar: () => void;
  onOpenSufficiency: () => void;
  currentTab: 'garden' | 'calendar' | 'sufficiency';
  config?: GardenConfig;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  selectedCulture, 
  onSelectCulture, 
  onOpenSettings, 
  onOpenCalendar,
  onOpenSufficiency,
  currentTab,
  config
}) => {
  
  // Group cultures by category
  const groupedCultures = useMemo(() => {
    const groups: Partial<Record<CultureCategory, Culture[]>> = {};
    CULTURES.forEach(culture => {
      if (!groups[culture.category]) {
        groups[culture.category] = [];
      }
      groups[culture.category]?.push(culture);
    });
    return groups;
  }, []);

  const categoriesOrder: CultureCategory[] = ['Fruits', 'Racines', 'Feuilles', 'Légumineuses', 'Aromatiques', 'Bulbes', 'Tubercules', 'Petits Fruits', 'Arbres Fruitiers', 'Perenne', 'Céréales', 'Fleurs'];

  return (
    <div className="w-64 h-screen bg-white border-r-4 border-black flex flex-col z-20 print:hidden shadow-[4px_0px_0px_0px_rgba(0,0,0,0.1)]">
      {/* Header - Vert Lime, Bordures Noires, Hauteur Calée sur SetupPanel (136px) */}
      <div className="p-3 border-b-4 border-black bg-lime-400 text-black relative overflow-hidden flex flex-col justify-center h-[136px] shrink-0">
        <h1 className="text-xl font-sans font-black flex items-center gap-2 tracking-tighter">
          <i className="fa-solid fa-leaf text-black"></i>
          GÉOPOTAGER
        </h1>
        <p className="text-[8px] text-lime-400 mt-1 font-bold uppercase tracking-widest bg-black inline-block px-1.5 py-0.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)]">Intelligence Vivrière</p>
      </div>

      <nav className="p-2 space-y-2 shrink-0 bg-[#EFEBE9] border-b-4 border-black">
        <button 
          onClick={onOpenSettings}
          className={`w-full flex items-center justify-between px-3 py-2 border-2 border-black transition-all duration-75 font-mono cursor-pointer ${
            currentTab === 'garden' 
            ? 'bg-[#5D4037] text-white shadow-[2px_2px_0px_0px_black]' 
            : 'bg-white text-black hover:bg-[#D7CCC8]'
          }`}
        >
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-map"></i>
            <span className="font-bold text-xs uppercase">Plan Terrain</span>
          </div>
        </button>
        <button 
          onClick={onOpenSufficiency}
          className={`w-full flex items-center justify-between px-3 py-2 border-2 border-black transition-all duration-75 font-mono cursor-pointer ${
            currentTab === 'sufficiency' 
            ? 'bg-[#5D4037] text-white shadow-[2px_2px_0px_0px_black]' 
            : 'bg-white text-black hover:bg-[#D7CCC8]'
          }`}
        >
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-chart-pie"></i>
            <span className="font-bold text-xs uppercase">Votre Vivrier</span>
          </div>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 font-mono ${currentTab === 'sufficiency' ? 'bg-white text-[#3E2723]' : 'bg-[#3E2723] text-white'}`}>{config ? config.sufficiencyTarget : 50}%</span>
        </button>
        <button 
          onClick={onOpenCalendar}
          className={`w-full flex items-center justify-between px-3 py-2 border-2 border-black transition-all duration-75 font-mono cursor-pointer ${
            currentTab === 'calendar' 
            ? 'bg-[#5D4037] text-white shadow-[2px_2px_0px_0px_black]' 
            : 'bg-white text-black hover:bg-[#D7CCC8]'
          }`}
        >
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-calendar"></i>
            <span className="font-bold text-xs uppercase">Planning</span>
          </div>
        </button>
      </nav>

      <div className="flex-1 overflow-y-auto px-2 py-4 bg-white">
        <h2 className="text-[10px] font-black text-black uppercase tracking-widest mb-4 px-2 py-1 border-b-2 border-black font-mono">Bibliothèque des cultures</h2>
        
        <div className="space-y-6 pb-6">
          {categoriesOrder.map(cat => {
            const cultures = groupedCultures[cat];
            if (!cultures || cultures.length === 0) return null;
            const catColor = CATEGORY_COLORS[cat] || 'bg-gray-200';

            return (
              <div key={cat}>
                <h3 className={`text-[10px] font-black text-black uppercase mb-2 px-2 py-1 border-2 border-black flex items-center justify-between shadow-[2px_2px_0px_0px_black] ${catColor}`}>
                  {cat}
                  <span className="bg-black text-white text-[9px] w-4 h-4 flex items-center justify-center font-mono">{cultures.length}</span>
                </h3>
                <div className="space-y-2 pl-1">
                  {cultures.map(culture => (
                    <div
                      key={culture.id}
                      onClick={() => onSelectCulture(culture)}
                      className={`w-full p-1.5 border-2 transition-all cursor-spade group relative ${
                        selectedCulture?.id === culture.id 
                        ? 'bg-white border-black shadow-[2px_2px_0px_0px_black] translate-x-[-1px] translate-y-[-1px] ring-1 ring-black' 
                        : 'bg-white border-black hover:bg-[#EFEBE9] hover:shadow-[2px_2px_0px_0px_black]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center shrink-0 shadow-[1px_1px_0px_black] p-1 overflow-hidden">
                          <img src={culture.image} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <p className="text-[10px] font-black text-black truncate uppercase font-mono">{culture.name}</p>
                          </div>
                          <div className="flex gap-1 mt-0.5">
                             <span className="text-[7px] font-bold text-black bg-[#D7CCC8] border border-black px-1 py-0 flex items-center gap-1">
                               <i className={`fa-solid fa-sun ${culture.exposure === 'Soleil' ? 'text-orange-600' : 'text-gray-500'}`}></i>
                               {culture.exposure}
                             </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
