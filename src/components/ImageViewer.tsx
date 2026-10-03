import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  Maximize2,
  Minimize2,
  FileImage,
  Move
} from 'lucide-react';

interface ImageViewerProps {
  imageSrc: string;
  imageName?: string;
  fileSize?: string;
  onReplaceImage?: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  imageSrc,
  imageName = 'Uploaded Document',
  fileSize,
  onReplaceImage,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.3));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  
  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Enable pan anytime or especially when zoomed
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.1 : -0.1;
    setScale(prev => Math.min(Math.max(prev + zoomFactor, 0.3), 4));
  };

  // Reset view when image source changes
  useEffect(() => {
    handleReset();
  }, [imageSrc]);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col h-full bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden select-none transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'w-full'
      }`}
    >
      {/* Top Info Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 z-10">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <FileImage className="w-4 h-4" />
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              {imageName}
            </p>
            {fileSize && (
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {fileSize} • {Math.round(scale * 100)}% zoom
              </p>
            )}
          </div>
        </div>

        {onReplaceImage && (
          <button
            onClick={onReplaceImage}
            className="text-xs px-2.5 py-1 text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 font-medium transition-colors"
          >
            Change Image
          </button>
        )}
      </div>

      {/* Image Viewport Canvas */}
      <div
        className="relative flex-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
          className="max-w-none origin-center inline-block pointer-events-none"
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Source Table Document"
            className="max-h-[60vh] max-w-full object-contain rounded shadow-lg border border-slate-200/60 dark:border-slate-700/60"
            draggable={false}
          />
        </div>

        {/* Pan helper hint badge */}
        <div className="absolute top-3 left-3 pointer-events-none opacity-60 hover:opacity-100 transition-opacity">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-black/60 text-white text-[11px] backdrop-blur">
            <Move className="w-3 h-3" /> Drag to pan • Scroll to zoom
          </span>
        </div>
      </div>

      {/* Floating Action Controls HUD */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900/90 dark:bg-slate-800/95 text-white shadow-xl backdrop-blur-md border border-slate-700/50 z-20">
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-1.5 hover:bg-slate-700 rounded-full transition-colors active:scale-95"
          disabled={scale <= 0.3}
        >
          <ZoomOut className="w-4 h-4 text-slate-200" />
        </button>

        <span className="text-xs font-mono font-medium px-1.5 min-w-[42px] text-center text-slate-300">
          {Math.round(scale * 100)}%
        </span>

        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-1.5 hover:bg-slate-700 rounded-full transition-colors active:scale-95"
          disabled={scale >= 4}
        >
          <ZoomIn className="w-4 h-4 text-slate-200" />
        </button>

        <div className="w-[1px] h-4 bg-slate-700 mx-1" />

        <button
          onClick={handleRotate}
          title="Rotate 90°"
          className="p-1.5 hover:bg-slate-700 rounded-full transition-colors active:scale-95"
        >
          <RotateCw className="w-4 h-4 text-slate-200" />
        </button>

        <button
          onClick={handleReset}
          title="Reset Zoom & Pan"
          className="p-1.5 hover:bg-slate-700 rounded-full transition-colors active:scale-95"
        >
          <RefreshCw className="w-4 h-4 text-slate-200" />
        </button>

        <div className="w-[1px] h-4 bg-slate-700 mx-1" />

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          className="p-1.5 hover:bg-slate-700 rounded-full transition-colors active:scale-95"
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-slate-200" />
          ) : (
            <Maximize2 className="w-4 h-4 text-slate-200" />
          )}
        </button>
      </div>
    </div>
  );
};
