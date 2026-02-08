
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
    <div className="h-full flex flex-col bg-white overflow-hidden relative border-l-4 border-stone-900">
      {/* Header Image & Close */}
      <div className="relative h-64 shrink-0 group bg-stone-100 overflow-hidden border-b-4 border-stone-900">
        <div className="absolute inset-0 bg-yellow-300 opacity-20"></div>
        <div className="absolute inset-0 flex items-center justify-center">
             <img src={culture.image} className="h-4/5 w-auto object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-[8px_8px_0px_rgba(0,0,0,0.2)]" />
        </div>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-white border-2 border-stone-900 text-stone-900 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center z-20 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
             <span className="px-2 py-1 bg-white border-2 border-stone-900 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
               {culture.category}
             </span>
             <span className="px-2 py-1 bg-stone-900 text-white border-2 border-stone-900 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
               FICHE TECHNIQUE
             </span>
          </div>
          <h2 className="text-5xl font-black leading-none tracking-tighter text-stone-900 bg-white inline-block px-2 border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-2">{culture.name}</h2>
          <p className="text-sm font-bold mt-2 text-stone-900 bg-white/80 p-2 border-2 border-stone-900 inline-block leading-snug">{culture.description}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32 bg-[#fffdf5]">
        <div className="p-6 space-y-8">

          {/* Guide Technique & Maintenance */}
          <section className="bg-white border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
             <div className="px-4 py-3 border-b-2 border-stone-900 bg-stone-100 flex justify-between items-center">
                <h3 className="text-xs font-black text-stone-900 uppercase tracking-widest">
                  <i className="fa-solid fa-screwdriver-wrench mr-2"></i>
                  Entretien & Culture
                </h3>
             </div>
             <div className="p-4 space-y-4">
               {/* Grid Spacing */}
               <div className="flex gap-4">
                  <div className="flex-1 bg-stone-50 border-2 border-stone-900 p-3 text-center">
                     <span className="block text-[9px] font-black text-stone-500 uppercase mb-1">Inter-Plant</span>
                     <span className="text-xl font-black text-stone-900">{culture.spacingCm.betweenPlants}<small className="text-xs ml-1">cm</small></span>
                  </div>
                  <div className="flex-1 bg-stone-50 border-2 border-stone-900 p-3 text-center">
                     <span className="block text-[9px] font-black text-stone-500 uppercase mb-1">Inter-Rang</span>
                     <span className="text-xl font-black text-stone-900">{culture.spacingCm.betweenRows}<small className="text-xs ml-1">cm</small></span>
                  </div>
                  <div className="flex-1 bg-stone-50 border-2 border-stone-900 p-3 text-center">
                     <span className="block text-[9px] font-black text-stone-500 uppercase mb-1">Rendement</span>
                     <span className="text-lg font-black text-stone-900 leading-none">{culture.yield.amount}<small className="text-[9px] ml-1">{culture.yield.unit}</small></span>
                  </div>
               </div>

               {/* Maintenance Text */}
               <div>
                 <h4 className="text-xs font-black text-stone-900 uppercase mb-2 bg-stone-200 inline-block px-1 border border-stone-900">Conseils du Jardinier</h4>
                 <p className="text-sm text-stone-900 leading-relaxed font-medium border-l-4 border-emerald-500 pl-3 bg-stone-50 py-2">
                   {culture.maintenanceTips}
                 </p>
               </div>
               
               {/* Arrosage */}
               <div>
                  <h4 className="text-xs font-black text-stone-900 uppercase mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-droplet text-blue-600"></i> Arrosage ({culture.watering.frequency})
                  </h4>
                  <div className="w-full bg-white border-2 border-stone-900 h-4 overflow-hidden relative">
                    <div className={`h-full border-r-2 border-stone-900 ${culture.waterNeeds === 'Élevé' ? 'bg-blue-600 w-3/4' : culture.waterNeeds === 'Moyen' ? 'bg-blue-400 w-1/2' : 'bg-blue-200 w-1/4'}`}></div>
                  </div>
                  <p className="text-xs text-stone-500 mt-1 italic font-bold text-right">~{culture.watering.volumePerPlant}L / plant</p>
               </div>
             </div>
          </section>

          {/* Maladies & Solutions */}
          <section className="bg-red-50 border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
             <div className="px-4 py-3 border-b-2 border-stone-900 bg-red-100 flex justify-between items-center">
                <h3 className="text-xs font-black text-red-900 uppercase tracking-widest">
                  <i className="fa-solid fa-heart-pulse mr-2"></i>
                  Maladies & Solutions
                </h3>
             </div>
             <div className="p-4 space-y-2">
               {culture.diseases.length > 0 ? culture.diseases.map((disease, idx) => (
                 <div key={idx} className="flex gap-2 items-start text-xs border-b border-red-200 pb-2 last:border-0 last:pb-0">
                    <i className="fa-solid fa-triangle-exclamation text-red-500 mt-0.5"></i>
                    <div>
                        <strong className="text-red-800 font-black uppercase">{disease.name} :</strong>
                        <span className="text-stone-800 ml-1 font-medium">{disease.solution}</span>
                    </div>
                 </div>
               )) : (
                 <p className="text-xs text-stone-500 italic">Plante rustique, peu sensible aux maladies courantes.</p>
               )}
             </div>
          </section>

          {/* Associations & Rotations */}
          <section className="bg-lime-50 border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
              <div className="px-4 py-3 border-b-2 border-stone-900 bg-lime-100 flex justify-between items-center">
              <h3 className="text-xs font-black text-lime-900 uppercase tracking-widest">
                  <i className="fa-solid fa-users mr-2"></i>
                  Compagnonnage & Rotations
              </h3>
              </div>
              <div className="p-4 space-y-4">
              <div>
                  <h4 className="text-xs font-black text-stone-900 uppercase mb-2 bg-stone-200 inline-block px-1 border border-stone-900">Bonnes Associations</h4>
                  {culture.associations.length > 0 ? (
                      <p className="text-sm text-stone-900 leading-relaxed font-medium">
                          {culture.associations.join(', ')}.
                      </p>
                  ) : (
                      <p className="text-sm text-stone-500 italic">Culture plutôt solitaire.</p>
                  )}
              </div>
              <div>
                  <h4 className="text-xs font-black text-stone-900 uppercase mb-2 bg-stone-200 inline-block px-1 border border-stone-900">Rotation des Cultures</h4>
                  <p className="text-sm text-stone-900 leading-relaxed font-medium">
                      Après cette culture, privilégiez les légumes de la famille des <strong className="text-emerald-700">{culture.rotations.join(' ou ')}</strong>.
                  </p>
              </div>
              </div>
          </section>

          {/* Calendrier Détaillé */}
          <section>
             <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest mb-4 flex items-center gap-2 bg-emerald-300 inline-block px-2 border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
               <i className="fa-solid fa-calendar-days"></i> Calendrier
             </h3>
             <div className="bg-white border-2 border-stone-900 p-4 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
               <div className="grid grid-cols-12 gap-0 mb-2 border-b-2 border-stone-900 pb-2">
                 {MONTHS_SHORT.map((m, i) => (
                   <div key={i} className="text-center text-[10px] font-black text-stone-900 uppercase">{m}</div>
                 ))}
               </div>
               <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-0.5">
                    {Array.from({length: 12}).map((_, i) => (
                      <div key={i} className={`h-8 border border-stone-900 flex items-center justify-center text-[10px] font-bold text-stone-900 ${
                        culture.planning.harvest.includes(i + 1 as any) ? 'bg-red-500' :
                        culture.planning.planting.includes(i + 1 as any) ? 'bg-yellow-400' :
                        culture.planning.sowing.includes(i + 1 as any) ? 'bg-emerald-400' :
                        'bg-stone-100'
                      }`}>
                         {culture.planning.harvest.includes(i + 1 as any) && <i className="fa-solid fa-basket-shopping"></i>}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between pt-2 gap-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase"><div className="w-3 h-3 bg-emerald-400 border border-stone-900"></div>Semis</div>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase"><div className="w-3 h-3 bg-yellow-400 border border-stone-900"></div>Plantation</div>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase"><div className="w-3 h-3 bg-red-500 border border-stone-900"></div>Récolte</div>
                  </div>
               </div>
             </div>
          </section>

          {/* SÉLECTION VARIÉTÉ - NOUVELLE INTERFACE */}
          <section>
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest mb-4 flex items-center gap-2 bg-purple-300 inline-block px-2 border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
               <i className="fa-solid fa-tag"></i> Choisir une Variété
            </h3>
            <div className="space-y-4">
               {culture.varieties.map((variety, idx) => (
                 <div 
                   key={idx}
                   onClick={() => setSelectedVarietyName(variety.name)}
                   className={`p-4 border-2 cursor-pointer transition-all relative group ${
                     selectedVarietyName === variety.name 
                     ? 'border-stone-900 bg-purple-100 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] translate-x-[-2px] translate-y-[-2px]' 
                     : 'border-stone-900 bg-white hover:bg-purple-50 hover:shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]'
                   }`}
                 >
                    <div className="flex justify-between items-start mb-1">
                       <h4 className="font-black text-stone-900 text-lg flex items-center gap-2 uppercase">
                         {selectedVarietyName === variety.name && <i className="fa-solid fa-check text-purple-600"></i>}
                         {variety.name}
                       </h4>
                       {variety.yieldBoost && (
                         <span className="text-[10px] bg-emerald-300 border border-stone-900 text-stone-900 px-2 py-0.5 font-bold uppercase">
                           {variety.yieldBoost}
                         </span>
                       )}
                    </div>
                    <p className="text-xs text-stone-600 font-medium mb-3 border-l-2 border-stone-900 pl-2">{variety.description}</p>
                    
                    <div className="flex items-center gap-4 text-[10px] font-black text-stone-900 uppercase tracking-wide">
                       <span className="flex items-center gap-1 bg-blue-200 px-2 py-1 border border-stone-900">
                         <i className="fa-solid fa-droplet"></i>
                         {Array.from({length: 3}).map((_, i) => (
                           <div key={i} className={`w-2 h-2 rounded-full border border-stone-900 ${i < variety.waterNeedLevel ? 'bg-blue-600' : 'bg-white'}`}></div>
                         ))}
                       </span>
                       <span className="flex items-center gap-1 bg-purple-200 px-2 py-1 border border-stone-900">
                         <i className="fa-solid fa-star"></i> {variety.advantage}
                       </span>
                    </div>
                 </div>
               ))}
            </div>
          </section>

        </div>
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t-4 border-stone-900">
        <button 
          onClick={handleAdd}
          className="w-full bg-emerald-500 border-2 border-stone-900 text-stone-900 py-4 font-black text-lg uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-3 active:bg-emerald-400"
        >
          <i className="fa-solid fa-plus-circle text-xl"></i>
          <span>AJOUTER AU PLAN</span>
        </button>
      </div>
    </div>
  );
};

export default CultureDetails;
