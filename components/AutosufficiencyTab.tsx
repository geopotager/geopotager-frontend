
import React, { useState } from 'react';
import { CULTURES, MONTHS_FR } from '../constants';
import { GardenConfig, Plot } from '../types';
import { calculateNeeds, countExistingPlants } from '../lib/plantCalculations';

interface Props {
  config: GardenConfig;
  onConfigChange: (config: GardenConfig) => void;
  plots: Plot[];
  onRequestPlanning?: () => void;
  onOpenCultureDetails?: (cultureId: string) => void;
}

const AutosufficiencyTab: React.FC<Props> = ({ config, onConfigChange, plots, onRequestPlanning, onOpenCultureDetails }) => {
  const getWeeklyWaterConsumption = (cultureId: string) => {
      const culture = CULTURES.find(c => c.id === cultureId);
      if(!culture) return 0;
      const planted = countExistingPlants(plots, cultureId);
      
      let multiplier = 1;
      // Parsing simple de la fréquence string
      if(culture.watering.frequency.includes('2x')) multiplier = 2;
      else if(culture.watering.frequency.includes('3x')) multiplier = 3;
      else if(culture.watering.frequency.includes('10 jours')) multiplier = 0.7;
      else if(culture.watering.frequency.includes('2 semaines')) multiplier = 0.5;
      else if(culture.watering.frequency.includes('mois')) multiplier = 0.25;
      
      return Math.round(planted * culture.watering.volumePerPlant * multiplier);
  };

  const totalWaterWeekly = CULTURES.reduce((acc, c) => acc + getWeeklyWaterConsumption(c.id), 0);

  // Calcul Oeufs
  const totalChickens = plots.reduce((acc, p) => p.type === 'coop' ? acc + (p.chickenCount || 0) : acc, 0);
  const eggProductionPerYear = totalChickens * 250; 
  const eggNeedsPerYear = config.peopleCount * 200; 
  const eggCoverage = eggNeedsPerYear > 0 ? Math.min(100, Math.round((eggProductionPerYear / eggNeedsPerYear) * 100)) : 0;

  // Besoins théoriques totaux (Plantes)
  const totalPlantsNeeded = CULTURES.reduce((acc, c) => 
    acc + calculateNeeds(c.id, config.peopleCount, config.sufficiencyTarget).neededPlants, 0
  );
  const totalPlantsOnPlan = CULTURES.reduce((acc, c) => acc + countExistingPlants(plots, c.id), 0);
  const globalCoverage = totalPlantsNeeded > 0 ? Math.min(100, Math.round((totalPlantsOnPlan / totalPlantsNeeded) * 100)) : 0;

  return (
    <div className="h-full bg-stone-50 overflow-y-auto p-8 md:p-12 space-y-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="max-w-xl">
            <h2 className="text-5xl font-black text-stone-900 tracking-tighter">Votre Vivier</h2>
            <p className="text-xl text-stone-500 mt-4 leading-relaxed">
              Analysé pour <span className="text-emerald-600 font-black">{config.peopleCount} personne(s)</span> à <span className="text-stone-800 font-bold">{config.sufficiencyTarget}%</span> d'autonomie cible.
            </p>
          </div>
          
          <div className="flex gap-6">
             {/* Eggs Circle */}
             <div className="bg-white p-4 md:p-6 rounded-[2rem] shadow-xl border-2 border-stone-900 flex flex-col items-center min-w-[140px]">
                <div className="relative w-16 h-16 flex items-center justify-center mb-2">
                   <svg className="w-full h-full transform -rotate-90">
                     <circle cx="32" cy="32" r="28" fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
                     <circle cx="32" cy="32" r="28" fill="transparent" stroke="#f59e0b" strokeWidth="6" strokeDasharray={2 * Math.PI * 28} strokeDashoffset={2 * Math.PI * 28 * (1 - eggCoverage/100)} strokeLinecap="round" className="transition-all duration-1000" />
                   </svg>
                   <i className="fa-solid fa-egg text-amber-500 text-xl absolute"></i>
                </div>
                <span className="text-xl font-black text-amber-600">{eggCoverage}%</span>
                <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest text-center mt-1">Oeufs</p>
             </div>

             {/* Plants Circle */}
             <div className="bg-white p-4 md:p-6 rounded-[2rem] shadow-xl border-2 border-stone-900 flex flex-col items-center min-w-[140px]">
                <div className="relative w-16 h-16 flex items-center justify-center mb-2">
                   <svg className="w-full h-full transform -rotate-90">
                     <circle cx="32" cy="32" r="28" fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
                     <circle cx="32" cy="32" r="28" fill="transparent" stroke="#10b981" strokeWidth="6" strokeDasharray={2 * Math.PI * 28} strokeDashoffset={2 * Math.PI * 28 * (1 - globalCoverage/100)} strokeLinecap="round" className="transition-all duration-1000" />
                   </svg>
                   <i className="fa-solid fa-carrot text-emerald-500 text-xl absolute"></i>
                </div>
                <span className="text-xl font-black text-emerald-600">{globalCoverage}%</span>
                <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest text-center mt-1">Légumes</p>
             </div>

             {/* Water Stats */}
             <div className="bg-blue-50 p-4 md:p-6 rounded-[2rem] shadow-xl border-2 border-stone-900 flex flex-col items-center min-w-[140px]">
                <div className="relative w-16 h-16 flex items-center justify-center mb-2">
                   <i className="fa-solid fa-faucet-drip text-blue-500 text-4xl"></i>
                </div>
                <span className="text-xl font-black text-blue-600">{totalWaterWeekly} L</span>
                <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest text-center mt-1">/ Semaine</p>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-3">
                <i className="fa-solid fa-list-check text-emerald-500"></i>
                Suivi des besoins par culture
                </h3>
                {onRequestPlanning && (
                    <button 
                        onClick={onRequestPlanning}
                        className="bg-emerald-500 text-white font-black uppercase text-xs px-4 py-2 border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-2"
                    >
                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                        Planifier le Manquant
                    </button>
                )}
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {CULTURES.map(culture => {
                const { neededPlants: needed } = calculateNeeds(culture.id, config.peopleCount, config.sufficiencyTarget);
                const real = countExistingPlants(plots, culture.id);
                const percent = needed > 0 ? Math.min(100, Math.round((real / needed) * 100)) : 0;
                const isComplete = percent >= 100;
                const water = getWeeklyWaterConsumption(culture.id);

                return (
                  <div key={culture.id} className={`bg-white p-5 rounded-xl border-2 transition-all duration-300 shadow-sm ${isComplete ? 'border-emerald-500' : 'border-stone-900'}`}>
                    <div className="flex items-center gap-4">
                      <div className="relative cursor-pointer" onClick={() => onOpenCultureDetails && onOpenCultureDetails(culture.id)}>
                        <img src={culture.image} className="w-14 h-14 object-cover border-2 border-stone-900 shadow-sm bg-white p-1" />
                        {isComplete && (
                          <div className="absolute -top-2 -right-2 bg-emerald-500 text-white w-6 h-6 flex items-center justify-center text-[10px] border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <i className="fa-solid fa-check"></i>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-black text-stone-800 text-sm uppercase">{culture.name}</p>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                {water} L/sem
                             </span>
                             <span className={`text-[10px] font-black uppercase ${isComplete ? 'text-emerald-600' : 'text-stone-400'}`}>
                                {percent}%
                             </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                            <p className="text-[10px] font-bold text-stone-500 uppercase">{culture.category}</p>
                            <button onClick={() => onOpenCultureDetails && onOpenCultureDetails(culture.id)} className="text-xs font-bold text-stone-900 bg-white px-3 py-2 border-2 border-stone-900 hover:bg-stone-100 transition-all flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]">
                                <i className="fa-solid fa-file-invoice"></i> Fiche Technique
                            </button>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mt-2 h-2 w-full bg-stone-200 border border-stone-900 overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${isComplete ? 'bg-emerald-500' : percent > 50 ? 'bg-amber-400' : 'bg-red-400'}`} 
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[9px] font-black uppercase mt-1 text-stone-400">
                            <span>{real} en terre</span>
                            <span>Cible: {needed}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column Stats */}
          <div className="space-y-6">
            <div className="bg-white border-2 border-stone-900 p-6 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
               <h4 className="text-xs font-black text-amber-800 uppercase mb-3 border-b-2 border-stone-900 pb-2">Production Animale</h4>
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-bold text-stone-600">Poules :</span>
                     <span className="font-black text-stone-900">{totalChickens}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-bold text-stone-600">Oeufs / an :</span>
                     <span className="font-black text-emerald-600">{eggProductionPerYear}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-bold text-stone-600">Besoins / an :</span>
                     <span className="font-black text-stone-900">{eggNeedsPerYear}</span>
                  </div>
               </div>
            </div>

            <div className="bg-stone-900 text-white p-8 rounded-[2rem] shadow-[8px_8px_0px_0px_#10b981] relative overflow-hidden border-2 border-stone-900">
              <i className="fa-solid fa-chart-bar absolute -right-6 -top-6 text-9xl opacity-10"></i>
              <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                 <i className="fa-solid fa-lightbulb text-amber-400"></i>
                 Conseils Stratégiques
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
                   <div className="w-8 h-8 bg-emerald-500 flex items-center justify-center shrink-0 font-black text-sm border-2 border-stone-900 text-stone-900">1</div>
                   <div>
                     <h4 className="text-xs font-black uppercase text-emerald-400 mb-1">Déficit de place ?</h4>
                     <p className="text-[11px] opacity-70 leading-relaxed font-mono">
                       Si votre terrain est trop petit, privilégiez les cultures à haut rendement calorique comme la pomme de terre.
                     </p>
                   </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
                   <div className="w-8 h-8 bg-blue-500 flex items-center justify-center shrink-0 font-black text-sm border-2 border-stone-900 text-stone-900">2</div>
                   <div>
                     <h4 className="text-xs font-black uppercase text-blue-400 mb-1">Eau</h4>
                     <p className="text-[11px] opacity-70 leading-relaxed font-mono">
                       Votre consommation estimée est de {totalWaterWeekly}L/sem. Pensez à installer {Math.ceil(totalWaterWeekly/200)} récupérateurs d'eau.
                     </p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutosufficiencyTab;
