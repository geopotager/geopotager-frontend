
import React, { useState, useEffect } from 'react';
import { Culture, GardenConfig, VarietySuggestion } from '../types';
import { getVarietiesForLocation } from '../lib/gemini';
import { MONTHS_FR, MONTHS_SHORT } from '../constants';

interface CultureDetailsProps {
  culture: Culture;
  config: GardenConfig;
  onClose: () => void;
  onAddToPlan: (cultureId: string, variety?: string) => void;
}

const CultureDetails: React.FC<CultureDetailsProps> = ({ culture, config, onClose, onAddToPlan }) => {
  const [selectedVarietyName, setSelectedVarietyName] = useState<string>('');
  
  // Set default variety
  useEffect(() => {
    if (culture.varieties.length > 0) {
        setSelectedVarietyName(culture.varieties[0].name);
    }
  }, [culture]);

  const handleAdd = () => {
    onAddToPlan(culture.id, selectedVarietyName);
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden relative">
      {/* Header Image & Close */}
      <div className="relative h-56 shrink-0 group bg-stone-100 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
             <img src={culture.image} className="h-4/5 w-auto object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-2xl" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 via-emerald-900/20 to-transparent"></div>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 text-white backdrop-blur hover:bg-white hover:text-black transition-all flex items-center justify-center z-20"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="flex items-center gap-2 mb-2">
             <span className="px-3 py-1 rounded-md bg-white/20 backdrop-blur text-xs font-bold uppercase border border-white/20">
               {culture.category}
             </span>
             <span className="px-3 py-1 rounded-md bg-emerald-500 text-xs font-bold uppercase shadow-lg">
               Rendement : {culture.yield?.amount} {culture.yield?.unit}
             </span>
          </div>
          <h2 className="text-4xl font-black leading-none tracking-tight shadow-black drop-shadow-lg">{culture.name}</h2>
          <p className="text-base font-medium opacity-90 mt-2 text-emerald-100 leading-snug">{culture.description}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        <div className="p-6 space-y-8">

          {/* SÉLECTION VARIÉTÉ - NOUVELLE INTERFACE */}
          <section>
            <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <i className="fa-solid fa-tag text-purple-500"></i> Choisir une Variété
            </h3>
            <div className="space-y-3">
               {culture.varieties.map((variety, idx) => (
                 <div 
                   key={idx}
                   onClick={() => setSelectedVarietyName(variety.name)}
                   className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative overflow-hidden group ${selectedVarietyName === variety.name ? 'border-purple-500 bg-purple-50 shadow-md' : 'border-stone-100 hover:border-purple-200 bg-white'}`}
                 >
                    <div className="flex justify-between items-start mb-1">
                       <h4 className="font-bold text-stone-800 flex items-center gap-2">
                         {selectedVarietyName === variety.name && <i className="fa-solid fa-check-circle text-purple-600"></i>}
                         {variety.name}
                       </h4>
                       {variety.yieldBoost && (
                         <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                           {variety.yieldBoost}
                         </span>
                       )}
                    </div>
                    <p className="text-xs text-stone-500 mb-2">{variety.description}</p>
                    
                    <div className="flex items-center gap-4 text-[10px] font-bold text-stone-400 uppercase tracking-wide">
                       <span className="flex items-center gap-1 text-blue-500">
                         <i className="fa-solid fa-droplet"></i>
                         {Array.from({length: 3}).map((_, i) => (
                           <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < variety.waterNeedLevel ? 'bg-blue-500' : 'bg-blue-200'}`}></div>
                         ))}
                       </span>
                       <span className="flex items-center gap-1 text-purple-600">
                         <i className="fa-solid fa-star"></i> {variety.advantage}
                       </span>
                    </div>
                 </div>
               ))}
            </div>
          </section>

          {/* Calendrier Détaillé */}
          <section>
             <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
               <i className="fa-solid fa-calendar-days text-emerald-500"></i> Calendrier de Culture
             </h3>
             <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100 shadow-sm">
               <div className="grid grid-cols-12 gap-1 mb-2">
                 {MONTHS_SHORT.map((m, i) => (
                   <div key={i} className="text-center text-[10px] font-bold text-stone-400">{m}</div>
                 ))}
               </div>
               <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-1 items-center">
                    {Array.from({length: 12}).map((_, i) => (
                      <div key={i} className={`h-10 rounded-md flex items-center justify-center text-xs font-bold text-white transition-all ${
                        culture.planning.harvest.includes(i + 1 as any) ? 'bg-red-400 shadow-sm scale-105 z-10 ring-2 ring-white' :
                        culture.planning.planting.includes(i + 1 as any) ? 'bg-amber-400' :
                        culture.planning.sowing.includes(i + 1 as any) ? 'bg-emerald-400' :
                        'bg-stone-200'
                      }`}>
                         {culture.planning.harvest.includes(i + 1 as any) && <i className="fa-solid fa-basket-shopping"></i>}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between px-2 pt-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-stone-500"><div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>Semis</div>
                    <div className="flex items-center gap-2 text-xs font-bold text-stone-500"><div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>Plantation</div>
                    <div className="flex items-center gap-2 text-xs font-bold text-stone-500"><div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>Récolte</div>
                  </div>
               </div>
             </div>
          </section>

          {/* Compagnonnage & Sol */}
          <section className="grid grid-cols-2 gap-4">
             <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
                <h3 className="text-xs font-black text-emerald-800 uppercase mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-users"></i> Amis
                </h3>
                <div className="flex flex-wrap gap-2">
                   {culture.associations.map((a, i) => (
                     <span key={i} className="text-xs bg-white text-emerald-700 px-2.5 py-1.5 rounded-lg border border-emerald-200 font-bold shadow-sm">
                       {a}
                     </span>
                   ))}
                </div>
             </div>
             <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100">
                <h3 className="text-xs font-black text-amber-800 uppercase mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-layer-group"></i> Sol & Couvert
                </h3>
                <p className="text-sm text-amber-900 leading-snug font-medium">
                  {culture.soilCoverage}
                </p>
             </div>
          </section>

          {/* Guide Technique */}
          <section className="bg-stone-50 border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
             <div className="px-5 py-4 border-b border-stone-200 bg-stone-100/50 flex justify-between items-center">
                <h3 className="text-xs font-black text-stone-600 uppercase tracking-widest">
                  <i className="fa-solid fa-screwdriver-wrench mr-2 text-stone-400"></i>
                  Technique
                </h3>
             </div>
             <div className="p-5 space-y-6">
               {/* Grid Spacing */}
               <div className="flex gap-4">
                  <div className="flex-1 bg-white border border-stone-200 rounded-xl p-4 text-center">
                     <span className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Inter-Plant</span>
                     <span className="text-2xl font-black text-stone-800">{culture.spacingCm.betweenPlants}<small className="text-sm text-stone-400 ml-1">cm</small></span>
                  </div>
                  <div className="flex-1 bg-white border border-stone-200 rounded-xl p-4 text-center">
                     <span className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Inter-Rang</span>
                     <span className="text-2xl font-black text-stone-800">{culture.spacingCm.betweenRows}<small className="text-sm text-stone-400 ml-1">cm</small></span>
                  </div>
               </div>

               {/* Maintenance Text */}
               <div>
                 <h4 className="text-xs font-black text-stone-500 uppercase mb-2">Entretien & Astuces</h4>
                 <p className="text-sm text-stone-700 leading-relaxed bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                   {culture.maintenanceTips}
                 </p>
               </div>
               
               {/* Arrosage */}
               <div>
                  <h4 className="text-xs font-black text-blue-500 uppercase mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-droplet"></i> Arrosage ({culture.watering.frequency})
                  </h4>
                  <div className="w-full bg-stone-200 rounded-full h-2.5 overflow-hidden">
                    <div className={`h-full ${culture.waterNeeds === 'Élevé' ? 'bg-blue-600 w-3/4' : culture.waterNeeds === 'Moyen' ? 'bg-blue-400 w-1/2' : 'bg-blue-300 w-1/4'}`}></div>
                  </div>
                  <p className="text-xs text-stone-500 mt-1.5 italic font-medium">Env. {culture.watering.volumePerPlant}L par plant</p>
               </div>
             </div>
          </section>

        </div>
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent pt-12">
        <button 
          onClick={handleAdd}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black shadow-xl shadow-emerald-200 hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-95"
        >
          <i className="fa-solid fa-plus-circle text-lg"></i>
          <span>AJOUTER AU PLAN</span>
        </button>
      </div>
    </div>
  );
};

export default CultureDetails;
