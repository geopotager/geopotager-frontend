
import React, { useState, useEffect } from 'react';
import { Plot, Culture, GardenConfig, VarietySuggestion, RotationSuggestion } from '../types';
import { CULTURES } from '../constants';
import { getVarietiesForLocation, getNextRotationSuggestions } from '../lib/gemini';

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

  // --- Gestion upload image parcelle ---
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
    
    // Essayer de trouver une correspondance dans nos constantes
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

  return (
    <div className="h-full flex flex-col bg-white border-l border-stone-200 shadow-2xl animate-in slide-in-from-right duration-500 w-full md:w-[450px] max-w-full print:hidden">
      <div className="p-6 md:p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
        <div>
          <input 
            type="text" value={plot.name}
            onChange={(e) => onUpdate({...plot, name: e.target.value})}
            className="text-xl font-black text-stone-900 tracking-tighter uppercase bg-transparent outline-none border-b-2 border-transparent focus:border-emerald-500 transition-all w-full"
          />
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Configuration d'Élément</p>
        </div>
        <div className="flex items-center gap-2 ml-4">
            <button onClick={() => onDelete(plot.id)} className="w-10 h-10 rounded-full flex items-center justify-center bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all shrink-0">
            <i className="fa-solid fa-trash"></i>
            </button>
            <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center bg-stone-100 text-stone-500 hover:bg-stone-200 transition-all shrink-0">
            <i className="fa-solid fa-xmark"></i>
            </button>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8 overflow-y-auto flex-1">
        {/* Type & Forme */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Type & Apparence</h3>
          <div className="grid grid-cols-2 gap-4">
            <select 
              value={plot.type}
              onChange={(e) => onUpdate({...plot, type: e.target.value as any})}
              className="bg-stone-100 border border-stone-200 rounded-xl px-4 py-2 text-xs font-black outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="culture">Zone de Culture</option>
              <option value="building">Bâtiment / Abri</option>
              <option value="tree">Arbre / Arbuste</option>
              <option value="pond">Point d'Eau</option>
              <option value="water_tank">Citerne Pluie</option>
            </select>
            <select 
              value={plot.shape}
              onChange={(e) => onUpdate({...plot, shape: e.target.value as any})}
              className="bg-stone-100 border border-stone-200 rounded-xl px-4 py-2 text-xs font-black outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="rect">Rectangle</option>
              <option value="circle">Cercle / Arrondi</option>
            </select>
          </div>

          {/* Dimensions & Rotation Sliders */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-100 space-y-4">
             <div className="space-y-1">
               <div className="flex justify-between text-[9px] font-bold uppercase text-stone-400">
                 <span>Largeur (m)</span>
                 <span>{plot.width}m</span>
               </div>
               <input 
                 type="range" min="0.5" max={config.terrainWidth} step="0.1"
                 value={plot.width}
                 onChange={(e) => onUpdate({...plot, width: parseFloat(e.target.value)})}
                 className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
               />
             </div>
             <div className="space-y-1">
               <div className="flex justify-between text-[9px] font-bold uppercase text-stone-400">
                 <span>Hauteur (m)</span>
                 <span>{plot.height}m</span>
               </div>
               <input 
                 type="range" min="0.5" max={config.terrainHeight} step="0.1"
                 value={plot.height}
                 onChange={(e) => onUpdate({...plot, height: parseFloat(e.target.value)})}
                 className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
               />
             </div>
             <div className="space-y-1">
               <div className="flex justify-between text-[9px] font-bold uppercase text-stone-400">
                 <span>Rotation (°)</span>
                 <span>{plot.rotation || 0}°</span>
               </div>
               <input 
                 type="range" min="0" max="360" step="5"
                 value={plot.rotation || 0}
                 onChange={(e) => onUpdate({...plot, rotation: parseInt(e.target.value)})}
                 className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
               />
             </div>
             <div className="flex gap-4">
                <div className="flex-1 space-y-1">
                    <label className="text-[9px] font-bold uppercase text-stone-400 block">Couleur</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={plot.color || '#ffffff'}
                        onChange={(e) => onUpdate({...plot, color: e.target.value})}
                        className="w-8 h-8 rounded border border-stone-200 cursor-pointer"
                      />
                      <button onClick={() => onUpdate({...plot, color: undefined})} className="text-[9px] text-stone-400 underline">Reset</button>
                    </div>
                </div>
                <div className="flex-1 space-y-1">
                   <label className="text-[9px] font-bold uppercase text-stone-400 block flex justify-between">
                     <span>Opacité</span>
                     <span>{Math.round((plot.opacity ?? 1) * 100)}%</span>
                   </label>
                   <input 
                     type="range" min="0.1" max="1" step="0.1"
                     value={plot.opacity ?? 1}
                     onChange={(e) => onUpdate({...plot, opacity: parseFloat(e.target.value)})}
                     className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                   />
                </div>
             </div>
          </div>
          
          {/* Photo Perso */}
          <div>
            <label className="text-[9px] font-bold text-stone-400 uppercase mb-1 block">Photo de la parcelle</label>
            <div className="flex gap-2">
                <input 
                  type="text" 
                  value={plot.customImage || ''}
                  onChange={(e) => onUpdate({...plot, customImage: e.target.value})}
                  placeholder="https://..."
                  className="flex-1 bg-stone-100 border border-stone-200 rounded-xl px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <label className="bg-stone-200 hover:bg-stone-300 text-stone-600 w-10 rounded-xl cursor-pointer flex items-center justify-center transition-colors" title="Choisir un fichier">
                   <i className="fa-solid fa-folder-open"></i>
                   <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
            </div>
            {plot.customImage && (
              <div className="mt-2 h-24 w-full rounded-xl overflow-hidden border border-stone-200 relative group">
                <img src={plot.customImage} className="w-full h-full object-cover" />
                <button 
                  onClick={() => onUpdate({...plot, customImage: undefined})}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
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
            <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Choix du Légume</h3>
            <select 
              value={plot.plantedCultureId || ''}
              onChange={(e) => onUpdate({...plot, plantedCultureId: e.target.value})}
              className="w-full bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 text-sm font-black text-emerald-900 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer appearance-none shadow-sm"
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
            <section className="bg-emerald-900 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Capacité de Production</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black">{capacity}</span>
                  <span className="text-xs font-bold opacity-60 uppercase tracking-wider">plants logeables</span>
                </div>
                
                <div className="mt-6 p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <div className="flex justify-between text-[9px] font-bold mb-2">
                    <span className="opacity-70 uppercase">COUVERTURE BESOIN ({config.sufficiencyTarget}%)</span>
                    <span className="text-emerald-300">{Math.round(coverage)}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 transition-all duration-1000" style={{ width: `${Math.min(100, coverage)}%` }}></div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 text-[9px] font-black opacity-80 border-t border-white/10 pt-4">
                  <div>
                    <span className="block opacity-50 mb-1">INTER-PLANT</span>
                    <span className="text-emerald-300 text-sm">{culture.spacingCm.betweenPlants} cm</span>
                  </div>
                  <div>
                    <span className="block opacity-50 mb-1">INTER-RANG</span>
                    <span className="text-emerald-300 text-sm">{culture.spacingCm.betweenRows} cm</span>
                  </div>
                </div>
              </div>
              <i className="fa-solid fa-leaf absolute -right-6 -bottom-6 text-[120px] opacity-10"></i>
            </section>

             {/* Rotation Suggestions Statique */}
             <section className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
               <h3 className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <i className="fa-solid fa-arrow-rotate-right text-emerald-500"></i>
                 Familles Complémentaires
               </h3>
               {suggestedRotations.length > 0 ? (
                 <div className="flex flex-wrap gap-2">
                   {suggestedRotations.slice(0, 5).map(rot => (
                     <div key={rot.id} className="flex items-center gap-2 bg-white border border-stone-200 rounded-lg p-2 pr-3 shadow-sm hover:border-emerald-300 transition-colors cursor-pointer" onClick={() => onUpdate({...plot, plantedCultureId: rot.id})}>
                       <img src={rot.image} className="w-8 h-8 rounded-full object-cover" />
                       <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-stone-800 leading-tight">{rot.name}</span>
                          <span className="text-[8px] text-stone-400 uppercase">{rot.category}</span>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <p className="text-xs text-stone-400 italic">Aucune suggestion spécifique de rotation.</p>
               )}
               <p className="mt-3 text-[9px] text-stone-400 leading-tight">
                 Basé sur la famille <span className="font-bold text-stone-600">{culture.category}</span>.
               </p>
             </section>

             {/* Rotation Future via IA */}
             <section className="bg-blue-50 border border-blue-100 rounded-[2rem] p-6 space-y-4">
               <div className="flex items-center justify-between">
                 <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Planifier la Suite (IA)</h3>
                 <i className="fa-solid fa-calendar-check text-blue-400"></i>
               </div>
               
               {isLoadingRotation ? (
                 <div className="flex flex-col items-center py-4 gap-2 opacity-40">
                   <i className="fa-solid fa-circle-notch fa-spin text-blue-500"></i>
                   <span className="text-[9px] font-bold uppercase tracking-widest">Analyse saisonnière...</span>
                 </div>
               ) : nextRotations.length > 0 ? (
                 <div className="space-y-3">
                   {nextRotations.map((suggestion, idx) => (
                     <div key={idx} className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all group">
                       <div className="flex justify-between items-start mb-2">
                         <span className="font-bold text-stone-800">{suggestion.cultureName}</span>
                         <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{suggestion.timing}</span>
                       </div>
                       <p className="text-[10px] text-stone-500 leading-tight mb-3">{suggestion.reason}</p>
                       <button 
                        onClick={() => handleAddRotationPlot(suggestion.cultureName)}
                        className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                       >
                         <i className="fa-solid fa-plus"></i> CRÉER PARCELLE SUIVANTE
                       </button>
                     </div>
                   ))}
                   <p className="text-[8px] text-stone-400 italic text-center">Suggestions basées sur la rotation des cultures et votre climat local.</p>
                 </div>
               ) : (
                 <p className="text-[9px] text-stone-400 italic">Aucune suggestion disponible pour le moment.</p>
               )}
             </section>

            {/* Suggestions Variétés IA Localisées */}
            <section className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Conseils Variétés (IA)</h3>
                <i className="fa-solid fa-wand-magic-sparkles text-amber-400"></i>
              </div>
              
              {isLoadingVarieties ? (
                <div className="flex flex-col items-center py-4 gap-2 opacity-40">
                  <i className="fa-solid fa-circle-notch fa-spin text-amber-500"></i>
                  <span className="text-[9px] font-bold uppercase tracking-widest">Analyse climat local...</span>
                </div>
              ) : smartVarieties.length > 0 ? (
                <div className="space-y-3">
                   {smartVarieties.map((v, i) => (
                       <div key={i} className="text-[11px] leading-relaxed text-stone-600">
                           <strong className="font-bold text-stone-800">{v.name}:</strong>
                           <span className="italic ml-1">{v.description}</span>
                       </div>
                   ))}
                </div>
              ) : (
                <p className="text-[9px] text-stone-400 italic">Renseignez une adresse pour obtenir des conseils variétaux personnalisés.</p>
              )}
            </section>
          </div>
        )}

        {/* Autres types */}
        {plot.type !== 'culture' && (
          <div className="bg-stone-50 p-6 rounded-[2rem] border border-stone-200 text-center">
            <i className={`fa-solid ${plot.type === 'tree' ? 'fa-tree text-emerald-600' : plot.type === 'building' ? 'fa-house text-stone-600' : plot.type === 'water_tank' ? 'fa-faucet-drip text-cyan-500' : 'fa-water text-blue-500'} text-4xl mb-4`}></i>
            <p className="text-xs text-stone-500 leading-relaxed">
              Les éléments de structure comme les {plot.type === 'tree' ? 'arbres' : plot.type === 'building' ? 'bâtiments' : plot.type === 'water_tank' ? 'réserves d\'eau' : 'étangs'} impactent l'ensoleillement et le micro-climat de votre potager.
            </p>
          </div>
        )}
      </div>

       {/* Bouton de Validation / Ajout */}
       <div className="p-6 border-t border-stone-100 bg-stone-50">
          <button 
            onClick={() => {/* L'update est réactif, on peut fermer via un prop si besoin, ici on simule l'ajout confirmé */ onClose(); if(onAddPlot) onAddPlot(plot); }}
            className="w-full bg-stone-800 hover:bg-stone-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-check"></i>
            Valider / Ajouter au Plan
          </button>
       </div>
    </div>
  );
};

export default PlotEditor;
