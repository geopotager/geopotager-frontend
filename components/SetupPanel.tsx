
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
    <div className="bg-white border-b-2 border-black px-6 py-4 flex flex-wrap items-end justify-between shadow-sm z-40 gap-4 min-h-[80px]">
      <div className="flex items-end gap-6 flex-wrap">
        {/* Terrain Dimensions */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-black uppercase tracking-widest bg-yellow-300 inline-block px-1 border border-black">Terrain (m)</label>
          <div className="flex items-center gap-2 h-10">
            <input 
              type="number" value={config.terrainWidth}
              onChange={(e) => onConfigChange({...config, terrainWidth: parseInt(e.target.value)})}
              className="bg-white border-2 border-black px-2 text-sm font-black w-16 h-full outline-none focus:bg-yellow-200 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            />
            <span className="text-black font-black text-lg">×</span>
            <input 
              type="number" value={config.terrainHeight}
              onChange={(e) => onConfigChange({...config, terrainHeight: parseInt(e.target.value)})}
              className="bg-white border-2 border-black px-2 text-sm font-black w-16 h-full outline-none focus:bg-yellow-200 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            />
          </div>
        </div>

        {/* Household Dropdown */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-black uppercase tracking-widest bg-lime-300 inline-block px-1 border border-black">Foyer</label>
          <div className="h-10">
            <select 
              value={config.peopleCount}
              onChange={(e) => onConfigChange({ ...config, peopleCount: parseInt(e.target.value) as any })}
              className="h-full bg-white border-2 border-black px-3 text-sm font-black outline-none focus:bg-lime-200 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition-all appearance-none pr-8"
              style={{backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7em top 50%', backgroundSize: '.65em auto'}}
            >
              {[1, 2, 3, 4].map(num => (
                <option key={num} value={num}>{num} {num > 1 ? 'Personnes' : 'Personne'}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Location */}
        <form onSubmit={handleAddressSubmit} className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-black uppercase tracking-widest bg-purple-300 inline-block px-1 border border-black">Localisation</label>
          <div className="h-10 relative">
            <input 
              type="text" 
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="Ville, Pays..."
              className="h-full bg-white border-2 border-black px-3 text-sm font-bold focus:bg-purple-200 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none w-48 transition-all"
            />
            {isGeocoding && <i className="fa-solid fa-spinner fa-spin absolute right-2 top-3 text-black text-sm"></i>}
          </div>
        </form>

        <div className="h-10 w-0.5 bg-black hidden xl:block mx-2"></div>

        {/* Action Buttons Group */}
        <div className="flex items-center gap-3 h-10">
          <button 
            onClick={onAutoGenerate}
            disabled={isAnalyzing}
            className={`h-full px-4 border-2 border-black text-xs font-black transition-all flex items-center gap-2 uppercase ${
              isAnalyzing 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-lime-400 text-black hover:bg-lime-300 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
            }`}
          >
            <i className={`fa-solid ${isAnalyzing ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
            Calculer
          </button>

          <button 
            onClick={onAddPlot}
            className="h-full bg-yellow-300 text-black border-2 border-black px-4 text-xs font-black hover:bg-yellow-200 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2 uppercase"
          >
            <i className="fa-solid fa-plus-circle"></i> Ajouter
          </button>

          <button 
            onClick={onToggleSunPath} 
            className={`h-full w-10 border-2 border-black flex items-center justify-center transition-all ${
              showSunPath 
              ? 'bg-yellow-400 text-black translate-x-[2px] translate-y-[2px] shadow-none' 
              : 'bg-white text-gray-400 hover:bg-yellow-200 hover:text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
            }`}
            title="Course du soleil"
          >
            <i className={`fa-solid fa-sun text-sm ${showSunPath ? 'animate-spin-slow' : ''}`}></i>
          </button>

          <button 
            onClick={onToggleCalibration} 
            className={`h-full px-4 border-2 border-black text-xs font-black transition-all flex items-center gap-2 uppercase ${
              isCalibrating 
              ? 'bg-purple-400 text-black translate-x-[2px] translate-y-[2px] shadow-none' 
              : 'bg-white text-black hover:bg-purple-200 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
            }`}
          >
            <i className={`fa-solid ${isCalibrating ? 'fa-check' : 'fa-satellite'}`}></i>
            {isCalibrating ? 'Valider' : 'Sat'}
          </button>
        </div>
      </div>

      {/* Real Sufficiency Score Indicator - NeoBrut */}
      <div className="hidden md:flex items-center gap-4 pl-4 border-l-2 border-black h-12">
         <div className="flex flex-col items-end justify-center h-full">
            <span className="text-[10px] font-black text-black uppercase tracking-widest leading-none mb-1 bg-white border border-black px-1">Autonomie</span>
            <span className="text-sm font-black text-lime-600 bg-gray-100 px-1 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Réelle</span>
         </div>
         <div className="relative w-14 h-14 flex items-center justify-center shrink-0 bg-black rounded-full border-2 border-black">
            <svg className="w-full h-full transform -rotate-90 overflow-visible p-1">
              <circle cx="24" cy="24" r="18" fill="transparent" stroke="#444" strokeWidth="6" />
              <circle cx="24" cy="24" r="18" fill="transparent" stroke={sufficiencyScore >= 100 ? '#a3e635' : sufficiencyScore > 50 ? '#facc15' : '#ef4444'} strokeWidth="6" strokeDasharray={2 * Math.PI * 18} strokeDashoffset={2 * Math.PI * 18 * (1 - sufficiencyScore/100)} strokeLinecap="butt" className="transition-all duration-1000" />
            </svg>
            <span className={`absolute text-xs font-black ${sufficiencyScore >= 100 ? 'text-lime-400' : sufficiencyScore > 50 ? 'text-yellow-400' : 'text-red-400'}`}>{sufficiencyScore}%</span>
         </div>
      </div>
    </div>
  );
};

export default SetupPanel;
