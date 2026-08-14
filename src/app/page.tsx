'use client';

import React, { useState } from 'react';
import { SourceMedia, TileConfig } from '@/types/tiler';
import { FileUploader } from '@/components/FileUploader';
import { ControlPanel } from '@/components/ControlPanel';
import { InteractiveCanvas } from '@/components/InteractiveCanvas';
import { ExportModal } from '@/components/ExportModal';
import { exportToPdf, exportToZip } from '@/lib/export-engine';
import { renderPdfPage } from '@/lib/pdf-renderer';
import { Printer, ShieldCheck, Cpu, Sparkles, RefreshCw } from 'lucide-react';

export default function Home() {
  const [media, setMedia] = useState<SourceMedia | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Default tile config
  const [config, setConfig] = useState<TileConfig>({
    preset: '1to4',
    rows: 2,
    cols: 2,
    paperOrientation: 'portrait',
    overlapMm: 5,
    showCutMarks: true,
    selectedPage: 1,
  });

  // Export progress modal state
  const [exportState, setExportState] = useState<{
    isOpen: boolean;
    current: number;
    total: number;
    message: string;
    isComplete: boolean;
  }>({
    isOpen: false,
    current: 0,
    total: 0,
    message: '',
    isComplete: false,
  });

  // Handle PDF page switching
  const handlePdfPageChange = async (pageNum: number) => {
    if (!media || media.type !== 'pdf' || !media.pdfDoc) return;
    setIsLoading(true);
    try {
      const pdfBuffer = await media.pdfDoc.getData();
      const result = await renderPdfPage(pdfBuffer.buffer, pageNum, 3.0);
      setMedia({
        ...media,
        width: result.width,
        height: result.height,
        aspectRatio: result.width / result.height,
        imageElement: result.canvas,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Export PDF trigger
  const handleExportPdf = async () => {
    if (!media) return;
    setExportState({
      isOpen: true,
      current: 0,
      total: 1,
      message: '初始化 PDF 產生器...',
      isComplete: false,
    });

    try {
      await exportToPdf(media, config, (current, total, message) => {
        setExportState({
          isOpen: true,
          current,
          total,
          message,
          isComplete: current === total,
        });
      });
    } catch (e) {
      console.error(e);
      setExportState({
        isOpen: true,
        current: 0,
        total: 1,
        message: '匯出失敗，請稍後再試。',
        isComplete: false,
      });
    }
  };

  // Export ZIP trigger
  const handleExportZip = async () => {
    if (!media) return;
    setExportState({
      isOpen: true,
      current: 0,
      total: 1,
      message: '初始化圖片切片打包...',
      isComplete: false,
    });

    try {
      await exportToZip(media, config, (current, total, message) => {
        setExportState({
          isOpen: true,
          current,
          total,
          message,
          isComplete: current === total,
        });
      });
    } catch (e) {
      console.error(e);
      setExportState({
        isOpen: true,
        current: 0,
        total: 1,
        message: '打包 ZIP 失敗，請稍後再試。',
        isComplete: false,
      });
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* 頂部 Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20">
              <Printer className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                海報與大圖分割列印工具
                <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold text-sky-400 border border-sky-500/20">
                  Poster & PDF Tiler
                </span>
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                家用/辦公室印表機大圖拼貼利器 · 100% 純前端安全運算
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs text-slate-400">
            <span className="hidden md:flex items-center text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <ShieldCheck className="mr-1.5 h-4 w-4" /> 檔案不傳輸 · 隱私保密
            </span>
            <span className="hidden md:flex items-center text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
              <Cpu className="mr-1.5 h-4 w-4" /> 瀏覽器高畫質渲染
            </span>
          </div>
        </div>
      </header>

      {/* 主要內容區域 */}
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* 上傳區域 (當尚未載入媒體時全幅顯示，載入後頂部縮小顯示) */}
        {!media ? (
          <div className="mx-auto max-w-3xl py-8">
            <FileUploader
              onMediaLoaded={(m) => setMedia(m)}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
            <div className="flex items-center space-x-3">
              <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-sm font-semibold text-slate-200">
                已載入：{media.fileName}
              </span>
              <span className="text-xs font-mono text-slate-400">
                ({media.width} x {media.height} px)
              </span>
            </div>

            <button
              onClick={() => setMedia(null)}
              className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>更換檔案</span>
            </button>
          </div>
        )}

        {/* 核心工作區：左側設定面版，右側互動畫布 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 左側控制面板 (佔 4 欄) */}
          <div className="lg:col-span-4">
            <ControlPanel
              config={config}
              onChange={(newCfg) => setConfig(newCfg)}
              media={media}
              onPageChange={handlePdfPageChange}
              onExportPdf={handleExportPdf}
              onExportZip={handleExportZip}
              isExporting={exportState.isOpen && !exportState.isComplete}
            />
          </div>

          {/* 右側即時互動畫布 (佔 8 欄) */}
          <div className="lg:col-span-8 min-h-[600px] flex">
            <InteractiveCanvas media={media} config={config} />
          </div>
        </div>
      </div>

      {/* 頁腳 */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <p>Poster & PDF Tiler © 2026 — 支援 GitHub 與 Vercel 一鍵託管部署</p>
      </footer>

      {/* 匯出進度 Modal */}
      <ExportModal
        isOpen={exportState.isOpen}
        current={exportState.current}
        total={exportState.total}
        message={exportState.message}
        isComplete={exportState.isComplete}
        onClose={() => setExportState({ ...exportState, isOpen: false })}
      />
    </main>
  );
}
