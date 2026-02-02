
import React from 'react';
import { CULTURES } from '../constants';
import { GardenConfig, Plot } from '../types';

interface Props {
  config: GardenConfig;
  onConfigChange: (config: GardenConfig) => void;
  plots: Plot[];
}

const AutosufficiencyTab: React.FC<Props> = ({ config, onConfigChange, plots }) => {
  
  // Calculer le nombre de plants réels présents sur le plan pour chaque culture
  const getPlantedCount = (cultureId: string) => {
    let count = 0;
    const culture = CULTURES.find(c => c.id === cultureId);
    if (!culture) return 0;

    plots.filter(p => p.plantedCultureId === cultureId).forEach(p => {
      const rows = Math.floor((p.height * 100) / culture.spacingCm.betweenRows);
      const perRow = Math.floor((p.width * 100) / culture.spacingCm.betweenPlants);
      count += rows * perRow;
    });
    return count;
  };

  // Besoins théoriques totaux
  const totalPlantsNeeded = CULTURES.reduce((acc, c) => 
    acc + Math.ceil(c.plantsPerPerson * config.peopleCount * (config.sufficiencyTarget / 100)), 0
  );

  // Plants réels totaux
  const totalPlantsOnPlan = CULTURES.reduce((acc, c) => acc + getPlantedCount(c.id), 0);
  
  // Score d'autonomie globale (pourcentage des besoins comblés)
  const globalCoverage = totalPlantsNeeded > 0 ? Math.min(100, Math.round((totalPlantsOnPlan / totalPlantsNeeded) * 100)) : 0;

  return (
    <div className="h-full bg-stone-50 overflow-y-auto p-8 md:p-12 space-y-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="max-w-xl">
            <h2 className="text-5xl font-black text-stone-900 tracking-tighter">Votre Plan Vivrier</h2>
            <p className="text-xl text-stone-500 mt-4 leading-relaxed">
              Analysé pour <span className="text-emerald-600 font-black">{config.peopleCount} personne(s)</span> à <span className="text-stone-800 font-bold">{config.sufficiencyTarget}%</span> d'autonomie cible.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-200 min-w-[320px] flex flex-col items-center">
            <div className="relative w-24 h-24 flex items-center justify-center mb-4">
               <svg className="w-full h-full transform -rotate-90">
                 <circle cx="48" cy="48" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
                 <circle cx="48" cy="48" r="40" fill="transparent" stroke="#10b981" strokeWidth="8" strokeDasharray={2 * Math.PI * 40} strokeDashoffset={2 * Math.PI * 40 * (1 - globalCoverage/100)} strokeLinecap="round" className="transition-all duration-1000" />
               </svg>
               <span className="absolute text-2xl font-black text-emerald-600">{globalCoverage}%</span>
            </div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest text-center">Progression Réelle Totale</p>
            
            <div className="mt-6 w-full space-y-4">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block text-center">Modifier l'Objectif Cible</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" min="10" max="100" step="10"
                  value={config.sufficiencyTarget}
                  onChange={(e) => onConfigChange({ ...config, sufficiencyTarget: parseInt(e.target.value) })}
                  className="flex-1 accent-emerald-600"
                />
                <span className="text-xl font-black text-emerald-600 w-12">{config.sufficiencyTarget}%</span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-3">
              <i className="fa-solid fa-list-check text-emerald-500"></i>
              Suivi des besoins par culture
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CULTURES.map(culture => {
                const needed = Math.ceil(culture.plantsPerPerson * config.peopleCount * (config.sufficiencyTarget / 100));
                const real = getPlantedCount(culture.id);
                const percent = needed > 0 ? Math.min(100, Math.round((real / needed) * 100)) : 0;
                const isComplete = percent >= 100;

                return (
                  <div key={culture.id} className={`bg-white p-5 rounded-3xl border transition-all duration-500 flex flex-col gap-4 shadow-sm hover:shadow-md ${isComplete ? 'border-emerald-200 bg-emerald-50/20' : 'border-stone-100'}`}>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={culture.image} className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
                        {isComplete && (
                          <div className="absolute -top-2 -right-2 bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] border-2 border-white">
                            <i className="fa-solid fa-check"></i>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-black text-stone-800 text-sm">{culture.name}</p>
                          <span className={`text-[10px] font-black uppercase ${isComplete ? 'text-emerald-600' : 'text-stone-400'}`}>
                            {percent}%
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-stone-500 mt-0.5">{culture.category}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                          <span className="text-stone-400">Réel: <span className="text-stone-800">{real} plants</span></span>
                          <span className="text-stone-400">Cible: <span className="text-stone-800">{needed} plants</span></span>
                       </div>
                       <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 rounded-full ${isComplete ? 'bg-emerald-500' : percent > 50 ? 'bg-amber-400' : 'bg-red-400'}`} 
                            style={{ width: `${percent}%` }}
                          ></div>
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-stone-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <i className="fa-solid fa-chart-bar absolute -right-6 -top-6 text-9xl opacity-10"></i>
              <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                 <i className="fa-solid fa-lightbulb text-amber-400"></i>
                 Conseils Stratégiques
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                   <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 font-black text-sm">1</div>
                   <div>
                     <h4 className="text-xs font-black uppercase text-emerald-400 mb-1">Déficit de place ?</h4>
                     <p className="text-[11px] opacity-70 leading-relaxed">
                       Si votre terrain est trop petit pour vos ambitions, privilégiez les cultures à haut rendement calorique comme la pomme de terre.
                     </p>
                   </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                   <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shrink-0 font-black text-sm">2</div>
                   <div>
                     <h4 className="text-xs font-black uppercase text-amber-400 mb-1">Rotation IA</h4>
                     <p className="text-[11px] opacity-70 leading-relaxed">
                       Utilisez les suggestions de parcelles suivantes dans l'éditeur pour planifier vos récoltes décalées.
                     </p>
                   </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                   <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0 font-black text-sm">3</div>
                   <div>
                     <h4 className="text-xs font-black uppercase text-blue-400 mb-1">Arrosage groupé</h4>
                     <p className="text-[11px] opacity-70 leading-relaxed">
                       Regroupez les cultures ayant les mêmes besoins en eau (ex: tomates et courgettes) pour optimiser vos réserves.
                     </p>
                   </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                 <p className="text-[9px] text-stone-400 uppercase font-bold tracking-[0.2em] text-center">Algorithme Vivrier v1.2</p>
              </div>
            </div>
            
            <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
               <h4 className="text-xs font-black text-emerald-800 uppercase mb-3">Récapitulatif Surface</h4>
               <div className="flex justify-between items-end">
                  <span className="text-xs text-emerald-600 font-bold">Terrain total :</span>
                  <span className="text-xl font-black text-emerald-900">{config.terrainWidth * config.terrainHeight}m²</span>
               </div>
               <div className="mt-4 pt-4 border-t border-emerald-200">
                  <p className="text-[10px] text-emerald-700 italic">
                    Pour {config.peopleCount} personnes à {config.sufficiencyTarget}%, une surface de culture de {Math.ceil(totalPlantsNeeded * 0.4)}m² est recommandée (hors allées).
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutosufficiencyTab;
