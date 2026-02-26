
import React, { useState, useRef } from 'react';
import { GardenConfig } from '../types';
import { geocodeAddress } from '../lib/gemini';

interface SetupPanelProps {
  config: GardenConfig;
  onConfigChange: (config: GardenConfig) => void;
  onAutoGenerate: () => void;
  isAnalyzing: boolean;
  isCalibrating: boolean;
  onToggleCalibration: () => void;
  showSunPath: boolean;
  onToggleSunPath: () => void;
  onAddPlot: () => void;
  sufficiencyScore?: number;
}

const SetupPanel: React.FC<SetupPanelProps> = ({ 
  config, 
  onConfigChange, 
  onAutoGenerate, 
  isAnalyzing,
  isCalibrating,
  onToggleCalibration,
  showSunPath,
  onToggleSunPath,
  onAddPlot,
  sufficiencyScore = 0
}) => {
  const [addressInput, setAddressInput] = useState(config.address || '');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const gaugeRef = useRef<HTMLDivElement>(null);

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressInput) return;
    setIsGeocoding(true);
    try {
      const coords = await geocodeAddress(addressInput);
      if (coords) onConfigChange({ ...config, address: addressInput, lat: coords.lat, lng: coords.lng });
    } catch (error) { console.error("Geocoding failed", error); } finally { setIsGeocoding(false); }
  };

  const handleGaugeClick = (e: React.MouseEvent) => {
    if (!gaugeRef.current) return;
    const rect = gaugeRef.current.getBoundingClientRect();
    const pos = 1 - (e.clientY - rect.top) / rect.height;
    const val = Math.min(100, Math.max(0, Math.round(pos * 20) * 5));
    onConfigChange({ ...config, sufficiencyTarget: val });
  };

  return (
    <div className="w-full bg-white border-b-4 border-black p-2 flex flex-col xl:flex-row gap-3 items-start xl:items-stretch shadow-[0px_4px_0px_rgba(0,0,0,0.1)] z-40 relative print:hidden">
      
      {/* BLOC 1 : IDENTITÉ DU JARDIN (Jaune) */}
      <div className="flex-1 flex flex-col md:flex-row gap-3 w-full">
        <div className="bg-yellow-300 border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-2 flex flex-col gap-1 min-w-[180px]">
           <div className="bg-black text-yellow-300 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest inline-block self-start">DIMENSIONS</div>
           <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 relative">
                 <span className="absolute top-0.5 left-1 text-[8px] font-bold text-black/50">LARG.</span>
                 <input 
                    type="number" 
                    value={config.terrainWidth} 
                    onChange={(e) => onConfigChange({...config, terrainWidth: parseInt(e.target.value)})} 
                    className="w-full bg-white border-2 border-black h-8 px-2 pt-3 text-base font-black outline-none focus:bg-yellow-50"
                 />
                 <span className="absolute bottom-1 right-1 text-[9px] font-black">m</span>
              </div>
              <span className="font-black text-lg">×</span>
              <div className="flex-1 relative">
                 <span className="absolute top-0.5 left-1 text-[8px] font-bold text-black/50">LONG.</span>
                 <input 
                    type="number" 
                    value={config.terrainHeight} 
                    onChange={(e) => onConfigChange({...config, terrainHeight: parseInt(e.target.value)})} 
                    className="w-full bg-white border-2 border-black h-8 px-2 pt-3 text-base font-black outline-none focus:bg-yellow-50"
                 />
                 <span className="absolute bottom-1 right-1 text-[9px] font-black">m</span>
              </div>
           </div>
        </div>

        <div className="bg-white border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-2 flex flex-col gap-2 flex-1 min-w-[220px]">
           <div className="flex justify-between items-center">
              <div className="bg-black text-white px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest">CONTEXTE</div>
              <div className="flex bg-stone-100 border-2 border-black h-6">
                {[1, 2, 3, 4].map(num => (
                    <button
                        key={num}
                        onClick={() => onConfigChange({ ...config, peopleCount: num as any })}
                        className={`px-2 text-[10px] font-black transition-all border-r-2 border-black last:border-r-0 flex items-center justify-center ${config.peopleCount === num ? 'bg-black text-white' : 'text-black hover:bg-stone-300'}`}
                        title={`${num} personne(s)`}
                    >
                        {num}{num === 4 ? '+' : ''}
                    </button>
                ))}
            </div>
           </div>
           <form onSubmit={handleAddressSubmit} className="relative w-full">
              <input 
                  type="text" 
                  value={addressInput} 
                  onChange={(e) => setAddressInput(e.target.value)} 
                  placeholder="Localisation..." 
                  className="w-full h-8 bg-stone-50 border-2 border-black pl-2 pr-8 text-xs font-bold uppercase focus:bg-yellow-50 outline-none placeholder-gray-400" 
              />
              <button type="submit" className="absolute top-0 right-0 h-8 w-8 flex items-center justify-center border-l-2 border-black hover:bg-stone-200">
                  <i className={`fa-solid ${isGeocoding ? 'fa-spinner fa-spin' : 'fa-magnifying-glass'} text-xs`}></i>
              </button>
           </form>
        </div>
      </div>

      {/* BLOC 2 : OUTILS & COMMANDES (Cyan) */}
      <div className="bg-cyan-300 border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-2 flex gap-2 items-center shrink-0">
          <div className="flex flex-col gap-1.5">
             <button 
               onClick={onAddPlot} 
               className="h-8 px-3 bg-white border-2 border-black font-black uppercase text-[10px] flex items-center gap-2 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none shadow-[2px_2px_0px_0px_black] transition-all"
             >
                <i className="fa-solid fa-plus-circle text-base text-emerald-600"></i> Ajouter
             </button>
             <button 
               onClick={onAutoGenerate} 
               disabled={isAnalyzing}
               className={`h-8 px-3 border-2 border-black font-black uppercase text-[10px] flex items-center gap-2 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none shadow-[2px_2px_0px_0px_black] transition-all ${isAnalyzing ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-purple-400 text-black'}`}
             >
                <i className={`fa-solid ${isAnalyzing ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
                {isAnalyzing ? 'Calcul...' : 'Auto-Plan'}
             </button>
          </div>
          <div className="w-0.5 h-full bg-black/20 mx-1"></div>
          <div className="grid grid-cols-2 gap-1.5">
             <button onClick={onToggleSunPath} className={`w-9 h-9 border-2 border-black flex items-center justify-center transition-all shadow-[2px_2px_0px_0px_black] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] ${showSunPath ? 'bg-orange-500 text-white' : 'bg-yellow-300 text-black'}`} title="Simulation Soleil">
               <i className={`fa-solid fa-sun ${showSunPath ? 'animate-spin-slow' : ''}`}></i>
             </button>
             <button onClick={onToggleCalibration} className={`w-9 h-9 border-2 border-black flex items-center justify-center transition-all shadow-[2px_2px_0px_0px_black] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] ${isCalibrating ? 'bg-red-500 text-white' : 'bg-white text-black'}`} title="Calibrer Image de Fond">
               <i className="fa-solid fa-map"></i>
             </button>
          </div>
      </div>

      {/* BLOC 3 : JAUGE AUTONOMIE (Noir/Vert) */}
      <div className="bg-[#2a2a2a] border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-2 flex flex-col gap-1 text-white min-w-[160px]">
          <div className="bg-lime-400 text-black px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest inline-block self-start">AUTOSUFFISANCE</div>
          <div className="flex gap-3">
            <div className="flex flex-col gap-1 items-center cursor-pointer group" title="Cliquer pour régler l'objectif">
               <div ref={gaugeRef} onClick={handleGaugeClick} className="w-5 h-16 bg-black border-2 border-stone-600 relative flex flex-col-reverse p-0.5">
                  <div className="w-full bg-lime-500 group-hover:bg-lime-500 transition-all duration-300" style={{ height: `${config.sufficiencyTarget}%` }}></div>
                  {/* Ligne repère score réel */}
                  <div className="absolute w-8 h-0.5 bg-red-500 -left-1.5 transition-all duration-500 border border-black z-10" style={{ bottom: `${sufficiencyScore}%` }}></div>
               </div>
            </div>
            <div className="flex flex-col justify-between py-0.5">
               <div>
                  <span className="block text-[8px] font-black uppercase text-stone-400 tracking-widest">Objectif</span>
                  <span className="block text-xl font-black text-lime-400 leading-none">{config.sufficiencyTarget}%</span>
               </div>
               <div className="w-full h-0.5 bg-stone-600 my-0.5"></div>
               <div>
                  <span className="block text-[8px] font-black uppercase text-stone-400 tracking-widest">Réel</span>
                  <span className={`block text-lg font-black leading-none ${sufficiencyScore >= config.sufficiencyTarget ? 'text-emerald-400' : 'text-orange-400'}`}>{sufficiencyScore}%</span>
               </div>
            </div>
          </div>
      </div>

    </div>
  );
};

export default SetupPanel;
