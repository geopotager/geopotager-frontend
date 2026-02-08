
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
    <div className="w-80 h-screen bg-white border-r-4 border-black flex flex-col z-20 print:hidden shadow-[4px_0px_0px_0px_rgba(0,0,0,0.2)]">
      <div className="p-6 border-b-4 border-black bg-black text-white relative overflow-hidden">
        <h1 className="text-2xl font-sans font-black flex items-center gap-3 tracking-tighter text-white">
          <i className="fa-solid fa-leaf text-lime-400"></i>
          GÉOPOTAGER
        </h1>
        <p className="text-[10px] text-black mt-2 font-bold uppercase tracking-widest bg-lime-400 inline-block px-2 py-0.5 border-2 border-black shadow-[2px_2px_0px_0px_#ffffff]">Intelligence Vivrière</p>
      </div>

      <nav className="p-4 space-y-3 shrink-0 bg-gray-100 border-b-4 border-black">
        <button 
          onClick={onOpenSettings}
          className={`w-full flex items-center justify-between px-4 py-3 border-2 border-black transition-all duration-100 font-mono ${
            currentTab === 'garden' 
            ? 'bg-black text-lime-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]' 
            : 'bg-yellow-300 text-black hover:bg-yellow-200 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]'
          }`}
        >
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-map"></i>
            <span className="font-bold text-sm uppercase">Plan Terrain</span>
          </div>
        </button>
        <button 
          onClick={onOpenSufficiency}
          className={`w-full flex items-center justify-between px-4 py-3 border-2 border-black transition-all duration-100 font-mono ${
            currentTab === 'sufficiency' 
            ? 'bg-black text-lime-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]' 
            : 'bg-yellow-300 text-black hover:bg-yellow-200 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]'
          }`}
        >
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-chart-pie"></i>
            <span className="font-bold text-sm uppercase">Votre Vivier</span>
          </div>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 font-mono ${currentTab === 'sufficiency' ? 'bg-lime-300 text-black' : 'bg-black text-white'}`}>{config ? config.sufficiencyTarget : 50}%</span>
        </button>
        <button 
          onClick={onOpenCalendar}
          className={`w-full flex items-center justify-between px-4 py-3 border-2 border-black transition-all duration-100 font-mono ${
            currentTab === 'calendar' 
            ? 'bg-black text-lime-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]' 
            : 'bg-yellow-300 text-black hover:bg-yellow-200 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]'
          }`}
        >
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-calendar"></i>
            <span className="font-bold text-sm uppercase">Planning</span>
          </div>
        </button>
      </nav>

      <div className="flex-1 overflow-y-auto px-4 py-4 bg-white">
        <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 px-2 py-1 border-b-2 border-gray-300 font-mono">Bibliothèque des cultures</h2>
        
        <div className="space-y-8 pb-6">
          {categoriesOrder.map(cat => {
            const cultures = groupedCultures[cat];
            if (!cultures || cultures.length === 0) return null;
            const catColor = CATEGORY_COLORS[cat] || 'bg-gray-200';

            return (
              <div key={cat}>
                <h3 className={`text-xs font-black text-black uppercase mb-3 px-2 py-1.5 border-2 border-black flex items-center justify-between shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${catColor}`}>
                  {cat}
                  <span className="bg-black text-white text-[10px] w-5 h-5 flex items-center justify-center font-mono">{cultures.length}</span>
                </h3>
                <div className="space-y-3 pl-1">
                  {cultures.map(culture => (
                    <div
                      key={culture.id}
                      onClick={() => onSelectCulture(culture)}
                      className={`w-full p-2 border-2 transition-all cursor-pointer group relative ${
                        selectedCulture?.id === culture.id 
                        ? 'bg-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px] z-10 ring-2 ring-black' 
                        : 'bg-white border-black hover:bg-lime-100 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border-2 border-black bg-gray-100 flex items-center justify-center shrink-0">
                          <img src={culture.image} className="w-7 h-7 object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <p className="text-xs font-bold text-black truncate uppercase font-mono">{culture.name}</p>
                          </div>
                          <div className="flex gap-2 mt-1">
                             <span className="text-[8px] font-bold text-black bg-yellow-300 border border-black px-1 py-0.5 flex items-center gap-1">
                               <i className={`fa-solid fa-sun ${culture.exposure === 'Soleil' ? 'text-orange-500' : 'text-gray-400'}`}></i>
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
