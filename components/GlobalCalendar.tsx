
import React from 'react';
import { CULTURES, MONTHS_FR } from '../constants';
import { Culture } from '../types';

interface GlobalCalendarProps {
  onSelectCulture?: (culture: Culture) => void;
}

const GlobalCalendar: React.FC<GlobalCalendarProps> = ({ onSelectCulture }) => {
  const currentMonth = new Date().getMonth() + 1;

  const OPERATIONS = [
    { name: 'Préparation du sol', icon: 'fa-shovels', color: 'text-stone-500', months: [2, 3, 4, 10, 11] },
    { name: 'Amendement & Compost', icon: 'fa-box-open', color: 'text-amber-700', months: [3, 4, 10, 11] },
    { name: 'Paillage des cultures', icon: 'fa-scroll', color: 'text-yellow-600', months: [5, 6, 7, 8] },
    { name: 'Taille & Entretien', icon: 'fa-scissors', color: 'text-emerald-600', months: [6, 7, 8, 9] },
    { name: 'Nettoyage d\'hiver', icon: 'fa-broom', color: 'text-blue-400', months: [11, 12, 1] },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-stone-800 tracking-tight">Calendrier Annuel</h2>
          <p className="text-stone-500 mt-2">Vue d'ensemble des travaux et récoltes du potager.</p>
        </div>
        <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-bold shadow-sm flex items-center gap-2">
           <i className="fa-solid fa-clock"></i>
           Mois actuel: {MONTHS_FR[currentMonth - 1]}
        </div>
      </div>

      {/* General Works Section */}
      <section className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="p-6 border-b border-stone-50 bg-stone-50/50">
          <h3 className="font-bold text-stone-700 flex items-center gap-2">
            <i className="fa-solid fa-trowel-bricks"></i>
            Opérations de Maintenance Structurelle
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50/30">
                <th className="text-left py-4 px-6 font-semibold text-stone-400 uppercase text-[10px]">Tâche</th>
                {MONTHS_FR.map((m, i) => (
                  <th key={m} className={`py-4 px-1 text-center font-bold ${i + 1 === currentMonth ? 'text-emerald-600' : 'text-stone-400'}`}>
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {OPERATIONS.map((op, idx) => (
                <tr key={idx} className="border-t border-stone-50 hover:bg-stone-50/40 transition-colors">
                  <td className="py-4 px-6 flex items-center gap-3">
                    <i className={`fa-solid ${op.icon} ${op.color} w-5 text-center`}></i>
                    <span className="font-medium text-stone-700">{op.name}</span>
                  </td>
                  {MONTHS_FR.map((_, i) => (
                    <td key={i} className="py-4 px-1 text-center">
                      {op.months.includes(i + 1) && (
                        <div className={`w-3 h-3 rounded-full mx-auto shadow-sm opacity-60 ${op.color.replace('text', 'bg')}`}></div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Cultures Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CULTURES.map(culture => (
          <div key={culture.id} className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center shadow-sm">
                <img src={culture.image} className="w-10 h-10 object-contain" />
              </div>
              <div>
                <h4 className="font-bold text-stone-800 leading-none">{culture.name}</h4>
                <p className="text-xs text-stone-400 mt-1">{culture.varieties.length} variétés suivies</p>
              </div>
            </div>
            
            <div className="space-y-3">
               <div className="flex justify-between items-center text-xs">
                 <span className="text-stone-500">Semis:</span>
                 <div className="flex gap-1">
                   {culture.planning.sowing.map(m => <span key={m} className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">{MONTHS_FR[m-1]}</span>)}
                   {culture.planning.sowing.length === 0 && <span className="text-stone-300 italic">N/A</span>}
                 </div>
               </div>
               <div className="flex justify-between items-center text-xs">
                 <span className="text-stone-500">Plantation:</span>
                 <div className="flex gap-1">
                   {culture.planning.planting.map(m => <span key={m} className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">{MONTHS_FR[m-1]}</span>)}
                 </div>
               </div>
               <div className="flex justify-between items-center text-xs">
                 <span className="text-stone-500">Récolte:</span>
                 <div className="flex gap-1">
                   {culture.planning.harvest.map(m => <span key={m} className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">{MONTHS_FR[m-1]}</span>)}
                 </div>
               </div>
            </div>

            <div className="bg-blue-50 px-3 py-2 rounded-lg flex justify-between items-center">
              <span className="text-[10px] font-bold text-blue-800 uppercase flex items-center gap-2">
                <i className="fa-solid fa-droplet text-blue-500"></i> Arrosage
              </span>
              <div className="text-right">
                 <span className="block text-xs text-blue-600 font-bold">{culture.watering.frequency}</span>
                 <span className="block text-[9px] text-blue-400 font-bold">~{culture.watering.volumePerPlant}L / plant</span>
              </div>
            </div>

            <button 
              onClick={() => onSelectCulture && onSelectCulture(culture)}
              className="mt-2 text-center py-2 bg-stone-50 rounded-xl text-xs font-bold text-stone-500 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
            >
              Voir détails complets
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlobalCalendar;
