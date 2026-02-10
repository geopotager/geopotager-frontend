
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import GardenMap from './components/GardenMap';
import CultureDetails from './components/CultureDetails';
import GlobalCalendar from './components/GlobalCalendar';
import SetupPanel from './components/SetupPanel';
import AutosufficiencyTab from './components/AutosufficiencyTab';
import PlotEditor from './components/PlotEditor';
import { Culture, Plot, GardenConfig, PlotSuggestion } from '../types';
import { CULTURES, INITIAL_PLOTS } from '../constants';
import { getGardenAnalysis } from '../lib/gemini';
import { generateMissingSuggestions, countExistingPlants, calculateNeeds } from '../lib/plantCalculations';

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [selectedCulture, setSelectedCulture] = useState<Culture | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [multiSelectedIds, setMultiSelectedIds] = useState<string[]>([]); 
  const [currentTab, setCurrentTab] = useState<'garden' | 'calendar' | 'sufficiency'>('garden');
  const [isPrintPreview, setIsPrintPreview] = useState(false);
  const [showSunPath, setShowSunPath] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false); 
  
  // Navigation Serre
  const [currentGreenhouseId, setCurrentGreenhouseId] = useState<string | null>(null);

  // État spécifique pour forcer l'affichage du panneau suggestions si le calcul est lancé
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(false);

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
    const timer = setTimeout(() => setShowIntro(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (aiAnalysis) {
      const timer = setTimeout(() => {
        setAiAnalysis(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [aiAnalysis]);

  useEffect(() => {
    localStorage.setItem('potager_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('potager_plots', JSON.stringify(plots));
  }, [plots]);

  // Logique pour déterminer les plots à afficher (Jardin ou Intérieur Serre)
  const displayedPlots = useMemo(() => {
    if (currentGreenhouseId) {
        const gh = plots.find(p => p.id === currentGreenhouseId);
        return gh && gh.subPlots ? gh.subPlots : [];
    }
    return plots;
  }, [plots, currentGreenhouseId]);

  const updateDisplayedPlots = (newPlots: Plot[]) => {
    if (currentGreenhouseId) {
        setPlots(plots.map(p => p.id === currentGreenhouseId ? { ...p, subPlots: newPlots } : p));
    } else {
        setPlots(newPlots);
    }
  };

  const sufficiencyScore = useMemo(() => {
    const totalPlantsNeeded = CULTURES.reduce((acc, c) => 
      acc + calculateNeeds(c.id, config.peopleCount, config.sufficiencyTarget).neededPlants, 0
    );

    if (totalPlantsNeeded === 0) return 0;

    let totalAnnualYieldPotential = 0;
    CULTURES.forEach(c => {
        // countExistingPlants retourne maintenant (emplacements * successions)
        totalAnnualYieldPotential += countExistingPlants(plots, c.id);
    });

    return Math.min(100, Math.round((totalAnnualYieldPotential / totalPlantsNeeded) * 100));
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
       const p = displayedPlots.find(plot => plot.id === ids[0]);
       if(p) setSelectedPlot(p);
    } else {
       setSelectedPlot(null);
       setSelectedCulture(null);
    }
  };

  const handleBulkDelete = () => {
    if(multiSelectedIds.length === 0) return;
    updateDisplayedPlots(displayedPlots.filter(p => !multiSelectedIds.includes(p.id)));
    setMultiSelectedIds([]);
    setSelectedPlot(null);
  };

  const handleIndividualDelete = (id: string) => {
    updateDisplayedPlots(displayedPlots.filter(p => p.id !== id));
    if (multiSelectedIds.includes(id)) {
        const newSelection = multiSelectedIds.filter(mid => mid !== id);
        setMultiSelectedIds(newSelection);
        if(newSelection.length === 0) setSelectedPlot(null);
    }
  };

  const handleUpdatePlot = (updatedPlot: Plot) => {
    updateDisplayedPlots(displayedPlots.map(p => p.id === updatedPlot.id ? updatedPlot : p));
    setSelectedPlot(updatedPlot);
  };

  const handleAddPlot = (customPlot?: Plot) => {
    const newPlot: Plot = customPlot || {
      id: Math.random().toString(36).substr(2, 9),
      name: `Nouvel Élément`, type: 'culture', shape: 'rect',
      x: 1, y: 1, width: 2, height: 1.2, rotation: 0, opacity: 0.8, exposure: 'Soleil'
    };
    updateDisplayedPlots([...displayedPlots, newPlot]);
  };

  const handleAddCultureFromDetails = (cultureId: string, variety?: string) => {
    const culture = CULTURES.find(c => c.id === cultureId);
    
    // Détection auto de la forme pour les arbres
    const isTree = culture?.category === 'Arbres Fruitiers' || culture?.category === 'Petits Fruits';
    const defaultShape = isTree ? 'circle' : 'rect';

    const newPlot: Plot = {
      id: Math.random().toString(36).substr(2, 9),
      name: culture ? culture.name : 'Nouvelle Culture',
      type: 'culture',
      shape: defaultShape,
      x: 1, y: 1,
      width: isTree ? 3 : 2, // Plus grand pour les arbres par défaut
      height: isTree ? 3 : 1,
      exposure: 'Soleil',
      plantedCultureId: cultureId,
      selectedVariety: variety,
      opacity: 0.8
    };
    updateDisplayedPlots([...displayedPlots, newPlot]);
    setSelectedCulture(null);
    setSelectedPlot(newPlot);
  };

  const handleDeletePlot = (id: string) => {
    updateDisplayedPlots(displayedPlots.filter(p => p.id !== id));
    setSelectedPlot(null);
  };

  const handleAddSuggestionToPlan = (suggestion: PlotSuggestion) => {
    const culture = CULTURES.find(c => c.id === suggestion.cultureId);
    if (!culture) return;

    // Forme auto pour les suggestions aussi
    const isTree = culture.category === 'Arbres Fruitiers' || culture.category === 'Petits Fruits';

    const newPlot: Plot = {
       id: Math.random().toString(36).substr(2, 9),
       name: `${culture.name}`,
       type: 'culture',
       shape: isTree ? 'circle' : 'rect',
       x: 1, y: 1,
       width: suggestion.suggestedWidth,
       height: suggestion.suggestedHeight,
       exposure: 'Soleil',
       plantedCultureId: suggestion.cultureId,
       opacity: 0.8
    };

    updateDisplayedPlots([...displayedPlots, newPlot]);
    setSuggestions(suggestions.filter(s => s.cultureId !== suggestion.cultureId));
    setSelectedPlot(newPlot);
  };

  const toggleSuggestionSelection = (cultureId: string) => {
     setSuggestions(suggestions.map(s => 
       s.cultureId === cultureId ? { ...s, selected: !s.selected } : s
     ));
  };

  const handleAutoPlaceSuggestions = () => {
    const newPlots = [...displayedPlots];
    const terrainW = currentGreenhouseId ? 20 : config.terrainWidth;
    const terrainH = currentGreenhouseId ? 20 : config.terrainHeight;

    const toPlace = suggestions.filter(s => s.selected);
    
    // Algorithme de placement simple
    toPlace.forEach(s => {
        const culture = CULTURES.find(c => c.id === s.cultureId);
        const isTree = culture?.category === 'Arbres Fruitiers';
        
        let placed = false;
        let x = 1;
        let y = 1;
        const step = 0.5;

        // Try to find a spot
        while (!placed && y + s.suggestedHeight <= terrainH) {
            const collision = newPlots.some(p => {
                return (x < p.x + p.width && x + s.suggestedWidth > p.x &&
                        y < p.y + p.height && y + s.suggestedHeight > p.y);
            });

            if (!collision) {
                newPlots.push({
                    id: Math.random().toString(36).substr(2, 9),
                    name: culture?.name || 'Auto',
                    type: 'culture',
                    shape: isTree ? 'circle' : 'rect',
                    x: x, y: y, 
                    width: s.suggestedWidth, height: s.suggestedHeight,
                    exposure: 'Soleil',
                    plantedCultureId: s.cultureId,
                    rowOrientation: 'horizontal'
                });
                placed = true;
            } else {
                x += step;
                if (x + s.suggestedWidth > terrainW) {
                    x = 1;
                    y += step;
                }
            }
        }
    });

    updateDisplayedPlots(newPlots);
    setSuggestions([]);
    setShowSuggestionsPanel(false);
  };

  const handleAutoGeneratePlan = async () => {
    setIsAnalyzing(true);
    setSuggestions([]); 
    setShowSuggestionsPanel(true);

    // Suppression du délai artificiel long
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const newSuggestions = generateMissingSuggestions(plots, config.peopleCount, config.sufficiencyTarget);
    
    setSuggestions(newSuggestions);
    setIsAnalyzing(false);
    setAiAnalysis(newSuggestions.length > 0 ? `${newSuggestions.length} cultures manquantes.` : "Objectif atteint !");
  };

  const handleRequestPlanningFromVivier = async () => {
      setCurrentTab('garden');
      await handleAutoGeneratePlan();
  };

  const handleOpenCultureDetails = (cultureId: string) => {
      const culture = CULTURES.find(c => c.id === cultureId);
      if (culture) {
          setSelectedCulture(culture);
          setSelectedPlot(null);
      }
  };

  if (isPrintPreview) {
    return (
      <div className="min-h-screen bg-white p-8 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-8 print:w-full print:max-w-none">
          <div className="flex justify-between items-start border-b-2 border-[#5D4037] pb-4 print:hidden">
             <h1 className="text-2xl font-black font-mono text-[#5D4037]">Aperçu Impression</h1>
             <div className="flex gap-4">
               <button onClick={() => window.print()} className="bg-emerald-500 border-2 border-[#5D4037] text-white px-6 py-2 font-black shadow-[4px_4px_0px_0px_#8D6E63] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">Lancer Impression</button>
               <button onClick={() => setIsPrintPreview(false)} className="bg-white border-2 border-[#5D4037] text-[#5D4037] px-6 py-2 font-black shadow-[4px_4px_0px_0px_#8D6E63] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">Retour</button>
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

  const isMultiSelectionMode = multiSelectedIds.length > 0;
  const hasSuggestions = suggestions.length > 0;
  const showBottomPanel = hasSuggestions || isMultiSelectionMode || showSuggestionsPanel;

  return (
    <>
      {showIntro ? (
        <div className="fixed inset-0 bg-[#5D4037] z-[100] overflow-hidden flex items-center justify-center">
           <div className="w-full h-full bg-[#3E2723] absolute top-0 left-0 intro-container flex items-center justify-center">
              <div className="absolute inset-0 opacity-40" style={{
                 background: 'repeating-linear-gradient(45deg, #1B5E20 0px, #1B5E20 20px, #33691E 20px, #33691E 40px)',
                 animation: 'furrowScroll 3s linear infinite'
              }}></div>
              <div className="text-center relative z-10 p-12 border-8 border-[#8D6E63] bg-[#5D4037] shadow-[10px_10px_0px_rgba(0,0,0,0.3)]">
                 <h1 className="text-6xl md:text-9xl font-black text-[#D7CCC8] tracking-tighter drop-shadow-[4px_4px_0px_#271c19]">GÉOPOTAGER</h1>
                 <p className="text-xl md:text-2xl font-mono text-[#A5D6A7] font-bold mt-4 tracking-[0.5em] bg-[#271c19] inline-block px-4 py-2 uppercase">Intelligence Vivrière</p>
              </div>
           </div>
        </div>
      ) : (
        <div className="flex h-screen bg-[#D7CCC8] overflow-hidden font-sans selection:bg-[#A1887F] selection:text-white w-full animate-in fade-in duration-500">
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

                      <div className="flex-1 relative min-h-0 border-4 border-[#8D6E63] shadow-[6px_6px_0px_0px_rgba(93,64,55,0.4)] bg-[#EFEBE9]">
                        {currentGreenhouseId && (
                            <div className="absolute top-0 left-0 right-0 bg-[#795548] text-white z-50 p-2 flex justify-between items-center shadow-md">
                                <span className="font-black uppercase text-sm ml-4"><i className="fa-solid fa-house-chimney-window"></i> Intérieur</span>
                                <button 
                                    onClick={() => { setCurrentGreenhouseId(null); setSelectedPlot(null); }}
                                    className="bg-white text-[#3E2723] px-4 py-1 text-xs font-black uppercase border-2 border-[#3E2723] shadow-[2px_2px_0px_0px_#3E2723] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                                >
                                    Sortir
                                </button>
                            </div>
                        )}

                        <GardenMap 
                          key={currentGreenhouseId || 'main-map'} 
                          plots={displayedPlots} 
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
                          onEnterGreenhouse={(id) => { setCurrentGreenhouseId(id); setSelectedPlot(null); }}
                          isInsideGreenhouse={!!currentGreenhouseId}
                        />
                        
                        {!currentGreenhouseId && (
                            <button 
                            onClick={handleAutoGeneratePlan}
                            className="absolute top-4 left-4 bg-white text-[#3E2723] px-4 py-2.5 shadow-[4px_4px_0px_0px_#5D4037] border-2 border-[#5D4037] flex items-center gap-3 hover:bg-[#D7CCC8] transition-all font-black text-[10px] z-20 uppercase hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                            >
                            <i className={`fa-solid ${isAnalyzing ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
                            {isAnalyzing ? 'CALCUL...' : 'PLANIFIER'}
                            </button>
                        )}

                        {aiAnalysis && (
                          <div className="absolute top-20 left-4 bg-[#3E2723] border-2 border-[#A1887F] text-white px-6 py-4 shadow-[4px_4px_0px_0px_#1B1B1B] z-50 animate-in fade-in slide-in-from-top-4 max-w-md">
                            <div className="flex items-center gap-3">
                              <i className="fa-solid fa-check-circle text-lime-400 text-xl"></i>
                              <p className="text-sm font-black">{aiAnalysis}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* --- PANEL DU BAS (Sélection ou Suggestions) --- */}
                      {showBottomPanel && (
                        <div className="h-48 shrink-0 bg-[#D7CCC8] border-t-4 border-[#5D4037] z-10 flex flex-col animate-in slide-in-from-bottom-10 shadow-[0px_-4px_10px_rgba(0,0,0,0.1)]">
                          
                          {/* En-tête du Panneau */}
                          <div className={`px-6 py-3 border-b-2 border-[#5D4037] flex justify-between items-center ${isMultiSelectionMode ? 'bg-purple-200' : 'bg-[#A1887F]'}`}>
                            <div className="flex items-center gap-4">
                              {isMultiSelectionMode ? (
                                <>
                                  <h3 className="font-black text-[#3E2723] uppercase text-xs tracking-widest flex items-center gap-2">
                                      <i className="fa-regular fa-square-check text-lg"></i>
                                      Sélection Multiple ({multiSelectedIds.length})
                                  </h3>
                                  <button 
                                    onClick={handleBulkDelete}
                                    className="bg-red-500 border-2 border-[#3E2723] text-white px-4 py-2 text-xs font-black hover:bg-red-600 transition-all flex items-center gap-2 shadow-[2px_2px_0px_0px_#3E2723] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
                                  >
                                    <i className="fa-solid fa-trash"></i>
                                    TOUT SUPPRIMER
                                  </button>
                                </>
                              ) : (
                                <>
                                  <h3 className="font-black text-white uppercase text-xs tracking-widest flex items-center gap-2">
                                      <i className="fa-solid fa-lightbulb"></i>
                                      {hasSuggestions ? `Cultures Manquantes (${suggestions.length})` : "Analyse Terminée"}
                                  </h3>
                                  {hasSuggestions && (
                                    <button 
                                      onClick={handleAutoPlaceSuggestions}
                                      className="bg-lime-400 border-2 border-[#3E2723] text-[#3E2723] px-3 py-1 text-xs font-black hover:bg-lime-300 transition-all flex items-center gap-2 shadow-[2px_2px_0px_0px_#3E2723] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
                                    >
                                      <i className="fa-solid fa-wand-magic-sparkles"></i>
                                      PLACER SÉLECTION ({suggestions.filter(s => s.selected).length})
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                            <button onClick={() => { setSuggestions([]); setMultiSelectedIds([]); setShowSuggestionsPanel(false); }} className="text-[#3E2723] hover:text-red-600 text-xs font-bold uppercase flex items-center gap-1">
                                <i className="fa-solid fa-times"></i> Fermer
                            </button>
                          </div>

                          {/* Contenu Défilant */}
                          <div className="flex-1 overflow-x-auto p-4 flex gap-4 items-center">
                            
                            {/* CAS 0 : Pas de suggestions (Tout est bon) */}
                            {!isMultiSelectionMode && !hasSuggestions && (
                                <div className="w-full h-full flex flex-col items-center justify-center text-[#5D4037]/60">
                                    <i className="fa-solid fa-check-circle text-4xl text-[#5D4037] mb-2"></i>
                                    <p className="text-sm font-bold uppercase">Votre plan répond à vos objectifs !</p>
                                    <p className="text-xs">Aucune culture supplémentaire nécessaire.</p>
                                </div>
                            )}

                            {/* CAS 1 : Mode Sélection Multiple */}
                            {isMultiSelectionMode && multiSelectedIds.map((id) => {
                              const p = displayedPlots.find(plot => plot.id === id);
                              if(!p) return null;
                              const cult = CULTURES.find(c => c.id === p.plantedCultureId);
                              return (
                                <div key={id} className="shrink-0 w-48 bg-purple-100 border-2 border-[#5D4037] p-3 shadow-[4px_4px_0px_0px_#5D4037] flex flex-col gap-2 relative group hover:bg-red-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                      {cult ? (
                                        <div className="w-10 h-10 bg-white border-2 border-[#5D4037] flex items-center justify-center shrink-0">
                                          <img src={cult.image} className="w-8 h-8 object-contain" />
                                        </div>
                                      ) : (
                                        <div className="w-10 h-10 bg-gray-200 border-2 border-[#5D4037] flex items-center justify-center"><i className="fa-solid fa-cube text-gray-400"></i></div>
                                      )}
                                      <div className="overflow-hidden">
                                        <h4 className="font-black text-[#3E2723] text-xs leading-none truncate uppercase" title={p.name}>{p.name}</h4>
                                        <span className="text-[10px] font-bold text-gray-600 block mt-1">{p.width}m x {p.height}m</span>
                                      </div>
                                    </div>
                                    {/* Bouton de suppression individuel au survol */}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleIndividualDelete(id); }}
                                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Supprimer cet élément"
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                              )
                            })}

                            {/* CAS 2 : Mode Suggestions (Si pas de sélection multiple) */}
                            {!isMultiSelectionMode && hasSuggestions && suggestions.map((sug, idx) => {
                              const cult = CULTURES.find(c => c.id === sug.cultureId);
                              if(!cult) return null;
                              return (
                                <div 
                                  key={idx} 
                                  className={`shrink-0 w-64 bg-white border-2 border-[#5D4037] p-3 shadow-[4px_4px_0px_0px_#5D4037] transition-all flex flex-col gap-2 relative group cursor-pointer hover:bg-lime-50 hover:translate-x-[-1px] hover:translate-y-[-1px] ${sug.selected ? 'ring-2 ring-lime-500' : ''}`}
                                  onClick={() => toggleSuggestionSelection(sug.cultureId)}
                                >
                                    <div className="absolute top-2 right-2">
                                      {sug.selected ? <i className="fa-solid fa-square-check text-lime-600 text-lg"></i> : <i className="fa-regular fa-square text-gray-300 text-lg"></i>}
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-gray-100 border-2 border-[#5D4037] flex items-center justify-center shrink-0">
                                        <img src={cult.image} className="w-8 h-8 object-contain" />
                                      </div>
                                      <div>
                                        <h4 className="font-black text-[#3E2723] text-sm leading-none uppercase">{cult.name}</h4>
                                        <span className="text-[10px] font-bold text-red-500 bg-red-100 px-1 border border-[#5D4037] mt-1 inline-block">Manque {sug.missingPlants} plants</span>
                                      </div>
                                    </div>
                                    <div className="bg-gray-100 border border-[#5D4037] p-2 text-[10px] text-gray-600 flex justify-between mt-1">
                                      <span className="font-bold">Suggéré:</span>
                                      <span className="font-black text-[#3E2723]">{sug.suggestedWidth}m x {sug.suggestedHeight}m</span>
                                    </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentTab === 'calendar' && (
                <div className="h-full w-full overflow-y-auto bg-white">
                  <GlobalCalendar />
                </div>
              )}

              {currentTab === 'sufficiency' && (
                <div className="h-full w-full overflow-hidden bg-[#EFEBE9]">
                  <AutosufficiencyTab config={config} onConfigChange={setConfig} plots={plots} onRequestPlanning={handleRequestPlanningFromVivier} onOpenCultureDetails={handleOpenCultureDetails} />
                </div>
              )}
            </main>

            {/* Overlay Panel (Détails Culture ou Editeur Parcelle) - MOVED HERE FOR GLOBAL ACCESS */}
            <div 
              className={`fixed inset-y-0 right-0 z-[60] transform transition-transform duration-300 ease-out shadow-2xl ${
                selectedCulture || selectedPlot ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <div className="h-full bg-white flex flex-col border-l-4 border-[#3E2723] w-[450px] max-w-[90vw] shadow-[-10px_0px_20px_rgba(0,0,0,0.1)]">
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
        </div>
      )}
    </>
  );
};

export default App;
