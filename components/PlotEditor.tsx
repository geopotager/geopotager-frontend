
import React, { useState, useEffect } from 'react';
import { Plot, Culture, GardenConfig, VarietySuggestion, RotationSuggestion } from '../types';
import { CULTURES } from '../constants';
import { getVarietiesForLocation, getNextRotationSuggestions, getClimate } from '../lib/gemini';
import { CLIMATE_ADJUSTMENTS } from '../mockData';

interface PlotEditorProps {
  plot: Plot;
  config: GardenConfig;
  onUpdate: (plot: Plot) => void;
  onDelete: (id: string) => void;
  onAddPlot?: (plot: Plot) => void;
  onClose: () => void;
}

const PlotEditor: React.FC<PlotEditorProps> = ({ plot, config, onUpdate, onDelete, onAddPlot, onClose }) => {
  const [smartVarieties, setSmartVarieties] = useState<VarietySuggestion[]>([]);
  const [nextRotations, setNextRotations] = useState<RotationSuggestion[]>([]);
  const [isLoadingVarieties, setIsLoadingVarieties] = useState(false);
  const [isLoadingRotation, setIsLoadingRotation] = useState(false);
  
  const culture = CULTURES.find(c => c.id === plot.plantedCultureId);
  const targetForSufficiency = culture ? Math.ceil(culture.plantsPerPerson * config.peopleCount * (config.sufficiencyTarget / 100)) : 0;
  
  const calculateCapacity = () => {
    if (!culture || plot.type !== 'culture') return 0;
    const rows = Math.floor((plot.height * 100) / culture.spacingCm.betweenRows);
    const plantsPerRow = Math.floor((plot.width * 100) / culture.spacingCm.betweenPlants);
    return Math.max(0, rows * plantsPerRow);
  };

  const capacity = calculateCapacity();
  const coverage = targetForSufficiency > 0 ? (capacity / targetForSufficiency) * 100 : 0;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
           onUpdate({...plot, customImage: event.target.result as string});
        }
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (culture && config.address) {
      handleFetchSmartVarieties();
      handleFetchNextRotations();
    } else {
      setSmartVarieties([]);
      setNextRotations([]);
    }
  }, [plot.plantedCultureId, config.address]);

  const handleFetchSmartVarieties = async () => {
    if (!culture || !config.address) return;
    setIsLoadingVarieties(true);
    try {
      const result = await getVarietiesForLocation(culture.name, config.address);
      if(Array.isArray(result)) {
        setSmartVarieties(result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingVarieties(false);
    }
  };

  const handleFetchNextRotations = async () => {
    if (!culture || !config.address) return;
    setIsLoadingRotation(true);
    try {
      const result = await getNextRotationSuggestions(culture.name, config.address);
      setNextRotations(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingRotation(false);
    }
  };

  const handleAddRotationPlot = (suggestionName: string) => {
    if (!onAddPlot) return;
    const matchedCulture = CULTURES.find(c => 
      c.name.toLowerCase().includes(suggestionName.toLowerCase()) || 
      suggestionName.toLowerCase().includes(c.name.toLowerCase())
    );

    const newPlot: Plot = {
      id: Math.random().toString(36).substr(2, 9),
      name: matchedCulture ? matchedCulture.name : suggestionName,
      type: 'culture',
      shape: 'rect',
      x: plot.x + 2 > config.terrainWidth ? 1 : plot.x + 2,
      y: plot.y,
      width: 2,
      height: 1.2,
      rotation: 0,
      exposure: 'Soleil',
      plantedCultureId: matchedCulture?.id
    };

    onAddPlot(newPlot);
  };

  const suggestedRotations = culture ? CULTURES.filter(c => culture.rotations.includes(c.category)) : [];

  // Weekly watering calc with Climate Adjustment
  const getWeeklyWatering = () => {
      if(!culture) return 0;
      let multiplier = 1;
      if(culture.watering.frequency.includes('2x')) multiplier = 2;
      if(culture.watering.frequency.includes('10 jours')) multiplier = 0.7;
      if(culture.watering.frequency.includes('2 semaines')) multiplier = 0.5;
      if(culture.watering.frequency.includes('mois')) multiplier = 0.25;
      
      // Ajustement climatique
      const climateKey = getClimate(config.address || '');
      const climateAdj = CLIMATE_ADJUSTMENTS[climateKey] || { waterMultiplier: 1.0 };
      
      return Math.round(capacity * culture.watering.volumePerPlant * multiplier * climateAdj.waterMultiplier);
  };

  const climateInfo = config.address ? CLIMATE_ADJUSTMENTS[getClimate(config.address)] : null;

  return (
    <div className="h-full flex flex-col bg-[#fffdf5] border-l-4 border-stone-900 shadow-2xl animate-in slide-in-from-right duration-500 w-full md:w-[450px] max-w-full print:hidden">
      <div className="p-6 md:p-8 border-b-2 border-stone-900 flex justify-between items-center bg-white">
        <div className="w-full">
          <input 
            type="text" value={plot.name}
            onChange={(e) => onUpdate({...plot, name: e.target.value})}
            className="text-xl font-black text-stone-900 tracking-tighter uppercase bg-transparent outline-none border-b-2 border-stone-900 focus:bg-yellow-50 transition-all w-full"
          />
          <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest mt-1">Configuration</p>
        </div>
        <div className="flex items-center gap-2 ml-4">
            <button onClick={() => onDelete(plot.id)} className="w-10 h-10 border-2 border-stone-900 flex items-center justify-center bg-red-100 text-stone-900 hover:bg-red-500 hover:text-white transition-all shrink-0 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]">
            <i className="fa-solid fa-trash"></i>
            </button>
            <button onClick={onClose} className="w-10 h-10 border-2 border-stone-900 flex items-center justify-center bg-white text-stone-900 hover:bg-stone-200 transition-all shrink-0 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]">
            <i className="fa-solid fa-xmark"></i>
            </button>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8 overflow-y-auto flex-1">
        {/* Type & Forme */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-stone-900 uppercase tracking-widest bg-yellow-300 inline-block px-1 border border-stone-900">Type & Apparence</h3>
          <div className="grid grid-cols-2 gap-4">
            <select 
              value={plot.type}
              onChange={(e) => onUpdate({...plot, type: e.target.value as any})}
              className="bg-white border-2 border-stone-900 rounded-none px-4 py-2 text-xs font-black outline-none focus:bg-yellow-50 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]"
            >
              <option value="culture">Zone de Culture</option>
              <option value="greenhouse">Serre</option>
              <option value="coop">Poulailler</option>
              <option value="beehive">Ruche</option>
              <option value="path">Allée / Passage</option>
              <option value="building">Bâtiment / Abri</option>
              <option value="tree">Arbre / Arbuste</option>
              <option value="pond">Point d'Eau</option>
              <option value="water_tank">Citerne Pluie</option>
            </select>
            <select 
              value={plot.shape}
              onChange={(e) => onUpdate({...plot, shape: e.target.value as any})}
              className="bg-white border-2 border-stone-900 rounded-none px-4 py-2 text-xs font-black outline-none focus:bg-yellow-50 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]"
            >
              <option value="rect">Rectangle</option>
              <option value="circle">Cercle / Arrondi</option>
            </select>
          </div>

          {/* Configuration Spécifique Poulailler */}
          {plot.type === 'coop' && (
             <div className="bg-amber-100 border-2 border-stone-900 p-4 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] space-y-3">
                <h4 className="text-xs font-black text-stone-900 uppercase flex items-center gap-2">
                   <i className="fa-solid fa-egg text-amber-600"></i> Nombre de Poules
                </h4>
                <div className="flex items-center gap-4">
                   <input 
                     type="range" min="1" max="12" step="1"
                     value={plot.chickenCount || 2}
                     onChange={(e) => onUpdate({...plot, chickenCount: parseInt(e.target.value)})}
                     className="flex-1 accent-amber-600 h-2 bg-white border border-stone-900 rounded-lg appearance-none"
                   />
                   <span className="text-2xl font-black text-stone-900 w-12 text-center bg-white border-2 border-stone-900">{plot.chickenCount || 2}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-stone-600 leading-tight pt-2 border-t border-amber-200">
                   <span>Production estimée :</span>
                   <span className="font-black text-stone-900 text-sm">{Math.round((plot.chickenCount || 2) * 250 / 52)} oeufs / semaine</span>
                </div>
             </div>
          )}

          {/* Configuration Spécifique Serre */}
          {plot.type === 'greenhouse' && (
             <div className="bg-cyan-100 border-2 border-stone-900 p-4 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] space-y-3">
                <h4 className="text-xs font-black text-stone-900 uppercase flex items-center gap-2">
                   <i className="fa-solid fa-house-chimney-window text-cyan-600"></i> Aménagement Intérieur
                </h4>
                <p className="text-[10px] text-stone-600 leading-tight mb-2">
                   Cliquez sur "Valider" puis utilisez le bouton "ENTRER" sur le plan pour aménager l'intérieur de la serre.
                </p>
             </div>
          )}

          {/* Dimensions & Rotation Sliders */}
          <div className="bg-white border-2 border-stone-900 p-4 space-y-4 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
             <div className="space-y-1">
               <div className="flex justify-between text-[10px] font-black uppercase text-stone-900">
                 <span>Largeur (m)</span>
                 <span>{plot.width}m</span>
               </div>
               <input 
                 type="range" min="0.5" max={config.terrainWidth} step="0.1"
                 value={plot.width}
                 onChange={(e) => onUpdate({...plot, width: parseFloat(e.target.value)})}
                 className="w-full h-2 bg-stone-200 border border-stone-900 appearance-none cursor-pointer accent-stone-900"
               />
             </div>
             <div className="space-y-1">
               <div className="flex justify-between text-[10px] font-black uppercase text-stone-900">
                 <span>Hauteur (m)</span>
                 <span>{plot.height}m</span>
               </div>
               <input 
                 type="range" min="0.5" max={config.terrainHeight} step="0.1"
                 value={plot.height}
                 onChange={(e) => onUpdate({...plot, height: parseFloat(e.target.value)})}
                 className="w-full h-2 bg-stone-200 border border-stone-900 appearance-none cursor-pointer accent-stone-900"
               />
             </div>
             <div className="space-y-1">
               <div className="flex justify-between text-[10px] font-black uppercase text-stone-900">
                 <span>Rotation (°)</span>
                 <span>{plot.rotation || 0}°</span>
               </div>
               <input 
                 type="range" min="0" max="360" step="5"
                 value={plot.rotation || 0}
                 onChange={(e) => onUpdate({...plot, rotation: parseInt(e.target.value)})}
                 className="w-full h-2 bg-stone-200 border border-stone-900 appearance-none cursor-pointer accent-stone-900"
               />
             </div>
             
             {/* Couleur & Opacité */}
             <div className="flex gap-4 pt-2 border-t-2 border-stone-900">
                <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-black uppercase text-stone-900 block">Couleur</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={plot.color || '#ffffff'}
                        onChange={(e) => onUpdate({...plot, color: e.target.value})}
                        className="w-10 h-10 border-2 border-stone-900 cursor-pointer p-0"
                      />
                      <button onClick={() => onUpdate({...plot, color: undefined})} className="text-[10px] font-bold text-stone-500 hover:text-stone-900 underline uppercase">Reset</button>
                    </div>
                </div>
                <div className="flex-1 space-y-1">
                   <label className="text-[10px] font-black uppercase text-stone-900 block flex justify-between">
                     <span>Opacité</span>
                     <span>{Math.round((plot.opacity ?? 1) * 100)}%</span>
                   </label>
                   <input 
                     type="range" min="0.1" max="1" step="0.1"
                     value={plot.opacity ?? 1}
                     onChange={(e) => onUpdate({...plot, opacity: parseFloat(e.target.value)})}
                     className="w-full h-2 bg-stone-200 border border-stone-900 appearance-none cursor-pointer accent-stone-900"
                   />
                </div>
             </div>
          </div>
          
          {/* Photo Perso */}
          <div>
            <label className="text-[10px] font-black text-stone-900 uppercase mb-1 block">Photo de la parcelle</label>
            <div className="flex gap-2">
                <input 
                  type="text" 
                  value={plot.customImage || ''}
                  onChange={(e) => onUpdate({...plot, customImage: e.target.value})}
                  placeholder="https://..."
                  className="flex-1 bg-white border-2 border-stone-900 px-4 py-2 text-xs outline-none focus:bg-yellow-50"
                />
                <label className="bg-stone-200 border-2 border-stone-900 hover:bg-stone-300 text-stone-900 w-10 cursor-pointer flex items-center justify-center transition-colors" title="Choisir un fichier">
                   <i className="fa-solid fa-folder-open"></i>
                   <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
            </div>
            {plot.customImage && (
              <div className="mt-2 h-24 w-full border-2 border-stone-900 relative group bg-stone-100">
                <img src={plot.customImage} className="w-full h-full object-cover" />
                <button 
                  onClick={() => onUpdate({...plot, customImage: undefined})}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 border-2 border-stone-900 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Attribution de Culture */}
        {plot.type === 'culture' && (
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-stone-900 uppercase tracking-widest bg-emerald-300 inline-block px-1 border border-stone-900">Choix du Légume</h3>
            <select 
              value={plot.plantedCultureId || ''}
              onChange={(e) => onUpdate({...plot, plantedCultureId: e.target.value})}
              className="w-full bg-emerald-50 border-2 border-stone-900 px-5 py-4 text-sm font-black text-stone-900 focus:bg-emerald-100 outline-none cursor-pointer appearance-none shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] hover:translate-x-[-1px] hover:translate-y-[-1px]"
            >
              <option value="">-- Sélectionner --</option>
              {CULTURES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </section>
        )}

        {/* Analyse Production & Variétés IA */}
        {plot.type === 'culture' && culture && (
          <div className="space-y-6">
            <section className="bg-stone-900 text-emerald-400 p-6 shadow-[8px_8px_0px_0px_#10b981] relative overflow-hidden border-2 border-stone-900">
              <div className="relative z-10">
                <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Capacité de Production</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white">{capacity}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">plants logeables</span>
                </div>
                
                <div className="mt-6 p-4 bg-white/10 border-2 border-white/20 backdrop-blur-sm">
                  <div className="flex justify-between text-[9px] font-bold mb-2">
                    <span className="opacity-70 uppercase text-white">COUVERTURE BESOIN ({config.sufficiencyTarget}%)</span>
                    <span className="text-yellow-300">{Math.round(coverage)}%</span>
                  </div>
                  <div className="h-3 w-full bg-stone-800 border border-stone-600">
                    <div className="h-full bg-yellow-400 transition-all duration-1000" style={{ width: `${Math.min(100, coverage)}%` }}></div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 text-[9px] font-black opacity-80 border-t border-white/20 pt-4">
                  <div>
                    <span className="block opacity-50 mb-1 text-white">ARROSAGE ({climateInfo ? 'AJUSTÉ' : 'ESTIMÉ'})</span>
                    <span className="text-blue-300 text-sm font-bold flex items-center gap-1">
                       <i className="fa-solid fa-droplet"></i>
                       {getWeeklyWatering()} L / semaine
                    </span>
                  </div>
                  <div>
                    <span className="block opacity-50 mb-1 text-white">INTER-RANG</span>
                    <span className="text-emerald-300 text-sm">{culture.spacingCm.betweenRows} cm</span>
                  </div>
                </div>
              </div>
            </section>

             {/* Rotation Suggestions Statique */}
             <section className="bg-white border-2 border-stone-900 p-6 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
               <h3 className="text-[10px] font-black text-stone-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <i className="fa-solid fa-arrow-rotate-right text-emerald-600"></i>
                 Familles Complémentaires
               </h3>
               {suggestedRotations.length > 0 ? (
                 <div className="flex flex-wrap gap-2">
                   {suggestedRotations.slice(0, 5).map(rot => (
                     <div key={rot.id} className="flex items-center gap-2 bg-stone-50 border-2 border-stone-900 p-2 pr-3 hover:bg-emerald-100 transition-colors cursor-pointer" onClick={() => onUpdate({...plot, plantedCultureId: rot.id})}>
                       <img src={rot.image} className="w-6 h-6 object-cover border border-stone-900" />
                       <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-stone-900 leading-tight uppercase">{rot.name}</span>
                          <span className="text-[8px] text-stone-500 uppercase">{rot.category}</span>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <p className="text-xs text-stone-400 italic">Aucune suggestion spécifique de rotation.</p>
               )}
             </section>

             {/* Rotation Future via Local DB */}
             <section className="bg-blue-100 border-2 border-stone-900 p-6 space-y-4">
               <div className="flex items-center justify-between">
                 <h3 className="text-[10px] font-black text-stone-900 uppercase tracking-widest">Planifier la Suite (Expert)</h3>
                 <i className="fa-solid fa-calendar-check text-stone-900"></i>
               </div>
               
               {isLoadingRotation ? (
                 <div className="flex flex-col items-center py-4 gap-2 opacity-40">
                   <i className="fa-solid fa-circle-notch fa-spin text-stone-900"></i>
                   <span className="text-[9px] font-bold uppercase tracking-widest">Recherche...</span>
                 </div>
               ) : nextRotations.length > 0 ? (
                 <div className="space-y-3">
                   {nextRotations.map((suggestion, idx) => (
                     <div key={idx} className="bg-white p-3 border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all group">
                       <div className="flex justify-between items-start mb-2">
                         <span className="font-black text-stone-900 uppercase">{suggestion.cultureName}</span>
                         <span className="text-[9px] bg-blue-300 border border-stone-900 text-stone-900 px-2 py-0.5 font-bold">{suggestion.timing}</span>
                       </div>
                       <p className="text-[10px] text-stone-600 leading-tight mb-3 font-medium">{suggestion.reason}</p>
                       <button 
                        onClick={() => handleAddRotationPlot(suggestion.cultureName)}
                        className="w-full py-2 bg-stone-900 hover:bg-stone-700 text-white text-[10px] font-bold transition-colors flex items-center justify-center gap-2 uppercase tracking-wide"
                       >
                         <i className="fa-solid fa-plus"></i> CRÉER PARCELLE SUIVANTE
                       </button>
                     </div>
                   ))}
                 </div>
               ) : (
                 <p className="text-[9px] text-stone-500 italic">Aucune suggestion disponible pour le moment.</p>
               )}
             </section>

            {/* Suggestions Variétés Localisées */}
            <section className="bg-amber-100 border-2 border-stone-900 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-stone-900 uppercase tracking-widest">Variétés Adaptées ({config.address ? getClimate(config.address) : 'Standard'})</h3>
                <i className="fa-solid fa-seedling text-stone-900"></i>
              </div>
              
              {isLoadingVarieties ? (
                <div className="flex flex-col items-center py-4 gap-2 opacity-40">
                  <i className="fa-solid fa-circle-notch fa-spin text-stone-900"></i>
                  <span className="text-[9px] font-bold uppercase tracking-widest">Recherche locale...</span>
                </div>
              ) : smartVarieties.length > 0 ? (
                <div className="space-y-3">
                   {smartVarieties.map((v, i) => (
                       <div key={i} className="text-[11px] leading-relaxed text-stone-800 bg-white p-2 border border-stone-900">
                           <strong className="font-black text-stone-900 uppercase block mb-1">{v.name}</strong>
                           <span className="font-medium">{v.description}</span>
                       </div>
                   ))}
                </div>
              ) : (
                <p className="text-[9px] text-stone-500 italic">Renseignez une adresse pour obtenir des conseils variétaux personnalisés.</p>
              )}
            </section>
          </div>
        )}

        {/* Autres types */}
        {['building','tree','pond','water_tank','beehive','path'].includes(plot.type) && (
          <div className="bg-stone-100 p-6 border-2 border-stone-900 text-center shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
            <i className={`fa-solid ${plot.type === 'tree' ? 'fa-tree text-emerald-600' : plot.type === 'beehive' ? 'fa-bug text-yellow-600' : 'fa-cubes text-stone-600'} text-4xl mb-4 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]`}></i>
            <p className="text-xs font-bold text-stone-600 leading-relaxed">
              {plot.type === 'beehive' ? "Les abeilles pollinisent vos cultures et augmentent le rendement de 20-30%." : "Élément structurel important pour l'organisation du jardin."}
            </p>
          </div>
        )}
      </div>

       {/* Bouton de Validation / Ajout */}
       <div className="p-6 border-t-2 border-stone-900 bg-white">
          <button 
            onClick={() => { onClose(); if(onAddPlot) onAddPlot(plot); }}
            className="w-full bg-emerald-500 border-2 border-stone-900 text-stone-900 py-4 font-black uppercase tracking-widest text-xs shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-check"></i>
            Valider / Ajouter
          </button>
       </div>
    </div>
  );
};

export default PlotEditor;
