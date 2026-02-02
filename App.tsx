
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import GardenMap from './components/GardenMap';
import CultureDetails from './components/CultureDetails';
import GlobalCalendar from './components/GlobalCalendar';
import SetupPanel from './components/SetupPanel';
import AutosufficiencyTab from './components/AutosufficiencyTab';
import PlotEditor from './components/PlotEditor';
import { Culture, Plot, GardenConfig, PlotSuggestion } from './types';
import { CULTURES, INITIAL_PLOTS, API_URL } from './constants';
import { getGardenAnalysis } from './lib/gemini';

const App: React.FC = () => {
  const testBackend = async () => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "test@test.com",
      password: "test",
    }),
  });

  const data = await res.json();
  console.log("🔌 Backend répond :", data);
};
  const [selectedCulture, setSelectedCulture] = useState<Culture | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [multiSelectedIds, setMultiSelectedIds] = useState<string[]>([]); // Sélection multiple pour suppression
  const [currentTab, setCurrentTab] = useState<'garden' | 'calendar' | 'sufficiency'>('garden');
  const [isPrintPreview, setIsPrintPreview] = useState(false);
  const [showSunPath, setShowSunPath] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false); // État pour le mode satellite

  const [config, setConfig] = useState<GardenConfig>(() => {
    const saved = localStorage.getItem('potager_config');
    return saved ? JSON.parse(saved) : { 
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
    };
  });

  const [plots, setPlots] = useState<Plot[]>(() => {
    const saved = localStorage.getItem('potager_plots');
    return saved ? JSON.parse(saved) : INITIAL_PLOTS;
  });

  const [suggestions, setSuggestions] = useState<PlotSuggestion[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    localStorage.setItem('potager_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('potager_plots', JSON.stringify(plots));
  }, [plots]);

  // Calcul du score d'autosuffisance en temps réel pour le header
  const sufficiencyScore = useMemo(() => {
    const totalPlantsNeeded = CULTURES.reduce((acc, c) => 
      acc + Math.ceil(c.plantsPerPerson * config.peopleCount * (config.sufficiencyTarget / 100)), 0
    );

    if (totalPlantsNeeded === 0) return 0;

    let totalPlantsOnPlan = 0;
    plots.forEach(p => {
      if (p.type === 'culture' && p.plantedCultureId) {
        const culture = CULTURES.find(c => c.id === p.plantedCultureId);
        if (culture) {
          const rows = Math.floor((p.height * 100) / culture.spacingCm.betweenRows);
          const perRow = Math.floor((p.width * 100) / culture.spacingCm.betweenPlants);
          totalPlantsOnPlan += rows * perRow;
        }
      }
    });

    return Math.min(100, Math.round((totalPlantsOnPlan / totalPlantsNeeded) * 100));
  }, [plots, config.peopleCount, config.sufficiencyTarget]);


  const handleSelectCulture = (culture: Culture) => {
    setSelectedCulture(culture);
    setSelectedPlot(null); 
    setMultiSelectedIds([]);
    setCurrentTab('garden');
  };

  const handleSelectPlot = (plot: Plot) => {
    setSelectedPlot(plot);
    setSelectedCulture(null);
    setMultiSelectedIds([]);
    setCurrentTab('garden');
  };

  const handleMultiSelect = (ids: string[]) => {
    setMultiSelectedIds(ids);
    if(ids.length === 1) {
       const p = plots.find(plot => plot.id === ids[0]);
       if(p) setSelectedPlot(p);
    } else {
       setSelectedPlot(null);
       setSelectedCulture(null);
    }
  };

  const handleBulkDelete = () => {
    if(multiSelectedIds.length === 0) return;
    setPlots(plots.filter(p => !multiSelectedIds.includes(p.id)));
    setMultiSelectedIds([]);
    setSelectedPlot(null);
  };

  const handleUpdatePlot = (updatedPlot: Plot) => {
    setPlots(plots.map(p => p.id === updatedPlot.id ? updatedPlot : p));
    setSelectedPlot(updatedPlot);
  };

  const handleAddPlot = (customPlot?: Plot) => {
    const newPlot: Plot = customPlot || {
      id: Math.random().toString(36).substr(2, 9),
      name: `Nouvel Élément`, type: 'culture', shape: 'rect',
      x: 1, y: 1, width: 2, height: 1.2, rotation: 0, opacity: 0.8, exposure: 'Soleil'
    };
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
      selectedVariety: variety,
      opacity: 0.8
    };
    setPlots([...plots, newPlot]);
    setSelectedCulture(null);
    setSelectedPlot(newPlot);
  };

  const handleDeletePlot = (id: string) => {
    setPlots(plots.filter(p => p.id !== id));
    setSelectedPlot(null);
  };

  const handleAddSuggestionToPlan = (suggestion: PlotSuggestion) => {
    const culture = CULTURES.find(c => c.id === suggestion.cultureId);
    if (!culture) return;

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
       plantedCultureId: suggestion.cultureId,
       opacity: 0.8
    };

    setPlots([...plots, newPlot]);
    setSuggestions(suggestions.filter(s => s.cultureId !== suggestion.cultureId));
    setSelectedPlot(newPlot);
  };

  const toggleSuggestionSelection = (cultureId: string) => {
     setSuggestions(suggestions.map(s => 
       s.cultureId === cultureId ? { ...s, selected: !s.selected } : s
     ));
  };

  const handleAutoPlaceSuggestions = () => {
    if (suggestions.length === 0) return;
    
    setIsAnalyzing(true);
    const hasSelection = suggestions.some(s => s.selected);
    const targets = hasSelection ? suggestions.filter(s => s.selected) : suggestions;
    const others = hasSelection ? suggestions.filter(s => !s.selected) : [];

    const currentPlots = [...plots];
    const newPlots: Plot[] = [];
    const step = 0.5; 
    const margin = 0.2; 

    const sortedTargets = [...targets].sort((a, b) => (b.suggestedWidth * b.suggestedHeight) - (a.suggestedWidth * a.suggestedHeight));
    const failedTargets: PlotSuggestion[] = [];

    sortedTargets.forEach(sug => {
        const culture = CULTURES.find(c => c.id === sug.cultureId);
        if (!culture) return;

        let placed = false;
        
        for (let y = 0.5; y < config.terrainHeight - sug.suggestedHeight; y += step) {
            for (let x = 0.5; x < config.terrainWidth - sug.suggestedWidth; x += step) {
                const hasCollision = currentPlots.some(p => 
                    x < p.x + p.width + margin &&
                    x + sug.suggestedWidth + margin > p.x &&
                    y < p.y + p.height + margin &&
                    y + sug.suggestedHeight + margin > p.y
                );

                if (!hasCollision) {
                    const newPlot: Plot = {
                        id: Math.random().toString(36).substr(2, 9),
                        name: `${culture.name}`,
                        type: 'culture',
                        shape: 'rect',
                        x: x, y: y,
                        width: sug.suggestedWidth,
                        height: sug.suggestedHeight,
                        exposure: 'Soleil',
                        plantedCultureId: sug.cultureId,
                        opacity: 0.8
                    };
                    newPlots.push(newPlot);
                    currentPlots.push(newPlot);
                    placed = true;
                    break; 
                }
            }
            if (placed) break;
        }

        if (!placed) {
            failedTargets.push(sug);
        }
    });

    setPlots(currentPlots);
    setSuggestions([...failedTargets, ...others]);
    setIsAnalyzing(false);

    if (newPlots.length > 0) {
        setAiAnalysis(`${newPlots.length} parcelles placées avec succès !`);
        setTimeout(() => setAiAnalysis(null), 5000);
    } else {
        setAiAnalysis("Pas d'espace suffisant trouvé pour la sélection.");
        setTimeout(() => setAiAnalysis(null), 4000);
    }
  };

  const handleAutoGeneratePlan = async () => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const newSuggestions: PlotSuggestion[] = [];

    CULTURES.forEach(culture => {
      const neededPlants = Math.ceil(culture.plantsPerPerson * config.peopleCount * (config.sufficiencyTarget / 100));
      let currentPlants = 0;
      plots.filter(p => p.plantedCultureId === culture.id).forEach(p => {
         const rows = Math.floor((p.height * 100) / culture.spacingCm.betweenRows);
         const perRow = Math.floor((p.width * 100) / culture.spacingCm.betweenPlants);
         currentPlants += rows * perRow;
      });

      let missingPlants = neededPlants - currentPlants;
      
      if (missingPlants > 0) {
        const areaPerPlantM2 = (culture.spacingCm.betweenRows * culture.spacingCm.betweenPlants) / 10000;
        const requiredArea = missingPlants * areaPerPlantM2;
        const blockWidth = 1.2; 
        const blockHeight = Math.max(1, Math.ceil((requiredArea / blockWidth) * 10) / 10);
        
        newSuggestions.push({
          cultureId: culture.id,
          missingPlants: missingPlants,
          suggestedWidth: blockWidth,
          suggestedHeight: blockHeight,
          reason: `Il manque ${missingPlants} plants.`,
          selected: true
        });
      }
    });

    setSuggestions(newSuggestions);
    setIsAnalyzing(false);
    
    if (newSuggestions.length > 0) {
      setAiAnalysis("Propositions générées. Sélectionnez les cultures à placer automatiquement.");
      setTimeout(() => setAiAnalysis(null), 8000);
    } else {
      setAiAnalysis("Félicitations ! Votre plan couvre déjà vos besoins.");
      setTimeout(() => setAiAnalysis(null), 5000);
    }
  };

  if (isPrintPreview) {
    return (
      <div className="min-h-screen bg-white p-8 overflow-auto">
        {/* ... (Print View stays same) ... */}
        <div className="max-w-4xl mx-auto space-y-8 print:w-full print:max-w-none">
          <div className="flex justify-between items-start border-b border-stone-200 pb-4 print:hidden">
             <h1 className="text-2xl font-black">Aperçu Impression</h1>
             <div className="flex gap-4">
               <button onClick={() => window.print()} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold">Lancer Impression</button>
               <button onClick={() => setIsPrintPreview(false)} className="bg-stone-200 text-stone-700 px-6 py-2 rounded-lg font-bold">Retour</button>
             </div>
          </div>
          <GardenMap 
            plots={plots} 
            onSelectPlot={() => {}} 
            onUpdatePlot={() => {}} 
            onAddPlot={() => {}} 
            onConfigChange={() => {}} 
            selectedPlotId={null} 
            multiSelectedIds={[]}
            onMultiSelect={() => {}}
            config={config} 
            isCalibrating={false}
            showSunPath={false}
          />
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
      <button
  onClick={testBackend}
  style={{
    position: "fixed",
    bottom: 20,
    right: 20,
    zIndex: 9999,
    padding: "8px 12px",
    background: "#10b981",
    color: "white",
    borderRadius: "8px",
    fontWeight: "bold",
  }}
>
  Test backend
</button>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <SetupPanel 
          config={config} 
          onConfigChange={setConfig} 
          onAutoGenerate={handleAutoGeneratePlan}
          isAnalyzing={isAnalyzing}
          isCalibrating={isCalibrating}
          onToggleCalibration={() => setIsCalibrating(!isCalibrating)}
          showSunPath={showSunPath}
          onToggleSunPath={() => setShowSunPath(!showSunPath)}
          onAddPlot={() => handleAddPlot()}
          sufficiencyScore={sufficiencyScore}
        />

        <main className="flex-1 relative w-full overflow-hidden flex flex-col">
          {currentTab === 'garden' && (
            <div className="flex-1 flex relative overflow-hidden">
              
              <div className="flex-1 p-6 flex flex-col gap-6 h-full relative z-0 overflow-hidden">
                <div className="flex-1 relative h-full flex flex-col gap-4">

                  <div className="flex-1 relative min-h-0">
                     <GardenMap 
                      plots={plots} 
                      onSelectPlot={handleSelectPlot} 
                      onUpdatePlot={handleUpdatePlot}
                      onAddPlot={handleAddPlot}
                      onConfigChange={setConfig}
                      selectedPlotId={selectedPlot?.id || null} 
                      multiSelectedIds={multiSelectedIds}
                      onMultiSelect={handleMultiSelect}
                      config={config}
                      onPrint={() => setIsPrintPreview(true)}
                      onMissClick={() => { setSelectedPlot(null); setSelectedCulture(null); setMultiSelectedIds([]); }}
                      isCalibrating={isCalibrating}
                      showSunPath={showSunPath}
                      onCloseCalibration={() => setIsCalibrating(false)}
                    />
                    
                    <button 
                      onClick={handleAutoGeneratePlan}
                      className="absolute top-4 left-4 bg-white text-emerald-700 px-4 py-2.5 rounded-xl shadow-lg border border-emerald-100 flex items-center gap-3 hover:bg-emerald-50 transition-all font-black text-[10px] z-20"
                    >
                      <i className={`fa-solid ${isAnalyzing ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
                      {isAnalyzing ? 'CALCUL...' : 'PLANIFIER'}
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

                  {/* Panel de Suggestions ET de Sélection Multiple */}
                  {(suggestions.length > 0 || multiSelectedIds.length > 0) && (
                    <div className="h-48 shrink-0 bg-white border-t border-stone-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-10 flex flex-col animate-in slide-in-from-bottom-10">
                      
                      {/* Header du panneau */}
                      <div className="px-6 py-3 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                        <div className="flex items-center gap-4">
                           {multiSelectedIds.length > 0 ? (
                             <>
                               <h3 className="font-black text-stone-600 uppercase text-xs tracking-widest flex items-center gap-2 text-blue-600">
                                  <i className="fa-regular fa-square-check"></i>
                                  Sélection ({multiSelectedIds.length})
                               </h3>
                               <button 
                                 onClick={handleBulkDelete}
                                 className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-black hover:bg-red-200 transition-colors flex items-center gap-2"
                               >
                                 <i className="fa-solid fa-trash"></i>
                                 TOUT SUPPRIMER
                               </button>
                             </>
                           ) : (
                             <>
                               <h3 className="font-black text-stone-600 uppercase text-xs tracking-widest flex items-center gap-2">
                                  <i className="fa-solid fa-lightbulb text-amber-500"></i>
                                  Propositions ({suggestions.length})
                               </h3>
                               <button 
                                 onClick={handleAutoPlaceSuggestions}
                                 className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-black hover:bg-emerald-200 transition-colors flex items-center gap-2"
                               >
                                 <i className="fa-solid fa-wand-magic-sparkles"></i>
                                 PLACER SÉLECTION ({suggestions.filter(s => s.selected).length})
                               </button>
                             </>
                           )}
                        </div>
                        <button onClick={() => { setSuggestions([]); setMultiSelectedIds([]); }} className="text-stone-400 hover:text-red-400 text-xs">Fermer</button>
                      </div>

                      {/* Contenu Liste Horizontale */}
                      <div className="flex-1 overflow-x-auto p-4 flex gap-4 items-center">
                        
                        {/* Liste des éléments sélectionnés (Mode Delete) */}
                        {multiSelectedIds.length > 0 && multiSelectedIds.map((id) => {
                           const p = plots.find(plot => plot.id === id);
                           if(!p) return null;
                           const cult = CULTURES.find(c => c.id === p.plantedCultureId);
                           return (
                             <div key={id} className="shrink-0 w-48 bg-blue-50 border border-blue-200 rounded-xl p-3 shadow-sm flex flex-col gap-2 relative">
                                <div className="flex items-center gap-3">
                                  {cult ? (
                                    <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center shrink-0">
                                      <img src={cult.image} className="w-8 h-8 object-contain" />
                                    </div>
                                  ) : (
                                    <div className="w-10 h-10 bg-stone-200 rounded-lg flex items-center justify-center"><i className="fa-solid fa-cube text-stone-400"></i></div>
                                  )}
                                  <div>
                                    <h4 className="font-bold text-stone-800 text-xs leading-none truncate w-24">{p.name}</h4>
                                    <span className="text-[10px] text-stone-500">{p.width}m x {p.height}m</span>
                                  </div>
                                </div>
                             </div>
                           )
                        })}

                        {/* Liste des suggestions (Mode Ajout) */}
                        {multiSelectedIds.length === 0 && suggestions.map((sug, idx) => {
                           const cult = CULTURES.find(c => c.id === sug.cultureId);
                           if(!cult) return null;
                           return (
                             <div 
                               key={idx} 
                               className={`shrink-0 w-64 bg-white border rounded-xl p-3 shadow-sm transition-all flex flex-col gap-2 relative group cursor-pointer ${sug.selected ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-stone-200 opacity-70 hover:opacity-100'}`}
                               onClick={() => toggleSuggestionSelection(sug.cultureId)}
                             >
                                <div className="absolute top-2 right-2">
                                   {sug.selected ? <i className="fa-solid fa-check-circle text-emerald-500"></i> : <i className="fa-regular fa-circle text-stone-300"></i>}
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center shrink-0">
                                     <img src={cult.image} className="w-8 h-8 object-contain" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-stone-800 text-sm leading-none">{cult.name}</h4>
                                    <span className="text-[10px] font-bold text-red-500">Manque {sug.missingPlants} plants</span>
                                  </div>
                                </div>
                                <div className="bg-stone-50 rounded-lg p-2 text-[10px] text-stone-500 flex justify-between">
                                  <span>Dim. suggérée:</span>
                                  <span className="font-bold text-stone-800">{sug.suggestedWidth}m x {sug.suggestedHeight}m</span>
                                </div>
                             </div>
                           )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Overlay Panel */}
              <div 
                className={`fixed inset-y-0 right-0 z-[60] transform transition-transform duration-500 ease-in-out shadow-2xl ${
                  selectedCulture || selectedPlot ? 'translate-x-0' : 'translate-x-full'
                }`}
              >
                <div className="h-full bg-white flex flex-col border-l border-stone-200 w-[450px] max-w-[90vw] shadow-2xl">
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
              <AutosufficiencyTab config={config} onConfigChange={setConfig} plots={plots} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
