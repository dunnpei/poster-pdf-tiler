'use client';

import React from 'react';
import { Loader2, CheckCircle2, FileDown } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  current: number;
  total: number;
  message: string;
  isComplete: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  current,
  total,
  message,
  isComplete,
  onClose,
}) => {
  if (!isOpen) return null;

  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-2xl space-y-5 animate-scale-in">
        <div className="flex items-center space-x-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            isComplete ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
          }`}>
            {isComplete ? (
              <CheckCircle2 className="h-6 w-6" />
            ) : (
              <Loader2 className="h-6 w-6 animate-spin" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold">
              {isComplete ? '匯出完成！' : '正在處理海報分割與匯出'}
            </h3>
            <p className="text-xs text-slate-400">{message}</p>
          </div>
        </div>

        {/* 進度條 */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">進度 ({current} / {total})</span>
            <span className="font-bold text-sky-400">{percentage}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              style={{ width: `${percentage}%` }}
              className="h-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all duration-300 rounded-full"
            />
          </div>
        </div>

        {isComplete && (
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-sky-500 py-3 text-sm font-bold text-white hover:bg-sky-400 transition"
          >
            確定完成
          </button>
        )}
      </div>
    </div>
  );
};
