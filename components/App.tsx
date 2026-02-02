
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import GardenMap from './components/GardenMap';
import CultureDetails from './components/CultureDetails';
import GlobalCalendar from './components/GlobalCalendar';
import SetupPanel from './components/SetupPanel';
import AutosufficiencyTab from './components/AutosufficiencyTab';
import PlotEditor from './components/PlotEditor';
import { Culture, Plot, GardenConfig, PlotSuggestion } from './types';
import { CULTURES, INITIAL_PLOTS } from './constants';
import { getGardenAnalysis } from './lib/gemini';

const App: React.FC = () => {
  const [selectedCulture, setSelectedCulture] = useState<Culture | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [currentTab, setCurrentTab] = useState<'garden' | 'calendar' | 'sufficiency'>('garden');
  const [isPrintPreview, setIsPrintPreview] = useState(false);

  // Config avec valeurs par défaut pour l'image de fond
  const [config, setConfig] = useState<GardenConfig>({ 
    peopleCount: 2,
    sufficiencyTarget: 50,
    terrainWidth: 15,
    terrainHeight: 10,
    address: 'Sarthe, France',
    lat: 48.0061,
    lng: 0.1996,
    backgroundScale: 1,
    backgroundX: 0,
    backgroundY: 0,
    backgroundOpacity: 0.5
  });

  const [plots, setPlots] = useState<Plot[]>(INITIAL_PLOTS);
  const [suggestions, setSuggestions] = useState<PlotSuggestion[]>([]); // État pour la liste des suggestions
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSelectCulture = (culture: Culture) => {
    setSelectedCulture(culture);
    setSelectedPlot(null); 
    setCurrentTab('garden');
  };

  const handleSelectPlot = (plot: Plot) => {
    setSelectedPlot(plot);
    setSelectedCulture(null);
    setCurrentTab('garden');
  };

  const handleUpdatePlot = (updatedPlot: Plot) => {
    setPlots(plots.map(p => p.id === updatedPlot.id ? updatedPlot : p));
    setSelectedPlot(updatedPlot);
  };

  const handleAddPlot = (newPlot: Plot) => {
    setPlots([...plots, newPlot]);
  };

  const handleAddCultureFromDetails = (cultureId: string, variety?: string) => {
    const culture = CULTURES.find(c => c.id === cultureId);
    const newPlot: Plot = {
      id: Math.random().toString(36).substr(2, 9),
      name: culture ? culture.name : 'Nouvelle Culture',
      type: 'culture',
      shape: 'rect',
      x: config.terrainWidth / 2 - 1,
      y: config.terrainHeight / 2 - 0.5,
      width: 2,
      height: 1,
      exposure: 'Soleil',
      plantedCultureId: cultureId,
      selectedVariety: variety
    };
    setPlots([...plots, newPlot]);
    setSelectedCulture(null);
    setSelectedPlot(newPlot);
  };

  const handleDeletePlot = (id: string) => {
    setPlots(plots.filter(p => p.id !== id));
    setSelectedPlot(null);
  };

  // Ajout d'une suggestion au plan
  const handleAddSuggestionToPlan = (suggestion: PlotSuggestion) => {
    const culture = CULTURES.find(c => c.id === suggestion.cultureId);
    if (!culture) return;

    // Position par défaut au centre, l'utilisateur déplacera
    const newPlot: Plot = {
       id: Math.random().toString(36).substr(2, 9),
       name: `${culture.name}`,
       type: 'culture',
       shape: 'rect',
       x: config.terrainWidth / 2 - (suggestion.suggestedWidth / 2),
       y: config.terrainHeight / 2 - (suggestion.suggestedHeight / 2),
       width: suggestion.suggestedWidth,
       height: suggestion.suggestedHeight,
       exposure: 'Soleil',
       plantedCultureId: suggestion.cultureId
    };

    setPlots([...plots, newPlot]);
    // On retire la suggestion de la liste une fois ajoutée
    setSuggestions(suggestions.filter(s => s.cultureId !== suggestion.cultureId));
    setSelectedPlot(newPlot); // Focus direct pour ajustement
  };

  // Calcul des suggestions au lieu de placement direct
  const handleAutoGeneratePlan = async () => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const newSuggestions: PlotSuggestion[] = [];

    CULTURES.forEach(culture => {
      // 1. Calculer besoin total
      const neededPlants = Math.ceil(culture.plantsPerPerson * config.peopleCount * (config.sufficiencyTarget / 100));
      
      // 2. Calculer existant
      let currentPlants = 0;
      plots.filter(p => p.plantedCultureId === culture.id).forEach(p => {
         const rows = Math.floor((p.height * 100) / culture.spacingCm.betweenRows);
         const perRow = Math.floor((p.width * 100) / culture.spacingCm.betweenPlants);
         currentPlants += rows * perRow;
      });

      // 3. Calculer manquant
      let missingPlants = neededPlants - currentPlants;
      
      if (missingPlants > 0) {
        // Surface estimée
        const areaPerPlantM2 = (culture.spacingCm.betweenRows * culture.spacingCm.betweenPlants) / 10000;
        const requiredArea = missingPlants * areaPerPlantM2;
        
        // Bloc standard pour l'UX
        const blockWidth = 1.2; 
        const blockHeight = Math.max(1, Math.ceil((requiredArea / blockWidth) * 10) / 10);
        
        newSuggestions.push({
          cultureId: culture.id,
          missingPlants: missingPlants,
          suggestedWidth: blockWidth,
          suggestedHeight: blockHeight,
          reason: `Il manque ${missingPlants} plants pour atteindre ${config.sufficiencyTarget}% d'autonomie.`
        });
      }
    });

    setSuggestions(newSuggestions);
    setIsAnalyzing(false);
    
    if (newSuggestions.length > 0) {
      setAiAnalysis("J'ai calculé les parcelles nécessaires pour combler vos déficits. Veuillez les ajouter via la liste sous le plan.");
      setTimeout(() => setAiAnalysis(null), 8000);
    } else {
      setAiAnalysis("Félicitations ! Votre plan couvre déjà vos besoins définis.");
      setTimeout(() => setAiAnalysis(null), 5000);
    }
  };

  // --- Print View Logic ---
  if (isPrintPreview) {
    return (
      <div className="min-h-screen bg-white p-8 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-8 print:w-full print:max-w-none">
          <div className="flex justify-between items-start border-b border-stone-200 pb-4 print:hidden">
             <h1 className="text-2xl font-black">Aperçu Impression</h1>
             <div className="flex gap-4">
               <button onClick={() => window.print()} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold">Lancer Impression</button>
               <button onClick={() => setIsPrintPreview(false)} className="bg-stone-200 text-stone-700 px-6 py-2 rounded-lg font-bold">Retour</button>
             </div>
          </div>
          
          <div className="space-y-2">
             <h2 className="text-3xl font-black text-emerald-800 uppercase tracking-tighter">Mon Géopotager</h2>
             <p className="text-sm text-stone-500">Généré le {new Date().toLocaleDateString()}</p>
          </div>

          <section className="border-4 border-stone-100 rounded-3xl p-4 break-inside-avoid">
             <h3 className="text-lg font-black uppercase mb-4 text-stone-400">1. Vue du Plan</h3>
             <div className="h-[500px] w-full relative border border-stone-200 rounded-xl overflow-hidden print:h-[600px]">
                 <GardenMap 
                    plots={plots} 
                    onSelectPlot={() => {}} 
                    onUpdatePlot={() => {}} 
                    onAddPlot={() => {}} 
                    onConfigChange={() => {}} 
                    selectedPlotId={null} 
                    config={config} 
                 />
             </div>
          </section>

          <section className="break-inside-avoid">
             <h3 className="text-lg font-black uppercase mb-4 text-stone-400">2. Liste des Parcelles & Arrosage</h3>
             <table className="w-full text-sm text-left border border-stone-200 rounded-lg overflow-hidden">
               <thead className="bg-stone-50 uppercase text-[10px] text-stone-500">
                 <tr>
                   <th className="p-3">Nom</th>
                   <th className="p-3">Culture / Type</th>
                   <th className="p-3">Dimensions</th>
                   <th className="p-3">Capacité</th>
                   <th className="p-3">Arrosage (Total)</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-stone-100">
                 {plots.map(p => {
                    const cult = CULTURES.find(c => c.id === p.plantedCultureId);
                    const plants = cult ? Math.floor(((p.width * 100) / cult.spacingCm.betweenPlants) * ((p.height * 100) / cult.spacingCm.betweenRows)) : 0;
                    
                    return (
                      <tr key={p.id}>
                        <td className="p-3 font-bold">{p.name}</td>
                        <td className="p-3">{cult?.name || p.type}</td>
                        <td className="p-3">{p.width}m x {p.height}m</td>
                        <td className="p-3 font-bold text-emerald-600">{plants > 0 ? `${plants} plants` : '-'}</td>
                        <td className="p-3 text-blue-600 font-medium">
                           {cult ? (
                             <>
                               {cult.watering.frequency} <span className="text-stone-400 mx-1">|</span> {Math.round(plants * cult.watering.volumePerPlant)} L
                             </>
                           ) : '-'}
                        </td>
                      </tr>
                    );
                 })}
               </tbody>
             </table>
          </section>

          <section className="break-inside-avoid">
             <h3 className="text-lg font-black uppercase mb-4 text-stone-400">3. Planning Récapitulatif</h3>
             <GlobalCalendar />
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-stone-100 overflow-hidden font-sans selection:bg-emerald-100 selection:text-emerald-900 w-full">
      <Sidebar 
        selectedCulture={selectedCulture} 
        onSelectCulture={handleSelectCulture}
        onOpenSettings={() => { setCurrentTab('garden'); setSelectedPlot(null); }}
        onOpenCalendar={() => setCurrentTab('calendar')}
        onOpenSufficiency={() => setCurrentTab('sufficiency')}
        currentTab={currentTab}
        config={config}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <SetupPanel config={config} onConfigChange={setConfig} />

        <main className="flex-1 relative w-full overflow-hidden flex flex-col">
          {currentTab === 'garden' && (
            <div className="flex-1 flex relative overflow-hidden">
              <div className={`flex-1 p-6 flex flex-col gap-6 h-full relative z-0 overflow-hidden transition-all duration-500 ease-in-out ${selectedCulture || selectedPlot ? 'mr-[450px]' : 'mr-0'}`}>
                <div className="flex-1 relative h-full flex flex-col gap-4">
                  {/* Carte occupe l'espace flexible */}
                  <div className="flex-1 relative min-h-0">
                     <GardenMap 
                      plots={plots} 
                      onSelectPlot={handleSelectPlot} 
                      onUpdatePlot={handleUpdatePlot}
                      onAddPlot={handleAddPlot}
                      onConfigChange={setConfig}
                      selectedPlotId={selectedPlot?.id || null} 
                      config={config}
                      onPrint={() => setIsPrintPreview(true)}
                      onMissClick={() => { setSelectedPlot(null); setSelectedCulture(null); }}
                    />
                    
                    <button 
                      onClick={handleAutoGeneratePlan}
                      className="absolute top-4 left-4 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl shadow-emerald-200 border border-emerald-500 flex items-center gap-3 hover:bg-emerald-700 hover:scale-105 transition-all font-black text-xs z-20"
                    >
                      <i className={`fa-solid ${isAnalyzing ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
                      {isAnalyzing ? 'CALCUL...' : 'CALCULER PARCELLES MANQUANTES'}
                    </button>

                    {aiAnalysis && (
                      <div className="absolute top-20 left-4 bg-emerald-800 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-4 max-w-md">
                        <div className="flex items-center gap-3">
                          <i className="fa-solid fa-check-circle text-emerald-400 text-xl"></i>
                          <p className="text-sm font-medium">{aiAnalysis}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Zone de Suggestions (Liste horizontale sous le plan) */}
                  {suggestions.length > 0 && (
                    <div className="h-48 shrink-0 bg-white border-t border-stone-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-10 flex flex-col animate-in slide-in-from-bottom-10">
                      <div className="px-6 py-3 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                        <h3 className="font-black text-stone-600 uppercase text-xs tracking-widest flex items-center gap-2">
                           <i className="fa-solid fa-lightbulb text-amber-500"></i>
                           Propositions d'Ajout ({suggestions.length})
                        </h3>
                        <button onClick={() => setSuggestions([])} className="text-stone-400 hover:text-red-400 text-xs">Fermer</button>
                      </div>
                      <div className="flex-1 overflow-x-auto p-4 flex gap-4 items-center">
                        {suggestions.map((sug, idx) => {
                           const cult = CULTURES.find(c => c.id === sug.cultureId);
                           if(!cult) return null;
                           return (
                             <div key={idx} className="shrink-0 w-64 bg-white border border-stone-200 rounded-xl p-3 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all flex flex-col gap-2 relative group">
                                <div className="flex items-center gap-3">
                                  <img src={cult.image} className="w-10 h-10 rounded-lg object-cover" />
                                  <div>
                                    <h4 className="font-bold text-stone-800 text-sm leading-none">{cult.name}</h4>
                                    <span className="text-[10px] font-bold text-red-500">Manque {sug.missingPlants} plants</span>
                                  </div>
                                </div>
                                <div className="bg-stone-50 rounded-lg p-2 text-[10px] text-stone-500 flex justify-between">
                                  <span>Dim. suggérée:</span>
                                  <span className="font-bold text-stone-800">{sug.suggestedWidth}m x {sug.suggestedHeight}m</span>
                                </div>
                                <button 
                                  onClick={() => handleAddSuggestionToPlan(sug)}
                                  className="mt-1 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                  <i className="fa-solid fa-plus"></i> PLACER SUR LE PLAN
                                </button>
                             </div>
                           )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Panneau latéral droit contextuel - Overlay SUPPRIMÉ ICI */}
              <div 
                className={`fixed inset-y-0 right-0 z-50 transform transition-transform duration-500 ease-in-out shadow-2xl ${
                  selectedCulture || selectedPlot ? 'translate-x-0' : 'translate-x-full'
                }`}
              >
                <div className="h-full bg-white flex flex-col border-l border-stone-200 w-[450px] max-w-[90vw]">
                  {selectedCulture && (
                    <CultureDetails 
                      culture={selectedCulture} 
                      config={config}
                      onClose={() => setSelectedCulture(null)}
                      onAddToPlan={handleAddCultureFromDetails}
                    />
                  )}
                  {selectedPlot && (
                    <PlotEditor 
                      plot={selectedPlot} 
                      config={config} 
                      onUpdate={handleUpdatePlot}
                      onDelete={handleDeletePlot}
                      onAddPlot={handleAddPlot}
                      onClose={() => setSelectedPlot(null)}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {currentTab === 'calendar' && (
            <div className="h-full w-full overflow-y-auto bg-stone-50">
              <GlobalCalendar />
            </div>
          )}

          {currentTab === 'sufficiency' && (
            <div className="h-full w-full overflow-hidden">
              <AutosufficiencyTab config={config} onConfigChange={setConfig} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
