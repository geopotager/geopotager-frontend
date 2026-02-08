
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plot, Culture, GardenConfig } from '../types';
import { CULTURES } from '../constants';

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
  } | null>(null);

  useEffect(() => { plotsRef.current = plots; }, [plots]);
  useEffect(() => { configRef.current = config; }, [config]);
  useEffect(() => { viewTransformRef.current = viewTransform; }, [viewTransform]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isSunPlaying && showSunPath) {
      interval = setInterval(() => {
        setSunTime(prev => {
          if (prev >= 20) return 6;
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isSunPlaying, showSunPath]);

  const pixelsPerMeter = 40;
  const mapWidth = isInsideGreenhouse ? 20 : config.terrainWidth; 
  const mapHeight = isInsideGreenhouse ? 20 : config.terrainHeight; 
  const gridWidth = mapWidth * pixelsPerMeter;
  const gridHeight = mapHeight * pixelsPerMeter;

  const getMouseInGardenMeters = (clientX: number, clientY: number) => {
    if (!wrapperRef.current) return { x: 0, y: 0 };
    const rect = wrapperRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;
    const vt = viewTransformRef.current;
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

  useEffect(() => {
    if (wrapperSize.width === 0) return;
    const { width: wrapperWidth, height: wrapperHeight } = wrapperSize;
    const padding = 60;
    const scaleX = (wrapperWidth - padding) / gridWidth;
    const scaleY = (wrapperHeight - padding) / gridHeight;
    const scale = Math.min(scaleX, scaleY);
    const newX = (wrapperWidth - gridWidth * scale) / 2;
    const newY = (wrapperHeight - gridHeight * scale) / 2;
    if(viewTransform.scale === 1 && viewTransform.x === 0) {
       setViewTransform({ x: newX, y: newY, scale });
    }
  }, [mapWidth, mapHeight, gridWidth, gridHeight, wrapperSize]); 

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const zoomFactor = 1.1;
    const delta = e.deltaY > 0 ? 1 / zoomFactor : zoomFactor;
    const newScale = Math.min(5, Math.max(0.1, viewTransform.scale * delta));

    if (newScale !== viewTransform.scale) {
      const { width, height } = wrapperSize;
      const centerX = width / 2;
      const centerY = height / 2;
      const dx = (centerX - viewTransform.x) * (delta - 1);
      const dy = (centerY - viewTransform.y) * (delta - 1);

      setViewTransform(prev => ({
        scale: newScale,
        x: prev.x - dx,
        y: prev.y - dy
      }));
    }
  };

  const onGlobalMove = useCallback((e: MouseEvent) => {
    if (!dragOperation.current) return;
    const op = dragOperation.current;
    const currentConfig = configRef.current;
    const mouseMeters = getMouseInGardenMeters(e.clientX, e.clientY);

    if (op.type === 'plot_move') {
        const plot = plotsRef.current.find(p => p.id === op.targetId);
        if (!plot) return;
        let newX = mouseMeters.x - op.grabOffsetX;
        let newY = mouseMeters.y - op.grabOffsetY;
        onUpdatePlot({ ...plot, x: Number(newX.toFixed(2)), y: Number(newY.toFixed(2)) });
    } 
    else if (op.type === 'plot_resize') {
        const plot = plotsRef.current.find(p => p.id === op.targetId);
        if (!plot) return;
        const startMeters = getMouseInGardenMeters(op.startMouseX, op.startMouseY);
        const deltaX = mouseMeters.x - startMeters.x;
        const deltaY = mouseMeters.y - startMeters.y;
        const newW = Math.max(0.2, (op.initialObjW || 0) + deltaX);
        const newH = Math.max(0.2, (op.initialObjH || 0) + deltaY);
        onUpdatePlot({ ...plot, width: Number(newW.toFixed(2)), height: Number(newH.toFixed(2)) });
    }
    else if (op.type === 'plot_rotate') {
        const plot = plotsRef.current.find(p => p.id === op.targetId);
        if (!plot) return;
        const mp = getMouseInGardenPixels(e.clientX, e.clientY);
        const angleRad = Math.atan2(mp.y - (op.centerY || 0), mp.x - (op.centerX || 0));
        let angleDeg = angleRad * (180 / Math.PI) + 90; 
        if (!e.shiftKey) {
          angleDeg = Math.round(angleDeg / 5) * 5;
        }
        onUpdatePlot({ ...plot, rotation: Math.round(angleDeg) });
    }
    else if (op.type === 'view_pan') {
       const dx = e.clientX - op.startMouseX;
       const dy = e.clientY - op.startMouseY;
       setViewTransform(prev => ({
         ...prev,
         x: (op.initialViewX || 0) + dx,
         y: (op.initialViewY || 0) + dy
       }));
    }
    else if (op.type === 'selection_box') {
       const currentPos = getMouseInGardenMeters(e.clientX, e.clientY);
       const startPos = getMouseInGardenMeters(op.startMouseX, op.startMouseY);
       setSelectionBox({
         startX: startPos.x,
         startY: startPos.y,
         endX: currentPos.x,
         endY: currentPos.y
       });
    }
    else if (op.type === 'bg_move') {
       const startMeters = getMouseInGardenMeters(op.startMouseX, op.startMouseY);
       const dxPixels = (mouseMeters.x - startMeters.x) * pixelsPerMeter;
       const dyPixels = (mouseMeters.y - startMeters.y) * pixelsPerMeter;
       onConfigChange({
         ...currentConfig,
         backgroundX: (op.initialBgX || 0) + dxPixels,
         backgroundY: (op.initialBgY || 0) + dyPixels
       });
    }
  }, [onUpdatePlot, onConfigChange]);

  const onGlobalUp = useCallback((e: MouseEvent) => {
    if (dragOperation.current?.type === 'selection_box') {
        const op = dragOperation.current;
        const endPos = getMouseInGardenMeters(e.clientX, e.clientY);
        const startPos = getMouseInGardenMeters(op.startMouseX, op.startMouseY);

        const x1 = Math.min(startPos.x, endPos.x);
        const x2 = Math.max(startPos.x, endPos.x);
        const y1 = Math.min(startPos.y, endPos.y);
        const y2 = Math.max(startPos.y, endPos.y);
        
        if (Math.abs(x2 - x1) > 0.1 && Math.abs(y2 - y1) > 0.1) {
          const foundIds = plotsRef.current.filter(p => {
            const pRight = p.x + p.width;
            const pBottom = p.y + p.height;
            return (p.x < x2 && pRight > x1 && p.y < y2 && pBottom > y1);
          }).map(p => p.id);
          
          onMultiSelect(foundIds);
        } else {
          onMultiSelect([]);
          if (onMissClick) onMissClick();
        }
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
      dragOperation.current = {
        type: 'bg_move', grabOffsetX: 0, grabOffsetY: 0, startMouseX: e.clientX, startMouseY: e.clientY,
        initialBgX: config.backgroundX, initialBgY: config.backgroundY
      };
      window.addEventListener('mousemove', onGlobalMove);
      window.addEventListener('mouseup', onGlobalUp);
      return;
    }

    if (activeTool === 'pan') {
       e.preventDefault();
       dragOperation.current = {
        type: 'view_pan', grabOffsetX: 0, grabOffsetY: 0, startMouseX: e.clientX, startMouseY: e.clientY,
        initialViewX: viewTransform.x, initialViewY: viewTransform.y
      };
    } else {
       e.preventDefault();
       onMultiSelect([]); 
       dragOperation.current = {
         type: 'selection_box', grabOffsetX: 0, grabOffsetY: 0, startMouseX: e.clientX, startMouseY: e.clientY
       };
    }
    
    window.addEventListener('mousemove', onGlobalMove);
    window.addEventListener('mouseup', onGlobalUp);
  };

  const handlePlotMouseDown = (e: React.MouseEvent, plot: Plot, type: 'move' | 'resize' | 'rotate') => {
    if (isCalibrating) return;
    e.stopPropagation(); 
    e.preventDefault();
    
    if (type === 'rotate' || type === 'resize') {
       onSelectPlot(plot); 
    } else {
      if (plot.id !== selectedPlotId) onSelectPlot(plot);
    }

    const mouseMeters = getMouseInGardenMeters(e.clientX, e.clientY);
    const plotCenterPixels = {
       x: (plot.x + plot.width/2) * pixelsPerMeter,
       y: (plot.y + plot.height/2) * pixelsPerMeter
    };

    dragOperation.current = {
        type: type === 'move' ? 'plot_move' : type === 'resize' ? 'plot_resize' : 'plot_rotate',
        targetId: plot.id,
        grabOffsetX: mouseMeters.x - plot.x,
        grabOffsetY: mouseMeters.y - plot.y,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        initialObjW: plot.width,
        initialObjH: plot.height,
        initialRotation: plot.rotation,
        centerX: plotCenterPixels.x,
        centerY: plotCenterPixels.y
    };
    window.addEventListener('mousemove', onGlobalMove);
    window.addEventListener('mouseup', onGlobalUp);
  };

  const calculatePlantCapacity = (plot: Plot, culture?: Culture) => {
    if (!culture || plot.type !== 'culture') return 0;
    const rows = Math.floor((plot.height * 100) / culture.spacingCm.betweenRows);
    const plantsPerRow = Math.floor((plot.width * 100) / culture.spacingCm.betweenPlants);
    return Math.max(0, rows * plantsPerRow);
  };

  const getPlotColor = (plot: Plot) => {
    if(plot.color) return ''; 
    if (plot.type === 'greenhouse') return 'bg-cyan-100/50 border-stone-900';
    if (plot.type === 'coop') return 'bg-amber-700/80 border-stone-900';
    if (plot.type === 'beehive') return 'bg-yellow-400 border-stone-900';
    if (plot.type === 'building') return 'bg-stone-400 border-stone-900';
    if (plot.type === 'tree') return 'bg-green-800/80 border-stone-900';
    if (plot.type === 'pond') return 'bg-blue-600/50 border-stone-900';
    if (plot.type === 'water_tank') return 'bg-cyan-600 border-stone-900';
    if (plot.type === 'path') return 'bg-stone-300 border-stone-500 border-dashed';
    switch(plot.exposure) {
      case 'Soleil': return 'bg-[#8B4513]/10 border-stone-900'; // Terre légère
      case 'Mi-ombre': return 'bg-[#5D4037]/20 border-stone-900';
      case 'Ombre': return 'bg-[#3E2723]/30 border-stone-900';
      default: return 'bg-[#8B4513]/10 border-stone-900';
    }
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
           onConfigChange({...config, backgroundImage: event.target.result as string});
        }
      };
      reader.readAsDataURL(file);
      // Reset value to allow re-uploading same file if needed
      e.target.value = '';
    }
  };

  const calculateShadow = (plotHeight: number, type: string) => {
    if (!showSunPath) return {};
    
    const totalDay = 20 - 6;
    const progress = (sunTime - 6) / totalDay; 
    const angleRad = progress * Math.PI;

    const shadowLenBase = type === 'tree' ? 100 : type === 'building' || type === 'greenhouse' ? 80 : 10;
    const elevationFactor = Math.sin(angleRad);
    const shadowLen = shadowLenBase * (1 / (elevationFactor + 0.2)); 

    const sunX = Math.cos(angleRad); 
    const shadowX = -sunX * shadowLen; 
    const shadowY = -Math.sin(angleRad) * shadowLen * 0.5;

    return {
      filter: `drop-shadow(${shadowX}px ${shadowY}px 0px rgba(0,0,0,0.5))`
    };
  };

  const getSunIconStyle = () => {
    const totalDay = 20 - 6;
    const progress = (sunTime - 6) / totalDay; 
    const angleRad = progress * Math.PI;
    const mapX = (0.5 - progress) * 250;
    const mapY = -Math.sin(angleRad) * 60; 
    return { transform: `translate(${mapX}px, ${mapY}px)` };
  };

  return (
    <div className="flex flex-col h-full relative group/map">
      
      {!isCalibrating && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-white border-2 border-stone-900 px-2 py-2 flex gap-4 animate-in fade-in slide-in-from-top-2 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
           <button 
             onClick={() => setActiveTool('pan')}
             className={`w-10 h-10 border-2 border-stone-900 flex items-center justify-center transition-all ${
               activeTool === 'pan' 
               ? 'bg-stone-900 text-white translate-x-[2px] translate-y-[2px] shadow-none' 
               : 'bg-white text-stone-900 hover:bg-stone-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]'
             }`}
             title="Déplacer le plan (Main)"
           >
             <i className="fa-solid fa-hand"></i>
           </button>
           
           <button 
             onClick={() => setActiveTool('select')}
             className={`w-10 h-10 border-2 border-stone-900 flex items-center justify-center transition-all ${
               activeTool === 'select' 
               ? 'bg-emerald-500 text-stone-900 translate-x-[2px] translate-y-[2px] shadow-none' 
               : 'bg-white text-stone-900 hover:bg-emerald-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]'
             }`}
             title="Sélectionner par zone (Carré)"
           >
             <i className="fa-regular fa-square-check"></i>
           </button>
        </div>
      )}

      {/* Sun Path */}
      {!isCalibrating && showSunPath && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 pointer-events-none">
           <div className="relative w-64 h-32 flex items-end justify-center pb-2">
              <div className="absolute bottom-0 w-64 h-32 border-t-2 border-r-2 border-l-2 border-stone-900 rounded-t-full opacity-50 border-dashed"></div>
              <div className="absolute w-8 h-8 bg-yellow-400 border-2 border-stone-900 flex items-center justify-center text-stone-900 z-10 transition-transform duration-75 ease-linear shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]" style={getSunIconStyle()}>
                 <i className="fa-solid fa-sun animate-spin-slow"></i>
              </div>
              <div className="absolute bottom-[-20px] w-full flex justify-between text-[10px] font-black text-stone-900 uppercase bg-white/50 px-2 rounded font-mono">
                 <span>Ouest (20h)</span>
                 <span>Sud (Midi)</span>
                 <span>Est (06h)</span>
              </div>
           </div>
           <div className="bg-white border-2 border-stone-900 px-6 py-3 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] flex items-center gap-4 pointer-events-auto">
              <button 
                onClick={() => setIsSunPlaying(!isSunPlaying)}
                className="w-10 h-10 border-2 border-stone-900 bg-yellow-300 text-stone-900 flex items-center justify-center hover:bg-yellow-400 transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]"
              >
                <i className={`fa-solid ${isSunPlaying ? 'fa-pause' : 'fa-play'}`}></i>
              </button>
              <div className="flex flex-col w-48 gap-1">
                 <div className="flex justify-between text-[10px] font-black text-stone-900 uppercase font-mono">
                    <span>Matin</span>
                    <span className="text-emerald-600 bg-emerald-100 px-1 border border-stone-900">{Math.floor(sunTime)}h{Math.floor((sunTime % 1) * 60).toString().padStart(2, '0')}</span>
                    <span>Soir</span>
                 </div>
                 <input 
                   type="range" min="6" max="20" step="0.1"
                   value={sunTime}
                   onChange={(e) => { setSunTime(parseFloat(e.target.value)); setIsSunPlaying(false); }}
                   className="w-full h-2 bg-stone-200 border border-stone-900 rounded-none appearance-none cursor-pointer accent-stone-900"
                 />
              </div>
           </div>
        </div>
      )}

      {/* Satellite Calibration Panel */}
      {isCalibrating && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-white text-stone-900 p-4 border-2 border-stone-900 shadow-[8px_8px_0px_0px_rgba(28,25,23,1)] flex items-center gap-6 animate-in slide-in-from-top-4 print:hidden min-w-[650px] pr-12 relative">
           <div className="flex flex-col gap-1">
             <label className="text-[9px] font-black uppercase text-stone-900 bg-yellow-200 px-1 inline-block border border-stone-900 font-mono">Satellite (Image URL)</label>
             <div className="flex gap-2">
               <input type="text" value={config.backgroundImage || ''} onChange={(e) => onConfigChange({...config, backgroundImage: e.target.value})} className="bg-white border-2 border-stone-900 px-3 py-1.5 text-xs w-48 outline-none focus:bg-yellow-50 font-mono" placeholder="https://..."/>
               <label className="bg-stone-200 hover:bg-stone-300 text-stone-900 border-2 border-stone-900 w-8 h-8 flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                 <i className="fa-solid fa-folder-open text-xs"></i>
                 <input type="file" accept="image/*" className="hidden" onChange={handleBackgroundUpload} />
               </label>
             </div>
           </div>
           <div className="h-10 w-0.5 bg-stone-900"></div>
           <div className="flex flex-col gap-1 w-24"><label className="text-[9px] font-black uppercase text-stone-900 flex justify-between font-mono"><span>Échelle</span><span>{config.backgroundScale.toFixed(2)}x</span></label><input type="range" min="0.1" max="3" step="0.05" value={config.backgroundScale} onChange={(e) => onConfigChange({...config, backgroundScale: parseFloat(e.target.value)})} className="h-1.5 bg-stone-200 border border-stone-900 appearance-none cursor-pointer accent-stone-900" /></div>
           <div className="flex flex-col gap-1 w-24"><label className="text-[9px] font-black uppercase text-stone-900 flex justify-between font-mono"><span>Rotation</span><span>{config.backgroundRotation || 0}°</span></label><input type="range" min="0" max="360" step="1" value={config.backgroundRotation || 0} onChange={(e) => onConfigChange({...config, backgroundRotation: parseInt(e.target.value)})} className="h-1.5 bg-stone-200 border border-stone-900 appearance-none cursor-pointer accent-stone-900" /></div>
           <div className="flex flex-col gap-1 w-24"><label className="text-[9px] font-black uppercase text-stone-900 flex justify-between font-mono"><span>Opacité</span><span>{Math.round(config.backgroundOpacity * 100)}%</span></label><input type="range" min="0" max="1" step="0.1" value={config.backgroundOpacity} onChange={(e) => onConfigChange({...config, backgroundOpacity: parseFloat(e.target.value)})} className="h-1.5 bg-stone-200 border border-stone-900 appearance-none cursor-pointer accent-stone-900" /></div>
           <div className="flex items-center ml-2 border-l-2 border-stone-900 pl-4">
             <button onClick={() => onConfigChange({...config, backgroundImage: undefined})} className="text-red-500 hover:text-red-700 transition-colors" title="Supprimer l'image"><i className="fa-solid fa-trash"></i></button>
           </div>
           <button onClick={onCloseCalibration} className="absolute top-4 right-4 text-stone-900 hover:text-red-500 transition-colors" title="Fermer"><i className="fa-solid fa-xmark text-lg"></i></button>
        </div>
      )}

      <div 
        ref={wrapperRef} 
        onWheel={handleWheel}
        className={`flex-1 relative bg-stone-300 border-4 border-stone-900 shadow-inner overflow-hidden print:border-0 print:shadow-none ${activeTool === 'pan' ? (isCalibrating ? 'cursor-move' : 'cursor-grab active:cursor-grabbing') : 'cursor-crosshair'}`}
        onMouseDown={handleContainerMouseDown}
      >
        <div style={{ transformOrigin: 'top left', transform: `translate(${viewTransform.x}px, ${viewTransform.y}px) scale(${viewTransform.scale})`, transition: 'transform 0.1s ease-out' }}>
          <div className="absolute top-0 left-0" style={{ marginLeft: 30, marginTop: 30 }}>
            <div 
              ref={containerRef}
              className={`relative shadow-[8px_8px_0px_0px_rgba(28,25,23,0.2)] border-2 border-stone-900 overflow-visible transition-colors duration-500 pattern-blueprint ${isInsideGreenhouse ? 'bg-cyan-50' : 'bg-[#f0f4f8]'}`}
              style={{ 
                width: gridWidth, 
                height: gridHeight, 
                backgroundColor: showSunPath ? '#fffbeb' : (isInsideGreenhouse ? '#ecfeff' : '#f0f4f8') 
              }} 
            >
              
              {/* Permanent Cardinal Points - BIGGER AND MORE VISIBLE */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 font-black text-2xl text-red-700 bg-white/90 border-2 border-stone-900 px-3 py-1 rounded shadow-lg select-none z-30">N</div>
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 font-black text-2xl text-stone-700 bg-white/90 border-2 border-stone-900 px-3 py-1 rounded shadow-lg select-none z-30">S</div>
              <div className="absolute top-1/2 -right-12 -translate-y-1/2 font-black text-2xl text-stone-700 bg-white/90 border-2 border-stone-900 px-3 py-1 rounded shadow-lg select-none z-30">E</div>
              <div className="absolute top-1/2 -left-12 -translate-y-1/2 font-black text-2xl text-stone-700 bg-white/90 border-2 border-stone-900 px-3 py-1 rounded shadow-lg select-none z-30">O</div>

              {showSunPath && (
                <div 
                  className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-br from-yellow-200/40 via-transparent to-blue-900/10 mix-blend-multiply transition-opacity duration-300"
                  style={{ opacity: sunTime > 18 ? 0.6 : 0.2 }}
                ></div>
              )}

              {config.backgroundImage && (
                <div 
                  className="absolute inset-0 pointer-events-none z-0" 
                  style={{ 
                    backgroundImage: `url(${config.backgroundImage})`, 
                    backgroundRepeat: 'no-repeat', 
                    backgroundPosition: 'center center', 
                    backgroundSize: 'contain', 
                    transform: `translate(${config.backgroundX}px, ${config.backgroundY}px) scale(${config.backgroundScale}) rotate(${config.backgroundRotation || 0}deg)`, 
                    transformOrigin: 'center center', 
                    opacity: config.backgroundOpacity, width: '100%', height: '100%', minWidth: '100%', minHeight: '100%'
                  }}
                />
              )}

              {/* Rulers */}
              <div className="absolute -top-8 left-0 h-8 flex" style={{ width: gridWidth }}><div className="w-full h-full relative">{Array.from({ length: Math.ceil(mapWidth) }).map((_, i) => (<div key={i} className="absolute h-full" style={{ left: i * pixelsPerMeter }}><div className="h-2 w-0.5 bg-stone-900 absolute bottom-0"></div><span className="absolute bottom-2 -left-1 text-[10px] text-stone-500 font-mono font-bold">{i}m</span></div>))}</div></div>
              <div className="absolute -left-8 top-0 w-8" style={{ height: gridHeight }}><div className="w-full h-full relative">{Array.from({ length: Math.ceil(mapHeight) }).map((_, i) => (<div key={i} className="absolute w-full" style={{ top: i * pixelsPerMeter }}><div className="w-2 h-0.5 bg-stone-900 absolute right-0"></div><span className="absolute right-3 -top-2 text-[10px] text-stone-500 font-mono font-bold">{i}m</span></div>))}</div></div>

              {plots.map(plot => {
                const isSelected = selectedPlotId === plot.id;
                const isMultiSelected = multiSelectedIds.includes(plot.id);
                const culture = CULTURES.find(c => c.id === plot.plantedCultureId);
                const capacity = calculatePlantCapacity(plot, culture);
                const rows = culture ? Math.floor((plot.height * 100) / culture.spacingCm.betweenRows) : 0;

                const shadowStyle = showSunPath && (['building','tree','water_tank','greenhouse','coop'].includes(plot.type))
                   ? calculateShadow(plot.height, plot.type)
                   : { boxShadow: '4px 4px 0px 0px rgba(28,25,23,0.1)' };

                const borderStyle = isSelected ? 'border-4 border-stone-900 z-40' : 'border-2 border-stone-900 z-20';

                // Dessin Précis des rangs : calcul du pas en pixels
                const rowSpacingPx = culture ? (culture.spacingCm.betweenRows / 100) * pixelsPerMeter : 20;
                
                const furrowTexture = (plot.type === 'culture' && culture) ? {
                    backgroundImage: `repeating-linear-gradient(90deg, 
                        ${plot.exposure === 'Soleil' ? '#8B4513' : '#6D4C41'} 0px, 
                        ${plot.exposure === 'Soleil' ? '#8B4513' : '#6D4C41'} 2px, 
                        transparent 2px, 
                        transparent ${rowSpacingPx}px)`
                } : {};

                return (
                  <div 
                    key={plot.id} 
                    onMouseDown={(e) => handlePlotMouseDown(e, plot, 'move')} 
                    className={`absolute cursor-move transition-transform duration-75 ${!showSunPath && 'transition-shadow'}
                        ${borderStyle}
                        ${isSelected ? 'shadow-[4px_4px_0px_0px_#10b981]' : 
                          isMultiSelected ? 'border-blue-600 shadow-[4px_4px_0px_0px_#2563eb]' : 
                          `hover:shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] ${getPlotColor(plot)}`
                        } 
                        ${plot.shape === 'circle' ? 'rounded-full' : 'rounded-none'} 
                        flex flex-col items-center justify-center select-none overflow-visible group/plot`} 
                    style={{ 
                        left: plot.x * pixelsPerMeter, 
                        top: plot.y * pixelsPerMeter, 
                        width: plot.width * pixelsPerMeter, 
                        height: plot.height * pixelsPerMeter, 
                        opacity: isCalibrating ? 0.3 : (plot.opacity ?? 0.8), 
                        transform: `rotate(${plot.rotation || 0}deg)`, 
                        backgroundColor: plot.color,
                        ...shadowStyle 
                    }}
                  >
                    {/* Visual Texture for Greenhouse */}
                    {plot.type === 'greenhouse' && (
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.4)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.4)_50%,rgba(255,255,255,0.4)_75%,transparent_75%,transparent)] bg-[length:10px_10px] pointer-events-none"></div>
                    )}
                    
                    {/* Visual Texture for Coop */}
                    {plot.type === 'coop' && (
                        <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(0deg,transparent,transparent_10px,#000_10px,#000_12px)] pointer-events-none"></div>
                    )}

                    {culture && (
                      <div className="absolute inset-0 opacity-30 pointer-events-none" style={furrowTexture}></div>
                    )}

                    {culture && (<div className={`absolute inset-0 opacity-20 pointer-events-none ${plot.shape === 'circle' ? 'rounded-full' : ''}`} style={{ backgroundImage: `url(${culture.image})`, backgroundSize: '60%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}></div>)}
                    
                    <div className="relative z-10 flex flex-col items-center pointer-events-none transform -rotate-0 text-center">
                        <span className="text-[8px] font-normal text-stone-900 uppercase drop-shadow-md bg-white/50 px-1">{plot.name}</span>
                        {culture && (
                            <div className="flex flex-col items-center leading-none mt-0.5">
                                <span className="text-[7px] text-stone-800 drop-shadow-sm bg-white/40 px-0.5">{rows} rangs</span>
                                <span className="text-[7px] text-stone-700 drop-shadow-sm">{capacity} plts</span>
                            </div>
                        )}
                        {plot.type === 'coop' && <span className="text-[8px] text-amber-900 leading-none mt-0.5 drop-shadow-sm">{plot.chickenCount} poules</span>}
                        {plot.type === 'greenhouse' && <span className="text-[8px] text-cyan-900 leading-none mt-0.5 drop-shadow-sm">{(plot.subPlots?.length || 0)} zones</span>}
                    </div>

                    {/* Mesures Toujours Visibles (Permanent Measurements) */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white/90 border border-stone-900 text-stone-900 text-[8px] px-1 py-0.5 shadow-sm whitespace-nowrap pointer-events-none font-mono opacity-60 group-hover/plot:opacity-100">{plot.width.toFixed(1)}m</div>
                    <div className="absolute -left-6 top-1/2 -translate-y-1/2 bg-white/90 border border-stone-900 text-stone-900 text-[8px] px-1 py-0.5 shadow-sm whitespace-nowrap pointer-events-none font-mono opacity-60 group-hover/plot:opacity-100" style={{ transform: `translateY(-50%) rotate(-90deg)`}}>{plot.height.toFixed(1)}m</div>

                    {isSelected && !isCalibrating && (
                      <div onMouseDown={(e) => handlePlotMouseDown(e, plot, 'resize')} className="absolute bottom-[-6px] right-[-6px] w-5 h-5 bg-emerald-500 border-2 border-stone-900 cursor-se-resize hover:bg-emerald-400 pointer-events-auto z-50"></div>
                    )}

                    {isSelected && !isCalibrating && (
                        <div onMouseDown={(e) => handlePlotMouseDown(e, plot, 'rotate')} className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-2 border-stone-900 text-stone-900 flex items-center justify-center cursor-grabbing shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] hover:bg-yellow-300 z-50 pointer-events-auto"><i className="fa-solid fa-rotate-right text-[10px]"></i><div className="absolute top-6 left-1/2 w-0.5 h-2 bg-stone-900"></div></div>
                    )}

                    {/* Bouton Entrer dans la Serre */}
                    {isSelected && plot.type === 'greenhouse' && !isCalibrating && onEnterGreenhouse && (
                        <button 
                            onMouseDown={(e) => { e.stopPropagation(); onEnterGreenhouse(plot.id); }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan-500 text-white font-black text-xs px-3 py-1 border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-110 transition-transform z-50 cursor-pointer pointer-events-auto"
                        >
                            ENTRER
                        </button>
                    )}
                  </div>
                );
              })}
              
              {selectionBox && (
                 <div className="absolute border-2 border-dashed border-emerald-600 bg-emerald-500/20 pointer-events-none z-50" style={{ left: Math.min(selectionBox.startX, selectionBox.endX) * pixelsPerMeter, top: Math.min(selectionBox.startY, selectionBox.endY) * pixelsPerMeter, width: Math.abs(selectionBox.endX - selectionBox.startX) * pixelsPerMeter, height: Math.abs(selectionBox.endY - selectionBox.startY) * pixelsPerMeter }}></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GardenMap;
