
import React, { useMemo } from 'react';
import { CULTURES, MONTHS_SHORT } from '../constants';
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

  const categoriesOrder: CultureCategory[] = ['Fruits', 'Racines', 'Feuilles', 'Légumineuses', 'Aromatiques', 'Bulbes', 'Tubercules', 'Petits Fruits'];

  return (
    <div className="w-80 h-screen bg-stone-50 border-r border-stone-200 flex flex-col shadow-2xl z-20 print:hidden">
      <div className="p-8 border-b border-stone-200 bg-emerald-800 text-white relative overflow-hidden">
        <h1 className="text-2xl font-black flex items-center gap-3 tracking-tighter">
          <i className="fa-solid fa-seedling text-emerald-400"></i>
          GÉOPOTAGER
        </h1>
        <p className="text-[10px] text-emerald-200 mt-1 font-bold uppercase tracking-widest opacity-80">Intelligence Vivrière</p>
      </div>

      <nav className="p-4 space-y-1 shrink-0">
        <button 
          onClick={onOpenSettings}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${currentTab === 'garden' ? 'bg-emerald-600 text-white shadow-lg' : 'text-stone-600 hover:bg-stone-200'}`}
        >
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-map"></i>
            <span className="font-bold text-sm">Mon Plan de Jardin</span>
          </div>
        </button>
        <button 
          onClick={onOpenSufficiency}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${currentTab === 'sufficiency' ? 'bg-emerald-600 text-white shadow-lg' : 'text-stone-600 hover:bg-stone-200'}`}
        >
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-chart-pie"></i>
            <span className="font-bold text-sm">Autosuffisance {config ? config.sufficiencyTarget : 50}%</span>
          </div>
        </button>
        <button 
          onClick={onOpenCalendar}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${currentTab === 'calendar' ? 'bg-emerald-600 text-white shadow-lg' : 'text-stone-600 hover:bg-stone-200'}`}
        >
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-calendar"></i>
            <span className="font-bold text-sm">Planning Global</span>
          </div>
        </button>
      </nav>

      <div className="flex-1 overflow-y-auto px-4 py-2 border-t border-stone-100">
        <h2 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4 px-2">Bibliothèque de Cultures</h2>
        
        <div className="space-y-6 pb-6">
          {categoriesOrder.map(cat => {
            const cultures = groupedCultures[cat];
            if (!cultures || cultures.length === 0) return null;

            return (
              <div key={cat}>
                <h3 className="text-xs font-black text-stone-600 uppercase mb-2 px-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {cat}
                </h3>
                <div className="space-y-2">
                  {cultures.map(culture => (
                    <div
                      key={culture.id}
                      onClick={() => onSelectCulture(culture)}
                      className={`w-full p-2.5 rounded-xl border transition-all flex flex-col gap-2 cursor-pointer group ${
                        selectedCulture?.id === culture.id ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-100' : 'bg-white border-transparent hover:border-stone-200 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center shadow-sm overflow-hidden shrink-0">
                          <img src={culture.image} className="w-8 h-8 object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <p className="text-xs font-bold text-stone-800 truncate">{culture.name}</p>
                          </div>
                          <div className="flex gap-2 mt-1">
                             <span className="text-[8px] font-bold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                               <i className={`fa-solid fa-sun ${culture.exposure === 'Soleil' ? 'text-amber-500' : 'text-stone-400'}`}></i>
                               {culture.exposure}
                             </span>
                             <span className="text-[8px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                               <i className="fa-solid fa-droplet"></i>
                               {culture.waterNeeds}
                             </span>
                          </div>
                        </div>
                      </div>

                      {/* Mini Calendar Visualization with Letters */}
                      <div className="flex gap-0.5 h-4 w-full rounded-md overflow-hidden bg-stone-100/50">
                        {Array.from({length: 12}).map((_, i) => {
                          const month = i + 1;
                          let color = 'text-stone-300';
                          let bg = 'bg-transparent';
                          
                          if (culture.planning.harvest.includes(month as any)) { bg = 'bg-red-400'; color = 'text-white'; }
                          else if (culture.planning.planting.includes(month as any)) { bg = 'bg-amber-400'; color = 'text-white'; }
                          else if (culture.planning.sowing.includes(month as any)) { bg = 'bg-emerald-400'; color = 'text-white'; }
                          
                          return (
                            <div key={i} className={`flex-1 ${bg} flex items-center justify-center text-[7px] font-bold ${color}`} title={`Mois ${month}`}>
                              {MONTHS_SHORT[i]}
                            </div>
                          )
                        })}
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
