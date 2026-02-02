
import React, { useState } from 'react';
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

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressInput) return;
    setIsGeocoding(true);
    try {
      const coords = await geocodeAddress(addressInput);
      if (coords) {
        onConfigChange({
          ...config,
          address: addressInput,
          lat: coords.lat,
          lng: coords.lng
        });
      }
    } catch (error) {
      console.error("Geocoding failed", error);
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl border-b border-stone-200 px-6 py-4 flex flex-wrap items-end justify-between shadow-sm z-40 gap-4 min-h-[80px]">
      <div className="flex items-end gap-6 flex-wrap">
        {/* Terrain Dimensions */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest leading-none">Terrain (m)</label>
          <div className="flex items-center gap-2 h-9">
            <input 
              type="number" value={config.terrainWidth}
              onChange={(e) => onConfigChange({...config, terrainWidth: parseInt(e.target.value)})}
              className="bg-stone-100 border border-stone-200 rounded-lg px-2 text-xs font-black w-14 h-full outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-stone-300 text-[10px] self-center">×</span>
            <input 
              type="number" value={config.terrainHeight}
              onChange={(e) => onConfigChange({...config, terrainHeight: parseInt(e.target.value)})}
              className="bg-stone-100 border border-stone-200 rounded-lg px-2 text-xs font-black w-14 h-full outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Household Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest leading-none">Foyer</label>
          <div className="h-9">
            <select 
              value={config.peopleCount}
              onChange={(e) => onConfigChange({ ...config, peopleCount: parseInt(e.target.value) as any })}
              className="h-full bg-stone-100 border border-stone-200 rounded-lg px-3 text-xs font-black outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {[1, 2, 3, 4].map(num => (
                <option key={num} value={num}>{num} {num > 1 ? 'Pers.' : 'Pers.'}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Location */}
        <form onSubmit={handleAddressSubmit} className="flex flex-col gap-1.5">
          <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest leading-none">Localisation</label>
          <div className="h-9 relative">
            <input 
              type="text" 
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="Ville, Pays..."
              className="h-full bg-stone-100 border border-stone-200 rounded-lg px-3 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none w-48"
            />
            {isGeocoding && <i className="fa-solid fa-spinner fa-spin absolute right-2 top-3 text-emerald-500 text-[10px]"></i>}
          </div>
        </form>

        <div className="h-9 w-px bg-stone-200 hidden xl:block mx-2"></div>

        {/* Action Buttons Group - Aligned with inputs via flex-end */}
        <div className="flex items-center gap-2 h-9">
          <button 
            onClick={onAutoGenerate}
            disabled={isAnalyzing}
            className={`h-full px-4 rounded-xl text-[10px] font-black shadow-sm transition-all flex items-center gap-2 ${isAnalyzing ? 'bg-stone-100 text-stone-400' : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105'}`}
          >
            <i className={`fa-solid ${isAnalyzing ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
            CALCULER
          </button>

          <button 
            onClick={onAddPlot}
            className="h-full bg-emerald-100 text-emerald-700 px-4 rounded-xl text-[10px] font-black hover:bg-emerald-200 transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-plus-circle"></i> AJOUTER
          </button>

          <button 
            onClick={onToggleSunPath} 
            className={`h-full w-10 rounded-xl flex items-center justify-center transition-all border ${showSunPath ? 'bg-amber-400 border-amber-500 text-white shadow-inner shadow-amber-600 ring-2 ring-amber-200' : 'bg-stone-100 border-stone-200 text-stone-400 hover:bg-stone-200'}`}
            title="Course du soleil"
          >
            <i className={`fa-solid fa-sun text-sm ${showSunPath ? 'animate-spin-slow' : 'text-amber-500'}`}></i>
          </button>

          <button 
            onClick={onToggleCalibration} 
            className={`h-full px-4 rounded-xl text-[10px] font-black border transition-all flex items-center gap-2 ${isCalibrating ? 'bg-amber-100 border-amber-300 text-amber-800 shadow-inner' : 'bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200'}`}
          >
            <i className={`fa-solid ${isCalibrating ? 'fa-check' : 'fa-image'}`}></i>
            {isCalibrating ? 'VALIDER' : 'SATELLITE'}
          </button>
        </div>
      </div>

      {/* Real Sufficiency Score Indicator */}
      <div className="hidden md:flex items-center gap-4 pl-4 border-l border-stone-100 h-12">
         <div className="flex flex-col items-end justify-center h-full">
            <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest leading-none mb-1">Autosuffisance</span>
            <span className="text-xs font-bold text-emerald-600">Réelle</span>
         </div>
         <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90 overflow-visible">
              <circle cx="24" cy="24" r="18" fill="transparent" stroke="#e7e5e4" strokeWidth="4" />
              <circle cx="24" cy="24" r="18" fill="transparent" stroke={sufficiencyScore >= 100 ? '#10b981' : sufficiencyScore > 50 ? '#f59e0b' : '#ef4444'} strokeWidth="4" strokeDasharray={2 * Math.PI * 18} strokeDashoffset={2 * Math.PI * 18 * (1 - sufficiencyScore/100)} strokeLinecap="round" className="transition-all duration-1000" />
            </svg>
            <span className={`absolute text-[10px] font-black ${sufficiencyScore >= 100 ? 'text-emerald-600' : sufficiencyScore > 50 ? 'text-amber-500' : 'text-red-500'}`}>{sufficiencyScore}%</span>
         </div>
      </div>
    </div>
  );
};

export default SetupPanel;
