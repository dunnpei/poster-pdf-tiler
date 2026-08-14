'use client';

import React from 'react';
import {
  Grid,
  Maximize2,
  Sliders,
  Scissors,
  FileDown,
  Archive,
  BookOpen,
  LayoutGrid,
  Check,
} from 'lucide-react';
import { TileConfig, PresetMode, PaperOrientation, SourceMedia } from '@/types/tiler';
import { getPosterDimensionsString } from '@/lib/tiler-math';

interface ControlPanelProps {
  config: TileConfig;
  onChange: (newConfig: TileConfig) => void;
  media: SourceMedia | null;
  onPageChange?: (pageNum: number) => void;
  onExportPdf: () => void;
  onExportZip: () => void;
  isExporting: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  config,
  onChange,
  media,
  onPageChange,
  onExportPdf,
  onExportZip,
  isExporting,
}) => {
  const dimensions = getPosterDimensionsString(config);

  const handlePresetSelect = (preset: PresetMode) => {
    if (preset === '1to2') {
      onChange({
        ...config,
        preset: '1to2',
        rows: 2,
        cols: 1,
        paperOrientation: 'landscape',
      });
    } else if (preset === '1to4') {
      onChange({
        ...config,
        preset: '1to4',
        rows: 2,
        cols: 2,
        paperOrientation: 'portrait',
      });
    } else {
      onChange({
        ...config,
        preset: 'custom',
      });
    }
  };

  const handleOrientationChange = (orientation: PaperOrientation) => {
    onChange({
      ...config,
      paperOrientation: orientation,
    });
  };

  return (
    <div className="flex flex-col space-y-6 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 text-slate-100 backdrop-blur-xl shadow-2xl">
      {/* 頂部標題 */}
      <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
          <Sliders className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold">分割與拼貼設定</h2>
          <p className="text-xs text-slate-400">客製化您的海報分割邏輯與列印邊距</p>
        </div>
      </div>

      {/* PDF 多頁頁碼選擇器 */}
      {media && media.type === 'pdf' && (media.numPages || 1) > 1 && (
        <div className="space-y-2 rounded-xl bg-slate-800/60 p-3.5 border border-slate-700/50">
          <label className="flex items-center text-xs font-semibold text-sky-400">
            <BookOpen className="mr-1.5 h-4 w-4" /> PDF 選擇頁碼 (共 {media.numPages} 頁)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min={1}
              max={media.numPages}
              value={config.selectedPage}
              onChange={(e) => {
                const pageNum = parseInt(e.target.value, 10);
                onChange({ ...config, selectedPage: pageNum });
                if (onPageChange) onPageChange(pageNum);
              }}
              className="h-2 flex-1 cursor-pointer accent-sky-500 bg-slate-700 rounded-lg"
            />
            <span className="min-w-[50px] text-center font-mono text-sm font-bold text-white bg-slate-900 px-2.5 py-1 rounded-md border border-slate-700">
              {config.selectedPage} / {media.numPages}
            </span>
          </div>
        </div>
      )}

      {/* 預設分割模式按鈕 */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          分割模式 (Tiling Mode)
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handlePresetSelect('1to2')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
              config.preset === '1to2'
                ? 'border-sky-500 bg-sky-500/15 text-sky-300 shadow-md shadow-sky-500/10'
                : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
            }`}
          >
            <span className="font-bold text-sm">1 A4 → 2 橫 A4</span>
            <span className="text-[10px] opacity-70 mt-0.5">A3 拼貼 (2x1)</span>
          </button>

          <button
            onClick={() => handlePresetSelect('1to4')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
              config.preset === '1to4'
                ? 'border-sky-500 bg-sky-500/15 text-sky-300 shadow-md shadow-sky-500/10'
                : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
            }`}
          >
            <span className="font-bold text-sm">1 A4 → 4 直 A4</span>
            <span className="text-[10px] opacity-70 mt-0.5">A2 拼貼 (2x2)</span>
          </button>

          <button
            onClick={() => handlePresetSelect('custom')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
              config.preset === 'custom'
                ? 'border-sky-500 bg-sky-500/15 text-sky-300 shadow-md shadow-sky-500/10'
                : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
            }`}
          >
            <span className="font-bold text-sm">自訂網格</span>
            <span className="text-[10px] opacity-70 mt-0.5">自訂行列數</span>
          </button>
        </div>
      </div>

      {/* 自訂網格設定 (當 preset === 'custom') */}
      {config.preset === 'custom' && (
        <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-800/40 p-4 border border-slate-800">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 flex items-center">
              <Grid className="mr-1 h-3.5 w-3.5 text-sky-400" /> 直向分割數量 (Rows)
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={config.rows}
              onChange={(e) =>
                onChange({
                  ...config,
                  rows: Math.max(1, Math.min(10, parseInt(e.target.value, 10) || 1)),
                })
              }
              className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm text-white border border-slate-700 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 flex items-center">
              <LayoutGrid className="mr-1 h-3.5 w-3.5 text-sky-400" /> 橫向分割數量 (Cols)
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={config.cols}
              onChange={(e) =>
                onChange({
                  ...config,
                  cols: Math.max(1, Math.min(10, parseInt(e.target.value, 10) || 1)),
                })
              }
              className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm text-white border border-slate-700 focus:border-sky-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* 紙張方向選擇 */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          單頁紙張方向 (Paper Orientation)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleOrientationChange('portrait')}
            className={`flex items-center justify-center space-x-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
              config.paperOrientation === 'portrait'
                ? 'border-sky-500 bg-sky-500/10 text-sky-300'
                : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <div className="h-5 w-3.5 rounded-sm border-2 border-current" />
            <span>直式 A4 (210 x 297 mm)</span>
          </button>

          <button
            onClick={() => handleOrientationChange('landscape')}
            className={`flex items-center justify-center space-x-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
              config.paperOrientation === 'landscape'
                ? 'border-sky-500 bg-sky-500/10 text-sky-300'
                : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <div className="h-3.5 w-5 rounded-sm border-2 border-current" />
            <span>橫式 A4 (297 x 210 mm)</span>
          </button>
        </div>
      </div>

      {/* 重疊黏貼邊距 (Overlap Margin) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-slate-300 flex items-center">
            <Maximize2 className="mr-1.5 h-3.5 w-3.5 text-sky-400" /> 重疊黏貼邊距 (Overlap Margin)
          </label>
          <span className="font-mono text-sky-400 font-bold bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
            {config.overlapMm} mm
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={15}
          step={1}
          value={config.overlapMm}
          onChange={(e) =>
            onChange({
              ...config,
              overlapMm: parseInt(e.target.value, 10),
            })
          }
          className="h-2 w-full cursor-pointer accent-sky-500 bg-slate-800 rounded-lg"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>0mm (無重疊)</span>
          <span>5mm (預設)</span>
          <span>15mm (寬邊緣)</span>
        </div>
      </div>

      {/* 裁切對齊輔助虛線 (Cut Marks) 開關 */}
      <label className="flex items-center justify-between cursor-pointer rounded-xl bg-slate-800/40 p-3.5 border border-slate-800 hover:bg-slate-800/80 transition-all">
        <div className="flex items-center space-x-2.5">
          <Scissors className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-semibold text-slate-200">繪製裁切對齊線 (Cut Marks)</span>
        </div>
        <input
          type="checkbox"
          checked={config.showCutMarks}
          onChange={(e) => onChange({ ...config, showCutMarks: e.target.checked })}
          className="h-4 w-4 rounded accent-sky-500 cursor-pointer"
        />
      </label>

      {/* 預估拼貼海報總尺寸 */}
      <div className="rounded-xl border border-sky-500/20 bg-gradient-to-r from-sky-950/30 to-blue-950/20 p-4">
        <div className="text-[11px] uppercase tracking-wider text-sky-400 font-semibold mb-1">
          海報成品預估總尺寸
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold font-mono text-white">{dimensions.cm}</span>
          <span className="text-xs text-slate-400">({dimensions.mm})</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">
          包含 {config.rows * config.cols} 張 A4 紙張與 {config.overlapMm}mm 重疊邊界
        </p>
      </div>

      {/* 導出按鈕 */}
      <div className="pt-2 space-y-2.5">
        <button
          disabled={!media || isExporting}
          onClick={onExportPdf}
          className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/25 hover:from-sky-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          <FileDown className="h-5 w-5" />
          <span>下載多頁 A4 PDF 列印檔</span>
        </button>

        <button
          disabled={!media || isExporting}
          onClick={onExportZip}
          className="flex w-full items-center justify-center space-x-2 rounded-xl border border-slate-700 bg-slate-800/80 py-3 text-xs font-semibold text-slate-300 hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Archive className="h-4 w-4 text-emerald-400" />
          <span>打包下載全切片圖片 (ZIP)</span>
        </button>
      </div>
    </div>
  );
};
