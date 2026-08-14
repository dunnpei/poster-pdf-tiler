'use client';

import React, { useRef, useEffect, useState } from 'react';
import { TileConfig, SourceMedia, TileRect } from '@/types/tiler';
import { calculateTileRects, getPaperDimensions } from '@/lib/tiler-math';
import { Layers, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface InteractiveCanvasProps {
  media: SourceMedia | null;
  config: TileConfig;
}

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({ media, config }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredTile, setHoveredTile] = useState<TileRect | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);

  useEffect(() => {
    if (!media || !canvasRef.current || !media.imageElement) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = media.imageElement;
    canvas.width = media.width;
    canvas.height = media.height;

    // Clear background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw base media image
    ctx.drawImage(img, 0, 0, media.width, media.height);

    // Calculate tile grid rectangles
    const tiles = calculateTileRects(media.width, media.height, config);
    const paper = getPaperDimensions(config.paperOrientation);

    // Overlap proportions
    const overlapRatioX = config.overlapMm / paper.widthMm;
    const overlapRatioY = config.overlapMm / paper.heightMm;

    // Draw grid overlays
    tiles.forEach((tile) => {
      const tileX = tile.normX * media.width;
      const tileY = tile.normY * media.height;
      const tileW = tile.normW * media.width;
      const tileH = tile.normH * media.height;

      const isHovered = hoveredTile?.id === tile.id;

      // Draw semi-transparent tile boundary box
      ctx.save();
      ctx.fillStyle = isHovered ? 'rgba(56, 189, 248, 0.25)' : 'rgba(14, 165, 233, 0.08)';
      ctx.strokeStyle = isHovered ? '#38bdf8' : 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = isHovered ? Math.max(3, media.width * 0.004) : Math.max(2, media.width * 0.002);

      ctx.fillRect(tileX, tileY, tileW, tileH);
      ctx.strokeRect(tileX, tileY, tileW, tileH);

      // Highlight overlap region if > 0
      if (config.overlapMm > 0) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.15)'; // Amber overlay for overlap bleed
        if (tile.col < config.cols) {
          const overlapW = tileW * overlapRatioX;
          ctx.fillRect(tileX + tileW - overlapW, tileY, overlapW, tileH);
        }
        if (tile.row < config.rows) {
          const overlapH = tileH * overlapRatioY;
          ctx.fillRect(tileX, tileY + tileH - overlapH, tileW, overlapH);
        }
      }

      // Draw Page Indicator Badge
      const badgeFontSize = Math.max(14, Math.round(media.height * 0.025));
      ctx.font = `bold ${badgeFontSize}px sans-serif`;

      const badgeText = `P${tile.id}`;
      const textMetrics = ctx.measureText(badgeText);
      const textW = textMetrics.width;
      const textH = badgeFontSize;

      const badgePadding = 10;
      const badgeX = tileX + 12;
      const badgeY = tileY + 12;

      // Badge background pill
      ctx.fillStyle = isHovered ? '#0284c7' : 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect
        ? ctx.roundRect(badgeX, badgeY, textW + badgePadding * 2, textH + badgePadding, 6)
        : ctx.fillRect(badgeX, badgeY, textW + badgePadding * 2, textH + badgePadding);
      ctx.fill();

      // Badge text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(badgeText, badgeX + badgePadding, badgeY + textH - 2);

      ctx.restore();
    });
  }, [media, config, hoveredTile]);

  // Handle canvas hover detection
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!media || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const tiles = calculateTileRects(media.width, media.height, config);
    const found = tiles.find((t) => {
      const x = t.normX * media.width;
      const y = t.normY * media.height;
      const w = t.normW * media.width;
      const h = t.normH * media.height;
      return mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
    });

    setHoveredTile(found || null);
  };

  if (!media) {
    return (
      <div className="flex h-full min-h-[450px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center text-slate-500">
        <Layers className="h-16 w-16 mb-4 opacity-30 text-sky-400" />
        <h4 className="text-lg font-medium text-slate-400">尚未載入媒體檔案</h4>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          請於上方上傳圖片或 PDF 檔案，系統將在此呈現高解析度互動分割預覽畫布。
        </p>
      </div>
    );
  }

  const tiles = calculateTileRects(media.width, media.height, config);

  return (
    <div className="relative flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-2xl overflow-hidden w-full h-full">
      {/* 畫布控制工具列 */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
        <span className="font-semibold text-sky-400">{media.fileName}</span>
        <span className="text-slate-600">|</span>
        <span className="font-mono">{media.width} x {media.height} px</span>
        <span className="text-slate-600">|</span>
        <span className="font-bold text-amber-400">{tiles.length} 個 A4 切片</span>
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center space-x-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setZoomScale((z) => Math.min(2.0, z + 0.15))}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="放大預覽"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={() => setZoomScale((z) => Math.max(0.5, z - 0.15))}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="縮小預覽"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={() => setZoomScale(1)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="重置縮放"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* 互動畫布容器 */}
      <div
        ref={containerRef}
        className="flex items-center justify-center w-full h-full min-h-[500px] overflow-auto p-6"
      >
        <div
          style={{ transform: `scale(${zoomScale})`, transformOrigin: 'center center' }}
          className="transition-transform duration-200 ease-out shadow-2xl rounded-lg overflow-hidden border border-slate-800 bg-slate-900"
        >
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredTile(null)}
            className="cursor-crosshair max-w-full max-h-[70vh] object-contain block"
          />
        </div>
      </div>

      {/* Hover Status Bar */}
      {hoveredTile && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center space-x-3 bg-sky-950/90 text-sky-200 border border-sky-500/30 backdrop-blur-md px-4 py-2 rounded-xl text-xs shadow-xl animate-fade-in">
          <span className="font-bold text-white bg-sky-600 px-2 py-0.5 rounded">
            P{hoveredTile.id}
          </span>
          <span>{hoveredTile.label}</span>
          <span className="text-slate-400 font-mono">
            {hoveredTile.sourceW} x {hoveredTile.sourceH} px
          </span>
        </div>
      )}
    </div>
  );
};
