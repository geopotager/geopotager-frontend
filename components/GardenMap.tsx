
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
}

type ToolType = 'pan' | 'select';

const GardenMap: React.FC<GardenMapProps> = ({ 
  plots, onSelectPlot, onUpdatePlot, onAddPlot, onConfigChange, 
  selectedPlotId, multiSelectedIds, onMultiSelect, config, onPrint, onMissClick, isCalibrating, showSunPath, onCloseCalibration
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [viewTransform, setViewTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [wrapperSize, setWrapperSize] = useState({ width: 0, height: 0 });
  const [activeTool, setActiveTool] = useState<ToolType>('pan');
  const [selectionBox, setSelectionBox] = useState<{ startX: number, startY: number, endX: number, endY: number } | null>(null);
  
  // Sun Simulation State
  const [sunTime, setSunTime] = useState(12); // 6h to 20h
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

  // Sun Animation Loop
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
  const gridWidth = config.terrainWidth * pixelsPerMeter;
  const gridHeight = config.terrainHeight * pixelsPerMeter;

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
  }, [config.terrainWidth, config.terrainHeight, gridWidth, gridHeight, wrapperSize]);

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
    if (plot.type === 'building') return 'bg-stone-200/90 border-stone-400';
    if (plot.type === 'tree') return 'bg-emerald-100/90 border-emerald-300';
    if (plot.type === 'pond') return 'bg-blue-100/90 border-blue-300';
    if (plot.type === 'water_tank') return 'bg-cyan-100/90 border-cyan-300';
    switch(plot.exposure) {
      case 'Soleil': return 'bg-amber-100/90 border-amber-300';
      case 'Mi-ombre': return 'bg-sky-100/90 border-sky-300';
      case 'Ombre': return 'bg-slate-200/90 border-slate-400';
      default: return 'bg-white/90 border-stone-200';
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
    }
  };

  // --- Shadow Calculation Logic ---
  // Sun travels from Right (East) to Left (West) via Bottom (South)
  // Shadow travels from Left (West) to Right (East) via Top (North)
  // Time: 6 (Sunrise) -> 13 (Noon) -> 20 (Sunset)
  const calculateShadow = (plotHeight: number, type: string) => {
    if (!showSunPath) return {};
    
    // Simplification: Sun goes 0 to PI
    // 6h -> 0 rad (East)
    // 13h -> PI/2 rad (South) - High elevation
    // 20h -> PI rad (West)
    const totalDay = 20 - 6;
    const progress = (sunTime - 6) / totalDay; // 0 to 1
    const angleRad = progress * Math.PI;

    // Shadow Direction (Opposite to sun)
    // Sun X: cos(angleRad) * distance (Starts at 1 (Right), goes to -1 (Left))
    // Sun Y: sin(angleRad) * distance (Starts at 0, goes to 1 (Bottom), back to 0)
    
    // Shadow Vector
    const shadowLenBase = type === 'tree' ? 100 : type === 'building' ? 80 : 10;
    
    // At noon (progress 0.5), shadow is shortest. At ends, longest.
    // Length factor: parabola-ish 
    const elevationFactor = Math.sin(angleRad); // 0 at ends, 1 at noon
    const shadowLen = shadowLenBase * (1 / (elevationFactor + 0.2)); 

    const sunX = Math.cos(angleRad); 
    const shadowX = -sunX * shadowLen; // Opposite X
    const shadowY = -Math.sin(angleRad) * shadowLen * 0.5; // Shadow points North (negative Y) when Sun is South (positive Y)

    return {
      filter: `drop-shadow(${shadowX}px ${shadowY}px 4px rgba(0,0,0,0.4))`
    };
  };

  // Calculate Sun Icon Position on Arc
  const getSunIconStyle = () => {
    const totalDay = 20 - 6;
    const progress = (sunTime - 6) / totalDay; 
    const angleRad = progress * Math.PI;
    
    // Arc radius
    const rx = 140;
    const ry = 80;
    
    // Center of arc widget
    const cx = 0; 
    const cy = 60; // baseline

    const x = cx + rx * Math.cos(Math.PI - angleRad); // Start Left (East visual on map bottom) -> actually let's match map logic
    // Map Logic: East is Right (positive X), West is Left (negative X). 
    // Wait, usually Maps: Right is East.
    // 6h (Sunrise East/Right) -> 20h (Sunset West/Left)
    const mapX = (0.5 - progress) * 250; // Ranges from +125 to -125
    const mapY = -Math.sin(angleRad) * 60; // Up arch

    return { transform: `translate(${mapX}px, ${mapY}px)` };
  };

  return (
    <div className="flex flex-col h-full relative group/map">
      
      {!isCalibrating && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-white shadow-lg border border-stone-200 rounded-full px-4 py-2 flex gap-4 animate-in fade-in slide-in-from-top-2">
           <button 
             onClick={() => setActiveTool('pan')}
             className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${activeTool === 'pan' ? 'bg-stone-800 text-white shadow-md scale-110' : 'text-stone-400 hover:bg-stone-100'}`}
             title="Déplacer le plan (Main)"
           >
             <i className="fa-solid fa-hand"></i>
           </button>
           <div className="w-px bg-stone-200 h-8"></div>
           <button 
             onClick={() => setActiveTool('select')}
             className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${activeTool === 'select' ? 'bg-emerald-600 text-white shadow-md scale-110' : 'text-stone-400 hover:bg-stone-100'}`}
             title="Sélectionner par zone (Carré)"
           >
             <i className="fa-regular fa-square-check"></i>
           </button>
        </div>
      )}

      {/* Sun Path Visualization & Control Overlay */}
      {!isCalibrating && showSunPath && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 pointer-events-none">
           
           {/* Visual Arc */}
           <div className="relative w-64 h-32 flex items-end justify-center pb-2">
              <div className="absolute bottom-0 w-64 h-32 border-t-2 border-r-2 border-l-2 border-amber-300 rounded-t-full opacity-50 border-dashed"></div>
              
              <div className="absolute w-8 h-8 bg-amber-400 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.8)] flex items-center justify-center text-white z-10 transition-transform duration-75 ease-linear" style={getSunIconStyle()}>
                 <i className="fa-solid fa-sun animate-spin-slow"></i>
              </div>
              
              <div className="absolute bottom-[-20px] w-full flex justify-between text-[10px] font-black text-amber-600 uppercase">
                 <span>Ouest (20h)</span>
                 <span>Sud (Midi)</span>
                 <span>Est (06h)</span>
              </div>
           </div>

           {/* Controls */}
           <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-2xl shadow-xl border border-amber-100 flex items-center gap-4 pointer-events-auto">
              <button 
                onClick={() => setIsSunPlaying(!isSunPlaying)}
                className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center hover:bg-amber-200 transition-colors"
              >
                <i className={`fa-solid ${isSunPlaying ? 'fa-pause' : 'fa-play'}`}></i>
              </button>
              
              <div className="flex flex-col w-48 gap-1">
                 <div className="flex justify-between text-[10px] font-bold text-stone-500">
                    <span>Matin</span>
                    <span className="text-amber-600">{Math.floor(sunTime)}h{Math.floor((sunTime % 1) * 60).toString().padStart(2, '0')}</span>
                    <span>Soir</span>
                 </div>
                 <input 
                   type="range" min="6" max="20" step="0.1"
                   value={sunTime}
                   onChange={(e) => { setSunTime(parseFloat(e.target.value)); setIsSunPlaying(false); }}
                   className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                 />
              </div>
           </div>
        </div>
      )}

      {isCalibrating && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-stone-900/95 backdrop-blur text-white p-4 rounded-3xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-top-4 border border-stone-700 print:hidden min-w-[650px] pr-12 relative">
           <div className="flex flex-col gap-1"><label className="text-[9px] font-black uppercase text-stone-400">Satellite (Image URL)</label><div className="flex gap-2"><input type="text" value={config.backgroundImage || ''} onChange={(e) => onConfigChange({...config, backgroundImage: e.target.value})} className="bg-stone-800 border border-stone-600 rounded-lg px-3 py-1.5 text-xs w-48 outline-none focus:border-emerald-500" placeholder="https://..."/><label className="bg-stone-700 hover:bg-stone-600 text-stone-300 w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"><i className="fa-solid fa-folder-open text-xs"></i><input type="file" accept="image/*" className="hidden" onChange={handleBackgroundUpload} /></label></div></div>
           <div className="h-10 w-px bg-stone-700"></div>
           <div className="flex flex-col gap-1 w-24"><label className="text-[9px] font-black uppercase text-stone-400 flex justify-between"><span>Échelle</span><span>{config.backgroundScale.toFixed(2)}x</span></label><input type="range" min="0.1" max="3" step="0.05" value={config.backgroundScale} onChange={(e) => onConfigChange({...config, backgroundScale: parseFloat(e.target.value)})} className="h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" /></div>
           <div className="flex flex-col gap-1 w-24"><label className="text-[9px] font-black uppercase text-stone-400 flex justify-between"><span>Rotation</span><span>{config.backgroundRotation || 0}°</span></label><input type="range" min="0" max="360" step="1" value={config.backgroundRotation || 0} onChange={(e) => onConfigChange({...config, backgroundRotation: parseInt(e.target.value)})} className="h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-blue-500" /></div>
           <div className="flex flex-col gap-1 w-24"><label className="text-[9px] font-black uppercase text-stone-400 flex justify-between"><span>Opacité</span><span>{Math.round(config.backgroundOpacity * 100)}%</span></label><input type="range" min="0" max="1" step="0.1" value={config.backgroundOpacity} onChange={(e) => onConfigChange({...config, backgroundOpacity: parseFloat(e.target.value)})} className="h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-purple-500" /></div>
           <div className="flex items-center ml-2 border-l border-stone-700 pl-4">
             <button onClick={() => onConfigChange({...config, backgroundImage: undefined})} className="text-red-400 hover:text-red-300 transition-colors" title="Supprimer l'image"><i className="fa-solid fa-trash"></i></button>
           </div>
           <button onClick={onCloseCalibration} className="absolute top-4 right-4 text-stone-500 hover:text-white transition-colors" title="Fermer"><i className="fa-solid fa-xmark text-lg"></i></button>
        </div>
      )}

      <div 
        ref={wrapperRef} 
        onWheel={handleWheel}
        className={`flex-1 relative bg-stone-100 rounded-[3rem] border-8 border-white shadow-inner overflow-hidden print:border-0 print:shadow-none print:rounded-none ${activeTool === 'pan' ? (isCalibrating ? 'cursor-move' : 'cursor-grab active:cursor-grabbing') : 'cursor-crosshair'}`}
        onMouseDown={handleContainerMouseDown}
      >
        <div style={{ transformOrigin: 'top left', transform: `translate(${viewTransform.x}px, ${viewTransform.y}px) scale(${viewTransform.scale})`, transition: 'transform 0.1s ease-out' }}>
          <div className="absolute top-0 left-0" style={{ marginLeft: 30, marginTop: 30 }}>
            <div 
              ref={containerRef}
              className="relative bg-white shadow-2xl border border-stone-200 overflow-visible transition-colors duration-500" 
              style={{ 
                width: gridWidth, 
                height: gridHeight, 
                backgroundImage: `linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)`, 
                backgroundSize: `${pixelsPerMeter}px ${pixelsPerMeter}px`,
                backgroundColor: showSunPath ? '#fffbeb' : '#ffffff' 
              }} 
            >
              
              {/* Sun Path Gradient Overlay - Dynamic Opacity */}
              {showSunPath && (
                <div 
                  className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-br from-amber-200 via-transparent to-blue-900 mix-blend-multiply transition-opacity duration-300"
                  style={{ opacity: sunTime > 18 ? 0.6 : 0.1 }}
                ></div>
              )}

              {/* Cardinal Points - Only visible when SunPath is ON */}
              {showSunPath && (
                <>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 font-black text-xl text-stone-400 select-none bg-white/80 px-2 rounded">N</div>
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 font-black text-xl text-amber-500 select-none bg-white/80 px-2 rounded">S</div>
                  <div className="absolute top-1/2 -right-8 -translate-y-1/2 font-black text-xl text-stone-400 select-none bg-white/80 px-2 rounded">E</div>
                  <div className="absolute top-1/2 -left-8 -translate-y-1/2 font-black text-xl text-stone-400 select-none bg-white/80 px-2 rounded">O</div>
                </>
              )}

              {config.backgroundImage && (
                <div 
                  className="absolute inset-0 pointer-events-none" 
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
              <div className="absolute -top-8 left-0 h-8 flex" style={{ width: gridWidth }}><div className="w-full h-full relative">{Array.from({ length: Math.ceil(config.terrainWidth) }).map((_, i) => (<div key={i} className="absolute h-full" style={{ left: i * pixelsPerMeter }}><div className="h-2 w-px bg-stone-300 absolute bottom-0"></div><span className="absolute bottom-2 -left-1 text-[10px] text-stone-400 font-mono">{i}m</span></div>))}</div></div>
              <div className="absolute -left-8 top-0 w-8" style={{ height: gridHeight }}><div className="w-full h-full relative">{Array.from({ length: Math.ceil(config.terrainHeight) }).map((_, i) => (<div key={i} className="absolute w-full" style={{ top: i * pixelsPerMeter }}><div className="w-2 h-px bg-stone-300 absolute right-0"></div><span className="absolute right-3 -top-2 text-[10px] text-stone-400 font-mono">{i}m</span></div>))}</div></div>

              {plots.map(plot => {
                const isSelected = selectedPlotId === plot.id;
                const isMultiSelected = multiSelectedIds.includes(plot.id);
                const culture = CULTURES.find(c => c.id === plot.plantedCultureId);
                const capacity = calculatePlantCapacity(plot, culture);

                // Calcul pour la visualisation des rangs
                let rowVisuals = [];
                if (culture) {
                  const rowSpacingPixels = (culture.spacingCm.betweenRows / 100) * pixelsPerMeter;
                  const numRows = Math.floor((plot.height * pixelsPerMeter) / rowSpacingPixels);
                  const totalRowHeight = numRows * rowSpacingPixels;
                  const startY = ((plot.height * pixelsPerMeter) - totalRowHeight) / 2 + (rowSpacingPixels / 2);

                  for(let i=0; i<numRows; i++) {
                     rowVisuals.push(startY + (i * rowSpacingPixels));
                  }
                }

                // Shadow Calculation
                const shadowStyle = showSunPath && (plot.type === 'building' || plot.type === 'tree' || plot.type === 'water_tank') 
                   ? calculateShadow(plot.height, plot.type)
                   : { boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' }; // Default tailwind shadow-sm

                return (
                  <div 
                    key={plot.id} 
                    onMouseDown={(e) => handlePlotMouseDown(e, plot, 'move')} 
                    className={`absolute cursor-move border-2 transition-transform duration-75 ${!showSunPath && 'transition-shadow'}
                        ${isSelected ? 'border-emerald-500 z-40 ring-4 ring-emerald-500/20' : 
                          isMultiSelected ? 'border-blue-500 z-30 ring-2 ring-blue-500/30' : 
                          `hover:border-stone-400 z-20 ${getPlotColor(plot)}`
                        } 
                        ${plot.shape === 'circle' ? 'rounded-full' : 'rounded-xl'} 
                        flex flex-col items-center justify-center select-none overflow-visible`} 
                    style={{ 
                        left: plot.x * pixelsPerMeter, 
                        top: plot.y * pixelsPerMeter, 
                        width: plot.width * pixelsPerMeter, 
                        height: plot.height * pixelsPerMeter, 
                        opacity: isCalibrating ? 0.3 : (plot.opacity ?? 0.8), 
                        transform: `rotate(${plot.rotation || 0}deg)`, 
                        backgroundColor: plot.color,
                        ...shadowStyle // Apply calculated shadow filter or box-shadow
                    }}
                  >
                    {/* Visualisation des rangs (Lignes) */}
                    {culture && rowVisuals.length > 0 && (
                      <div className="absolute inset-0 pointer-events-none opacity-30 overflow-hidden rounded-xl">
                        {rowVisuals.map((top, idx) => (
                           <div 
                             key={idx} 
                             className="absolute left-0 right-0 border-t-2 border-dashed border-stone-800"
                             style={{ top: top }}
                           ></div>
                        ))}
                      </div>
                    )}

                    {/* Image transparente (Icon mode) */}
                    {culture && (<div className={`absolute inset-0 opacity-20 pointer-events-none ${plot.shape === 'circle' ? 'rounded-full' : 'rounded-xl'}`} style={{ backgroundImage: `url(${culture.image})`, backgroundSize: '60%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}></div>)}
                    
                    <div className="relative z-10 flex flex-col items-center pointer-events-none"><span className="text-[7px] font-black text-stone-600 uppercase bg-white/70 px-1 rounded-sm">{plot.name}</span>{culture && <span className="text-lg font-black text-emerald-800 leading-none mt-1">{capacity}</span>}</div>

                    {isSelected && (
                      <>
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white text-stone-700 text-[9px] font-bold px-2 py-0.5 rounded-sm shadow whitespace-nowrap border border-stone-200 pointer-events-none">{plot.width.toFixed(2)}m</div>
                        <div className="absolute -left-5 top-1/2 -translate-y-1/2 bg-white text-stone-700 text-[9px] font-bold px-2 py-0.5 rounded-sm shadow whitespace-nowrap border border-stone-200 pointer-events-none" style={{ transform: `translateY(-50%) rotate(-90deg)`}}>{plot.height.toFixed(2)}m</div>
                      </>
                    )}

                    {/* Resize Handle */}
                    {isSelected && !isCalibrating && (
                      <div 
                        onMouseDown={(e) => handlePlotMouseDown(e, plot, 'resize')} 
                        className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 text-white rounded-tl-2xl flex items-center justify-center cursor-se-resize shadow-lg z-50 hover:bg-emerald-600 pointer-events-auto overflow-hidden"
                      >
                        <i className="fa-solid fa-up-right-and-down-left-from-center text-[10px]"></i>
                      </div>
                    )}

                    {/* Rotation Handle (Top Center, offset) */}
                    {isSelected && !isCalibrating && (
                        <div 
                           onMouseDown={(e) => handlePlotMouseDown(e, plot, 'rotate')}
                           className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border border-stone-300 rounded-full text-stone-600 flex items-center justify-center cursor-grabbing shadow-sm hover:bg-emerald-50 hover:text-emerald-600 z-50 pointer-events-auto"
                        >
                           <i className="fa-solid fa-rotate-right text-[10px]"></i>
                           <div className="absolute top-6 left-1/2 w-px h-2 bg-stone-400"></div>
                        </div>
                    )}
                  </div>
                );
              })}
              
              {/* Rectangle de sélection en cours */}
              {selectionBox && (
                 <div 
                   className="absolute border-2 border-emerald-500 bg-emerald-500/10 pointer-events-none z-50"
                   style={{
                     left: Math.min(selectionBox.startX, selectionBox.endX) * pixelsPerMeter,
                     top: Math.min(selectionBox.startY, selectionBox.endY) * pixelsPerMeter,
                     width: Math.abs(selectionBox.endX - selectionBox.startX) * pixelsPerMeter,
                     height: Math.abs(selectionBox.endY - selectionBox.startY) * pixelsPerMeter
                   }}
                 ></div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GardenMap;
