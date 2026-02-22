
import React, { useState } from 'react';
import { CULTURES, MONTHS_SHORT } from '../constants';
import { GardenConfig, Plot } from '../types';
import { calculateNeeds, countExistingPlants } from '../lib/plantCalculations';
import GardenMap from './GardenMap';

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
      if(culture.watering.frequency.includes('2x')) multiplier = 2;
      else if(culture.watering.frequency.includes('3x')) multiplier = 3;
      else if(culture.watering.frequency.includes('10 jours')) multiplier = 0.7;
      else if(culture.watering.frequency.includes('2 semaines')) multiplier = 0.5;
      else if(culture.watering.frequency.includes('mois')) multiplier = 0.25;
      
      return Math.round(planted * culture.watering.volumePerPlant * multiplier);
  };

  const totalWaterWeekly = CULTURES.reduce((acc, c) => acc + getWeeklyWaterConsumption(c.id), 0);
  const totalChickens = plots.reduce((acc, p) => p.type === 'coop' ? acc + (p.chickenCount || 0) : acc, 0);
  const eggProductionPerYear = totalChickens * 250; 
  const eggNeedsPerYear = config.peopleCount * 200; 
  const eggCoverage = eggNeedsPerYear > 0 ? Math.min(100, Math.round((eggProductionPerYear / eggNeedsPerYear) * 100)) : 0;
  const totalPlantsNeeded = CULTURES.reduce((acc, c) => acc + calculateNeeds(c.id, config.peopleCount, config.sufficiencyTarget).neededPlants, 0);
  const totalPlantsOnPlan = CULTURES.reduce((acc, c) => acc + countExistingPlants(plots, c.id), 0);
  const globalCoverage = totalPlantsNeeded > 0 ? Math.min(100, Math.round((totalPlantsOnPlan / totalPlantsNeeded) * 100)) : 0;

  const visibleCultures = CULTURES.filter(c => {
     const planted = countExistingPlants(plots, c.id);
     const { neededPlants } = calculateNeeds(c.id, config.peopleCount, config.sufficiencyTarget);
     return planted > 0 || neededPlants > 0;
  });

  return (
    <div className="h-full bg-[#EFEBE9] overflow-y-auto p-4 md:p-8 space-y-8">
      
      {/* HEADER AVEC BOUTON PRINT */}
      <div className="flex justify-between items-center mb-6 no-print">
          <h1 className="text-2xl font-black text-[#3E2723] uppercase">Dossier Vivrier</h1>
          <button 
            onClick={() => window.print()} 
            className="bg-[#3E2723] text-white px-6 py-3 font-black uppercase text-xs flex items-center gap-2 border-2 border-[#5D4037] shadow-[4px_4px_0px_0px_#8D6E63] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
             <i className="fa-solid fa-print"></i>
             Imprimer / PDF
          </button>
      </div>

      {/* PLAN DU JARDIN (READ ONLY) */}
      <div className="max-w-6xl mx-auto break-inside-avoid">
         <div className="bg-white p-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8">
            <div className="flex justify-between items-center bg-black text-white px-3 py-2 mb-2">
                <span className="font-black uppercase text-sm tracking-widest"><i className="fa-solid fa-map mr-2"></i>Plan & Ensoleillement</span>
                <span className="text-xs font-mono">{config.terrainWidth}m x {config.terrainHeight}m</span>
            </div>
            <div className="h-[500px] w-full relative border-2 border-black overflow-hidden pointer-events-none print:h-[600px]">
                <GardenMap 
                    plots={plots} 
                    config={config} 
                    onSelectPlot={()=>{}} 
                    onUpdatePlot={()=>{}} 
                    onAddPlot={()=>{}} 
                    onConfigChange={()=>{}} 
                    selectedPlotId={null} 
                    multiSelectedIds={[]} 
                    onMultiSelect={()=>{}} 
                    isCalibrating={false} 
                    showSunPath={true} // Exposition soleil affichée
                />
            </div>
         </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* STATS GLOBALES IMPRIMABLES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 break-inside-avoid">
             <div className="bg-white p-6 border-2 border-black flex flex-col items-center shadow-[4px_4px_0px_0px_#8D6E63]">
                <span className="text-4xl font-black text-emerald-600">{globalCoverage}%</span>
                <p className="text-xs font-bold uppercase text-[#3E2723] mt-1">Couverture Végétale</p>
             </div>
             <div className="bg-white p-6 border-2 border-black flex flex-col items-center shadow-[4px_4px_0px_0px_#8D6E63]">
                <span className="text-4xl font-black text-amber-500">{eggCoverage}%</span>
                <p className="text-xs font-bold uppercase text-[#3E2723] mt-1">Couverture Oeufs</p>
             </div>
             <div className="bg-white p-6 border-2 border-black flex flex-col items-center shadow-[4px_4px_0px_0px_#8D6E63]">
                <span className="text-4xl font-black text-blue-500">{totalWaterWeekly} L</span>
                <p className="text-xs font-bold uppercase text-[#3E2723] mt-1">Eau / Semaine</p>
             </div>
        </div>

        {/* LISTE DÉTAILLÉE DES CULTURES (FICHE TECHNIQUE) */}
        <div className="space-y-6">
            <h2 className="text-xl font-black text-[#3E2723] uppercase tracking-widest border-b-4 border-[#3E2723] pb-2 mb-6">Fiches Techniques des Cultures</h2>
            
            {visibleCultures.map(culture => {
                const { neededPlants: needed } = calculateNeeds(culture.id, config.peopleCount, config.sufficiencyTarget);
                const real = countExistingPlants(plots, culture.id);
                const percent = needed > 0 ? Math.min(100, Math.round((real / needed) * 100)) : 100;
                const water = getWeeklyWaterConsumption(culture.id);

                return (
                  <div key={culture.id} className="bg-white border-4 border-[#3E2723] p-0 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] break-inside-avoid relative overflow-hidden">
                    {/* Header Culture */}
                    <div className="bg-[#D7CCC8] p-4 flex justify-between items-start border-b-2 border-[#3E2723]">
                       <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-white border-2 border-black flex items-center justify-center p-1 shadow-sm">
                             <img src={culture.image} className="w-full h-full object-contain" />
                          </div>
                          <div>
                             <h3 className="text-2xl font-black text-[#3E2723] uppercase leading-none">{culture.name}</h3>
                             <span className="text-xs font-bold uppercase text-[#5D4037] block mt-1">{culture.category}</span>
                             <div className="flex gap-2 mt-2">
                                <span className={`text-[10px] px-2 py-0.5 font-black border border-black ${percent >= 100 ? 'bg-emerald-400 text-black' : 'bg-red-200 text-red-900'}`}>
                                    {real} / {needed} plants
                                </span>
                             </div>
                          </div>
                       </div>
                       <div className="text-right hidden sm:block">
                          <div className="text-[10px] font-bold text-[#5D4037] uppercase mb-1">Arrosage</div>
                          <div className="flex items-center justify-end gap-1">
                             <i className="fa-solid fa-droplet text-blue-500"></i>
                             <span className="font-black text-lg">{water} L<small className="text-[9px]">/sem</small></span>
                          </div>
                       </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#fffdf5]">
                        
                        {/* COLONNE GAUCHE : INFOS TECHNIQUES */}
                        <div className="space-y-4">
                           <div className="grid grid-cols-3 gap-2 text-center">
                              <div className="border-2 border-[#8D6E63] p-2 bg-stone-50">
                                 <span className="block text-[8px] font-black uppercase text-[#8D6E63]">Inter-Plant</span>
                                 <span className="text-lg font-black">{culture.spacingCm.betweenPlants}cm</span>
                              </div>
                              <div className="border-2 border-[#8D6E63] p-2 bg-stone-50">
                                 <span className="block text-[8px] font-black uppercase text-[#8D6E63]">Inter-Rang</span>
                                 <span className="text-lg font-black">{culture.spacingCm.betweenRows}cm</span>
                              </div>
                              <div className="border-2 border-[#8D6E63] p-2 bg-stone-50">
                                 <span className="block text-[8px] font-black uppercase text-[#8D6E63]">Rendement</span>
                                 <span className="text-sm font-black leading-tight block mt-1">{culture.yield.amount} {culture.yield.unit}</span>
                              </div>
                           </div>

                           <div>
                              <h4 className="text-[10px] font-black uppercase bg-[#D7CCC8] inline-block px-1 border border-[#5D4037] mb-1">Entretien</h4>
                              <p className="text-xs text-[#3E2723] font-medium leading-relaxed border-l-2 border-emerald-500 pl-2">
                                 {culture.maintenanceTips}
                              </p>
                           </div>

                           <div>
                              <h4 className="text-[10px] font-black uppercase bg-[#D7CCC8] inline-block px-1 border border-[#5D4037] mb-1">Associations</h4>
                              <p className="text-xs text-[#3E2723] font-medium leading-relaxed">
                                 {culture.associations.length > 0 ? culture.associations.join(', ') : 'Aucune spécifique'}
                              </p>
                           </div>
                           
                           {culture.diseases.length > 0 && (
                               <div>
                                  <h4 className="text-[10px] font-black uppercase bg-red-100 text-red-900 inline-block px-1 border border-red-300 mb-1">Vigilance</h4>
                                  <ul className="text-[10px] list-disc list-inside">
                                     {culture.diseases.map((d, i) => (
                                         <li key={i}><span className="font-bold">{d.name}:</span> {d.solution}</li>
                                     ))}
                                  </ul>
                               </div>
                           )}
                        </div>

                        {/* COLONNE DROITE : CALENDRIER */}
                        <div>
                           <h4 className="text-[10px] font-black uppercase bg-emerald-200 inline-block px-1 border border-emerald-600 mb-2">Planning Annuel</h4>
                           <div className="border-2 border-[#5D4037] bg-white text-[10px]">
                              <div className="grid grid-cols-12 border-b border-[#5D4037] bg-stone-100 font-bold text-center">
                                 {MONTHS_SHORT.map(m => <div key={m} className="py-1 border-r border-[#5D4037] last:border-0">{m}</div>)}
                              </div>
                              {/* Ligne Semis */}
                              <div className="grid grid-cols-12 h-6 border-b border-[#5D4037]">
                                 {Array.from({length: 12}).map((_, i) => (
                                    <div key={i} className={`border-r border-[#5D4037] last:border-0 ${culture.planning.sowing.includes(i+1 as any) ? 'bg-emerald-400' : ''}`}></div>
                                 ))}
                              </div>
                              {/* Ligne Plantation */}
                              <div className="grid grid-cols-12 h-6 border-b border-[#5D4037]">
                                 {Array.from({length: 12}).map((_, i) => (
                                    <div key={i} className={`border-r border-[#5D4037] last:border-0 ${culture.planning.planting.includes(i+1 as any) ? 'bg-yellow-400' : ''}`}></div>
                                 ))}
                              </div>
                              {/* Ligne Récolte */}
                              <div className="grid grid-cols-12 h-6">
                                 {Array.from({length: 12}).map((_, i) => (
                                    <div key={i} className={`border-r border-[#5D4037] last:border-0 ${culture.planning.harvest.includes(i+1 as any) ? 'bg-red-500' : ''}`}></div>
                                 ))}
                              </div>
                           </div>
                           <div className="flex gap-4 mt-2 text-[9px] uppercase font-bold text-[#5D4037]">
                              <span className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-400 border border-black"></div> Semis</span>
                              <span className="flex items-center gap-1"><div className="w-2 h-2 bg-yellow-400 border border-black"></div> Plantation</span>
                              <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 border border-black"></div> Récolte</span>
                           </div>
                        </div>

                    </div>
                  </div>
                );
            })}
        </div>

      </div>
    </div>
  );
};

export default AutosufficiencyTab;
