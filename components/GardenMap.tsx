
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plot, Culture, GardenConfig } from '../types';
import { CULTURES, CATEGORY_COLORS } from '../constants';

interface GardenMapProps {
  plots: Plot[];
  onSelectPlot: (plot: Plot) => void;
  onUpdatePlot: (plot: Plot) => void;
  onAddPlot: (plot: Plot) => void;
  onConfigChange: (config: GardenConfig) => void;
  selectedPlotId: string | null;
  multiSelectedIds: string[];
  onMultiSelect: (ids: string[]) => void;
  config: GardenConfig;
  onPrint?: () => void;
  onMissClick?: () => void;
  isCalibrating: boolean;
  showSunPath: boolean;
  onCloseCalibration?: () => void;
  onEnterGreenhouse?: (plotId: string) => void; 
  isInsideGreenhouse?: boolean; 
}

type ToolType = 'pan' | 'select';

const GardenMap: React.FC<GardenMapProps> = ({ 
  plots, onSelectPlot, onUpdatePlot, onAddPlot, onConfigChange, 
  selectedPlotId, multiSelectedIds, onMultiSelect, config, onPrint, onMissClick, isCalibrating, showSunPath, onCloseCalibration, onEnterGreenhouse, isInsideGreenhouse
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [viewTransform, setViewTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [wrapperSize, setWrapperSize] = useState({ width: 0, height: 0 });
  const [activeTool, setActiveTool] = useState<ToolType>('pan');
  const [selectionBox, setSelectionBox] = useState<{ startX: number, startY: number, endX: number, endY: number } | null>(null);
  
  const [sunTime, setSunTime] = useState(12);
  const [isSunPlaying, setIsSunPlaying] = useState(false);

  const plotsRef = useRef(plots);
  const configRef = useRef(config);
  const viewTransformRef = useRef(viewTransform);

  const resizeTerrainOp = useRef<{
      side: 'right' | 'bottom' | 'corner';
      startScreenX: number;
      startScreenY: number;
      startWidth: number;
      startHeight: number;
  } | null>(null);

  const dragOperation = useRef<{
    type: 'plot_move' | 'plot_resize' | 'plot_rotate' | 'bg_move' | 'view_pan' | 'selection_box';
    targetId?: string;
    grabOffsetX: number;
    grabOffsetY: number;
    startMouseX: number;
    startMouseY: number;
    initialObjW?: number;
    initialObjH?: number;
    initialRotation?: number;
    centerX?: number;
    centerY?: number;
    initialViewX?: number;
    initialViewY?: number;
    initialBgX?: number;
    initialBgY?: number;
    startAngle?: number; 
  } | null>(null);

  useEffect(() => { plotsRef.current = plots; }, [plots]);
  useEffect(() => { configRef.current = config; }, [config]);
  useEffect(() => { viewTransformRef.current = viewTransform; }, [viewTransform]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isSunPlaying && showSunPath) {
      interval = setInterval(() => {
        setSunTime(prev => (prev >= 20 ? 6 : prev + 0.1));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isSunPlaying, showSunPath]);

  const pixelsPerMeter = 40;
  const mapWidth = isInsideGreenhouse ? 20 : config.terrainWidth; 
  const mapHeight = isInsideGreenhouse ? 20 : config.terrainHeight;
  
  console.log("terrain:", config.terrainWidth, config.terrainHeight);
  const gridWidth = mapWidth * pixelsPerMeter;
  const gridHeight = mapHeight * pixelsPerMeter;

  // Conversion Coordonnées Souris -> Mètres Jardin
  const getMouseInGardenMeters = (clientX: number, clientY: number) => {
    if (!wrapperRef.current) return { x: 0, y: 0 };
    const rect = wrapperRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;
    const vt = viewTransformRef.current;
    
    // Application de la transformation inverse
    const gardenPixelX = (relativeX - vt.x) / vt.scale;
    const gardenPixelY = (relativeY - vt.y) / vt.scale;
    
    return { x: gardenPixelX / pixelsPerMeter, y: gardenPixelY / pixelsPerMeter };
  };
  
  const getMouseInGardenPixels = (clientX: number, clientY: number) => {
    const m = getMouseInGardenMeters(clientX, clientY);
    return { x: m.x * pixelsPerMeter, y: m.y * pixelsPerMeter };
  };

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setWrapperSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    resizeObserver.observe(wrapper);
    return () => resizeObserver.disconnect();
  }, []);

  // Centrage automatique (Initialisation)
  useEffect(() => {
    if (wrapperSize.width === 0 || wrapperSize.height === 0) return;
    
    const padding = 100; // Marge confortable pour l'affichage initial
    
    const scaleX = (wrapperSize.width - padding) / gridWidth;
    const scaleY = (wrapperSize.height - padding) / gridHeight;
    const newScale = Math.min(Math.min(scaleX, scaleY), 1.2);
    
    const newX = (wrapperSize.width - gridWidth * newScale) / 2;
    const newY = (wrapperSize.height - gridHeight * newScale) / 2;

    // On n'applique le centrage que si le scale est à 1 (état initial) ou si on change de mode (Serre/Jardin)
    // Cela évite de resetter la vue à chaque tout petit changement de taille de fenêtre non significatif
    setViewTransform({ x: newX, y: newY, scale: newScale });
    
  }, [mapWidth, mapHeight, gridWidth, gridHeight, wrapperSize.width, wrapperSize.height, isInsideGreenhouse]); 

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Coordonnées dans le référentiel du plan avant zoom
    const pointX = (mouseX - viewTransform.x) / viewTransform.scale;
    const pointY = (mouseY - viewTransform.y) / viewTransform.scale;

    const zoomIntensity = 0.1;
    const delta = e.deltaY > 0 ? -zoomIntensity : zoomIntensity;
    const newScale = Math.min(5, Math.max(0.1, viewTransform.scale * (1 + delta)));

    // Calcul de la nouvelle position pour que le point sous la souris reste stable
    const newX = mouseX - pointX * newScale;
    const newY = mouseY - pointY * newScale;

    setViewTransform({ x: newX, y: newY, scale: newScale });
  };

  const onGlobalMove = useCallback((e: MouseEvent) => {
    // Redimensionnement du Terrain
    if (resizeTerrainOp.current) {
        e.preventDefault();
        e.stopPropagation();
        const op = resizeTerrainOp.current;
        const scale = viewTransformRef.current.scale;
        
        const dxMeters = (e.clientX - op.startScreenX) / scale / pixelsPerMeter;
        const dyMeters = (e.clientY - op.startScreenY) / scale / pixelsPerMeter;

        let newW = op.startWidth;
        let newH = op.startHeight;
        
        if (op.side === 'right' || op.side === 'corner') newW = Math.max(2, op.startWidth + dxMeters);
        if (op.side === 'bottom' || op.side === 'corner') newH = Math.max(2, op.startHeight + dyMeters);

        onConfigChange({ ...configRef.current, terrainWidth: Number(newW.toFixed(2)), terrainHeight: Number(newH.toFixed(2)) });
        return;
    }

    if (!dragOperation.current) return;
    const op = dragOperation.current;
    
    // Pour le PAN
    if (op.type === 'view_pan') {
       setViewTransform(prev => ({ 
           ...prev, 
           x: (op.initialViewX || 0) + (e.clientX - op.startMouseX), 
           y: (op.initialViewY || 0) + (e.clientY - op.startMouseY) 
        }));
       return;
    }

    const mouseMeters = getMouseInGardenMeters(e.clientX, e.clientY);

    if (op.type === 'plot_move') {
        const plot = plotsRef.current.find(p => p.id === op.targetId);
        if (!plot) return;
        onUpdatePlot({ ...plot, x: Number((mouseMeters.x - op.grabOffsetX).toFixed(2)), y: Number((mouseMeters.y - op.grabOffsetY).toFixed(2)) });
    } 
    else if (op.type === 'plot_resize') {
        const plot = plotsRef.current.find(p => p.id === op.targetId);
        if (!plot) return;
        const startMeters = getMouseInGardenMeters(op.startMouseX, op.startMouseY);
        onUpdatePlot({ 
            ...plot, 
            width: Math.max(0.2, (op.initialObjW || 0) + (mouseMeters.x - startMeters.x)), 
            height: Math.max(0.2, (op.initialObjH || 0) + (mouseMeters.y - startMeters.y)) 
        });
    }
    else if (op.type === 'plot_rotate') {
        const plot = plotsRef.current.find(p => p.id === op.targetId);
        if (!plot) return;
        const mp = getMouseInGardenPixels(e.clientX, e.clientY);
        const currentAngleDeg = Math.atan2(mp.y - (op.centerY || 0), mp.x - (op.centerX || 0)) * (180 / Math.PI);
        let newRot = (op.initialRotation || 0) + (currentAngleDeg - (op.startAngle || 0));
        newRot = (newRot % 360 + 360) % 360;
        if (!e.shiftKey) newRot = Math.round(newRot / 5) * 5;
        onUpdatePlot({ ...plot, rotation: Math.round(newRot) });
    }
    else if (op.type === 'selection_box') {
       const curPos = getMouseInGardenMeters(e.clientX, e.clientY);
       const startPos = getMouseInGardenMeters(op.startMouseX, op.startMouseY);
       setSelectionBox({ startX: startPos.x, startY: startPos.y, endX: curPos.x, endY: curPos.y });
    }
    else if (op.type === 'bg_move') {
       const startMeters = getMouseInGardenMeters(op.startMouseX, op.startMouseY);
       onConfigChange({ 
           ...configRef.current, 
           backgroundX: (op.initialBgX || 0) + (mouseMeters.x - startMeters.x) * pixelsPerMeter, 
           backgroundY: (op.initialBgY || 0) + (mouseMeters.y - startMeters.y) * pixelsPerMeter 
        });
    }
  }, [onUpdatePlot, onConfigChange]);

  const onGlobalUp = useCallback((e: MouseEvent) => {
    if (resizeTerrainOp.current) { 
        resizeTerrainOp.current = null; 
        window.removeEventListener('mousemove', onGlobalMove, true);
        window.removeEventListener('mouseup', onGlobalUp, true);
        return; 
    }
    if (dragOperation.current?.type === 'selection_box') {
        const op = dragOperation.current;
        const endPos = getMouseInGardenMeters(e.clientX, e.clientY);
        const startPos = getMouseInGardenMeters(op.startMouseX, op.startMouseY);
        const x1 = Math.min(startPos.x, endPos.x), x2 = Math.max(startPos.x, endPos.x);
        const y1 = Math.min(startPos.y, endPos.y), y2 = Math.max(startPos.y, endPos.y);
        if (Math.abs(x2 - x1) > 0.1 && Math.abs(y2 - y1) > 0.1) {
          const ids = plotsRef.current.filter(p => (p.x < x2 && p.x + p.width > x1 && p.y < y2 && p.y + p.height > y1)).map(p => p.id);
          onMultiSelect(ids);
        } else { onMultiSelect([]); if (onMissClick) onMissClick(); }
        setSelectionBox(null);
    } 
    dragOperation.current = null;
    window.removeEventListener('mousemove', onGlobalMove);
    window.removeEventListener('mouseup', onGlobalUp);
  }, [onMultiSelect, onMissClick]);

  const handleContainerMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (isCalibrating) {
      e.preventDefault();
      dragOperation.current = { type: 'bg_move', grabOffsetX: 0, grabOffsetY: 0, startMouseX: e.clientX, startMouseY: e.clientY, initialBgX: config.backgroundX, initialBgY: config.backgroundY };
    } else if (activeTool === 'pan') {
       e.preventDefault();
       dragOperation.current = { type: 'view_pan', grabOffsetX: 0, grabOffsetY: 0, startMouseX: e.clientX, startMouseY: e.clientY, initialViewX: viewTransform.x, initialViewY: viewTransform.y };
    } else {
       e.preventDefault();
       onMultiSelect([]); 
       dragOperation.current = { type: 'selection_box', grabOffsetX: 0, grabOffsetY: 0, startMouseX: e.clientX, startMouseY: e.clientY };
    }
    window.addEventListener('mousemove', onGlobalMove);
    window.addEventListener('mouseup', onGlobalUp);
  };

  const handleTerrainResizeStart = (e: React.MouseEvent, side: 'right' | 'bottom' | 'corner') => {
      if (isInsideGreenhouse) return;
      e.stopPropagation(); e.preventDefault();
      resizeTerrainOp.current = { 
        side, 
        startScreenX: e.clientX, 
        startScreenY: e.clientY, 
        startWidth: config.terrainWidth, 
        startHeight: config.terrainHeight 
      };
      window.addEventListener('mousemove', onGlobalMove, true);
      window.addEventListener('mouseup', onGlobalUp, true);
  };

  const handlePlotMouseDown = (e: React.MouseEvent, plot: Plot, type: 'move' | 'resize' | 'rotate') => {
    if (isCalibrating) return;
    e.stopPropagation(); e.preventDefault();
    if (type === 'rotate' || type === 'resize' || plot.id !== selectedPlotId) onSelectPlot(plot);
    const m = getMouseInGardenMeters(e.clientX, e.clientY);
    const mp = getMouseInGardenPixels(e.clientX, e.clientY);
    const center = { x: (plot.x + plot.width/2) * pixelsPerMeter, y: (plot.y + plot.height/2) * pixelsPerMeter };
    dragOperation.current = {
        type: type === 'move' ? 'plot_move' : type === 'resize' ? 'plot_resize' : 'plot_rotate',
        targetId: plot.id, grabOffsetX: m.x - plot.x, grabOffsetY: m.y - plot.y, startMouseX: e.clientX, startMouseY: e.clientY,
        initialObjW: plot.width, initialObjH: plot.height, initialRotation: plot.rotation, centerX: center.x, centerY: center.y,
        startAngle: Math.atan2(mp.y - center.y, mp.x - center.x) * (180/Math.PI)
    };
    window.addEventListener('mousemove', onGlobalMove);
    window.addEventListener('mouseup', onGlobalUp);
  };

  const calculatePlantCapacity = (plot: Plot, culture?: Culture) => {
    if (!culture || plot.type !== 'culture') return 0;
    const rows = Math.floor((plot[plot.rowOrientation === 'vertical' ? 'width' : 'height'] * 100) / culture.spacingCm.betweenRows);
    const perRow = Math.floor((plot[plot.rowOrientation === 'vertical' ? 'height' : 'width'] * 100) / culture.spacingCm.betweenPlants);
    return Math.max(0, rows * perRow);
  };

  const getPlotColor = (plot: Plot) => {
    if (plot.color) return plot.color; 
    if (plot.type === 'culture' && plot.plantedCultureId) {
       const cult = CULTURES.find(c => c.id === plot.plantedCultureId);
       if (cult) return CATEGORY_COLORS[cult.category] || 'bg-[#D7CCC8]';
    }
    const colors: Record<string, string> = { greenhouse: 'bg-[#E0F7FA] border-[#006064]', coop: 'bg-[#8D6E63] border-[#3E2723]', beehive: 'bg-[#FFECB3] border-[#FF6F00]', building: 'bg-[#BCAAA4] border-[#3E2723]', tree: 'bg-[#558B2F] border-[#33691E]', pond: 'bg-[#4FC3F7] border-[#01579B]', water_tank: 'bg-[#4DD0E1] border-[#006064]', path: 'bg-[#D7CCC8] border-[#8D6E63] border-dashed' };
    return colors[plot.type] || 'bg-[#BCAAA4] border-[#3E2723]';
  };

  const calculateShadow = (plotHeight: number, type: string) => {
    if (!showSunPath) return {};
    const progress = (sunTime - 6) / 14, angle = progress * Math.PI;
    const shadowX = -Math.cos(angle) * 40, shadowY = -Math.sin(angle) * 40 * 0.5;
    return { filter: `drop-shadow(${shadowX}px ${shadowY}px 0px rgba(0,0,0,0.3))` };
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => { if (event.target?.result) { onConfigChange({...config, backgroundImage: event.target.result as string}); } };
      reader.readAsDataURL(file);
    }
  };

  const CardinalMarker = ({ label, position }: { label: string, position: string }) => {
    const pos = { north: "top-[-12px] left-1/2 -translate-x-1/2", south: "bottom-[-12px] left-1/2 -translate-x-1/2", east: "right-[-12px] top-1/2 -translate-y-1/2", west: "left-[-12px] top-1/2 -translate-y-1/2" }[position];
    return <div className={`absolute ${pos} z-30 flex items-center justify-center`}><div className="w-8 h-8 bg-[#3E2723] rounded-full border-2 border-[#D7CCC8] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] flex items-center justify-center select-none"><span className={`font-black text-xs ${label === 'N' ? 'text-red-500' : 'text-[#D7CCC8]'}`}>{label}</span></div></div>;
  };

  return (
    <div className="flex flex-col h-full relative group/map">
      {!isCalibrating && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-white border-2 border-[#5D4037] px-2 py-2 flex gap-4 animate-in fade-in slide-in-from-top-2 shadow-[4px_4px_0px_0px_#5D4037]">
           <button onClick={() => setActiveTool('pan')} className={`w-10 h-10 border-2 border-[#5D4037] flex items-center justify-center transition-all ${activeTool === 'pan' ? 'bg-[#5D4037] text-white translate-x-[2px] translate-y-[2px]' : 'bg-white text-[#5D4037] hover:bg-[#D7CCC8]'}`} title="Déplacer le plan (Main)"><i className="fa-solid fa-arrows-up-down-left-right"></i></button>
           <button onClick={() => setActiveTool('select')} className={`w-10 h-10 border-2 border-[#5D4037] flex items-center justify-center transition-all ${activeTool === 'select' ? 'bg-emerald-500 text-white translate-x-[2px] translate-y-[2px]' : 'bg-white text-[#5D4037] hover:bg-emerald-100'}`} title="Sélectionner par zone (Carré)"><i className="fa-regular fa-square-check"></i></button>
        </div>
      )}
      
      {/* OVERLAY SUN PATH */}
      {!isCalibrating && showSunPath && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 pointer-events-none">
           <div className="relative w-64 h-32 flex items-end justify-center pb-2">
             <div className="absolute bottom-0 w-64 h-32 border-t-2 border-r-2 border-l-2 border-stone-800 rounded-t-full opacity-50 border-dashed"></div>
             <div className="absolute w-8 h-8 bg-yellow-400 border-2 border-stone-800 flex items-center justify-center text-stone-800 z-10 transition-transform duration-75 ease-linear shadow-[2px_2px_0px_0px_rgba(62,39,35,1)]" style={{
                 transform: `translate(${(0.5 - (sunTime - 6) / 14) * 250}px, ${-Math.sin(((sunTime - 6) / 14) * Math.PI) * 60}px)`
             }}><i className="fa-solid fa-sun animate-spin-slow"></i></div>
           </div>
           <div className="bg-white border-2 border-stone-800 px-6 py-3 shadow-[4px_4px_0px_0px_rgba(62,39,35,1)] flex items-center gap-4 pointer-events-auto">
             <button onClick={() => setIsSunPlaying(!isSunPlaying)} className="w-10 h-10 border-2 border-stone-800 bg-yellow-400 text-stone-800 flex items-center justify-center hover:bg-yellow-500 transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[2px_2px_0px_0px_rgba(62,39,35,1)]"><i className={`fa-solid ${isSunPlaying ? 'fa-pause' : 'fa-play'}`}></i></button>
             <div className="flex flex-col w-48 gap-1">
               <div className="flex justify-between text-[10px] font-black text-stone-800 uppercase font-mono"><span>06h</span><span className="text-emerald-600 bg-emerald-100 px-1 border border-stone-800">{Math.floor(sunTime)}h{Math.floor((sunTime % 1) * 60).toString().padStart(2, '0')}</span><span>20h</span></div>
               <input type="range" min="6" max="20" step="0.1" value={sunTime} onChange={(e) => { setSunTime(parseFloat(e.target.value)); setIsSunPlaying(false); }} className="w-full h-2 bg-stone-200 border border-stone-800 rounded-none appearance-none cursor-pointer accent-stone-800" />
             </div>
           </div>
        </div>
      )}

      {/* OVERLAY CALIBRATION */}
      {isCalibrating && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-white text-stone-800 p-4 border-2 border-stone-800 shadow-[8px_8px_0px_0px_rgba(62,39,35,1)] flex flex-wrap items-center gap-4 animate-in slide-in-from-top-4 print:hidden w-[90%] max-w-4xl pr-12 relative">
             <div className="flex flex-col gap-1">
                 <label className="text-[9px] font-black uppercase text-stone-900 bg-yellow-200 px-1 inline-block border border-stone-800 font-mono">Image de Fond (Carte)</label>
                 <div className="flex gap-2">
                     <input type="text" value={config.backgroundImage || ''} onChange={(e) => onConfigChange({...config, backgroundImage: e.target.value})} className="bg-white border-2 border-stone-800 px-3 py-1.5 text-xs w-48 outline-none focus:bg-yellow-50 font-mono" placeholder="https://..."/><label className="bg-stone-200 hover:bg-stone-300 text-stone-900 border-2 border-stone-800 w-8 h-8 flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_0px_rgba(62,39,35,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"><i className="fa-solid fa-folder-open text-xs"></i><input type="file" accept="image/*" className="hidden" onChange={handleBackgroundUpload} /></label>
                 </div>
             </div>
             <div className="h-10 w-0.5 bg-stone-900 hidden md:block"></div>
             <div className="flex gap-4">
                 <div className="flex flex-col gap-1 w-24"><label className="text-[9px] font-black uppercase text-stone-900 flex justify-between font-mono"><span>Échelle</span><span>{config.backgroundScale.toFixed(2)}x</span></label><input type="range" min="0.1" max="3" step="0.05" value={config.backgroundScale} onChange={(e) => onConfigChange({...config, backgroundScale: parseFloat(e.target.value)})} className="h-1.5 bg-stone-200 border border-stone-800 appearance-none cursor-pointer accent-stone-900" /></div>
                 <div className="flex flex-col gap-1 w-24"><label className="text-[9px] font-black uppercase text-stone-900 flex justify-between font-mono"><span>Rotation</span><span>{config.backgroundRotation || 0}°</span></label><input type="range" min="0" max="360" step="1" value={config.backgroundRotation || 0} onChange={(e) => onConfigChange({...config, backgroundRotation: parseInt(e.target.value)})} className="h-1.5 bg-stone-200 border border-stone-800 appearance-none cursor-pointer accent-stone-900" /></div>
                 <div className="flex flex-col gap-1 w-24"><label className="text-[9px] font-black uppercase text-stone-900 flex justify-between font-mono"><span>Opacité</span><span>{Math.round(config.backgroundOpacity * 100)}%</span></label><input type="range" min="0" max="1" step="0.1" value={config.backgroundOpacity} onChange={(e) => onConfigChange({...config, backgroundOpacity: parseFloat(e.target.value)})} className="h-1.5 bg-stone-200 border border-stone-800 appearance-none cursor-pointer accent-stone-900" /></div>
             </div>
             <button onClick={onCloseCalibration} className="absolute top-2 right-2 text-stone-900 hover:text-red-500 transition-colors" title="Fermer"><i className="fa-solid fa-xmark text-lg"></i></button>
        </div>
      )}

      <div 
        ref={wrapperRef} 
        onWheel={handleWheel} 
        className={`flex-1 relative bg-[#A1887F] border-4 border-[#5D4037] shadow-inner overflow-hidden print:border-0 ${activeTool === 'pan' ? (isCalibrating ? 'cursor-move' : 'cursor-pan-technical') : 'cursor-crosshair'}`} 
        onMouseDown={handleContainerMouseDown}
      >
        <div style={{ transformOrigin: '0 0', transform: `translate(${viewTransform.x}px, ${viewTransform.y}px) scale(${viewTransform.scale})`, transition: 'transform 0.05s linear' }}>
          
          {/* Suppression des marges forcées ici pour corriger le zoom */}
          <div className="absolute top-0 left-0">
            {/* RESIZE HANDLES (Fluid Fix) */}
            {!isInsideGreenhouse && !isCalibrating && (
                <>
                <div onMouseDown={(e) => handleTerrainResizeStart(e, 'right')} className="absolute top-0 right-[-30px] w-10 h-full cursor-ew-resize flex items-center justify-center group z-50" style={{ height: gridHeight, left: gridWidth }}>
                    <div className="w-4 h-16 bg-white border-2 border-black rounded shadow-md hover:bg-yellow-300 transition-colors flex items-center justify-center"><i className="fa-solid fa-grip-lines-vertical text-[10px] text-black"></i></div>
                </div>
                <div onMouseDown={(e) => handleTerrainResizeStart(e, 'bottom')} className="absolute bottom-[-30px] left-0 w-full h-10 cursor-ns-resize flex items-center justify-center group z-50" style={{ width: gridWidth, top: gridHeight }}>
                    <div className="h-4 w-16 bg-white border-2 border-black rounded shadow-md hover:bg-yellow-300 transition-colors flex items-center justify-center"><i className="fa-solid fa-grip-lines text-[10px] text-black"></i></div>
                </div>
                <div onMouseDown={(e) => handleTerrainResizeStart(e, 'corner')} className="absolute w-10 h-10 bg-white border-2 border-black rounded-full cursor-nwse-resize flex items-center justify-center z-50 shadow-md hover:bg-yellow-300 transition-colors" style={{ top: gridHeight - 10, left: gridWidth - 10 }}>
                    <i className="fa-solid fa-arrows-up-down-left-right text-xs text-black"></i>
                </div>
                </>
            )}

            <div ref={containerRef} className={`relative shadow-[8px_8px_0px_0px_rgba(93,64,55,0.4)] border-2 border-[#5D4037] overflow-visible transition-colors duration-500 pattern-blueprint ${isInsideGreenhouse ? 'bg-cyan-50' : 'bg-[#D7CCC8]'}`} style={{ width: gridWidth, height: gridHeight, backgroundColor: showSunPath ? '#fffbeb' : undefined }}>
              <CardinalMarker label="N" position="north" />
              <CardinalMarker label="S" position="south" />
              <CardinalMarker label="E" position="east" />
              <CardinalMarker label="O" position="west" />

              {/* Background Image Layer */}
              {config.backgroundImage && (
                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" style={{ width: '100%', height: '100%' }}>
                    <div style={{
                        width: '100%', height: '100%',
                        backgroundImage: `url(${config.backgroundImage})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        backgroundSize: 'contain',
                        opacity: config.backgroundOpacity,
                        transform: `translate(${config.backgroundX}px, ${config.backgroundY}px) scale(${config.backgroundScale}) rotate(${config.backgroundRotation || 0}deg)`,
                        transformOrigin: 'center'
                    }}></div>
                </div>
              )}

              {/* Rulers */}
              <div className="absolute -top-8 left-0 h-8 flex" style={{ width: gridWidth }}><div className="w-full h-full relative">{Array.from({ length: Math.ceil(mapWidth) + 1 }).map((_, i) => (<div key={i} className="absolute h-full" style={{ left: i * pixelsPerMeter }}><div className="h-2 w-0.5 bg-[#5D4037] absolute bottom-0"></div><span className="absolute bottom-2 -left-1 text-[10px] text-[#5D4037] font-mono font-bold">{i}m</span></div>))}</div></div>
              <div className="absolute -left-8 top-0 w-8" style={{ height: gridHeight }}><div className="w-full h-full relative">{Array.from({ length: Math.ceil(mapHeight) + 1 }).map((_, i) => (<div key={i} className="absolute w-full" style={{ top: i * pixelsPerMeter }}><div className="w-2 h-0.5 bg-[#5D4037] absolute right-0"></div><span className="absolute right-3 -top-2 text-[10px] text-[#5D4037] font-mono font-bold">{i}m</span></div>))}</div></div>
              
              {/* Plots */}
              {plots.map(plot => {
                const isSelected = selectedPlotId === plot.id;
                const cult = CULTURES.find(c => c.id === plot.plantedCultureId);
                const capacity = calculatePlantCapacity(plot, cult);
                const shadow = calculateShadow(plot.height, plot.type);
                const plotColor = getPlotColor(plot);
                return (
                  <div key={plot.id} onMouseDown={(e) => handlePlotMouseDown(e, plot, 'move')} className={`absolute transition-shadow ${isSelected ? 'cursor-spade border-4 border-[#3E2723] z-40' : 'cursor-garden-tool border-2 border-[#5D4037] z-20'} ${isSelected ? 'shadow-[-4px_-4px_0px_0px_#5D4037]' : `hover:shadow-[-4px_-4px_0px_0px_rgba(62,39,35,0.8)] ${plotColor}`} ${plot.shape === 'circle' ? 'rounded-full' : 'rounded-none'} flex flex-col items-center justify-center select-none group/plot`} style={{ left: plot.x * pixelsPerMeter, top: plot.y * pixelsPerMeter, width: plot.width * pixelsPerMeter, height: plot.height * pixelsPerMeter, opacity: isCalibrating ? 0.3 : (plot.opacity ?? 0.8), transform: `rotate(${plot.rotation || 0}deg)`, backgroundColor: !plotColor.startsWith('bg-') ? plotColor : undefined, ...shadow }}>
                    <div className="relative z-10 flex flex-col items-center pointer-events-none text-center" style={{ transform: `rotate(-${plot.rotation || 0}deg)` }}><span className="text-[8px] font-black text-[#3E2723] uppercase drop-shadow-md bg-white/80 px-1 border border-[#5D4037] shadow-sm">{plot.name}</span>{cult && (<div className="flex flex-col items-center leading-none mt-1 gap-0.5"><span className="text-[7px] font-bold text-white bg-[#3E2723] px-1 border border-[#5D4037]">{capacity} plants</span></div>)}</div>
                    
                    {/* Bouton Entrer Serre */}
                    {isSelected && plot.type === 'greenhouse' && !isCalibrating && onEnterGreenhouse && (
                        <button onMouseDown={(e) => { e.stopPropagation(); onEnterGreenhouse(plot.id); }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan-400 text-black font-black text-[10px] px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all z-50 cursor-pointer pointer-events-auto uppercase tracking-widest hover:bg-cyan-300" style={{ transform: `translate(-50%, -50%) rotate(-${plot.rotation || 0}deg)` }}>
                            <i className="fa-solid fa-door-open mr-1"></i>Entrer
                        </button>
                    )}

                    {isSelected && !isCalibrating && (<><div onMouseDown={(e) => handlePlotMouseDown(e, plot, 'resize')} className="absolute bottom-[-6px] right-[-6px] w-6 h-6 bg-emerald-500 border-2 border-[#5D4037] cursor-se-resize z-50 rounded-full"></div><div onMouseDown={(e) => handlePlotMouseDown(e, plot, 'rotate')} className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-8 h-8 bg-white border-2 border-[#5D4037] flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_0px_#5D4037] z-50 rounded-full"><i className="fa-solid fa-rotate text-xs"></i><div className="absolute bottom-8 left-1/2 w-0.5 h-2 bg-[#5D4037] -translate-x-1/2"></div></div></>)}
                  </div>
                );
              })}
              {selectionBox && (<div className="absolute border-2 border-dashed border-emerald-600 bg-emerald-500/20 pointer-events-none z-50" style={{ left: Math.min(selectionBox.startX, selectionBox.endX) * pixelsPerMeter, top: Math.min(selectionBox.startY, selectionBox.endY) * pixelsPerMeter, width: Math.abs(selectionBox.endX - selectionBox.startX) * pixelsPerMeter, height: Math.abs(selectionBox.endY - selectionBox.startY) * pixelsPerMeter }}></div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GardenMap;
